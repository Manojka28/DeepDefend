import os
import re
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()


class LLMFusion:
    """Fuses video and audio analysis results using LLM to generate human-readable report.
    Falls back to a rule-based report if GOOGLE_API_KEY is not set or Gemini fails.
    """

    def __init__(self):
        self.llm = None
        self._init_llm()

    def _init_llm(self):
        """Try to initialise Gemini. Silently skip if key is missing."""
        api_key = os.getenv("GOOGLE_API_KEY", "").strip()
        if not api_key or api_key == "your_gemini_api_key":
            print(
                "[DeepDefend] WARNING: GOOGLE_API_KEY not set. "
                "LLM fusion will use rule-based fallback report."
            )
            return

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                temperature=0,
                google_api_key=api_key,
            )
            print("[DeepDefend] Gemini LLM initialised successfully.")
        except Exception as e:
            print(f"[DeepDefend] WARNING: Could not initialise Gemini LLM: {e}")
            self.llm = None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def prepare_analysis_json(self, timeline: List[Dict]) -> Dict:
        analysis_data = {"total_intervals": len(timeline), "intervals": []}
        for interval in timeline:
            interval_summary = {
                "interval_id": interval["interval_id"],
                "time_range": interval["interval"],
                "video_analysis": interval.get("video_results", {}),
                "audio_analysis": interval.get("audio_results", {}),
            }
            analysis_data["intervals"].append(interval_summary)
        return analysis_data

    def calculate_overall_scores(self, timeline: List[Dict]) -> Dict:
        """Calculate average video and audio fake scores across all intervals."""
        video_scores, audio_scores = [], []

        for interval in timeline:
            vr = interval.get("video_results") or {}
            ar = interval.get("audio_results") or {}
            if "fake_score" in vr:
                video_scores.append(vr["fake_score"])
            if "fake_score" in ar:
                audio_scores.append(ar["fake_score"])

        overall_video = round(sum(video_scores) / len(video_scores), 3) if video_scores else 0.0
        overall_audio = round(sum(audio_scores) / len(audio_scores), 3) if audio_scores else 0.0

        if overall_video > 0 and overall_audio > 0:
            overall_combined = round((overall_video + overall_audio) / 2, 3)
        elif overall_video > 0:
            overall_combined = overall_video
        elif overall_audio > 0:
            overall_combined = overall_audio
        else:
            overall_combined = 0.0

        return {
            "overall_video_score": overall_video,
            "overall_audio_score": overall_audio,
            "overall_combined_score": overall_combined,
        }

    # ------------------------------------------------------------------
    # Report generation
    # ------------------------------------------------------------------

    def generate_report(self, timeline: List[Dict], video_info: Dict) -> Dict:
        analysis_json = self.prepare_analysis_json(timeline)
        overall_scores = self.calculate_overall_scores(timeline)

        if self.llm is not None:
            llm_response = self._call_llm(analysis_json, overall_scores, video_info)
        else:
            llm_response = self._fallback_report(overall_scores, analysis_json, video_info)

        return self._structure_report(llm_response, overall_scores, analysis_json)

    def _call_llm(self, analysis_json: Dict, overall_scores: Dict, video_info: Dict) -> str:
        """Call Gemini and return the text response. Falls back on any error."""
        from analysis.prompt import _create_analysis_prompt

        prompt = _create_analysis_prompt(analysis_json, overall_scores, video_info)
        try:
            response = self.llm.invoke(prompt)
            return response.content
        except Exception as e:
            print(f"[DeepDefend] LLM call failed: {e}. Using fallback report.")
            return self._fallback_report(overall_scores, analysis_json, video_info)

    def _fallback_report(
        self, overall_scores: Dict, analysis_json: Dict, video_info: Dict
    ) -> str:
        """Generate a structured plain-text report without any LLM."""
        combined = overall_scores["overall_combined_score"]
        video_s  = overall_scores["overall_video_score"]
        audio_s  = overall_scores["overall_audio_score"]

        verdict = "DEEPFAKE" if combined > 0.5 else "REAL"

        # Confidence: distance from 0.5 threshold, mapped to 50–99 %
        distance   = abs(combined - 0.5)
        confidence = min(round(50 + distance * 98), 99)

        if combined >= 0.8:
            risk = "CRITICAL – very high probability of AI-generated manipulation"
        elif combined >= 0.6:
            risk = "HIGH – significant manipulation indicators detected"
        elif combined >= 0.4:
            risk = "MEDIUM – some suspicious patterns, but below the deepfake threshold"
        else:
            risk = "LOW – content appears authentic"

        suspicious = [
            iv for iv in analysis_json["intervals"]
            if (iv.get("video_analysis", {}).get("fake_score", 0) > 0.6
                or iv.get("audio_analysis", {}).get("fake_score", 0) > 0.6)
        ]

        sus_text = (
            "No highly suspicious intervals detected."
            if not suspicious
            else "Suspicious intervals: "
            + ", ".join(iv["time_range"] + "s" for iv in suspicious)
        )

        report = (
            f"VERDICT: {verdict} | CONFIDENCE: {confidence}% | RISK: {risk}\n\n"
            f"OVERALL SCORES — Video: {round(video_s * 100)}%  "
            f"Audio: {round(audio_s * 100)}%  "
            f"Combined: {round(combined * 100)}%\n\n"
            f"{sus_text}\n\n"
            f"VIDEO: {round(video_info['duration'], 1)}s analysed across "
            f"{analysis_json['total_intervals']} intervals "
            f"({video_info['fps']:.1f} fps, {video_info['total_frames']} frames).\n\n"
            "EVIDENCE SUMMARY: The detection pipeline examined each interval "
            "for facial-region anomalies (eyes, mouth, face boundaries) and audio "
            "synthesis artefacts. "
        )

        if verdict == "DEEPFAKE":
            report += (
                f"The combined score of {round(combined * 100)}% exceeds the 50% "
                "manipulation threshold. This video shows strong indicators of "
                "AI-generated manipulation."
            )
        else:
            report += (
                f"The combined score of {round(combined * 100)}% remains below the "
                "50% manipulation threshold, indicating the content is likely authentic."
            )

        report += (
            "\n\n[NOTE: Add GOOGLE_API_KEY to your .env file to enable "
            "AI-generated narrative reports via Google Gemini.]"
        )

        return report

    # ------------------------------------------------------------------
    # Structure final report dict
    # ------------------------------------------------------------------

    def _structure_report(
        self, llm_response: str, overall_scores: Dict, analysis_json: Dict
    ) -> Dict:
        verdict  = "DEEPFAKE" if overall_scores["overall_combined_score"] > 0.5 else "REAL"
        combined = overall_scores["overall_combined_score"]

        # Default confidence from score distance
        default_confidence = min(round(50 + abs(combined - 0.5) * 98), 99)

        conf_match = re.search(r"(\d{1,3})\s*%", llm_response)
        if conf_match:
            parsed     = float(conf_match.group(1))
            confidence = parsed if 0 < parsed <= 100 else default_confidence
        else:
            confidence = default_confidence

        suspicious_intervals = []
        for interval_data in analysis_json["intervals"]:
            video_score = interval_data.get("video_analysis", {}).get("fake_score", 0)
            audio_score = interval_data.get("audio_analysis", {}).get("fake_score", 0)
            if video_score > 0.6 or audio_score > 0.6:
                suspicious_intervals.append(
                    {
                        "interval": interval_data["time_range"],
                        "video_score": video_score,
                        "audio_score": audio_score,
                        "video_regions": interval_data.get("video_analysis", {}).get(
                            "suspicious_regions", []
                        ),
                        "audio_regions": interval_data.get("audio_analysis", {}).get(
                            "suspicious_regions", []
                        ),
                    }
                )

        return {
            "verdict": verdict,
            "confidence": confidence,
            "overall_scores": overall_scores,
            "detailed_analysis": llm_response,
            "suspicious_intervals": suspicious_intervals,
            "total_intervals_analyzed": analysis_json["total_intervals"],
        }