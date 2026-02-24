// Email Notifications using EmailJS
// Configuration with EmailJS credentials
const EMAILJS_CONFIG = {
    publicKey: 'iw75HceBSdjXF__ac',
    serviceId: 'service_kns49lk',
    templates: {
        donationBooking: 'template_5dfb23v',
        mentoringBooking: 'YOUR_MENTORING_TEMPLATE_ID_HERE',  // Add your mentoring template ID here
        mentorApplication: 'YOUR_APPLICATION_TEMPLATE_ID_HERE'  // Add your application template ID here
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
            occupation: application.currentOccupation || application.occupation,
            yearsOfExperience: application.yearsExperience || application.yearsOfExperience,
            mentoringType: application.mentorType || (Array.isArray(application.mentoringType) ? application.mentoringType.join(', ') : application.mentoringType),
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
