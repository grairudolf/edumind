from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.gamification import Badge, UserBadge, Achievement, GamificationStats
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/stats")
async def get_gamification_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's gamification statistics"""
    try:
        # Get or create gamification stats
        stats_result = await db.execute(
            select(GamificationStats).where(GamificationStats.user_id == current_user.id)
        )
        stats = stats_result.scalar_one_or_none()

        if not stats:
            # Create default stats
            stats = GamificationStats(user_id=current_user.id)
            db.add(stats)
            await db.commit()
            await db.refresh(stats)

        # Get user's badges
        badges_result = await db.execute(
            select(UserBadge, Badge).join(Badge).where(
                UserBadge.user_id == current_user.id
            ).order_by(UserBadge.earned_at.desc())
        )
        user_badges = badges_result.all()

        return {
            "level": stats.level,
            "total_points": stats.total_points,
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "xp_to_next_level": stats.xp_to_next_level,
            "total_sessions": stats.total_sessions,
            "total_questions_answered": stats.total_questions_answered,
            "total_correct_answers": stats.total_correct_answers,
            "average_response_time": stats.average_response_time,
            "favorite_subject": stats.favorite_subject,
            "badges_earned": len(user_badges),
            "recent_badges": [
                {
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "earned_at": user_badge.earned_at.isoformat() if user_badge.earned_at else None
                }
                for user_badge, badge in user_badges[:5]
            ],
            "last_activity": stats.last_activity.isoformat() if stats.last_activity else None
        }

    except Exception as e:
        logger.error(f"Error getting gamification stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get gamification stats")

@router.get("/badges")
async def get_available_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all available badges and user's progress"""
    try:
        # Get all active badges
        badges_result = await db.execute(
            select(Badge).where(Badge.is_active == True)
        )
        all_badges = badges_result.scalars().all()

        # Get user's earned badges
        user_badges_result = await db.execute(
            select(Badge.id).join(UserBadge).where(
                UserBadge.user_id == current_user.id
            )
        )
        earned_badge_ids = [badge.id for badge in user_badges_result]

        badges_data = []
        for badge in all_badges:
            badges_data.append({
                "id": badge.id,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "badge_type": badge.badge_type,
                "points_required": badge.points_required,
                "criteria": badge.criteria,
                "is_earned": badge.id in earned_badge_ids,
                "earned_at": None  # Would be populated if earned
            })

        return badges_data

    except Exception as e:
        logger.error(f"Error getting available badges: {e}")
        raise HTTPException(status_code=500, detail="Failed to get available badges")

