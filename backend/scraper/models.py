from django.db import models

class SearchRecord(models.Model):
    DEPTH_CHOICES = [
        ('less', 'Less'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    topic = models.CharField(max_length=255)
    depth = models.CharField(max_length=10, choices=DEPTH_CHOICES)
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('topic', 'depth')  # one record per topic+depth

    def __str__(self):
        return f"{self.topic} ({self.depth}) - {self.created_at}"