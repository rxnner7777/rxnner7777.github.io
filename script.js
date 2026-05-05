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

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0];
    }

    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1].split("/")[0];
    }

    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1].split("/")[0];
    }

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

function getCardsWithVideoIds() {
  return Array.from(document.querySelectorAll(".work-card"))
    .map((card) => {
      const link = card.dataset.link || card.querySelector(".video-title")?.href || "";
      const id = getYouTubeId(link);
      return { card, link, id };
    })
    .filter((item) => item.id);
}

function setFallbackCardData() {
  getCardsWithVideoIds().forEach(({ card, link }) => {
    const titleLink = card.querySelector(".video-title");
    const viewsNode = card.querySelector(".views");

    if (titleLink) {
      titleLink.href = link;
    }

    if (viewsNode && !viewsNode.dataset.videoUrl) {
      viewsNode.dataset.videoUrl = link;
    }
  });
}

function sortWorkCardsByViews() {
  document.querySelectorAll(".works-grid").forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".work-card"));

    cards
      .sort((a, b) => {
        const av = Number(a.dataset.viewCount || 0);
        const bv = Number(b.dataset.viewCount || 0);
        return bv - av;
      })
      .forEach((card) => grid.appendChild(card));
  });
}

function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

async function loadYouTubeData() {
  setFallbackCardData();

  const apiKey = window.YOUTUBE_API_KEY;
  if (!apiKey) return;

  const cardItems = getCardsWithVideoIds();
  const ids = [...new Set(cardItems.map((item) => item.id))];

  if (!ids.length) return;

  try {
    const videosById = {};

    for (const chunk of chunkArray(ids, 50)) {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${chunk.join(",")}&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();

      data.items?.forEach((item) => {
        videosById[item.id] = {
          title: item.snippet?.title || "",
          views: item.statistics?.viewCount || ""
        };
      });
    }

    cardItems.forEach(({ card, link, id }) => {
      const video = videosById[id];
      if (!video) return;

      const title = video.title || card.dataset.title || "";
      const rawViews = Number(video.views || 0);
      const formattedViews = formatViews(rawViews);

      card.dataset.title = title;
      card.dataset.link = link;
      card.dataset.viewCount = String(rawViews);

      const titleLink = card.querySelector(".video-title");
      if (titleLink) {
        titleLink.textContent = title;
        titleLink.href = link;
      }

      const image = card.querySelector(".thumb-button img");
      if (image) {
        image.alt = title;
      }

      const viewsNode = card.querySelector(".views");
      if (viewsNode && formattedViews) {
        viewsNode.dataset.videoUrl = link;
        viewsNode.innerHTML = `
          <img class="view-icon" src="assets/icons/view.png" alt="" aria-hidden="true">
          <span>${formattedViews}</span>
        `;
        viewsNode.classList.add("visible");
      }
    });

    sortWorkCardsByViews();
  } catch (error) {
    console.warn("YouTube data could not be loaded:", error);
  }
}

loadYouTubeData();


const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const watchBtn = document.getElementById("watchBtn");

document.addEventListener("click", (event) => {
  const button = event.target.closest(".thumb-button");
  if (!button) return;

  const card = button.closest(".work-card");
  if (!card) return;

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
