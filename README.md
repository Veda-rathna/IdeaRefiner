# Idea Refiner Project Documentation

## Project Overview
IdeaRefiner is a Django-based web application that scrapes tech news and helps generate innovative ideas by combining different technologies.

## File Structure

### Core Files
- `manage.py` - Django's command-line utility for administrative tasks
- `requirements.txt` - Lists all Python dependencies for the project
- `.env` - Environment variables (API keys, settings)

### Idea_generation App
#### Core App Files
- `views.py` - Contains view functions that handle web requests and responses
- `urls.py` - URL routing configuration for the application
- `models.py` - Database models definition
- `apps.py` - App configuration including background task setup

#### Services
- `services/news_scraper.py` - Handles news scraping functionality:
  - RSS feed parsing
  - Article content extraction
  - Database storage
  - Background task scheduling

#### Templates
- `templates/base.html` - Base template with common layout elements
- `templates/home.html` - Homepage template
- `templates/news_scraping.html` - News display template
- `templates/news_detail.html` - Individual article view template
- `templates/idea_generation.html` - Idea generation interface
- `templates/start_project.html` - Project initialization template

### Key Dependencies
- Django (5.2.4) - Web framework
- django-background-tasks (1.2.8) - For scheduled news scraping
- google-generativeai (0.8.5) - For AI-powered content analysis
- beautifulsoup4 (4.13.4) - HTML parsing
- feedparser (6.0.11) - RSS feed parsing
- torch (2.7.1) - For AI model operations
- transformers (4.54.0) - For text processing

## Features
1. **Tech News Aggregation**
   - Automated news scraping from multiple sources
   - Background task scheduling
   - Content summarization

2. **Idea Generation**
   - AI-powered idea generation
   - Technology combination suggestions
   - Project scaffolding

## Setup
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```env
GOOGLE_API_KEY=your_api_key_here
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

5. Start the background task processor:
```bash
python manage.py process_tasks
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License
This project is licensed under the MIT License.