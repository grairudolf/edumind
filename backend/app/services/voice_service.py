import asyncio
import logging
import tempfile
import os
from typing import Optional, Dict, Any
import speech_recognition as sr
import pyttsx3
from io import BytesIO

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = None
        self._initialize_tts()

    def _initialize_tts(self):
        """Initialize text-to-speech engine"""
        try:
            self.engine = pyttsx3.init()
            # Set voice properties
            voices = self.engine.getProperty('voices')
            if voices:
                # Try to find a female voice
                for voice in voices:
                    if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                        self.engine.setProperty('voice', voice.id)
                        break
                else:
                    self.engine.setProperty('voice', voices[0].id)

            # Set speech rate (words per minute)
            self.engine.setProperty('rate', 180)

            # Set volume (0.0 to 1.0)
            self.engine.setProperty('volume', 0.9)

        except Exception as e:
            logger.error(f"Error initializing TTS engine: {e}")
            self.engine = None

    async def speech_to_text(self, audio_data: bytes, language: str = 'en-US') -> Optional[str]:
        """Convert speech audio to text"""
        try:
            # Create a temporary file for the audio data
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name

            try:
                # Use speech recognition
                with sr.AudioFile(temp_file_path) as source:
                    # Adjust for ambient noise
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)

                    # Record audio
                    audio = self.recognizer.record(source)

                    # Recognize speech
                    if language.startswith('fr'):
                        text = self.recognizer.recognize_google(audio, language='fr-FR')
                    elif language == 'pidgin':
                        # For Pidgin, use English recognition with custom processing
                        text = self.recognizer.recognize_google(audio, language='en-US')
                    else:
                        text = self.recognizer.recognize_google(audio, language='en-US')

                    return text

            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)

        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            return None
        except sr.RequestError as e:
            logger.error(f"Speech recognition request error: {e}")
            return None
        except Exception as e:
            logger.error(f"Error in speech to text: {e}")
            return None

    async def text_to_speech(self, text: str, language: str = 'en') -> bytes:
        """Convert text to speech audio"""
        try:
            if not self.engine:
                logger.error("TTS engine not initialized")
                return b""

            # Set language-specific voice properties
            if language == 'fr':
                voices = self.engine.getProperty('voices')
                for voice in voices:
                    if 'french' in voice.name.lower() or 'fr' in voice.languages[0] if hasattr(voice, 'languages') else False:
                        self.engine.setProperty('voice', voice.id)
                        break

                self.engine.setProperty('rate', 160)  # Slower for French
            elif language == 'pidgin':
                # Use English voice for Pidgin
                voices = self.engine.getProperty('voices')
                for voice in voices:
                    if 'english' in voice.name.lower() or 'en' in voice.languages[0] if hasattr(voice, 'languages') else False:
                        self.engine.setProperty('voice', voice.id)
                        break

                self.engine.setProperty('rate', 200)  # Faster for Pidgin
            else:
                # Default English settings
                voices = self.engine.getProperty('voices')
                for voice in voices:
                    if 'english' in voice.name.lower() or 'en' in voice.languages[0] if hasattr(voice, 'languages') else False:
                        self.engine.setProperty('voice', voice.id)
                        break

                self.engine.setProperty('rate', 180)

            # Create temporary file for audio output
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file_path = temp_file.name

            try:
                # Generate speech
                self.engine.save_to_file(text, temp_file_path)
                self.engine.runAndWait()

                # Read the audio file
                with open(temp_file_path, 'rb') as audio_file:
                    audio_data = audio_file.read()

                return audio_data

            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)

        except Exception as e:
            logger.error(f"Error in text to speech: {e}")
            return b""

    async def text_to_speech_stream(self, text: str, language: str = 'en') -> BytesIO:
        """Convert text to speech and return as BytesIO stream"""
        try:
            audio_data = await self.text_to_speech(text, language)
            return BytesIO(audio_data)

        except Exception as e:
            logger.error(f"Error creating speech stream: {e}")
            return BytesIO(b"")

    def get_supported_languages(self) -> Dict[str, str]:
        """Get supported languages for voice services"""
        return {
            'en': 'English (US)',
            'en-GB': 'English (UK)',
            'fr': 'French',
            'pidgin': 'Nigerian Pidgin (English voice)',
        }

    async def check_microphone_available(self) -> bool:
        """Check if microphone is available"""
        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                return True
        except Exception as e:
            logger.error(f"Microphone not available: {e}")
            return False

    async def get_audio_from_microphone(self, duration: int = 5) -> Optional[bytes]:
        """Record audio from microphone"""
        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                logger.info(f"Listening for {duration} seconds...")

                audio = self.recognizer.listen(source, timeout=duration)
                return audio.get_wav_data()

        except sr.WaitTimeoutError:
            logger.warning("Listening timeout")
            return None
        except Exception as e:
            logger.error(f"Error recording from microphone: {e}")
            return None
