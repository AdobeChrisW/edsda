# cards-slider

Custom **cards** block. Purpose: Horizontally scrolling cards with prev/next arrows.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: optional single-cell intro row (eyebrow + lead text); then one row per card: cell 1 = image (rendered square), cell 2 = title + short text + arrow link. Leave cell 2 empty for photo-only cards (rendered 16:9). The whole card is clickable via its link; prev/next arrows show from 768px when cards overflow.

## Layout rules (automatic, no content changes needed)

- **Intro row present** (`cards-slider-has-intro`, source c113): from 1024px the intro sits in a 420px column left of the cards with the arrows top-right; photo-only cards are 16:9 at 140/400/460/490/540px (mobile/768/1024/1280/1440). Below 1024px the intro stacks above the cards and the arrows are hidden.
- **Heading as default content directly above the block** (`cards-slider-titled`): from 768px the arrows sit at the right of that heading's row, and the heading is held to 75% width.
- **Card style**: `square` (1:1 image, sentence-case title, gold text link) when the block has an intro or a heading above it; otherwise `landscape` (3:2 image, uppercase title, dark pill CTA).

## Supported variations

- `landscape` / `square`: set explicitly to override the automatic card style above.

## Universal Editor fields

N/A (Document Authoring project)
