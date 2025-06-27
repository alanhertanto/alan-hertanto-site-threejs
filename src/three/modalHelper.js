import Swiper from 'swiper/bundle';
import gsap from 'gsap';
// import styles bundle
import 'swiper/css/bundle';

export async function applyModalConfig(modalConfig) {
    const popupImg = document.getElementById("popup-img");
    const myModal = document.getElementById('side-modal');

    // 1) Apply styles
    for (const [key, value] of Object.entries(modalConfig.modalConfig)) {
        const styleKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        myModal.style[styleKey] = value;
    }

    // 2) Fill the slider properly
    if (modalConfig.modalImages.length > 1) {
        const container = document.querySelector('.swiper-wrapper');
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
        modalConfig.modalImages.forEach(element => {
            const divImg = document.createElement('div');
            divImg.className = "swiper-slide";
            const img = document.createElement('img');
            img.src = element.imageLocation;
            img.alt = element.imageTitle;
            img.className = "side-modal-image";

            img.addEventListener("click", () => {
                popupImg.src = img.src;
                popup.classList.remove("hidden");
            });
            divImg.appendChild(img);
            document.querySelector('.swiper-wrapper').appendChild(divImg);
        });
    }
    // 3) Static texts
    document.querySelector('.side-modal-title').textContent = modalConfig.modalHeader;
    document.querySelector('.side-modal-description').textContent = modalConfig.modalDescription;

    // 4) Recreate Swiper cleanly
    if (window.mySwiper) {
        window.mySwiper.destroy(true, true);
    }

    window.mySwiper = new Swiper(".mySwiper", {
        loop: true,
        slidesPerView: 1,
        autoplay: { delay: 7500 },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
    window.mySwiper.on('slideChange', function () {
        modalConfig.modalImages.forEach((image, index) => {
            console.log(`Slide changed to index: ${index}`);
            console.log(`title: ${image.imageTitle}`);
            if (index === window.mySwiper.realIndex) {
                document.querySelector('.side-modal-image-title').textContent = image.imageTitle;
                document.querySelector('.side-modal-image-description').textContent = image.imageDescription;
            }
        });
    });
}

export function openGalleryModal(modalSelector = "#side-modal-with-gallery") {
    gsap.to(modalSelector, {
        x: 0,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => {
            document.querySelector(modalSelector).style.display = 'flex';
        }
    });

}

export function closeGalleryModal() {
    gsap.to("#side-modal-with-gallery", {
        x: '100%',
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            document.querySelector(modalSelector).style.display = 'none';
        }

    });
}

/**
 * Slide in modal from the right
 * @param {string} modalSelector - e.g. "#side-modal"
 */
export function openSideModal(modalSelector = "#side-modal") {
    gsap.to(modalSelector, {
        x: 0,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => {
            document.querySelector(modalSelector).style.display = 'flex';
        }
    });

}

/**
 * Slide out modal to the right
 * @param {string} modalSelector - e.g. "#side-modal"
 */
export function closeSideModal(modalSelector = "#side-modal") {
    gsap.to(modalSelector, {
        x: '100%',
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            document.querySelector(modalSelector).style.display = 'none';
        }
    });

}