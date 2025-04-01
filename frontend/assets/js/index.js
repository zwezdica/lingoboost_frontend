
const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Marko, Student",
    text: "LingoBoost helped me improve my vocabulary by 40% in just 2 months!",
    image: "./assets/img/user1.jpg",
  },
  {
    id: 2,
    name: "Ana, Teacher",
    text: "The best language learning app I've used. The interactive quizzes are phenomenal!",
    image: "./assets/img/user2.jpg",
  },
  {
    id: 3,
    name: "Ivan, Manager",
    text: "Thanks to LingoBoost, I finally mastered German for my job.",
    image: "./assets/img/user3.jpg",
  },
  {
    id: 4,
    name: "Tijana, Travel Blogger",
    text: "LingoBoost made learning Spanish so enjoyable! I went from basic phrases to full conversations in just 3 months. Now I can connect with locals during my travels.",
    image: "./assets/img/user4.jpg",
  },
  {
    id: 5,
    name: "Bojan, Software Engineer",
    text: "As someone who struggles with traditional learning methods, the interactive approach of LingoBoost was a game-changer. I finally understand German grammar!",
    image: "./assets/img/user5.jpg",
  },
  {
    id: 6,
    name: "Ivana, College Student",
    text: "The video lessons are incredibly engaging. I've learned more French in two weeks with LingoBoost than in a semester of college classes.",
    image: "./assets/img/user6.jpg",
  },
  {
    id: 7,
    name: "Danijel, Chef",
    text: "Learning food terminology in Italian transformed my culinary skills. My restaurant's new authentic menu is getting rave reviews!",
    image: "./assets/img/user7.jpg",
  },
];

const VIDEO_DATA = [
  {
    id: "EXa5OWG4XeY",
    title: "French Short Story",
    lang: "french",
    desc: "Improve French conversation skills",
  },
  {
    id: "ANg1z8rtBls",
    title: "Italian Modal Verbs",
    lang: "italian",
    desc: "Learn essential Italian verbs",
  },
  {
    id: "KwV3n70nl6M",
    title: "German Cartoon",
    lang: "german",
    desc: "Learn German through animation",
  },
  {
    id: "5gCVXA_Nw1A",
    title: "Spanish Conversation",
    lang: "spanish",
    desc: "Animated story with English subtitles",
  },
];

const NAV_ITEMS = [
  { href: "quiz.html", icon: "fa-question-circle", text: "Quiz" },
  { href: "dragdrops.html", icon: "fa-hand-paper", text: "Drag and Drop" },
  { href: "flashcards.html", icon: "fa-clone", text: "Flashcards" },
  { href: "guesswords.html", icon: "fa-keyboard", text: "Guess Word" },
  { href: "bingo.html", icon: "fa-gamepad", text: "Bingo", badge: "Try Out" },
  { href: "dictionary.html", icon: "fa-book", text: "Dictionary" },
];


document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  
  emailjs.init("LEzidInbrwbSSGvkt");

  
  createLoadingIndicator(app);

  
  createHeader(app);

  
  setupTheme();

  
  createIntroSection(app);
  createAnimationImage(app);
  createLoginForm(app);
  createTestimonialsSection(app);
  createVideoLessonsSection(app);
  createContactForm(app);
  createFooter(app);

  
  checkAuthState();

  
  document.getElementById("loading")?.remove();
});


function setupEventListeners() {
  document
    .getElementById("themeToggle")
    ?.addEventListener("click", toggleTheme);

  
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);

  
  document.getElementById("registerBtn")?.addEventListener("click", () => {
    window.location.href = "register.html";
  });

  
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);

  
  document
    .getElementById("contactForm")
    ?.addEventListener("submit", handleContactSubmit);

  
  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("successModal").style.display = "none";
  });
}


function createLoadingIndicator(parent) {
  const loading = document.createElement("div");
  loading.id = "loading";
  loading.textContent = "Loading...";
  parent.appendChild(loading);
}

function createHeader(parent) {
  const header = document.createElement("header");

  
  const themeToggle = document.createElement("button");
  themeToggle.id = "themeToggle";
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  header.appendChild(themeToggle);

  
  const logo = document.createElement("h1");
  logo.className = "logo";
  logo.innerHTML = '<i class="fas fa-comment"></i> LingoBoost';
  header.appendChild(logo);

  
  const nav = document.createElement("nav");
  const navList = document.createElement("ul");
  navList.className = "nav-list";

  NAV_ITEMS.forEach((item) => {
    const listItem = document.createElement("li");
    const navLink = document.createElement("a");
    navLink.href = item.href;

    const icon = document.createElement("i");
    icon.className = `fas ${item.icon}`;
    navLink.appendChild(icon);

    const text = document.createElement("span");
    text.textContent = item.text;
    navLink.appendChild(text);

    if (item.badge) {
      const badge = document.createElement("span");
      badge.className = "nav-badge";
      badge.textContent = item.badge;
      navLink.appendChild(badge);
    }

    listItem.appendChild(navLink);
    navList.appendChild(listItem);
  });

  nav.appendChild(navList);
  header.appendChild(nav);

  
  const userInfo = document.createElement("div");
  userInfo.className = "user-info";
  userInfo.id = "userInfo";
  userInfo.style.display = "none";
  userInfo.innerHTML = `
    <span id="username"></span>
    <button id="logoutBtn">
      <i class="fas fa-sign-out-alt"></i> Logout
    </button>
    <a href="admin.html" id="adminLink" style="display: none;">
      <i class="fas fa-cogs"></i> Admin Panel
    </a>
  `;
  header.appendChild(userInfo);
  parent.appendChild(header);
}

