// Products page category filtering & product card interaction logic
document.addEventListener('DOMContentLoaded', () => {
    const pillButtons = document.querySelectorAll('.category-pill-btn');
    const productCards = document.querySelectorAll('.products-grid .product-card');
    const categoryTitleHeading = document.getElementById('selected-category-title');
    const categoryCountSubtitle = document.getElementById('selected-category-count');

    function filterCategory(cat, catName) {
        // Update active state on category buttons
        pillButtons.forEach(btn => {
            if (btn.getAttribute('data-cat') === cat) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update active state on mega dropdown boxes
        document.querySelectorAll('.mega-cat-box').forEach(box => {
            if (box.getAttribute('data-cat') === cat) {
                box.classList.add('active');
            } else {
                box.classList.remove('active');
            }
        });

        let visibleCount = 0;

        // Filter product cards in products-grid
        productCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (cat === 'all' || cardCat === cat) {
                card.style.display = 'flex';
                card.style.opacity = '1';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update title
        if (categoryTitleHeading) {
            if (cat === 'all') {
                categoryTitleHeading.textContent = 'All Manufactured Products';
            } else {
                categoryTitleHeading.textContent = catName || cat;
            }
        }

        if (categoryCountSubtitle) {
            categoryCountSubtitle.textContent = `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'} in ${cat === 'all' ? 'All Manufactured Products' : catName || cat}`;
        }

        // Push state to URL without reloading
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?cat=${cat}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    // Attach click listener to each category pill button
    pillButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = btn.getAttribute('data-cat');
            const catName = btn.querySelector('.cat-pill-title')?.textContent.trim();
            filterCategory(cat, catName);
        });
    });

    // Attach click listener to mega-dropdown boxes when on products.html
    document.querySelectorAll('.mega-dropdown-menu .mega-cat-box').forEach(box => {
        box.addEventListener('click', (e) => {
            const cat = box.getAttribute('data-cat');
            if (cat && window.location.pathname.endsWith('products.html')) {
                e.preventDefault();
                const catTitle = box.querySelector('.mega-cat-title')?.textContent.trim();
                filterCategory(cat, catTitle);
                // Close mega dropdown if open
                document.querySelectorAll('.nav-item-dropdown').forEach(d => {
                    d.classList.remove('active-open', 'is-pinned');
                });
            }
        });
    });

    // Check URL query parameters (e.g. products.html?cat=sight-glass)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const prodParam = urlParams.get('prod');

    if (catParam) {
        const matchingBtn = document.querySelector(`.category-pill-btn[data-cat="${catParam}"]`);
        const catName = matchingBtn ? matchingBtn.querySelector('.cat-pill-title')?.textContent.trim() : catParam;
        filterCategory(catParam, catName);
    }

    if (prodParam) {
        // Find the card whose image src contains the prodParam
        const targetCard = Array.from(document.querySelectorAll('.products-grid .product-card')).find(card => {
            const img = card.querySelector('img');
            return img && img.getAttribute('src') && img.getAttribute('src').includes(prodParam);
        });

        if (targetCard) {
            // Get the category of the target product
            const catOfProd = targetCard.getAttribute('data-category');
            if (catOfProd && catOfProd !== catParam) {
                const matchingBtn = document.querySelector(`.category-pill-btn[data-cat="${catOfProd}"]`);
                const catName = matchingBtn ? matchingBtn.querySelector('.cat-pill-title')?.textContent.trim() : catOfProd;
                filterCategory(catOfProd, catName);
            }
            
            // Scroll and open modal after a short delay
            setTimeout(() => {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight/pulse the card slightly to draw attention
                targetCard.classList.add('highlight-pulse');
                setTimeout(() => {
                    targetCard.classList.remove('highlight-pulse');
                }, 2000);
                
                // Trigger the modal directly or via click fallback
                if (window.openProductModal) {
                    window.openProductModal(targetCard);
                } else {
                    targetCard.click();
                }
            }, 450);
        }
    }

    // Scroll Reveal Observer for Product Cards & Filter Bar
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe Filter Section & Headers
    document.querySelectorAll('.main-categories-filter-section, .section-title-wrapper, .products-header-animated').forEach(el => {
        revealObserver.observe(el);
    });

    // Observe Product Cards with Staggered Delays
    let visibleIndex = 0;
    productCards.forEach((card) => {
        const staggerDelay = ((visibleIndex % 3) * 0.14) + 0.05;
        card.style.transitionDelay = `${staggerDelay}s`;
        visibleIndex++;
        revealObserver.observe(card);
    });
});


