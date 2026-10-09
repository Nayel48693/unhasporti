(function () {
  "use strict";

  const config = window.CONFIG;
  const placeholder = (value) => !value || /^\[PREENCHER/i.test(String(value).trim());
  const affiliateLink = typeof config?.AFFILIATE_LINK === "string" ? config.AFFILIATE_LINK.trim() : "";
  const usableAffiliateLink = (value) => {
    if (placeholder(value) || value === "COLAR_AQUI_O_LINK_DE_CHECKOUT") return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (_) {
      return false;
    }
  };

  if (!config) return;

  const siteName = placeholder(config.SITE_NAME) ? "Aprender Unhas" : config.SITE_NAME;
  document.querySelectorAll("[data-site-name]").forEach((element) => { element.textContent = siteName; });
  document.querySelectorAll("[data-product-name]").forEach((element) => { element.textContent = config.PRODUCT_NAME; });
  document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll("[data-hero-subheadline]").forEach((element) => { element.textContent = config.HERO_SUBHEADLINE; });
  const metaDescription = `${config.COURSE_FORMAT}. Consulta as condições na página de compra.`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", metaDescription);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", metaDescription);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", metaDescription);
  const pageTitle = document.querySelector("[data-site-title]");
  if (pageTitle) document.title = `${pageTitle.dataset.siteTitle} | ${config.PRODUCT_NAME} | ${siteName}`;

  const affiliateReady = usableAffiliateLink(affiliateLink);
  const ctaBlockerKey = Symbol.for("unhasporti.ctaBlocker");
  if (affiliateReady) {
    console.log("AFFILIATE_LINK ok");
  } else {
    console.warn("AFFILIATE_LINK inválido ou em falta");
  }

  document.querySelectorAll("[data-cta]").forEach((link) => {
    if (link[ctaBlockerKey]) {
      link.removeEventListener("click", link[ctaBlockerKey]);
      delete link[ctaBlockerKey];
    }

    if (affiliateReady) {
      link.href = affiliateLink;
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#";
      link.setAttribute("aria-disabled", "true");
      link[ctaBlockerKey] = (event) => event.preventDefault();
      link.addEventListener("click", link[ctaBlockerKey]);
    }
    link.setAttribute("aria-label", `Ver detalhes de ${config.PRODUCT_NAME} na página oficial`);
    link.addEventListener("click", () => {
      if (!affiliateReady) return;
      if (window.fbq) window.fbq("track", "InitiateCheckout");
      if (window.ttq) window.ttq.track("ClickButton");
      if (window.gtag) window.gtag("event", "click", { event_category: "affiliate", event_label: "course_cta" });
    });
  });

  if (config.PRICE_CONFIRMED === true && !placeholder(config.PRICE_TEXT)) {
    document.querySelectorAll("[data-price]").forEach((element) => {
      element.textContent = config.PRICE_TEXT;
      element.hidden = false;
    });
    const priceLine = document.querySelector("[data-price-line]");
    if (priceLine) priceLine.hidden = false;
    const priceFaq = document.querySelector("[data-faq-price]");
    if (priceFaq) {
      priceFaq.hidden = false;
      document.querySelector("[data-faq-price-answer]").textContent = `${config.PRICE_TEXT}. Confirma o preço final na página de compra.`;
    }
  } else {
    const priceFaq = document.querySelector("[data-faq-price]");
    if (priceFaq) priceFaq.hidden = true;
  }

  const supportPoints = Array.isArray(config.SUPPORT_POINTS) ? config.SUPPORT_POINTS.filter((point) => !placeholder(point)) : [];
  const supportList = document.querySelector("[data-support-points]");
  const supportTemplate = document.querySelector("[data-support-template]");
  if (supportList && supportTemplate && supportPoints.length) {
    supportPoints.forEach((point) => {
      const item = supportTemplate.content.firstElementChild.cloneNode(true);
      item.lastElementChild.textContent = point;
      supportList.append(item);
    });
    supportList.hidden = false;
  }

  const modules = Array.isArray(config.MODULES) ? config.MODULES.filter((module) => module && !placeholder(module.title) && !placeholder(module.description)) : [];
  const moduleSection = document.querySelector("[data-modules-section]");
  const moduleContainer = document.querySelector("[data-modules]");
  if (moduleContainer && moduleSection && modules.length) {
    modules.forEach((module, index) => {
      const article = document.createElement("article");
      article.className = "module-card reveal";
      const icon = document.createElement("span");
      icon.className = "module-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = ["✳", "◇", "✦", "○"][index % 4];
      const heading = document.createElement("h3");
      heading.textContent = module.title;
      const description = document.createElement("p");
      description.textContent = module.description;
      article.append(icon, heading, description);
      moduleContainer.append(article);
    });
    moduleSection.hidden = false;
  }

  const guarantee = !placeholder(config.GUARANTEE_TEXT);
  const guaranteeElement = document.querySelector("[data-guarantee]");
  const certificateElement = document.querySelector("[data-certificate]");
  const includedItems = [];
  if (!placeholder(config.INCLUDED_COURSE_TEXT)) includedItems.push(config.INCLUDED_COURSE_TEXT);
  if (config.HAS_CERTIFICATE === true && !placeholder(config.CERTIFICATE_TEXT)) includedItems.push(config.CERTIFICATE_TEXT);
  if (Array.isArray(config.EXTRAS)) includedItems.push(...config.EXTRAS.filter((item) => !placeholder(item)));
  if (guarantee) includedItems.push(config.GUARANTEE_TEXT);
  if (!placeholder(config.ACCESS_TIME)) includedItems.push(config.ACCESS_TIME);
  const includedSection = document.querySelector("[data-included-section]");
  const includedContainer = document.querySelector("[data-included-items]");
  if (includedSection && includedContainer && includedItems.length) {
    includedItems.forEach((itemText, index) => {
      const article = document.createElement("article");
      article.className = "included-card reveal";
      const icon = document.createElement("span");
      icon.className = "included-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = ["✳", "◇", "✦", "○"][index % 4];
      const text = document.createElement("p");
      text.textContent = itemText;
      article.append(icon, text);
      includedContainer.append(article);
    });
    includedSection.hidden = false;
  }

  const certificateNotes = document.querySelectorAll("[data-certificate-note]");
  certificateNotes.forEach((note) => {
    note.textContent = config.CERTIFICATE_NOTE || "";
    note.hidden = config.HAS_CERTIFICATE !== true || placeholder(config.CERTIFICATE_NOTE);
  });
  const certificateFaq = document.querySelector("[data-faq-certificate]");
  if (certificateFaq) certificateFaq.hidden = config.HAS_CERTIFICATE !== true;
  const certificateFaqAnswer = document.querySelector("[data-faq-certificate-answer]");
  if (certificateFaqAnswer) certificateFaqAnswer.textContent = config.CERTIFICATE_NOTE || "";
  const beginnerAnswer = document.querySelector("[data-faq-beginner]");
  if (beginnerAnswer && !placeholder(config.COURSE_FORMAT)) beginnerAnswer.textContent = `${config.COURSE_FORMAT}.`;

  if (guaranteeElement && guarantee) {
    document.querySelector("[data-guarantee-text]").textContent = config.GUARANTEE_TEXT;
    guaranteeElement.hidden = false;
    const faqGuarantee = document.querySelector("[data-faq-guarantee]");
    const faqGuaranteeAnswer = document.querySelector("[data-faq-guarantee-answer]");
    if (faqGuarantee) faqGuarantee.hidden = false;
    if (faqGuaranteeAnswer) faqGuaranteeAnswer.textContent = config.GUARANTEE_TEXT;
  } else {
    const faqGuarantee = document.querySelector("[data-faq-guarantee]");
    if (faqGuarantee) faqGuarantee.hidden = true;
  }
  if (certificateElement && config.HAS_CERTIFICATE === true) certificateElement.hidden = false;
  const trustSection = document.querySelector("[data-trust-section]");
  if (trustSection && (guarantee || config.HAS_CERTIFICATE === true)) trustSection.hidden = false;

  [
    { key: "ACCESS_TIME", row: "[data-faq-access]", answer: "[data-faq-access-answer]" },
    { key: "DURATION", row: "[data-faq-duration]", answer: "[data-faq-duration-answer]" },
    { key: "MODULE_COUNT", row: "[data-faq-module-count]", answer: "[data-faq-module-count-answer]" },
    { key: "MATERIAL_REQUIRED", row: "[data-faq-material]", answer: "[data-faq-material-answer]" }
  ].forEach(({ key, row: rowSelector, answer: answerSelector }) => {
    const row = document.querySelector(rowSelector);
    const answer = document.querySelector(answerSelector);
    if (row && answer && placeholder(config[key])) {
      row.hidden = true;
    } else if (answer && !placeholder(config[key])) {
      answer.textContent = config[key];
    }
  });

  const videoSection = document.querySelector("[data-video-section]");
  const videoSource = videoSection?.querySelector("video source");
  if (videoSection && videoSource) {
    fetch(videoSource.src, { method: "HEAD" })
      .then((response) => { if (response.ok) videoSection.hidden = false; })
      .catch(() => { videoSection.hidden = true; });
  }

  if (!placeholder(config.CONTACT_EMAIL) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.CONTACT_EMAIL)) {
    document.querySelectorAll("[data-contact-link], [data-contact-email]").forEach((contactLink) => {
      contactLink.href = `mailto:${config.CONTACT_EMAIL}`;
      if (contactLink.hasAttribute("data-contact-link")) contactLink.hidden = false;
      if (contactLink.hasAttribute("data-contact-email")) contactLink.textContent = config.CONTACT_EMAIL;
    });
  }

  document.querySelectorAll("[data-fallback-image]").forEach((image) => {
    image.addEventListener("error", () => image.classList.add("image-missing"), { once: true });
    if (image.complete && image.naturalWidth === 0) image.classList.add("image-missing");
  });

  document.querySelectorAll(".faq-item").forEach((item) => {
    const summary = item.querySelector("summary");
    item.addEventListener("toggle", () => summary.setAttribute("aria-expanded", String(item.open)));
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const mobileCta = document.querySelector("[data-mobile-cta]");
  if (mobileCta && "IntersectionObserver" in window) {
    const hero = document.querySelector(".hero");
    const stickyObserver = new IntersectionObserver(([entry]) => {
      mobileCta.classList.toggle("is-visible", !entry.isIntersecting && window.scrollY > 240);
    });
    stickyObserver.observe(hero);
  }

  const cookieBanner = document.querySelector("[data-cookie-banner]");
  const consentKey = "unhasporti-cookie-consent";
  let storedConsent = null;
  try {
    storedConsent = localStorage.getItem(consentKey);
  } catch (_) {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  function loadAnalytics() {
    if (config.META_PIXEL_ID) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", config.META_PIXEL_ID);
      window.fbq("track", "PageView");
    }
    if (config.TIKTOK_PIXEL_ID) {
      !(function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        const ttq = w[t] = w[t] || [];
        ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
        ttq.setAndDefer = function (target, method) { target[method] = function () { target.push([method].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (let index = 0; index < ttq.methods.length; index++) ttq.setAndDefer(ttq, ttq.methods[index]);
        ttq.instance = function (id) { const instance = ttq._i[id] || []; for (let index = 0; index < ttq.methods.length; index++) ttq.setAndDefer(instance, ttq.methods[index]); return instance; };
        ttq.load = function (id) { const script = d.createElement("script"); script.async = true; script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=${t}`; const firstScript = d.getElementsByTagName("script")[0]; firstScript.parentNode.insertBefore(script, firstScript); };
        ttq._i = ttq._i || {}; ttq._i[config.TIKTOK_PIXEL_ID] = []; ttq._t = ttq._t || {}; ttq._t[config.TIKTOK_PIXEL_ID] = Date.now(); ttq._o = ttq._o || {}; ttq._o[config.TIKTOK_PIXEL_ID] = {};
        ttq.load(config.TIKTOK_PIXEL_ID); ttq.page();
      })(window, document, "ttq");
    }
    if (config.GA_ID) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.GA_ID)}`;
      document.head.append(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", config.GA_ID);
    }
  }

  if (storedConsent === "accepted") loadAnalytics();
  if (!storedConsent && cookieBanner) cookieBanner.hidden = false;
  document.querySelectorAll("[data-cookie-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const accepted = button.dataset.cookieChoice === "accept";
      try {
        localStorage.setItem(consentKey, accepted ? "accepted" : "rejected");
      } catch (_) {
        // A escolha mantém-se nesta visita, mesmo se o armazenamento estiver indisponível.
      }
      cookieBanner.hidden = true;
      if (accepted) loadAnalytics();
    });
  });

  // Para acrescentar UTM ao link, fazê-lo apenas após confirmar compatibilidade com a plataforma de afiliados.
  // Exemplo opcional: const url = new URL(config.AFFILIATE_LINK); url.searchParams.set("utm_source", "site"); link.href = url.toString();
})();