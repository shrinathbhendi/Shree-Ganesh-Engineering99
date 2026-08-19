document.addEventListener('DOMContentLoaded', () => {
    // 1. STICKY NAVBAR SCROLL ACTION
    const mainHeader = document.querySelector('.main-header');
    const backToTopBtn = document.querySelector('.back-to-top');

    const updateMegaMenuTop = () => {
        if (!mainHeader) return;
        const headerBottom = mainHeader.getBoundingClientRect().bottom;
        document.querySelectorAll('.mega-dropdown-menu').forEach(menu => {
            menu.style.top = headerBottom + 'px';
        });
    };

    const topHeader = document.querySelector('.top-header');

    const handleScrollState = () => {
        if (window.scrollY > 20) {
            mainHeader?.classList.add('scrolled');
            topHeader?.classList.add('scrolled');
        } else {
            mainHeader?.classList.remove('scrolled');
            topHeader?.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', () => {
        handleScrollState();
        updateMegaMenuTop();

        // Back to top button visibility
        if (window.scrollY > 300) {
            backToTopBtn?.classList.add('active');
        } else {
            backToTopBtn?.classList.remove('active');
        }
    });

    handleScrollState();


    // Set initial position on load
    updateMegaMenuTop();

    // Back to top click handler
    backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 2. MOBILE TOGGLE NAVIGATION & SIDE DRAWER
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Create backdrop overlay if not present
    let navOverlay = document.querySelector('.nav-overlay');
    if (!navOverlay) {
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        if (mainHeader) {
            mainHeader.appendChild(navOverlay);
        } else {
            document.body.appendChild(navOverlay);
        }
    }


    // Remove any leftover close button element if present
    document.querySelectorAll('.mobile-menu-close').forEach(el => el.remove());


    if (navToggle && navMenu) {
        const toggleDrawer = () => {
            const isActive = navMenu.classList.contains('active');
            if (isActive) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                navToggle.classList.add('active');
                navMenu.classList.add('active');
                navOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        navToggle.addEventListener('click', toggleDrawer);

        navOverlay.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Handle Dropdown Toggle on Mobile (Accordion via Chevron)
        const dropdownItems = document.querySelectorAll('.nav-item-dropdown');
        dropdownItems.forEach(dropdown => {
            const dropdownArrow = dropdown.querySelector('.dropdown-arrow');
            if (dropdownArrow) {
                dropdownArrow.addEventListener('click', (e) => {
                    if (window.innerWidth <= 992) {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdown.classList.toggle('active-open');
                    }
                });
            }

            // Submenu Accordion Handler on Mobile (Tap category row to expand sub-products)
            const submenus = dropdown.querySelectorAll('.has-submenu');
            submenus.forEach(sub => {
                const subLink = sub.querySelector('a');
                if (subLink) {
                    subLink.addEventListener('click', (e) => {
                        if (window.innerWidth <= 992) {
                            e.preventDefault();
                            e.stopPropagation();
                            sub.classList.toggle('open-submenu');
                        }
                    });
                }
            });
        });

        // Close pinned dropdown when clicking anywhere outside header
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item-dropdown')) {
                dropdownItems.forEach(d => {
                    d.classList.remove('is-pinned');
                    d.classList.remove('active-open');
                });
            }
        });


        // Close mobile menu when clicking menu links (excluding accordion category headers)
        document.querySelectorAll('.nav-link:not(.nav-item-dropdown > .nav-link), .dropdown-menu > li:not(.has-submenu) > a, .submenu-flyout a, .category-card-list li a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
                dropdownItems.forEach(d => {
                    d.classList.remove('active-open');
                    d.classList.remove('is-pinned');
                });
                document.querySelectorAll('.has-submenu').forEach(s => s.classList.remove('open-submenu'));
            });
        });

    }

    // 3. PHONE / TOUCH SCREEN HOVER & ACTIVE ANIMATIONS
    const touchElements = document.querySelectorAll('.counter-card, .choose-card, .product-card, .about-img-box, .about-img-box img, .btn, .gallery-item');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', () => {
            element.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.classList.remove('touch-active');
            }, 400);
        }, { passive: true });
    });

    // 4. SCROLL REVEAL INTERSECTION OBSERVER FOR ABOUT SECTION & COMPONENTS
    const revealElements = document.querySelectorAll('.about-grid, .about, .choose-grid, .section-title-wrapper, .counters-container, .counters-section, .products-marquee-wrapper, #products, .why-choose-us, .reviews, #reviews');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 5. INTERACTIVE SPLIT-SCREEN PRODUCT DETAIL MODAL
    // Dynamically inject modal backdrop container if not present
    if (!document.getElementById('productDetailModal')) {
        const modalHTML = `
            <div class="product-detail-modal-backdrop" id="productDetailModal">
                <div class="product-detail-modal-card">
                    <button class="modal-close-btn" id="closeProductModal" aria-label="Close Modal">&times;</button>
                    <div class="product-detail-modal-grid">
                        <div class="modal-left-col">
                            <div class="modal-img-box">
                                <img id="modalProductImg" src="" alt="Product Image" />
                            </div>
                            <span class="modal-quality-badge"><i class="fas fa-check-circle"></i> 100% Quality Assured Food-Grade SS</span>
                        </div>
                        <div class="modal-right-col">
                            <span id="modalProductBadge" class="badge">Industrial Spec</span>
                            <h2 id="modalProductTitle" class="modal-title">Product Name</h2>
                            <div class="modal-model-row">
                                <span id="modalProductModel" class="model-badge">Model: SGE-01</span>
                            </div>
                            <p id="modalProductDesc" class="modal-desc">Detailed product specification and description.</p>
                            <div class="modal-specs-wrapper">
                                <h4 class="specs-heading"><i class="fas fa-list-alt"></i> Technical Specifications</h4>
                                <div id="modalSpecsTable"></div>
                            </div>
                            <div class="modal-action-row">
                                <a id="modalInquiryBtn" href="contact.html" class="btn btn-primary btn-modal-inquiry">
                                    Request Price &amp; Get Instant Quote <i class="fas fa-paper-plane"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modalBackdrop = document.getElementById('productDetailModal');
    const modalCloseBtn = document.getElementById('closeProductModal');
    const modalImg = document.getElementById('modalProductImg');
    const modalTitle = document.getElementById('modalProductTitle');
    const modalBadge = document.getElementById('modalProductBadge');
    const modalModel = document.getElementById('modalProductModel');
    const modalDesc = document.getElementById('modalProductDesc');
    const modalSpecsTable = document.getElementById('modalSpecsTable');
    const modalInquiryBtn = document.getElementById('modalInquiryBtn');

    function openProductModal(card) {
        if (!card || !modalBackdrop) return;

        const imgEl = card.querySelector('.product-img-wrapper img, img');
        const titleEl = card.querySelector('.product-title, .overlay-title, h3, h4');
        const badgeEl = card.querySelector('.badge, .overlay-spec-tag');
        const modelEl = card.querySelector('.product-spec, .model-badge');
        const descEl = card.querySelector('.overlay-desc, .product-desc-short, p');
        const tableEl = card.querySelector('.product-spec-table, table');
        const linkEl = card.querySelector('a[href*="contact"]');

        if (imgEl) modalImg.src = imgEl.src;
        if (titleEl) modalTitle.textContent = titleEl.textContent.trim();
        if (badgeEl) modalBadge.textContent = badgeEl.textContent.trim();
        if (modelEl) modalModel.textContent = modelEl.textContent.trim();
        if (descEl) modalDesc.textContent = descEl.textContent.trim();
        
        if (tableEl) {
            modalSpecsTable.innerHTML = tableEl.outerHTML;
        } else {
            modalSpecsTable.innerHTML = '<p style="font-size:0.85rem; color:#64748b;">Sanitary grade SS304/SS316L construction with helium leak testing.</p>';
        }

        const prodQueryName = titleEl ? encodeURIComponent(titleEl.textContent.trim().toLowerCase().replace(/\s+/g, '-')) : 'ss-component';
        modalInquiryBtn.href = linkEl ? linkEl.href : `contact.html?product=${prodQueryName}`;

        modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Expose globally for cross-script execution (deep-linking fallback)
    window.openProductModal = openProductModal;

    function closeProductModal() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProductModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeProductModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop?.classList.contains('active')) {
            closeProductModal();
        }
    });

    // Delegate click listener to all product cards across the site
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            // Check if card is a link, or inside a link going to products.html
            const anchor = e.target.closest('a');
            if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href').includes('products.html')) {
                return; // Let normal page navigation happen
            }
            // If user clicked directly on a button or card, open split modal
            const btn = e.target.closest('.btn, .product-img-wrapper, .product-title, .product-card');
            if (btn && !e.target.closest('.overlay-link-btn')) {
                e.preventDefault();
                openProductModal(card);
            }
        }
    });
});
