let observer = null;
let articlesData = [];
let currentPage = 0;
const pageSize = 3;

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

function pushArticleUrl(slug) {
  const newUrl = `/artikel/${slug}`;
  history.pushState({ slug }, "", newUrl);
  updateMetaTags(slug); // Update metadata untuk SEO
}

function resetArticleUrl() {
  history.pushState({}, "", "/");
  updateMetaTags(); // Reset metadata untuk homepage
}

function updateMetaTags(slug = null) {
  const titleEl = document.querySelector("title");
  const descEl = document.querySelector('meta[name="description"]');
  if (slug) {
    const article = articlesData.find((a) => a.slug === slug);
    if (article) {
      titleEl.textContent = article.title || "Artikel";
      if (descEl) descEl.setAttribute("content", article.description || "Deskripsi artikel");
    }
  } else {
    titleEl.textContent = "Daftar Artikel";
    if (descEl) descEl.setAttribute("content", "Daftar artikel tentang kesehatan tulang dan sendi.");
  }
}

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
        const titleMatch = text.match(/TITLE:\s*(.+)/);
        const descMatch = text.match(/DESCRIPTION:\s*(.+)/);

        const title = titleMatch ? titleMatch[1] : "Tanpa Judul";
        const desc = descMatch ? descMatch[1] : "Tanpa Deskripsi";

        const card = document.createElement("a");
        card.href = "javascript:void(0)";
        card.className = "content-artikel";
        card.innerHTML = `
          <img src="${item.gambar}" alt="${title}" loading="lazy"/>
          <h2>${title}</h2>
          <p>${desc}</p>
          <h3>Baca Lebih Lanjut</h3>
        `;

        card.addEventListener("click", () => {
          pushArticleUrl(item.slug);
          showDetail(text, item.gambar, item.tanggal, item.link);
        });

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

function showDetail(text, gambar, tanggal, link) {
  document.body.classList.add("detail-open");

  const detail = document.getElementById("detail-artikel");
  const detailContainer = document.getElementById("detail-container");
  if (!detail || !detailContainer) return;

  detail.style.display = "block";
  detail.classList.remove("leave");
  void detail.offsetWidth;
  detail.classList.add("enter");

  window.scrollTo({ top: 0, behavior: "auto" });

  const title = (text.match(/TITLE:\s*(.+)/) || [])[1] || "";
  const content = (text.match(/CONTENT:\s*([\s\S]*)/) || [])[1] || "";

  detailContainer.innerHTML = `
    <h1>${title}</h1>
    <small><i>Dipublikasikan: ${tanggal || ""}</i></small>
    <img src="${gambar || ""}" alt="${title}" />
    <article>
      ${marked ? marked.parse(content) : content}
      <div class="detail-cta">
        Lindungi kesehatan tulang dan sendi Anda dengan susu kambing bubuk dari
        Skygoat, Sigoat, Sheepbrand, Naturamil, dan Otawa.
        Pembelian hanya di <b>Suka Sehat</b>!
      </div>
    </article>
  `;

  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.addEventListener("click", showList);
}

function showList() {
  const detail = document.getElementById("detail-artikel");
  if (!detail) {
    document.body.classList.remove("detail-open");
    return;
  }

  detail.classList.remove("enter");
  detail.classList.add("leave");

  detail.addEventListener(
    "animationend",
    function handler() {
      detail.style.display = "none";
      document.body.classList.remove("detail-open");
      detail.removeEventListener("animationend", handler);
      renderPage();
      resetArticleUrl();
    },
    { once: true }
  );
}

function cekKoneksi() {
  if (!navigator.onLine && !window.location.pathname.endsWith("error.html")) {
    window.location.href = "error.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollObserver();
  initPreloader();
  initWarnDialog();
  cekKoneksi();

  // Ambil slug dari URL pathname
  const pathParts = window.location.pathname.split("/");
  const slug = pathParts[pathParts.length - 1] !== "artikel" ? pathParts[pathParts.length - 1] : null;

  fetch("artikel.json")
    .then((res) => res.json())
    .then((data) => {
      articlesData = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      if (slug) {
        const found = articlesData.find((a) => a.slug === slug);
        if (found) {
          fetch(found.file)
            .then((r) => r.text())
            .then((t) => {
              showDetail(t, found.gambar, found.tanggal);
              updateMetaTags(slug);
            });
          return;
        }
      }

      renderPage();
      renderControls();
      updateMetaTags();
    });
});

window.addEventListener("popstate", (e) => {
  const slug = e.state && e.state.slug;
  if (slug) {
    const found = articlesData.find((a) => a.slug === slug);
    if (found) {
      fetch(found.file)
        .then((res) => res.text())
        .then((text) => {
          showDetail(text, found.gambar, found.tanggal);
          updateMetaTags(slug);
        });
    }
  } else {
    showList();
    updateMetaTags();
  }
});

window.addEventListener("offline", () => {
  if (!window.location.pathname.endsWith("error.html")) {
    window.location.href = "error.html";
  }
});

window.addEventListener("online", () => {
  if (window.location.pathname.endsWith("error.html")) {
    window.location.href = "index.html";
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./file/sw.js").catch((err) => {
    console.error("Service Worker gagal didaftarkan:", err);
  });
}

function initPreloader() {
  const preloader = document.getElementById("preloader");
  const content = document.getElementById("content");
  setTimeout(() => {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
      content.style.display = "block";
    }, 500);
  }, 1000);
}

function initWarnDialog() {
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

  closeWarn.addEventListener("click", () => {
    warnDialog.close();
  });
}