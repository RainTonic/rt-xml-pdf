import { Document } from "@react-pdf/renderer";
import { jsx } from "react/jsx-runtime";
import type { ParsedNode } from "../parser";

export const documentAllowedAttrs = {
  title: () => true,
  author: () => true,
  subject: () => true,
  keywords: () => true,
  creator: () => true,
  producer: () => true,
  pageLayout: (v: any) =>
    ["singlePage", "oneColumn", "twoColumnLeft", "twoColumnRight"].includes(v),
  pageMode: () => true,
  pageSize: () => true,
};

export function handleDocument(node: ParsedNode, children: any[], key: string): any {
  if (typeof node === "string")
    throw new Error("Document node cannot be a string");

  const props: Record<string, any> = {};

  Object.keys(node.attrs).forEach((attr) => {
    props[attr] = node.attrs[attr];
  });

  return jsx(Document, { ...props, children }, key);
}

