export interface ThumbnailEntry {
  target: number;
  displayNumber: number;
  dataUrl: string | null;
  rotation: 0 | 90 | 180 | 270;
}

export function PageThumbnails({
  entries,
  activeTarget,
  onJump,
  onDelete,
  onClose,
}: {
  entries: ThumbnailEntry[];
  activeTarget: number | null;
  onJump: (target: number) => void;
  onDelete: (target: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="pdfed__thumbrail" onClick={(e) => e.stopPropagation()}>
      <div className="pdfed__thumbrail-head">
        <span>{entries.length} {entries.length === 1 ? "page" : "pages"}</span>
        <button type="button" className="pdfed__modal-close" onClick={onClose} aria-label="Close page panel">
          ✕
        </button>
      </div>
      <ul className="pdfed__thumbrail-list">
        {entries.map((entry) => (
          <li key={entry.target}>
            <button
              type="button"
              className={`pdfed__thumb${activeTarget === entry.target ? " pdfed__thumb--active" : ""}`}
              onClick={() => onJump(entry.target)}
            >
              {entry.dataUrl ? (
                <img src={entry.dataUrl} alt="" style={{ transform: `rotate(${entry.rotation}deg)` }} />
              ) : (
                <div className="pdfed__thumb-blank" style={{ transform: `rotate(${entry.rotation}deg)` }} />
              )}
              <span className="pdfed__thumb-num">{entry.displayNumber}</span>
            </button>
            {entries.length > 1 && (
              <button
                type="button"
                className="pdfed__thumb-delete"
                onClick={() => onDelete(entry.target)}
                aria-label={`Delete page ${entry.displayNumber}`}
                title="Delete page"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
