import { View } from "@react-pdf/renderer";
import { jsx } from "react/jsx-runtime";
import type { ParsedNode } from "../parser";

export const viewAllowedAttrs = {
  style: (_v: unknown) => true,
  class: (_v: unknown) => true,
  wrap: () => true,
  fixed: () => true,
  debug: () => true,
};

export function handleView(node: ParsedNode, children: any[], key: string): any {
  if (typeof node === "string") throw new Error("View node cannot be a string");

  const props: Record<string, any> = {};

  Object.keys(node.attrs).forEach((attr) => {
    if (attr === "style") {
      props.style = node.attrs[attr];
    } else if (attr !== "class") {
      props[attr] = node.attrs[attr];
    }
  });

  return jsx(View, { ...props, children }, key);
}

