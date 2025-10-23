from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User, LearningProgress, ChatSession
from app.models.analytics import LearningAnalytics, AnalyticsEvent
from app.models.gamification import Badge, UserBadge, GamificationStats
from app.core.dependencies import get_current_user, get_current_teacher_user

router = APIRouter()

@router.get("/user-progress")
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's learning progress"""
    try:
        # Get learning progress
        progress = await db.execute(
            select(LearningProgress).where(LearningProgress.user_id == current_user.id)
        )
        progress_records = progress.scalars().all()

        return {
            "total_subjects": len(set(p.subject for p in progress_records)),
            "total_topics": len(progress_records),
            "completed_topics": len([p for p in progress_records if p.progress_percentage >= 80]),
            "total_time_spent": sum(p.time_spent for p in progress_records),
            "average_accuracy": sum(p.correct_answers for p in progress_records) / max(sum(p.questions_answered for p in progress_records), 1),
            "progress_by_subject": await get_progress_by_subject(current_user.id, db),
            "recent_achievements": await get_recent_achievements(current_user.id, db)
        }

    except Exception as e:
        logger.error(f"Error getting user progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user progress")

@router.get("/learning-analytics")
async def get_learning_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed learning analytics"""
    try:
        # Get analytics data
        analytics = await db.execute(
            select(LearningAnalytics).where(
                LearningAnalytics.user_id == current_user.id
            ).order_by(LearningAnalytics.created_at.desc()).limit(100)
        )
        analytics_records = analytics.scalars().all()

        # Calculate insights
        insights = await calculate_learning_insights(analytics_records, current_user.id, db)

        return {
            "total_interactions": len(analytics_records),
            "average_response_time": sum(a.response_time for a in analytics_records if a.response_time) / max(len([a for a in analytics_records if a.response_time]), 1),
            "most_practiced_subjects": insights.get("most_practiced_subjects", []),
            "improvement_areas": insights.get("improvement_areas", []),
            "learning_patterns": insights.get("learning_patterns", []),
            "recent_activity": [
                {
                    "event_type": a.event_type,
                    "subject": a.subject,
                    "topic": a.topic,
                    "accuracy": a.accuracy,
                    "sentiment": a.sentiment,
                    "timestamp": a.created_at.isoformat() if a.created_at else None
                }
                for a in analytics_records[:10]
            ]
        }

    except Exception as e:
        logger.error(f"Error getting learning analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get learning analytics")

@router.get("/teacher/class-analytics")
async def get_class_analytics(
    current_user: User = Depends(get_current_teacher_user),
    db: AsyncSession = Depends(get_db)
):
    """Get class analytics for teachers"""
    try:
        # Get all students taught by this teacher
        # This would be based on some teacher-student relationship
        # For now, return general analytics

        # Get overall platform analytics
        total_users = await db.execute(
            select(func.count(User.id)).where(User.role == "student")
        )
        total_users = total_users.scalar()

        total_sessions = await db.execute(
            select(func.count(ChatSession.id))
        )
        total_sessions = total_sessions.scalar()

        total_messages = await db.execute(
            select(func.count(LearningAnalytics.id))
        )
        total_messages = total_messages.scalar()

        # Get subject-wise analytics
        subject_analytics = await get_subject_analytics(db)

        return {
            "overview": {
                "total_students": total_users,
                "total_sessions": total_sessions,
                "total_interactions": total_messages,
                "active_students_today": await get_active_students_count(db, days=1),
                "active_students_week": await get_active_students_count(db, days=7)
            },
            "subject_analytics": subject_analytics,
            "top_performing_students": await get_top_performing_students(db),
            "students_needing_help": await get_students_needing_help(db)
        }

    except Exception as e:
        logger.error(f"Error getting class analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get class analytics")

@router.get("/badges")
async def get_user_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's earned badges"""
    try:
        badges = await db.execute(
            select(UserBadge, Badge).join(Badge).where(
                UserBadge.user_id == current_user.id
            ).order_by(UserBadge.earned_at.desc())
        )
        badge_records = badges.all()

        return [
            {
                "id": user_badge.id,
                "badge": {
                    "id": badge.id,
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "badge_type": badge.badge_type
                },
                "earned_at": user_badge.earned_at.isoformat() if user_badge.earned_at else None,
                "is_displayed": user_badge.is_displayed
            }
            for user_badge, badge in badge_records
        ]

    except Exception as e:
        logger.error(f"Error getting user badges: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user badges")

