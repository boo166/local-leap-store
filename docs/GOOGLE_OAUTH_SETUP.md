# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for your GlassStore marketplace application.

## Prerequisites

- A Google Cloud Platform account
- Access to your Supabase project dashboard
- Your production domain (if deploying)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `GlassStore Marketplace` (or your app name)
4. Click "Create"
5. Wait for project creation to complete

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have Google Workspace)
3. Click **Create**

### Fill in the consent screen details:

**App information:**
- App name: `GlassStore Marketplace`
- User support email: Your email address
- App logo: Upload your app logo (optional but recommended)

**App domain:**
- Application home page: `https://yourdomain.com`
- Privacy policy: `https://yourdomain.com/privacy`
- Terms of service: `https://yourdomain.com/terms`

**Authorized domains:**
Add these domains:
- `yourdomain.com` (your production domain)
- `kdphniutgqhqlundaqqi.supabase.co` (your Supabase project domain)

**Developer contact information:**
- Email addresses: Your email

4. Click **Save and Continue**

### Configure Scopes:

1. Click **Add or Remove Scopes**
2. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
3. Click **Update**
4. Click **Save and Continue**

### Test users (for development):
1. Add your email address
2. Click **Save and Continue**

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**

**Name your client:**
- Name: `GlassStore Marketplace - Production`

**Authorized JavaScript origins:**
Add these URLs (one per line):
- `https://yourdomain.com`
- `http://localhost:8080` (for local testing)
- `https://staging.yourdomain.com` (if you have staging)

**Authorized redirect URIs:**
Add these URLs:
- `https://kdphniutgqhqlundaqqi.supabase.co/auth/v1/callback`
- `https://yourdomain.com/auth/callback`
- `http://localhost:8080/auth/callback` (for local testing)

4. Click **Create**
5. **Save your credentials:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxx`

⚠️ **IMPORTANT**: Keep your Client Secret secure! Never commit it to version control.

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/kdphniutgqhqlundaqqi)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** provider and click to expand

**Configure Google provider:**
- **Enabled**: Toggle ON
- **Client ID**: Paste your Google Client ID
- **Client Secret**: Paste your Google Client Secret
- **Redirect URL**: Already set to `https://kdphniutgqhqlundaqqi.supabase.co/auth/v1/callback`

4. Click **Save**

## Step 5: Set Site URL and Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**

**Site URL:**
- Set to: `https://yourdomain.com`
- For development: `http://localhost:8080`

**Redirect URLs:**
Add all valid redirect URLs (one per line):
```
https://yourdomain.com/**
https://kdphniutgqhqlundaqqi.supabase.co/**
http://localhost:8080/**
https://staging.yourdomain.com/**
```

2. Click **Save**

## Step 6: Test the Integration

### Local Testing:

1. Run your app locally: `npm run dev`
2. Go to `http://localhost:8080/auth`
3. Click "Sign in with Google"
4. Select your Google account
5. Grant permissions
6. Verify you're redirected back and logged in

### Common Issues:

**Error: "redirect_uri_mismatch"**
- Check that your redirect URI in Google Console matches exactly with Supabase
- Make sure there are no trailing slashes

**Error: "Access blocked: This app's request is invalid"**
- Verify your authorized domains in OAuth consent screen
- Check that all domains are added without `http://` or `https://`

**Error: "requested path is invalid"**
- Site URL not set correctly in Supabase
- Redirect URLs not configured properly

## Step 7: Production Deployment

Before deploying to production:

1. **Update Google OAuth Credentials:**
   - Add your production domain to Authorized JavaScript origins
   - Add your production redirect URI

2. **Update Supabase:**
   - Change Site URL to production domain
   - Add production redirect URL

3. **Verify Consent Screen:**
   - Make sure privacy policy and terms of service are accessible
   - Test the OAuth flow from production

4. **Request Verification (Optional):**
   - For apps with many users, submit for Google verification
   - Go to OAuth consent screen → Click "Publish App"
   - Submit verification request if needed

## Security Best Practices

1. ✅ **Never expose Client Secret**: Keep it in Supabase secrets only
2. ✅ **Use HTTPS in production**: Always use secure connections
3. ✅ **Limit redirect URIs**: Only add domains you control
4. ✅ **Rotate secrets regularly**: Update credentials periodically
5. ✅ **Monitor suspicious activity**: Check Google Cloud Console logs
6. ✅ **Implement rate limiting**: Prevent OAuth abuse

## Troubleshooting

### Users can't sign in after first time

**Solution**: Make sure session management is working correctly. Check:
- Supabase client is configured with persistent sessions
- Auth context maintains session state
- No conflicting logout logic

### Google login works locally but not in production

**Solution**: 
1. Check Site URL in Supabase matches production domain
2. Verify redirect URLs include production domain
3. Check CORS settings
4. Ensure HTTPS is enforced

### "This app is not verified" warning

**Solution**:
- This is normal for new apps
- Users can still proceed by clicking "Advanced" → "Go to [Your App]"
- To remove: Submit app for Google verification (takes 4-6 weeks)

## Advanced Configuration

### Custom OAuth Scopes

If you need additional permissions:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'profile email https://www.googleapis.com/auth/calendar.readonly',
    redirectTo: `${window.location.origin}/`,
  },
});
```

### Handle OAuth Errors

```typescript
const handleGoogleSignIn = async () => {
  try {
    const { data, error } = await signInWithGoogle();
    
    if (error) {
      // Check for specific errors
      if (error.message.includes('popup_closed_by_user')) {
        toast({ title: "Sign-in cancelled" });
      } else if (error.message.includes('access_denied')) {
        toast({ title: "Access denied", description: "Please grant permissions" });
      } else {
        toast({ title: "Sign-in failed", description: error.message });
      }
    }
  } catch (error) {
    console.error('OAuth error:', error);
  }
};
```

## Monitoring and Analytics

Track Google OAuth usage:
1. Go to Google Cloud Console → APIs & Services → Dashboard
2. View OAuth metrics
3. Monitor quota usage
4. Check for errors or abuse

## Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GlassStore Support](mailto:support@yourdomain.com)

---

**Last Updated**: 2025-11-20
**Project ID**: kdphniutgqhqlundaqqi
**Status**: Ready for configuration
