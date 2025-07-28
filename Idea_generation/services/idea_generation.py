import google.generativeai as genai
import os
from typing import List, Dict, Any
from .news_scraper import NewsArticles

class IdeaGenerationService:
    def __init__(self, max_context_length: int = 5):
        # Configure Gemini API
        API_KEY = os.getenv('GOOGLE_API_KEY')
        if not API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is not set")
        
        genai.configure(api_key=API_KEY)
        
        # Initialize model and configuration
        self.model = genai.GenerativeModel('gemini-pro')
        self.max_context_length = max_context_length
        self.conversation_history = []
        self.chat = self.model.start_chat(history=[])

    def start_idea_conversation(self, news_id: int) -> str:
        """Start conversation using news prompt from database"""
        try:
            article = NewsArticles.objects.get(id=news_id)
            
            # Format system prompt
            system_prompt = """You are an AI ideation assistant. Your task is to:
            1. Generate innovative ideas based on provided prompts
            2. Answer questions about the generated ideas
            3. Help refine and expand on concepts
            4. Provide practical implementation suggestions
            
            Keep responses focused, practical, and constructive."""
            
            # Initialize chat with system prompt
            self.chat = self.model.start_chat(history=[])
            self.conversation_history = []
            
            # Add system prompt
            self.conversation_history.append({
                "role": "assistant",
                "content": system_prompt
            })
            
            # Generate initial idea
            response = self.generate_with_context(article.news_prompt)
            return response
            
        except NewsArticles.DoesNotExist:
            return "Article not found"
        except Exception as e:
            return f"Error generating idea: {str(e)}"

    def generate_with_context(self, prompt: str) -> str:
        """Generate response while maintaining conversation context"""
        try:
            # Add user prompt to history
            self.conversation_history.append({
                "role": "user",
                "content": prompt
            })

            # Maintain context window
            if len(self.conversation_history) > self.max_context_length * 2:
                self.conversation_history = self.conversation_history[-self.max_context_length * 2:]

            # Generate response using chat
            response = self.chat.send_message(prompt)
            
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            # Add response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": response.text
            })

            return response.text

        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            # Add error to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "content": error_msg
            })
            return error_msg

    def continue_conversation(self, user_input: str) -> str:
        """Continue existing conversation"""
        if not user_input.strip():
            return "Please provide a valid input"
            
        try:
            return self.generate_with_context(user_input)
        except Exception as e:
            return f"Error continuing conversation: {str(e)}"

    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get the current conversation history"""
        return self.conversation_history