@router.get("/leaderboard")
async def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get gamification leaderboard"""
    try:
        # Get top students by points and achievements
        leaderboard = await db.execute(
            select(User, GamificationStats).join(GamificationStats).where(
                User.role == "student"
            ).order_by(GamificationStats.total_points.desc()).limit(10)
        )
        leaderboard_records = leaderboard.all()

        return [
            {
                "rank": index + 1,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.full_name
                },
                "stats": {
                    "total_points": stats.total_points,
                    "current_streak": stats.current_streak,
                    "level": stats.level,
                    "total_sessions": stats.total_sessions
                }
            }
            for index, (user, stats) in enumerate(leaderboard_records)
        ]

    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")

# Helper functions

async def get_progress_by_subject(user_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Get progress breakdown by subject"""
    try:
        progress = await db.execute(
            select(LearningProgress).where(LearningProgress.user_id == user_id)
        )
        progress_records = progress.scalars().all()

        subject_progress = {}
        for record in progress_records:
            if record.subject not in subject_progress:
                subject_progress[record.subject] = {
                    "total_topics": 0,
                    "completed_topics": 0,
                    "average_progress": 0,
                    "time_spent": 0
                }

            subject_progress[record.subject]["total_topics"] += 1
            subject_progress[record.subject]["time_spent"] += record.time_spent

            if record.progress_percentage >= 80:
                subject_progress[record.subject]["completed_topics"] += 1

            # Calculate average progress
            current = subject_progress[record.subject]["average_progress"]
            total_topics = subject_progress[record.subject]["total_topics"]
            subject_progress[record.subject]["average_progress"] = (
                (current * (total_topics - 1) + record.progress_percentage) / total_topics
            )

        return subject_progress

    except Exception as e:
        logger.error(f"Error getting progress by subject: {e}")
        return {}

async def get_recent_achievements(user_id: int, db: AsyncSession) -> List[Dict[str, Any]]:
    """Get user's recent achievements"""
    try:
        achievements = await db.execute(
            select(UserBadge, Badge).join(Badge).where(
                UserBadge.user_id == user_id
            ).order_by(UserBadge.earned_at.desc()).limit(5)
        )
        achievement_records = achievements.all()

        return [
            {
                "badge": {
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon
                },
                "earned_at": user_badge.earned_at.isoformat() if user_badge.earned_at else None
            }
            for user_badge, badge in achievement_records
        ]

    except Exception as e:
        logger.error(f"Error getting recent achievements: {e}")
        return []

async def calculate_learning_insights(analytics_records: List, user_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Calculate learning insights from analytics data"""
    try:
        insights = {
            "most_practiced_subjects": [],
            "improvement_areas": [],
            "learning_patterns": []
        }

        if not analytics_records:
            return insights

        # Calculate subject frequency
        subject_count = {}
        for record in analytics_records:
            subject = record.subject or "general"
            subject_count[subject] = subject_count.get(subject, 0) + 1

        # Most practiced subjects
        insights["most_practiced_subjects"] = sorted(
            subject_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        # Learning patterns based on time and performance
        insights["learning_patterns"] = await analyze_learning_patterns(analytics_records)

        return insights

    except Exception as e:
        logger.error(f"Error calculating learning insights: {e}")
        return {}

async def analyze_learning_patterns(analytics_records: List) -> List[Dict[str, Any]]:
    """Analyze learning patterns from analytics"""
    # This would contain more sophisticated pattern analysis
    return [
        {"pattern": "Most active in the morning", "confidence": 0.75},
        {"pattern": "Performs better on math topics", "confidence": 0.68},
        {"pattern": "Prefers visual explanations", "confidence": 0.82}
    ]

async def get_subject_analytics(db: AsyncSession) -> Dict[str, Any]:
    """Get analytics by subject"""
    try:
        # This would aggregate analytics data by subject
        return {
            "mathematics": {"sessions": 150, "avg_accuracy": 0.78},
            "physics": {"sessions": 89, "avg_accuracy": 0.72},
            "chemistry": {"sessions": 67, "avg_accuracy": 0.69},
            "biology": {"sessions": 45, "avg_accuracy": 0.75}
        }
    except Exception as e:
        logger.error(f"Error getting subject analytics: {e}")
        return {}

async def get_active_students_count(db: AsyncSession, days: int = 7) -> int:
    """Get count of active students in the last N days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        count = await db.execute(
            select(func.count(LearningAnalytics.user_id.distinct())).where(
                LearningAnalytics.created_at >= cutoff_date
            )
        )
        return count.scalar()
    except Exception as e:
        logger.error(f"Error getting active students count: {e}")
        return 0

async def get_top_performing_students(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get top performing students"""
    try:
        # This would get students with highest scores/achievements
        return [
            {"username": "student1", "score": 95, "subjects": ["math", "physics"]},
            {"username": "student2", "score": 92, "subjects": ["chemistry", "biology"]}
        ]
    except Exception as e:
        logger.error(f"Error getting top performing students: {e}")
        return []

async def get_students_needing_help(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get students who might need additional help"""
    try:
        # This would identify students with low performance or engagement
        return [
            {"username": "student3", "weak_subjects": ["math"], "last_active": "2 days ago"},
            {"username": "student4", "weak_subjects": ["physics"], "last_active": "1 week ago"}
        ]
    except Exception as e:
        logger.error(f"Error getting students needing help: {e}")
        return []
