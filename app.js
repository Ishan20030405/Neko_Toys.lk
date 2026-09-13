document.addEventListener('DOMContentLoaded', () => {
    // ── Mobile Menu ──────────────────────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // ── Cart State (LocalStorage) ───────────────────────────────
    let cart = JSON.parse(localStorage.getItem('neko_cart')) || [];

    function saveCart() {
        localStorage.setItem('neko_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;
        return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
    }

    function formatPrice(num) {
        return 'LKR ' + num.toLocaleString('en-US');
    }

    function updateCartUI() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounts.forEach(el => el.textContent = totalItems);

        // Render drawer content
        const cartItemsContainer = document.getElementById('cart-drawer-items');
        const cartSubtotalEl = document.getElementById('cart-drawer-subtotal');
        if (!cartItemsContainer || !cartSubtotalEl) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-view">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="btn btn-primary btn-sm" id="empty-shop-btn">Start Shopping</a>
                </div>
            `;
            cartSubtotalEl.textContent = 'LKR 0';
            const emptyShopBtn = document.getElementById('empty-shop-btn');
            if (emptyShopBtn) {
                emptyShopBtn.addEventListener('click', closeCartDrawer);
            }
            return;
        }

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            const itemTotal = parsePrice(item.price) * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="cart-drawer-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <span class="cart-item-unit-price">${item.price}</span>
                        <div class="cart-qty-controls">
                            <button class="cart-qty-btn decrease-qty" data-index="${index}">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button class="cart-qty-btn increase-qty" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-right">
                        <span class="cart-item-total">${formatPrice(itemTotal)}</span>
                        <button class="remove-cart-item" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        cartSubtotalEl.textContent = formatPrice(subtotal);

        // Attach event listeners inside drawer
        cartItemsContainer.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
            });
        });

        cartItemsContainer.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                cart[idx].quantity++;
                saveCart();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-cart-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                cart.splice(idx, 1);
                saveCart();
            });
        });
    }

    // ── Build Cart Drawer DOM ────────────────────────────────────
    const cartDrawer = document.createElement('div');
    cartDrawer.id = 'cart-drawer';
    cartDrawer.innerHTML = `
        <div class="cart-drawer-overlay"></div>
        <div class="cart-drawer-content">
            <div class="cart-drawer-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Cart</h3>
                <button class="cart-drawer-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="cart-drawer-body" id="cart-drawer-items"></div>
            <div class="cart-drawer-footer">
                <div class="cart-summary-row">
                    <span>Subtotal:</span>
                    <strong id="cart-drawer-subtotal">LKR 0</strong>
                </div>
                <div class="cart-drawer-actions">
                    <button class="btn btn-secondary" id="clear-cart-btn">Clear Cart</button>
                    <button class="btn btn-primary" id="checkout-btn">Checkout Now</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(cartDrawer);

    const cartDrawerOverlay = cartDrawer.querySelector('.cart-drawer-overlay');
    const cartDrawerClose   = cartDrawer.querySelector('.cart-drawer-close');

    function openCartDrawer() {
        cartDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartDrawerOverlay.addEventListener('click', closeCartDrawer);
    cartDrawerClose.addEventListener('click', closeCartDrawer);

    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cart.length > 0 && confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                saveCart();
            }
        });
    }

    // ── Checkout Modal ───────────────────────────────────────────
    const checkoutModal = document.createElement('div');
    checkoutModal.id = 'checkout-modal';
    checkoutModal.innerHTML = `
        <div class="checkout-backdrop"></div>
        <div class="checkout-box">
            <button class="checkout-close"><i class="fas fa-times"></i></button>
            <div class="checkout-header">
                <h2>🛍️ Complete Your Order</h2>
                <p>Fill in your details for island-wide delivery in Sri Lanka</p>
            </div>
            <form id="checkout-form">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Full Name</label>
                    <input type="text" required placeholder="e.g. Ishan Perera">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Phone Number</label>
                    <input type="tel" required placeholder="e.g. 0771234567">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Delivery Address</label>
                    <textarea required rows="2" placeholder="e.g. No. 12, Main Street, Colombo 03"></textarea>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-wallet"></i> Payment Method</label>
                    <select required>
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="card">Card Payment (Online)</option>
                    </select>
                </div>
                <div class="checkout-order-summary" id="checkout-order-summary"></div>
                <button type="submit" class="btn btn-primary checkout-submit-btn">Place Order Now</button>
            </form>
        </div>
    `;
    document.body.appendChild(checkoutModal);

    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutClose = checkoutModal.querySelector('.checkout-close');
    const checkoutBackdrop = checkoutModal.querySelector('.checkout-backdrop');
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            closeCartDrawer();
            openCheckoutModal();
        });
    }

    function openCheckoutModal() {
        const summaryContainer = document.getElementById('checkout-order-summary');
        const subtotal = cart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
        summaryContainer.innerHTML = `
            <div class="checkout-summary-row">
                <span>Items Total (${cart.reduce((sum, i) => sum + i.quantity, 0)} items):</span>
                <strong>${formatPrice(subtotal)}</strong>
            </div>
            <div class="checkout-summary-row">
                <span>Island-Wide Delivery:</span>
                <strong style="color:#2ed573;">FREE</strong>
            </div>
            <div class="checkout-summary-row total-row">
                <span>Total Payable:</span>
                <strong style="color:var(--primary-color);">${formatPrice(subtotal)}</strong>
            </div>
        `;
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckoutModal() {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    checkoutClose.addEventListener('click', closeCheckoutModal);
    checkoutBackdrop.addEventListener('click', closeCheckoutModal);

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('🎉 Thank you for your order! We have received your request and our team will contact you via WhatsApp/Phone shortly.');
        cart = [];
        saveCart();
        closeCheckoutModal();
    });

    // Attach open to cart icon in header
    document.querySelectorAll('.nav-icons a').forEach(a => {
        if (a.querySelector('.fa-shopping-cart')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                openCartDrawer();
            });
        }
    });

    // ── Global Add To Cart Event Handlers ───────────────────────
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card') || btn.closest('.slider-card');
            if (!card) return;

            const titleEl = card.querySelector('h3');
            const priceEl = card.querySelector('.price');
            const imgEl   = card.querySelector('.product-image img');

            const name  = titleEl ? titleEl.textContent.trim() : 'Anime Collectible';
            const price = priceEl ? priceEl.textContent.trim() : 'LKR 0';
            const img   = imgEl   ? imgEl.getAttribute('src') : 'images/levi.jpg';

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name, price, img, quantity: 1 });
            }

            saveCart();

            // Visual feedback on button
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#2ed573';
            btn.style.color = 'white';

            // Toast feedback
            showToast(`Added <strong>${name}</strong> to cart!`);

            setTimeout(() => {
                btn.innerHTML = originalIcon;
                btn.style.background = '';
                btn.style.color = '';
            }, 1000);
        });
    });

    // ── Toast Notification ──────────────────────────────────────
    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    document.body.appendChild(toast);

    function showToast(htmlMsg) {
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${htmlMsg}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // ── Lightbox ──────────────────────────────────────────────────
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <button class="lightbox-close"><i class="fas fa-times"></i></button>
            <img class="lightbox-img" src="" alt="">
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg     = lightbox.querySelector('.lightbox-img');
    const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');
    const lightboxClose   = lightbox.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    document.querySelectorAll('.product-image img, .slider-card .product-image img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    lightboxOverlay.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeCartDrawer();
            closeSearch();
            closeCheckoutModal();
        }
    });

    // ── Search ────────────────────────────────────────────────────
    const allProducts = [
        // Figures
        { name: 'Levi Ackerman Action Figure',    series: 'Attack on Titan',   price: 'LKR 22,000', img: 'images/levi.jpg',    page: 'anime_figures.html', category: 'Figures' },
        { name: 'Sung Jin-Woo Action Figure',     series: 'Solo Leveling',     price: 'LKR 25,000', img: 'images/jinwoo.jpg',  page: 'anime_figures.html', category: 'Figures' },
        { name: 'Tanjiro Kamado Action Figure',   series: 'Demon Slayer',      price: 'LKR 20,000', img: 'images/tanjiro.jpg', page: 'anime_figures.html', category: 'Figures' },
        { name: 'Naruto Uzumaki Action Figure',   series: 'Naruto',            price: 'LKR 15,000', img: 'images/naruto.jpg',  page: 'anime_figures.html', category: 'Figures' },
        { name: 'Mikasa Ackerman Action Figure',  series: 'Attack on Titan',   price: 'LKR 18,000', img: 'images/mikasa.jpg',  page: 'anime_figures.html', category: 'Figures' },
        { name: 'Nezuko Kamado Action Figure',    series: 'Demon Slayer',      price: 'LKR 14,000', img: 'images/nezuko.jpg',  page: 'anime_figures.html', category: 'Figures' },
        { name: 'Eren Yeager Action Figure',      series: 'Attack on Titan',   price: 'LKR 18,000', img: 'images/eren.jpg',    page: 'anime_figures.html', category: 'Figures' },
        { name: 'Igris Blood Red Knight Figure',  series: 'Solo Leveling',     price: 'LKR 21,000', img: 'images/igris.jpg',   page: 'anime_figures.html', category: 'Figures' },
        { name: 'Magical Girl Scale Figure 1/7',  series: 'Mahou Shoujo',      price: 'LKR 45,000', img: 'images/fig1.jpg',    page: 'anime_figures.html', category: 'Figures' },
        { name: 'Ninja Hero Action Figure',       series: 'Shinobi Chronicles',price: 'LKR 16,500', img: 'images/fig2.jpg',    page: 'anime_figures.html', category: 'Figures' },
        { name: 'Demon Hunter Chibi',             series: 'Demon Slayers',     price: 'LKR 13,500', img: 'images/fig3.jpg',    page: 'anime_figures.html', category: 'Figures' },
        { name: 'RX-Alpha Mecha Model Kit',       series: 'G-Suit Franchise',  price: 'LKR 27,000', img: 'images/fig4.jpg',    page: 'anime_figures.html', category: 'Figures' },
        // Cosplay
        { name: 'Replica Sword Prop',             series: 'Cosplay Weapons',   price: 'LKR 8,500',  img: 'images/cosplay_sword.jpg',     page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Dual Assassin Daggers',          series: 'Cosplay Weapons',   price: 'LKR 12,000', img: 'images/cosplay_daggers.jpg',   page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Standard Black Anime Wig',       series: 'Cosplay Accessories',price:'LKR 4,500',  img: 'images/cosplay_wig.jpg',       page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Hidden Leaf Village Headband',   series: 'Naruto',            price: 'LKR 1,500',  img: 'images/cosplay_headband.jpg',  page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Nichirin Katana Prop',           series: 'Demon Slayer',      price: 'LKR 10,000', img: 'images/cosplay_katana.jpg',    page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Scout Regiment Embroidered Patch',series: 'Attack on Titan',  price: 'LKR 1,200',  img: 'images/cosplay_patch.jpg',     page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Scout Regiment Cosplay Jacket',  series: 'Attack on Titan',   price: 'LKR 8,000',  img: 'images/cosplay_jacket.jpg',    page: 'anime_cosplay.html', category: 'Cosplay' },
        { name: 'Demon Slayer Corps Uniform',     series: 'Demon Slayer',      price: 'LKR 9,500',  img: 'images/cosplay_uniform.jpg',   page: 'anime_cosplay.html', category: 'Cosplay' },
        // Mangas
        { name: 'Demon Slayer: Kimetsu no Yaiba, Vol. 1', series: 'English Paperback', price: 'LKR 3,000', img: 'images/manga_demonslayer.jpg', page: 'anime_mangas.html', category: 'Manga' },
        { name: 'Naruto, Vol. 1',                 series: 'English Paperback', price: 'LKR 3,000',  img: 'images/manga_naruto.jpg',      page: 'anime_mangas.html', category: 'Manga' },
        { name: 'Solo Leveling, Vol. 1 (Comic)',  series: 'Full Color Edition',price: 'LKR 5,500',  img: 'images/manga_sololeveling.jpg',page: 'anime_mangas.html', category: 'Manga' },
        { name: 'Attack on Titan, Vol. 1',        series: 'English Paperback', price: 'LKR 3,500',  img: 'images/manga_aot.jpg',         page: 'anime_mangas.html', category: 'Manga' },
        // T-Shirts
        { name: 'Mikasa Ackerman Graphic Tee',    series: 'Attack on Titan',   price: 'LKR 4,500',  img: 'images/tshirt_mikasa.jpg',     page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Jinwoo Shadow Monarch Tee',      series: 'Solo Leveling',     price: 'LKR 4,500',  img: 'images/tshirt_sololeveling1.jpg', page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Scout Regiment Group Tee',       series: 'Attack on Titan',   price: 'LKR 4,500',  img: 'images/tshirt_aot.jpg',        page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Jinwoo Dual Daggers Tee',        series: 'Solo Leveling',     price: 'LKR 4,500',  img: 'images/tshirt_sololeveling2.jpg', page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Suzume White Graphic Tee',       series: 'Suzume no Tojimari',price: 'LKR 4,500',  img: 'images/tshirt_suzume.jpg',     page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Tanjiro & Friends Group Tee',    series: 'Demon Slayer',      price: 'LKR 4,500',  img: 'images/tshirt_demonslayer.jpg',page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Shinobu Kocho Graphic Tee',      series: 'Demon Slayer',      price: 'LKR 4,500',  img: 'images/tshirt_shinobu.jpg',    page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Team 7 & Akatsuki Tee',          series: 'Naruto Shippuden',  price: 'LKR 4,500',  img: 'images/tshirt_naruto.jpg',     page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: '5 Centimeters Per Second Tee',   series: 'Makoto Shinkai',    price: 'LKR 4,500',  img: 'images/tshirt_5cm.jpg',        page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Jujutsu Kaisen Group Tee',       series: 'Jujutsu Kaisen',    price: 'LKR 4,500',  img: 'images/tshirt_jjk.jpg',        page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Your Name (Kimi no Na wa) Tee',  series: 'Makoto Shinkai',    price: 'LKR 4,500',  img: 'images/tshirt_yourname.jpg',   page: 'anime_tshirts.html', category: 'T-Shirt' },
        { name: 'Weathering With You Tee',        series: 'Makoto Shinkai',    price: 'LKR 4,500',  img: 'images/tshirt_weathering.jpg', page: 'anime_tshirts.html', category: 'T-Shirt' },
    ];

    const searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.innerHTML = `
        <div class="search-backdrop"></div>
        <div class="search-box">
            <div class="search-input-row">
                <i class="fas fa-search search-icon-inner"></i>
                <input type="text" id="search-input" placeholder="Search figures, cosplay, mangas, t-shirts…" autocomplete="off">
                <button class="search-close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="search-results" id="search-results">
                <p class="search-hint">Start typing to search all products…</p>
            </div>
        </div>
    `;
    document.body.appendChild(searchOverlay);

    const searchInput    = document.getElementById('search-input');
    const searchResults  = document.getElementById('search-results');
    const searchBackdrop = searchOverlay.querySelector('.search-backdrop');
    const searchCloseBtn = searchOverlay.querySelector('.search-close-btn');

    function openSearch() {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput.focus(), 150);
    }
    function closeSearch() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResults.innerHTML = '<p class="search-hint">Start typing to search all products…</p>';
    }

    document.querySelectorAll('.nav-icons a').forEach(a => {
        if (a.querySelector('.fa-search')) {
            a.addEventListener('click', (e) => { e.preventDefault(); openSearch(); });
        }
    });

    searchBackdrop.addEventListener('click', closeSearch);
    searchCloseBtn.addEventListener('click', closeSearch);

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
            searchResults.innerHTML = '<p class="search-hint">Start typing to search all products…</p>';
            return;
        }

        const matches = allProducts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.series.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );

        if (matches.length === 0) {
            searchResults.innerHTML = `<p class="search-no-result">No products found for "<strong>${q}</strong>"</p>`;
            return;
        }

        searchResults.innerHTML = matches.map(p => `
            <a class="search-result-item" href="${p.page}">
                <img src="${p.img}" alt="${p.name}">
                <div class="search-result-info">
                    <span class="search-result-category">${p.category}</span>
                    <h4>${p.name}</h4>
                    <p>${p.series}</p>
                    <span class="search-result-price">${p.price}</span>
                </div>
                <i class="fas fa-chevron-right search-result-arrow"></i>
            </a>
        `).join('');
    });

    // Initialize cart badge on page load
    updateCartUI();
});
