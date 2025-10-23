import React, { useState } from 'react';
import {
  Container,
  Paper,
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
} from '@mui/material';
import { Person, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

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
        <Alert severity="error">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account settings and learning preferences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
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

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </Typography>

                {user.grade_level && (
                  <Typography variant="body2" color="textSecondary">
                    {user.grade_level}
                  </Typography>
                )}

                {user.school && (
                  <Typography variant="body2" color="textSecondary">
                    {user.school}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Settings */}
        <Grid item xs={12} md={8}>
          <Card>
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
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Save
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
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="pidgin">Pidgin</MenuItem>
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
                      label="Visual"
                      disabled={!isEditing || loading}
                    />
                    <FormControlLabel
                      value="auditory"
                      control={<Radio />}
                      label="Auditory"
                      disabled={!isEditing || loading}
                    />
                    <FormControlLabel
                      value="kinesthetic"
                      control={<Radio />}
                      label="Hands-on"
                      disabled={!isEditing || loading}
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Statistics
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      24
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chat Sessions
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main">
                      7
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Day Streak
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      5
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Level
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="secondary.main">
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
      </Grid>
    </Container>
  );
};

export default ProfilePage;
