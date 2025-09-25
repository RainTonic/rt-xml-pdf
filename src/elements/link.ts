import { Link } from "@react-pdf/renderer";
import { jsx } from "react/jsx-runtime";
import type { ParsedNode } from "../parser";
import { isString } from "../utils";

export const linkAllowedAttrs = {
  style: (_v: unknown) => true,
  class: (_v: unknown) => true,
  wrap: () => true,
  fixed: () => true,
  debug: () => true,
  src: isString,
};

export function handleLink(node: ParsedNode, children: any[], key: string): any {
  if (typeof node === "string") throw new Error("Link node cannot be a string");

  const props: Record<string, any> = {};

  Object.keys(node.attrs).forEach((attr) => {
    if (attr === "style") {
      props.style = node.attrs[attr];
    } else if (attr !== "class") {
      props[attr] = node.attrs[attr];
    }
  });

  return jsx(Link, { ...props, children }, key);
}

