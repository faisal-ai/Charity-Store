# Firebase Hosting Deployment Guide

## Your Domain: bu-mentoring.org.uk

## Step-by-Step Deployment Instructions

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window. Login with the Google account that has access to the "bu-mentoring" Firebase project.

### 3. Deploy Your Website

From this directory, run:

```bash
firebase deploy --only hosting
```

Your website will be live at: **https://bu-mentoring.web.app**

### 4. Connect Your Custom Domain (bu-mentoring.org.uk)

#### A. In Firebase Console:

1. Go to https://console.firebase.google.com/project/bu-mentoring/hosting
2. Click "Add custom domain"
3. Enter: **bu-mentoring.org.uk**
4. Firebase will provide you with DNS records to add

#### B. In Hostinger (DNS Settings):

1. Login to Hostinger: https://hpanel.hostinger.com
2. Go to: Domains → bu-mentoring.org.uk → DNS / Name Servers
3. Add the DNS records that Firebase provides:

**You'll need to add these records (Firebase will give you the exact values):**

- **A Record:**
  - Type: A
  - Name: @
  - Value: (Firebase will provide the IP addresses)

- **TXT Record (for verification):**
  - Type: TXT
  - Name: @
  - Value: (Firebase verification code)

**Example records you might see:**
```
A Record:    @    →   151.101.1.195
A Record:    @    →   151.101.65.195
TXT Record:  @    →   google-site-verification=xxxxxxxxxxxxx
```

### 5. Wait for DNS Propagation

- DNS changes can take 24-48 hours to fully propagate
- Firebase will automatically provision an SSL certificate for your domain
- You can check the status in the Firebase Console

### 6. Set www subdomain (Optional)

If you want **www.bu-mentoring.org.uk** to work:

1. In Firebase Console, add "www.bu-mentoring.org.uk" as a custom domain
2. In Hostinger DNS, add:
   - CNAME Record: www → bu-mentoring.web.app

## Future Deployments

Whenever you make changes to your website:

```bash
firebase deploy --only hosting
```

That's it! Your changes will be live in seconds.

## Troubleshooting

- **Domain not connecting?** Check DNS records in Hostinger match Firebase exactly
- **SSL certificate pending?** Wait 24 hours for DNS propagation
- **Deployment errors?** Make sure you're logged in: `firebase login`

## Your Website URLs

- **Temporary URL:** https://bu-mentoring.web.app
- **Your Domain:** https://bu-mentoring.org.uk (after DNS setup)
- **Firebase Console:** https://console.firebase.google.com/project/bu-mentoring

## Important Notes

✅ Firebase Hosting is FREE (generous free tier)
✅ Automatic SSL certificate
✅ Global CDN (fast worldwide)
✅ Unlimited deployments
✅ No server maintenance needed
