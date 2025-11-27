import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  Activity, 
  Monitor, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Laptop,
  Smartphone,
  Tablet,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

const Security = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logs, loading: logsLoading } = useActivityLog();
  const { sessions, loading: sessionsLoading, revokeSession, revokeAllOtherSessions } = useSessionManagement();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Password changed',
        description: 'Your password has been successfully updated.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Globe className="h-4 w-4" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Laptop className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'auth': 'bg-blue-500',
      'profile': 'bg-green-500',
      'order': 'bg-purple-500',
      'payment': 'bg-yellow-500',
      'store': 'bg-orange-500',
      'product': 'bg-pink-500',
      'security': 'bg-red-500',
    };
    return colors[category.toLowerCase()] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'auth':
        return <Key className="h-3 w-3" />;
      case 'security':
        return <Shield className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-base py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="glass p-3 rounded-xl">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Security Settings</h1>
              <p className="text-muted-foreground">
                Manage your account security and monitor activity
              </p>
            </div>
          </div>

          <Tabs defaultValue="password" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="password">
                <Key className="h-4 w-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Monitor className="h-4 w-4 mr-2" />
                Active Sessions
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Activity Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Password must be at least 8 characters long and include a mix of letters and numbers.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>
                        Manage devices that are currently signed in to your account
                      </CardDescription>
                    </div>
                    {sessions.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={revokeAllOtherSessions}
                      >
                        Revoke All Others
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active sessions found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border border-primary/20 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {getDeviceIcon(session.user_agent)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {session.device_info?.browser || 'Unknown Browser'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {session.ip_address || 'Unknown IP'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Last active: {format(new Date(session.last_activity_at), 'PPp')}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    View your recent account activity and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading activity logs...
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity logs found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-4 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${getCategoryColor(log.activity_category)} text-white`}>
                            {getCategoryIcon(log.activity_category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.activity_type}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.activity_category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{format(new Date(log.created_at), 'PPp')}</span>
                              {log.ip_address && <span>IP: {log.ip_address}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Security;
