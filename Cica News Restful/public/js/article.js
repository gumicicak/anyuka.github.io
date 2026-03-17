// article.js
import { fetchNewsData, parseArticleText } from "./newsData.js";

async function loadArticle() {
  const newsData = await fetchNewsData(); // Load data from backend
  
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");
  
  // Find the article (converting ID to string for safe comparison)
  const article = newsData.find(a => String(a.id) === articleId);

  const titleEl = document.getElementById("articleTitle");
  const textEl = document.getElementById("articleText");
  const metaEl = document.getElementById("articleMeta");
  const siteTitle = document.getElementById("siteTitle");

  if (article) {
    const details = parseArticleText(article.text);

    if (details.imagePath) {
      const img = document.createElement("img");
      img.src = details.imagePath;
      img.style.width = "100%";
      img.style.marginBottom = "20px";
      img.style.borderRadius = "8px";
      
      textEl.parentNode.insertBefore(img, textEl);
    }

    titleEl.textContent = article.title;
    textEl.textContent = details.text;
    metaEl.textContent = `Category: ${article.category} | Author: ${article.writer} | Date: ${article.date}`;
    siteTitle.textContent = `Modern Hírek : ${article.category}`;
    siteTitle.dataset.category = article.category;
  } else {
    titleEl.textContent = "Cikk nem található";
    textEl.textContent = "A keresett tartalom nem elérhető.";
  }
}

// Navbar Functionality
const navbarItems = document.querySelectorAll(".navbar-right li");
navbarItems.forEach(li => {
  li.addEventListener("click", () => {
    window.location.href = `index.html?category=${encodeURIComponent(li.dataset.category)}`;
  });
});

const siteTitleEl = document.getElementById("siteTitle");
siteTitleEl.addEventListener("click", () => {
  const category = siteTitleEl.dataset.category || "all";
  window.location.href = category !== "all" ? `index.html?category=${category}` : "index.html";
});

loadArticle();