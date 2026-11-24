/* ===== Portfolio script ===== */
(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* ---------- Mobile navigation ---------- */
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  const mobileQuery = window.matchMedia("(max-width: 650px)");

  function setMenu(open) {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    menuToggle.textContent = open ? "×" : "☰";
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      setMenu(!navLinks.classList.contains("open"));
    });

    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (event) => {
      if (!navLinks.classList.contains("open")) return;
      if (event.target.closest(".navbar")) return;
      setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches) setMenu(false);
    });
  }

  /* ---------- Scroll progress & navbar state ---------- */
  const motionOK = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
  ).matches;
  const scrollBar = $("#scrollBar");
  const navbar = $(".navbar");
  let scrollTick = false;

  function updateScrollUI() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    if (scrollBar) scrollBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 10);
    scrollTick = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(updateScrollUI);
      }
    },
    { passive: true }
  );
  updateScrollUI();

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Active navigation link ---------- */
  const navAnchors = $$(".nav-links a");
  const sections = navAnchors
    .map((anchor) => $(anchor.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = `#${entry.target.id}`;
          navAnchors.forEach((anchor) => {
            const isActive = anchor.getAttribute("href") === target;
            anchor.classList.toggle("active", isActive);
            if (isActive) anchor.setAttribute("aria-current", "location");
            else anchor.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    revealEls.forEach((el) => {
      const group = Array.from(el.parentElement.children).filter((c) =>
        c.classList.contains("reveal")
      );
      const index = group.indexOf(el);
      if (index > 0) {
        el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 80}ms`);
      }
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("show"));
  }

  /* ---------- Hover effects (tilt + spotlight on project cards) ---------- */
  $$(".project-card").forEach((card) => {
    if (!motionOK) return;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      const rx = (0.5 - y) * 8;
      const ry = (x - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(
        2
      )}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  /* ---------- Dialog helpers ---------- */
  const supportsDialog =
    typeof HTMLDialogElement !== "undefined" &&
    typeof HTMLDialogElement.prototype.showModal === "function";

  function openDialog(dialog) {
    if (!dialog) return false;
    if (!supportsDialog) return false;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dlg-open");
    return true;
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function bindDialog(dialog, onClose) {
    if (!dialog) return;
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dlg-open");
      if (onClose) onClose();
    });
  }

  /* ---------- Project detail ---------- */
  const pdDialog = $("#pdDialog");
  const pdImg = $("#pdImg");
  const pdCat = $("#pdCat");
  const pdTitle = $("#pdTitle");
  const pdDesc = $("#pdDesc");
  const pdFacts = $("#pdFacts");

  const pdData = {
    portfolio: {
      cat: "01 / WEB DEVELOPMENT",
      title: "Personal Portfolio",
      img: "img/project.png",
      alt: "Tampilan website portfolio pribadi",
      desc:
        "Website portfolio satu halaman untuk menampilkan profil, pengalaman organisasi, dan karya. Dibangun dari nol tanpa framework \u2014 hanya HTML, CSS, dan JavaScript \u2014 dengan tata letak responsif dan animasi yang menghormati pengaturan reduced motion.",
      facts: [
        ["Peran", "Perancang & pengembang"],
        ["Teknologi", "HTML \u00b7 CSS \u00b7 JavaScript"],
        ["Fokus", "Desain responsif"],
        ["Status", "Aktif"],
      ],
    },
    singing: {
      cat: "02 / ACHIEVEMENT",
      title: "Singing Competition",
      img: "img/prestasi.jpeg",
      alt: "Foto penampilan di kompetisi menyanyi",
      desc:
        "Berpartisipasi dalam kompetisi menyanyi sebagai ajang mengembangkan bakat vokal, kepercayaan diri, dan kemampuan tampil di depan penonton. Pengalaman ini sekaligus melatih disiplin latihan dan cara membawakan lagu dengan percaya diri.",
      facts: [
        ["Peran", "Peserta"],
        ["Bidang", "Seni vokal"],
        ["Fokus", "Kepercayaan diri & panggung"],
      ],
    },
    robotik: {
      cat: "03 / ROBOTICS",
      title: "UKM Robotik",
      img: "img/robotik.jpeg",
      alt: "Robot line follower rakitan sendiri",
      desc:
        "Terlibat di UKM Robotika, termasuk merakit dan memprogram robot line follower: menyusun rangka, memasang motor driver, menyambungkan sensor garis, lalu menguji gerak robot di lintasan.",
      facts: [
        ["Peran", "Anggota"],
        ["Unit", "UKM Robotika Polije"],
        ["Fokus", "Robotika & embedded"],
        ["Periode", "2026 \u2013 2027"],
      ],
    },
  };

  function renderFacts(facts) {
    if (!pdFacts) return;
    pdFacts.replaceChildren();
    facts.forEach(([label, value]) => {
      const row = document.createElement("div");
      const labelEl = document.createElement("span");
      const valueEl = document.createElement("strong");
      row.className = "pd-fact";
      labelEl.textContent = label;
      valueEl.textContent = value;
      row.append(labelEl, valueEl);
      pdFacts.append(row);
    });
  }

  function openPd(key) {
    const data = pdData[key];
    if (!data || !supportsDialog || !pdDialog) return;

    if (pdImg) {
      pdImg.src = data.img;
      pdImg.alt = data.alt;
    }
    if (pdCat) pdCat.textContent = data.cat;
    if (pdTitle) pdTitle.textContent = data.title;
    if (pdDesc) pdDesc.textContent = data.desc;
    renderFacts(data.facts);

    openDialog(pdDialog);
  }

  $$(".project-hit").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".project-card");
      if (card) openPd(card.dataset.project);
    });
  });

  const pdClose = $("#pdClose");
  if (pdClose) pdClose.addEventListener("click", () => closeDialog(pdDialog));
  bindDialog(pdDialog, () => {
    if (pdImg) pdImg.removeAttribute("src");
  });
})();
