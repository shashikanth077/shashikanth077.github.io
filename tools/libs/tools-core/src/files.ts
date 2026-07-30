/** File handling shared by the PDF and image tools. */

export interface PickedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  /** Object URL for preview thumbnails. Owned by the caller — revoke on removal. */
  previewUrl?: string;
}

export const MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
} as const;

/**
 * Browsers report inconsistent MIME types — .docx sometimes arrives as
 * application/octet-stream, and Windows can report .pdf as empty. Falling back
 * to the extension is unavoidable; the real validation happens when the parser
 * either accepts the bytes or throws.
 */
export function matchesAccept(file: File, accept: string[]): boolean {
  if (accept.length === 0) return true;
  const name = file.name.toLowerCase();

  return accept.some((entry) => {
    if (entry.startsWith(".")) return name.endsWith(entry);
    if (entry.endsWith("/*")) return file.type.startsWith(entry.slice(0, -1));
    return file.type === entry;
  });
}

export function toPickedFile(file: File): PickedFile {
  return {
    // crypto.randomUUID needs a secure context; the fallback keeps local http working.
    id: typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
    file,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Strips the extension so outputs can be named after their source. */
export function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function downloadBlob(data: Blob | Uint8Array | string, filename: string, mime?: string): void {
  const blob =
    data instanceof Blob
      ? data
      : new Blob([data as BlobPart], { type: mime ?? "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Zips without a dependency, using stored (uncompressed) entries.
 *
 * Every multi-file tool here outputs PDFs, JPEGs or PNGs, which are already
 * compressed — DEFLATE would spend CPU to save almost nothing. Storing lets us
 * emit a valid archive in ~60 lines instead of pulling in a zip library.
 */
export async function createZip(entries: Array<{ name: string; data: Uint8Array | Blob }>): Promise<Blob> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const crcTable = buildCrcTable();

  for (const entry of entries) {
    const data =
      entry.data instanceof Blob ? new Uint8Array(await entry.data.arrayBuffer()) : entry.data;
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(data, crcTable);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // method 0 = stored
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0, true); // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    chunks.push(local, data);

    const dir = new Uint8Array(46 + nameBytes.length);
    const dv = new DataView(dir.buffer);
    dv.setUint32(0, 0x02014b50, true); // central directory header
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 20, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint16(14, 0, true);
    dv.setUint32(16, crc, true);
    dv.setUint32(20, data.length, true);
    dv.setUint32(24, data.length, true);
    dv.setUint16(28, nameBytes.length, true);
    dv.setUint32(42, offset, true);
    dir.set(nameBytes, 46);
    central.push(dir);

    offset += local.length + data.length;
  }

  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // end of central directory
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  return new Blob(asBlobParts([...chunks, ...central, end]), { type: "application/zip" });
}

/**
 * TypeScript 5.7 made Uint8Array generic over its backing buffer, and BlobPart
 * requires ArrayBufferView<ArrayBuffer> specifically. A Uint8Array typed over
 * the wider ArrayBufferLike no longer satisfies it even though every value here
 * is a plain ArrayBuffer at runtime — the Blob constructor accepts all of them.
 */
function asBlobParts(views: Uint8Array[]): BlobPart[] {
  return views as unknown as BlobPart[];
}

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
}

function crc32(data: Uint8Array, table: Uint32Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (table[(crc ^ (data[i] ?? 0)) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
