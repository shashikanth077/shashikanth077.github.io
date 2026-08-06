import { TrashIcon } from "./icons.js";

export interface PageChromeProps {
  displayNumber: number;
  rotation: 0 | 90 | 180 | 270;
  canDelete: boolean;
  zoom: number;
  onDelete: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onInsertAfter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/**
 * Repeats above every page (Sejda-pattern per-page toolbar). Zoom applies to
 * every page at once — it's duplicated here purely so you don't have to
 * scroll back to the top toolbar to reach it, not a per-page setting.
 *
 * Rotation only changes the page's orientation in the exported PDF (and this
 * badge's own preview icon) — the live annotation canvas underneath stays
 * unrotated on purpose. PDF page rotation is a *display* instruction, not a
 * change to the page's own coordinate system, so rotating the canvas too
 * would mean rotating every coordinate transform annotations rely on for no
 * real benefit; annotating a still-sideways scan and letting the export fix
 * the orientation is the same amount of user effort either way.
 */
export function PageChrome(props: PageChromeProps) {
  return (
    <div className="pdfed__pagechrome" onClick={(e) => e.stopPropagation()}>
      <span className="pdfed__pagechrome-num">Page {props.displayNumber}</span>

      <button type="button" className="pdfed__iconbtn" onClick={props.onDelete} disabled={!props.canDelete} title="Delete page" aria-label="Delete page">
        <TrashIcon size={13} />
      </button>
      <button type="button" className="pdfed__iconbtn" onClick={props.onZoomOut} title="Zoom out" aria-label="Zoom out">
        −
      </button>
      <span className="pdfed__pagechrome-zoom">{Math.round(props.zoom * 100)}%</span>
      <button type="button" className="pdfed__iconbtn" onClick={props.onZoomIn} title="Zoom in" aria-label="Zoom in">
        +
      </button>
      <button type="button" className="pdfed__iconbtn" onClick={props.onRotateLeft} title="Rotate left" aria-label="Rotate left">
        ↺
      </button>
      <button type="button" className="pdfed__iconbtn" onClick={props.onRotateRight} title="Rotate right" aria-label="Rotate right">
        ↻
      </button>
      {props.rotation !== 0 && <span className="pdfed__pagechrome-rotation">{props.rotation}°</span>}

      <button type="button" className="pdfed__pagechrome-insert" onClick={props.onInsertAfter}>
        + Insert page here
      </button>
    </div>
  );
}
