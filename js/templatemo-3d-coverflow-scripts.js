
/* SUNNY MANCSLAND - 3D GALLERY */

document.addEventListener("DOMContentLoaded", function () {

    const gallery = document.querySelector(".sunny-gallery");
    if (!gallery) return;

    const items = Array.from(
        gallery.querySelectorAll(".coverflow-item")
    );

    const container = gallery.querySelector(".coverflow-container");
    const dotsContainer = gallery.querySelector("#dots");
    const prevButton = gallery.querySelector(".nav-button.prev");
    const nextButton = gallery.querySelector(".nav-button.next");

    if (!items.length || !container) return;

    let currentIndex = 0;
    let autoplayInterval = null;
    let touchStartX = 0;
    let touchStartY = 0;

    /* 3D GALLERY POSITIONING */

    function updateCoverflow() {

        const mobile = window.innerWidth <= 768;
        const spacing = mobile ? 125 : 220;
        const depth = mobile ? 115 : 200;

        items.forEach((item, index) => {

            let offset = index - currentIndex;

            if (offset > items.length / 2) {
                offset -= items.length;
            }

            if (offset < -items.length / 2) {
                offset += items.length;
            }

            const distance = Math.abs(offset);
            const direction = Math.sign(offset);

            item.style.transform = `
                translateX(${offset * spacing}px)
                translateZ(${-distance * depth}px)
                rotateY(${-direction * Math.min(distance * 60, 60)}deg)
                scale(${Math.max(0.7, 1 - distance * 0.1)})
            `;

            item.style.opacity =
                distance > 3 ? "0" : String(1 - distance * 0.2);

            item.style.zIndex = String(100 - distance);

            item.style.pointerEvents =
                distance > 3 ? "none" : "auto";

            item.classList.toggle(
                "active",
                index === currentIndex
            );
        });

        if (dotsContainer) {
            Array.from(dotsContainer.children).forEach(
                (dot, index) => {
                    dot.classList.toggle(
                        "active",
                        index === currentIndex
                    );
                }
            );
        }
    }

    function goToIndex(index) {
        currentIndex = (index + items.length) % items.length;
        updateCoverflow();
        restartAutoplay();
    }

    function navigate(direction) {
        goToIndex(currentIndex + direction);
    }

    /* NAVIGATION DOTS */

    if (dotsContainer) {
        dotsContainer.innerHTML = "";

        items.forEach((item, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "dot";
            dot.setAttribute("aria-label", `Kép ${index + 1}`);

            dot.addEventListener("click", () => {
                goToIndex(index);
            });

            dotsContainer.appendChild(dot);
        });
    }

    /* GALLERY ARROWS */

    if (prevButton) {
        prevButton.addEventListener("click", () => navigate(-1));
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => navigate(1));
    }

    /* FULLSCREEN LIGHTBOX */

    const lightbox = document.getElementById("sunnyLightbox");
    const lightboxImage = document.getElementById("sunnyLightboxImage");

    if (lightbox && lightboxImage) {

        // Put the lightbox above the entire website.
        document.body.appendChild(lightbox);

        let previousOverflow = "";

        function openLightbox(index) {
            const image = items[index].querySelector("img");
            if (!image) return;

            lightboxImage.src = image.currentSrc || image.src;
            lightboxImage.alt = image.alt;

            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";

            lightbox.hidden = false;
            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");

            stopAutoplay();
        }

        function closeLightbox() {
            lightbox.classList.remove("open");
            lightbox.hidden = true;
            lightbox.setAttribute("aria-hidden", "true");

            lightboxImage.removeAttribute("src");
            document.body.style.overflow = previousOverflow;

            startAutoplay();
        }

        // Click any photograph to enlarge it.
        items.forEach((item, index) => {
            item.addEventListener("click", () => {
                openLightbox(index);
            });
        });

        // Click outside the photograph to close.
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        // Escape key closes the photograph.
        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                lightbox.classList.contains("open")
            ) {
                closeLightbox();
            }
        });
    }

    /* MOBILE SWIPE */

    container.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener("touchend", (event) => {

        const dx =
            touchStartX - event.changedTouches[0].screenX;

        const dy =
            touchStartY - event.changedTouches[0].screenY;

        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            navigate(dx > 0 ? 1 : -1);
        }

    }, { passive: true });

    /* IMAGE REFLECTIONS */

    items.forEach((item) => {
        const image = item.querySelector("img");
        const reflection = item.querySelector(".reflection");

        if (!image || !reflection) return;

        reflection.style.backgroundImage =
            `url("${image.src}")`;

        reflection.style.backgroundSize = "cover";
        reflection.style.backgroundPosition = "center";
    });

    /* AUTOMATIC SLIDESHOW */

    function stopAutoplay() {
        if (autoplayInterval !== null) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function startAutoplay() {
        stopAutoplay();

        if (window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches) return;

        if (
            lightbox &&
            lightbox.classList.contains("open")
        ) return;

        autoplayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % items.length;
            updateCoverflow();
        }, 4000);
    }

    function restartAutoplay() {
        if (autoplayInterval !== null) {
            startAutoplay();
        }
    }

    /* KEYBOARD ARROWS */

    container.addEventListener("keydown", (event) => {
        if (
            lightbox &&
            lightbox.classList.contains("open")
        ) return;

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(-1);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(1);
        }
    });

    /* RESPONSIVE */

    window.addEventListener("resize", updateCoverflow);

    /* INITIALIZE */

    updateCoverflow();
    startAutoplay();

});
