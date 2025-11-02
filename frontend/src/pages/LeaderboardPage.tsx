import React, { useState, useEffect } from 'react';
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
  Fade,
  Grow,
  Zoom,
  Badge,
  Slide,
  Tabs,
  Tab,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  Person,
  MilitaryTech as Medal,
  WorkspacePremium as Award,
  LocalFireDepartment as LocalFire,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/apiService';
import { LeaderboardResponse } from '../types';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await apiService.getLeaderboard();
        setLeaderboardData(response);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Fallback to mock data
        const mockData: LeaderboardResponse = {
          user_rank: 5,
          leaderboard: [
            {
              rank: 1,
              user: { id: 1, username: 'math_wizard', full_name: 'Alice Johnson' },
              stats: { level: 12, total_points: 2850, current_streak: 15, badges_count: 8 },
              is_current_user: false,
            },
            {
              rank: 2,
              user: { id: 2, username: 'science_guru', full_name: 'Bob Smith' },
              stats: { level: 11, total_points: 2720, current_streak: 12, badges_count: 7 },
              is_current_user: false,
            },
            {
              rank: 3,
              user: { id: 3, username: 'study_master', full_name: 'Carol Davis' },
              stats: { level: 10, total_points: 2580, current_streak: 9, badges_count: 6 },
              is_current_user: false,
            },
            {
              rank: 4,
              user: { id: 4, username: 'learn_fast', full_name: 'David Wilson' },
              stats: { level: 9, total_points: 2400, current_streak: 8, badges_count: 5 },
              is_current_user: false,
            },
            {
              rank: 5,
              user: { id: user?.id || 1, username: user?.username || 'you', full_name: user?.full_name || 'You' },
              stats: { level: 5, total_points: 1250, current_streak: 7, badges_count: 3 },
              is_current_user: true,
            },
          ],
        };
        setLeaderboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: 'warning.main' }} />;
      case 2:
        return <Medal sx={{ color: 'grey.400' }} />;
      case 3:
        return <Award sx={{ color: '#cd7f32' }} />;
      default:
        return <Typography variant="h6">#{rank}</Typography>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'warning';
      case 2:
        return 'default';
      case 3:
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading leaderboard..." />;
  }

  const currentUserEntry = leaderboardData?.leaderboard.find(entry => entry.is_current_user);
  const topThree = leaderboardData?.leaderboard.slice(0, 3) || [];

  return (
    <Container maxWidth="lg">
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🏆 Leaderboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            See how you rank against other learners and track your progress!
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Top 3 Podium */}
        <Grid item xs={12}>
          <Zoom in timeout={800}>
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
                  {topThree[1] && (
                    <Grow in timeout={1000}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{
                          height: 120,
                          width: 100,
                          bgcolor: 'grey.100',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'end',
                          alignItems: 'center',
                          pb: 1,
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)' },
                        }}>
                          <Typography variant="h5">🥈</Typography>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {topThree[1].user.full_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {topThree[1].stats.total_points} pts
                          </Typography>
                        </Box>
                      </Box>
                    </Grow>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <Grow in timeout={1200}>
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
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-8px) scale(1.05)' },
                          animation: 'pulse 2s infinite',
                        }}>
                          <Typography variant="h4">🥇</Typography>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {topThree[0].user.full_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {topThree[0].stats.total_points} pts
                          </Typography>
                        </Box>
                      </Box>
                    </Grow>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <Grow in timeout={1400}>
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
                          opacity: 0.9,
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)' },
                        }}>
                          <Typography variant="h5">🥉</Typography>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {topThree[2].user.full_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {topThree[2].stats.total_points} pts
                          </Typography>
                        </Box>
                      </Box>
                    </Grow>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Full Leaderboard */}
        <Grid item xs={12} md={8}>
          <Fade in timeout={1600}>
            <Card className="dashboard-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Full Rankings</Typography>
                  <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{ minHeight: 'auto' }}
                  >
                    <Tab label="This Week" sx={{ fontSize: '0.75rem', py: 1 }} />
                    <Tab label="This Month" sx={{ fontSize: '0.75rem', py: 1 }} />
                    <Tab label="All Time" sx={{ fontSize: '0.75rem', py: 1 }} />
                  </Tabs>
                </Box>

                <Box sx={{ mt: 2 }}>
                  {leaderboardData?.leaderboard.map((entry, index) => (
                    <Slide key={entry.rank} direction="right" in timeout={1800 + index * 100}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          bgcolor: entry.is_current_user ? 'primary.light' : 'background.paper',
                          border: entry.is_current_user ? '2px solid' : '1px solid',
                          borderColor: entry.is_current_user ? 'primary.main' : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Box sx={{ width: 60, textAlign: 'center' }}>
                          <Badge
                            badgeContent={getRankIcon(entry.rank)}
                            color={getRankBadgeColor(entry.rank) as any}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: 'transparent',
                                color: entry.rank <= 3 ? undefined : 'text.secondary',
                              }
                            }}
                          >
                            <Typography variant="h6" sx={{ visibility: 'hidden' }}>
                              {entry.rank}
                            </Typography>
                          </Badge>
                        </Box>

                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 2,
                            bgcolor: entry.is_current_user ? 'primary.main' : 'primary.light',
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
                          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                            <Typography variant="body2" fontWeight="medium">
                              Level {entry.stats.level}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Level
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {entry.stats.total_points.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Points
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <LocalFire sx={{ fontSize: 16, color: 'error.main' }} />
                              <Typography variant="body2" fontWeight="medium">
                                {entry.stats.current_streak}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Streak
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {entry.stats.badges_count}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Badges
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Slide>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Your Stats */}
        <Grid item xs={12} md={4}>
          <Fade in timeout={2000}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Performance
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Current Rank</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      #{currentUserEntry?.rank || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Points</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {currentUserEntry?.stats.total_points.toLocaleString() || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Current Streak</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {currentUserEntry?.stats.current_streak || 0} days
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Level</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {currentUserEntry?.stats.level || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Badges Earned</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {currentUserEntry?.stats.badges_count || 0}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Points to next rank: 150
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Fade>

          {/* Achievements */}
          <Fade in timeout={2200}>
            <Card className="dashboard-card" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Achievements
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grow in timeout={2400}>
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
                  </Grow>

                  <Grow in timeout={2600}>
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
                  </Grow>

                  <Grow in timeout={2800}>
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
                  </Grow>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LeaderboardPage;
