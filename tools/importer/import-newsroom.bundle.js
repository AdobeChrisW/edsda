/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-newsroom.js
  var import_newsroom_exports = {};
  __export(import_newsroom_exports, {
    default: () => import_newsroom_default
  });

  // tools/importer/parsers/breadcrumbs.js
  var ORIGIN_RE = /^https?:\/\/(www\.)?neom\.com(?=\/|$)/i;
  function cleanText(el) {
    return el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }
  function relHref(href) {
    const h = (href || "").trim();
    if (!h) return "";
    const rel = h.replace(ORIGIN_RE, "");
    return rel || "/";
  }
  function parse(element, { document }) {
    const items = [...element.querySelectorAll(".m-breadcrumbs__items > .m-breadcrumbs__item, ul.m-breadcrumbs__items > li")].filter((li, i, all) => all.indexOf(li) === i);
    const ul = document.createElement("ul");
    items.forEach((item, idx) => {
      const link = item.querySelector("a[href]");
      const label = cleanText(link || item);
      if (!label) return;
      const li = document.createElement("li");
      const isLast = idx === items.length - 1;
      if (link && !isLast) {
        const a = document.createElement("a");
        a.href = relHref(link.getAttribute("href"));
        a.textContent = label;
        li.append(a);
      } else {
        li.textContent = label;
      }
      ul.append(li);
    });
    const cells = [[ul.children.length ? [ul] : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "breadcrumbs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  var ORIGIN = "https://www.neom.com";
  function absUrl(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function cleanText2(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl(src);
    const alt = (img.getAttribute("alt") || "").trim();
    out.alt = alt === "null" || alt === "undefined" ? "" : alt;
    return out;
  }
  function textP(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function linkP(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parse2(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const header = element.querySelector(".b-newsroomDch__header");
    if (header) {
      const h = header.querySelector(".a-heading, h1, h2, h3");
      if (h && cleanText2(h)) {
        const h2 = document.createElement("h2");
        h2.textContent = cleanText2(h);
        defaultContent.push(h2);
      }
      const desc = header.querySelector(".a-moustache, .header-desc p");
      if (desc && cleanText2(desc)) defaultContent.push(textP(document, cleanText2(desc)));
      const more = header.querySelector("a.m-button[href]");
      if (more) {
        const t = cleanText2(more.querySelector(".a-label") || more);
        if (t) defaultContent.push(linkP(document, absUrl(more.getAttribute("href")), t));
      }
    }
    const items = element.querySelectorAll(".b-newsroomDch__items > li, li.b-newsroomDch__item");
    [...new Set(items)].forEach((item) => {
      const titleLink = item.querySelector(".b-newsroomDch__headingText");
      const anyLink = item.querySelector("a[href]");
      const href = absUrl(titleLink && titleLink.getAttribute("href") || anyLink && anyLink.getAttribute("href") || "");
      const title = cleanText2(titleLink || item.querySelector("h2, h3, h4"));
      const img = buildImage(document, item.querySelector(".b-newsroomDch__itemImage, img"));
      const body = [];
      const tag = cleanText2(item.querySelector(".b-newsroomDch__tag"));
      if (tag) body.push(textP(document, tag));
      if (title) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      const excerpt = cleanText2(item.querySelector(".b-newsroomDch__description"));
      if (excerpt) body.push(textP(document, excerpt));
      const date = cleanText2(item.querySelector(".b-newsroomDch__date"));
      if (date) body.push(textP(document, date));
      if (img || body.length) cells.push([img ? [img] : "", body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const isSlider = !!element.querySelector(".b-newsroomDch.-carousel");
    const block = WebImporter.Blocks.createBlock(document, { name: isSlider ? "Cards News (slider)" : "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/neom-cleanup.js
  var CHROME_SELECTORS = [
    // Global navigation (server placeholder and hydrated version)
    "nav.o-navigationPlaceholder",
    "nav.b-navigation",
    ".b-navigation",
    ".b-navigation__search-container",
    // Global footer
    "footer.b-footer",
    // Breadcrumbs (.c98-breadcrumbs) are kept: they are imported as the "breadcrumbs" block.
    // Global overlays / modals / lightboxes / drawers / spinners
    "section.b-overlay",
    "section.b-map-overlay",
    ".o-downloadDrawer",
    ".o-loadingSpinner",
    // Custom cursor
    "div.m-cursor",
    // OneTrust / cookielaw consent
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    "#onetrust-pc-sdk",
    "#ot-sdk-btn-floating",
    ".onetrust-pc-dark-filter",
    "iframe.ot-text-resize",
    'script[src*="cookielaw"]',
    'script[src*="onetrust"]',
    'link[href*="cookielaw"]'
  ];
  var NEWSLETTER_PANEL_SELECTORS = [
    ".cmp-c96-newsletter-subscription .b-newsletterSubscription__header.-isHidden",
    ".cmp-c96-newsletter-subscription .o-form__submitView",
    ".cmp-c96-newsletter-subscription .o-submitStep",
    ".cmp-c96-newsletter-subscription .o-form__responseWrapper",
    ".cmp-c96-newsletter-subscription .b-newsletterSubscription__response"
  ];
  var MOBILE_DUPLICATE_SELECTORS = [
    '[class*="__btnMobile"]'
  ];
  var TRACKING_PIXEL_HOSTS = /(^|\.)(t\.co|twitter\.com|adnxs\.com|creativecdn\.com|teads\.tv|doubleclick\.net|facebook\.com|google-analytics\.com|bing\.com|linkedin\.com)$/i;
  function isTrackingPixel(img) {
    if (!img.closest("#app-content")) return true;
    try {
      return TRACKING_PIXEL_HOSTS.test(new URL(img.getAttribute("src") || "", "https://www.neom.com/").hostname);
    } catch (e) {
      return false;
    }
  }
  function unsplitText(root) {
    const doc = root.ownerDocument;
    root.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
      if (!el.querySelector('div[style*="inline-block"], div[style*="display: block"]')) return;
      el.textContent = el.textContent.replace(/\s+/g, " ").trim();
    });
    const isWord = (k) => k.tagName === "DIV" && /inline-block/.test(k.getAttribute("style") || "") && !k.children.length;
    root.querySelectorAll("div").forEach((line) => {
      if (!line.isConnected) return;
      const kids = [...line.children];
      if (!kids.length || !kids.every(isWord)) return;
      const text = line.textContent.replace(/\s+/g, " ").trim();
      const prev = line.previousElementSibling;
      if (prev && prev.tagName === "P" && (!prev.textContent.trim() || prev.dataset.excatUnsplit)) {
        prev.textContent = `${prev.textContent} ${text}`.trim();
        prev.dataset.excatUnsplit = "true";
        line.remove();
        return;
      }
      const p = doc.createElement("p");
      p.textContent = text;
      p.dataset.excatUnsplit = "true";
      if (line.parentElement && line.parentElement.classList.contains("m-componentHeader__container")) {
        const next = line.nextElementSibling;
        const prev2 = line.previousElementSibling;
        if (next && next.classList.contains("m-componentHeader__headingWrapper")) p.className = "a-eyebrow";
        else if (prev2 && prev2.classList.contains("m-componentHeader__headingWrapper")) p.className = "a-moustache";
      }
      line.replaceWith(p);
    });
    root.querySelectorAll("[data-excat-unsplit]").forEach((p) => p.removeAttribute("data-excat-unsplit"));
  }
  var EMPTY_PLACEHOLDER_SELECTORS = [
    ".c63-m18-paragraph",
    ".cmp-c103-vertical-carousel"
  ];
  var TRACKING_ATTRIBUTES = [
    "data-navigation-click",
    "data-event-tracking",
    "data-component",
    "data-component-name",
    "data-navigation-template",
    "data-navigation-data-endpoint",
    "data-domain-script",
    "data-document-language",
    "onload",
    "onclick"
  ];
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      let nodes = [];
      try {
        nodes = root.querySelectorAll(sel);
      } catch (e) {
        return;
      }
      nodes.forEach((n) => n.remove());
    });
  }
  function isEmptyPlaceholder(el) {
    if (el.textContent.trim()) return false;
    return !el.querySelector("img, picture, video, iframe, source, form, a[href]");
  }
  function transform(hookName, element, payload) {
    const root = element;
    if (hookName === "beforeTransform") {
      removeAll(root, CHROME_SELECTORS);
      removeAll(root, NEWSLETTER_PANEL_SELECTORS);
      removeAll(root, MOBILE_DUPLICATE_SELECTORS);
      root.querySelectorAll("img").forEach((img) => {
        if (isTrackingPixel(img)) img.remove();
      });
      unsplitText(root);
      EMPTY_PLACEHOLDER_SELECTORS.forEach((sel) => {
        root.querySelectorAll(sel).forEach((el) => {
          if (isEmptyPlaceholder(el)) el.remove();
        });
      });
      removeAll(root, ["script", "style", "noscript", "link"]);
    }
    if (hookName === "afterTransform") {
      removeAll(root, CHROME_SELECTORS);
      removeAll(root, ["script", "style", "noscript", "link", "meta", "iframe.ot-text-resize"]);
      root.querySelectorAll("img").forEach((img) => {
        try {
          const { hostname } = new URL(img.getAttribute("src") || "", "https://www.neom.com/");
          if (TRACKING_PIXEL_HOSTS.test(hostname)) img.remove();
        } catch (e) {
        }
      });
      root.querySelectorAll("p").forEach((p) => {
        if (!p.textContent.trim() && !p.children.length) p.remove();
      });
      root.querySelectorAll("a[href]").forEach((a) => {
        const m = a.getAttribute("href").match(/^https?:\/\/(?:www\.)?neom\.com(\/en-us(?:[/?#][^]*)?)$/i);
        if (m) a.setAttribute("href", m[1]);
      });
      TRACKING_ATTRIBUTES.forEach((attr) => {
        root.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
      });
    }
  }

  // tools/importer/transformers/neom-article-metadata.js
  var ARTICLE_TEMPLATES = ["newsroom-2", "news"];
  var articleMeta = null;
  function toIsoDate(text) {
    const d = new Date(text);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function readArticleMeta(document) {
    const article = document.querySelector(".cmp-c44-article-content");
    if (!article) return null;
    const dateEl = article.querySelector(".paragraph-date, .b-articleContent__datePublished");
    const date = dateEl ? toIsoDate(dateEl.textContent.trim()) : "";
    let tags = [...article.querySelectorAll(".b-articleContent__tags-row .tag-label")].map((a) => a.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (!tags.length) {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) tags = keywords.getAttribute("content").split(",").map((t) => t.trim()).filter(Boolean);
    }
    return { date, tags };
  }
  function addRow(document, table, key, value) {
    const tr = document.createElement("tr");
    const k = document.createElement("td");
    const v = document.createElement("td");
    k.textContent = key;
    v.textContent = value;
    tr.append(k, v);
    (table.querySelector("tbody") || table).append(tr);
  }
  function transform2(hookName, element, payload) {
    if (!payload.template || !ARTICLE_TEMPLATES.includes(payload.template.name)) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      articleMeta = readArticleMeta(document);
      return;
    }
    if (hookName === "afterMetadata") {
      const meta = articleMeta || {};
      const table = [...element.querySelectorAll("table")].find((t) => {
        const first = t.querySelector("th, td");
        return first && first.textContent.trim().toLowerCase() === "metadata";
      });
      if (!table) return;
      addRow(document, table, "Template", "article");
      if (meta.date) addRow(document, table, "Publication Date", meta.date);
      if (meta.tags && meta.tags.length) addRow(document, table, "Tags", meta.tags.join(", "));
    }
  }

  // tools/importer/transformers/neom-sections.js
  var MARKER_ID = "data-excat-section-id";
  var MARKER_STYLE = "data-excat-section-style";
  var MARKER_FIRST = "data-excat-section-first";
  var BACKGROUND_IMG = ".m-componentBackground img[src]";
  var HOIST_BACKGROUND_SECTIONS = ["rc7", "gap12"];
  function addStyle(style, name) {
    if (!name || new RegExp(`(^|,)\\s*${name}\\s*(,|$)`).test(style)) return style;
    return style ? `${style}, ${name}` : name;
  }
  function resolveStyle(section, el) {
    const isDark = el.classList.contains("t-dark");
    let style = section.style || "";
    if (section.id === "rc4") style = "";
    if (section.id === "gap1") {
      style = el.querySelector(".o-contentGrid__item.-paragraph.-center, .o-contentGrid__item.-center") ? "centered" : "";
    }
    if (section.id === "rc7" && el.querySelector(BACKGROUND_IMG)) style = "dark, background";
    if (section.id === "gap2" && el.querySelector(".b-boxedList__header .m-componentHeader.-center")) {
      style = addStyle(style, "centered");
    }
    if (isDark) style = addStyle(style, "dark");
    return style || null;
  }
  function hoistBackgroundImage(el, doc) {
    const img = el.querySelector(BACKGROUND_IMG);
    if (!img) return;
    const picture = img.closest("picture") || img;
    const p = doc.createElement("p");
    p.append(picture);
    el.querySelectorAll(".m-componentBackground").forEach((bg) => bg.remove());
    el.prepend(p);
  }
  function queryFirstMatchingSelector(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (let i = 0; i < list.length; i += 1) {
      const sel = list[i];
      if (!sel) continue;
      let nodes = [];
      try {
        nodes = Array.from(root.querySelectorAll(sel));
      } catch (e) {
        nodes = [];
      }
      if (nodes.length) return nodes;
    }
    return [];
  }
  function collectMatches(root, sections) {
    const matches = [];
    const seen = /* @__PURE__ */ new Set();
    sections.forEach((section) => {
      queryFirstMatchingSelector(root, section.selector).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        matches.push({ el, section });
      });
    });
    const top = matches.filter((m) => !matches.some((o) => o !== m && o.el.contains(m.el)));
    top.sort((a, b) => {
      if (a.el === b.el) return 0;
      return a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1;
    });
    return top;
  }
  function transform3(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!Array.isArray(sections) || sections.length < 2) return;
    const doc = payload && payload.document || element.ownerDocument;
    if (hookName === "beforeTransform") {
      const matches = collectMatches(element, sections);
      for (let i = matches.length - 1; i >= 0; i -= 1) {
        const { el, section } = matches[i];
        const style = resolveStyle(section, el);
        if (HOIST_BACKGROUND_SECTIONS.includes(section.id)) hoistBackgroundImage(el, doc);
        if (i === 0 && !style) continue;
        const hr = doc.createElement("hr");
        if (style) {
          hr.setAttribute(MARKER_ID, section.id);
          hr.setAttribute(MARKER_STYLE, style);
        }
        if (i === 0) hr.setAttribute(MARKER_FIRST, "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      const markers = Array.from(element.querySelectorAll(`hr[${MARKER_ID}]`));
      for (let i = markers.length - 1; i >= 0; i -= 1) {
        const hr = markers[i];
        const id = hr.getAttribute(MARKER_ID);
        const section = sections.find((s) => s.id === id);
        const style = hr.getAttribute(MARKER_STYLE) || section && section.style;
        if (style) {
          const metadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style }
          });
          hr.after(metadata);
        }
        hr.removeAttribute(MARKER_ID);
        hr.removeAttribute(MARKER_STYLE);
        if (hr.hasAttribute(MARKER_FIRST)) hr.remove();
      }
      element.querySelectorAll(`hr[${MARKER_FIRST}]`).forEach((hr) => hr.remove());
    }
  }

  // tools/importer/transformers/neom-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function detectDynamicMediaUrl(urlStr) {
    if (!urlStr || !/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return "scene7";
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  function normalizeUrl(src) {
    return src.startsWith("//") ? `https:${src}` : src;
  }
  function getImageSrc(img) {
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src")
    ];
    const srcset = img.getAttribute("srcset") || img.closest("picture") && img.closest("picture").querySelector("source[srcset]") && img.closest("picture").querySelector("source[srcset]").getAttribute("srcset");
    if (srcset) candidates.push(srcset.split(",")[0].trim().split(/\s+/)[0]);
    return candidates.find((c) => c && detectDynamicMediaUrl(c)) || null;
  }
  function imageUnit(img) {
    const picture = img.closest("picture");
    return picture && picture.contains(img) ? picture : img;
  }
  function isSoleImageAnchor(anchor, unit) {
    if (anchor.querySelectorAll("img").length !== 1) return false;
    const clone = anchor.cloneNode(true);
    clone.querySelectorAll("picture, img").forEach((n) => n.remove());
    if (clone.textContent.trim()) return false;
    return !clone.querySelector("video, iframe, svg, input, button, select, textarea");
  }
  function transform4(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    const images = Array.from(element.querySelectorAll("img"));
    images.forEach((img) => {
      if (!img.isConnected) return;
      const src = getImageSrc(img);
      if (!src) return;
      const dmUrl = normalizeUrl(src);
      const altRaw = (img.getAttribute("alt") || "").trim();
      const text = altRaw || EMPTY_ALT_SENTINEL;
      const unit = imageUnit(img);
      const anchor = img.closest("a[href]");
      if (anchor) {
        if (!isSoleImageAnchor(anchor, unit)) {
          console.warn("[neom-dm-images] Skipping DM image inside mixed-content link:", dmUrl);
          return;
        }
        const href = anchor.getAttribute("href") || "";
        if (detectDynamicMediaUrl(href)) {
          anchor.setAttribute("href", dmUrl);
          anchor.removeAttribute("title");
        } else {
          anchor.setAttribute("title", dmUrl);
        }
        anchor.textContent = text;
        return;
      }
      const a = doc.createElement("a");
      a.setAttribute("href", dmUrl);
      a.textContent = text;
      unit.replaceWith(a);
    });
  }

  // tools/importer/transformers/neom-page-metadata.js
  var RULES = [
    {
      match: /^\/en-us\/neom-sports-club(\/|$)/,
      rows: [["Nav", "/en-us/neom-sports-club/nav"], ["Footer", "/en-us/neom-sports-club/footer"]]
    },
    {
      match: /^\/en-us\/newsroom(\/|$)/,
      rows: [["Subnav", "/en-us/newsroom/subnav"]]
    }
  ];
  function pagePath(payload) {
    const raw = payload.params && payload.params.originalURL || payload.url || "";
    try {
      return new URL(raw).pathname.replace(/\.html?$/, "").replace(/\/$/, "");
    } catch (e) {
      return "";
    }
  }
  function findMetadataTable(element) {
    return [...element.querySelectorAll("table")].find((t) => {
      const first = t.querySelector("th, td");
      return first && first.textContent.trim().toLowerCase() === "metadata";
    });
  }
  var pageRows = [];
  function transform5(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      const path = pagePath(payload);
      pageRows = RULES.filter((r) => r.match.test(path)).flatMap((r) => r.rows);
      return;
    }
    if (hookName !== "afterMetadata") return;
    const rows = pageRows;
    if (!rows.length) return;
    const document = element.ownerDocument;
    let table = findMetadataTable(element);
    if (!table) {
      table = WebImporter.DOMUtils.createTable([["Metadata"]], document);
      element.append(table);
    }
    const body = table.querySelector("tbody") || table;
    const existing = new Set([...table.querySelectorAll("tr")].map((tr) => (tr.querySelector("td, th") || {}).textContent).filter(Boolean).map((k) => k.trim().toLowerCase()));
    rows.forEach(([key, value]) => {
      if (existing.has(key.toLowerCase())) return;
      const tr = document.createElement("tr");
      const k = document.createElement("td");
      const v = document.createElement("td");
      k.textContent = key;
      v.textContent = value;
      tr.append(k, v);
      body.append(tr);
    });
  }

  // tools/importer/import-newsroom.js
  var PAGE_TEMPLATE = {
    "name": "newsroom",
    "urls": [
      "https://www.neom.com/en-us/newsroom"
    ],
    "representativeUrl": "https://www.neom.com/en-us/newsroom",
    "description": "Newsroom landing page: featured news, resources and press contact",
    "blocks": [
      {
        "name": "breadcrumbs",
        "instances": [
          ".c98-breadcrumbs"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          ".cmp-c123-featured-news"
        ]
      }
    ],
    "urlPattern": "/en-us/*",
    "sections": [
      {
        "id": "bc1",
        "name": "breadcrumbs",
        "selector": [
          ".c98-breadcrumbs"
        ],
        "style": null,
        "blocks": [
          "breadcrumbs"
        ],
        "defaultContent": []
      },
      {
        "id": "nr1",
        "name": "featured-news",
        "selector": [
          ".cmp-c123-featured-news"
        ],
        "style": null,
        "blocks": [
          "cards-news"
        ],
        "defaultContent": [
          ".cmp-c123-featured-news .b-newsroomDch__header"
        ]
      },
      {
        "id": "nr2",
        "name": "resources",
        "selector": [
          ".cmp-c126-featured-download"
        ],
        "style": "light-cream",
        "blocks": [],
        "defaultContent": [
          ".cmp-c126-featured-download .b-featuredDownload__header"
        ]
      },
      {
        "id": "nr3",
        "name": "press-contact",
        "selector": [
          ".cmp-c24-content"
        ],
        "style": "dark, centered",
        "blocks": [],
        "defaultContent": [
          ".cmp-c24-content"
        ]
      }
    ]
  };
  var parsers = {
    "breadcrumbs": parse,
    "cards-news": parse2
  };
  var transformers = [
    transform,
    transform2,
    transform3,
    transform4,
    transform5
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_newsroom_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      executeTransformers("afterMetadata", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_newsroom_exports);
})();
