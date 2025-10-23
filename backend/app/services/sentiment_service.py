from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from textblob import TextBlob
import re

logger = logging.getLogger(__name__)

class SentimentService:
    def __init__(self):
        self.sentiment_analyzer = None
        self.emotion_analyzer = None
        self.engagement_analyzer = None
        self._initialized = False

    async def initialize(self):
        """Initialize sentiment analysis models"""
        try:
            logger.info("Initializing SentimentService...")

            # Load sentiment analysis model
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                return_all_scores=True
            )

            # Load emotion detection model
            self.emotion_analyzer = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True
            )

            # Load engagement analysis model (using a general purpose model)
            self.engagement_analyzer = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                return_all_scores=True
            )

            self._initialized = True
            logger.info("SentimentService initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing SentimentService: {e}")
            raise

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of the text"""
        try:
            if not self._initialized:
                await self.initialize()

            if not self.sentiment_analyzer:
                return await self._fallback_sentiment_analysis(text)

            # Get sentiment scores
            results = self.sentiment_analyzer(text)[0]

            # Find the sentiment with highest score
            best_sentiment = max(results, key=lambda x: x['score'])

            # Map labels to standard format
            label_mapping = {
                'LABEL_0': 'negative',
                'LABEL_1': 'neutral',
                'LABEL_2': 'positive'
            }

            sentiment_label = label_mapping.get(best_sentiment['label'], 'neutral')

            return {
                'sentiment': sentiment_label,
                'confidence': best_sentiment['score'],
                'all_scores': {
                    result['label']: result['score'] for result in results
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return await self._fallback_sentiment_analysis(text)

    async def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """Analyze emotions in the text"""
        try:
            if not self._initialized:
                await self.initialize()

            if not self.emotion_analyzer:
                return {'emotion': 'neutral', 'confidence': 0.5}

            # Get emotion scores
            results = self.emotion_analyzer(text)[0]

            # Find the emotion with highest score
            best_emotion = max(results, key=lambda x: x['score'])

            return {
                'emotion': best_emotion['label'],
                'confidence': best_emotion['score'],
                'all_scores': {
                    result['label']: result['score'] for result in results
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing emotion: {e}")
            return {'emotion': 'neutral', 'confidence': 0.5}

    async def analyze_engagement(self, text: str) -> Dict[str, Any]:
        """Analyze engagement level in the text"""
        try:
            if not self._initialized:
                await self.initialize()

            if not self.engagement_analyzer:
                return await self._rule_based_engagement_analysis(text)

            # Get engagement scores
            results = self.engagement_analyzer(text)[0]

            # Calculate engagement score (positive sentiment + question indicators)
            engagement_score = self._calculate_engagement_score(text, results)

            return {
                'engagement_level': 'high' if engagement_score > 0.7 else 'medium' if engagement_score > 0.4 else 'low',
                'engagement_score': engagement_score,
                'sentiment_scores': {
                    result['label']: result['score'] for result in results
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing engagement: {e}")
            return await self._rule_based_engagement_analysis(text)

    async def analyze_comprehensive_sentiment(self, text: str) -> Dict[str, Any]:
        """Comprehensive sentiment analysis including sentiment, emotion, and engagement"""
        try:
            # Run all analyses in parallel
            sentiment_task = self.analyze_sentiment(text)
            emotion_task = self.analyze_emotion(text)
            engagement_task = self.analyze_engagement(text)

            sentiment_result, emotion_result, engagement_result = await asyncio.gather(
                sentiment_task, emotion_task, engagement_task
            )

            return {
                'sentiment': sentiment_result,
                'emotion': emotion_result,
                'engagement': engagement_result,
                'overall_mood': self._determine_overall_mood(sentiment_result, emotion_result, engagement_result),
                'timestamp': asyncio.get_event_loop().time()
            }

        except Exception as e:
            logger.error(f"Error in comprehensive sentiment analysis: {e}")
            return {
                'sentiment': {'sentiment': 'neutral', 'confidence': 0.5},
                'emotion': {'emotion': 'neutral', 'confidence': 0.5},
                'engagement': {'engagement_level': 'medium', 'engagement_score': 0.5},
                'overall_mood': 'neutral'
            }

    def _calculate_engagement_score(self, text: str, sentiment_results: List) -> float:
        """Calculate engagement score based on text and sentiment"""
        score = 0.0

        # Sentiment contribution (positive sentiment increases engagement)
        positive_score = next((r['score'] for r in sentiment_results if r['label'] == 'POSITIVE'), 0)
        negative_score = next((r['score'] for r in sentiment_results if r['label'] == 'NEGATIVE'), 0)

        score += (positive_score - negative_score) * 0.4

        # Question indicators (questions show engagement)
        question_indicators = ['?', 'what', 'how', 'why', 'when', 'where', 'which', 'explain', 'help']
        text_lower = text.lower()

        question_count = sum(1 for indicator in question_indicators if indicator in text_lower)
        score += min(question_count * 0.1, 0.3)

        # Confusion indicators (might indicate engagement or frustration)
        confusion_words = ['confused', 'don\'t understand', 'not clear', 'difficult', 'stuck']
        confusion_count = sum(1 for word in confusion_words if word in text_lower)
        score += min(confusion_count * 0.05, 0.1)

        # Length contribution (longer messages might indicate more engagement)
        word_count = len(text.split())
        score += min(word_count * 0.01, 0.2)

        # Normalize score to 0-1 range
        return max(0.0, min(1.0, score))

    def _determine_overall_mood(self, sentiment: Dict, emotion: Dict, engagement: Dict) -> str:
        """Determine overall mood based on all analysis results"""
        try:
            # Weight the different factors
            sentiment_weight = 0.4
            emotion_weight = 0.3
            engagement_weight = 0.3

            # Sentiment contribution
            mood_score = 0
            if sentiment['sentiment'] == 'positive':
                mood_score += 1 * sentiment_weight
            elif sentiment['sentiment'] == 'negative':
                mood_score -= 1 * sentiment_weight

            # Emotion contribution
            positive_emotions = ['joy', 'optimism', 'love']
            negative_emotions = ['anger', 'sadness', 'fear', 'disgust']

            if emotion['emotion'] in positive_emotions:
                mood_score += 0.5 * emotion_weight
            elif emotion['emotion'] in negative_emotions:
                mood_score -= 0.5 * emotion_weight

            # Engagement contribution
            if engagement['engagement_level'] == 'high':
                mood_score += 0.2 * engagement_weight
            elif engagement['engagement_level'] == 'low':
                mood_score -= 0.2 * engagement_weight

            # Determine overall mood
            if mood_score > 0.3:
                return 'positive'
            elif mood_score < -0.3:
                return 'negative'
            else:
                return 'neutral'

        except Exception as e:
            logger.error(f"Error determining overall mood: {e}")
            return 'neutral'

    async def _fallback_sentiment_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback sentiment analysis using TextBlob"""
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity

            if polarity > 0.1:
                sentiment = 'positive'
            elif polarity < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'

            return {
                'sentiment': sentiment,
                'confidence': abs(polarity),
                'polarity': polarity,
                'subjectivity': blob.sentiment.subjectivity
            }

        except Exception as e:
            logger.error(f"Error in fallback sentiment analysis: {e}")
            return {'sentiment': 'neutral', 'confidence': 0.5}

    async def _rule_based_engagement_analysis(self, text: str) -> Dict[str, Any]:
        """Rule-based engagement analysis as fallback"""
        try:
            engagement_score = self._calculate_engagement_score(text, [])

            if engagement_score > 0.7:
                level = 'high'
            elif engagement_score > 0.4:
                level = 'medium'
            else:
                level = 'low'

            return {
                'engagement_level': level,
                'engagement_score': engagement_score,
                'indicators': self._extract_engagement_indicators(text)
            }

        except Exception as e:
            logger.error(f"Error in rule-based engagement analysis: {e}")
            return {'engagement_level': 'medium', 'engagement_score': 0.5}

    def _extract_engagement_indicators(self, text: str) -> List[str]:
        """Extract engagement indicators from text"""
        indicators = []
        text_lower = text.lower()

        # Question indicators
        if '?' in text:
            indicators.append('question')

        # Confusion indicators
        confusion_words = ['confused', 'don\'t understand', 'not clear', 'difficult', 'stuck']
        if any(word in text_lower for word in confusion_words):
            indicators.append('confusion')

        # Positive indicators
        positive_words = ['yes', 'understand', 'clear', 'good', 'thanks', 'helpful']
        if any(word in text_lower for word in positive_words):
            indicators.append('positive_response')

        # Help-seeking indicators
        help_words = ['help', 'explain', 'show', 'example']
        if any(word in text_lower for word in help_words):
            indicators.append('seeking_help')

        return indicators

    def get_sentiment_trends(self, sentiment_history: List[Dict]) -> Dict[str, Any]:
        """Analyze sentiment trends over time"""
        try:
            if not sentiment_history:
                return {'trend': 'stable', 'average_sentiment': 'neutral'}

            # Calculate average sentiment
            sentiment_scores = []
            for entry in sentiment_history:
                sentiment = entry.get('sentiment', {})
                if isinstance(sentiment, dict):
                    sentiment_label = sentiment.get('sentiment', 'neutral')
                    confidence = sentiment.get('confidence', 0.5)
                else:
                    sentiment_label = sentiment
                    confidence = 0.5

                if sentiment_label == 'positive':
                    sentiment_scores.append(confidence)
                elif sentiment_label == 'negative':
                    sentiment_scores.append(-confidence)
                else:
                    sentiment_scores.append(0)

            average_score = sum(sentiment_scores) / len(sentiment_scores)

            # Determine trend
            if average_score > 0.2:
                trend = 'improving'
            elif average_score < -0.2:
                trend = 'declining'
            else:
                trend = 'stable'

            # Determine average sentiment
            if average_score > 0.1:
                avg_sentiment = 'positive'
            elif average_score < -0.1:
                avg_sentiment = 'negative'
            else:
                avg_sentiment = 'neutral'

            return {
                'trend': trend,
                'average_sentiment': avg_sentiment,
                'average_score': average_score,
                'total_interactions': len(sentiment_history)
            }

        except Exception as e:
            logger.error(f"Error analyzing sentiment trends: {e}")
            return {'trend': 'stable', 'average_sentiment': 'neutral'}

    async def cleanup(self):
        """Clean up resources"""
        try:
            if self.sentiment_analyzer:
                del self.sentiment_analyzer
            if self.emotion_analyzer:
                del self.emotion_analyzer
            if self.engagement_analyzer:
                del self.engagement_analyzer
            logger.info("SentimentService cleaned up")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
