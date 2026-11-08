# carousel-hero-video

Custom **carousel** block. Purpose: Full-bleed homepage hero carousel with autoplay background video slides and timed progress-bar pagination.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per slide; cell 1 = background media (poster image and/or a link to an .mp4 or Scene7 video), cell 2 = h2 title + subheading paragraph + CTA link.

## Supported variations

Options (add to the block name, e.g. `Carousel Hero Video (short, large-title)`):

- `short`: source `.b-heroSliderV2.-disableFullScreen`. Height capped at 640px, 723px from 768px wide, and 740px from 1025px wide.
- `large-title`: source `.a-heading.-h4`. Title is clamp(28px, 17px + 2.29vw, 50px) with line-height 1.43.
- `small-title`: source `.a-heading.-h5`. Title is clamp(28px, 23.5px + 0.94vw, 37px) with line-height 1.43.
- `inline-subtitle`: the source sub-line sits inside the heading. The paragraph after the title is 50% of the title size, weight 400, line-height 1.1, 14px top margin, and uses the title's letter-spacing.
- `classic`: source V1 `.b-heroSlider` (o-heroContent). Flat black 20% mask with no gradient, fluid 70px max padding with 105px at the bottom, a weight-100 subtitle, and gold page-indicator dots. The dots show even for a single slide.

## Universal Editor fields

N/A (Document Authoring project)
