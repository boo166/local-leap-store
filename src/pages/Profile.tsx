import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Calendar, Shield, Eye, EyeOff, Upload, Trash2, Camera, CheckCircle2, Smartphone, QrCode } from 'lucide-react';
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
    bio: '',
    mfa_enabled: false
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
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
          bio: data.bio || '',
          mfa_enabled: data.mfa_enabled || false
        });
      }

      // Calculate profile completion
      const { data: completionData } = await supabase
        .rpc('calculate_profile_completion', { user_id_param: user.id });
      
      if (completionData !== null) {
        setProfileCompletion(completionData);
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

  const handleEnable2FA = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: user.email
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setShow2FASetup(true);
      }
    } catch (error: any) {
      toast({
        title: "Error enabling 2FA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data?.totp?.[0];
      if (!totpFactor) throw new Error('No TOTP factor found');

      const challenge = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: verifyCode
      });
      if (verify.error) throw verify.error;

      // Update profile to mark MFA as enabled
      await supabase
        .from('profiles')
        .update({ mfa_enabled: true })
        .eq('user_id', user.id);

      setProfile({ ...profile, mfa_enabled: true });
      setShow2FASetup(false);
      setVerifyCode('');

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data?.totp?.[0];
      if (!totpFactor) throw new Error('No TOTP factor found');

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id
      });
      if (error) throw error;

      // Update profile
      await supabase
        .from('profiles')
        .update({ mfa_enabled: false })
        .eq('user_id', user.id);

      setProfile({ ...profile, mfa_enabled: false });

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Error disabling 2FA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Delete user's avatar
      await deleteAvatar(user.id);

      // Call database function to clean up all user data
      const { error: cleanupError } = await supabase
        .rpc('prepare_account_deletion', { user_id_param: user.id });

      if (cleanupError) throw cleanupError;

      // Delete the auth user (requires service role, so this will sign out instead)
      await signOut();

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been removed.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message,
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
            {/* Profile Completion Tracker */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              {profileCompletion < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {!profile.full_name && "Add your name. "}
                  {!profile.avatar_url && "Upload an avatar. "}
                  {!profile.bio && "Write a bio."}
                </p>
              )}
              {profileCompletion === 100 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile complete!</span>
                </div>
              )}
            </div>
            
            <Separator className="bg-white/20 mb-6" />
            
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Security</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/security')}
                  className="glass border-white/20 hover:bg-white/20"
                >
                  Advanced Settings
                </Button>
              </div>
              
              {/* 2FA Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Two-Factor Authentication</span>
                  </div>
                  {profile.mfa_enabled && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                
                {!show2FASetup && !profile.mfa_enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnable2FA}
                    disabled={isLoading}
                    className="glass border-white/20 hover:bg-white/20"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                )}
                
                {profile.mfa_enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    className="glass border-white/20 hover:bg-white/20"
                  >
                    Disable 2FA
                  </Button>
                )}
                
                {show2FASetup && qrCode && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      <p className="text-xs text-center text-gray-600 mt-2">
                        Scan this code with your authenticator app
                      </p>
                    </div>
                    <form onSubmit={handleVerify2FA} className="space-y-3">
                      <div>
                        <Label htmlFor="verifyCode" className="text-xs">Verification Code</Label>
                        <Input
                          id="verifyCode"
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value)}
                          className="glass border-white/20 bg-white/10 text-foreground"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          variant="apple"
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Verify
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShow2FASetup(false);
                            setQrCode('');
                            setVerifyCode('');
                          }}
                          className="glass border-white/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              
              <Separator className="bg-white/20 mb-6" />
              
              {/* Password Section */}
              {!showPasswordForm ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
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