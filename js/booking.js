/**
 * Booking System JavaScript
 * Handles donation slot booking and mentoring appointment booking
 */

// Initialize donation booking functionality
function initializeDonationBooking() {
    const form = document.getElementById('donation-booking-form');
    if (!form) return;

    // Set minimum date to today
    const dateInput = document.getElementById('preferred-date');
    const alternateInput = document.getElementById('alternate-date');
    const today = new Date().toISOString().split('T')[0];

    if (dateInput) {
        dateInput.min = today;
        dateInput.addEventListener('change', validateDonationDate);
    }

    if (alternateInput) {
        alternateInput.min = today;
    }

    // Form submission
    form.addEventListener('submit', handleDonationBooking);

    // Initialize validation
    initializeFormValidation(form);
}

// Initialize mentoring booking functionality
function initializeMentoringBooking() {
    const mentorsGrid = document.getElementById('mentors-grid');
    if (!mentorsGrid) return;

    // Load mentors
    loadMentors();

    // Form elements
    const form = document.getElementById('mentoring-booking-form');
    const dateInput = document.getElementById('preferred-date');

    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.addEventListener('change', loadAvailableTimeSlots);
    }

    if (form) {
        form.addEventListener('submit', handleMentoringBooking);
        initializeFormValidation(form);
    }
}

// Load mentors from data
function loadMentors() {
    const mentorsGrid = document.getElementById('mentors-grid');
    if (!mentorsGrid) return;

    const mentors = dataManager.getMentors();

    if (mentors.length === 0) {
        // Initialize sample mentors if none exist
        initializeSampleMentors();
        return loadMentors();
    }

    mentorsGrid.innerHTML = mentors.map(mentor => `
        <div class="mentor-card" data-mentor-id="${mentor.id}" onclick="selectMentor('${mentor.id}')">
            <div class="mentor-avatar">${mentor.avatar}</div>
            <h3>${mentor.name}</h3>
            <div class="mentor-speciality">${mentor.speciality}</div>
            <p class="mentor-bio">${mentor.bio}</p>
            <div class="mentor-rating">
                ${'★'.repeat(mentor.rating)}${'☆'.repeat(5 - mentor.rating)}
            </div>
            <div class="mentor-experience">${mentor.experience} years experience</div>
        </div>
    `).join('');
}

// Initialize sample mentors
function initializeSampleMentors() {
    const sampleMentors = [
        {
            name: "Sarah Johnson",
            speciality: "Career Development",
            bio: "Former HR executive with 15 years of experience helping people navigate career transitions and professional growth.",
            avatar: "👩‍💼",
            rating: 5,
            experience: 15,
            availability: {
                monday: ["09:00", "10:00", "14:00", "15:00"],
                tuesday: ["10:00", "11:00", "13:00", "16:00"],
                wednesday: ["09:00", "14:00", "15:00", "16:00"],
                thursday: ["10:00", "11:00", "14:00", "15:00"],
                friday: ["09:00", "10:00", "13:00", "14:00"],
                saturday: ["10:00", "11:00", "14:00"],
                sunday: []
            },
            active: true
        },
        {
            name: "Michael Chen",
            speciality: "Business & Entrepreneurship",
            bio: "Successful entrepreneur and business coach who has helped launch over 100 startups and small businesses.",
            avatar: "👨‍💻",
            rating: 5,
            experience: 12,
            availability: {
                monday: ["10:00", "11:00", "15:00", "16:00"],
                tuesday: ["09:00", "10:00", "14:00", "15:00"],
                wednesday: ["10:00", "11:00", "13:00", "14:00"],
                thursday: ["09:00", "15:00", "16:00"],
                friday: ["10:00", "11:00", "14:00", "15:00"],
                saturday: ["09:00", "10:00", "13:00"],
                sunday: []
            },
            active: true
        },
        {
            name: "Dr. Emily Rodriguez",
            speciality: "Personal Development",
            bio: "Licensed psychologist specializing in personal growth, confidence building, and life coaching for adults and teens.",
            avatar: "👩‍⚕️",
            rating: 5,
            experience: 18,
            availability: {
                monday: ["13:00", "14:00", "15:00", "16:00"],
                tuesday: ["09:00", "10:00", "13:00", "14:00"],
                wednesday: ["10:00", "11:00", "15:00", "16:00"],
                thursday: ["09:00", "10:00", "13:00", "14:00"],
                friday: ["10:00", "11:00", "15:00", "16:00"],
                saturday: ["10:00", "11:00", "14:00", "15:00"],
                sunday: ["14:00", "15:00", "16:00"]
            },
            active: true
        },
        {
            name: "James Wilson",
            speciality: "Skill Development",
            bio: "Technology professional and educator focused on helping people develop technical and soft skills for career advancement.",
            avatar: "👨‍🎓",
            rating: 4,
            experience: 10,
            availability: {
                monday: ["09:00", "10:00", "16:00", "17:00"],
                tuesday: ["10:00", "11:00", "15:00", "16:00"],
                wednesday: ["09:00", "13:00", "14:00", "17:00"],
                thursday: ["10:00", "11:00", "15:00", "16:00"],
                friday: ["09:00", "10:00", "13:00", "14:00"],
                saturday: ["13:00", "14:00", "15:00"],
                sunday: []
            },
            active: true
        },
        {
            name: "Lisa Thompson",
            speciality: "Interview Preparation",
            bio: "Recruitment specialist with expertise in interview coaching, resume writing, and job search strategies.",
            avatar: "👩‍🏫",
            rating: 5,
            experience: 8,
            availability: {
                monday: ["10:00", "11:00", "14:00", "15:00"],
                tuesday: ["09:00", "13:00", "14:00", "16:00"],
                wednesday: ["10:00", "11:00", "15:00", "16:00"],
                thursday: ["09:00", "10:00", "14:00", "15:00"],
                friday: ["11:00", "13:00", "15:00", "16:00"],
                saturday: ["10:00", "11:00"],
                sunday: []
            },
            active: true
        }
    ];

    sampleMentors.forEach(mentor => {
        dataManager.addMentor(mentor);
    });
}

