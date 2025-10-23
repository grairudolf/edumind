import asyncio
import logging
from typing import Dict, List, Optional
from googletrans import Translator
import json

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        self.translator = Translator()
        self.supported_languages = {
            'en': 'English',
            'fr': 'French',
            'pidgin': 'Nigerian Pidgin'
        }

        # Pidgin translations for common educational terms
        self.pidgin_dictionary = {
            # Basic greetings and responses
            'hello': 'how far',
            'hi': 'how far',
            'good morning': 'good morning',
            'good afternoon': 'good afternoon',
            'good evening': 'good evening',
            'thank you': 'thank you',
            'thanks': 'thanks',
            'welcome': 'you welcome',
            'yes': 'yes',
            'no': 'no',

            # Educational terms
            'mathematics': 'maths',
            'physics': 'physics',
            'chemistry': 'chemistry',
            'biology': 'biology',
            'algebra': 'algebra',
            'geometry': 'geometry',
            'calculus': 'calculus',
            'equation': 'equation',
            'formula': 'formula',
            'problem': 'question',
            'solution': 'answer',
            'explain': 'explain',
            'understand': 'understand',
            'learn': 'learn',
            'study': 'study',
            'practice': 'practice',
            'test': 'test',
            'exam': 'exam',
            'homework': 'assignment',

            # Question words
            'what': 'wetin',
            'how': 'how',
            'why': 'why',
            'when': 'when',
            'where': 'where',
            'which': 'which',
            'who': 'who',

            # Common phrases
            'i don\'t understand': 'i no understand',
            'please explain': 'abeg explain',
            'give me example': 'give me example',
            'show me how': 'show me how',
            'that\'s correct': 'na so',
            'that\'s wrong': 'no be so',
            'very good': 'very good',
            'excellent': 'excellent',
            'keep it up': 'continue like that',
            'try again': 'try again',
            'you can do it': 'you fit do am',
            'don\'t give up': 'no give up',

            # Numbers and basic math
            'one': 'one',
            'two': 'two',
            'three': 'three',
            'four': 'four',
            'five': 'five',
            'plus': 'add',
            'minus': 'subtract',
            'times': 'multiply',
            'divide': 'divide',
            'equals': 'equal',
            'sum': 'total',
            'difference': 'difference',
            'product': 'answer',
            'quotient': 'answer',
        }

    async def translate_to_english(self, text: str, source_language: str = 'auto') -> str:
        """Translate text to English for processing"""
        try:
            if source_language == 'en':
                return text

            # Handle Pidgin separately
            if source_language == 'pidgin':
                return await self._translate_pidgin_to_english(text)

            # Use Google Translate for French and other languages
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.translator.translate(text, dest='en', src=source_language)
            )
            return result.text

        except Exception as e:
            logger.error(f"Error translating to English: {e}")
            return text

    async def translate_from_english(self, text: str, target_language: str) -> str:
        """Translate text from English to target language"""
        try:
            if target_language == 'en':
                return text

            # Handle Pidgin separately
            if target_language == 'pidgin':
                return await self._translate_english_to_pidgin(text)

            # Use Google Translate for French and other languages
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.translator.translate(text, dest=target_language, src='en')
            )
            return result.text

        except Exception as e:
            logger.error(f"Error translating from English: {e}")
            return text

    async def _translate_pidgin_to_english(self, pidgin_text: str) -> str:
        """Translate Pidgin English to English"""
        try:
            # Convert to lowercase for matching
            text_lower = pidgin_text.lower()

            # Replace Pidgin words with English equivalents
            english_words = []
            words = text_lower.split()

            for word in words:
                # Remove punctuation
                clean_word = word.strip('.,!?;:')

                # Check if word is in dictionary
                if clean_word in self.pidgin_dictionary:
                    english_words.append(self.pidgin_dictionary[clean_word])
                else:
                    # Keep unknown words as is
                    english_words.append(clean_word)

            return ' '.join(english_words)

        except Exception as e:
            logger.error(f"Error translating Pidgin to English: {e}")
            return pidgin_text

    async def _translate_english_to_pidgin(self, english_text: str) -> str:
        """Translate English to Pidgin English"""
        try:
            # For now, use a simple word-by-word translation
            # In a production system, you might want to use a more sophisticated approach
            pidgin_text = english_text.lower()

            # Create reverse dictionary
            reverse_dict = {v: k for k, v in self.pidgin_dictionary.items()}

            # Replace English words with Pidgin equivalents
            words = pidgin_text.split()
            pidgin_words = []

            for word in words:
                clean_word = word.strip('.,!?;:')
                if clean_word in reverse_dict:
                    pidgin_words.append(reverse_dict[clean_word])
                else:
                    pidgin_words.append(word)

            # Capitalize first word and add some Pidgin flair
            result = ' '.join(pidgin_words)
            if result:
                result = result[0].upper() + result[1:]

            return result

        except Exception as e:
            logger.error(f"Error translating English to Pidgin: {e}")
            return english_text

    async def detect_language(self, text: str) -> str:
        """Detect the language of the input text"""
        try:
            # Check for Pidgin indicators
            pidgin_indicators = ['na', 'wetin', 'how far', 'abeg', 'no be', 'dey', 'fit']
            text_lower = text.lower()

            if any(indicator in text_lower for indicator in pidgin_indicators):
                return 'pidgin'

            # Use Google Translate for other languages
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.translator.detect(text)
            )
            return result.lang

        except Exception as e:
            logger.error(f"Error detecting language: {e}")
            return 'en'

    def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages"""
        return self.supported_languages.copy()

    async def translate_chatbot_response(self, response: str, target_language: str) -> str:
        """Translate chatbot response to target language"""
        try:
            if target_language == 'en':
                return response

            # Translate to target language
            translated = await self.translate_from_english(response, target_language)

            return translated

        except Exception as e:
            logger.error(f"Error translating chatbot response: {e}")
            return response
