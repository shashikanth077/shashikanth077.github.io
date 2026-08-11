/**
 * Extracts embedded raster images straight from a PDF's own XObject
 * streams — reading, not re-encoding, so a JPEG comes out byte-identical to
 * however it was embedded.
 *
 * Scope, stated honestly rather than silently skipping: only /DCTDecode
 * (JPEG) images are extracted. That covers the large majority of
 * real-world embedded images (photos, scanned pages), but PDFs can also
 * embed raw/Flate-compressed bitmaps, JPEG2000 (/JPXDecode), CCITT fax
 * bitmaps, or indexed-palette images — decoding those generically means
 * resolving arbitrary ColorSpace objects (DeviceRGB/Gray/CMYK, ICCBased,
 * Indexed with a palette stream, Separation...) which is a project on its
 * own, not a quick addition. Anything not DCTDecode is reported as skipped
 * rather than silently dropped, so the count the user sees is honest.
 */

import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream, PDFStream } from "pdf-lib";

export interface ExtractedImage {
  pageNumber: number;
  /** 1-based index of this image within its page, for a stable filename. */
  index: number;
  data: Uint8Array;
  width: number;
  height: number;
}

export interface ExtractImagesResult {
  images: ExtractedImage[];
  /** Images found but not extracted — an unsupported filter. */
  skipped: number;
}

function dictNumber(dict: PDFDict, key: string): number {
  const value = dict.get(PDFName.of(key));
  return value ? Number(value.toString()) : 0;
}

export async function extractImages(bytes: ArrayBuffer): Promise<ExtractImagesResult> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const images: ExtractedImage[] = [];
  let skipped = 0;

  const pages = doc.getPages();
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    if (!page) continue;
    const resources = page.node.Resources();
    const xObjects = resources?.lookupMaybe(PDFName.of("XObject"), PDFDict);
    if (!xObjects) continue;

    let imageIndex = 0;
    for (const [, ref] of xObjects.entries()) {
      const streamObj = doc.context.lookupMaybe(ref, PDFStream);
      if (!(streamObj instanceof PDFRawStream)) continue;
      const stream = streamObj;

      const dict = stream.dict;
      const subtype = dict.get(PDFName.of("Subtype"))?.toString();
      if (subtype !== "/Image") continue;

      const filterEntry = dict.get(PDFName.of("Filter"));
      // Filter can be a single name or an array ending in the actual image
      // codec (e.g. [/ASCII85Decode /DCTDecode]) — only the last stage
      // determines what the final bytes actually are.
      const filterNames = filterEntry instanceof PDFArray ? filterEntry.asArray().map((f) => f.toString()) : filterEntry ? [filterEntry.toString()] : [];
      const finalFilter = filterNames[filterNames.length - 1];

      if (finalFilter !== "/DCTDecode" || filterNames.length > 1) {
        // Multi-stage filters would need the earlier stages decoded first
        // (e.g. ASCII85) before the JPEG bytes are usable — out of scope
        // alongside the other unsupported encodings.
        skipped++;
        continue;
      }

      imageIndex++;
      images.push({
        pageNumber: pageIndex + 1,
        index: imageIndex,
        data: stream.contents,
        width: dictNumber(dict, "Width"),
        height: dictNumber(dict, "Height"),
      });
    }
  }

  return { images, skipped };
}
