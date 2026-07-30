import requests

url = "https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS"

headers = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    )
}

r = requests.get(url, headers=headers)

print("Status:", r.status_code)
print(r.text[:500])