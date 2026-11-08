/* eslint-disable */
/* global WebImporter */

import breadcrumbsParser from './parsers/breadcrumbs.js';
import cardsNewsParser from './parsers/cards-news.js';

import neomCleanupTransformer from './transformers/neom-cleanup.js';
import neomArticleMetadataTransformer from './transformers/neom-article-metadata.js';
import neomSectionsTransformer from './transformers/neom-sections.js';
import neomDmImagesTransformer from './transformers/neom-dm-images.js';
import neomPageMetadataTransformer from './transformers/neom-page-metadata.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'breadcrumbs': breadcrumbsParser,
  'cards-news': cardsNewsParser,
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
