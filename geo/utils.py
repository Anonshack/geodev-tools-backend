import requests
from django.core.cache import cache

_LOCAL_IPS = {"127.0.0.1", "localhost", "::1"}
_GEO_CACHE_TIMEOUT = 3600  # 1 hour

_LOCAL_GEO = {
    "ip": "127.0.0.1",
    "country": "Uzbekistan",
    "city": "Tashkent",
    "region": "Tashkent Region",
    "latitude": 41.3111,
    "longitude": 69.2797,
}


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def get_geo_info(ip):
    if ip in _LOCAL_IPS:
        return {**_LOCAL_GEO, "ip": ip}

    cache_key = f"geo_info_{ip}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        response = requests.get(
            f"https://ipapi.co/{ip}/json/",
            timeout=5,
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("error"):
                return None
            result = {
                "ip": ip,
                "country": data.get("country_name"),
                "city": data.get("city"),
                "region": data.get("region"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
            }
            cache.set(cache_key, result, timeout=_GEO_CACHE_TIMEOUT)
            return result
    except requests.exceptions.RequestException:
        pass
    return None
