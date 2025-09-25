import { test, expect } from "vitest";
import { parseXML, parseStyle } from "../src/parser";

test("should parse xml", () => {
  const xml = `<document title="n"><page><view><text>Hello, World!</text></view></page></document>`;

  const expected = {
    styles: {},
    root: {
      tag: "document",
      attrs: { title: "n" },
      children: [
        {
          tag: "page",
          attrs: {},
          children: [
            {
              tag: "view",
              attrs: {},
              children: [
                { tag: "text", attrs: {}, children: ["Hello, World!"] },
              ],
            },
          ],
        },
      ],
    },
  };

  expect(parseXML(xml)).toStrictEqual(expected);
});

test("should parse attributes correctly", () => {
  const xml = `<document title="Nasir"></document>`;
  const expected = {
    styles: {},
    root: {
      tag: "document",
      attrs: { title: "Nasir" },
      children: [],
    },
  };
  expect(parseXML(xml)).toStrictEqual(expected);
});

test("should allow only one root element", () => {
  const xml = `<document></document><view></view>`;
  expect(() => parseXML(xml)).toThrowError();
});

test("shouldn't allow unrecognized attributes", () => {
  // the allowed properties should be taken in this case from valid react-pdf properties for the Document Element
  const xml = `<document tortoise></document>`;
  expect(() => parseXML(xml)).toThrowError();
});

test("should validate attribute values", () => {
  const xml = `<document pageLayout="invalid"></document>`;
  expect(() => parseXML(xml)).toThrowError();
});

test("should parse css style properties", () => {
  const rules: [string, Record<string, string>][] = [
    ["font-size: 13px;", { fontSize: "13px" }],
    ["display: flex;", { display: "flex" }],
  ];

  rules.forEach(([input, expected]) =>
    expect(parseStyle(input)).toStrictEqual(expected),
  );
});

test("should reject unsupported css properties", () => {
  expect(() => parseStyle("cursor: pointer;")).toThrowError();
});

test("should parse nodes with styles", () => {
  const xml = `<document><text style="color: red; font-size: 16px;">Hello</text></document>`;
  const doc = parseXML(xml).root;
  if (typeof doc == "string") return;
  // @ts-expect-error
  const textAttrs = doc.children[0].attrs;
  expect(textAttrs).toStrictEqual({
    style: { color: "red", fontSize: "16px" },
  });
});

test("should parse style tag in xml", () => {
  const xml = `<document><style>.myClass { font-size: 13px; color: red; }</style><page></page></document>`;
  const expected = {
    styles: {
      myClass: { fontSize: "13px", color: "red" },
    },
    root: {
      tag: "document",
      attrs: {},
      children: [
        {
          tag: "style",
          attrs: {},
          children: [],
        },
        {
          tag: "page",
          attrs: {},
          children: [""],
        },
      ],
    },
  };
  expect(parseXML(xml)).toStrictEqual(expected);
});

test("should apply class styles when needed", () => {
  const xml = `<document><style>.text-sm { font-size: 13px;  } .text-red { color: red; }</style><page><view class="text-sm text-red"></view></page></document>`;

  const expected = {
    styles: {
      "text-sm": { fontSize: "13px" },
      "text-red": { color: "red" },
    },
    root: {
      tag: "document",
      attrs: {},
      children: [
        {
          tag: "style",
          attrs: {},
          children: [],
        },
        {
          tag: "page",
          attrs: {},
          children: [
            {
              tag: "view",
              attrs: {
                class: ["text-sm", "text-red"],
                style: { fontSize: "13px", color: "red" },
              },
              children: [],
            },
          ],
        },
      ],
    },
  };

  expect(parseXML(xml)).toStrictEqual(expected);
});
