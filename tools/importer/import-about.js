/* eslint-disable */
/* global WebImporter */

import carouselHeroVideoParser from './parsers/carousel-hero-video.js';
import tabsMapStatsParser from './parsers/tabs-map-stats.js';
import columnsMediaParser from './parsers/columns-media.js';
import breadcrumbsParser from './parsers/breadcrumbs.js';
import cardsSliderParser from './parsers/cards-slider.js';
import cardsNewsParser from './parsers/cards-news.js';
import formParser from './parsers/form.js';
import cardsBoxedParser from './parsers/cards-boxed.js';
import cardsTimelineParser from './parsers/cards-timeline.js';
import heroBannerParser from './parsers/hero-banner.js';
import cardsPeopleParser from './parsers/cards-people.js';
import carouselSplitParser from './parsers/carousel-split.js';
import cardsDownloadsParser from './parsers/cards-downloads.js';
import cardsVideoParser from './parsers/cards-video.js';
import cardsFlipParser from './parsers/cards-flip.js';
import cardsGalleryParser from './parsers/cards-gallery.js';

import neomCleanupTransformer from './transformers/neom-cleanup.js';
import neomArticleMetadataTransformer from './transformers/neom-article-metadata.js';
import neomSectionsTransformer from './transformers/neom-sections.js';
import neomDmImagesTransformer from './transformers/neom-dm-images.js';
import neomPageMetadataTransformer from './transformers/neom-page-metadata.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'carousel-hero-video': carouselHeroVideoParser,
  'tabs-map-stats': tabsMapStatsParser,
  'columns-media': columnsMediaParser,
  'breadcrumbs': breadcrumbsParser,
  'cards-slider': cardsSliderParser,
  'cards-news': cardsNewsParser,
  'form': formParser,
  'cards-boxed': cardsBoxedParser,
  'cards-timeline': cardsTimelineParser,
  'hero-banner': heroBannerParser,
  'cards-people': cardsPeopleParser,
  'carousel-split': carouselSplitParser,
  'cards-downloads': cardsDownloadsParser,
  'cards-video': cardsVideoParser,
  'cards-flip': cardsFlipParser,
  'cards-gallery': cardsGalleryParser,
};

const transformers = [
  neomCleanupTransformer,
  neomArticleMetadataTransformer,
  neomSectionsTransformer,
  neomDmImagesTransformer,
  neomPageMetadataTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    executeTransformers('afterMetadata', main, payload);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
