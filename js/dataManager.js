/**
 * Data Management System for Charity Store
 * Handles all local storage operations and data models
 * Now with Firebase Cloud Sync for images, mentors, and bookings
 */

// Firebase integration - will be initialized when firebase scripts are loaded
let firebaseDataManager = null;
let firebaseInitialized = false;
let firebaseInitPromise = null;

// Initialize Firebase when available
if (typeof window !== 'undefined') {
    firebaseInitPromise = new Promise((resolve) => {
        window.addEventListener('firebaseReady', async () => {
            try {
                console.log('🔥 Firebase ready event received, loading module...');
                const module = await import('./firebaseDataManager.js');
                firebaseDataManager = module.default;
                firebaseInitialized = true;
                console.log('✅ Firebase Data Manager loaded successfully');
                resolve(true);
            } catch (err) {
                console.error('❌ Firebase loading failed:', err);
                firebaseInitialized = false;
                resolve(false);
            }
        });

        // Timeout after 5 seconds if Firebase doesn't load
        setTimeout(() => {
            if (!firebaseInitialized) {
                console.warn('⚠️ Firebase initialization timeout - using localStorage only');
                resolve(false);
            }
        }, 5000);
    });
}

// Helper function to wait for Firebase
async function ensureFirebaseReady() {
    if (firebaseInitPromise) {
        await firebaseInitPromise;
    }
    return firebaseDataManager;
}

class DataManager {
    constructor() {
        this.storageKeys = {
            products: 'charity_store_products',
            orders: 'charity_store_orders',
            donations: 'charity_store_donations',
            content: 'charity_store_content',
            adminUsers: 'charity_store_admin_users',
            cart: 'charity_store_cart',
            settings: 'charity_store_settings',
            donationBookings: 'charity_store_donation_bookings',
            mentoringBookings: 'charity_store_mentoring_bookings',
            mentors: 'charity_store_mentors',
            images: 'charity_store_images',
            contactSubmissions: 'charity_store_contact_submissions'
        };
        this.initializeData();
    }

