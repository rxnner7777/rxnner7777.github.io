const translations = {
  ru: {
    eyebrow: "ДИЗАЙНЕР ПРЕВЬЮ ЮТУБ",
    heroTitle1: "Превью, которые",
    heroTitle2: "продают клик.",
    heroText: "Привет, я Александр. Мне 21 год, и я уже более 5 лет делаю кликабельные превью для YouTube-роликов.",
    heroCardLabel: "EXPERIENCE",
    portfolioLabel: "НЕКОТОРЫЕ РАБОТЫ",
    portfolioTitle: "Портфолио",
    cisTitle: "СНГ",
    internationalTitle: "Международные",
    watchBtn: "Смотреть ролик"
  },
  en: {
    eyebrow: "YOUTUBE THUMBNAIL DESIGNER",
    heroTitle1: "Thumbnails that",
    heroTitle2: "sell the click.",
    heroText: "Alexander, 21. I have been designing YouTube thumbnails for 5+ years: strong ideas, clean composition, and a clear visual hook for the viewer.",
    heroCardLabel: "EXPERIENCE",
    portfolioLabel: "SOME WORKS",
    portfolioTitle: "Portfolio",
    cisTitle: "CIS",
    internationalTitle: "International",
    watchBtn: "Watch video"
  }
};

const langButtons = document.querySelectorAll("[data-lang-switch]");
const translatable = document.querySelectorAll("[data-i18n]");

function setLanguage(lang) {
  document.documentElement.lang = lang;
  translatable.forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });

  langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langSwitch === lang);
  });

  localStorage.setItem("rxnner-lang", lang);
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.langSwitch));
});

setLanguage(localStorage.getItem("rxnner-lang") || "ru");


function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function formatViews(num) {
  const n = Number(num);
  if (!Number.isFinite(n)) return "";
  if (n >= 1000000) {
    const value = n / 1000000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(".0", "")}M`;
  }
  if (n >= 1000) {
    const value = n / 1000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(".0", "")}K`;
  }
  return String(n);
}

async function loadYouTubeViews() {
  const apiKey = window.YOUTUBE_API_KEY;
  if (!apiKey) return;

  const viewNodes = Array.from(document.querySelectorAll(".views"));
  const ids = [...new Set(viewNodes.map((node) => getYouTubeId(node.dataset.videoUrl)).filter(Boolean))];

  if (!ids.length) return;

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids.join(",")}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return;

    const data = await response.json();
    const viewsById = {};
    data.items?.forEach((item) => {
      viewsById[item.id] = item.statistics?.viewCount;
    });

    viewNodes.forEach((node) => {
      const id = getYouTubeId(node.dataset.videoUrl);
      const count = viewsById[id];
      if (!count) return;
      node.textContent = formatViews(count);
      node.classList.add("visible");
    });
  } catch (error) {
    console.warn("YouTube views could not be loaded:", error);
  }
}

loadYouTubeViews();


const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const watchBtn = document.getElementById("watchBtn");

document.querySelectorAll(".work-card").forEach((card) => {
  const button = card.querySelector(".thumb-button");
  button.addEventListener("click", () => {
    const img = card.dataset.img;
    const title = card.dataset.title;
    const link = card.dataset.link;

    lightboxImg.src = img;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxTitle.href = link;
    watchBtn.href = link;

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-lightbox]").forEach((el) => {
  el.addEventListener("click", closeLightbox);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
