# columns-share

Custom **columns** block. Purpose: Share bar for article pages: a label plus share links for X/Twitter, LinkedIn, Facebook, WhatsApp, Email and Copy link, with share URLs built from the current page.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1: cell 1 = label paragraph (e.g. Share this article); cell 2 = list of share links, one per network, link text naming the network (X or Twitter, LinkedIn, Facebook, WhatsApp, Email, Copy link). The label and links may also be authored as a label row followed by one row per link. Authored hrefs only identify the network (e.g. https://twitter.com/intent/tweet, mailto:, #copy); the block rebuilds them from the current page URL and title.

## Supported variations

| Variation | Option class |
| --- | --- |
| Modal: a Share pill button that opens the links in a dialog | `modal` |

With `modal`, if the default content right before the block ends with a paragraph holding only one link (for example "Back"), the block moves that link into its button row so both pills sit side by side, as on the source.

## Universal Editor fields

N/A (Document Authoring project)
