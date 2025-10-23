import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock leaderboard data - in real app, this would come from API
  const leaderboard = [
    {
      rank: 1,
      user: { username: 'math_wizard', full_name: 'Alice Johnson' },
      stats: { level: 12, total_points: 2850, current_streak: 15, badges_count: 8 },
      is_current_user: false,
    },
    {
      rank: 2,
      user: { username: 'science_guru', full_name: 'Bob Smith' },
      stats: { level: 11, total_points: 2720, current_streak: 12, badges_count: 7 },
      is_current_user: false,
    },
    {
      rank: 3,
      user: { username: 'study_master', full_name: 'Carol Davis' },
      stats: { level: 10, total_points: 2580, current_streak: 9, badges_count: 6 },
      is_current_user: false,
    },
    {
      rank: 4,
      user: { username: 'learn_fast', full_name: 'David Wilson' },
      stats: { level: 9, total_points: 2400, current_streak: 8, badges_count: 5 },
      is_current_user: false,
    },
    {
      rank: 5,
      user: { username: user?.username || 'you', full_name: user?.full_name || 'You' },
      stats: { level: 5, total_points: 1250, current_streak: 7, badges_count: 3 },
      is_current_user: true,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'warning.main';
      case 2:
        return 'grey.400';
      case 3:
        return '#cd7f32';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏆 Leaderboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          See how you rank against other learners and track your progress!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Top 3 Podium */}
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                Top Performers This Week
              </Typography>

              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'end',
                gap: 2,
                mt: 3,
                mb: 2,
              }}>
                {/* 2nd Place */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    height: 120,
                    width: 100,
                    bgcolor: 'grey.200',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'end',
                    alignItems: 'center',
                    pb: 1,
                  }}>
                    <Typography variant="h5">🥈</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {leaderboard[1].user.full_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {leaderboard[1].stats.total_points} pts
                    </Typography>
                  </Box>
                </Box>

                {/* 1st Place */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    height: 160,
                    width: 100,
                    bgcolor: 'warning.light',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'end',
                    alignItems: 'center',
                    pb: 1,
                    border: '2px solid',
                    borderColor: 'warning.main',
                  }}>
                    <Typography variant="h4">🥇</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {leaderboard[0].user.full_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {leaderboard[0].stats.total_points} pts
                    </Typography>
                  </Box>
                </Box>

                {/* 3rd Place */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    height: 100,
                    width: 100,
                    bgcolor: '#cd7f32',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'end',
                    alignItems: 'center',
                    pb: 1,
                    opacity: 0.8,
                  }}>
                    <Typography variant="h5">🥉</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {leaderboard[2].user.full_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {leaderboard[2].stats.total_points} pts
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Full Leaderboard */}
        <Grid item xs={12} md={8}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Full Rankings
              </Typography>

              <Box sx={{ mt: 2 }}>
                {leaderboard.map((entry) => (
                  <Box
                    key={entry.rank}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: entry.is_current_user ? 'primary.light' : 'background.paper',
                      border: entry.is_current_user ? '2px solid' : '1px solid',
                      borderColor: entry.is_current_user ? 'primary.main' : 'divider',
                    }}
                  >
                    <Box sx={{ width: 60, textAlign: 'center' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: entry.rank <= 3 ? getRankColor(entry.rank) : 'text.primary',
                          fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                        }}
                      >
                        {getRankIcon(entry.rank)}
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: entry.is_current_user ? 'primary.main' : 'grey.300',
                      }}
                    >
                      {entry.user.full_name.charAt(0)}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {entry.user.full_name}
                        {entry.is_current_user && (
                          <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        @{entry.user.username}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="medium">
                          Level {entry.stats.level}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Level
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.stats.total_points}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Points
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.stats.current_streak}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Streak
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.stats.badges_count}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Badges
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Your Stats */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Performance
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Rank</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    #5
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Points</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    1,250
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Streak</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    7 days
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Level</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    5
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Badges Earned</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    3
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary">
                Points to next rank: 150
              </Typography>

              <LinearProgress
                variant="determinate"
                value={75}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="dashboard-card" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Star sx={{ color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Week Warrior
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      7-day learning streak
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <EmojiEvents sx={{ color: 'warning.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Math Whiz
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Mastered basic algebra
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Person sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      First Steps
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Completed first lesson
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LeaderboardPage;
