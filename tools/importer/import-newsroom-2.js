/* eslint-disable */
/* global WebImporter */

import breadcrumbsParser from './parsers/breadcrumbs.js';
import columnsShareParser from './parsers/columns-share.js';
import cardsNewsParser from './parsers/cards-news.js';
import formParser from './parsers/form.js';

import neomCleanupTransformer from './transformers/neom-cleanup.js';
import neomArticleMetadataTransformer from './transformers/neom-article-metadata.js';
import neomSectionsTransformer from './transformers/neom-sections.js';
import neomDmImagesTransformer from './transformers/neom-dm-images.js';
import neomPageMetadataTransformer from './transformers/neom-page-metadata.js';

const PAGE_TEMPLATE = {
  "name": "newsroom-2",
  "urls": [
    "https://www.neom.com/en-us/newsroom/neom-green-hydrogen"
  ],
  "representativeUrl": "https://www.neom.com/en-us/newsroom/neom-green-hydrogen",
  "description": "Newsroom news article: article body with share bar, related articles, newsletter signup",
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
        ".b-articleContent__share-list"
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
    }
  ],
  "urlPattern": "/en-us/newsroom/*",
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
      "id": "a1",
      "name": "article",
      "selector": [
        ".cmp-c44-article-content"
      ],
      "style": null,
      "blocks": [
        "columns-share"
      ],
      "defaultContent": [
        ".cmp-c44-article-content .b-articleContent__header",
        ".cmp-c44-article-content .b-articleContent__sub-header",
        ".cmp-c44-article-content .b-articleContent__image-container",
        ".cmp-c44-article-content .b-articleContent__content",
        ".cmp-c44-article-content .b-articleContent__tags-row"
      ]
    },
    {
      "id": "a2",
      "name": "related-articles",
      "selector": [
        ".cmp-c123-featured-news"
      ],
      "style": "white",
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        ".cmp-c123-featured-news .b-newsroomDch__header"
      ]
    },
    {
      "id": "a3",
      "name": "newsletter-signup",
      "selector": [
        ".cmp-c96-newsletter-subscription"
      ],
      "style": "split",
      "blocks": [
        "form"
      ],
      "defaultContent": [
        ".cmp-c96-newsletter-subscription .m-componentHeader"
      ]
    }
  ]
};

const parsers = {
  'breadcrumbs': breadcrumbsParser,
  'columns-share': columnsShareParser,
  'cards-news': cardsNewsParser,
  'form': formParser,
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