// Select mentor
function selectMentor(mentorId) {
    const mentorCards = document.querySelectorAll('.mentor-card');
    const selectedCard = document.querySelector(`[data-mentor-id="${mentorId}"]`);
    const formContainer = document.getElementById('booking-form-container');
    const mentorNameSpan = document.getElementById('selected-mentor-name');
    const hiddenInput = document.getElementById('selected-mentor-id');

    // Remove previous selection
    mentorCards.forEach(card => card.classList.remove('selected'));

    // Add selection to clicked card
    if (selectedCard) {
        selectedCard.classList.add('selected');

        const mentor = dataManager.getMentorById(mentorId);
        if (mentor && mentorNameSpan) {
            mentorNameSpan.textContent = mentor.name;
            hiddenInput.value = mentorId;

            // Show booking form
            if (formContainer) {
                formContainer.style.display = 'block';
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
}

// Load available time slots for selected mentor and date
function loadAvailableTimeSlots() {
    const mentorId = document.getElementById('selected-mentor-id').value;
    const selectedDate = document.getElementById('preferred-date').value;
    const availabilitySection = document.getElementById('availability-section');
    const timeSlotsContainer = document.getElementById('time-slots');
    const selectedDateSpan = document.getElementById('selected-date');

    if (!mentorId || !selectedDate) {
        availabilitySection.classList.remove('show');
        return;
    }

    const mentor = dataManager.getMentorById(mentorId);
    const date = new Date(selectedDate);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

    if (!mentor || !mentor.availability[dayName]) {
        availabilitySection.classList.remove('show');
        return;
    }

    const availableSlots = mentor.availability[dayName];
    const existingBookings = dataManager.getMentoringBookings().filter(booking =>
        booking.mentorId === mentorId &&
        booking.preferredDate === selectedDate &&
        booking.status !== 'cancelled'
    );

    // Update selected date display
    selectedDateSpan.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate time slot HTML
    timeSlotsContainer.innerHTML = availableSlots.map(slot => {
        const timeSlot = `${slot}:00-${(parseInt(slot) + 1).toString().padStart(2, '0')}:00`;
        const isBooked = existingBookings.some(booking => booking.selectedTimeSlot === timeSlot);
        const slotClass = isBooked ? 'time-slot unavailable' : 'time-slot';
        const onClick = isBooked ? '' : `onclick="selectTimeSlot('${timeSlot}')"`;

        return `
            <div class="${slotClass}" data-slot="${timeSlot}" ${onClick}>
                ${formatTimeSlot(timeSlot)}
                ${isBooked ? '<br><small>Booked</small>' : ''}
            </div>
        `;
    }).join('');

    availabilitySection.classList.add('show');
}

// Select time slot
function selectTimeSlot(timeSlot) {
    const timeSlots = document.querySelectorAll('.time-slot:not(.unavailable)');
    const hiddenInput = document.getElementById('selected-time-slot');

    timeSlots.forEach(slot => slot.classList.remove('selected'));

    const selectedSlot = document.querySelector(`[data-slot="${timeSlot}"]`);
    if (selectedSlot) {
        selectedSlot.classList.add('selected');
        hiddenInput.value = timeSlot;
    }
}

// Format time slot for display
function formatTimeSlot(timeSlot) {
    const [start, end] = timeSlot.split('-');
    const formatTime = (time) => {
        const [hour] = time.split(':');
        const hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
        return `${displayHour}:00 ${ampm}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
}

// Handle donation booking submission
function handleDonationBooking(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Booking Slot...';

    // Collect form data
    const bookingData = {
        type: 'donation',
        donorName: formData.get('donorName'),
        donorEmail: formData.get('donorEmail'),
        donorPhone: formData.get('donorPhone'),
        preferredContact: formData.get('preferredContact'),
        donationTypes: formData.getAll('donationTypes'),
        estimatedBags: formData.get('estimatedBags'),
        transportMethod: formData.get('transportMethod'),
        donationNotes: formData.get('donationNotes'),
        preferredDate: formData.get('preferredDate'),
        preferredTime: formData.get('preferredTime'),
        alternateDate: formData.get('alternateDate'),
        requirements: formData.getAll('requirements'),
        status: 'pending',
        createdAt: Date.now()
    };

    // Validate required fields
    const errors = validateBookingData(bookingData, 'donation');

    if (errors.length > 0) {
        showBookingMessage(errors.join('<br>'), 'error');
        resetSubmitButton(submitBtn, 'Book Donation Slot');
        return;
    }

    // Simulate API call delay
    setTimeout(() => {
        try {
            // Save booking
            const success = dataManager.addDonationBooking(bookingData);

            if (success) {
                showBookingMessage(
                    'Your donation slot has been booked successfully! We\'ll confirm your appointment within 24 hours and send you detailed instructions.',
                    'success'
                );

                // Reset form
                form.reset();

                // Send confirmation email (simulation)
                console.log('Sending confirmation email to:', bookingData.donorEmail);

                // Update button text
                submitBtn.textContent = 'Slot Booked Successfully!';
                submitBtn.style.background = '#2ecc71';

                // Reset button after delay
                setTimeout(() => {
                    resetSubmitButton(submitBtn, 'Book Another Slot');
                    submitBtn.style.background = '';
                }, 3000);

            } else {
                throw new Error('Failed to save booking');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showBookingMessage('There was an error processing your booking. Please try again.', 'error');
            resetSubmitButton(submitBtn, 'Book Donation Slot');
        }
    }, 1500);
}

// Handle mentoring booking submission
function handleMentoringBooking(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Booking Session...';

    // Collect form data
    const bookingData = {
        type: 'mentoring',
        clientName: formData.get('clientName'),
        clientEmail: formData.get('clientEmail'),
        clientPhone: formData.get('clientPhone'),
        clientAge: formData.get('clientAge'),
        mentorId: formData.get('mentorId'),
        sessionType: formData.get('sessionType'),
        sessionDuration: formData.get('sessionDuration'),
        sessionFormat: formData.get('sessionFormat'),
        sessionGoals: formData.get('sessionGoals'),
        backgroundInfo: formData.get('backgroundInfo'),
        preferredDate: formData.get('preferredDate'),
        timePreference: formData.get('timePreference'),
        selectedTimeSlot: formData.get('selectedTimeSlot'),
        preferences: formData.getAll('preferences'),
        status: 'pending',
        createdAt: Date.now()
    };

    // Validate required fields
    const errors = validateBookingData(bookingData, 'mentoring');

    if (errors.length > 0) {
        showBookingMessage(errors.join('<br>'), 'error');
        resetSubmitButton(submitBtn, 'Book Mentoring Session');
        return;
    }

    // Check time slot availability
    const isSlotAvailable = checkTimeSlotAvailability(bookingData.mentorId, bookingData.preferredDate, bookingData.selectedTimeSlot);

    if (!isSlotAvailable) {
        showBookingMessage('The selected time slot is no longer available. Please choose a different time.', 'error');
        loadAvailableTimeSlots(); // Refresh availability
        resetSubmitButton(submitBtn, 'Book Mentoring Session');
        return;
    }

    // Simulate API call delay
    setTimeout(() => {
        try {
            // Save booking
            const success = dataManager.addMentoringBooking(bookingData);

            if (success) {
                const mentor = dataManager.getMentorById(bookingData.mentorId);
                showBookingMessage(
                    `Your mentoring session with ${mentor.name} has been booked successfully! You'll receive confirmation and joining instructions within 24 hours.`,
                    'success'
                );

                // Reset form and selections
                form.reset();
                document.querySelectorAll('.mentor-card').forEach(card => card.classList.remove('selected'));
                document.getElementById('booking-form-container').style.display = 'none';
                document.getElementById('availability-section').classList.remove('show');

                // Send confirmation email (simulation)
                console.log('Sending confirmation email to:', bookingData.clientEmail);

                // Update button text
                submitBtn.textContent = 'Session Booked Successfully!';
                submitBtn.style.background = '#2ecc71';

                // Reset button after delay
                setTimeout(() => {
                    resetSubmitButton(submitBtn, 'Book Another Session');
                    submitBtn.style.background = '';
                }, 3000);

            } else {
                throw new Error('Failed to save booking');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showBookingMessage('There was an error processing your booking. Please try again.', 'error');
            resetSubmitButton(submitBtn, 'Book Mentoring Session');
        }
    }, 1500);
}

