(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Typewriter — cycle roles one character at a time
  const typeEl = document.getElementById("typewriter-text");
  if (typeEl) {
    const phrases = [
      "Abdul Rehan",
      "a Developer",
      "a Backend Engineer",
      "an AI Engineer",
      "a Problem Solver",
      "a Systems Builder",
    ];
    const typeSpeed = 90;
    const deleteSpeed = 45;
    const holdDelay = 1800;
    const gapDelay = 400;
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = false;
    let timer = null;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function schedule(fn, ms) {
      timer = window.setTimeout(fn, ms);
    }

    function tick() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        typeEl.textContent = current.slice(0, charIndex + 1);
        charIndex += 1;
        if (charIndex === current.length) {
          schedule(() => {
            deleting = true;
            tick();
          }, holdDelay);
          return;
        }
        schedule(tick, typeSpeed);
        return;
      }

      typeEl.textContent = current.slice(0, charIndex - 1);
      charIndex -= 1;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        schedule(tick, gapDelay);
        return;
      }
      schedule(tick, deleteSpeed);
    }

    if (reduceMotion) {
      typeEl.textContent = phrases[0];
    } else {
      // Start full first phrase, then begin delete/type cycle
      typeEl.textContent = phrases[0];
      schedule(() => {
        deleting = true;
        tick();
      }, holdDelay);
    }
  }

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll reveal with Intersection Observer
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    const revealEls = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-scale"
    );

    if (revealEls.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    // Stagger delay for grids
    document.querySelectorAll(".highlight-cards, .skills-grid, .project-grid, .timeline, .stat-grid").forEach((grid) => {
      const kids = grid.querySelectorAll(".reveal, .reveal-left, .reveal-scale, .stat");
      kids.forEach((kid, i) => {
        if (!kid.style.getPropertyValue("--reveal-delay")) {
          kid.style.setProperty("--reveal-delay", `${i * 80}ms`);
        }
      });
    });
  } else {
    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-scale")
      .forEach((el) => el.classList.add("is-visible"));
  }

  // Contact form → FormSubmit (delivers email without opening a mail client)
  const form = document.getElementById("contact-form");
  if (form) {
    const submitBtn = document.getElementById("submit-btn");
    const statusEl = document.getElementById("form-status");
    const subjectHidden = document.getElementById("form-subject-hidden");
    const endpoint =
      form.getAttribute("action") ||
      "https://formsubmit.co/ajax/9551cfaca2b19c11a717d1674406642e";

    function setStatus(type, text) {
      if (!statusEl) return;
      statusEl.hidden = !text;
      statusEl.textContent = text || "";
      statusEl.classList.remove("is-success", "is-error", "is-info");
      if (type) statusEl.classList.add(`is-${type}`);
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.classList.toggle("is-loading", loading);
      const label = submitBtn.querySelector(".btn-label");
      if (label) label.textContent = loading ? "Sending…" : "Send message";
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const subject = form.subject.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const honey = form._honey ? form._honey.value : "";

      if (honey) return; // bot filled honeypot

      if (!name || !subject || !email || !message) {
        setStatus("error", "Please fill in all fields.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("error", "Please enter a valid email address.");
        return;
      }

      if (subjectHidden) {
        subjectHidden.value = `Portfolio: ${subject}`;
      }

      setLoading(true);
      setStatus("info", "Sending your message…");

      const payload = {
        name,
        email,
        subject,
        message,
        _subject: `Portfolio: ${subject}`,
        _template: "table",
        _captcha: "false",
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        let data = null;
        try {
          data = await res.json();
        } catch (_) {
          /* ignore non-JSON */
        }

        if (res.ok && (!data || data.success !== "false")) {
          form.reset();
          setStatus(
            "success",
            "Message sent — thanks! I’ll get back to you soon."
          );
        } else {
          const msg =
            (data && (data.message || data.error)) ||
            "Something went wrong. Please email me directly.";
          setStatus("error", msg);
        }
      } catch (_) {
        setStatus(
          "error",
          "Could not send right now. Please email uiet.rehan@gmail.com instead."
        );
      } finally {
        setLoading(false);
      }
    });
  }
})();
