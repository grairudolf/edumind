from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="student")  # student, teacher, admin
    language_preference = Column(String, default="en")
    learning_style = Column(String, default="visual")  # visual, auditory, kinesthetic
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_image = Column(String)
    date_of_birth = Column(DateTime)
    school = Column(String)
    grade_level = Column(String)
    subjects = Column(JSON)  # List of subjects interested in
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sessions = relationship("ChatSession", back_populates="user")
    progress = relationship("LearningProgress", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    analytics = relationship("LearningAnalytics", back_populates="user")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    subject = Column(String)
    difficulty_level = Column(String, default="beginner")
    language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="sessions")
    messages = relationship("Message", back_populates="session", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String, default="text")  # text, voice, image
    is_user = Column(Boolean, default=True)
    sentiment = Column(String)  # positive, negative, neutral
    confidence = Column(Float)
    language = Column(String, default="en")
    response_time = Column(Float)  # Time taken to respond in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="messages")
    user = relationship("User")

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty_level = Column(String, default="beginner")
    progress_percentage = Column(Float, default=0.0)
    time_spent = Column(Float, default=0.0)  # in minutes
    questions_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    last_practiced = Column(DateTime(timezone=True))
    mastery_level = Column(String, default="novice")  # novice, beginner, intermediate, advanced, expert
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="progress")