// Validate booking data
function validateBookingData(data, type) {
    const errors = [];

    if (type === 'donation') {
        if (!data.donorName) errors.push('Full name is required');
        if (!data.donorEmail) errors.push('Email address is required');
        if (!data.donorPhone) errors.push('Phone number is required');
        if (!data.donationTypes || data.donationTypes.length === 0) errors.push('Please select what you are donating');
        if (!data.estimatedBags) errors.push('Please estimate the number of bags/boxes');
        if (!data.preferredDate) errors.push('Please select a preferred date');
        if (!data.preferredTime) errors.push('Please select a preferred time slot');

        // Validate email format
        if (data.donorEmail && !utils.isValidEmail(data.donorEmail)) {
            errors.push('Please enter a valid email address');
        }

        // Validate date is not in the past
        if (data.preferredDate) {
            const selectedDate = new Date(data.preferredDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.push('Please select a future date');
            }
        }

    } else if (type === 'mentoring') {
        if (!data.clientName) errors.push('Full name is required');
        if (!data.clientEmail) errors.push('Email address is required');
        if (!data.clientPhone) errors.push('Phone number is required');
        if (!data.mentorId) errors.push('Please select a mentor');
        if (!data.sessionType) errors.push('Please select a session type');
        if (!data.sessionDuration) errors.push('Please select session duration');
        if (!data.sessionFormat) errors.push('Please select session format');
        if (!data.sessionGoals) errors.push('Please describe your session goals');
        if (!data.preferredDate) errors.push('Please select a preferred date');
        if (!data.selectedTimeSlot) errors.push('Please select a time slot');

        // Validate email format
        if (data.clientEmail && !utils.isValidEmail(data.clientEmail)) {
            errors.push('Please enter a valid email address');
        }

        // Validate date is not in the past
        if (data.preferredDate) {
            const selectedDate = new Date(data.preferredDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.push('Please select a future date');
            }
        }
    }

    return errors;
}