function createIntroSection(parent) {
  const intro = document.createElement("div");
  intro.className = "intro";
  intro.innerHTML = `
    <h2>Welcome to LingoBoost</h2>
    <p>Boost your vocabulary through interactive games that make learning addictive! LingoBoost turns language mastery into playtime with:
Drag & Drop puzzles • Bingo with words • Flashcards that stick •
Quiz challenges • Dictionary lookup • Guess Words brain teaser <br>
The fun way to learn – no textbooks needed!</p>
  `;
  parent.appendChild(intro);
}

function createAnimationImage(parent) {
  const animationImg = document.createElement("img");
  animationImg.src = "./assets/img/animation.gif";
  animationImg.alt = "animation";
  parent.appendChild(animationImg);
}

function createLoginForm(parent) {
  if (!document.getElementById("loginForm")) {
    const loginForm = document.createElement("form");
    loginForm.id = "loginForm";
    loginForm.innerHTML = `
      <input type="text" id="loginUsername" placeholder="Username" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <div class="form-buttons">
        <button type="submit">
          <i class="fas fa-sign-in-alt"></i> Login
        </button>
        <span class="or-text">OR</span>
        <button type="button" id="registerBtn">
          <i class="fas fa-user-plus"></i> Register
        </button>
      </div>
    `;
    parent.appendChild(loginForm);
  }
}

function createTestimonialsSection(parent) {
  const testimonialsSection = document.createElement("section");
  testimonialsSection.className = "testimonials";
  testimonialsSection.innerHTML = `
    <h2>What Our Users Say</h2>
    <div class="testimonial-carousel">
      <div class="carousel-container"></div>
      <div class="carousel-dots"></div>
      <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
      <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
    </div>
  `;

  const carouselContainer = testimonialsSection.querySelector(
    ".carousel-container"
  );
  TESTIMONIALS_DATA.forEach((testimonial, index) => {
    const slide = document.createElement("div");
    slide.className = `testimonial-slide ${index === 0 ? "active" : ""}`;
    slide.innerHTML = `
      <img src="${testimonial.image}" alt="${testimonial.name}" class="testimonial-img">
      <p>"${testimonial.text}"</p>
      <span class="testimonial-author">- ${testimonial.name}</span>
    `;
    carouselContainer.appendChild(slide);
  });

  parent.appendChild(testimonialsSection);
  initCarousel(testimonialsSection.querySelector(".testimonial-carousel"));
}

function createVideoLessonsSection(parent) {
  const videoLessons = document.createElement("section");
  videoLessons.className = "video-lessons";
  videoLessons.innerHTML = `
    <h2>Interactive Video Lessons</h2>
    <p>Learn languages through engaging video content</p>
    <div class="language-tabs">
      <div class="language-tab active" data-lang="all">All Languages</div>
      <div class="language-tab" data-lang="french">French</div>
      <div class="language-tab" data-lang="italian">Italian</div>
      <div class="language-tab" data-lang="german">German</div>
      <div class="language-tab" data-lang="spanish">Spanish</div>
    </div>
    <div class="video-grid"></div>
  `;

  const videoGrid = videoLessons.querySelector(".video-grid");
  VIDEO_DATA.forEach((video) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.dataset.lang = video.lang;

    card.innerHTML = `
      <div class="video-container">
        <div class="video-placeholder" data-video-id="${video.id}">
          <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}">
          <button class="play-button"><i class="fas fa-play"></i></button>
        </div>
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.desc}</p>
      </div>
    `;

    const placeholder = card.querySelector(".video-placeholder");
    placeholder.addEventListener("click", () => {
      placeholder.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${video.id}?autoplay=1" 
                title="${video.title}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      `;
    });

    videoGrid.appendChild(card);
  });

  const tabs = videoLessons.querySelectorAll(".language-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const selectedLang = tab.dataset.lang;
      const videos = videoGrid.querySelectorAll(".video-card");

      videos.forEach((video) => {
        video.style.display =
          selectedLang === "all" || video.dataset.lang === selectedLang
            ? "block"
            : "none";
      });
    });
  });

  parent.appendChild(videoLessons);
}

