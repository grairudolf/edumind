import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  School,
  People,
  Chat,
  TrendingUp,
  Assignment,
  Analytics,
} from '@mui/icons-material';

const TeacherDashboardPage: React.FC = () => {
  // Mock data - in real app, this would come from API
  const dashboardData = {
    overview: {
      total_students: 25,
      active_students: 18,
      total_sessions: 156,
      average_engagement: 0.78,
    },
    top_subjects: [
      { subject: 'Mathematics', sessions: 45, avg_score: 0.82 },
      { subject: 'Physics', sessions: 32, avg_score: 0.75 },
      { subject: 'Chemistry', sessions: 28, avg_score: 0.69 },
    ],
    recent_activity: [
      { student: 'John Doe', action: 'Completed algebra topic', timestamp: '2 hours ago' },
      { student: 'Jane Smith', action: 'Started physics session', timestamp: '4 hours ago' },
      { student: 'Bob Wilson', action: 'Earned Math Whiz badge', timestamp: '6 hours ago' },
    ],
    students: [
      {
        id: 1,
        username: 'student1',
        full_name: 'John Doe',
        grade_level: 'Grade 10',
        last_active: '2 hours ago',
        progress: 0.75,
        weak_subjects: ['Physics'],
        strong_subjects: ['Mathematics', 'Chemistry'],
      },
      {
        id: 2,
        username: 'student2',
        full_name: 'Jane Smith',
        grade_level: 'Grade 11',
        last_active: '1 day ago',
        progress: 0.68,
        weak_subjects: ['Mathematics'],
        strong_subjects: ['Biology', 'Chemistry'],
      },
    ],
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          👨‍🏫 Teacher Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Monitor your students' progress and manage their learning journey
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="dashboard-card">
                <CardContent sx={{ textAlign: 'center' }}>
                  <People color="primary" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {dashboardData.overview.total_students}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="dashboard-card">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp color="success" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {dashboardData.overview.active_students}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="dashboard-card">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Chat color="info" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {dashboardData.overview.total_sessions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Sessions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="dashboard-card">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Analytics color="warning" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {Math.round(dashboardData.overview.average_engagement * 100)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Engagement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Subject Performance */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subject Performance
              </Typography>

              {dashboardData.top_subjects.map((subject, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {subject.subject}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {subject.sessions} sessions
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={subject.avg_score * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {Math.round(subject.avg_score * 100)}% average score
                  </Typography>
                </Box>
              ))}

              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View Detailed Reports
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Student Activity
              </Typography>

              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {dashboardData.recent_activity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderBottom: index < dashboardData.recent_activity.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                      {activity.student.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.student}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {activity.action}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {activity.timestamp}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Student Progress */}
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Student Progress Overview
                </Typography>
                <Button variant="outlined" startIcon={<Assignment />}>
                  Create Assignment
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Strong Subjects</TableCell>
                      <TableCell>Needs Help</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                              {student.full_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.full_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                @{student.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{student.grade_level}</TableCell>
                        <TableCell>{student.last_active}</TableCell>
                        <TableCell>
                          <Box sx={{ minWidth: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.progress * 100}
                              sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {Math.round(student.progress * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {student.strong_subjects.map((subject) => (
                              <Chip key={subject} label={subject} size="small" color="success" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {student.weak_subjects.map((subject) => (
                              <Chip key={subject} label={subject} size="small" color="warning" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Assignment />}
                    sx={{ py: 2 }}
                  >
                    Create Assignment
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Analytics />}
                    sx={{ py: 2 }}
                  >
                    Generate Report
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Chat />}
                    sx={{ py: 2 }}
                  >
                    Message Students
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<School />}
                    sx={{ py: 2 }}
                  >
                    Manage Classes
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboardPage;
