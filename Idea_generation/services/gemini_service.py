import google.generativeai as genai
from typing import List, Dict, Any
import os

class GeminiContextManager:
    def __init__(self, model_name="gemini-pro", max_context_length=5):
        self.model = genai.GenerativeModel(model_name)
        self.max_context_length = max_context_length
        self.conversation_history = []

    def generate_with_context(self, prompt: str) -> str:
        try:
            # Add user prompt to history
            self.conversation_history.append({"role": "user", "content": prompt})
            
            # Maintain context window
            if len(self.conversation_history) > self.max_context_length * 2:
                self.conversation_history = self.conversation_history[-self.max_context_length * 2:]
            
            # Generate response
            response = self.model.generate_content(self.conversation_history)
            
            # Add response to history
            self.conversation_history.append({"role": "assistant", "content": response.text})
            
            return response.text
            
        except Exception as e:
            return f"Error generating response: {str(e)}"