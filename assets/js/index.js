document.addEventListener('DOMContentLoaded', () => {
    // 1. STATS COUNT-UP ANIMATION
    const counterNumbers = document.querySelectorAll('.counter-num');
    const counterSpeed = 200; // The lower, the faster

    const startCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / counterSpeed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => startCounter(counter), 15);
        } else {
            counter.innerText = target + (counter.getAttribute('data-suffix') || '');
        }
    };

    // Intersection Observer to trigger counter when visible
    const counterSection = document.querySelector('.counters-container');
    if (counterSection && counterNumbers.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.2
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counterNumbers.forEach(counter => {
                        counter.innerText = '0';
                        startCounter(counter);
                    });
                    // Stop observing once counter is running
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counterObserver.observe(counterSection);
    }

    // 2. TESTIMONIAL / CLIENT REVIEW SLIDER — Seamless Infinite Loop
    const sliderTrack = document.querySelector('.reviews-track');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (sliderTrack) {
        const originalSlides = Array.from(sliderTrack.querySelectorAll('.review-slide'));
        const total = originalSlides.length;
        let currentIndex = 0; // index into original slides (0-based)
        let isTransitioning = false;

        // Clone first and last slides and wrap around
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone  = originalSlides[total - 1].cloneNode(true);
        firstClone.setAttribute('aria-hidden', 'true');
        lastClone.setAttribute('aria-hidden', 'true');

        sliderTrack.appendChild(firstClone);   // clone of first at end
        sliderTrack.insertBefore(lastClone, originalSlides[0]); // clone of last at start

        // After cloning, the track has: [lastClone, slide1, slide2, ..., slideN, firstClone]
        // Real slides start at DOM index 1
        const allSlides = Array.from(sliderTrack.querySelectorAll('.review-slide'));
        const domTotal = allSlides.length; // total + 2 clones

        // Set initial position (show real slide 1 = DOM index 1, no transition)
        let domIndex = 1;
        sliderTrack.style.transition = 'none';
        sliderTrack.style.transform  = `translateX(-${domIndex * 100}%)`;

        // Build dots for real slides only
        originalSlides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                if (!isTransitioning) goToReal(idx);
            });
            dotsContainer?.appendChild(dot);
        });

        const updateDots = () => {
            document.querySelectorAll('.dot').forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        };

        const moveTo = (newDomIndex) => {
            isTransitioning = true;
            sliderTrack.style.transition = 'transform 0.5s ease-in-out';
            sliderTrack.style.transform  = `translateX(-${newDomIndex * 100}%)`;
            domIndex = newDomIndex;
        };

        const goToReal = (realIdx) => {
            currentIndex = realIdx;
            domIndex = realIdx + 1;
            moveTo(domIndex);
            updateDots();
        };

        // After transition ends, silently jump if on a clone
        sliderTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            // If we're on the firstClone (DOM index = domTotal - 1) jump to real slide 1
            if (domIndex === domTotal - 1) {
                sliderTrack.style.transition = 'none';
                domIndex = 1;
                currentIndex = 0;
                sliderTrack.style.transform = `translateX(-${domIndex * 100}%)`;
                updateDots();
            }
            // If we're on the lastClone (DOM index = 0) jump to real last slide
            if (domIndex === 0) {
                sliderTrack.style.transition = 'none';
                domIndex = total;
                currentIndex = total - 1;
                sliderTrack.style.transform = `translateX(-${domIndex * 100}%)`;
                updateDots();
            }
        });

        prevBtn?.addEventListener('click', () => {
            if (isTransitioning) return;
            moveTo(domIndex - 1);
            // Update currentIndex anticipating the jump
            currentIndex = (currentIndex - 1 + total) % total;
            updateDots();
            resetAutoPlay();
        });

        nextBtn?.addEventListener('click', () => {
            if (isTransitioning) return;
            moveTo(domIndex + 1);
            currentIndex = (currentIndex + 1) % total;
            updateDots();
            resetAutoPlay();
        });

        // Autoplay — advance every 5 seconds
        let autoPlayInterval = setInterval(() => {
            if (!isTransitioning) {
                moveTo(domIndex + 1);
                currentIndex = (currentIndex + 1) % total;
                updateDots();
            }
        }, 5000);

        const resetAutoPlay = () => {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                if (!isTransitioning) {
                    moveTo(domIndex + 1);
                    currentIndex = (currentIndex + 1) % total;
                    updateDots();
                }
            }, 5000);
        };
    }

    // 3. PRODUCTS MARQUEE — JS Auto-Scroll + Touch Swiping + Mouse Dragging
    const marqueeWrapper = document.querySelector('.products-marquee-wrapper');
    const marqueePrev    = document.getElementById('marqueePrev');
    const marqueeNext    = document.getElementById('marqueeNext');

    if (marqueeWrapper) {
        const SPEED      = 1.2;   // px per frame
        const CARD_STEP  = 350;   // px per button click
        let   autoScroll = true;
        let   currentScroll = 0;
        let   rafId      = null;
        let   resumeTimer = null;
        let   isDragging  = false;
        let   startX      = 0;
        let   scrollLeftStart = 0;
        let   hasDragged  = false;

        const pauseAndDelayResume = (delayMs = 3500) => {
            autoScroll = false;
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                if (!isDragging) autoScroll = true;
            }, delayMs);
        };

        const tick = () => {
            if (autoScroll && !isDragging) {
                currentScroll += SPEED;
                const half = marqueeWrapper.scrollWidth / 2;
                if (half > 0 && currentScroll >= half) {
                    currentScroll = 0;
                }
                marqueeWrapper.scrollLeft = currentScroll;
            } else {
                currentScroll = marqueeWrapper.scrollLeft;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        // Pause auto-scroll on hover
        marqueeWrapper.addEventListener('mouseenter', () => { autoScroll = false; });
        marqueeWrapper.addEventListener('mouseleave', () => { 
            if (!isDragging) autoScroll = true; 
        });

        // Touch & Mouse Drag Handlers
        const startDrag = (e) => {
            isDragging = true;
            hasDragged = false;
            autoScroll = false;
            marqueeWrapper.classList.add('is-dragging');
            startX = (e.touches ? e.touches[0].pageX : e.pageX) - marqueeWrapper.offsetLeft;
            scrollLeftStart = marqueeWrapper.scrollLeft;
        };

        const moveDrag = (e) => {
            if (!isDragging) return;
            const x = (e.touches ? e.touches[0].pageX : e.pageX) - marqueeWrapper.offsetLeft;
            const walk = (x - startX);
            if (Math.abs(walk) > 35) {
                hasDragged = true;
            }
            let targetScroll = scrollLeftStart - walk;
            const half = marqueeWrapper.scrollWidth / 2;
            if (half > 0) {
                if (targetScroll >= half) targetScroll -= half;
                if (targetScroll < 0) targetScroll += half;
            }
            marqueeWrapper.scrollLeft = targetScroll;
        };

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            marqueeWrapper.classList.remove('is-dragging');
            pauseAndDelayResume(4000);
            setTimeout(() => {
                hasDragged = false;
            }, 10);
        };

        // Touch Listeners for mobile/tablet horizontal swiping
        marqueeWrapper.addEventListener('touchstart', startDrag, { passive: true });
        marqueeWrapper.addEventListener('touchmove', moveDrag, { passive: true });
        marqueeWrapper.addEventListener('touchend', stopDrag);
        marqueeWrapper.addEventListener('touchcancel', stopDrag);

        // Mouse Drag Listeners for desktop horizontal dragging
        marqueeWrapper.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('mouseup', stopDrag);

        // Button clicks — smooth scroll by one card
        const buttonScroll = (dir) => {
            pauseAndDelayResume(3000);
            const half = marqueeWrapper.scrollWidth / 2;
            let target = marqueeWrapper.scrollLeft + dir * CARD_STEP;
            if (half > 0) {
                if (target >= half) target -= half;
                if (target < 0) target += half;
            }
            marqueeWrapper.scrollTo({ left: target, behavior: 'smooth' });
        };

        marqueePrev?.addEventListener('click', () => buttonScroll(-1));
        marqueeNext?.addEventListener('click', () => buttonScroll(1));

        // Card container click redirection
        const productCards = marqueeWrapper.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                e.preventDefault();
                const dest = card.querySelector('a')?.getAttribute('href') || card.getAttribute('href') || 'products.html';
                window.location.href = dest;
            });
        });
    }

    // 5. HERO PRODUCT CAROUSEL SLIDER (producat16 -> producat9 -> producat10 -> photo2 -> producat14)
    const heroProdSlides = document.querySelectorAll('.hero-product-slide');
    const heroProdDots = document.querySelectorAll('.hero-product-dots .dot');

    if (heroProdSlides.length > 0) {
        let currentProdIdx = 0;
        let prodInterval;

        function showProdSlide(index) {
            heroProdSlides.forEach(slide => slide.classList.remove('active'));
            heroProdDots.forEach(dot => dot.classList.remove('active'));

            currentProdIdx = (index + heroProdSlides.length) % heroProdSlides.length;
            heroProdSlides[currentProdIdx].classList.add('active');
            if (heroProdDots[currentProdIdx]) {
                heroProdDots[currentProdIdx].classList.add('active');
            }
        }

        function startProdAutoSlide() {
            prodInterval = setInterval(() => {
                showProdSlide(currentProdIdx + 1);
            }, 3200);
        }

        heroProdDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                clearInterval(prodInterval);
                showProdSlide(idx);
                startProdAutoSlide();
            });
        });

        startProdAutoSlide();
    }

    // 6. HERO SECTION VIEWPORT INTERSECTION ANIMATION TRIGGER
    const heroSection = document.querySelector('.hero-curved-section');
    if (heroSection) {
        heroSection.classList.add('in-view');
        if ('IntersectionObserver' in window) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        heroSection.classList.add('in-view');
                    }
                });
            }, { threshold: 0.1 });
            heroObserver.observe(heroSection);
        }
    }
});
