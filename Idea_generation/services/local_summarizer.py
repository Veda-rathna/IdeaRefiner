from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

def summarize_text(text, sentences_count=3):
    """
    Summarize the input text using sumy's LSA algorithm.
    sentences_count: Number of sentences in the summary (default 3)
    """
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, sentences_count)
        return " ".join(str(sentence) for sentence in summary)
    except Exception:
        # Fallback: return first 400 characters if text is too short or error occurs
        return text[:400]
