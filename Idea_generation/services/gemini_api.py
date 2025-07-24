
import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

def extract_keywords_and_structure(text):
    """
    Send news content to Gemini API (google-genai SDK) and extract structured news and keywords.
    Returns: dict with 'structured_news' and 'keywords' (list)
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment variables.")

    client = genai.Client(api_key=api_key)
    prompt = f"Summarize this news article in a few sentences: {text}" 
    import logging
    import concurrent.futures
    logger = logging.getLogger(__name__)
    def call_gemini():
        return client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
    try:
        logger.info("Calling Gemini API for summarization...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(call_gemini)
            response = future.result(timeout=15)  # 15 seconds timeout
        logger.info("Gemini API call completed.")
        summary = response.text.strip() if response.text else text
        return {"summary": summary}
    except concurrent.futures.TimeoutError:
        logger.warning("Gemini API call timed out.")
        return {"summary": text}
    except Exception as e:
        logger.warning(f"Gemini API error: {e}")
        return {"summary": text}
