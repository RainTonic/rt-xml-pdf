import { expect, test } from "vitest";
import { getPdfFromXml } from "./main";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import ReactPDF from "@react-pdf/renderer";
import { jsx } from "react/jsx-runtime";

test("should create a pdf", async () => {
  const filePath = `${__dirname}/test.pdf`;
  const xml = `<document><page><view><text style="color: red;">Hello!</text></view></page></document>`;
  const pdfInstance = await getPdfFromXml(xml);
  writeFileSync(filePath, pdfInstance);
  expect(existsSync(filePath)).toBe(true);
  unlinkSync(filePath);
});

test.skip("verify react-pdf working", async () => {
  const filePath = `${__dirname}/test.pdf`;
  const doc = () =>
    jsx(ReactPDF.Document, {
      children: jsx(ReactPDF.Page, {
        size: "A4",
        style: { color: "red" },
        children: jsx(ReactPDF.Text, {
          children: "Hello world",
        }),
      }),
    });
  const pdfInstance = jsx(doc, {});
  await ReactPDF.renderToFile(pdfInstance as any, filePath);
});
