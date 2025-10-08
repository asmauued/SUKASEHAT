let observer = null;

function initScrollObserver() {
  if (observer) return;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
        else entry.target.classList.remove("show");
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".scroll-anim").forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollObserver();
  initPreloader();
  initWarnDialog();
  cekKoneksi();

  fetch("artikel.json")
    .then((res) => res.json())
    .then((data) => {
      articlesData = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      renderPage();
      renderControls();

      const slug = new URLSearchParams(location.search).get("slug");
      if (slug) {
        const found = articlesData.find((a) => a.slug === slug);
        if (found) {
          fetch(found.file)
            .then((r) => r.text())
            .then((t) => showDetail(t, found.gambar, found.tanggal));
        }
      }
    });
});

let articlesData = [];
let currentPage = 0;
const pageSize = 3;

function pushArticleUrl(slug) {
  history.pushState({ slug }, "", `?slug=${slug}`);
}

function showDetail(text, gambar, tanggal) {
  const detailContainer = document.querySelector("#detail");
  const detail = document.querySelector(".detail");
  const list = document.querySelector(".list");

  list.classList.add("leave");
  detail.classList.remove("hidden");
  detail.classList.add("enter");

  const title = (text.match(/TITLE:\s*(.+)/) || [])[1] || "";
  const content = (text.match(/CONTENT:\s*([\s\S]*)/) || [])[1] || "";

  const renderedContent = marked ? marked.parse(content) : content;
  const tags = extractTags(text);

  const keyword = tags[0] || title.split(":")[0];
  const seoCheck = checkKeyword(content, keyword);

  detailContainer.innerHTML = `
    <article>
      <h1>${title}</h1>
      <p class="tanggal">${tanggal}</p>
      <img src="${gambar}" alt="${title}" loading="lazy">
      <div class="content scroll-anim">${renderedContent}</div>
      <div class="suka-sehat-mention">
        Skygoat, Sigoat, Sheepbrand, Naturamil, dan Otawa.
        Pembelian hanya di <b>Suka Sehat</b>!
      </div>
    </article>
  `;

  // Hanya tampil di perangkat kamu (jika aktifkan debug mode)
  if (isMyDevice()) {
    detailContainer.innerHTML += `
      <div class="seo-check">
        <h3>Analisis Kata Kunci</h3>
        <p>Kata Kunci: <b>${seoCheck.keyword}</b></p>
        <p>Kemunculan: ${seoCheck.occurrences} kali</p>
        <p>Kepadatan: ${seoCheck.density}</p>
      </div>
    `;
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.addEventListener("click", showList);
}

window.addEventListener("popstate", (e) => {
  if (e.state && e.state.slug) {
    const found = articlesData.find((a) => a.slug === e.state.slug);
    if (found) {
      fetch(found.file)
        .then((res) => res.text())
        .then((text) => showDetail(text, found.gambar, found.tanggal));
    }
  } else {
    showList();
  }
});

function checkKeyword(articleText, keyword) {
  if (!articleText || !keyword) return { keyword, occurrences: 0, totalWords: 0, density: "0%" };

  const text = articleText.toLowerCase();
  const key = keyword.toLowerCase();
  const totalWords = text.split(/\s+/).length;
  const regex = new RegExp(`\\b${key}\\b`, "gi");
  const matches = text.match(regex);
  const count = matches ? matches.length : 0;
  const density = ((count / totalWords) * 100).toFixed(2);

  return { keyword, occurrences: count, totalWords, density: density + "%" };
}

function extractTags(text) {
  const tagMatch = text.match(/TAG:\s*(.+)/i);
  if (!tagMatch) return [];
  return tagMatch[1]
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

// Aktifkan hanya di perangkat kamu (gunakan localStorage)
function isMyDevice() {
  return localStorage.getItem("seoDebug") === "on";
}
