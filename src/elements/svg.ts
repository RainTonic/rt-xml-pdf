import {
  Svg,
  Path,
  G,
  Circle,
  Rect,
  Ellipse,
  Line,
  Polyline,
  Polygon,
} from "@react-pdf/renderer";
import { jsx } from "react/jsx-runtime";
import type { ParsedNode } from "../parser";

const svgComponentMap: Record<string, any> = {
  svg: Svg,
  path: Path,
  g: G,
  circle: Circle,
  rect: Rect,
  ellipse: Ellipse,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
};

// Common SVG attributes
const commonSvgAttrs = {
  style: (_v: unknown) => true,
  class: (_v: unknown) => true,
  id: () => true,
  transform: () => true,
  fill: () => true,
  stroke: () => true,
  "stroke-width": () => true,
  "stroke-linecap": () => true,
  "stroke-linejoin": () => true,
  "stroke-dasharray": () => true,
  opacity: () => true,
  "fill-opacity": () => true,
  "stroke-opacity": () => true,
};

// SVG-specific attributes for different elements
const svgElementAttrs: Record<
  string,
  Record<string, (value: any) => boolean>
> = {
  svg: {
    ...commonSvgAttrs,
    width: () => true,
    height: () => true,
    viewBox: () => true,
    xmlns: () => true,
    "xmlns:xlink": () => true,
  },
  path: {
    ...commonSvgAttrs,
    d: () => true,
    "fill-rule": () => true,
    "clip-rule": () => true,
  },
  g: {
    ...commonSvgAttrs,
  },
  circle: {
    ...commonSvgAttrs,
    cx: () => true,
    cy: () => true,
    r: () => true,
  },
  rect: {
    ...commonSvgAttrs,
    x: () => true,
    y: () => true,
    width: () => true,
    height: () => true,
    rx: () => true,
    ry: () => true,
  },
  ellipse: {
    ...commonSvgAttrs,
    cx: () => true,
    cy: () => true,
    rx: () => true,
    ry: () => true,
  },
  line: {
    ...commonSvgAttrs,
    x1: () => true,
    y1: () => true,
    x2: () => true,
    y2: () => true,
  },
  polyline: {
    ...commonSvgAttrs,
    points: () => true,
  },
  polygon: {
    ...commonSvgAttrs,
    points: () => true,
  },
};

export const svgAllowedAttrs = svgElementAttrs;

function convertNamespacedAttr(attr: string): string {
  // Convert namespaced attributes like xlink:href to xlinkHref
  return attr.replace(/:/g, "").replace(/([a-z])([A-Z])/g, "$1$2");
}

export function handleSvgElement(node: ParsedNode, children: any[], key: string): any {
  if (typeof node === "string") {
    throw new Error("SVG node cannot be a string");
  }

  const Component = svgComponentMap[node.tag];
  if (!Component) {
    throw new Error(`Unknown SVG element: ${node.tag}`);
  }

  const props: Record<string, any> = {};

  Object.keys(node.attrs).forEach((attr) => {
    // Convert namespaced attributes
    const convertedAttr = convertNamespacedAttr(attr);

    // Handle special cases
    if (attr === "style") {
      props.style = node.attrs[attr];
    } else if (attr === "class") {
      // Skip class for now, handled elsewhere
    } else {
      props[convertedAttr] = node.attrs[attr];
    }
  });

  return jsx(Component, { ...props, children }, key);
}
