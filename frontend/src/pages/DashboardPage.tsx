import React from 'react';
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
} from '@mui/material';
import {
  Chat,
  EmojiEvents,
  TrendingUp,
  AccessTime,
  School,
  Star,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = {
    totalSessions: 24,
    currentStreak: 7,
    level: 5,
    points: 1250,
    recentSubjects: ['Mathematics', 'Physics', 'Chemistry'],
    progress: {
      mathematics: 75,
      physics: 60,
      chemistry: 45,
    },
  };

  const recentBadges = [
    { name: 'First Steps', description: 'Completed your first lesson', icon: '🎯' },
    { name: 'Math Whiz', description: 'Mastered basic algebra', icon: '🧮' },
    { name: 'Week Warrior', description: '7-day learning streak', icon: '🔥' },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.full_name || user?.username}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Ready to continue your learning journey?
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Chat color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalSessions}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chat Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {stats.currentStreak}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Day Streak
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Star color="warning" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.level}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Current Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents color="secondary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {stats.points}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Learning Progress */}
        <Grid item xs={12} md={8}>
          <Card className="dashboard-card">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Learning Progress</Typography>
                <Button component={Link} to="/chat" variant="outlined" size="small">
                  Start Learning
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                {Object.entries(stats.progress).map(([subject, progress]) => (
                  <Box key={subject} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" textTransform="capitalize">
                        {subject}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {stats.recentSubjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    variant="outlined"
                    size="small"
                    component={Link}
                    to="/chat"
                    clickable
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Badges & Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>

              {recentBadges.map((badge, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

          {/* Quick Actions */}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
