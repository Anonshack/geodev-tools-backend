import json
import logging
import re

from g4f.client import Client

logger = logging.getLogger(__name__)
_client = Client()

_SYSTEM_PROMPT = """You are a mock API data generator.
Rules:
- Return ONLY a valid JSON array. No markdown, no explanation, no code blocks.
- Every item in the array must have the same fields.
- Use realistic, varied values (not placeholder text like "string" or "value1").
- IDs must be sequential integers starting from 1.
- Generate exactly the number of items requested.
"""


def _build_user_prompt(prompt: str, count: int) -> str:
    return (
        f"Generate exactly {count} items.\n"
        f"User request: {prompt}\n"
        f"Return a JSON array with exactly {count} objects. No other text."
    )


def _extract_json(text: str):
    """Robustly extract a JSON array or object from AI response text."""
    text = text.strip()

    # Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fence: ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Find first JSON array in text
    match = re.search(r"(\[[\s\S]*\])", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Find first JSON object in text
    match = re.search(r"(\{[\s\S]*\})", text)
    if match:
        try:
            result = json.loads(match.group(1))
            return [result]
        except json.JSONDecodeError:
            pass

    return None


def generate_mock_data(prompt: str, count: int, retries: int = 2):
    """
    Call g4f to generate mock JSON data.
    Returns (data: list, error: str | None).
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

            if not isinstance(data, list):
                data = [data]

            # Trim or pad to exact count
            if len(data) > count:
                data = data[:count]
            elif len(data) < count and data:
                template = data[-1].copy()
                for i in range(len(data), count):
                    item = template.copy()
                    if "id" in item:
                        item["id"] = i + 1
                    data.append(item)

            return data, None

        except Exception as e:
            logger.error("AI generation error (attempt %d): %s", attempt + 1, e)

    return [], "AI failed to generate valid data. Please try again or simplify your prompt."
