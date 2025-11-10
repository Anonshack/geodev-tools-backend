from rest_framework.views import APIView
from rest_framework.response import Response
import random, string
import re

dynamic_apis = {}


def generate_random_slug(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def parse_prompt(prompt):
    match = re.search(r"(\w+) API kerak", prompt)
    model_name = match.group(1).lower() if match else "object"
    match_fields = re.search(r"fields?:\s*(.*?)(, count|$)", prompt)
    fields = [f.strip() for f in match_fields.group(1).split(",")] if match_fields else ["name"]
    match_count = re.search(r"count:\s*(\d+)", prompt)
    count = int(match_count.group(1)) if match_count else 10
    return model_name, fields, count


class DynamicAPI(APIView):
    def post(self, request):
        prompt = request.data.get("prompt", "")
        model_name, fields, count = parse_prompt(prompt)
        data = []
        for i in range(count):
            item = {f: f"{f} {i + 1}" for f in fields}
            data.append(item)

        slug = generate_random_slug()

        dynamic_apis[slug] = {"model_name": model_name, "fields": fields, "data": data}

        api_link = f"http://127.0.0.1:8000/api/{slug}/"
        return Response({"api_link": api_link, "message": f"{count} items for {model_name} created"})


class DynamicAPIData(APIView):
    def get(self, request, slug):
        api_data = dynamic_apis.get(slug)
        if not api_data:
            return Response({"error": "API not found"}, status=404)
        return Response(api_data["data"])
