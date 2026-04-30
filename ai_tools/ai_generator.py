import json
import logging
import re

from g4f.client import Client

logger = logging.getLogger(__name__)
_client = Client()

_SYSTEM_PROMPT = """You are a mock API data generator.

Rules:
- Return ONLY valid JSON. No markdown, no explanation, no code blocks.
- If the request describes ONE resource type (e.g. "users", "products"), return a JSON ARRAY.
- If the request describes MULTIPLE endpoints or resource types (e.g. "users and books", "products and categories"), return a JSON OBJECT where each key is the endpoint name in lowercase_snake_case and each value is a JSON ARRAY.
- All items in each array must share the same fields with realistic, varied values.
- Never use placeholder text like "string", "value1", or "example.com".
- IDs must be sequential integers starting from 1 for each resource.
- Dates must be realistic ISO 8601 strings. URLs must look real (e.g. https://i.pravatar.cc/150?img=3).
"""


def _build_user_prompt(prompt: str, count: int) -> str:
    return (
        f"User request: {prompt}\n"
        f"Generate exactly {count} items per resource/endpoint.\n"
        "Return JSON only. No other text."
    )


def _extract_json(text: str):
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try object first (multi-endpoint), then array
    match = re.search(r"(\{[\s\S]*\})", text)
    if match:
        try:
            result = json.loads(match.group(1))
            if isinstance(result, dict) and any(isinstance(v, list) for v in result.values()):
                return result
        except json.JSONDecodeError:
            pass

    match = re.search(r"(\[[\s\S]*\])", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    return None


def _pad_or_trim(lst: list, count: int) -> list:
    if not lst:
        return lst
    if len(lst) > count:
        return lst[:count]
    template = lst[-1].copy()
    for i in range(len(lst), count):
        item = template.copy()
        if "id" in item:
            item["id"] = i + 1
        lst.append(item)
    return lst


def _normalize(data, count: int):
    if isinstance(data, list):
        return _pad_or_trim(data, count)

    if isinstance(data, dict):
        result = {}
        for key, val in data.items():
            clean_key = key.lower().replace(" ", "_")
            if isinstance(val, list):
                result[clean_key] = _pad_or_trim(val, count)
            elif isinstance(val, dict):
                result[clean_key] = [val]
        return result if result else None

    return None


def generate_mock_data(prompt: str, count: int, retries: int = 2):
    """
    Returns (data, error).
    data is a list for single-endpoint, dict for multi-endpoint.
    """
    user_prompt = _build_user_prompt(prompt, count)

    for attempt in range(retries):
        try:
            response = _client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            )
            raw = response.choices[0].message.content
            data = _extract_json(raw)

            if data is None:
                logger.warning("AI returned non-JSON (attempt %d): %s", attempt + 1, raw[:200])
                continue

            data = _normalize(data, count)
            if data is None:
                logger.warning("Could not normalize AI response (attempt %d)", attempt + 1)
                continue

            return data, None

        except Exception as e:
            logger.error("AI generation error (attempt %d): %s", attempt + 1, e)

    return [], "AI failed to generate valid data. Please try again or simplify your prompt."
