import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Calendar, Shield, Eye, EyeOff, Upload, Trash2, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import Navigation from '@/components/Navigation';
import { z } from 'zod';

// Validation schemas
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').trim(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, deleteAvatar, uploading } = useAvatarUpload();

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

    // Validate profile data
    try {
      profileSchema.parse({
        full_name: profile.full_name,
        bio: profile.bio || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const publicUrl = await uploadAvatar(file, user.id);

    if (publicUrl) {
      setProfile({ ...profile, avatar_url: publicUrl });
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          avatar_url: publicUrl,
        });

      if (error) {
        toast({
          title: "Error updating avatar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Avatar updated",
          description: "Your avatar has been successfully updated.",
        });
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;

    const success = await deleteAvatar(user.id);
    
    if (success) {
      setProfile({ ...profile, avatar_url: '' });
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          avatar_url: null,
        });

      if (error) {
        toast({
          title: "Error removing avatar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Avatar removed",
          description: "Your avatar has been successfully removed.",
        });
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Delete user's avatar
      await deleteAvatar(user.id);

      // Note: Full account deletion requires admin privileges
      // For now, we'll sign out and instruct user to contact support
      toast({
        title: "Account Deletion Request",
        description: "Please contact support to complete account deletion. You have been signed out.",
      });

      await signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error processing request",
        description: error.message || "Please contact support for assistance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
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
              <div className="relative group">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-apple rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                  {profile.avatar_url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={handleAvatarDelete}
                      disabled={uploading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
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
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="glass border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground min-h-[100px]"
                    placeholder="Tell us about yourself"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {profile.bio?.length || 0}/500
                  </p>
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
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full glass border-white/20 hover:bg-white/20"
                >
                  Sign Out
                </Button>
                
                <Separator className="bg-white/20" />
                
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass border-white/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers, including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Your profile information</li>
                          <li>Your stores and products</li>
                          <li>Your orders and subscriptions</li>
                          <li>All uploaded files</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="glass border-white/20">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isLoading ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;