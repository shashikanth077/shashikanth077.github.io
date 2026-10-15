import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import {
  cropPdf,
  mergePdfs,
  parsePageRanges,
  readPdfInfo,
  readPdfMetadata,
  removePages,
  resizePdf,
  rotatePdf,
  setPdfMetadata,
  splitEveryPage,
  splitIntoRanges,
  unlockPdf,
} from "../libs/tools-core/src/pdf.ts";

const buffer = (bytes) => Uint8Array.from(bytes).buffer;
const source = await PDFDocument.create();
source.setTitle("Smoke fixture");
source.addPage([612, 792]).drawText("Page one");
source.addPage([400, 600]).drawText("Page two");
const input = buffer(await source.save());

assert.deepEqual((await readPdfInfo(input)).pages.map(({ width, height }) => [width, height]), [[612, 792], [400, 600]]);
assert.deepEqual(parsePageRanges("2, 1-2", 2), [0, 1]);
assert.equal((await readPdfInfo(buffer(await mergePdfs([input, input])))).pageCount, 4);
assert.equal((await splitEveryPage(input)).length, 2);
assert.deepEqual((await splitIntoRanges(input, ["1", "2"], 2)).map((part) => part.name), ["part-1-pages-1.pdf", "part-2-pages-2.pdf"]);
assert.equal((await readPdfInfo(buffer(await removePages(input, [1])))).pageCount, 1);
assert.deepEqual((await readPdfInfo(buffer(await rotatePdf(input, 90, [0])))).pages.map((page) => page.rotation), [90, 0]);
const cropped = await PDFDocument.load(await cropPdf(input, { top: 10, right: 10, bottom: 10, left: 10 }));
assert.deepEqual(cropped.getPage(0).getCropBox(), { x: 10, y: 10, width: 592, height: 772 });
assert.deepEqual((await readPdfInfo(buffer(await resizePdf(input, { size: "a4", scaling: "fit" })))).pages.map((page) => [page.width, page.height]), [[595, 842], [595, 842]]);
const metadata = await readPdfMetadata(buffer(await setPdfMetadata(input, { title: "Updated" })));
assert.equal(metadata.title, "Updated");
assert.equal((await unlockPdf(input)).wasEncrypted, false);

console.log("PDF smoke passed: reading, merging, splitting, removing, rotating, cropping, resizing, metadata and unlock.");
