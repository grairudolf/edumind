from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from textblob import TextBlob
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
import json
import re
from datetime import datetime

from app.core.config import get_settings
from app.models.user import User, ChatSession, Message, LearningProgress
from app.models.gamification import Badge, UserBadge, GamificationStats
from app.models.analytics import LearningAnalytics
from app.core.database import AsyncSessionLocal

logger = logging.getLogger(__name__)
settings = get_settings()

class ChatbotService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.sentiment_analyzer = None
        self.language_detector = None
        self.subject_knowledge_base = {}
        self.curriculum_data = {}
        self._initialized = False

    async def initialize(self):
        """Initialize the chatbot with models and knowledge base"""
        try:
            logger.info("Initializing ChatbotService...")

            # Load the main conversational model
            model_name = settings.model_name
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(model_name)

            # Load sentiment analysis pipeline
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest"
            )

            # Load language detection
            self.language_detector = pipeline(
                "text-classification",
                model="papluca/xlm-roberta-base-language-detection"
            )

            # Load curriculum knowledge base
            await self._load_curriculum_data()

            # Load subject-specific models for better responses
            await self._load_subject_models()

            self._initialized = True
            logger.info("ChatbotService initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing ChatbotService: {e}")
            raise

    async def _load_curriculum_data(self):
        """Load curriculum data for different subjects and grade levels"""
        # This would typically load from a database or external files
        # For now, we'll define some basic curriculum data
        self.curriculum_data = {
            "mathematics": {
                "topics": {
                    "algebra": ["linear equations", "quadratic equations", "polynomials", "factoring"],
                    "geometry": ["triangles", "circles", "area", "volume", "pythagorean theorem"],
                    "calculus": ["limits", "derivatives", "integrals", "applications"],
                    "statistics": ["mean", "median", "mode", "probability", "standard deviation"]
                },
                "difficulty_levels": ["beginner", "intermediate", "advanced"]
            },
            "physics": {
                "topics": {
                    "mechanics": ["kinematics", "dynamics", "energy", "momentum"],
                    "electricity": ["circuits", "electromagnetism", "resistance", "capacitance"],
                    "optics": ["reflection", "refraction", "lenses", "mirrors"],
                    "thermodynamics": ["heat", "temperature", "entropy", "gas laws"]
                }
            },
            "chemistry": {
                "topics": {
                    "organic": ["hydrocarbons", "functional groups", "reactions", "isomers"],
                    "inorganic": ["periodic table", "bonding", "reactions", "compounds"],
                    "physical": ["states of matter", "equilibrium", "kinetics", "thermodynamics"]
                }
            },
            "biology": {
                "topics": {
                    "cell biology": ["cell structure", "cell division", "genetics", "evolution"],
                    "human biology": ["systems", "organs", "physiology", "anatomy"],
                    "ecology": ["ecosystems", "food chains", "biodiversity", "conservation"]
                }
            }
        }

    async def _load_subject_models(self):
        """Load specialized models for different subjects"""
        # In a production system, you might have fine-tuned models for each subject
        # For now, we'll use the general model with subject-specific prompts
        self.subject_models = {
            "mathematics": "Solve this math problem step by step:",
            "physics": "Explain this physics concept:",
            "chemistry": "Describe this chemical process:",
            "biology": "Explain this biological concept:",
            "general": "Help me understand:"
        }

    async def process_message(self, user_id: str, message: str, message_type: str = "text",
                            language: str = "en", session_id: Optional[int] = None) -> Dict:
        """Process a user message and return a response"""

        if not self._initialized:
            await self.initialize()

        try:
            # Detect language if not provided
            if not language or language == "auto":
                language = await self._detect_language(message)

            # Translate message if needed (for non-English)
            translated_message = message
            if language != "en":
                translated_message = await self._translate_message(message, "en")

            # Analyze sentiment
            sentiment = await self._analyze_sentiment(translated_message)

            # Generate response based on subject and context
            response = await self._generate_response(translated_message, language, user_id)

            # Update learning progress
            await self._update_learning_progress(user_id, translated_message, response, language)

            # Log analytics
            await self._log_analytics(user_id, message, response, sentiment, language, session_id)

            # Check for badge achievements
            await self._check_achievements(user_id)

            return {
                "response": response,
                "language": language,
                "sentiment": sentiment,
                "confidence": 0.85,  # Placeholder confidence score
                "response_time": 1.2,  # Placeholder response time
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your message right now. Please try again.",
                "error": str(e),
                "language": language,
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _detect_language(self, text: str) -> str:
        """Detect the language of the input text"""
        try:
            # Simple keyword-based detection for supported languages
            text_lower = text.lower()

            # French keywords
            french_keywords = ["bonjour", "comment", "pourquoi", "qu'est-ce", "merci", "au revoir"]
            if any(keyword in text_lower for keyword in french_keywords):
                return "fr"

            # Pidgin keywords (common Cameroonian Pidgin)
            pidgin_keywords = ["how", "na", "wetin", "for", "dey", "no", "yes", "small", "big"]
            if any(keyword in text_lower for keyword in pidgin_keywords):
                return "pidgin"

            return "en"  # Default to English

        except Exception as e:
            logger.error(f"Error detecting language: {e}")
            return "en"

    async def _translate_message(self, message: str, target_language: str) -> str:
        """Translate message to target language"""
        try:
            from googletrans import Translator
            translator = Translator()

            if target_language == "en":
                # Detect source language and translate to English for processing
                detected = translator.detect(message)
                if detected.lang != "en":
                    translated = translator.translate(message, dest="en")
                    return translated.text

            return message

        except Exception as e:
            logger.error(f"Error translating message: {e}")
            return message

    async def _analyze_sentiment(self, text: str) -> str:
        """Analyze sentiment of the input text"""
        try:
            if self.sentiment_analyzer:
                result = self.sentiment_analyzer(text)[0]
                return result["label"].lower()
            return "neutral"
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return "neutral"

    async def _generate_response(self, message: str, language: str, user_id: str) -> str:
        """Generate AI response based on the message and context"""
        try:
            # Extract subject and topic from message
            subject, topic = await self._extract_subject_topic(message)

            # Get user's learning style and progress
            user_profile = await self._get_user_profile(user_id)

            # Generate context-aware response
            prompt = await self._build_prompt(message, subject, topic, user_profile, language)

            # Generate response using the model
            if self.model and self.tokenizer:
                inputs = self.tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)

                with torch.no_grad():
                    outputs = self.model.generate(
                        inputs,
                        max_length=inputs.shape[1] + 150,
                        temperature=0.7,
                        do_sample=True,
                        pad_token_id=self.tokenizer.eos_token_id,
                        num_return_sequences=1
                    )

                response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                # Clean up the response
                response = response.replace(prompt, "").strip()
            else:
                response = await self._generate_fallback_response(message, subject, topic, language)

            # Adapt response to user's learning style
            response = await self._adapt_to_learning_style(response, user_profile)

            return response

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I'm sorry, I couldn't generate a response right now. Please try rephrasing your question."

    async def _extract_subject_topic(self, message: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract subject and topic from the user's message"""
        message_lower = message.lower()

        # Simple keyword matching for subject detection
        subject_keywords = {
            "mathematics": ["math", "algebra", "geometry", "calculus", "statistics", "equation", "formula"],
            "physics": ["physics", "force", "energy", "motion", "electricity", "magnetism"],
            "chemistry": ["chemistry", "chemical", "reaction", "molecule", "atom", "compound"],
            "biology": ["biology", "cell", "genetics", "evolution", "organism", "ecosystem"]
        }

        detected_subject = None
        detected_topic = None

        for subject, keywords in subject_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_subject = subject
                break

        # Extract topic if subject is found
        if detected_subject and detected_subject in self.curriculum_data:
            for topic_category, topics in self.curriculum_data[detected_subject]["topics"].items():
                for topic in topics:
                    if topic.replace(" ", "") in message_lower.replace(" ", ""):
                        detected_topic = topic
                        break
                if detected_topic:
                    break

        return detected_subject, detected_topic

    async def _get_user_profile(self, user_id: str) -> Dict:
        """Get user's learning profile and preferences"""
        try:
            async with AsyncSessionLocal() as session:
                # This would query the database for user information
                # For now, return default profile
                return {
                    "learning_style": "visual",
                    "difficulty_preference": "intermediate",
                    "language_preference": "en",
                    "progress": {}
                }
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return {"learning_style": "visual", "difficulty_preference": "intermediate"}

    async def _build_prompt(self, message: str, subject: Optional[str], topic: Optional[str],
                          user_profile: Dict, language: str) -> str:
        """Build a context-aware prompt for the AI model"""
        learning_style = user_profile.get("learning_style", "visual")
        difficulty = user_profile.get("difficulty_preference", "intermediate")

        # Base prompt based on learning style
        style_prompts = {
            "visual": "Explain with clear steps and visual descriptions:",
            "auditory": "Explain in detail as if teaching verbally:",
            "kinesthetic": "Explain with practical examples and hands-on approaches:"
        }

        base_prompt = style_prompts.get(learning_style, style_prompts["visual"])

        # Add subject-specific context
        if subject:
            subject_prompt = self.subject_models.get(subject, self.subject_models["general"])
            base_prompt += f"\nSubject: {subject}"
            if topic:
                base_prompt += f"\nTopic: {topic}"
            base_prompt += f"\nDifficulty: {difficulty}"
            base_prompt += f"\n{subject_prompt}"

        # Add language-specific instructions
        if language != "en":
            base_prompt += f"\nRespond in {language}:"

        base_prompt += f"\n\nUser question: {message}\n\nResponse:"

        return base_prompt

    async def _generate_fallback_response(self, message: str, subject: Optional[str],
                                        topic: Optional[str], language: str) -> str:
        """Generate a fallback response when the model is not available"""
        responses = {
            "mathematics": "For math questions, I can help you with step-by-step solutions. Could you please provide more details about what specific math concept you're struggling with?",
            "physics": "I can help explain physics concepts like mechanics, electricity, or thermodynamics. What specific topic would you like to learn about?",
            "chemistry": "Chemistry can be fascinating! I can help with organic, inorganic, or physical chemistry. What would you like to explore?",
            "biology": "Biology covers many interesting topics from cell structure to ecosystems. What biological concept are you curious about?",
            "general": "I'm here to help you learn! I can assist with mathematics, physics, chemistry, biology, and many other subjects. What would you like to study today?"
        }

        if subject and subject in responses:
            return responses[subject]
        return responses["general"]

    async def _adapt_to_learning_style(self, response: str, user_profile: Dict) -> str:
        """Adapt response to user's preferred learning style"""
        learning_style = user_profile.get("learning_style", "visual")

        if learning_style == "visual":
            # Add visual cues and structured formatting
            response = response.replace("First,", "📍 **First,**")
            response = response.replace("Second,", "📍 **Second,**")
            response = response.replace("Finally,", "📍 **Finally,**")

        elif learning_style == "kinesthetic":
            # Add practical application suggestions
            if "example" not in response.lower():
                response += "\n\n💡 **Try this:** Apply this concept to a real-world situation to better understand it."

        return response

    async def _update_learning_progress(self, user_id: str, question: str, response: str,
                                     language: str):
        """Update user's learning progress based on the interaction"""
        try:
            # Extract subject and topic
            subject, topic = await self._extract_subject_topic(question)

            if subject and topic:
                async with AsyncSessionLocal() as session:
                    # Update or create learning progress record
                    # This would typically involve database operations
                    pass

        except Exception as e:
            logger.error(f"Error updating learning progress: {e}")

    async def _log_analytics(self, user_id: str, message: str, response: str, sentiment: str,
                           language: str, session_id: Optional[int]):
        """Log analytics data for the interaction"""
        try:
            async with AsyncSessionLocal() as session:
                # Create analytics record
                analytics = LearningAnalytics(
                    user_id=int(user_id),
                    session_id=session_id,
                    event_type="chat_interaction",
                    sentiment=sentiment,
                    language=language,
                    metadata={
                        "message_length": len(message),
                        "response_length": len(response),
                        "subject": await self._extract_subject_topic(message)[0]
                    }
                )
                session.add(analytics)
                await session.commit()

        except Exception as e:
            logger.error(f"Error logging analytics: {e}")

    async def _check_achievements(self, user_id: str):
        """Check if user has earned any new badges or achievements"""
        try:
            # This would check various criteria and award badges
            # Implementation would depend on specific gamification rules
            pass

        except Exception as e:
            logger.error(f"Error checking achievements: {e}")

    async def cleanup(self):
        """Clean up resources"""
        try:
            if self.model:
                del self.model
            if self.tokenizer:
                del self.tokenizer
            logger.info("ChatbotService cleaned up")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
