import { beforeAll, expect, test } from "vitest";
import { getPdfFromXml } from "../src/main";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { jsx } from "react/jsx-runtime";
import { Document, Image, Page, renderToBuffer } from "@react-pdf/renderer";
const filePathOut = `${__dirname}/test.pdf`;

beforeAll(async () => {
  const f = existsSync(filePathOut);
  if (!f) {
    return;
  }
  await unlink(filePathOut);
});

test("test xml file", async () => {
  const filePathIn = `${__dirname}/sample.html`;
  // unlinkSync(filePathOut);
  const xml = readFileSync(filePathIn, "utf8");
  const pdfInstance = await getPdfFromXml(xml);
  writeFileSync(filePathOut, pdfInstance);
  expect(existsSync(filePathOut)).toBe(true);
});



test("test SVG elements", async () => {
  const xml = `<document><page size="A4"><svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="blue" stroke="black" stroke-width="2"/></svg></page></document>`;
  const pdfInstance = await getPdfFromXml(xml);
  expect(pdfInstance).toBeDefined();
  expect(pdfInstance.length).toBeGreaterThan(0);
});

test.skip("test images", async () => {
  const MyDocument = () =>
    jsx(Document, {
      children: jsx(Page, {
        size: "A4",
        children: jsx(Image, {
          src: "test/img.png",
          width: 100,
          height: 100,
          debug: true,
        }),
      }),
    });
  const buffer = await renderToBuffer(jsx(MyDocument, {}));
  writeFileSync(`${__dirname}/with-image.pdf`, buffer);
});
