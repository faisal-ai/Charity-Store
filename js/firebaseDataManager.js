/**
 * Firebase Data Manager - Cloud storage for BU Mentoring
 * Handles Firestore + Firebase Storage operations
 */

import {
    db, storage,
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where, orderBy,
    ref, uploadBytes, getDownloadURL, deleteObject
} from './firebase-config.js';

class FirebaseDataManager {
    constructor() {
        this.collections = {
            images:            'images',
            mentors:           'mentors',
            donationBookings:  'donation_bookings',
            mentoringBookings: 'mentoring_bookings',
            content:           'content',
            settings:          'settings',
            programs:          'programs',
            resources:         'resources',
            blogPosts:         'blog_posts',
            donations:         'donations'
        };
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            this.initialized = true;
            console.log('Firebase Data Manager initialized');
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }

    // ─── Firebase Storage ─────────────────────────────────────────────────────

    async uploadFile(file, storagePath) {
        try {
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            console.log('File uploaded to Storage:', storagePath);
            return url;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async deleteFile(storagePath) {
        try {
            await deleteObject(ref(storage, storagePath));
            console.log('File deleted from Storage:', storagePath);
            return true;
        } catch (error) {
            console.warn('Error deleting file from Storage (may not exist):', error);
            return false;
        }
    }

    // ─── Images ──────────────────────────────────────────────────────────────

    async saveImage(imageData) {
        try {
            // If a File object is provided, upload to Storage first
            if (imageData.file instanceof File) {
                const filename = Date.now() + '_' + imageData.file.name.replace(/\s+/g, '_');
                const url = await this.uploadFile(imageData.file, 'gallery/' + filename);
                imageData = { ...imageData, url, storagePath: 'gallery/' + filename };
                delete imageData.file;
            }
            const docRef = await addDoc(collection(db, this.collections.images), {
                ...imageData,
                uploadedAt: Date.now()
            });
            return { id: docRef.id, ...imageData };
        } catch (error) {
            console.error('Error saving image:', error);
            throw error;
        }
    }

    async getImages() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.images));
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error getting images:', error);
            return [];
        }
    }

    async deleteImage(imageId, storagePath) {
        try {
            await deleteDoc(doc(db, this.collections.images, imageId));
            if (storagePath) await this.deleteFile(storagePath);
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }

    // ─── Mentors ─────────────────────────────────────────────────────────────

    async saveMentor(mentorData) {
        try {
            // Upload photo to Storage if a File is provided
            if (mentorData.photoFile instanceof File) {
                const tempId = mentorData.id || ('mentor_' + Date.now());
                const filename = Date.now() + '_' + mentorData.photoFile.name.replace(/\s+/g, '_');
                const storagePath = 'mentors/' + tempId + '/' + filename;
                mentorData.photoURL = await this.uploadFile(mentorData.photoFile, storagePath);
                mentorData.photoStoragePath = storagePath;
                delete mentorData.photoFile;
                delete mentorData.image; // remove old base64 field if present
            }

            if (mentorData.id) {
                await setDoc(doc(db, this.collections.mentors, mentorData.id), mentorData);
            } else {
                const docRef = await addDoc(collection(db, this.collections.mentors), mentorData);
                mentorData.id = docRef.id;
            }
            return mentorData;
        } catch (error) {
            console.error('Error saving mentor:', error);
            throw error;
        }
    }

    async getMentors() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.mentors));
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error getting mentors:', error);
            return [];
        }
    }

    async deleteMentor(mentorId) {
        try {
            // Also delete photo from Storage if stored
            const mentorSnap = await getDoc(doc(db, this.collections.mentors, mentorId));
            if (mentorSnap.exists() && mentorSnap.data().photoStoragePath) {
                await this.deleteFile(mentorSnap.data().photoStoragePath);
            }
            await deleteDoc(doc(db, this.collections.mentors, mentorId));
            return true;
        } catch (error) {
            console.error('Error deleting mentor:', error);
            return false;
        }
    }

    // ─── Programs ────────────────────────────────────────────────────────────

    async saveProgram(programData) {
        try {
            if (programData.id) {
                await setDoc(doc(db, this.collections.programs, programData.id), programData);
            } else {
                const docRef = await addDoc(collection(db, this.collections.programs), {
                    ...programData, createdAt: Date.now()
                });
                programData.id = docRef.id;
            }
            return programData;
        } catch (error) {
            console.error('Error saving program:', error);
            throw error;
        }
    }

    async getPrograms() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.programs));
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error getting programs:', error);
            return [];
        }
    }

    async deleteProgram(programId) {
        try {
            await deleteDoc(doc(db, this.collections.programs, programId));
            return true;
        } catch (error) {
            console.error('Error deleting program:', error);
            return false;
        }
    }

    // ─── Resources ───────────────────────────────────────────────────────────

    async saveResource(resourceData) {
        try {
            // Upload file to Storage if a File is provided
            if (resourceData.file instanceof File) {
                const filename = Date.now() + '_' + resourceData.file.name.replace(/\s+/g, '_');
                const storagePath = 'resources/' + filename;
                resourceData.url = await this.uploadFile(resourceData.file, storagePath);
                resourceData.storagePath = storagePath;
                resourceData.size = (resourceData.file.size / 1024).toFixed(0) + ' KB';
                delete resourceData.file;
            }
            if (resourceData.id) {
                await setDoc(doc(db, this.collections.resources, resourceData.id), resourceData);
            } else {
                const docRef = await addDoc(collection(db, this.collections.resources), {
                    ...resourceData, createdAt: Date.now()
                });
                resourceData.id = docRef.id;
            }
            return resourceData;
        } catch (error) {
            console.error('Error saving resource:', error);
            throw error;
        }
    }

    async getResources() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.resources));
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error getting resources:', error);
            return [];
        }
    }

    async deleteResource(resourceId) {
        try {
            const snap = await getDoc(doc(db, this.collections.resources, resourceId));
            if (snap.exists() && snap.data().storagePath) {
                await this.deleteFile(snap.data().storagePath);
            }
            await deleteDoc(doc(db, this.collections.resources, resourceId));
            return true;
        } catch (error) {
            console.error('Error deleting resource:', error);
            return false;
        }
    }

    // ─── Blog Posts ──────────────────────────────────────────────────────────

    async saveBlogPost(postData) {
        try {
            // Upload cover image if a File is provided
            if (postData.coverImageFile instanceof File) {
                const filename = Date.now() + '_' + postData.coverImageFile.name.replace(/\s+/g, '_');
                const storagePath = 'blog/' + filename;
                postData.coverImageURL = await this.uploadFile(postData.coverImageFile, storagePath);
                postData.coverImageStoragePath = storagePath;
                delete postData.coverImageFile;
            }
            if (postData.id) {
                await setDoc(doc(db, this.collections.blogPosts, postData.id), {
                    ...postData, updatedAt: Date.now()
                });
            } else {
                const docRef = await addDoc(collection(db, this.collections.blogPosts), {
                    ...postData, createdAt: Date.now(), updatedAt: Date.now()
                });
                postData.id = docRef.id;
            }
            return postData;
        } catch (error) {
            console.error('Error saving blog post:', error);
            throw error;
        }
    }

    async getBlogPosts() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.blogPosts));
            return querySnapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (error) {
            console.error('Error getting blog posts:', error);
            return [];
        }
    }

    async deleteBlogPost(postId) {
        try {
            const snap = await getDoc(doc(db, this.collections.blogPosts, postId));
            if (snap.exists() && snap.data().coverImageStoragePath) {
                await this.deleteFile(snap.data().coverImageStoragePath);
            }
            await deleteDoc(doc(db, this.collections.blogPosts, postId));
            return true;
        } catch (error) {
            console.error('Error deleting blog post:', error);
            return false;
        }
    }

    // ─── Donations ───────────────────────────────────────────────────────────

    async saveDonation(donationData) {
        try {
            if (donationData.id) {
                await setDoc(doc(db, this.collections.donations, donationData.id), donationData);
            } else {
                const docRef = await addDoc(collection(db, this.collections.donations), {
                    ...donationData, createdAt: Date.now()
                });
                donationData.id = docRef.id;
            }
            return donationData;
        } catch (error) {
            console.error('Error saving donation:', error);
            throw error;
        }
    }

    async getDonations() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.donations));
            return querySnapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (error) {
            console.error('Error getting donations:', error);
            return [];
        }
    }

    async updateDonation(donationId, updates) {
        try {
            await updateDoc(doc(db, this.collections.donations, donationId), {
                ...updates, updatedAt: Date.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating donation:', error);
            return false;
        }
    }

    // ─── Donation Bookings ────────────────────────────────────────────────────

    async saveDonationBooking(bookingData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.donationBookings), {
                ...bookingData, createdAt: Date.now()
            });
            return { id: docRef.id, ...bookingData };
        } catch (error) {
            console.error('Error saving donation booking:', error);
            throw error;
        }
    }

    async getDonationBookings() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.donationBookings));
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error getting donation bookings:', error);
            return [];
        }
    }

    // ─── Mentoring Bookings ───────────────────────────────────────────────────

    async saveMentoringBooking(bookingData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.mentoringBookings), {
                ...bookingData, createdAt: Date.now()
            });
            return { id: docRef.id, ...bookingData };
        } catch (error) {
            console.error('Error saving mentoring booking:', error);
            throw error;
        }
    }

    async getMentoringBookings() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collections.mentoringBookings));
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error getting mentoring bookings:', error);
            return [];
        }
    }

    // ─── Content ─────────────────────────────────────────────────────────────

    async saveContent(key, contentData) {
        try {
            await setDoc(doc(db, this.collections.content, key), contentData);
            return true;
        } catch (error) {
            console.error('Error saving content:', error);
            return false;
        }
    }

    async getContent(key) {
        try {
            const docSnap = await getDoc(doc(db, this.collections.content, key));
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Error getting content:', error);
            return null;
        }
    }

    // ─── Settings ────────────────────────────────────────────────────────────

    async saveSettings(settingsData) {
        try {
            await setDoc(doc(db, this.collections.settings, 'site'), settingsData);
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    async getSettings() {
        try {
            const docSnap = await getDoc(doc(db, this.collections.settings, 'site'));
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Error getting settings:', error);
            return null;
        }
    }

    // ─── Contact Submissions ─────────────────────────────────────────────────

    async addContactSubmission(submissionData) {
        try {
            const docRef = await addDoc(collection(db, 'contact_submissions'), {
                ...submissionData, createdAt: Date.now(), read: false
            });
            return { id: docRef.id, ...submissionData };
        } catch (error) {
            console.error('Error saving contact submission:', error);
            throw error;
        }
    }
}

const firebaseDataManager = new FirebaseDataManager();
export default firebaseDataManager;
