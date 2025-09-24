import { expect, test } from "vitest";
import { getPdfFromXml } from "../src/main";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

test("test xml file", async () => {
  const filePathIn = `${__dirname}/sample.xml`;
  const filePathOut = `${__dirname}/test.pdf`;
  const xml = readFileSync(filePathIn, "utf8");
  const pdfInstance = await getPdfFromXml(xml);
  writeFileSync(filePathOut, pdfInstance);
  expect(existsSync(filePathOut)).toBe(true);
  unlinkSync(filePathOut);
});
