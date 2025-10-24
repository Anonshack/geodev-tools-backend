import requests

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_geo_info(ip):
    if ip in ["127.0.0.1", "localhost"]:
        return {
            "ip": ip,
            "country": "Uzbekistan",
            "city": "Tashkent",
            "region": "Tashkent Region",
            "latitude": 41.3111,
            "longitude": 69.2797,
        }

    try:
        response = requests.get(f"https://ipapi.co/{ip}/json/")
        if response.status_code == 200:
            data = response.json()
            return {
                "ip": ip,
                "country": data.get("country_name"),
                "city": data.get("city"),
                "region": data.get("region"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
            }
    except Exception:
        pass
    return None
