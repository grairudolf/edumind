import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Chat,
  EmojiEvents,
  TrendingUp,
  School,
  Star,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/apiService';
import { GamificationStats } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GamificationStats | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const gamificationStats = await apiService.getGamificationStats();
        setStats(gamificationStats.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        // setError('Failed to load dashboard data');
        // Fallback to mock data
        setStats({
          id: 1,
          user_id: user?.id || 1,
          level: 5,
          total_points: 1250,
          current_streak: 7,
          longest_streak: 12,
          xp_to_next_level: 250,
          total_sessions: 24,
          total_questions_answered: 156,
          total_correct_answers: 134,
          average_response_time: 2.3,
          favorite_subject: 'Mathematics',
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const recentBadges = [
    { name: 'First Steps', description: 'Completed your first lesson', icon: '🎯' },
    { name: 'Math Whiz', description: 'Mastered basic algebra', icon: '🧮' },
    { name: 'Week Warrior', description: '7-day learning streak', icon: '🔥' },
  ];

  const progressData = [
    { subject: 'Mathematics', progress: 75, color: '#3f51b5' },
    { subject: 'Physics', progress: 60, color: '#f50057' },
    { subject: 'Chemistry', progress: 45, color: '#ff9800' },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Grow in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.full_name || user?.username}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Ready to continue your learning journey?
          </Typography>
        </Box>
      </Grow>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={800}>
            <Card className="dashboard-card" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Chat color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats?.total_sessions || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Chat Sessions
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={900}>
            <Card className="dashboard-card" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {stats?.current_streak || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Day Streak
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={1000}>
            <Card className="dashboard-card" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Star color="warning" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats?.level || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current Level
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={1100}>
            <Card className="dashboard-card" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmojiEvents color="secondary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" color="secondary.main">
                  {stats?.total_points || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Points
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Learning Progress */}
        <Grid item xs={12} md={8}>
          <Fade in timeout={1200}>
            <Card className="dashboard-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Learning Progress</Typography>
                  <Button component={Link} to="/chat" variant="outlined" size="small">
                    Start Learning
                  </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                  {progressData.map((item, index) => (
                    <Grow key={item.subject} in timeout={1300 + index * 100}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" textTransform="capitalize">
                            {item.subject}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: item.color,
                            }
                          }}
                        />
                      </Box>
                    </Grow>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['Mathematics', 'Physics', 'Chemistry'].map((subject, index) => (
                    <Fade key={subject} in timeout={1400 + index * 50}>
                      <Chip
                        label={subject}
                        variant="outlined"
                        size="small"
                        component={Link}
                        to="/chat"
                        clickable
                        sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                      />
                    </Fade>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Recent Badges & Quick Actions */}
        <Grid item xs={12} md={4}>
          <Fade in timeout={1500}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Achievements
                </Typography>

                {recentBadges.map((badge, index) => (
                  <Grow key={badge.name} in timeout={1600 + index * 100}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        {badge.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {badge.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {badge.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grow>
                ))}

                <Button
                  component={Link}
                  to="/badges"
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  View All Badges
                </Button>
              </CardContent>
            </Card>
          </Fade>

          {/* Quick Actions */}
          <Fade in timeout={1700}>
            <Card className="dashboard-card" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>

                <Button
                  component={Link}
                  to="/chat"
                  variant="contained"
                  fullWidth
                  startIcon={<Chat />}
                  sx={{ mb: 2 }}
                >
                  Start New Chat
                </Button>

                <Button
                  component={Link}
                  to="/leaderboard"
                  variant="outlined"
                  fullWidth
                  startIcon={<EmojiEvents />}
                  sx={{ mb: 2 }}
                >
                  View Leaderboard
                </Button>

                {user?.role === 'teacher' && (
                  <Button
                    component={Link}
                    to="/teacher"
                    variant="outlined"
                    fullWidth
                    startIcon={<School />}
                  >
                    Teacher Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
