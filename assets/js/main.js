// Walltex — Core interactions
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ——— Nav state on scroll ———
  const nav = $(".nav");
  if (nav) {
    const heroWrap = document.querySelector(".hero-wrap");
    const threshold = 40;
    const onScroll = () => {
      const y = window.scrollY;
      const scrolled = y > threshold;
      nav.classList.toggle("is-scrolled", scrolled);
      if (nav.dataset.transparent === "true") {
        nav.classList.toggle("is-transparent", !scrolled);
      }
      if (heroWrap) heroWrap.classList.toggle("is-past-hero", scrolled);
      const inq = $(".sticky-inq");
      if (inq) inq.classList.toggle("is-visible", y > 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ——— Mobile drawer ———
  const hamburger = $(".nav__hamburger");
  const drawer = $(".drawer");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      nav.classList.toggle("is-menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".drawer a").forEach(a => a.addEventListener("click", e => {
      if (a.dataset.expand) {
        e.preventDefault();
        const sub = a.nextElementSibling;
        if (sub) sub.classList.toggle("is-open");
        return;
      }
      drawer.classList.remove("is-open");
      nav.classList.remove("is-menu-open");
      document.body.style.overflow = "";
    }));
  }

  // ——— Reveal on scroll ———
  const revealEls = $$(".reveal, .split-reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-in"));
  }

  // Split-reveal: wrap inner in <span> if not already
  $$(".split-reveal").forEach(el => {
    if (!el.querySelector("span")) {
      const txt = el.textContent;
      el.innerHTML = `<span>${txt}</span>`;
    }
  });

  // ——— Before/After slider ———
  $$(".ba").forEach(el => {
    const after = $(".ba__after", el);
    const handle = $(".ba__handle", el);
    if (!after || !handle) return;
    let dragging = false;
    const set = (x) => {
      const rect = el.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + "%";
    };
    const start = e => { dragging = true; e.preventDefault(); };
    const move = e => {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      set(clientX);
    };
    const end = () => { dragging = false; };
    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", end);
    window.addEventListener("touchend", end);
    el.addEventListener("click", e => {
      const clientX = e.clientX;
      set(clientX);
    });
  });

  // ——— Filter pills ———
  $$(".pills").forEach(group => {
    const pills = $$(".pill", group);
    const targetSel = group.dataset.targets;
    const scopeSel = group.dataset.scope;
    pills.forEach(p => {
      p.addEventListener("click", () => {
        pills.forEach(x => x.classList.remove("is-active"));
        p.classList.add("is-active");
        const filter = p.dataset.filter;
        if (!targetSel) return;
        const scope = scopeSel ? document.querySelector(scopeSel) : document;
        $$(targetSel, scope).forEach(card => {
          const tags = (card.dataset.tags || "").split(/\s+/);
          const match = filter === "all" || tags.includes(filter);
          card.style.display = match ? "" : "none";
          if (match) {
            card.classList.remove("is-filtered-out");
          } else {
            card.classList.add("is-filtered-out");
          }
        });
      });
    });
  });

  // ——— Modal triggers ———
  $$("[data-modal]").forEach(trigger => {
    trigger.addEventListener("click", e => {
      e.preventDefault();
      const id = trigger.dataset.modal;
      const modal = document.getElementById(id);
      if (modal) modal.classList.add("is-open");
    });
  });
  $$(".modal").forEach(modal => {
    const close = () => modal.classList.remove("is-open");
    $$(".modal__close, [data-close]", modal).forEach(b => b.addEventListener("click", close));
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  });

  // ——— Exit-intent popup (desktop only) ———
  const exitModal = $("#modal-exit");
  if (exitModal && window.matchMedia("(min-width: 820px)").matches) {
    let triggered = sessionStorage.getItem("walltex.exit.seen") === "1";
    const handler = e => {
      if (triggered) return;
      if (e.clientY < 8) {
        triggered = true;
        sessionStorage.setItem("walltex.exit.seen", "1");
        exitModal.classList.add("is-open");
      }
    };
    document.addEventListener("mouseleave", handler);
    // Fallback: after 40s inactivity
    setTimeout(() => {
      if (!triggered) {
        triggered = true;
        sessionStorage.setItem("walltex.exit.seen", "1");
        exitModal.classList.add("is-open");
      }
    }, 40000);
  }

  // ——— Contact form soft submit ———
  $$("[data-softform]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get("name") || "there";
      const ok = form.querySelector("[data-ok]");
      if (ok) {
        ok.textContent = `Thank you, ${name}. Our design consultant will reach out within 24 hours.`;
        ok.classList.add("is-shown");
      }
      form.reset();
    });
  });

  // ——— AI Room: upload & suggest ———
  const room = $(".ai-room");
  if (room) {
    const drop = $(".ai-room__drop", room);
    const input = $("input[type=file]", room);
    const suggest = $(".ai-room__suggest", room);
    const setPreview = (src) => {
      let img = drop.querySelector("img.preview");
      if (!img) {
        img = document.createElement("img");
        img.className = "preview";
        drop.appendChild(img);
      }
      img.src = src;
      drop.querySelectorAll(".label, .sketch").forEach(el => el.style.display = "none");
      suggest.classList.add("is-visible");
    };
    drop.addEventListener("click", () => input && input.click());
    if (input) {
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(file);
      });
    }
    ["dragenter", "dragover"].forEach(evt => drop.addEventListener(evt, e => {
      e.preventDefault();
      drop.classList.add("is-dragover");
    }));
    ["dragleave", "drop"].forEach(evt => drop.addEventListener(evt, e => {
      e.preventDefault();
      drop.classList.remove("is-dragover");
    }));
    drop.addEventListener("drop", e => {
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    });
  }

  // ——— Lazy hint ———
  $$("img").forEach(img => {
    if (!img.hasAttribute("loading") && !img.classList.contains("eager")) {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    }
  });

  // ——— Marquee duplicate ———
  $$(".marquee__track").forEach(track => {
    if (track.dataset.dupe === "done") return;
    track.innerHTML += track.innerHTML;
    track.dataset.dupe = "done";
  });

  // ——— Year ———
  $$(".js-year").forEach(el => el.textContent = new Date().getFullYear());
})();
