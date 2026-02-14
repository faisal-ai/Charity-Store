/**
 * Firebase Data Manager - Cloud storage for Charity Store
 * Syncs data between localStorage and Firebase Firestore
 */

import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where } from './firebase-config.js';

class FirebaseDataManager {
    constructor() {
        this.collections = {
            images: 'images',
            mentors: 'mentors',
            donationBookings: 'donation_bookings',
            mentoringBookings: 'mentoring_bookings',
            content: 'content',
            settings: 'settings'
        };
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Firebase Data Manager...');
            this.initialized = true;
            console.log('Firebase Data Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }

    // Images Management
    async saveImage(imageData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.images), {
                ...imageData,
                uploadedAt: Date.now()
            });
            console.log('Image saved to Firebase with ID:', docRef.id);
            return { id: docRef.id, ...imageData };
        } catch (error) {
            console.error('Error saving image to Firebase:', error);
            throw error;
        }
    }

    async getImages() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.images));
            const images = [];
            querySnapshot.forEach((doc) => {
                images.push({ id: doc.id, ...doc.data() });
            });
            console.log(`Retrieved ${images.length} images from Firebase`);
            return images;
        } catch (error) {
            console.error('Error getting images from Firebase:', error);
            return [];
        }
    }

    async deleteImage(imageId) {
        try {
            await deleteDoc(doc(db, this.collections.images, imageId));
            console.log('Image deleted from Firebase:', imageId);
            return true;
        } catch (error) {
            console.error('Error deleting image from Firebase:', error);
            return false;
        }
    }

    // Mentors Management
    async saveMentor(mentorData) {
        try {
            if (mentorData.id) {
                // Update existing mentor
                await setDoc(doc(db, this.collections.mentors, mentorData.id), mentorData);
                console.log('Mentor updated in Firebase:', mentorData.id);
            } else {
                // Add new mentor
                const docRef = await addDoc(collection(db, this.collections.mentors), mentorData);
                mentorData.id = docRef.id;
                console.log('Mentor saved to Firebase with ID:', docRef.id);
            }
            return mentorData;
        } catch (error) {
            console.error('Error saving mentor to Firebase:', error);
            throw error;
        }
    }

    async getMentors() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.mentors));
            const mentors = [];
            querySnapshot.forEach((doc) => {
                mentors.push({ id: doc.id, ...doc.data() });
            });
            console.log(`Retrieved ${mentors.length} mentors from Firebase`);
            return mentors;
        } catch (error) {
            console.error('Error getting mentors from Firebase:', error);
            return [];
        }
    }

    async deleteMentor(mentorId) {
        try {
            await deleteDoc(doc(db, this.collections.mentors, mentorId));
            console.log('Mentor deleted from Firebase:', mentorId);
            return true;
        } catch (error) {
            console.error('Error deleting mentor from Firebase:', error);
            return false;
        }
    }

    // Donation Bookings Management
    async saveDonationBooking(bookingData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.donationBookings), {
                ...bookingData,
                createdAt: Date.now()
            });
            console.log('Donation booking saved to Firebase with ID:', docRef.id);
            return { id: docRef.id, ...bookingData };
        } catch (error) {
            console.error('Error saving donation booking to Firebase:', error);
            throw error;
        }
    }

    async getDonationBookings() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.donationBookings));
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            console.log(`Retrieved ${bookings.length} donation bookings from Firebase`);
            return bookings;
        } catch (error) {
            console.error('Error getting donation bookings from Firebase:', error);
            return [];
        }
    }

    // Mentoring Bookings Management
    async saveMentoringBooking(bookingData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.mentoringBookings), {
                ...bookingData,
                createdAt: Date.now()
            });
            console.log('Mentoring booking saved to Firebase with ID:', docRef.id);
            return { id: docRef.id, ...bookingData };
        } catch (error) {
            console.error('Error saving mentoring booking to Firebase:', error);
            throw error;
        }
    }

    async getMentoringBookings() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.mentoringBookings));
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            console.log(`Retrieved ${bookings.length} mentoring bookings from Firebase`);
            return bookings;
        } catch (error) {
            console.error('Error getting mentoring bookings from Firebase:', error);
            return [];
        }
    }

    // Content Management
    async saveContent(key, contentData) {
        try {
            await setDoc(doc(db, this.collections.content, key), contentData);
            console.log('Content saved to Firebase:', key);
            return true;
        } catch (error) {
            console.error('Error saving content to Firebase:', error);
            return false;
        }
    }

    async getContent(key) {
        try {
            const docRef = doc(db, this.collections.content, key);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting content from Firebase:', error);
            return null;
        }
    }
}

// Create singleton instance
const firebaseDataManager = new FirebaseDataManager();

// Export for use in other modules
export default firebaseDataManager;
