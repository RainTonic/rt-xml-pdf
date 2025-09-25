import type { ParsedNode } from "../parser";

export interface FontRegistration {
  family: string;
  src: string;
  fontStyle?: string;
  fontWeight?: string;
}

export const fontAllowedAttrs = {
  source: () => true,
  style: () => true,
  family: () => true,
  weight: () => true,
};

export function handleFont(node: ParsedNode): FontRegistration | null {
  if (typeof node === "string") return null;

  const attrs = node.attrs;
  const source = attrs.source;
  const style = attrs.fontStyle || "normal";
  const family = attrs.family;
  const weight = attrs.weight || "normal";

  if (!source) {
    throw new Error("Font element must have a source attribute");
  }

  if (!family) {
    throw new Error("Font element must have a family attribute");
  }

  return {
    family,
    src: source,
    fontStyle: style,
    fontWeight: weight,
  };
}

