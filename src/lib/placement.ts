import type { CollectionEntry } from 'astro:content';

type ProjectData = CollectionEntry<'projects'>['data'];
type Placement = { layout: ProjectData['layout']; mobile: ProjectData['mobile'] };

// Custom properties read by .placed in global.css.
export const placementStyle = ({ layout, mobile }: Placement) => ({
  '--row': layout.row,
  '--col-start': layout.colStart,
  '--col-span': layout.colSpan,
  '--offset': layout.offset,
  '--m-inset': mobile.inset,
  '--m-width': mobile.width,
});

export const placementSizes = ({ layout, mobile }: Placement) =>
  `(max-width: 48rem) ${mobile.width}vw, ${Math.ceil((layout.colSpan / 12) * 100)}vw`;
