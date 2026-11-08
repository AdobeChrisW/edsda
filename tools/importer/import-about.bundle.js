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

  // tools/importer/import-about.js
  var import_about_exports = {};
  __export(import_about_exports, {
    default: () => import_about_default
  });

  // tools/importer/parsers/carousel-hero-video.js
  var ORIGIN = "https://www.neom.com";
  function absUrl(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function cleanText(el) {
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
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function videoUrl(scope) {
    const video = scope.querySelector("video");
    if (!video) return "";
    const candidates = [
      video.getAttribute("src"),
      video.getAttribute("data-src"),
      ...[...video.querySelectorAll("source")].map((s) => s.getAttribute("src") || s.getAttribute("data-src"))
    ];
    const found = candidates.find((c) => c && c.trim());
    return found ? absUrl(found) : "";
  }
  function buildHeading(document, srcHeading) {
    const h2 = document.createElement(srcHeading.tagName === "H1" ? "h1" : "h2");
    const extras = [];
    [...srcHeading.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === "BR") {
        h2.append(document.createElement("br"));
      } else if (n.nodeType === 1 && /^(DIV|P|SPAN)$/.test(n.tagName) && n.tagName !== "SPAN") {
        const t = cleanText(n);
        if (t) {
          const p = document.createElement("p");
          p.textContent = t;
          extras.push(p);
        }
      } else if (n.nodeType === 3 || n.nodeType === 1) {
        const t = n.textContent.replace(/\s+/g, " ");
        if (t.trim()) h2.append(document.createTextNode(t.trim()));
      }
    });
    return { h2, extras };
  }
  function isHiddenEyebrow(el) {
    if (el.closest(".b-heroSliderV2") && el.parentElement && el.parentElement.classList.contains("m-componentHeader__container")) return true;
    if (el.closest('[hidden], [aria-hidden="true"], .-isHidden')) return true;
    const style = (el.getAttribute("style") || "").replace(/\s+/g, "");
    return /display:none|visibility:hidden/i.test(style);
  }
  function parse(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(".b-heroSliderV2__slide");
    element.querySelectorAll(".b-heroSlider__item .o-heroContent").forEach((slide) => {
      const media = [];
      const img = buildImage(document, slide.querySelector(".m-componentBackground .a-image img, picture img"));
      if (img) media.push(img);
      const vUrl = videoUrl(slide);
      if (vUrl) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = vUrl;
        a.textContent = vUrl;
        p.append(a);
        media.push(p);
      }
      const content = [];
      const heading = slide.querySelector(".o-heroContent__content .a-heading, .o-heroContent__content h1, .o-heroContent__content h2");
      if (heading && cleanText(heading)) {
        const { h2, extras } = buildHeading(document, heading);
        content.push(h2, ...extras);
      }
      slide.querySelectorAll(".o-heroContent__content .m-componentHeader p").forEach((el) => {
        if (!cleanText(el)) return;
        const p = document.createElement("p");
        p.textContent = cleanText(el);
        content.push(p);
      });
      slide.querySelectorAll(".o-heroContent__buttons a.m-button[href]").forEach((btn) => {
        const label = cleanText(btn.querySelector(".a-label") || btn);
        if (!label) return;
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = absUrl(btn.getAttribute("href"));
        a.textContent = label;
        p.append(a);
        content.push(p);
      });
      if (media.length || content.length) cells.push([media, content]);
    });
    slides.forEach((slide) => {
      const media = [];
      const img = buildImage(document, slide.querySelector(".a-image img, picture img"));
      if (img) media.push(img);
      const vUrl = videoUrl(slide);
      if (vUrl) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = vUrl;
        a.textContent = vUrl;
        p.append(a);
        media.push(p);
      }
      const content = [];
      const copy = slide.querySelector(".b-heroSliderV2__copy") || slide;
      const eyebrow = copy.querySelector(".m-componentHeader .a-eyebrow");
      if (eyebrow && cleanText(eyebrow) && !isHiddenEyebrow(eyebrow)) {
        const p = document.createElement("p");
        p.textContent = cleanText(eyebrow);
        content.push(p);
      }
      const heading = copy.querySelector(".a-heading, h1, h2, h3, h4, h5, h6");
      if (heading && cleanText(heading)) {
        const { h2, extras } = buildHeading(document, heading);
        content.push(h2, ...extras);
      }
      const desc = copy.querySelector(".b-heroSliderV2__copyDescription");
      if (desc && cleanText(desc)) {
        const p = document.createElement("p");
        p.textContent = cleanText(desc);
        content.push(p);
      }
      copy.querySelectorAll(".b-heroSliderV2__buttons a.m-button[href], .b-heroSliderV2__buttons button.m-button").forEach((btn) => {
        const label = cleanText(btn.querySelector(".a-label") || btn) || (btn.getAttribute("title") || "").trim();
        if (!label) return;
        const p = document.createElement("p");
        const href = btn.getAttribute("href");
        if (btn.tagName === "A" && href) {
          const a = document.createElement("a");
          a.href = absUrl(href);
          a.textContent = label;
          p.append(a);
        } else if (vUrl) {
          const a = document.createElement("a");
          a.href = vUrl;
          a.textContent = label;
          p.append(a);
        } else {
          p.textContent = label;
        }
        content.push(p);
      });
      if (media.length || content.length) cells.push([media, content]);
    });
    const slider = element.matches(".b-heroSliderV2, .b-heroSlider") ? element : element.querySelector(".b-heroSliderV2, .b-heroSlider");
    const options = [];
    if (slider && slider.classList.contains("-disableFullScreen")) options.push("short");
    if (slider && slider.classList.contains("b-heroSlider") && !slider.classList.contains("b-heroSliderV2")) options.push("classic");
    const firstHeading = element.querySelector(".b-heroSliderV2__copy .a-heading, .o-heroContent__content .a-heading");
    if (firstHeading && firstHeading.classList.contains("-h4")) options.push("large-title");
    if (firstHeading && firstHeading.classList.contains("-h5")) options.push("small-title");
    if (firstHeading && [...firstHeading.children].some((c) => !/^BR$/i.test(c.tagName) && cleanText(c) && cleanText(c) !== cleanText(firstHeading))) options.push("inline-subtitle");
    const name = options.length ? `Carousel Hero Video (${options.join(", ")})` : "carousel-hero-video";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-map-stats.js
  var ORIGIN2 = "https://www.neom.com";
  function absUrl2(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN2}${u}`;
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
  function buildImage2(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl2(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function paragraphsFrom(document, container) {
    const out = [];
    if (!container) return out;
    const blocks = container.querySelectorAll(":scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > h4");
    if (blocks.length) {
      blocks.forEach((b) => {
        if (cleanText2(b)) out.push(b.cloneNode(true));
      });
    } else if (cleanText2(container)) {
      const p = document.createElement("p");
      p.innerHTML = container.innerHTML.trim();
      out.push(p);
    }
    return out;
  }
  function parse2(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const introHeading = element.querySelector(".b-transitionSlider__heading .a-heading, .b-transitionSlider__heading h1, .b-transitionSlider__heading h2, .b-transitionSlider__heading h3");
    if (introHeading && cleanText2(introHeading)) {
      const h2 = document.createElement("h2");
      h2.textContent = cleanText2(introHeading);
      defaultContent.push(h2);
    }
    const labels = [...element.querySelectorAll(".b-transitionSlider__titlePaginationItem")].map((li) => cleanText2(li.querySelector("span")) || cleanText2(li));
    const slides = element.querySelectorAll(".b-transitionSlider__item");
    slides.forEach((slide, i) => {
      const label = labels[i] || `Tab ${i + 1}`;
      const panel = [];
      const mapImg = buildImage2(document, slide.querySelector(".o-regionSliderNavigation__map > .a-image img"));
      if (mapImg) {
        const p = document.createElement("p");
        p.append(mapImg);
        panel.push(p);
      }
      const items = slide.querySelectorAll(".o-regionSliderNavigation__paginationItem");
      if (items.length) {
        const ul = document.createElement("ul");
        items.forEach((item) => {
          const step = item.querySelector(".a-stepIndicator");
          if (!step) return;
          const text = cleanText2(step.querySelector(".a-stepIndicator__label") || step);
          if (!text) return;
          const li = document.createElement("li");
          const href = step.getAttribute("href") || item.querySelector("a[href]") && item.querySelector("a[href]").getAttribute("href");
          if (href) {
            const a = document.createElement("a");
            a.href = absUrl2(href);
            a.textContent = text;
            li.append(a);
          } else {
            li.textContent = text;
          }
          ul.append(li);
        });
        if (ul.children.length) panel.push(ul);
      }
      slide.querySelectorAll(".m-statisticCard__figureItem").forEach((fig) => {
        const valueEl = fig.querySelector(".m-statisticCard__figureValue");
        let value = "";
        if (valueEl) {
          const measureEl = valueEl.querySelector(".m-statisticCard__figureMeasure");
          const measure = cleanText2(measureEl);
          const clone = valueEl.cloneNode(true);
          const m = clone.querySelector(".m-statisticCard__figureMeasure");
          if (m) m.remove();
          const num = cleanText2(clone);
          value = measure ? `${num}${/^[A-Za-z]/.test(measure) ? " " : ""}${measure}` : num;
        }
        const caption = cleanText2(fig.querySelector(".m-statisticCard__figureLabel"));
        if (!value && !caption) return;
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = value;
        p.append(strong);
        if (caption) {
          p.append(document.createElement("br"));
          p.append(document.createTextNode(caption));
        }
        panel.push(p);
      });
      panel.push(...paragraphsFrom(document, slide.querySelector(".o-transitionSlide__content .m-paragraph__content")));
      slide.querySelectorAll(".o-transitionSlide__buttons > a.m-button[href]").forEach((btn) => {
        const text = cleanText2(btn.querySelector(".a-label") || btn);
        if (!text) return;
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = absUrl2(btn.getAttribute("href"));
        a.textContent = text;
        p.append(a);
        panel.push(p);
      });
      cells.push([label, panel]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-map-stats", cells });
    if (defaultContent.length) element.before(...defaultContent);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var ORIGIN3 = "https://www.neom.com";
  function absUrl3(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN3}${u}`;
    return u;
  }
  function cleanText3(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage3(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl3(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function paragraphsFrom2(document, container) {
    const out = [];
    if (!container) return out;
    const blocks = container.querySelectorAll(":scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > h4, :scope > blockquote");
    if (blocks.length) {
      blocks.forEach((b) => {
        if (cleanText3(b)) out.push(b.cloneNode(true));
      });
    } else if (cleanText3(container)) {
      const p = document.createElement("p");
      p.innerHTML = container.innerHTML.trim();
      out.push(p);
    }
    out.forEach((el) => el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl3(a.getAttribute("href")))));
    return out;
  }
  function buildHeading2(document, src) {
    const h2 = document.createElement("h2");
    h2.innerHTML = src.innerHTML.trim();
    h2.querySelectorAll("span:not([class]), div").forEach((n) => n.replaceWith(...n.childNodes));
    while (h2.lastChild && (h2.lastChild.nodeName === "BR" || h2.lastChild.nodeType === 3 && !h2.lastChild.textContent.trim())) {
      h2.lastChild.remove();
    }
    return h2;
  }
  function buildContent(document, contentEl, buttonsEl) {
    const content = [];
    if (!contentEl) return content;
    const eyebrow = contentEl.querySelector(".a-eyebrow");
    if (eyebrow && cleanText3(eyebrow)) {
      const p = document.createElement("p");
      p.textContent = cleanText3(eyebrow);
      content.push(p);
    }
    const heading = contentEl.querySelector(".m-paragraph__heading .a-heading, .m-paragraph__heading h1, .m-paragraph__heading h2, .m-paragraph__heading h3, .m-paragraph__heading h4");
    if (heading && cleanText3(heading)) content.push(buildHeading2(document, heading));
    content.push(...paragraphsFrom2(document, contentEl.querySelector(".m-paragraph__content")));
    const btnScope = buttonsEl || contentEl;
    btnScope.querySelectorAll("a.m-button[href]").forEach((btn) => {
      const text = cleanText3(btn.querySelector(".a-label") || btn) || (btn.getAttribute("title") || "").trim();
      if (!text) return;
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = absUrl3(btn.getAttribute("href"));
      a.textContent = text;
      p.append(a);
      content.push(p);
    });
    return content;
  }
  function pushRow(cells, imageEl, content, imageFirst) {
    const imageCell = imageEl ? [imageEl] : [];
    if (!imageEl) {
      cells.push([content]);
      return;
    }
    cells.push(imageFirst ? [imageCell, content] : [content, imageCell]);
  }
  function parse3(element, { document }) {
    const cells = [];
    const groupItems = element.querySelectorAll(".b-contentGroup__item");
    if (groupItems.length) {
      groupItems.forEach((item) => {
        const ta = item.querySelector(".o-textAsset") || item;
        const contentItem = ta.querySelector(".o-textAsset__item.-content") || ta;
        const assetItem = ta.querySelector(".o-textAsset__item.-asset");
        const img = buildImage3(document, assetItem && assetItem.querySelector("img"));
        const content = buildContent(document, contentItem, ta.querySelector(".o-textAsset__buttons"));
        const imageFirst = ta.classList.contains("-assetFirst");
        if (img || content.length) pushRow(cells, img, content, imageFirst);
      });
    } else {
      const section = element.querySelector(".b-content") || element;
      const contentItem = section.querySelector(".o-contentGrid__item.-paragraph") || section;
      const assetItem = section.querySelector(".o-contentGrid__item.-asset");
      const img = buildImage3(document, (assetItem || section).querySelector("img"));
      const buttons = section.querySelector(".o-contentGrid__buttons");
      const content = buildContent(document, contentItem, buttons);
      let imageFirst;
      if (section.classList.contains("-assetLast")) imageFirst = false;
      else if (section.classList.contains("-assetFirst")) imageFirst = true;
      else {
        const items = [...section.querySelectorAll(".o-contentGrid__item")];
        imageFirst = assetItem ? items.indexOf(assetItem) === 0 : false;
      }
      if (img || content.length) pushRow(cells, img, content, imageFirst);
    }
    const options = [];
    if (element.querySelector("figure.m-figure.-square")) options.push("square");
    const rows = [...element.querySelectorAll(".b-contentGroup__item .o-textAsset")];
    if (rows.length) {
      const pulled = rows.filter((r) => r.classList.contains("-assetPull")).length;
      if (pulled === rows.length) options.push("pull");
      else if (pulled === 0) options.push("inset");
    }
    if (element.querySelector("h2.a-heading.-h5, h3.a-heading.-h5")) options.push("large-heading");
    const name = options.length ? `Columns Media (${options.join(", ")})` : "columns-media";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/breadcrumbs.js
  var ORIGIN_RE = /^https?:\/\/(www\.)?neom\.com(?=\/|$)/i;
  function cleanText4(el) {
    return el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }
  function relHref(href) {
    const h = (href || "").trim();
    if (!h) return "";
    const rel = h.replace(ORIGIN_RE, "");
    return rel || "/";
  }
  function parse4(element, { document }) {
    const items = [...element.querySelectorAll(".m-breadcrumbs__items > .m-breadcrumbs__item, ul.m-breadcrumbs__items > li")].filter((li, i, all) => all.indexOf(li) === i);
    const ul = document.createElement("ul");
    items.forEach((item, idx) => {
      const link = item.querySelector("a[href]");
      const label = cleanText4(link || item);
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

  // tools/importer/parsers/cards-slider.js
  var ORIGIN4 = "https://www.neom.com";
  function absUrl4(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN4}${u}`;
    return u;
  }
  function cleanText5(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage4(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl4(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function paragraphsFrom3(document, container) {
    const out = [];
    if (!container) return out;
    const blocks = container.querySelectorAll(":scope > p, :scope > ul, :scope > ol");
    if (blocks.length) {
      blocks.forEach((b) => {
        if (cleanText5(b)) out.push(b.cloneNode(true));
      });
    } else if (cleanText5(container)) {
      const p = document.createElement("p");
      p.innerHTML = container.innerHTML.trim();
      out.push(p);
    }
    out.forEach((el) => el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl4(a.getAttribute("href")))));
    return out;
  }
  function copyHeading(document, src, tag) {
    const h = document.createElement(tag);
    h.innerHTML = src.innerHTML.trim();
    h.querySelectorAll("span, div, p").forEach((n) => n.replaceWith(...n.childNodes));
    h.querySelectorAll("strong").forEach((s) => {
      s.textContent = cleanText5(s);
    });
    h.querySelectorAll("br").forEach((br) => {
      if (!br.nextSibling || !cleanText5({ textContent: br.nextSibling.textContent || "" })) br.remove();
    });
    return cleanText5(h) ? h : null;
  }
  function parseGenericSlider(document, element, cells, defaultContent) {
    const header = element.querySelector(".o-genericSlider__header");
    const intro = [];
    if (header) {
      const eyebrow = header.querySelector(".a-eyebrow");
      if (eyebrow && cleanText5(eyebrow)) {
        const p = document.createElement("p");
        p.textContent = cleanText5(eyebrow);
        intro.push(p);
      }
      const lead = header.querySelector(".o-genericSlider__titleWrapper .a-heading, .o-genericSlider__titleWrapper h2");
      if (lead && cleanText5(lead)) {
        const h = copyHeading(document, lead, "h2");
        if (h) intro.push(h);
      }
    }
    defaultContent.push(...intro);
    element.querySelectorAll(".o-genericSlider__content .swiper-slide").forEach((slide) => {
      const card = slide.querySelector(".o-contentCard") || slide;
      const img = buildImage4(document, card.querySelector(".o-contentCard__preview img, img"));
      const overlay = card.querySelector("a.o-contentCard__link[href]");
      const href = overlay ? absUrl4(overlay.getAttribute("href")) : "";
      const body = [];
      const title = card.querySelector(".o-contentCard__heading");
      if (title && cleanText5(title)) {
        const h3 = document.createElement("h3");
        h3.textContent = cleanText5(title);
        body.push(h3);
      }
      body.push(...paragraphsFrom3(document, card.querySelector(".o-contentCard__description")));
      const cta = card.querySelector(".o-contentCard__content .m-button");
      const ctaText = cta ? cleanText5(cta.querySelector(".a-label") || cta) || (cta.getAttribute("title") || "").trim() : "";
      const ctaHref = cta && cta.getAttribute("href") ? absUrl4(cta.getAttribute("href")) : href;
      if (ctaHref) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaHref;
        a.textContent = ctaText || cleanText5(title) || ctaHref;
        p.append(a);
        body.push(p);
      } else if (ctaText) {
        const p = document.createElement("p");
        p.textContent = ctaText;
        body.push(p);
      }
      if (img || body.length) cells.push([img ? [img] : "", body]);
    });
  }
  function parseSimpleCardCarousel(document, element, cells) {
    const slides = element.querySelectorAll(".swiper-slide");
    slides.forEach((slide) => {
      const textCard = slide.querySelector(".b-simpleCardCarousel__textCard");
      if (textCard) {
        const intro = [];
        const heading = textCard.querySelector(".m-paragraph__heading .a-heading, .m-paragraph__heading h1, .m-paragraph__heading h2, .m-paragraph__heading h3, .m-paragraph__heading h4");
        if (heading) {
          const h = copyHeading(document, heading, "h4");
          if (h) intro.push(h);
        }
        intro.push(...paragraphsFrom3(document, textCard.querySelector(".m-paragraph__content")));
        textCard.querySelectorAll(".b-simpleCardCarousel__buttonsWrapper a[href]").forEach((btn) => {
          const t = cleanText5(btn.querySelector(".a-label") || btn);
          if (!t) return;
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = absUrl4(btn.getAttribute("href"));
          a.textContent = t;
          p.append(a);
          intro.push(p);
        });
        if (intro.length) cells.push([intro]);
        return;
      }
      const img = buildImage4(document, slide.querySelector("img"));
      if (!img) return;
      const body = [];
      const caption = slide.querySelector(".o-galleryCard__caption, .o-galleryCard__title, figcaption");
      if (caption && cleanText5(caption)) {
        const p = document.createElement("p");
        p.textContent = cleanText5(caption);
        body.push(p);
      }
      cells.push([[img], body.length ? body : ""]);
    });
  }
  function parse5(element, { document }) {
    const cells = [];
    const defaultContent = [];
    if (element.querySelector(".o-genericSlider")) {
      parseGenericSlider(document, element, cells, defaultContent);
    } else {
      parseSimpleCardCarousel(document, element, cells);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-slider", cells });
    if (defaultContent.length) element.before(...defaultContent);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  var ORIGIN5 = "https://www.neom.com";
  function absUrl5(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN5}${u}`;
    return u;
  }
  function cleanText6(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage5(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl5(src);
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
  function parse6(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const header = element.querySelector(".b-newsroomDch__header");
    if (header) {
      const h = header.querySelector(".a-heading, h1, h2, h3");
      if (h && cleanText6(h)) {
        const h2 = document.createElement("h2");
        h2.textContent = cleanText6(h);
        defaultContent.push(h2);
      }
      const desc = header.querySelector(".a-moustache, .header-desc p");
      if (desc && cleanText6(desc)) defaultContent.push(textP(document, cleanText6(desc)));
      const more = header.querySelector("a.m-button[href]");
      if (more) {
        const t = cleanText6(more.querySelector(".a-label") || more);
        if (t) defaultContent.push(linkP(document, absUrl5(more.getAttribute("href")), t));
      }
    }
    const items = element.querySelectorAll(".b-newsroomDch__items > li, li.b-newsroomDch__item");
    [...new Set(items)].forEach((item) => {
      const titleLink = item.querySelector(".b-newsroomDch__headingText");
      const anyLink = item.querySelector("a[href]");
      const href = absUrl5(titleLink && titleLink.getAttribute("href") || anyLink && anyLink.getAttribute("href") || "");
      const title = cleanText6(titleLink || item.querySelector("h2, h3, h4"));
      const img = buildImage5(document, item.querySelector(".b-newsroomDch__itemImage, img"));
      const body = [];
      const tag = cleanText6(item.querySelector(".b-newsroomDch__tag"));
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
      const excerpt = cleanText6(item.querySelector(".b-newsroomDch__description"));
      if (excerpt) body.push(textP(document, excerpt));
      const date = cleanText6(item.querySelector(".b-newsroomDch__date"));
      if (date) body.push(textP(document, date));
      if (img || body.length) cells.push([img ? [img] : "", body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const isSlider = !!element.querySelector(".b-newsroomDch.-carousel");
    const block = WebImporter.Blocks.createBlock(document, { name: isSlider ? "Cards News (slider)" : "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function cleanText7(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function parse7(element, { document }) {
    const cells = [];
    const input = element.querySelector('input[type="email"], .a-input__input, input:not([type="hidden"])');
    const labelEl = element.querySelector(".m-textField__textLabel .a-label") || element.querySelector(".m-textField__label .a-label") || element.querySelector("label");
    let label = cleanText7(labelEl);
    if (labelEl && labelEl.tagName === "LABEL") {
      const limit = labelEl.querySelector(".m-textField__limit");
      if (limit) label = label.replace(cleanText7(limit), "").trim();
    }
    if (label) cells.push(["label", label]);
    const placeholder = input ? (input.getAttribute("placeholder") || "").trim() : "";
    if (placeholder) cells.push(["placeholder", placeholder]);
    const button = element.querySelector('.o-form__buttons button, button[type="submit"], button');
    const buttonText = button ? cleanText7(button.querySelector(".a-label") || button) || (button.getAttribute("title") || "").trim() : "";
    if (buttonText) cells.push(["button", buttonText]);
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-boxed.js
  var ICON_SVG_BASE = "https://www.neom.com/content/dam/neom/svg/";
  var ORIGIN6 = "https://www.neom.com";
  function absUrl6(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN6}${u}`;
    return u;
  }
  function cleanText8(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage6(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl6(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function buildIcon(document, box) {
    const img = buildImage6(document, box.querySelector(".o-boxedCard__asset img"));
    if (img) return img;
    const span = box.querySelector(".o-boxedCard__asset .a-icon[data-icon]");
    const name = span && (span.getAttribute("data-icon") || "").trim();
    if (!name || !/^[a-z0-9-]+$/i.test(name)) return null;
    const out = document.createElement("img");
    out.src = `${ICON_SVG_BASE}${name}.svg`;
    out.alt = "";
    return out;
  }
  function textEl(document, tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
  }
  function parse8(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const section = element.querySelector(".b-boxedList") || element;
    const header = section.querySelector(".b-boxedList__header");
    if (header) {
      const eyebrow = cleanText8(header.querySelector(".a-eyebrow"));
      if (eyebrow) defaultContent.push(textEl(document, "p", eyebrow));
      const heading = cleanText8(header.querySelector(".a-heading"));
      if (heading) defaultContent.push(textEl(document, "h2", heading));
      const moustache = cleanText8(header.querySelector(".a-moustache"));
      if (moustache) defaultContent.push(textEl(document, "p", moustache));
    }
    const bgImg = section.querySelector(":scope > .m-componentBackground img") || section.querySelector(".b-boxedList__background img");
    const bg = buildImage6(document, bgImg);
    if (bg) cells.push([[bg]]);
    section.querySelectorAll(".b-boxedList__card").forEach((card) => {
      const box = card.querySelector(".o-boxedCard") || card;
      const icon = buildIcon(document, box);
      const body = [];
      const title = cleanText8(box.querySelector(".o-boxedCard__heading"));
      if (title) body.push(textEl(document, "h3", title));
      const copy = box.querySelector(".o-boxedCard__copy");
      if (copy && cleanText8(copy)) {
        const p = document.createElement("p");
        p.innerHTML = copy.innerHTML.trim();
        while (p.firstChild && (p.firstChild.nodeName === "BR" || p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim())) p.firstChild.remove();
        body.push(p);
      }
      box.querySelectorAll(".o-boxedCard__link a[href]").forEach((a) => {
        const t = cleanText8(a.querySelector(".a-label") || a) || (a.getAttribute("title") || "").trim();
        if (!t) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = absUrl6(a.getAttribute("href"));
        link.textContent = t;
        p.append(link);
        body.push(p);
      });
      if (icon || body.length) cells.push([icon ? [icon] : "", body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const centered = !!section.querySelector(".o-boxedCard.-center");
    const name = centered ? "Cards Boxed (centered)" : "cards-boxed";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-timeline.js
  var ORIGIN7 = "https://www.neom.com";
  function absUrl7(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN7}${u}`;
    return u;
  }
  function cleanText9(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/[\sㅤ]+/g, " ").trim();
  }
  function buildImage7(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl7(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function contentParagraphs(document, container) {
    if (!container) return [];
    const clone = container.cloneNode(true);
    clone.querySelectorAll("span, font").forEach((n) => n.replaceWith(...n.childNodes));
    let html = clone.innerHTML;
    html = html.replace(/<\/?(div|p|section)[^>]*>/gi, "\n\n");
    html = html.replace(/(<br\s*\/?>\s*){2,}/gi, "\n\n");
    html = html.replace(/<br\s*\/?>/gi, "<br>");
    return html.split(/\n\s*\n/).map((seg) => {
      const p = document.createElement("p");
      p.innerHTML = seg.replace(/ㅤ/g, " ").trim();
      while (p.firstChild && (p.firstChild.nodeName === "BR" || p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim())) p.firstChild.remove();
      while (p.lastChild && (p.lastChild.nodeName === "BR" || p.lastChild.nodeType === 3 && !p.lastChild.textContent.trim())) p.lastChild.remove();
      p.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl7(a.getAttribute("href"))));
      return p;
    }).filter((p) => cleanText9(p));
  }
  function parse9(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const section = element.querySelector(".b-groupedContentSlider") || element;
    const eyebrow = cleanText9(section.querySelector(".b-groupedContentSlider__eyebrow"));
    if (eyebrow) {
      const h2 = document.createElement("h2");
      h2.textContent = eyebrow;
      defaultContent.push(h2);
    }
    const bg = buildImage7(document, section.querySelector(":scope > .m-componentBackground img"));
    if (bg) cells.push([[bg]]);
    const container = section.querySelector(".b-groupedContentSlider__items");
    let pendingLabel = "";
    if (container) {
      [...container.children].forEach((child) => {
        if (child.classList.contains("b-groupedContentSlider__itemLabel")) {
          pendingLabel = cleanText9(child);
          return;
        }
        if (!child.classList.contains("b-groupedContentSlider__item")) return;
        const card = child.querySelector(".o-timelineCard") || child;
        const entry = [];
        const label = pendingLabel || cleanText9(card.querySelector(".o-timelineCard__heading"));
        pendingLabel = "";
        if (label) {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = label;
          p.append(strong);
          entry.push(p);
        }
        const ownHeading = cleanText9(card.querySelector(".o-timelineCard__heading"));
        if (ownHeading && ownHeading !== label) {
          const p = document.createElement("p");
          p.textContent = ownHeading;
          entry.push(p);
        }
        const logo = buildImage7(document, card.querySelector(".o-timelineCard__logo img"));
        if (logo) {
          const p = document.createElement("p");
          p.append(logo);
          entry.push(p);
        }
        entry.push(...contentParagraphs(document, card.querySelector(".o-timelineCard__content")));
        card.querySelectorAll(".o-timelineCard__button a[href]").forEach((a) => {
          const t = cleanText9(a.querySelector(".a-label") || a) || (a.getAttribute("title") || "").trim();
          if (!t) return;
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = absUrl7(a.getAttribute("href"));
          link.textContent = t;
          p.append(link);
          entry.push(p);
        });
        if (entry.length) cells.push([entry]);
      });
    }
    if (defaultContent.length) element.before(...defaultContent);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-timeline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  var ORIGIN8 = "https://www.neom.com";
  function absUrl8(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN8}${u}`;
    return u;
  }
  function cleanText10(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage8(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl8(src);
    const alt = (img.getAttribute("alt") || "").trim();
    out.alt = /^background image alt text$/i.test(alt) ? "" : alt;
    return out;
  }
  function parse10(element, { document }) {
    const cells = [];
    const img = buildImage8(document, element.querySelector(".m-componentBackground img, .a-image img"));
    if (img) cells.push([[img]]);
    const content = [];
    const heading = element.querySelector(".o-heroContent__content .a-heading, .o-heroContent__content h1, .o-heroContent__content h2");
    if (heading && cleanText10(heading)) {
      const h1 = document.createElement("h1");
      h1.textContent = cleanText10(heading);
      content.push(h1);
    }
    element.querySelectorAll(".o-heroContent__content .a-eyebrow, .o-heroContent__content .a-moustache, .o-heroContent__content .m-componentHeader p, .o-heroContent__content .m-paragraph__content").forEach((el) => {
      const t = cleanText10(el);
      if (!t) return;
      const p = document.createElement("p");
      p.textContent = t;
      content.push(p);
    });
    element.querySelectorAll(".o-heroContent__buttons a[href]").forEach((a) => {
      const t = cleanText10(a.querySelector(".a-label") || a) || (a.getAttribute("title") || "").trim();
      if (!t) return;
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = absUrl8(a.getAttribute("href"));
      link.textContent = t;
      p.append(link);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-people.js
  var ORIGIN9 = "https://www.neom.com";
  function absUrl9(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN9}${u}`;
    return u;
  }
  function cleanText11(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage9(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl9(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function readItems(element) {
    const grid = element.matches("[data-items]") ? element : element.querySelector("section.b-cardGrid[data-items], [data-items]");
    if (!grid) return [];
    try {
      const items = JSON.parse(grid.getAttribute("data-items"));
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }
  var normName = (t) => (t || "").replace(/\s+/g, " ").trim().toLowerCase();
  var KEEP_INLINE = /^(A|STRONG|EM|B|I|BR|SUP|SUB)$/;
  function cleanInline(document, nodes, target) {
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        target.append(document.createTextNode(n.textContent));
      } else if (n.nodeType === 1) {
        if (KEEP_INLINE.test(n.tagName)) {
          const el = document.createElement(n.tagName.toLowerCase());
          if (n.tagName === "A") {
            const href = n.getAttribute("href");
            if (href) el.href = absUrl9(href);
          }
          cleanInline(document, [...n.childNodes], el);
          if (n.tagName === "BR" || el.textContent.trim()) target.append(el);
        } else {
          cleanInline(document, [...n.childNodes], target);
        }
      }
    });
    return target;
  }
  function isBlank(n) {
    return n && (n.nodeType === 3 && !n.textContent.trim() || n.nodeName === "BR");
  }
  function trimEdges(el) {
    while (isBlank(el.firstChild)) el.firstChild.remove();
    while (isBlank(el.lastChild)) el.lastChild.remove();
    if (el.firstChild && el.firstChild.nodeType === 3) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
    if (el.lastChild && el.lastChild.nodeType === 3) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
    return el;
  }
  function buildBio(document, copy) {
    if (!copy || !copy.trim()) return [];
    const out = [];
    if (!/<[a-z][^>]*>/i.test(copy)) {
      copy.split(/\n+/).map((t) => t.trim()).filter(Boolean).forEach((t) => {
        const p = document.createElement("p");
        p.textContent = t;
        out.push(p);
      });
      return out;
    }
    const src = document.createElement("div");
    src.innerHTML = copy;
    let loose = null;
    const flush = () => {
      if (loose && trimEdges(loose).textContent.trim()) out.push(loose);
      loose = null;
    };
    [...src.childNodes].forEach((n) => {
      if (n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)) {
        flush();
        const list = document.createElement(n.tagName.toLowerCase());
        [...n.children].filter((c) => c.tagName === "LI").forEach((li) => {
          const item = trimEdges(cleanInline(document, [...li.childNodes], document.createElement("li")));
          if (item.textContent.trim()) list.append(item);
        });
        if (list.children.length) out.push(list);
      } else if (n.nodeType === 1 && /^(P|DIV|H[1-6]|BLOCKQUOTE)$/.test(n.tagName)) {
        flush();
        const p = trimEdges(cleanInline(document, [...n.childNodes], document.createElement("p")));
        if (p.textContent.trim()) out.push(p);
      } else if (n.nodeType === 1 || n.nodeType === 3 && n.textContent.trim()) {
        if (!loose) loose = document.createElement("p");
        cleanInline(document, [n], loose);
      }
    });
    flush();
    return out;
  }
  function textP2(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function parse11(element, { document }) {
    const cells = [];
    const search = element.querySelector(".b-cardGrid__filters input[placeholder], .m-searchField input[placeholder]");
    if (search) {
      const placeholder = (search.getAttribute("placeholder") || "").trim();
      if (placeholder) cells.push([placeholder]);
    }
    const items = readItems(element);
    const cards = element.querySelectorAll(".b-cardGrid__item");
    cards.forEach((item, idx) => {
      const card = item.querySelector(".m-personCard") || item;
      const img = buildImage9(document, card.querySelector(".m-personCard__image img, img"));
      const body = [];
      const name = cleanText11(card.querySelector(".m-personCard__name"));
      if (name) body.push(textP2(document, name));
      const role = cleanText11(card.querySelector(".m-personCard__role"));
      if (role) body.push(textP2(document, role));
      const link = card.closest("a[href]") || card.querySelector("a[href]");
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = absUrl9(link.getAttribute("href"));
        a.textContent = "\u2192";
        p.append(a);
        body.push(p);
      }
      const data = items.find((d) => name && normName(d.name) === normName(name)) || (items.length === cards.length ? items[idx] : null);
      const bio = data ? buildBio(document, data.copy) : [];
      if (img || body.length) cells.push([img ? [img] : "", body, bio.length ? bio : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-people", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-split.js
  var ORIGIN10 = "https://www.neom.com";
  function absUrl10(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN10}${u}`;
    return u;
  }
  function cleanText12(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage10(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl10(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function paragraphsFrom4(document, container) {
    const out = [];
    if (!container) return out;
    const blocks = container.querySelectorAll(":scope > p, :scope > ul, :scope > ol");
    if (blocks.length) {
      blocks.forEach((b) => {
        if (cleanText12(b)) out.push(b.cloneNode(true));
      });
    } else if (cleanText12(container)) {
      const p = document.createElement("p");
      p.innerHTML = container.innerHTML.trim();
      out.push(p);
    }
    out.forEach((el) => el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl10(a.getAttribute("href")))));
    return out;
  }
  function parse12(element, { document }) {
    const cells = [];
    element.querySelectorAll(".b-highlightSlideshow__slide").forEach((slide) => {
      const img = buildImage10(document, slide.querySelector(".b-highlightSlideshow__images img"));
      const content = [];
      const eyebrow = cleanText12(slide.querySelector(".m-componentHeader .a-eyebrow"));
      if (eyebrow) {
        const p = document.createElement("p");
        p.textContent = eyebrow;
        content.push(p);
      }
      const heading = cleanText12(slide.querySelector(".m-componentHeader .a-heading"));
      if (heading) {
        const h2 = document.createElement("h2");
        h2.textContent = heading;
        content.push(h2);
      }
      content.push(...paragraphsFrom4(document, slide.querySelector(".b-highlightSlideshow__copyDescription")));
      slide.querySelectorAll(".b-highlightSlideshow__buttons a[href]").forEach((a) => {
        const t = cleanText12(a.querySelector(".a-label") || a) || (a.getAttribute("title") || "").trim();
        if (!t) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = absUrl10(a.getAttribute("href"));
        link.textContent = t;
        p.append(link);
        content.push(p);
      });
      if (img || content.length) cells.push([img ? [img] : "", content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-downloads.js
  var ORIGIN11 = "https://www.neom.com";
  function absUrl11(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN11}${u}`;
    return u;
  }
  function cleanText13(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage11(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl11(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function parse13(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const heading = cleanText13(element.querySelector(".b-downloads__heading"));
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading;
      defaultContent.push(h2);
    }
    element.querySelectorAll(".b-downloads__listItem").forEach((item) => {
      const dl = item.querySelector(".m-downloadItem") || item;
      const img = buildImage11(document, dl.querySelector(".m-downloadItem__image img"));
      const body = [];
      const title = cleanText13(dl.querySelector(".m-downloadItem__content .a-heading, .m-downloadItem__content h3"));
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      const desc = cleanText13(dl.querySelector(".m-downloadItem__description"));
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      const link = dl.querySelector("a.m-downloadItem__link[href], .m-downloadItem__content a[href]");
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = absUrl11(link.getAttribute("href"));
        a.textContent = cleanText13(link) || title || "Download";
        p.append(a);
        body.push(p);
      }
      if (img || body.length) cells.push([img ? [img] : "", body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-downloads", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  var ORIGIN12 = "https://www.neom.com";
  function absUrl12(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN12}${u}`;
    return u;
  }
  function cleanText14(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage12(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl12(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function videoUrlFrom(card) {
    const holders = [card, ...card.querySelectorAll("[data-video]")];
    for (const h of holders) {
      const raw = h.getAttribute && h.getAttribute("data-video");
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        const props = data.props || data;
        const src = (props.sources && props.sources.find((s) => s && s.src) || {}).src || props.eventTracking && props.eventTracking.video && props.eventTracking.video.src;
        if (src) return absUrl12(src);
      } catch (e) {
      }
    }
    const video = card.querySelector("video");
    if (video) {
      const src = video.getAttribute("src") || [...video.querySelectorAll("source")].map((s) => s.getAttribute("src") || s.getAttribute("data-src")).find(Boolean);
      if (src) return absUrl12(src);
    }
    return "";
  }
  function parse14(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const heading = element.querySelector(".o-stories__heading .a-heading, .o-stories__heading h2");
    if (heading && cleanText14(heading)) {
      const h2 = document.createElement("h2");
      h2.textContent = cleanText14(heading);
      defaultContent.push(h2);
    }
    element.querySelectorAll(".o-stories__item").forEach((item) => {
      const card = item.querySelector(".o-storyCard") || item;
      const media = [];
      const img = buildImage12(document, card.querySelector(".o-storyCard__figure img, img"));
      if (img) media.push(img);
      const url = videoUrlFrom(card);
      const caption = cleanText14(card.querySelector(".o-storyCard__title, .o-storyCard__copy"));
      if (url) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = url;
        a.textContent = url;
        p.append(a);
        media.push(p);
      }
      const body = [];
      if (caption) {
        const p = document.createElement("p");
        p.textContent = caption;
        body.push(p);
      }
      if (media.length || body.length) cells.push([media, body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-flip.js
  var ORIGIN13 = "https://www.neom.com";
  function absUrl13(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN13}${u}`;
    return u;
  }
  function cleanText15(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage13(document, img) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl13(src);
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function paragraphsFrom5(document, container) {
    const out = [];
    if (!container) return out;
    const blocks = container.querySelectorAll(":scope > p, :scope > ul, :scope > ol");
    if (blocks.length) {
      blocks.forEach((b) => {
        if (cleanText15(b)) out.push(b.cloneNode(true));
      });
    } else if (cleanText15(container)) {
      const p = document.createElement("p");
      p.innerHTML = container.innerHTML.trim();
      out.push(p);
    }
    out.forEach((el) => el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl13(a.getAttribute("href")))));
    return out;
  }
  function parse15(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const heading = cleanText15(element.querySelector(".b-flipCards__header .a-heading"));
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading;
      defaultContent.push(h2);
    }
    element.querySelectorAll(".b-flipCards__item").forEach((item) => {
      const img = buildImage13(document, item.querySelector(":scope > .a-image img") || item.querySelector("img"));
      const body = [];
      const name = cleanText15(item.querySelector(".b-flipCards__itemFlip__title")) || cleanText15(item.querySelector(".b-flipCards__itemContent__title"));
      if (name) {
        const h3 = document.createElement("h3");
        h3.textContent = name;
        body.push(h3);
      }
      body.push(...paragraphsFrom5(document, item.querySelector(".b-flipCards__itemFlip__copy")));
      if (img || body.length) cells.push([img ? [img] : "", body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-flip", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gallery.js
  var ORIGIN14 = "https://www.neom.com";
  function absUrl14(url) {
    if (!url) return "";
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN14}${u}`;
    return u;
  }
  function cleanText16(el) {
    if (!el) return "";
    let text = el.textContent || "";
    if (el.cloneNode && el.querySelectorAll) {
      const c = el.cloneNode(true);
      c.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
      text = c.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function buildImage14(document, img, fallbackAlt) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const pic = img.closest("picture");
      const s = pic && pic.querySelector("source[srcset]");
      if (s) src = s.getAttribute("srcset").split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document.createElement("img");
    out.src = absUrl14(src);
    const alt = (img.getAttribute("alt") || "").trim();
    out.alt = !alt || /^(alt|null|image)$/i.test(alt) ? fallbackAlt || "" : alt;
    return out;
  }
  function lightboxVideo(card) {
    const raw = card.getAttribute("data-lightbox-item");
    if (!raw) return "";
    try {
      const data = JSON.parse(raw);
      const v = data.video || data.props && data.props.video;
      if (!v) return "";
      const src = v.src || v.sources && v.sources[0] && v.sources[0].src || v.url;
      return src ? absUrl14(src) : "";
    } catch (e) {
      return "";
    }
  }
  function parse16(element, { document }) {
    const cells = [];
    const defaultContent = [];
    const header = element.querySelector(".m-componentHeader");
    if (header) {
      const eyebrow = cleanText16(header.querySelector(".a-eyebrow"));
      if (eyebrow) {
        const p = document.createElement("p");
        p.textContent = eyebrow;
        defaultContent.push(p);
      }
      const heading = cleanText16(header.querySelector(".a-heading"));
      if (heading) {
        const h2 = document.createElement("h2");
        h2.textContent = heading;
        defaultContent.push(h2);
      }
    }
    element.querySelectorAll(".b-videoGallery__item").forEach((item) => {
      const card = item.querySelector(".o-galleryCard") || item;
      const caption = cleanText16(card.querySelector(".o-galleryCard__copy"));
      const media = [];
      const img = buildImage14(document, card.querySelector(".o-galleryCard__thumbnail img, img"), caption);
      if (img) media.push(img);
      const video = lightboxVideo(card);
      if (video) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = video;
        a.textContent = video;
        p.append(a);
        media.push(p);
      }
      const body = [];
      if (caption) {
        const p = document.createElement("p");
        p.textContent = caption;
        body.push(p);
      }
      if (media.length || body.length) cells.push([media, body]);
    });
    if (defaultContent.length) element.before(...defaultContent);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-gallery", cells });
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

  // tools/importer/import-about.js
  var PAGE_TEMPLATE = {
    "name": "about",
    "urls": [
      "https://www.neom.com/en-us",
      "https://www.neom.com/en-us/about",
      "https://www.neom.com/en-us/about/leadership",
      "https://www.neom.com/en-us/about/social-responsibility",
      "https://www.neom.com/en-us/neom-sports-club",
      "https://www.neom.com/en-us/neom-sports-club/the-team",
      "https://www.neom.com/en-us/newsroom/events/fii-2025",
      "https://www.neom.com/en-us/regions",
      "https://www.neom.com/en-us/regions/theline"
    ],
    "representativeUrl": "https://www.neom.com/en-us",
    "description": "Landing and content pages: hero slider/banner, content rows, card sliders and grids, featured news, newsletter signup",
    "blocks": [
      {
        "name": "carousel-hero-video",
        "instances": [
          ".cmp-c12-hero-slider"
        ]
      },
      {
        "name": "tabs-map-stats",
        "instances": [
          ".cmp-c95-transition-slider"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ".cmp-c09-content-group",
          ".cmp-c24-content:has(img):not(:has(.o-contentGrid.-hasBackgroundImage))"
        ]
      },
      {
        "name": "breadcrumbs",
        "instances": [
          ".c98-breadcrumbs"
        ]
      },
      {
        "name": "cards-slider",
        "instances": [
          ".cmp-c11-slider",
          ".cmp-c113-simple-card-carousel"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          ".cmp-c123-featured-news"
        ]
      },
      {
        "name": "form",
        "instances": [
          ".cmp-c96-newsletter-subscription form"
        ]
      },
      {
        "name": "cards-boxed",
        "instances": [
          ".cmp-c18-boxed-list"
        ]
      },
      {
        "name": "cards-timeline",
        "instances": [
          ".cmp-c33-grouped-content-slider"
        ]
      },
      {
        "name": "hero-banner",
        "instances": [
          ".cmp-c26-hero-banner"
        ]
      },
      {
        "name": "cards-people",
        "instances": [
          ".cmp-c70-card-grid"
        ]
      },
      {
        "name": "carousel-split",
        "instances": [
          ".cmp-c58-highlight-slideshow"
        ]
      },
      {
        "name": "cards-downloads",
        "instances": [
          ".cmp-c30-downloads"
        ]
      },
      {
        "name": "cards-video",
        "instances": [
          ".cmp-c29-stories"
        ]
      },
      {
        "name": "cards-flip",
        "instances": [
          ".cmp-c117-flip-cards"
        ]
      },
      {
        "name": "cards-gallery",
        "instances": [
          ".cmp-c112-video-gallery"
        ]
      }
    ],
    "urlPattern": "/*",
    "coverageGaps": [
      {
        "url": "https://www.neom.com/en-us/about",
        "sections": [
          {
            "sectionSignature": "c24-content",
            "nodeMapId": "rc1c3"
          },
          {
            "sectionSignature": "c18-boxed-list",
            "nodeMapId": "rc1c4"
          },
          {
            "sectionSignature": "c33-grouped-content-slider",
            "nodeMapId": "rc1c5"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/about/leadership",
        "sections": [
          {
            "sectionSignature": "c26-hero-banner",
            "nodeMapId": "rc1c1"
          },
          {
            "sectionSignature": "c70-card-grid",
            "nodeMapId": "rc1c3"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/about/social-responsibility",
        "sections": [
          {
            "sectionSignature": "c58-highlight-slideshow",
            "nodeMapId": "rc1c4"
          },
          {
            "sectionSignature": "c30-downloads",
            "nodeMapId": "rc1c6"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/neom-sports-club",
        "sections": [
          {
            "sectionSignature": "c29-stories",
            "nodeMapId": "rc1c3"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/neom-sports-club/the-team",
        "sections": [
          {
            "sectionSignature": "c117-flip-cards",
            "nodeMapId": "rc1c3"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/newsroom/events/fii-2025",
        "sections": [
          {
            "sectionSignature": "c113-simple-card-carousel",
            "nodeMapId": "rc1c5"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/regions",
        "sections": [
          {
            "sectionSignature": "c103-vertical-carousel",
            "nodeMapId": "rc1c4"
          }
        ]
      },
      {
        "url": "https://www.neom.com/en-us/regions/theline",
        "sections": [
          {
            "sectionSignature": "c112-video-gallery",
            "nodeMapId": "rc1c5"
          }
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "hero-video-slider",
        "selector": [
          ".cmp-c12-hero-slider"
        ],
        "style": null,
        "blocks": [
          "carousel-hero-video"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "this-is-neom-map-tabs",
        "selector": [
          ".cmp-c95-transition-slider"
        ],
        "style": null,
        "blocks": [
          "tabs-map-stats"
        ],
        "defaultContent": [
          ".cmp-c95-transition-slider .b-transitionSlider__heading"
        ]
      },
      {
        "id": "rc3",
        "name": "feature-rows",
        "selector": [
          ".cmp-c09-content-group"
        ],
        "style": null,
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "content-media",
        "selector": [
          ".cmp-c24-content:has(img):not(:has(.o-contentGrid.-hasBackgroundImage))"
        ],
        "style": "dark",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "rc5",
        "name": "sector-slider",
        "selector": [
          ".cmp-c11-slider"
        ],
        "style": null,
        "blocks": [
          "cards-slider"
        ],
        "defaultContent": [
          ".cmp-c11-slider .a-eyebrow",
          ".cmp-c11-slider .o-genericSlider__titleWrapper"
        ]
      },
      {
        "id": "rc6",
        "name": "latest-news",
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
        "id": "rc7",
        "name": "newsletter-signup",
        "selector": [
          ".cmp-c96-newsletter-subscription"
        ],
        "style": "dark, split",
        "blocks": [
          "form"
        ],
        "defaultContent": [
          ".cmp-c96-newsletter-subscription .m-componentBackground img",
          ".cmp-c96-newsletter-subscription .m-componentHeader"
        ]
      },
      {
        "id": "gap1",
        "name": "intro-text",
        "selector": [
          ".cmp-c24-content:not(:has(img))"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".cmp-c24-content:not(:has(img))"
        ]
      },
      {
        "id": "gap2",
        "name": "boxed-list",
        "selector": [
          ".cmp-c18-boxed-list"
        ],
        "style": null,
        "blocks": [
          "cards-boxed"
        ],
        "defaultContent": []
      },
      {
        "id": "gap3",
        "name": "timeline",
        "selector": [
          ".cmp-c33-grouped-content-slider"
        ],
        "style": null,
        "blocks": [
          "cards-timeline"
        ],
        "defaultContent": [
          ".cmp-c33-grouped-content-slider .a-eyebrow"
        ]
      },
      {
        "id": "gap4",
        "name": "hero-banner",
        "selector": [
          ".cmp-c26-hero-banner"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "gap5",
        "name": "people-grid",
        "selector": [
          ".cmp-c70-card-grid"
        ],
        "style": null,
        "blocks": [
          "cards-people"
        ],
        "defaultContent": []
      },
      {
        "id": "gap6",
        "name": "highlight-slideshow",
        "selector": [
          ".cmp-c58-highlight-slideshow"
        ],
        "style": null,
        "blocks": [
          "carousel-split"
        ],
        "defaultContent": []
      },
      {
        "id": "gap7",
        "name": "downloads",
        "selector": [
          ".cmp-c30-downloads"
        ],
        "style": null,
        "blocks": [
          "cards-downloads"
        ],
        "defaultContent": []
      },
      {
        "id": "gap8",
        "name": "match-moments",
        "selector": [
          ".cmp-c29-stories"
        ],
        "style": "light-beige",
        "blocks": [
          "cards-video"
        ],
        "defaultContent": [
          ".cmp-c29-stories .o-stories__heading"
        ]
      },
      {
        "id": "gap9",
        "name": "flip-cards",
        "selector": [
          ".cmp-c117-flip-cards"
        ],
        "style": "centered",
        "blocks": [
          "cards-flip"
        ],
        "defaultContent": [
          ".cmp-c117-flip-cards .m-componentHeader"
        ]
      },
      {
        "id": "gap10",
        "name": "card-carousel",
        "selector": [
          ".cmp-c113-simple-card-carousel"
        ],
        "style": null,
        "blocks": [
          "cards-slider"
        ],
        "defaultContent": []
      },
      {
        "id": "gap11",
        "name": "image-gallery",
        "selector": [
          ".cmp-c112-video-gallery"
        ],
        "style": "centered",
        "blocks": [
          "cards-gallery"
        ],
        "defaultContent": [
          ".cmp-c112-video-gallery .m-componentHeader"
        ]
      },
      {
        "id": "gap12",
        "name": "background-banner",
        "selector": [
          ".cmp-c24-content:has(.o-contentGrid.-hasBackgroundImage)"
        ],
        "style": "dark, banner",
        "blocks": [],
        "defaultContent": [
          ".cmp-c24-content .o-contentGrid.-hasBackgroundImage .m-componentBackground img",
          ".cmp-c24-content .o-contentGrid.-hasBackgroundImage .m-paragraph__heading",
          ".cmp-c24-content .o-contentGrid.-hasBackgroundImage .m-paragraph__content",
          ".cmp-c24-content .o-contentGrid.-hasBackgroundImage .o-contentGrid__buttons"
        ]
      },
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
      }
    ]
  };
  var parsers = {
    "carousel-hero-video": parse,
    "tabs-map-stats": parse2,
    "columns-media": parse3,
    "breadcrumbs": parse4,
    "cards-slider": parse5,
    "cards-news": parse6,
    "form": parse7,
    "cards-boxed": parse8,
    "cards-timeline": parse9,
    "hero-banner": parse10,
    "cards-people": parse11,
    "carousel-split": parse12,
    "cards-downloads": parse13,
    "cards-video": parse14,
    "cards-flip": parse15,
    "cards-gallery": parse16
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
  var import_about_default = {
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
  return __toCommonJS(import_about_exports);
})();
