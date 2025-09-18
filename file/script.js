document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(".scroll-anim");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        } else {
          entry.target.classList.remove("show");
        }
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
          showDetail(text, item.gambar, item.tanggal);
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
    controls.style.backgroundColorcolor = "#e8ffd7";
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

function showDetail(text, gambar, tanggal) {
  const body = document.body;
  const detail = document.getElementById("detail-artikel");
  const detailContainer = document.getElementById("detail-container");

  Array.from(body.children).forEach((el) => {
    if (el.id !== "detail-artikel") {
      el.style.display = "none";
    }
  });

  detail.style.display = "block";
  detail.classList.remove("leave");
  void detail.offsetWidth;
  detail.classList.add("enter");
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    detail.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 50);

  const title = (text.match(/TITLE:\s*(.+)/) || [])[1] || "";
  const contentMatch = text.match(/CONTENT:\s*([\s\S]*)/);
  const content = contentMatch ? contentMatch[1] : "";

  detailContainer.innerHTML = `
    <h1>${title}</h1>
    <small><i>Dipublikasikan: ${tanggal}</i></small>
    <img src="${gambar}" alt="${title}" />
    <article>
      ${marked.parse(content)}
      <div class="detail-cta">
        Lindungi kesehatan tulang dan sendi Anda dengan susu kambing bubuk dari
        Skygoat, Sigoat, Sheepbrand, Naturamil, dan Otawa. 
        Pembelian hanya di <b>Suka Sehat</b>!
      </div>
    </article>
  `;
}

function showList() {
  const body = document.body;
  const detail = document.getElementById("detail-artikel");

  detail.classList.remove("enter");
  detail.classList.add("leave");

  detail.addEventListener("animationend", function handler() {
    if (detail.classList.contains("leave")) {
      detail.style.display = "none";
      Array.from(body.children).forEach((el) => {
        if (el.id !== "detail-artikel") {
          el.style.display = "";
        }
      });
      renderPage();
    }
    detail.removeEventListener("animationend", handler);
  });
}

function cekKoneksi() {
  if (!navigator.onLine && !window.location.pathname.endsWith('error.html')) {
    window.location.href = 'error.html';
  }
}

cekKoneksi();

window.addEventListener('offline', () => {
  if (!window.location.pathname.endsWith('error.html')) {
    window.location.href = 'error.html';
  }
});

window.addEventListener('online', () => {
  if (window.location.pathname.endsWith('error.html')) {
    window.location.href = 'index.html';
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./file/sw.js').catch(err => {
    console.error('Service Worker gagal didaftarkan:', err);
  });
}


document.addEventListener("DOMContentLoaded", function () {
  const preloader = document.getElementById("preloader");
  const content   = document.getElementById("content");
  setTimeout(() => {
    preloader.style.opacity = "0";   
    setTimeout(() => {
      preloader.style.display = "none"; 
      content.style.display = "block"; 
    }, 500);
  }, 1000);
})

const warnDialog = document.getElementById('warnDialog');
const closeWarn  = document.getElementById('closeWarn');

function showWarning() {
  if (!warnDialog.open) warnDialog.showModal();
}


document.addEventListener('contextmenu', e => {
  e.preventDefault();
  showWarning();
}, true);


document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(k)) ||
    (e.ctrlKey && k === "u")
  ) {
    e.preventDefault();
    showWarning();
  }
}, true);

closeWarn.addEventListener('click', () => {
  warnDialog.close();
});
