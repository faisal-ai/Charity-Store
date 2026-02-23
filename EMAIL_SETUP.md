# Email Notification Setup Guide for BU Mentoring

This document explains how to set up automatic email notifications for:
- Donation booking confirmations
- Mentoring session booking confirmations
- Mentor application confirmations

## Option 1: EmailJS (Recommended - Free & Easy)

EmailJS allows you to send emails directly from JavaScript without a backend server.

### Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Sign up for a free account (up to 200 emails/month)
3. Verify your email address

### Step 2: Set Up Email Service

1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Follow the authorization steps
5. Note your **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Templates

Create 3 email templates:

#### Template 1: Donation Booking Confirmation
- Go to "Email Templates" → "Create New Template"
- Template Name: `Donation Booking Confirmation`
- Note the **Template ID** (e.g., `template_xyz789`)
- Template Content:
```
Subject: Donation Booking Confirmed - BU Mentoring

Hi {{donorName}},

Thank you for booking a donation slot with BU Mentoring!

Booking Details:
- Date: {{preferredDate}}
- Time: {{preferredTime}}
- Items: {{donationTypes}}
- Estimated Bags: {{estimatedBags}}

We'll send you a reminder 24 hours before your appointment.

If you need to reschedule, please contact us at info@bumentoring.org or call (555) 123-4567.

Thank you for supporting our community!

Best regards,
BU Mentoring Team
```

#### Template 2: Mentoring Session Confirmation
- Template Name: `Mentoring Session Confirmation`
- Note the **Template ID**
- Template Content:
```
Subject: Mentoring Session Confirmed - BU Mentoring

Hi {{clientName}},

Your mentoring session has been confirmed!

Session Details:
- Mentor: {{mentorName}}
- Date: {{preferredDate}}
- Time: {{selectedTimeSlot}}
- Duration: {{sessionDuration}} minutes
- Format: {{sessionFormat}}
- Session Type: {{sessionType}}

{{#sessionFormat}}
{{#if online}}
Meeting link will be sent 1 hour before the session.
{{else}}
Location: BU Mentoring Center, 123 Charity Lane
{{/if}}
{{/sessionFormat}}

Please arrive 5 minutes early. If you need to reschedule, contact us at least 24 hours in advance.

We're excited to support your journey!

Best regards,
BU Mentoring Team
```

#### Template 3: Mentor Application Confirmation
- Template Name: `Mentor Application Confirmation`
- Note the **Template ID**
- Template Content:
```
Subject: Mentor Application Received - BU Mentoring

Hi {{fullName}},

Thank you for applying to become a mentor with BU Mentoring!

We have received your application and our team will review it within 3-5 business days.

Application Summary:
- Occupation: {{occupation}}
- Experience: {{yearsOfExperience}} years
- Mentoring Type: {{mentoringType}}
- Availability: {{availability}}

We'll contact you at {{email}} or {{phone}} once we've completed our review.

In the meantime, learn more about our programs at https://yourwebsite.com/programmes-resources.html

Thank you for your interest in empowering youth and transforming communities!

Best regards,
BU Mentoring Team
```

### Step 4: Get Your Public Key

1. Go to "Account" → "General"
2. Find your **Public Key** (e.g., `abc123XYZ`)
3. Copy it for use in the next step

### Step 5: Add EmailJS to Your Website

Add this script to your HTML files or create a new `js/emailNotifications.js` file:

