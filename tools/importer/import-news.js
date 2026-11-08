/* eslint-disable */
/* global WebImporter */

import breadcrumbsParser from './parsers/breadcrumbs.js';
import columnsShareParser from './parsers/columns-share.js';

import neomCleanupTransformer from './transformers/neom-cleanup.js';
import neomArticleMetadataTransformer from './transformers/neom-article-metadata.js';
import neomSectionsTransformer from './transformers/neom-sections.js';
import neomDmImagesTransformer from './transformers/neom-dm-images.js';
import neomPageMetadataTransformer from './transformers/neom-page-metadata.js';

const PAGE_TEMPLATE = {
  "name": "news",
  "urls": [
    "https://www.neom.com/en-us/neom-sports-club/news/neom-sc-signs-global-star-alexandre-lacazette"
  ],
  "representativeUrl": "https://www.neom.com/en-us/neom-sports-club/news/neom-sc-signs-global-star-alexandre-lacazette",
  "description": "NEOM Sports Club news/match article: cover image band and article card with share button",
  "blocks": [
    {
      "name": "breadcrumbs",
      "instances": [
        ".c98-breadcrumbs"
      ]
    },
    {
      "name": "columns-share",
      "instances": [
        ".b-articleContent__buttons"
      ]
    }
  ],
  "urlPattern": "/en-us/neom-sports-club/news/*",
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
      "id": "s1",
      "name": "cover-image",
      "selector": [
        ".cmp-c44-article-content .b-articleContent__banner"
      ],
      "style": "dark, cover",
      "blocks": [],
      "defaultContent": [
        ".cmp-c44-article-content .b-articleContent__banner"
      ]
    },
    {
      "id": "s2",
      "name": "article",
      "selector": [
        ".cmp-c44-article-content .b-articleContent__container"
      ],
      "style": "white",
      "blocks": [
        "columns-share"
      ],
      "defaultContent": [
        ".cmp-c44-article-content .b-articleContent__header",
        ".cmp-c44-article-content .b-articleContent__content .s-content"
      ]
    }
  ]
};

const parsers = {
  'breadcrumbs': breadcrumbsParser,
  'columns-share': columnsShareParser,
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
