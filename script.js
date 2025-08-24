document.addEventListener("DOMContentLoaded", () => {
  console.log("MedSupport site loaded.");

  // Initialize database
  if (typeof Database !== 'undefined') {
    Database.init();
  }

  const heroHeading = document.querySelector(".hero-text h2");
  const heroPara = document.querySelector(".hero-text p");
  if (!heroHeading) return;

  // Smooth text update with fade transition
  const setText = (text) => {
    heroHeading.classList.remove("fade-in");
    heroHeading.classList.add("fade-out");

    setTimeout(() => {
      heroHeading.textContent = text;
      if (heroPara) heroPara.textContent = ""; // clear subtext
      heroHeading.classList.remove("fade-out");
      heroHeading.classList.add("fade-in");
    }, 500);
  };

  // Local fallback lines
  const localHealthLines = [
    "Health is the greatest wealth.",
    "A healthy outside starts from the inside.",
    "Small daily habits compound into lifelong health.",
    "Sleep, movement, sunlight, hydration — your daily multivitamin.",
    "Take care of your body; it's the only place you have to live. — Jim Rohn",
    "Your future self is built by today's choices.",
    "Move more, stress less, eat real food.",
    "Make rest part of the plan, not an afterthought."
  ];

  // Quote fetching
  async function fetchQuote() {
    try {
      const res = await fetch("https://api.quotable.io/random?tags=health", { cache: "no-store" });
      if (!res.ok) throw new Error("health tag not ok");
      const data = await res.json();
      if (data?.content) {
        setText(`${data.content} — ${data.author ?? "Unknown"}`);
        return;
      }
      throw new Error("no content from health tag");
    } catch {
      try {
        const res2 = await fetch("https://api.quotable.io/random?tags=inspirational|life", { cache: "no-store" });
        if (!res2.ok) throw new Error("general tags not ok");
        const data2 = await res2.json();
        if (data2?.content) {
          setText(`${data2.content} — ${data2.author ?? "Unknown"}`);
          return;
        }
        throw new Error("no content from general tags");
      } catch {
        // Final fallback: local list
        const random = localHealthLines[Math.floor(Math.random() * localHealthLines.length)];
        setText(random);
        console.warn("Using local fallback health line.");
      }
    }
  }

  // First quote + interval refresh
  fetchQuote();
  setInterval(fetchQuote, 10000);

  // === Background slideshow ===
  const bgContainer = document.querySelector(".background-slideshow");
  if (bgContainer) {
    const bgImages = [
      "https://img.freepik.com/free-photo/medical-banner-with-doctor-wearing-gloves_23-2149611206.jpg",
      "https://img.freepik.com/free-photo/healthcare-concept-with-hands-holding-stethoscope_23-2149241269.jpg",
      "https://img.freepik.com/free-photo/medical-banner-with-stethoscope_23-2149611195.jpg"
    ];

    let bgIndex = 0;
    bgImages.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      if (i === 0) img.classList.add("active");
      bgContainer.appendChild(img);
    });

    const bgSlides = bgContainer.querySelectorAll("img");
    setInterval(() => {
      bgSlides[bgIndex].classList.remove("active");
      bgIndex = (bgIndex + 1) % bgSlides.length;
      bgSlides[bgIndex].classList.add("active");
    }, 4000);
  }

  // === Dropdown menu ===
  const dropBtn = document.querySelector(".dropbtn");
  const dropdownContent = document.querySelector(".dropdown-content");
  if (dropBtn && dropdownContent) {
    dropBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dropdownContent.classList.toggle("show");
    });

    window.addEventListener("click", (e) => {
      if (!e.target.matches(".dropbtn")) {
        dropdownContent.classList.remove("show");
      }
    });
  }
});

document.getElementById("chatbot-toggle").addEventListener("click", () => {
  const bot = document.getElementById("chatbot-container");
  bot.style.display = bot.style.display === "none" ? "block" : "none";
});
