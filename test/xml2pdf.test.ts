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
