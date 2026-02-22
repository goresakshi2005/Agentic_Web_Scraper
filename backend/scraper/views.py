import os
from tavily import TavilyClient
import google.generativeai as genai
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SearchRecord
from .serializers import SearchSerializer, SearchResultSerializer
from dotenv import load_dotenv

load_dotenv()

# Initialize Clients
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
tavily = TavilyClient(api_key=TAVILY_API_KEY)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

def get_depth_params(level):
    """Map depth levels to Tavily and Gemini instructions."""
    level = level.lower()
    if level == 'less':
        return 3, "basic", "Brief, high-level overview. Essential facts only."
    elif level == 'medium':
        return 6, "advanced", "Balanced summary, moderate detail, key concepts."
    elif level == 'high':
        return 10, "advanced", "Comprehensive, technical details, historical context, and nuances."
    return 5, "basic", "Clear, informative summary."

class SearchView(APIView):
    def post(self, request):
        serializer = SearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        topic = serializer.validated_data['topic']
        depth = serializer.validated_data['depth']

        # 1. Check for fresh record (4 days)
        expiry_date = timezone.now() - timedelta(days=4)
        try:
            record = SearchRecord.objects.get(topic=topic, depth=depth, created_at__gte=expiry_date)
            return Response(SearchResultSerializer(record).data)
        except SearchRecord.DoesNotExist:
            pass

        # 2. Search and Scrape using Tavily
        max_results, tavily_depth, instruction = get_depth_params(depth)
        
        try:
            print(f"🚀 Tavily searching: {topic}")
            search_result = tavily.search(
                query=topic, 
                search_depth=tavily_depth, 
                max_results=max_results,
                include_raw_content=True
            )
        except Exception as e:
            return Response({"error": f"Tavily search failed: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # 3. Process Content
        context_text = ""
        for result in search_result['results']:
            content = result.get('raw_content') or result.get('content')
            context_text += f"\n\nSource: {result['url']}\nContent: {content}"

        if not context_text.strip():
            return Response({"error": "No content found for this topic."}, status=status.HTTP_404_NOT_FOUND)

        # 4. Summarize with Gemini
        prompt = f"""
        You are an expert researcher. Use the following web content to write a summary about "{topic}".
        
        Requirement: {instruction}
        Format: Markdown (use headings and bullets).
        
        Web Content:
        {context_text}
        """
        
        try:
            response = gemini_model.generate_content(prompt)
            summary = response.text
        except Exception as e:
            return Response({"error": f"AI failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 5. Save and Return
        obj, _ = SearchRecord.objects.update_or_create(
            topic=topic, depth=depth,
            defaults={'summary': summary, 'created_at': timezone.now()}
        )

        return Response(SearchResultSerializer(obj).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Retrieve a cached search record by topic and depth (query params)."""
        topic = request.query_params.get('topic')
        depth = request.query_params.get('depth')
        if not topic or not depth:
            return Response({"error": "topic and depth are required"}, status=status.HTTP_400_BAD_REQUEST)

        expiry_date = timezone.now() - timedelta(days=4)
        try:
            record = SearchRecord.objects.get(topic=topic, depth=depth, created_at__gte=expiry_date)
            return Response(SearchResultSerializer(record).data)
        except SearchRecord.DoesNotExist:
            return Response({"error": "No fresh cached record found."}, status=status.HTTP_404_NOT_FOUND)