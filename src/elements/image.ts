import { Image } from "@react-pdf/renderer";
import { jsx } from "react/jsx-runtime";
import type { ParsedNode } from "../parser";
import { isString } from "../utils";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

export const imageAllowedAttrs = {
  style: (_v: unknown) => true,
  class: (_v: unknown) => true,
  wrap: () => true,
  fixed: () => true,
  debug: () => true,
  src: (v: any) => isString(v),
  cache: () => true,
  bookmark: () => {
    throw new Error("not implemented");
  },
};

export function handleImage(node: ParsedNode, children: any[], key: string): any {
  if (typeof node === "string")
    throw new Error("Image node cannot be a string");

  const props: Record<string, any> = {};

  Object.keys(node.attrs).forEach((attr) => {
    if (attr === "src") {
      const value = node.attrs[attr];
      if (
        typeof value === "string" &&
        !value.startsWith("http") &&
        !value.startsWith("data:")
      ) {
        const format = extname(value);
        const data = readFileSync(value);
        props[attr] = { data, format };
      } else {
        props[attr] = value;
        props["source"] = value;
      }
    } else if (attr === "style") {
      props.style = node.attrs[attr];
    } else if (attr !== "class") {
      props[attr] = node.attrs[attr];
    }
  });

  return jsx(Image, { ...props, children }, key);
}