function createContactForm(parent) {
  const contactForm = document.createElement("form");
  contactForm.id = "contactForm";
  contactForm.innerHTML = `
    <h2>Contact Us</h2>
    <input type="text" id="contactName" placeholder="Your Name" required />
    <input type="email" id="contactEmail" placeholder="Your Email" required />
    <textarea id="contactMessage" placeholder="Your Message" required></textarea>
    <button type="submit">Send Message</button>

    <div id="successModal" class="modal" style="display: none;">  
      <div class="modal-content">
        <p>✅ Your message has been sent successfully!</p>
        <button id="closeModal">OK</button>
      </div>
    </div>
  `;
  parent.appendChild(contactForm);
}

function createFooter(parent) {
  const footer = document.createElement("footer");
  footer.className = "main-footer";
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-logo">
        <i class="fas fa-comment"></i> LingoBoost
      </div>
      
      <div class="social-links">
        <a href="#"><i class="fab fa-facebook"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fab fa-instagram"></i></a>
        <a href="#"><i class="fab fa-youtube"></i></a>
      </div>
      <div class="copyright">
        &copy; Copyright LingoBoost 2025. All rights reserved.
      </div>
    </div>
  `;
  parent.appendChild(footer);
}


function setupTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';

  themeToggle.title =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}


function checkAuthState() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "user";
  const username = localStorage.getItem("username") || "User";

  if (token) {
    showLoggedInUI(role, username);
  } else {
    showLoginUI();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameInput, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role || "user");
    localStorage.setItem("username", data.username || usernameInput);

    showLoggedInUI(data.role, data.username || usernameInput);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Login Error:", error);
    alert(error.message || "Login failed");
  }
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

function showLoggedInUI(role, username) {
  const displayRole = role || "user";
  const displayUsername = username || "User";

  const loginForm = document.getElementById("loginForm");
  const registerBtn = document.getElementById("registerBtn");
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");
  const usernameElement = document.getElementById("username");
  const adminLink = document.getElementById("adminLink");

  if (loginForm) loginForm.style.display = "none";
  if (registerBtn) registerBtn.style.display = "none";
  if (userInfo) userInfo.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "block";

  if (usernameElement) usernameElement.textContent = displayUsername;

  if (adminLink) {
    adminLink.style.display = displayRole === "admin" ? "inline-block" : "none";
  }
}

function showLoginUI() {
  const loginForm = document.getElementById("loginForm");
  const registerBtn = document.getElementById("registerBtn");
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminLink = document.getElementById("adminLink");

  if (loginForm) loginForm.style.display = "block";
  if (registerBtn) registerBtn.style.display = "block";
  if (userInfo) userInfo.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "none";
  if (adminLink) adminLink.style.display = "none";
}


function handleContactSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;
  const modal = document.getElementById("successModal");

  emailjs
    .send("service_px1hwjy", "template_j9oo3or", {
      name: name,
      email: email,
      message: message,
    })
    .then(
      () => {
        modal.style.display = "flex";
        event.target.reset();
      },
      () => {
        alert("❌ Error sending message. Please try again.");
      }
    );
}


function initCarousel(carouselElement) {
  const container = carouselElement.querySelector(".carousel-container");
  const slides = carouselElement.querySelectorAll(".testimonial-slide");
  const dotsContainer = carouselElement.querySelector(".carousel-dots");
  const prevBtn = carouselElement.querySelector(".carousel-prev");
  const nextBtn = carouselElement.querySelector(".carousel-next");

  let currentIndex = 0;
  let interval;

  function createDots() {
    dotsContainer.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = `dot ${index === 0 ? "active" : ""}`;
      dot.dataset.index = index;
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlide(newIndex) {
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    slides[currentIndex].classList.remove("active");
    dotsContainer.querySelector(".dot.active")?.classList.remove("active");

    currentIndex = newIndex;
    slides[currentIndex].classList.add("active");
    dotsContainer
      .querySelector(`.dot[data-index="${currentIndex}"]`)
      .classList.add("active");
  }

  function setupEventListeners() {
    prevBtn.addEventListener("click", () => {
      resetInterval();
      updateSlide(currentIndex - 1);
    });

    nextBtn.addEventListener("click", () => {
      resetInterval();
      updateSlide(currentIndex + 1);
    });

    dotsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("dot")) {
        resetInterval();
        updateSlide(parseInt(e.target.dataset.index));
      }
    });

    let touchStartX = 0;
    container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        resetInterval();
      },
      { passive: true }
    );

    container.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (diff > 50) updateSlide(currentIndex + 1);
        else if (diff < -50) updateSlide(currentIndex - 1);
        startInterval();
      },
      { passive: true }
    );

    carouselElement.addEventListener("mouseenter", resetInterval);
    carouselElement.addEventListener("mouseleave", startInterval);
  }

  function startInterval() {
    interval = setInterval(() => updateSlide(currentIndex + 1), 5000);
  }

  function resetInterval() {
    clearInterval(interval);
  }

  createDots();
  setupEventListeners();
  startInterval();
}


document.addEventListener("DOMContentLoaded", setupEventListeners);
