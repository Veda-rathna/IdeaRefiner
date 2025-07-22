def home(request):
    return render(request, 'home.html')
from django.shortcuts import render, redirect
from django.http import HttpResponse

def news_scraping(request):
    return render(request, 'news_scraping.html')

def idea_generation(request):
    idea = None
    if request.method == 'POST':
        idea = request.POST.get('idea')
    return render(request, 'idea_generation.html', {'idea': idea})

def start_project(request):
    project_name = None
    if request.method == 'POST':
        project_name = request.POST.get('project_name')
    return render(request, 'start_project.html', {'project_name': project_name})