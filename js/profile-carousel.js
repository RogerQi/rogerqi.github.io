(() => {
  const carousel = document.getElementById("profile-carousel");

  if (!carousel) return;

  const photos = [
    {
      src: "images/swiping/1.jpg",
      alt: "Ri-Zhao (Roger) Qiu with a Shiba Inu",
    },
    {
      src: "images/swiping/2.png",
      alt: "A close-up portrait of a white cat",
    },
  ];

  const frontCard = carousel.querySelector(".profile-card--front");
  const backCard = carousel.querySelector(".profile-card--back");
  const frontImage = frontCard.querySelector("img");
  const backImage = backCard.querySelector("img");
  const status = carousel.querySelector("[data-carousel-status]");

  let currentIndex = 0;
  let pointerId = null;
  let startX = 0;
  let dragX = 0;
  let isAnimating = false;
  const animationDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;

  const wrapIndex = (index) => (index + photos.length) % photos.length;

  function render(direction = 1) {
    const current = photos[currentIndex];
    const next = photos[wrapIndex(currentIndex + direction)];

    frontImage.src = current.src;
    frontImage.alt = current.alt;
    backImage.src = next.src;
    status.textContent = `Photo ${currentIndex + 1} of ${photos.length}: ${current.alt}`;
  }

  function resetCard() {
    frontCard.style.transform = "";
    frontCard.style.opacity = "";
    carousel.classList.remove("is-dragging");
  }

  function moveCard(x) {
    const rotation = Math.max(-11, Math.min(11, x / 16));
    frontCard.style.transform = `translate3d(${x}px, 0, 0) rotate(${rotation}deg)`;
  }

  function cycle(direction) {
    if (isAnimating) return;

    isAnimating = true;
    const exitDirection = direction >= 0 ? 1 : -1;
    const exitDistance = Math.max(carousel.offsetWidth * 1.35, 360);

    frontCard.style.transform = `translate3d(${exitDirection * exitDistance}px, 8px, 0) rotate(${exitDirection * 15}deg)`;
    frontCard.style.opacity = "0";

    window.setTimeout(() => {
      currentIndex = wrapIndex(currentIndex + exitDirection);
      frontCard.style.transition = "none";
      resetCard();
      render(exitDirection);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          frontCard.style.transition = "";
          isAnimating = false;
        });
      });
    }, animationDuration);
  }

  carousel.addEventListener("pointerdown", (event) => {
    if (isAnimating || event.button !== 0) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    dragX = 0;
    carousel.classList.add("is-dragging");
    carousel.setPointerCapture(pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId || isAnimating) return;

    dragX = event.clientX - startX;
    moveCard(dragX);
  });

  function finishPointer(event, cancelled = false) {
    if (event.pointerId !== pointerId) return;

    const distance = dragX;
    const threshold = Math.min(70, carousel.offsetWidth * 0.18);
    pointerId = null;
    carousel.classList.remove("is-dragging");

    if (!cancelled && Math.abs(distance) >= threshold) {
      cycle(distance > 0 ? 1 : -1);
    } else if (!cancelled && Math.abs(distance) < 6) {
      cycle(1);
    } else {
      resetCard();
    }
  }

  carousel.addEventListener("pointerup", (event) => finishPointer(event));
  carousel.addEventListener("pointercancel", (event) => finishPointer(event, true));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      cycle(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      cycle(-1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cycle(1);
    }
  });

  render();
})();
