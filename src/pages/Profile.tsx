import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Calendar, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          ...profile,
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="glass text-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="glass border-white/20 p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gradient-apple rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  {profile.full_name || 'User'}
                </h3>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="glass border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              </div>
              
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="glass border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    type="text"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="glass border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <Button
                  type="submit"
                  variant="apple"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </Card>

            {/* Security Settings */}
            <Card className="glass border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
              </div>
              
              {!showPasswordForm ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                    className="glass border-white/20 hover:bg-white/20"
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={updatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="glass border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground pr-10"
                        placeholder="Enter new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="glass border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      variant="apple"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="glass border-white/20 hover:bg-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {/* Account Actions */}
            <Card className="glass border-white/20 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Account Actions</h2>
              <div className="space-y-3">
                <Separator className="bg-white/20" />
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;