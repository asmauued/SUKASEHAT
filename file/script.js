document.addEventListener("DOMContentLoaded", () => {
  // Animasi scroll
  const animatedElements = document.querySelectorAll(".scroll-anim");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
        else entry.target.classList.remove("show");
      });
    },
    { threshold: 0.1 }
  );
  animatedElements.forEach((el) => observer.observe(el));
});

let articlesData = [];
let currentPage = 0;
const pageSize = 3;

fetch("artikel.json")
  .then((res) => res.json())
  .then((data) => {
    articlesData = data;
    renderPage();
    renderControls();
  });

function renderPage() {
  const container = document.getElementById("body-artikel");
  container.innerHTML = "";

  const start = currentPage * pageSize;
  const end = start + pageSize;
  const pageArticles = articlesData.slice(start, end);

  pageArticles.forEach((item) => {
    fetch(item.file)
      .then((res) => res.text())
      .then((text) => {
        const title = (text.match(/TITLE:\s*(.+)/) || [])[1] || "Tanpa Judul";
        const desc =
          (text.match(/DESCRIPTION:\s*(.+)/) || [])[1] || "Tanpa Deskripsi";

        // hanya menampilkan kartu, tanpa aksi klik
        const card = document.createElement("div");
        card.className = "content-artikel";
        card.innerHTML = `
          <img src="${item.gambar}" alt="${title}" loading="lazy"/>
          <h2>${title}</h2>
          <p>${desc}</p>
        `;

        container.appendChild(card);
      });
  });
}

function renderControls() {
  let controls = document.getElementById("pagination-controls");
  if (!controls) {
    controls = document.createElement("section");
    controls.id = "pagination-controls";
    controls.style.textAlign = "center";
    controls.style.margin = "20px";
    controls.innerHTML = `
      <button id="prevBtn">← Sebelumnya</button>
      <button id="nextBtn">Berikutnya →</button>
    `;
    document.getElementById("artikel").appendChild(controls);

    document.getElementById("prevBtn").addEventListener("click", () => {
      if (currentPage > 0) {
        currentPage--;
        renderPage();
      }
    });
    document.getElementById("nextBtn").addEventListener("click", () => {
      if ((currentPage + 1) * pageSize < articlesData.length) {
        currentPage++;
        renderPage();
      }
    });
  }
}

/* --- Bagian lain (cek koneksi, preloader, warning) tetap --- */
function cekKoneksi() {
  if (!navigator.onLine && !window.location.pathname.endsWith("error.html")) {
    window.location.href = "error.html";
  }
}
cekKoneksi();
window.addEventListener("offline", cekKoneksi);
window.addEventListener("online", () => {
  if (window.location.pathname.endsWith("error.html"))
    location.href = "index.html";
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./file/sw.js")
    .catch((err) => console.error("Service Worker gagal:", err));
}

document.addEventListener("DOMContentLoaded", function () {
  const preloader = document.getElementById("preloader");
  const content = document.getElementById("content");
  setTimeout(() => {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
      content.style.display = "block";
    }, 500);
  }, 1000);
});

const warnDialog = document.getElementById("warnDialog");
const closeWarn = document.getElementById("closeWarn");
function showWarning() {
  if (!warnDialog.open) warnDialog.showModal();
}
document.addEventListener(
  "contextmenu",
  (e) => {
    e.preventDefault();
    showWarning();
  },
  true
);
document.addEventListener(
  "keydown",
  (e) => {
    const k = e.key.toLowerCase();
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
      (e.ctrlKey && k === "u")
    ) {
      e.preventDefault();
      showWarning();
    }
  },
  true
);
closeWarn.addEventListener("click", () => warnDialog.close());