@router.post("/badges/{badge_id}/claim")
async def claim_badge(
    badge_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Claim a badge if criteria are met"""
    try:
        # Get badge
        badge_result = await db.execute(
            select(Badge).where(Badge.id == badge_id)
        )
        badge = badge_result.scalar_one_or_none()

        if not badge:
            raise HTTPException(status_code=404, detail="Badge not found")

        # Check if already earned
        user_badge_result = await db.execute(
            select(UserBadge).where(
                UserBadge.user_id == current_user.id,
                UserBadge.badge_id == badge_id
            )
        )
        existing_badge = user_badge_result.scalar_one_or_none()

        if existing_badge:
            raise HTTPException(status_code=400, detail="Badge already earned")

        # Check if criteria are met (simplified check)
        if await check_badge_criteria(current_user.id, badge.criteria, db):
            # Award badge
            user_badge = UserBadge(
                user_id=current_user.id,
                badge_id=badge_id,
                earned_at=datetime.utcnow(),
                is_displayed=True
            )

            db.add(user_badge)
            await db.commit()

            # Update gamification stats
            await update_gamification_stats(current_user.id, badge.points_required, db)

            return {
                "message": f"Badge '{badge.name}' earned successfully!",
                "badge": {
                    "id": badge.id,
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Badge criteria not met")

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error claiming badge: {e}")
        raise HTTPException(status_code=500, detail="Failed to claim badge")

@router.get("/achievements")
async def get_user_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's detailed achievements"""
    try:
        achievements_result = await db.execute(
            select(Achievement, Badge).join(Badge).where(
                Achievement.user_id == current_user.id
            ).order_by(Achievement.earned_at.desc())
        )
        achievements = achievements_result.all()

        return [
            {
                "id": achievement.id,
                "badge": {
                    "id": badge.id,
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "badge_type": badge.badge_type
                },
                "earned_at": achievement.earned_at.isoformat() if achievement.earned_at else None,
                "progress_data": achievement.progress_data
            }
            for achievement, badge in achievements
        ]

    except Exception as e:
        logger.error(f"Error getting user achievements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user achievements")

@router.get("/leaderboard")
async def get_gamification_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get gamification leaderboard"""
    try:
        # Get top 20 users by points
        leaderboard_result = await db.execute(
            select(User, GamificationStats).join(GamificationStats).where(
                User.role == "student"
            ).order_by(GamificationStats.total_points.desc()).limit(20)
        )
        leaderboard = leaderboard_result.all()

        # Get current user's rank
        user_rank_result = await db.execute(
            select(func.count()).select_from(
                select(GamificationStats).where(
                    GamificationStats.total_points > (
                        select(GamificationStats.total_points).where(
                            GamificationStats.user_id == current_user.id
                        )
                    )
                )
            )
        )
        user_rank = user_rank_result.scalar() + 1

        return {
            "user_rank": user_rank,
            "leaderboard": [
                {
                    "rank": index + 1,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "full_name": user.full_name
                    },
                    "stats": {
                        "level": stats.level,
                        "total_points": stats.total_points,
                        "current_streak": stats.current_streak,
                        "badges_count": await get_user_badge_count(user.id, db)
                    },
                    "is_current_user": user.id == current_user.id
                }
                for index, (user, stats) in enumerate(leaderboard)
            ]
        }

    except Exception as e:
        logger.error(f"Error getting gamification leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")

@router.post("/streak-update")
async def update_streak(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user's learning streak"""
    try:
        # Get current stats
        stats_result = await db.execute(
            select(GamificationStats).where(GamificationStats.user_id == current_user.id)
        )
        stats = stats_result.scalar_one_or_none()

        if not stats:
            stats = GamificationStats(user_id=current_user.id)
            db.add(stats)

        # Check if user was active yesterday
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_session_result = await db.execute(
            select(ChatSession).where(
                ChatSession.user_id == current_user.id,
                ChatSession.started_at >= yesterday
            )
        )
        recent_session = recent_session_result.scalar_one_or_none()

        if recent_session:
            # Increment streak
            stats.current_streak += 1
            if stats.current_streak > stats.longest_streak:
                stats.longest_streak = stats.current_streak

            # Award points for streak
            streak_points = min(stats.current_streak * 10, 100)  # Cap at 100 points
            stats.total_points += streak_points

            # Check for streak badges
            await check_streak_badges(current_user.id, stats.current_streak, db)
        else:
            # Reset streak
            stats.current_streak = 1

        stats.last_activity = datetime.utcnow()
        await db.commit()

        return {
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "points_earned": streak_points if recent_session else 0
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating streak: {e}")
        raise HTTPException(status_code=500, detail="Failed to update streak")

# Helper functions

async def check_badge_criteria(user_id: int, criteria: Dict, db: AsyncSession) -> bool:
    """Check if user meets badge criteria"""
    try:
        # Simplified criteria checking
        for criterion, value in criteria.items():
            if criterion == "min_sessions":
                sessions_count = await db.execute(
                    select(func.count()).select_from(ChatSession).where(
                        ChatSession.user_id == user_id
                    )
                )
                if sessions_count.scalar() < value:
                    return False

            elif criterion == "min_points":
                stats_result = await db.execute(
                    select(GamificationStats.total_points).where(
                        GamificationStats.user_id == user_id
                    )
                )
                stats = stats_result.scalar_one_or_none()
                if not stats or stats < value:
                    return False

        return True

    except Exception as e:
        logger.error(f"Error checking badge criteria: {e}")
        return False

async def update_gamification_stats(user_id: int, points: int, db: AsyncSession):
    """Update user's gamification statistics"""
    try:
        stats_result = await db.execute(
            select(GamificationStats).where(GamificationStats.user_id == user_id)
        )
        stats = stats_result.scalar_one_or_none()

        if not stats:
            stats = GamificationStats(user_id=user_id)
            db.add(stats)

        stats.total_points += points
        stats.last_activity = datetime.utcnow()

        # Check for level up
        xp_thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
        new_level = 1
        for threshold in xp_thresholds:
            if stats.total_points >= threshold:
                new_level = xp_thresholds.index(threshold) + 1
            else:
                break

        if new_level > stats.level:
            stats.level = new_level
            stats.xp_to_next_level = xp_thresholds[min(new_level, len(xp_thresholds)-1)] - stats.total_points

        await db.commit()

    except Exception as e:
        logger.error(f"Error updating gamification stats: {e}")

async def get_user_badge_count(user_id: int, db: AsyncSession) -> int:
    """Get count of badges earned by user"""
    try:
        count = await db.execute(
            select(func.count()).select_from(UserBadge).where(
                UserBadge.user_id == user_id
            )
        )
        return count.scalar()
    except Exception as e:
        logger.error(f"Error getting user badge count: {e}")
        return 0

async def check_streak_badges(user_id: int, streak_count: int, db: AsyncSession):
    """Check and award streak-related badges"""
    try:
        # Define streak badge criteria
        streak_badges = {
            3: "First Steps",
            7: "Week Warrior",
            14: "Consistency Champion",
            30: "Monthly Master",
            100: "Century Streak"
        }

        if streak_count in streak_badges:
            # Check if badge already earned
            badge_result = await db.execute(
                select(Badge).where(Badge.name == streak_badges[streak_count])
            )
            badge = badge_result.scalar_one_or_none()

            if badge:
                user_badge_result = await db.execute(
                    select(UserBadge).where(
                        UserBadge.user_id == user_id,
                        UserBadge.badge_id == badge.id
                    )
                )
                existing_badge = user_badge_result.scalar_one_or_none()

                if not existing_badge:
                    # Award badge
                    user_badge = UserBadge(
                        user_id=user_id,
                        badge_id=badge.id,
                        earned_at=datetime.utcnow(),
                        is_displayed=True
                    )
                    db.add(user_badge)
                    await db.commit()

    except Exception as e:
        logger.error(f"Error checking streak badges: {e}")