```javascript
// Email Notifications using EmailJS
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY_HERE',
    serviceId: 'YOUR_SERVICE_ID_HERE',
    templates: {
        donationBooking: 'YOUR_DONATION_TEMPLATE_ID_HERE',
        mentoringBooking: 'YOUR_MENTORING_TEMPLATE_ID_HERE',
        mentorApplication: 'YOUR_APPLICATION_TEMPLATE_ID_HERE'
    }
};

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
})();

// Send donation booking confirmation email
async function sendDonationConfirmationEmail(booking) {
    try {
        const templateParams = {
            donorName: booking.donorName,
            donorEmail: booking.donorEmail,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime,
            donationTypes: Array.isArray(booking.donationTypes) ? booking.donationTypes.join(', ') : booking.donationTypes,
            estimatedBags: booking.estimatedBags,
            transportMethod: booking.transportMethod
        };

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.donationBooking,
            templateParams
        );

        console.log('✅ Donation confirmation email sent');
        return true;
    } catch (error) {
        console.error('❌ Error sending donation confirmation email:', error);
        return false;
    }
}

// Send mentoring session confirmation email
async function sendMentoringConfirmationEmail(booking, mentorName) {
    try {
        const templateParams = {
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            mentorName: mentorName,
            preferredDate: booking.preferredDate,
            selectedTimeSlot: booking.selectedTimeSlot,
            sessionDuration: booking.sessionDuration,
            sessionFormat: booking.sessionFormat,
            sessionType: booking.sessionType
        };

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.mentoringBooking,
            templateParams
        );

        console.log('✅ Mentoring confirmation email sent');
        return true;
    } catch (error) {
        console.error('❌ Error sending mentoring confirmation email:', error);
        return false;
    }
}

// Send mentor application confirmation email
async function sendMentorApplicationConfirmationEmail(application) {
    try {
        const templateParams = {
            fullName: application.fullName,
            email: application.email,
            phone: application.phone || 'Not provided',
            occupation: application.occupation,
            yearsOfExperience: application.yearsOfExperience,
            mentoringType: Array.isArray(application.mentoringType) ? application.mentoringType.join(', ') : application.mentoringType,
            availability: application.availability
        };

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.mentorApplication,
            templateParams
        );

        console.log('✅ Mentor application confirmation email sent');
        return true;
    } catch (error) {
        console.error('❌ Error sending application confirmation email:', error);
        return false;
    }
}
```

### Step 6: Integrate Email Notifications

#### In donate-booking.html:
Add EmailJS script in the `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script src="js/emailNotifications.js"></script>
```

Update the form submission to send email:
```javascript
// After successfully saving the booking
dataManager.addDonationBooking(bookingData).then(success => {
    if (success) {
        // Send confirmation email
        sendDonationConfirmationEmail(bookingData);

        // Show success message
        utils.showNotification('Booking confirmed! Check your email for details.', 'success');
    }
});
```

#### In mentoring-booking.html:
```javascript
// After successfully saving the booking
const mentor = dataManager.getMentorById(bookingData.mentorId);
dataManager.addMentoringBooking(bookingData).then(success => {
    if (success) {
        // Send confirmation email
        sendMentoringConfirmationEmail(bookingData, mentor.name);

        // Show success message
        utils.showNotification('Session booked! Check your email for details.', 'success');
    }
});
```

#### In mentor-application.html:
```javascript
// After successfully saving the application
dataManager.addMentorApplication(applicationData).then(success => {
    if (success) {
        // Send confirmation email
        sendMentorApplicationConfirmationEmail(applicationData);

        // Show success message
        utils.showNotification('Application submitted! Check your email for confirmation.', 'success');
    }
});
```

## Option 2: Firebase Cloud Functions (More Advanced)

If you want server-side email sending with better deliverability:

1. Enable Firebase Cloud Functions in your Firebase project
2. Install SendGrid or Mailgun
3. Create Cloud Functions to send emails
4. Trigger functions when documents are added to Firestore

This requires:
- Firebase Blaze plan (pay-as-you-go)
- SendGrid/Mailgun API key
- Node.js knowledge

## Testing Email Notifications

1. Submit a test form (donation booking, mentoring session, or mentor application)
2. Check the browser console for "✅ Email sent" message
3. Check your email inbox (and spam folder)
4. Verify all template variables are populated correctly

## Troubleshooting

### Emails not sending:
- Check EmailJS dashboard for quota limits
- Verify Service ID and Template IDs are correct
- Check browser console for errors
- Ensure EmailJS script is loaded before your custom script

### Template variables not showing:
- Variable names in template must match exactly (case-sensitive)
- Use `{{variableName}}` in templates
- Check console.log of templateParams to verify data

### Emails going to spam:
- Use a custom domain email (not Gmail/Yahoo)
- Add SPF and DKIM records to your domain
- Keep email content professional and avoid spam trigger words

## Email Limits

### EmailJS Free Plan:
- 200 emails/month
- 2 email services
- EmailJS branding in emails

### EmailJS Personal Plan ($7.50/month):
- 1,000 emails/month
- 5 email services
- No branding

## Security Note

Never commit your EmailJS Public Key, Service ID, or Template IDs to a public repository. Use environment variables or a config file that's gitignored.

## Support

For EmailJS support: https://www.emailjs.com/docs/
For Firebase Cloud Functions: https://firebase.google.com/docs/functions

---

**Note**: Email notifications are optional but highly recommended for better user experience. Users will receive immediate confirmation of their bookings/applications.
