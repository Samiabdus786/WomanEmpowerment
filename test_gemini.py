import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")

try:
    r = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}")
    print([m['name'] for m in r.json().get('models', []) if 'gemini' in m['name']])
except Exception as e:
    print(e)
