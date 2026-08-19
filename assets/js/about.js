// ============================================================
//  ORBIT BADGE TRACKER
//  Badges live OUTSIDE the spinning ring so they never inherit
//  CSS rotation. Each frame we compute the exact angle of each
//  circle and place the badge radially further out.
// ============================================================

(function () {
    'use strict';

    // Must match the CSS animation on .orbit-spin-ring
    var ORBIT_DURATION_MS = 32000; // 32 s

    // Badge orbit radius from wheel center (px) — must be > circle-center-radius + circle-radius
    // Circles: center at R=175, circle radius=62.5 → outer edge at 237.5px
    // Badge at 310px gives a ~72px gap so text floats cleanly around perimeter
    var BADGE_RADIUS = 310;


    // Initial angles for each node (degrees from top, clockwise)
    // Node 1 = 0°(top), 2 = 60°, 3 = 120°, 4 = 180°, 5 = 240°, 6 = 300°
    var INIT_ANGLES = [0, 60, 120, 180, 240, 300];

    var badges = null;
    var container = null;
    var cx = 290; // default: half of 580px
    var cy = 290;

    function init() {
        container = document.querySelector('.process-orbit-container');
        if (!container) return;

        badges = container.querySelectorAll('.orbit-badge-pos');
        if (!badges.length) return;

        // Re-read center in case responsive CSS changed the container size
        cx = container.offsetWidth  / 2;
        cy = container.offsetHeight / 2;

        requestAnimationFrame(tick);
    }

    function tick(timestamp) {
        // How far through one full revolution are we? (0 → 1)
        var progress = (timestamp % ORBIT_DURATION_MS) / ORBIT_DURATION_MS;

        // Degrees the spin ring has rotated (clockwise, same as CSS animation)
        var orbitDeg = progress * 360;

        // On phone view (width <= 768), pull text badges right next to photo circles (220px)
        // On laptop/desktop (width > 768), keep original radius (BADGE_RADIUS = 310px)
        var currentRadius = window.innerWidth <= 768 ? 220 : BADGE_RADIUS;









        for (var i = 0; i < badges.length; i++) {
            var initAngle = INIT_ANGLES[i];                         // starting angle (deg)
            var totalDeg  = (initAngle + orbitDeg) % 360;           // current angle (deg)

            // Convert to radians; 0° = top means we subtract 90° before converting
            var rad = (totalDeg - 90) * (Math.PI / 180);

            var x = cx + currentRadius * Math.cos(rad);
            var y = cy + currentRadius * Math.sin(rad);

            badges[i].style.left = x + 'px';
            badges[i].style.top  = y + 'px';
        }

        requestAnimationFrame(tick);
    }


    // Scroll Reveal Observer for What We Do & Infrastructure sections
    function setupScrollReveal() {
        var revealSections = document.querySelectorAll('.what-we-do-section, .infra-section');
        if (!revealSections.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealSections.forEach(function (sec) {
            observer.observe(sec);
        });
    }

    // Boot when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            setupScrollReveal();
        });
    } else {
        init();
        setupScrollReveal();
    }

    // Re-read center on resize (responsive layouts change container size)
    window.addEventListener('resize', function () {
        if (container) {
            cx = container.offsetWidth  / 2;
            cy = container.offsetHeight / 2;
        }
    });

})();

