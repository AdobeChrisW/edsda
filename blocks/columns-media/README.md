# columns-media

Custom **columns** block. Purpose: Image and text rows with eyebrow, heading, copy and pill CTA; image side follows cell order.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per media/text pair; one cell = image, other cell = eyebrow paragraph + h2 + paragraph(s) + CTA link; put the image first or last to choose its side.

## Supported variations

Options combine, e.g. `Columns Media (square, large-heading)`.

- `square`: 1:1 images (source figure `-square`). Without it, a multi-row block turns square when at least a third of its non-Scene7 images are ~1:1.
- `widescreen`: forces 16:9 and turns off the square auto-detection.
- `pull`: every row's image bleeds to the viewport edge (source `-assetPull` on all rows).
- `inset`: no row's image bleeds.
- `large-heading`: h2 on the 37px tier (source `a-heading -h5`) instead of 28px.

Defaults without `pull`/`inset`: in multi-row blocks image-last rows bleed and image-first rows are inset. A single row with the image last is the half/half split (source c24); a single row with the image first is a bleeding c09 row. Split rows get the arrow pill CTA; on a `dark` section it is the large white pill.

## Universal Editor fields

N/A (Document Authoring project)
