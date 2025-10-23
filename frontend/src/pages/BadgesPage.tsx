import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Badge,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents,
  Lock,
  CheckCircle,
  Star,
  TrendingUp,
  School,
} from '@mui/icons-material';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_type: string;
  points_required: number;
  criteria: any;
  is_earned: boolean;
  earned_at?: string;
}

const BadgesPage: React.FC = () => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Mock badges data - in real app, this would come from API
  const allBadges: Badge[] = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      badge_type: 'achievement',
      points_required: 0,
      criteria: { min_sessions: 1 },
      is_earned: true,
      earned_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Math Whiz',
      description: 'Master basic algebra concepts',
      icon: '🧮',
      badge_type: 'subject',
      points_required: 100,
      criteria: { subject: 'mathematics', accuracy: 0.8 },
      is_earned: true,
      earned_at: '2024-01-18T14:20:00Z',
    },
    {
      id: 3,
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      badge_type: 'streak',
      points_required: 50,
      criteria: { min_streak: 7 },
      is_earned: true,
      earned_at: '2024-01-20T09:15:00Z',
    },
    {
      id: 4,
      name: 'Century Club',
      description: 'Complete 100 chat sessions',
      icon: '💯',
      badge_type: 'achievement',
      points_required: 500,
      criteria: { min_sessions: 100 },
      is_earned: false,
    },
    {
      id: 5,
      name: 'Physics Pro',
      description: 'Excel in physics topics',
      icon: '⚛️',
      badge_type: 'subject',
      points_required: 200,
      criteria: { subject: 'physics', mastery_level: 'expert' },
      is_earned: false,
    },
    {
      id: 6,
      name: 'Speed Demon',
      description: 'Complete lessons in record time',
      icon: '⚡',
      badge_type: 'special',
      points_required: 150,
      criteria: { avg_response_time: 30, accuracy: 0.9 },
      is_earned: false,
    },
    {
      id: 7,
      name: 'Consistency Champion',
      description: '30-day learning streak',
      icon: '👑',
      badge_type: 'streak',
      points_required: 300,
      criteria: { min_streak: 30 },
      is_earned: false,
    },
    {
      id: 8,
      name: 'Knowledge Seeker',
      description: 'Ask 500 thoughtful questions',
      icon: '🔍',
      badge_type: 'achievement',
      points_required: 250,
      criteria: { min_questions: 500, avg_quality: 0.8 },
      is_earned: false,
    },
  ];

  const earnedBadges = allBadges.filter(badge => badge.is_earned);
  const availableBadges = allBadges.filter(badge => !badge.is_earned);

  const getBadgeTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'success';
      case 'streak':
        return 'warning';
      case 'subject':
        return 'primary';
      case 'special':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const BadgeCard: React.FC<{ badge: Badge; showProgress?: boolean }> = ({ badge, showProgress = false }) => (
    <Card
      className="dashboard-card"
      sx={{
        cursor: badge.is_earned ? 'pointer' : 'default',
        opacity: badge.is_earned ? 1 : 0.6,
        '&:hover': badge.is_earned ? { transform: 'translateY(-4px)' } : {},
      }}
      onClick={() => badge.is_earned && setSelectedBadge(badge)}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              fontSize: '2rem',
              bgcolor: badge.is_earned ? 'primary.light' : 'grey.200',
              color: badge.is_earned ? 'primary.main' : 'grey.400',
            }}
          >
            {badge.is_earned ? badge.icon : <Lock />}
          </Avatar>

          {badge.is_earned && (
            <CheckCircle
              sx={{
                position: 'absolute',
                bottom: -5,
                right: 'calc(50% - 12px)',
                bgcolor: 'white',
                borderRadius: '50%',
                color: 'success.main',
              }}
            />
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          {badge.name}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {badge.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Chip
            label={badge.badge_type}
            size="small"
            color={getBadgeTypeColor(badge.badge_type) as any}
            variant="outlined"
          />
          {badge.points_required > 0 && (
            <Chip
              label={`${badge.points_required} pts`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {badge.is_earned && badge.earned_at && (
          <Typography variant="caption" color="textSecondary">
            Earned {new Date(badge.earned_at).toLocaleDateString()}
          </Typography>
        )}

        {!badge.is_earned && showProgress && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary" gutterBottom display="block">
              Progress
            </Typography>
            <LinearProgress variant="determinate" value={65} sx={{ height: 6, borderRadius: 3 }} />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
              65% complete
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏅 Badges & Achievements
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Earn badges by completing challenges and reaching milestones in your learning journey!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary">
                      {earnedBadges.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Badges Earned
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="warning.main">
                      {allBadges.length - earnedBadges.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Available Badges
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main">
                      {Math.round((earnedBadges.length / allBadges.length) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completion Rate
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="secondary.main">
                      1,250
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Points
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Earned Badges */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents color="success" />
            Earned Badges ({earnedBadges.length})
          </Typography>

          <Grid container spacing={2}>
            {earnedBadges.map((badge) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id}>
                <BadgeCard badge={badge} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Available Badges */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star color="primary" />
            Available Badges ({availableBadges.length})
          </Typography>

          <Grid container spacing={2}>
            {availableBadges.map((badge) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id}>
                <BadgeCard badge={badge} showProgress />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Badge Categories */}
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Badge Categories
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <EmojiEvents sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Achievements
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Milestones & goals
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TrendingUp sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Streaks
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Consistency rewards
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Subject Mastery
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Subject expertise
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Star sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Special
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Unique challenges
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Badge Details Dialog */}
      <Dialog open={!!selectedBadge} onClose={() => setSelectedBadge(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBadge?.icon} {selectedBadge?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedBadge?.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Badge Type
            </Typography>
            <Chip
              label={selectedBadge?.badge_type}
              color={getBadgeTypeColor(selectedBadge?.badge_type || '') as any}
            />
          </Box>

          {selectedBadge?.points_required && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Points Required
              </Typography>
              <Typography variant="body1">
                {selectedBadge.points_required} points
              </Typography>
            </Box>
          )}

          {selectedBadge?.earned_at && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Earned On
              </Typography>
              <Typography variant="body1">
                {new Date(selectedBadge.earned_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBadge(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BadgesPage;
