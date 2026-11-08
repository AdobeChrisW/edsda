# NEOM (en-us) Migration Plan

## Goal
Move https://www.neom.com/en-us and a set of pages you choose to AEM Edge Delivery Services. The migrated pages should match the original site's content, design, header, footer and look.

## Scope (your choices)
- **Pages:** the homepage plus specific pages. I'll find the site's /en-us pages first, then you pick which ones to migrate.
- **Also included:** design styling, header and navigation, footer, and a visual comparison against the original.
- **Out of scope:** uploading to Document Authoring, previewing on Edge Delivery, and publishing live. All changes stay in the local workspace unless you ask for one of these separately.

## Approach
1. **Project setup:** Check the project type and block library, and confirm where the site's content lives.
2. **Page discovery:** Get the /en-us URLs from the sitemap, or crawl the site if there isn't one. I'll show you the list grouped by page type so you can choose.
3. **Template grouping:** Group the chosen pages by layout so blocks and import logic can be shared between them.
4. **Page analysis:** For each template, break a sample page into sections, blocks and block variants. Similar variants get reused instead of duplicated.
5. **Block mapping and import setup:** Map the original page elements to blocks, then build the parsers, cleanup transformers and an import script for each template.
6. **Content import:** Run a bulk import of all chosen pages, then score each page against the original.
7. **Block code:** Build or adapt the blocks the imported content needs.
8. **Design migration:** Pull fonts, colors and spacing from the original into site-wide styles, then style each block.
9. **Header and navigation:** Rebuild the desktop menu, any mega menu and the mobile behavior, based on the original site.
10. **Footer:** Rebuild the footer sections and check them on desktop and mobile.
11. **Visual comparison:** Compare each migrated page with the original and fix differences in layout, styling and content.

## Things to watch
- **Bot protection:** neom.com may block automated access. If so, a fallback scraping method is used.
- **Heavy media:** The site uses a lot of video and imagery. Images will point to the original site's URLs rather than being downloaded.
- **Language:** Only /en-us pages are covered. Other languages, such as Arabic and right-to-left layouts, are not included unless you add them.
- **Local only:** Content stays in the local preview. Re-running the import overwrites any manual edits to the pages.

## Checklist
- [ ] Check the project type, block library and content source
- [ ] Find all /en-us URLs (sitemap or crawl)
- [ ] Show the URL list grouped by page type and get your page selection
- [ ] Group the chosen pages into templates
- [ ] Analyze a sample page for each template (sections, blocks, variants)
- [ ] Map blocks and sections for each template
- [ ] Build the parsers, transformers and import script for each template
- [ ] Bulk import the homepage and the chosen pages
- [ ] Check the imported pages and fix any import problems
- [ ] Build or adapt the block code
- [ ] Migrate design tokens and site-wide styles
- [ ] Style each block to match the original
- [ ] Migrate the header and navigation (desktop, mega menu, mobile)
- [ ] Migrate the footer (desktop and mobile)
- [ ] Run a visual comparison on every migrated page and fix differences
- [ ] Final check in the preview, and a summary of what changed (local workspace only)

> To start, switch to Execute mode. The first step will show you the discovered page list so you can choose pages before anything is migrated.
