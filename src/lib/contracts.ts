import { PDFDocument } from "pdf-lib";

export type SignaturePlacement = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function stampSignature(
  originalPdf: ArrayBuffer,
  signaturePng: Uint8Array,
  placement: SignaturePlacement,
) {
  const document = await PDFDocument.load(originalPdf, { updateMetadata: false });
  const pages = document.getPages();
  const pageIndex = placement.page < 0 ? pages.length - 1 : placement.page;
  const page = pages[pageIndex];

  if (!page) throw new Error("The configured signature page does not exist.");

  const { width: pageWidth, height: pageHeight } = page.getSize();
  const withinPage =
    placement.width > 0 &&
    placement.height > 0 &&
    placement.x >= 0 &&
    placement.y >= 0 &&
    placement.x + placement.width <= pageWidth &&
    placement.y + placement.height <= pageHeight;

  if (!withinPage) throw new Error("The configured signature box is outside the PDF page.");

  const image = await document.embedPng(signaturePng);
  const scale = Math.min(placement.width / image.width, placement.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  page.drawImage(image, {
    x: placement.x + (placement.width - width) / 2,
    y: placement.y + (placement.height - height) / 2,
    width,
    height,
  });

  document.setModificationDate(new Date());
  return document.save();
}

export function decodeSignatureDataUrl(dataUrl: string) {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Signature must be a PNG image.");

  const binary = atob(match[1]);
  if (binary.length === 0 || binary.length > 1_000_000) {
    throw new Error("Signature image is empty or too large.");
  }

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
