# cards-people

Custom **cards** block. Purpose: Filterable grid of people: portrait, name and role; each card opens a bio side panel.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: optional first single-cell row = search placeholder text (enables the filter); then one row per person: cell 1 = portrait, cell 2 = name paragraph + role paragraph (+ optional bio link), cell 3 (optional) = bio (semantic HTML or plain text), hidden in the card and shown in the side panel.

| Cell | Content |
| --- | --- |
| 1 | Portrait image |
| 2 | Name paragraph + role paragraph (+ optional bio link) |
| 3 | Bio (optional): the person's biography as semantic HTML: paragraphs (and lists where the source uses them), with links kept. Shown in the bio side panel when the card is opened. |

Rows without a bio leave cell 3 empty. Those cards don't open the panel.

## Behaviour

- Each card with a bio is a button-like control: the whole card is clickable (pointer cursor), it is reachable with Tab, and Enter or Space opens the panel.
- The panel is a modal `<dialog>` on the right. It shows the portrait, name, role and bio. Previous / Next (and the arrow keys) page through every person in the block. The close button, Escape or a click on the backdrop closes it, and focus returns to the card of the person shown last.
- The search filter matches the name and role only; the hidden bio is not searched.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