    // Initialize default data if not exists
    initializeData() {
        // Initialize admin users
        if (!this.getAdminUsers().length) {
            this.setAdminUsers([{
                id: this.generateId(),
                username: 'admin',
                password: 'admin123', // In production, this should be hashed
                email: 'admin@charitystore.com',
                role: 'admin',
                createdAt: Date.now()
            }]);
        }

        // Initialize site settings
        if (!this.getSettings()) {
            this.setSettings({
                siteName: 'Charity Store',
                siteTagline: 'Giving Back Through Fashion',
                currency: 'USD',
                taxRate: 0.08,
                freeShippingThreshold: 50,
                contactEmail: 'info@charitystore.com',
                orderNotificationEmail: 'orders@charitystore.com',
                enableShop: true
            });
        }

        // Initialize sample content
        if (!this.getContent('homepage')) {
            this.initializeSampleContent();
        }

        // Initialize sample products
        if (!this.getProducts().length) {
            this.initializeSampleProducts();
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Generic storage methods
    setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Check if it's a quota exceeded error
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.error('localStorage quota exceeded!');
            }
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    // Products management
    getProducts() {
        return this.getData(this.storageKeys.products) || [];
    }

    setProducts(products) {
        return this.setData(this.storageKeys.products, products);
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = this.generateId();
        product.createdAt = Date.now();
        products.push(product);
        return this.setProducts(products);
    }

    updateProduct(productId, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: Date.now() };
            return this.setProducts(products);
        }
        return false;
    }

    deleteProduct(productId) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== productId);
        return this.setProducts(filtered);
    }

    getProductById(productId) {
        const products = this.getProducts();
        return products.find(p => p.id === productId);
    }

    searchProducts(query, filters = {}) {
        let products = this.getProducts().filter(p => p.active !== false);

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        // Apply filters
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        if (filters.minPrice) {
            products = products.filter(p => p.price >= filters.minPrice);
        }
        if (filters.maxPrice) {
            products = products.filter(p => p.price <= filters.maxPrice);
        }
        if (filters.condition) {
            products = products.filter(p => p.condition === filters.condition);
        }
        if (filters.size) {
            products = products.filter(p => p.sizes && p.sizes.includes(filters.size));
        }

        // Sorting
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    products.sort((a, b) => b.createdAt - a.createdAt);
                    break;
                case 'name':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        return products;
    }

    // Orders management
    getOrders() {
        return this.getData(this.storageKeys.orders) || [];
    }

    setOrders(orders) {
        return this.setData(this.storageKeys.orders, orders);
    }

    addOrder(order) {
        const orders = this.getOrders();
        order.id = this.generateId();
        order.createdAt = Date.now();
        order.updatedAt = Date.now();
        order.status = order.status || 'pending';
        orders.push(order);
        return this.setOrders(orders);
    }

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            orders[index].updatedAt = Date.now();
            return this.setOrders(orders);
        }
        return false;
    }

    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(o => o.id === orderId);
    }

    deleteOrder(orderId) {
        const orders = this.getOrders();
        const filtered = orders.filter(o => o.id !== orderId);
        return this.setOrders(filtered);
    }

    // Cart management
    getCart() {
        return this.getData(this.storageKeys.cart) || [];
    }

    setCart(cart) {
        return this.setData(this.storageKeys.cart, cart);
    }

    addToCart(productId, quantity = 1, size = null) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === productId && item.size === size);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: this.generateId(),
                productId,
                quantity,
                size,
                addedAt: Date.now()
            });
        }

        return this.setCart(cart);
    }

    updateCartItem(itemId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(itemId);
            }
            item.quantity = quantity;
            return this.setCart(cart);
        }
        return false;
    }

    removeFromCart(itemId) {
        const cart = this.getCart();
        const filtered = cart.filter(item => item.id !== itemId);
        return this.setCart(filtered);
    }

    clearCart() {
        return this.setCart([]);
    }

    getCartWithProducts() {
        const cart = this.getCart();
        const products = this.getProducts();

        return cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                product: product || null
            };
        }).filter(item => item.product); // Remove items for deleted products
    }

    getCartTotal() {
        const cartWithProducts = this.getCartWithProducts();
        return cartWithProducts.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Donations management
    getDonations() {
        return this.getData(this.storageKeys.donations) || [];
    }

    setDonations(donations) {
        return this.setData(this.storageKeys.donations, donations);
    }

    addDonation(donation) {
        const donations = this.getDonations();
        donation.id = this.generateId();
        donation.date = Date.now();
        donation.status = donation.status || 'received';
        donations.push(donation);
        return this.setDonations(donations);
    }

    // Content management
    getContent(section) {
        const content = this.getData(this.storageKeys.content) || {};
        return content[section];
    }

    setContent(section, data) {
        const content = this.getData(this.storageKeys.content) || {};
        content[section] = {
            ...data,
            lastUpdated: Date.now()
        };
        return this.setData(this.storageKeys.content, content);
    }

    updateContent(section, data) {
        return this.setContent(section, data);
    }

    // Admin users management
    getAdminUsers() {
        return this.getData(this.storageKeys.adminUsers) || [];
    }

    setAdminUsers(users) {
        return this.setData(this.storageKeys.adminUsers, users);
    }

    authenticateAdmin(username, password) {
        const users = this.getAdminUsers();
        return users.find(user => user.username === username && user.password === password);
    }

    // Settings management
    getSettings() {
        return this.getData(this.storageKeys.settings);
    }

    setSettings(settings) {
        return this.setData(this.storageKeys.settings, settings);
    }

    updateSettings(updates) {
        const settings = this.getSettings() || {};
        const updatedSettings = { ...settings, ...updates };
        return this.setSettings(updatedSettings);
    }

    // Initialize sample content
    initializeSampleContent() {
        // Homepage content
        this.setContent('homepage', {
            hero: {
                title: 'Give Fashion a Second Chance',
                subtitle: 'Every purchase helps someone in need and saves clothing from landfills',
                ctaText: 'Shop Now'
            },
            mission: {
                title: 'Our Mission',
                description: 'We believe that everyone deserves access to quality clothing, and that fashion should be sustainable. Every item you purchase helps provide clothing to families in need while reducing textile waste.'
            },
            stats: {
                itemsDonated: 12450,
                peopleHelped: 3200,
                fundsRaised: 89500
            }
        });

        // Story page content
        this.setContent('story', {
            about: 'Charity Store was founded in 2019 with a simple mission: to provide quality clothing to those in need while promoting sustainable fashion practices. What started as a small community initiative has grown into a thriving charity that has helped thousands of families.',
            mission: 'To create a world where everyone has access to quality clothing, regardless of their economic situation, while promoting environmental sustainability through clothing reuse and recycling.',
            vision: 'We envision communities where clothing insecurity is eliminated, and sustainable fashion practices are the norm.',
            team: [
                {
                    name: 'Sarah Johnson',
                    role: 'Founder & Executive Director',
                    bio: 'Sarah founded Charity Store after volunteering at local shelters and seeing the need for quality clothing donations.'
                },
                {
                    name: 'Michael Chen',
                    role: 'Operations Manager',
                    bio: 'Michael oversees our daily operations and coordinates with partner organizations across the city.'
                },
                {
                    name: 'Emma Rodriguez',
                    role: 'Community Outreach',
                    bio: 'Emma builds relationships with local communities and helps identify families in need of support.'
                }
            ]
        });

        // Contact information
        this.setContent('contact', {
            address: '123 Charity Lane, Helping City, HC 12345',
            phone: '(555) 123-4567',
            email: 'info@heartsandthreads.org',
            hours: 'Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM, Sunday: Closed',
            social: {
                facebook: 'https://facebook.com/heartsandthreads',
                instagram: 'https://instagram.com/heartsandthreads',
                twitter: 'https://twitter.com/heartsandthreads'
            }
        });
    }

    // Initialize sample products
    initializeSampleProducts() {
        const sampleProducts = [
            {
                name: 'Vintage Denim Jacket',
                description: 'Classic denim jacket in excellent condition. Perfect for layering and adding style to any outfit.',
                category: 'Women',
                price: 25.99,
                sizes: ['S', 'M', 'L'],
                condition: 'Like New',
                stock: 3,
                images: ['https://via.placeholder.com/400x300/4a90e2/ffffff?text=Denim+Jacket'],
                story: 'Donated by a fashion enthusiast who wanted to help others enjoy quality clothing.',
                active: true
            },
            {
                name: 'Men\'s Business Shirt',
                description: 'Professional white dress shirt, perfect for interviews and office wear.',
                category: 'Men',
                price: 15.99,
                sizes: ['M', 'L', 'XL'],
                condition: 'Good',
                stock: 5,
                images: ['https://via.placeholder.com/400x300/2ecc71/ffffff?text=Business+Shirt'],
                story: 'Donated by a businessman to help job seekers make great first impressions.',
                active: true
            },
            {
                name: 'Children\'s Winter Coat',
                description: 'Warm and cozy winter coat for children. Keeps little ones warm during cold weather.',
                category: 'Kids',
                price: 20.99,
                sizes: ['4T', '5T', '6T'],
                condition: 'New',
                stock: 2,
                images: ['https://via.placeholder.com/400x300/e74c3c/ffffff?text=Winter+Coat'],
                story: 'Brand new coat donated by a local retailer to help keep children warm.',
                active: true
            },
            {
                name: 'Designer Handbag',
                description: 'Elegant handbag in excellent condition. Adds a touch of luxury to any outfit.',
                category: 'Accessories',
                price: 45.99,
                sizes: ['One Size'],
                condition: 'Like New',
                stock: 1,
                images: ['https://via.placeholder.com/400x300/9b59b6/ffffff?text=Designer+Handbag'],
                story: 'Donated by someone who wanted to share the joy of beautiful accessories.',
                active: true
            },
            {
                name: 'Summer Dress',
                description: 'Light and airy summer dress, perfect for warm weather and casual occasions.',
                category: 'Women',
                price: 18.99,
                sizes: ['S', 'M'],
                condition: 'Good',
                stock: 4,
                images: ['https://via.placeholder.com/400x300/f39c12/ffffff?text=Summer+Dress'],
                story: 'Donated by someone who loved this dress and wanted to pass on the joy.',
                active: true
            },
            {
                name: 'Running Shoes',
                description: 'Comfortable athletic shoes for running and exercise. Lightly used but lots of life left.',
                category: 'Accessories',
                price: 32.99,
                sizes: ['8', '9', '10', '11'],
                condition: 'Good',
                stock: 6,
                images: ['https://via.placeholder.com/400x300/3498db/ffffff?text=Running+Shoes'],
                story: 'Donated by an athlete who wanted to help others stay active.',
                active: true
            }
        ];

        sampleProducts.forEach(product => {
            this.addProduct(product);
        });
    }

    // Analytics and reporting
    getDashboardStats() {
        const products = this.getProducts();
        const orders = this.getOrders();
        const donations = this.getDonations();

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        const todayOrders = orders.filter(o => o.createdAt > now - oneDay);
        const weekOrders = orders.filter(o => o.createdAt > now - oneWeek);
        const monthOrders = orders.filter(o => o.createdAt > now - oneMonth);

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

        return {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.active !== false).length,
            lowStockProducts: products.filter(p => p.stock < 5).length,
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            weekOrders: weekOrders.length,
            monthOrders: monthOrders.length,
            totalRevenue: totalRevenue,
            monthRevenue: monthRevenue,
            totalDonations: donations.length,
            monetaryDonations: donations.filter(d => d.type === 'monetary').length,
            clothingDonations: donations.filter(d => d.type === 'clothing').length
        };
    }

    // Export data for reports
    exportProducts() {
        const products = this.getProducts();
        return products.map(p => ({
            ID: p.id,
            Name: p.name,
            Category: p.category,
            Price: p.price,
            Condition: p.condition,
            Stock: p.stock,
            Status: p.active ? 'Active' : 'Inactive',
            Created: new Date(p.createdAt).toLocaleDateString()
        }));
    }

    exportOrders() {
        const orders = this.getOrders();
        return orders.map(o => ({
            ID: o.id,
            Customer: o.customerName,
            Email: o.customerEmail,
            Total: o.total,
            Status: o.status,
            Date: new Date(o.createdAt).toLocaleDateString()
        }));
    }

    exportDonations() {
        const donations = this.getDonations();
        return donations.map(d => ({
            ID: d.id,
            Type: d.type,
            Donor: d.donorName,
            Email: d.donorEmail,
            Amount: d.amount || 'N/A',
            Items: d.items || 'N/A',
            Date: new Date(d.date).toLocaleDateString()
        }));
    }

    // Donation Bookings Management
    getDonationBookings() {
        return this.getData(this.storageKeys.donationBookings) || [];
    }

    setDonationBookings(bookings) {
        return this.setData(this.storageKeys.donationBookings, bookings);
    }

    addDonationBooking(booking) {
        const bookings = this.getDonationBookings();
        booking.id = this.generateId();
        booking.createdAt = booking.createdAt || Date.now();
        booking.updatedAt = Date.now();
        bookings.push(booking);
        return this.setDonationBookings(bookings);
    }

    updateDonationBookingStatus(bookingId, status) {
        const bookings = this.getDonationBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = status;
            bookings[index].updatedAt = Date.now();
            return this.setDonationBookings(bookings);
        }
        return false;
    }

    getDonationBookingById(bookingId) {
        const bookings = this.getDonationBookings();
        return bookings.find(b => b.id === bookingId);
    }

    deleteDonationBooking(bookingId) {
        const bookings = this.getDonationBookings();
        const filtered = bookings.filter(b => b.id !== bookingId);
        return this.setDonationBookings(filtered);
    }

    // Mentoring Bookings Management
    getMentoringBookings() {
        return this.getData(this.storageKeys.mentoringBookings) || [];
    }

    setMentoringBookings(bookings) {
        return this.setData(this.storageKeys.mentoringBookings, bookings);
    }

    addMentoringBooking(booking) {
        const bookings = this.getMentoringBookings();
        booking.id = this.generateId();
        booking.createdAt = booking.createdAt || Date.now();
        booking.updatedAt = Date.now();
        bookings.push(booking);
        return this.setMentoringBookings(bookings);
    }

    updateMentoringBookingStatus(bookingId, status) {
        const bookings = this.getMentoringBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = status;
            bookings[index].updatedAt = Date.now();
            return this.setMentoringBookings(bookings);
        }
        return false;
    }

    getMentoringBookingById(bookingId) {
        const bookings = this.getMentoringBookings();
        return bookings.find(b => b.id === bookingId);
    }

    deleteMentoringBooking(bookingId) {
        const bookings = this.getMentoringBookings();
        const filtered = bookings.filter(b => b.id !== bookingId);
        return this.setMentoringBookings(filtered);
    }

    // Mentors Management
    async getMentors() {
        // Wait for Firebase to be ready
        await ensureFirebaseReady();

        // Try Firebase first, fall back to localStorage
        if (firebaseDataManager) {
            try {
                console.log('👥 Loading mentors from Firebase...');
                const mentors = await firebaseDataManager.getMentors();
                console.log(`✅ Loaded ${mentors.length} mentors from Firebase`);
                // Cache in localStorage
                this.setData(this.storageKeys.mentors, mentors);
                return mentors;
            } catch (error) {
                console.error('❌ Error getting mentors from Firebase, using localStorage:', error);
            }
        } else {
            console.warn('⚠️ Firebase not available for mentors, using localStorage only');
        }
        const localMentors = this.getData(this.storageKeys.mentors) || [];
        console.log(`📦 Loaded ${localMentors.length} mentors from localStorage`);
        return localMentors;
    }

    setMentors(mentors) {
        return this.setData(this.storageKeys.mentors, mentors);
    }

    async addMentor(mentor) {
        // Wait for Firebase to be ready
        await ensureFirebaseReady();

        mentor.id = this.generateId();
        mentor.createdAt = Date.now();

        // Save to Firebase if available
        if (firebaseDataManager) {
            try {
                await firebaseDataManager.saveMentor(mentor);
                console.log('✅ Mentor saved to Firebase');
            } catch (error) {
                console.error('❌ Error saving mentor to Firebase:', error);
            }
        } else {
            console.warn('⚠️ Firebase not available, saving mentor to localStorage only');
        }

        // Also save to localStorage
        const mentors = await this.getMentors();
        mentors.push(mentor);
        this.setMentors(mentors);
        return true;
    }

    async updateMentor(mentorId, updates) {
        const mentors = await this.getMentors();
        const index = mentors.findIndex(m => m.id === mentorId);
        if (index !== -1) {
            mentors[index] = { ...mentors[index], ...updates, updatedAt: Date.now() };

            // Update in Firebase if available
            if (firebaseDataManager) {
                try {
                    await firebaseDataManager.saveMentor(mentors[index]);
                    console.log('✅ Mentor updated in Firebase');
                } catch (error) {
                    console.error('❌ Error updating mentor in Firebase:', error);
                }
            }

            this.setMentors(mentors);
            return true;
        }
        return false;
    }

    async getMentorById(mentorId) {
        const mentors = await this.getMentors();
        return mentors.find(m => m.id === mentorId);
    }

    async deleteMentor(mentorId) {
        // Wait for Firebase to be ready
        await ensureFirebaseReady();

        // Delete from Firebase if available
        if (firebaseDataManager) {
            try {
                await firebaseDataManager.deleteMentor(mentorId);
                console.log('Mentor deleted from Firebase');
            } catch (error) {
                console.error('Error deleting mentor from Firebase:', error);
            }
        }

        const mentors = await this.getMentors();
        const filtered = mentors.filter(m => m.id !== mentorId);
        return this.setMentors(filtered);
    }

    // Get active mentors only
    async getActiveMentors() {
        const mentors = await this.getMentors();
        return mentors.filter(m => m.active !== false);
    }

    // Booking Analytics and Reporting
    getBookingStats() {
        const donationBookings = this.getDonationBookings();
        const mentoringBookings = this.getMentoringBookings();

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        const todayDonations = donationBookings.filter(b => b.createdAt > now - oneDay);
        const weekDonations = donationBookings.filter(b => b.createdAt > now - oneWeek);
        const monthDonations = donationBookings.filter(b => b.createdAt > now - oneMonth);

        const todayMentoring = mentoringBookings.filter(b => b.createdAt > now - oneDay);
        const weekMentoring = mentoringBookings.filter(b => b.createdAt > now - oneWeek);
        const monthMentoring = mentoringBookings.filter(b => b.createdAt > now - oneMonth);

        return {
            totalDonationBookings: donationBookings.length,
            todayDonationBookings: todayDonations.length,
            weekDonationBookings: weekDonations.length,
            monthDonationBookings: monthDonations.length,

            totalMentoringBookings: mentoringBookings.length,
            todayMentoringBookings: todayMentoring.length,
            weekMentoringBookings: weekMentoring.length,
            monthMentoringBookings: monthMentoring.length,

            pendingDonationBookings: donationBookings.filter(b => b.status === 'pending').length,
            confirmedDonationBookings: donationBookings.filter(b => b.status === 'confirmed').length,
            completedDonationBookings: donationBookings.filter(b => b.status === 'completed').length,

            pendingMentoringBookings: mentoringBookings.filter(b => b.status === 'pending').length,
            confirmedMentoringBookings: mentoringBookings.filter(b => b.status === 'confirmed').length,
            completedMentoringBookings: mentoringBookings.filter(b => b.status === 'completed').length,

            totalMentors: this.getMentors().length,
            activeMentors: this.getActiveMentors().length
        };
    }

    // Export booking data for reports
    exportDonationBookings() {
        const bookings = this.getDonationBookings();
        return bookings.map(b => ({
            ID: b.id,
            'Donor Name': b.donorName,
            Email: b.donorEmail,
            Phone: b.donorPhone,
            'Donation Types': Array.isArray(b.donationTypes) ? b.donationTypes.join(', ') : b.donationTypes,
            'Estimated Bags': b.estimatedBags,
            'Preferred Date': b.preferredDate,
            'Preferred Time': b.preferredTime,
            Status: b.status,
            'Created Date': new Date(b.createdAt).toLocaleDateString()
        }));
    }

    exportMentoringBookings() {
        const bookings = this.getMentoringBookings();
        const mentors = this.getMentors();

        return bookings.map(b => {
            const mentor = mentors.find(m => m.id === b.mentorId);
            return {
                ID: b.id,
                'Client Name': b.clientName,
                Email: b.clientEmail,
                Phone: b.clientPhone,
                Mentor: mentor ? mentor.name : 'Unknown',
                'Session Type': b.sessionType,
                Duration: `${b.sessionDuration} minutes`,
                Format: b.sessionFormat,
                'Preferred Date': b.preferredDate,
                'Time Slot': b.selectedTimeSlot,
                Status: b.status,
                'Created Date': new Date(b.createdAt).toLocaleDateString()
            };
        });
    }

    exportMentors() {
        const mentors = this.getMentors();
        return mentors.map(m => ({
            ID: m.id,
            Name: m.name,
            Speciality: m.speciality,
            Experience: `${m.experience} years`,
            Rating: `${m.rating}/5 stars`,
            Status: m.active ? 'Active' : 'Inactive',
            'Created Date': new Date(m.createdAt).toLocaleDateString()
        }));
    }

    // ===== IMAGE MANAGEMENT =====
    async getImages() {
        // Wait for Firebase to be ready
        await ensureFirebaseReady();

        // ALWAYS load directly from Firebase (no localStorage caching to avoid quota issues)
        if (firebaseDataManager) {
            try {
                console.log('📸 Loading images DIRECTLY from Firebase (no localStorage cache)...');
                const images = await firebaseDataManager.getImages();
                console.log(`✅ Loaded ${images.length} images from Firebase`);
                // DO NOT cache in localStorage - images are too large
                return images;
            } catch (error) {
                console.error('❌ Error getting images from Firebase:', error);
                // Try localStorage as emergency fallback only
                const localImages = this.getData(this.storageKeys.images) || [];
                console.warn(`⚠️ Falling back to localStorage: ${localImages.length} images`);
                return localImages;
            }
        } else {
            console.warn('⚠️ Firebase not available, using localStorage only');
            const localImages = this.getData(this.storageKeys.images) || [];
            console.log(`📦 Loaded ${localImages.length} images from localStorage`);
            return localImages;
        }
    }

    async addImage(imageData) {
        try {
            // Wait for Firebase to be ready
            await ensureFirebaseReady();

            const newImage = {
                id: this.generateId(),
                ...imageData
            };

            // Save to Firebase ONLY (no localStorage to avoid quota issues)
            if (firebaseDataManager) {
                try {
                    await firebaseDataManager.saveImage(newImage);
                    console.log('✅ Image saved to Firebase (skipped localStorage to avoid quota)');
                    return true;
                } catch (error) {
                    console.error('❌ Error saving to Firebase:', error);
                    // Try localStorage as emergency fallback
                    const images = this.getData(this.storageKeys.images) || [];
                    images.push(newImage);
                    return this.setData(this.storageKeys.images, images);
                }
            } else {
                // Firebase not available, use localStorage
                console.warn('⚠️ Firebase not available, saving to localStorage');
                const images = this.getData(this.storageKeys.images) || [];
                images.push(newImage);
                return this.setData(this.storageKeys.images, images);
            }
        } catch (error) {
            console.error('Error adding image:', error);
            return false;
        }
    }

    async deleteImage(index) {
        try {
            // Wait for Firebase to be ready
            await ensureFirebaseReady();

            const images = await this.getImages();
            if (index >= 0 && index < images.length) {
                const imageId = images[index].id;

                // Delete from Firebase ONLY (no localStorage to avoid quota issues)
                if (firebaseDataManager && imageId) {
                    try {
                        await firebaseDataManager.deleteImage(imageId);
                        console.log('✅ Image deleted from Firebase');
                        return true;
                    } catch (error) {
                        console.error('❌ Error deleting from Firebase:', error);
                        return false;
                    }
                } else {
                    // Firebase not available, use localStorage
                    console.warn('⚠️ Firebase not available, deleting from localStorage');
                    images.splice(index, 1);
                    return this.setData(this.storageKeys.images, images);
                }
            }
            return false;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }

    async deleteImageById(imageId) {
        try {
            if (!imageId) {
                console.error('❌ No image ID provided');
                return false;
            }

            console.log('🗑️ Deleting image with ID:', imageId);

            // Wait for Firebase to be ready
            await ensureFirebaseReady();

            // Delete from Firebase first
            if (firebaseDataManager) {
                try {
                    await firebaseDataManager.deleteImage(imageId);
                    console.log('✅ Image deleted from Firebase by ID:', imageId);
                } catch (error) {
                    console.error('❌ Error deleting from Firebase:', error);
                    return false;
                }
            } else {
                console.warn('⚠️ Firebase not available during deletion');
            }

            // ALSO delete from localStorage to prevent it from reappearing
            console.log('🧹 Cleaning up localStorage cache...');
            const localImages = this.getData(this.storageKeys.images) || [];
            const index = localImages.findIndex(img => img.id === imageId);
            if (index !== -1) {
                localImages.splice(index, 1);
                this.setData(this.storageKeys.images, localImages);
                console.log('✅ Image removed from localStorage cache');
            } else {
                console.log('ℹ️ Image not found in localStorage (might not have been cached)');
            }

            return true;
        } catch (error) {
            console.error('❌ Error deleting image by ID:', error);
            return false;
        }
    }

    async getImageById(id) {
        const images = await this.getImages();
        return images.find(img => img.id === id);
    }

    // Mentor Applications Management
    getMentorApplications() {
        return this.getData('mentorApplications') || [];
    }

    setMentorApplications(applications) {
        return this.setData('mentorApplications', applications);
    }

    addMentorApplication(application) {
        const applications = this.getMentorApplications();
        application.id = this.generateId();
        application.submittedAt = application.submittedAt || Date.now();
        application.status = application.status || 'pending';

        applications.push(application);
        if (this.setMentorApplications(applications)) {
            console.log('✅ Mentor application added:', application.id);
            return true;
        }
        return false;
    }

    getMentorApplicationById(applicationId) {
        const applications = this.getMentorApplications();
        return applications.find(a => a.id === applicationId);
    }

    updateMentorApplicationStatus(applicationId, status, reviewedBy = null) {
        const applications = this.getMentorApplications();
        const application = applications.find(a => a.id === applicationId);
        if (application) {
            application.status = status;
            application.updatedAt = Date.now();
            application.reviewedAt = Date.now();
            if (reviewedBy) {
                application.reviewedBy = reviewedBy;
            }
            return this.setMentorApplications(applications);
        }
        return false;
    }

    // ============================================
    // Contact Form Submissions Management
    // ============================================

    getContactSubmissions() {
        return this.getData(this.storageKeys.contactSubmissions) || [];
    }

    setContactSubmissions(submissions) {
        return this.setData(this.storageKeys.contactSubmissions, submissions);
    }

    async addContactSubmission(submission) {
        try {
            // Wait for Firebase to be ready
            await ensureFirebaseReady();

            const submissions = this.getContactSubmissions();
            submission.id = this.generateId();
            submission.submittedAt = submission.submittedAt || Date.now();
            submission.status = submission.status || 'new';
            submission.read = false;
            submissions.push(submission);

            // Try to save to Firebase first
            if (firebaseDataManager) {
                try {
                    await firebaseDataManager.addContactSubmission(submission);
                    console.log('✅ Contact submission saved to Firebase');
                } catch (error) {
                    console.error('❌ Error saving to Firebase:', error);
                }
            }

            return this.setContactSubmissions(submissions);
        } catch (error) {
            console.error('Error adding contact submission:', error);
            return false;
        }
    }

    getContactSubmissionById(submissionId) {
        const submissions = this.getContactSubmissions();
        return submissions.find(s => s.id === submissionId);
    }

    updateContactSubmissionStatus(submissionId, status) {
        const submissions = this.getContactSubmissions();
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
            submission.status = status;
            submission.updatedAt = Date.now();
            return this.setContactSubmissions(submissions);
        }
        return false;
    }

    markContactSubmissionAsRead(submissionId) {
        const submissions = this.getContactSubmissions();
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
            submission.read = true;
            submission.readAt = Date.now();
            return this.setContactSubmissions(submissions);
        }
        return false;
    }

    deleteContactSubmission(submissionId) {
        const submissions = this.getContactSubmissions();
        const index = submissions.findIndex(s => s.id === submissionId);
        if (index > -1) {
            submissions.splice(index, 1);
            return this.setContactSubmissions(submissions);
        }
        return false;
    }
}

// Create global instance
window.dataManager = new DataManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}