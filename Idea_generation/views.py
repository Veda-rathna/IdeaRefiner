from django.shortcuts import render
from django.contrib import messages
from keybert import KeyBERT
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Initialize once
kw_model = KeyBERT()
model = None
tokenizer = None

def load_model():
    global model, tokenizer
    if model and tokenizer:
        return model, tokenizer

    try:
        model_name = "unsloth/Llama-3.2-1B-Instruct"  # Make sure it exists or fallback to distilgpt2
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto"
        )
        return model, tokenizer

    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None


def generate_idea_from_news(request):
    context = {}
    
    if request.method == 'POST':
        news_text = request.POST.get('news_text', '').strip()
        # ...existing code...
    return render(request, 'idea_form.html', context)


# Serve the React/Vite frontend from the 'project' folder
from django.http import HttpResponse
import os


def project_page(request):
    # Serve the built frontend (after npm run build) from project/dist/index.html
    dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'project', 'dist', 'index.html')
    try:
        with open(dist_path, encoding='utf-8') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("Built index.html not found. Please run 'npm run build' in the project directory.", status=404)

    if request.method == 'POST':
        news_text = request.POST.get('news_text', '').strip()

        if not news_text:
            messages.error(request, "Please enter a news article.")
            return render(request, 'idea_form.html', context)

        try:
            # Step 1: Extract keywords
            keywords = kw_model.extract_keywords(news_text, top_n=5)
            keyword_list = [kw[0] for kw in keywords]

            # Step 2: Create detailed prompt
            prompt = (
                f"Given the recent news article, generate a detailed innovative startup idea.\n"
                f"Keywords: {', '.join(keyword_list)}\n"
                f"Write a clear and descriptive idea including:\n"
                f"- The business concept\n"
                f"- The problem it solves\n"
                f"- The target users or market\n"
                f"- The innovative technology or approach\n"
                f"Respond with a well-formed paragraph.\n"
            )

            # Step 3: Load model
            model, tokenizer = load_model()

            if not model or not tokenizer:
                messages.error(request, "Model could not be loaded.")
                return render(request, 'idea_form.html', context)

            # Step 4: Tokenize and generate
            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
            output_tokens = model.generate(
                **inputs,
                max_new_tokens=1024,
                temperature=0.9,
                top_k=50,
                top_p=0.95,
                pad_token_id=tokenizer.eos_token_id
            )
            generated_text = tokenizer.decode(output_tokens[0], skip_special_tokens=True)
            idea = generated_text[len(prompt):].strip()

            context.update({
                'idea': idea,
                'keywords': keyword_list,
                'news_text': news_text
            })
            messages.success(request, "Generated idea successfully!")

        except Exception as e:
            print(f"Error: {e}")
            messages.error(request, "An error occurred during generation.")

    return render(request, 'idea_form.html', context)
