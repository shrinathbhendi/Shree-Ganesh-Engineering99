document.addEventListener('DOMContentLoaded', () => {
    // GALLERY LIGHTBOX INTERACTIVITY FOR PINTEREST CARDS
    const galleryItems = document.querySelectorAll('.pinterest-card, .gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (galleryItems.length > 0 && lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const title = item.querySelector('.pinterest-title, .gallery-overlay h4')?.innerText || img?.alt || '';
                
                if (img) {
                    lightboxImg.src = img.src;
                    if (lightboxCaption) lightboxCaption.innerText = title;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Stop page scrolling
                }
            });
        });

        lightboxClose?.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Scroll reveal observer for pinterest cards (one-by-one down to up rise)
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                galleryObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.pinterest-card').forEach((card, index) => {
        const delay = ((index % 4) * 0.12) + 0.05;
        card.style.transitionDelay = `${delay}s`;
        galleryObserver.observe(card);
    });
});

