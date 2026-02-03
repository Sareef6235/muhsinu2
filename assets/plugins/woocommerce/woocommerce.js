/**
 * WOOCOMMERCE PLUGIN
 * E-commerce engine for services and products
 */

window.WooCommerce = {
    version: '2.0.0',
    cart: [],
    currency: 'INR',
    currencySymbol: '₹',

    /**
     * Initialize plugin
     */
    init() {
        console.log('🛒 WooCommerce initialized');
        this.loadCart();
        this.renderMiniCart();
    },

    /**
     * Load cart from localStorage
     */
    loadCart() {
        const saved = localStorage.getItem('wc_cart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    },

    /**
     * Save cart
     */
    saveCart() {
        localStorage.setItem('wc_cart', JSON.stringify(this.cart));
        this.renderMiniCart();
    },

    /**
     * Add item to cart
     */
    addToCart(product, quantity = 1) {
        const existing = this.cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.title || product.name,
                price: product.price,
                image: product.thumbnail || product.image,
                quantity: quantity
            });
        }

        this.saveCart();
        this.showNotice(`Added "${product.title}" to cart!`);
        this.openCartDrawer();
    },

    /**
     * Remove item from cart
     */
    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
    },

    /**
     * Update quantity
     */
    updateQuantity(id, qty) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            item.quantity = parseInt(qty);
            if (item.quantity <= 0) {
                this.removeFromCart(id);
            } else {
                this.saveCart();
            }
        }
    },

    /**
     * Get cart total
     */
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    /**
     * Get item count
     */
    getCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    },

    /**
     * Show notification
     */
    showNotice(msg) {
        const notice = document.createElement('div');
        notice.className = 'wc-notice';
        notice.textContent = msg;
        document.body.appendChild(notice);

        setTimeout(() => {
            notice.classList.add('show');
        }, 10);

        setTimeout(() => {
            notice.classList.remove('show');
            setTimeout(() => notice.remove(), 300);
        }, 3000);
    },

    /**
     * Render Mini Cart Drawer
     */
    renderMiniCart() {
        let drawer = document.getElementById('wc-mini-cart');

        // Create drawer if not exists
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'wc-mini-cart';
            drawer.innerHTML = `
                <div class="wc-cart-overlay" onclick="window.WooCommerce.closeCartDrawer()"></div>
                <div class="wc-cart-sidebar">
                    <div class="wc-cart-header">
                        <h3>Your Cart</h3>
                        <button class="wc-close-btn" onclick="window.WooCommerce.closeCartDrawer()">&times;</button>
                    </div>
                    <div class="wc-cart-items">
                        <!-- Items injected here -->
                    </div>
                    <div class="wc-cart-footer">
                        <div class="wc-total">
                            <span>Total</span>
                            <span class="wc-total-amount">₹0</span>
                        </div>
                        <button class="wc-checkout-btn" onclick="window.WooCommerce.checkout()">Proceed to Checkout</button>
                    </div>
                </div>
            `;
            document.body.appendChild(drawer);
        }

        const itemsContainer = drawer.querySelector('.wc-cart-items');
        const totalEl = drawer.querySelector('.wc-total-amount');

        if (this.cart.length === 0) {
            itemsContainer.innerHTML = '<div class="wc-empty-cart">Your cart is empty</div>';
            drawer.querySelector('.wc-cart-footer').style.display = 'none';
        } else {
            drawer.querySelector('.wc-cart-footer').style.display = 'block';
            itemsContainer.innerHTML = this.cart.map(item => `
                <div class="wc-cart-item">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                    <div class="wc-item-details">
                        <h4>${item.name}</h4>
                        <div class="wc-item-price">${this.currencySymbol}${item.price}</div>
                        <div class="wc-item-actions">
                            <input type="number" value="${item.quantity}" min="1" onchange="window.WooCommerce.updateQuantity('${item.id}', this.value)">
                            <button onclick="window.WooCommerce.removeFromCart('${item.id}')">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');

            totalEl.textContent = this.currencySymbol + this.getTotal();
        }
    },

    openCartDrawer() {
        this.renderMiniCart();
        document.getElementById('wc-mini-cart').classList.add('open');
    },

    closeCartDrawer() {
        document.getElementById('wc-mini-cart').classList.remove('open');
    },

    /**
     * Proceed to Checkout
     */
    checkout() {
        this.closeCartDrawer();
        alert(`Proceeding to checkout with total: ${this.currencySymbol}${this.getTotal()}\n\nStarting payment gateway...`);
        // Simulate redirect or modal
        this.startPayment();
    },

    /**
     * Simulate Payment API
     */
    startPayment() {
        const amount = this.getTotal();
        // Here we would integrate Razorpay/Stripe
        const options = {
            amount: amount * 100,
            currency: this.currency,
            name: "MHMV Services",
            description: "Payment for services",
            handler: function (response) {
                alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                window.WooCommerce.cart = [];
                window.WooCommerce.saveCart();
            }
        };

        // Mock payment flow
        if (confirm(`Mock Payment Gateway\n\nPay ₹${amount} now?`)) {
            options.handler({ razorpay_payment_id: 'pay_' + Date.now() });
        }
    }
};

export default window.WooCommerce;