// Check time slot availability
function checkTimeSlotAvailability(mentorId, date, timeSlot) {
    const existingBookings = dataManager.getMentoringBookings().filter(booking =>
        booking.mentorId === mentorId &&
        booking.preferredDate === date &&
        booking.selectedTimeSlot === timeSlot &&
        booking.status !== 'cancelled'
    );

    return existingBookings.length === 0;
}

// Validate donation date
function validateDonationDate() {
    const dateInput = document.getElementById('preferred-date');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showBookingMessage('Please select a future date', 'error');
        dateInput.value = '';
    }
}

// Initialize form validation
function initializeFormValidation(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value && !utils.isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    }

    // Phone validation
    if (field.type === 'tel' && value && !utils.isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
    }

    // Date validation
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            isValid = false;
            errorMessage = 'Please select a future date';
        }
    }

    // Update field styling
    if (isValid) {
        field.classList.remove('error');
        removeFieldError(field);
    } else {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    removeFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

// Remove field error
function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
}

// Show booking message
function showBookingMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.booking-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `booking-message ${type}`;
    messageDiv.innerHTML = message;

    // Insert at top of booking container
    const container = document.querySelector('.booking-form-container') || document.querySelector('.booking-section .container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 10000);
        }
    }
}

// Reset submit button
function resetSubmitButton(button, text) {
    button.disabled = false;
    button.classList.remove('loading');
    button.textContent = text;
}

// Export functions for global access
window.booking = {
    initializeDonationBooking,
    initializeMentoringBooking,
    selectMentor,
    selectTimeSlot,
    loadAvailableTimeSlots
};