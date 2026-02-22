import os
import time
import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS  # only import DDGS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def search_duckduckgo(query, max_results=5, retries=3):
    """Return a list of URLs, with retry logic on rate limit."""
    urls = []
    for attempt in range(retries):
        try:
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=max_results):
                    urls.append(r['href'])
            break  # success
        except Exception as e:
            error_str = str(e)
            if "Ratelimit" in error_str and attempt < retries - 1:
                wait = 2 ** (attempt + 1)  # exponential backoff: 2, 4, 8 seconds
                print(f"Rate limited. Retrying in {wait} seconds...")
                time.sleep(wait)
            else:
                print(f"DuckDuckGo search failed: {e}")
                return []
    return urls

def scrape_text(url, char_limit=5000):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()
        text = soup.get_text(separator=' ', strip=True)
        return text[:char_limit]
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""

def get_depth_params(level):
    level = level.lower()
    if level == 'less':
        return 3, 5000, (
            "Provide a brief, high-level overview suitable for a beginner. "
            "Include only the most essential facts. Use simple language."
        )
    elif level == 'medium':
        return 10, 10000, (
            "Give a balanced summary with moderate detail. Cover the key points, "
            "main concepts, and important details. Assume the reader has basic familiarity."
        )
    elif level == 'high':
        return 15, 20000, (
            "Provide a comprehensive and in-depth explanation. Include all significant aspects, "
            "technical details, historical context, applications, and any nuances. "
            "Assume the reader wants a thorough understanding."
        )
    else:
        return 10, 10000, "Provide a clear, informative summary."

def summarize_with_gemini(text, topic, depth_instruction):
    prompt = f"""
You are an expert summarizer. Create a summary about "{topic}" based on the web content below.

Depth requirement: {depth_instruction}

Format the summary in **Markdown**. Use headings, bullet points, or bold text where appropriate to make it easy to read.

Web content:
{text}
"""
    response = model.generate_content(prompt)
    return response.text

def main():
    print("=== Agentic Web Scraper + Summarizer ===")
    topic = input("Enter a topic: ").strip()
    if not topic:
        print("No topic provided.")
        return

    depth = input("Choose depth (less/medium/high): ").strip().lower()
    if depth not in ['less', 'medium', 'high']:
        print("Invalid depth. Defaulting to 'medium'.")
        depth = 'medium'

    num_results, char_limit, instruction = get_depth_params(depth)

    print(f"\n🔍 Searching DuckDuckGo for '{topic}' (depth: {depth})...")
    urls = search_duckduckgo(topic, max_results=num_results)
    if not urls:
        print("No search results found or search failed. Try again later.")
        return

    print(f"Found {len(urls)} pages. Scraping content (up to {char_limit} chars per page)...")
    all_text = ""
    for i, url in enumerate(urls, 1):
        print(f"  [{i}] {url}")
        page_text = scrape_text(url, char_limit=char_limit)
        if page_text:
            all_text += f"\n\n--- Content from {url} ---\n{page_text}"
        time.sleep(1)  # be polite

    if not all_text.strip():
        print("No readable content could be extracted.")
        return

    print("\n🧠 Sending to Gemini for summarization...")
    summary = summarize_with_gemini(all_text, topic, instruction)

    print("\n" + "="*60)
    print("📄 SUMMARY (Markdown format)".center(60))
    print("="*60)
    print(summary)

if __name__ == "__main__":
    main()