/**
 * Data Management System for Charity Store
 * Handles all local storage operations and data models
 */

class DataManager {
    constructor() {
        this.storageKeys = {
            products: 'charity_store_products',
            orders: 'charity_store_orders',
            donations: 'charity_store_donations',
            content: 'charity_store_content',
            adminUsers: 'charity_store_admin_users',
            cart: 'charity_store_cart',
            settings: 'charity_store_settings'
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
                siteName: 'Hearts & Threads',
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
            about: 'Hearts & Threads was founded in 2019 with a simple mission: to provide quality clothing to those in need while promoting sustainable fashion practices. What started as a small community initiative has grown into a thriving charity that has helped thousands of families.',
            mission: 'To create a world where everyone has access to quality clothing, regardless of their economic situation, while promoting environmental sustainability through clothing reuse and recycling.',
            vision: 'We envision communities where clothing insecurity is eliminated, and sustainable fashion practices are the norm.',
            team: [
                {
                    name: 'Sarah Johnson',
                    role: 'Founder & Executive Director',
                    bio: 'Sarah founded Hearts & Threads after volunteering at local shelters and seeing the need for quality clothing donations.'
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
}

// Create global instance
window.dataManager = new DataManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}