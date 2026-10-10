import json
import re
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel
from google import genai
from app.core.config import settings
from app.core.logging import logger

T = TypeVar("T", bound=BaseModel)

class BaseAIAgent:
    """
    Base Agent providing centralized integration with Google Gemini LLM,
    structured JSON parsing, Pydantic model validation, and resilient fallback handling.
    """

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self._client: Optional[genai.Client] = None

    def get_client(self) -> Optional[genai.Client]:
        if not settings.is_ai_configured:
            return None
        if self._client is None:
            try:
                self._client = genai.Client(
                    api_key=settings.GEMINI_API_KEY,
                    http_options={'timeout': 15000} # 15s network timeout
                )
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI Client: {e}")
                return None
        return self._client

    def clean_json_response(self, raw_text: str) -> str:
        """Strip markdown code block fences and isolate valid JSON."""
        text = raw_text.strip()
        # Remove ```json ... ``` or ``` ... ```
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip().startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        
        # In case extra text surrounds JSON, find outermost { ... } or [ ... ]
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            return text[first_brace:last_brace + 1]

        first_bracket = text.find("[")
        last_bracket = text.rfind("]")
        if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
            return text[first_bracket:last_bracket + 1]

        return text

    def call_gemini(self, prompt: str, system_instruction: str) -> Optional[str]:
        """Invoke Gemini LLM with system instruction and timeout handling."""
        client = self.get_client()
        if not client:
            return None

        try:
            full_prompt = f"{system_instruction}\n\nUser Request:\n{prompt}"
            response = client.models.generate_content(
                model=settings.AI_MODEL,
                contents=full_prompt,
            )
            return response.text
        except Exception as exc:
            logger.error(f"Gemini LLM invocation error in {self.name}: {exc}")
            return None

    def execute_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_model: Type[T],
        fallback_data: dict[str, Any],
        force_demo: bool = False
    ) -> tuple[T, bool]:
        """
        Executes structured generation.
        Returns (result: T, used_live_llm: bool)
        """
        if force_demo or not settings.is_ai_configured:
            logger.info(f"{self.name}: Using high-fidelity demo fixture (force_demo={force_demo}, ai_configured={settings.is_ai_configured})")
            return response_model.model_validate(fallback_data), False

        raw_response = self.call_gemini(prompt, system_instruction)
        if not raw_response:
            logger.warning(f"{self.name}: Live LLM call returned empty/failed. Utilizing calibrated domain fixture.")
            return response_model.model_validate(fallback_data), False

        try:
            cleaned = self.clean_json_response(raw_response)
            parsed_json = json.loads(cleaned)
            validated = response_model.model_validate(parsed_json)
            logger.info(f"{self.name}: Successfully generated structured response from Gemini LLM.")
            return validated, True
        except Exception as parse_err:
            logger.warning(f"{self.name}: JSON parsing or validation failed on LLM output: {parse_err}. Reverting to fixture.")
            return response_model.model_validate(fallback_data), False
