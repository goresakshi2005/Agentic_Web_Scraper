from rest_framework import serializers
from .models import SearchRecord

class SearchSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=255)
    depth = serializers.ChoiceField(choices=['less', 'medium', 'high'])

class SearchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchRecord
        fields = ['topic', 'depth', 'summary', 'created_at']