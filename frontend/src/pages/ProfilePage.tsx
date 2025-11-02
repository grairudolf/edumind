import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Alert,
  Fade,
  Grow,
  Slide,
  Zoom,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  School,
  Psychology,
  Language,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    language_preference: user?.language_preference || 'en',
    learning_style: user?.learning_style || 'visual',
    school: user?.school || '',
    grade_level: user?.grade_level || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string) => (e: any) => {
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      language_preference: user?.language_preference || 'en',
      learning_style: user?.learning_style || 'visual',
      school: user?.school || '',
      grade_level: user?.grade_level || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Fade in>
          <Alert severity="error">Please log in to view your profile.</Alert>
        </Fade>
      </Container>
    );
  }

  // Mock statistics data - in real app, this would come from API
  const stats = {
    totalSessions: 24,
    currentStreak: 7,
    level: 5,
    totalPoints: 1250,
    averageAccuracy: 85,
    totalTimeSpent: 48, // hours
    favoriteSubject: 'Mathematics',
  };

  const achievements = [
    { name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', color: 'error' },
    { name: 'Math Whiz', description: 'Mastered basic algebra', icon: '🧮', color: 'warning' },
    { name: 'First Steps', description: 'Completed first lesson', icon: '🎯', color: 'info' },
  ];

  return (
    <Container maxWidth="lg">
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            👤 Profile Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your account settings and learning preferences
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={800}>
        <Alert severity="success" sx={{ mb: 2, display: success ? 'flex' : 'none' }}>
          {success}
        </Alert>
      </Fade>

      <Fade in timeout={800}>
        <Alert severity="error" sx={{ mb: 2, display: error ? 'flex' : 'none' }}>
          {error}
        </Alert>
      </Fade>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Slide direction="up" in timeout={1000}>
            <Card className="dashboard-card" sx={{ position: 'sticky', top: 20 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                </Avatar>

                <Typography variant="h6" gutterBottom>
                  {user.full_name || user.username}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {user.email}
                </Typography>

                <Chip
                  label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {user.grade_level && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {user.grade_level}
                      </Typography>
                    </Box>
                  )}

                  {user.school && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {user.school}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology color="primary" />
                    <Typography variant="body2" color="textSecondary">
                      {formData.learning_style.charAt(0).toUpperCase() + formData.learning_style.slice(1)} Learner
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language color="primary" />
                    <Typography variant="body2" color="textSecondary">
                      {formData.language_preference.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Profile Settings */}
        <Grid item xs={12} md={8}>
          <Zoom in timeout={1200}>
            <Card className="dashboard-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Account Information</Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      variant="outlined"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Box>
                      <Button
                        startIcon={loading ? <LoadingSpinner size={16} /> : <Save />}
                        onClick={handleSave}
                        variant="contained"
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="School"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Grade Level"
                      name="grade_level"
                      value={formData.grade_level}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!isEditing || loading}>
                      <InputLabel>Preferred Language</InputLabel>
                      <Select
                        value={formData.language_preference}
                        label="Preferred Language"
                        onChange={handleSelectChange('language_preference')}
                        disabled={!isEditing || loading}
                      >
                        <MenuItem value="en">🇺🇸 English</MenuItem>
                        <MenuItem value="fr">🇫🇷 French</MenuItem>
                        <MenuItem value="pidgin">🇳🇬 Pidgin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Learning Style
                    </Typography>
                    <RadioGroup
                      row
                      name="learning_style"
                      value={formData.learning_style}
                      onChange={handleChange}
                      sx={{ ml: 1 }}
                    >
                      <FormControlLabel
                        value="visual"
                        control={<Radio />}
                        label="👁️ Visual"
                        disabled={!isEditing || loading}
                      />
                      <FormControlLabel
                        value="auditory"
                        control={<Radio />}
                        label="👂 Auditory"
                        disabled={!isEditing || loading}
                      />
                      <FormControlLabel
                        value="kinesthetic"
                        control={<Radio />}
                        label="🤚 Hands-on"
                        disabled={!isEditing || loading}
                      />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Account Statistics */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1400}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Learning Statistics
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                      <Typography variant="h4" color="primary.contrastText">
                        {stats.totalSessions}
                      </Typography>
                      <Typography variant="body2" color="primary.contrastText">
                        Sessions
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                      <Typography variant="h4" color="success.contrastText">
                        {stats.currentStreak}
                      </Typography>
                      <Typography variant="body2" color="success.contrastText">
                        Day Streak
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                      <Typography variant="h4" color="warning.contrastText">
                        {stats.level}
                      </Typography>
                      <Typography variant="body2" color="warning.contrastText">
                        Level
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
                      <Typography variant="h4" color="secondary.contrastText">
                        {stats.totalPoints.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="secondary.contrastText">
                        Points
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Progress to Level {stats.level + 1}</Typography>
                    <Typography variant="body2" color="textSecondary">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1600}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 Recent Achievements
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {achievements.map((achievement, index) => (
                    <Grow key={achievement.name} in timeout={1800 + index * 200}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: `${achievement.color}.light`,
                        border: '1px solid',
                        borderColor: `${achievement.color}.main`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateX(4px)' },
                      }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: `${achievement.color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                        }}>
                          {achievement.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {achievement.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {achievement.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grow>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
