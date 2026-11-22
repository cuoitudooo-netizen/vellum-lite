/* Vellum — renders config.js and handles theme, menu, print */

(function () {
  const data = window.VELLUM || {};
  const root = document.documentElement;

  const text = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null && value !== "") el.textContent = value;
  };

  const htmlEscape = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const setTheme = (name, persist) => {
    const theme = ["ivory", "midnight", "harbor"].includes(name) ? name : "ivory";
    root.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-theme-set") === theme));
    });
    if (persist) {
      try { localStorage.setItem("vellum-theme", theme); } catch (e) {}
    }
  };

  const saved = (() => {
    try { return localStorage.getItem("vellum-theme"); } catch (e) { return null; }
  })();
  setTheme(saved || data.theme || "ivory", false);

  document.querySelectorAll("[data-theme-set]").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme-set"), true));
  });

  const displayName = data.name || [data.firstName, data.lastName].filter(Boolean).join(" ");
  document.title = displayName ? displayName + " — Portfolio" : document.title;

  const first = data.firstName || (displayName.split(" ")[0] || "");
  const last = data.lastName || (displayName.split(" ").slice(1).join(" ") || "");
  const nameEl = document.getElementById("name");
  if (nameEl) {
    nameEl.innerHTML =
      htmlEscape(first) +
      (last ? "<br><em>" + htmlEscape(last) + "</em>" : "");
  }

  text("availability", data.availability);
  text("headline", data.headline);
  text("summary", data.summary);
  text("meta-school", data.school);
  text("meta-year", data.gradYear ? "Class of " + data.gradYear : "");
  text("meta-location", data.location);
  text("wordmark-name", displayName || first);
  text("footer-name", displayName);
  text("footer-note", data.footerNote);
  text("contact-title", "I’d love to hear from you.");
  if (data.email) {
    text("contact-copy", "Write to " + data.email + " — I read every note.");
  }

  const photo = document.getElementById("photo");
  if (photo && data.photo) {
    photo.src = data.photo;
    photo.alt = data.photoAlt || ("Portrait of " + displayName);
  }

  const aboutEl = document.getElementById("about-copy");
  if (aboutEl && data.about) {
    aboutEl.innerHTML = data.about
      .split(/\n{2,}/)
      .map((p) => "<p>" + htmlEscape(p).replace(/\n/g, "<br>") + "</p>")
      .join("");
  }

  const factsEl = document.getElementById("facts");
  if (factsEl && data.facts && data.facts.length) {
    factsEl.innerHTML = data.facts
      .map(
        (f) =>
          '<div class="fact"><span class="kicker fact-label">' +
          htmlEscape(f.label) +
          '</span><span class="fact-value">' +
          htmlEscape(f.value) +
          "</span></div>"
      )
      .join("");
  }

  const renderTimeline = (id, items, map) => {
    const el = document.getElementById(id);
    if (!el || !items || !items.length) {
      const section = el && el.closest(".section");
      if (section) section.hidden = true;
      return;
    }
    el.innerHTML = items
      .map((item) => {
        const m = map(item);
        return (
          '<article class="t-item">' +
          '<div class="t-dates">' + htmlEscape(m.dates) + "</div>" +
          '<div class="t-rail" aria-hidden="true"></div>' +
          '<div class="t-body">' +
          "<h3 class=\"t-title\">" + htmlEscape(m.title) + "</h3>" +
          (m.org ? '<div class="t-org">' + htmlEscape(m.org) + "</div>" : "") +
          (m.detail ? '<p class="t-detail">' + htmlEscape(m.detail) + "</p>" : "") +
          "</div></article>"
        );
      })
      .join("");
  };

  renderTimeline("education-list", data.education, (e) => ({
    dates: e.dates,
    title: e.degree,
    org: [e.school, e.place].filter(Boolean).join(" · "),
    detail: e.detail
  }));

  renderTimeline("experience-list", data.experience, (e) => ({
    dates: e.dates,
    title: e.role,
    org: e.org,
    detail: e.detail
  }));

  const skillsEl = document.getElementById("skills-list");
  if (skillsEl) {
    if (data.skills && data.skills.length) {
      skillsEl.innerHTML = data.skills
        .map(
          (g) =>
            '<div class="skill-group"><h3>' +
            htmlEscape(g.group) +
            '</h3><div class="chips">' +
            (g.items || [])
              .map((i) => '<span class="chip">' + htmlEscape(i) + "</span>")
              .join("") +
            "</div></div>"
        )
        .join("");
    } else if (skillsEl.closest(".section")) {
      skillsEl.closest(".section").hidden = true;
    }
  }

  const projectsEl = document.getElementById("projects-list");
  if (projectsEl) {
    if (data.projects && data.projects.length) {
      projectsEl.innerHTML = data.projects
        .map((p, i) => {
          const idx = String(i + 1).padStart(2, "0");
          const inner =
            '<div class="project-top"><span class="project-index">' +
            idx +
            '</span><span class="project-year">' +
            htmlEscape(p.year || "") +
            "</span></div><h3>" +
            htmlEscape(p.title) +
            "</h3><p>" +
            htmlEscape(p.summary || "") +
            '</p><div class="project-tags">' +
            (p.tags || [])
              .map((t) => "<span>" + htmlEscape(t) + "</span>")
              .join("") +
            "</div>";
          if (p.href && p.href !== "#") {
            return (
              '<a class="project" href="' +
              htmlEscape(p.href) +
              '">' +
              inner +
              "</a>"
            );
          }
          return '<article class="project">' + inner + "</article>";
        })
        .join("");
    } else if (projectsEl.closest(".section")) {
      projectsEl.closest(".section").hidden = true;
    }
  }

  const certsEl = document.getElementById("certs-list");
  if (certsEl) {
    if (data.certificates && data.certificates.length) {
      certsEl.innerHTML = data.certificates
        .map(
          (c) =>
            '<div class="cert"><span>' +
            htmlEscape(c.name) +
            '</span><span class="cert-year">' +
            htmlEscape(c.year || "") +
            "</span></div>"
        )
        .join("");
    } else if (certsEl.closest(".section")) {
      certsEl.closest(".section").hidden = true;
    }
  }

  const quotesEl = document.getElementById("quotes-list");
  if (quotesEl) {
    if (data.quotes && data.quotes.length) {
      quotesEl.innerHTML = data.quotes
        .map(
          (q) =>
            '<figure class="quote"><blockquote>“' +
            htmlEscape(q.text) +
            '”</blockquote><figcaption><cite>' +
            htmlEscape(q.person) +
            "<span>" +
            htmlEscape(q.role || "") +
            "</span></cite></figcaption></figure>"
        )
        .join("");
    } else if (quotesEl.closest(".section")) {
      quotesEl.closest(".section").hidden = true;
    }
  }

  const socials = data.socials || [];
  const navSocial = document.getElementById("socials-nav");
  const contactLinks = document.getElementById("contact-links");
  const linkHtml = socials
    .map((s) => '<a href="' + htmlEscape(s.href) + '">' + htmlEscape(s.label) + " <span aria-hidden=\"true\">↗</span></a>")
    .join("");
  if (contactLinks) contactLinks.innerHTML = linkHtml;

  const mail = socials.find((s) => (s.href || "").startsWith("mailto:")) || {
    href: data.email ? "mailto:" + data.email : "",
    label: "Email"
  };
  const emailBtn = document.getElementById("btn-email");
  if (emailBtn && mail.href) emailBtn.href = mail.href;

  const cvBtn = document.getElementById("btn-cv");
  if (cvBtn) {
    if (data.cvUrl) {
      cvBtn.href = data.cvUrl;
      cvBtn.removeAttribute("role");
    } else {
      cvBtn.href = "#";
      cvBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.print();
      });
    }
  }

  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
