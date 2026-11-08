# breadcrumbs

Custom **breadcrumbs** block. Purpose: Breadcrumb trail under the hero showing the path to the current page.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell holding an unordered list; each <li> holds a link except the last, which is plain text for the current page.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Notes

- Example list: `HOME` (link to `/en-us`), `About US` (link to `/en-us/about`), `Our leadership` (plain text, current page).
- Put the block alone in its own section directly under the hero. The block removes the section's global padding so the strip is 56px high.
- Add section metadata `style: dark` for the dark band: links stay gold, and the current page and chevrons turn light.
- The block renders `<nav aria-label="Breadcrumb"><ol>`. The last item gets `aria-current="page"`, and the chevrons are drawn in CSS so screen readers don't announce them.
