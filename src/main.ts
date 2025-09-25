import { renderToBuffer, Font } from "@react-pdf/renderer";
import { parseXML, type ParsedNode } from "./parser";
import { jsx } from "react/jsx-runtime";
import {
  handleDocument,
  handlePage,
  handleView,
  handleText,
  handleImage,
  handleLink,
  handleSvgElement,
} from "./elements";
import type { FontRegistration } from "./elements/font";

const handlerMap: Record<string, (node: ParsedNode, children: any[], key: string) => any> = {
  document: handleDocument,
  page: handlePage,
  view: handleView,
  text: handleText,
  image: handleImage,
  link: handleLink,
  svg: handleSvgElement,
  path: handleSvgElement,
  g: handleSvgElement,
  circle: handleSvgElement,
  rect: handleSvgElement,
  ellipse: handleSvgElement,
  line: handleSvgElement,
  polyline: handleSvgElement,
  polygon: handleSvgElement,
};

function buildReactElement(node: ParsedNode, index?: number): any {
  if (typeof node === "string") {
    return node as any; // text content
  }
  if (node.tag === "style" || node.tag === "font") {
    return;
  }
  if (typeof node === "number") {
    return `${node}`;
  }
  const handler = handlerMap[node.tag];
  if (!handler) {
    throw new Error(`Unknown tag: ${node.tag}`);
  }
  const children = node.children.map((child, idx) => buildReactElement(child, idx)).filter(Boolean);
  const key = index !== undefined ? index.toString() : 'root';
  return handler(node, children, key);
}

export async function getPdfFromXml(xmlString: string) {
  const parsedXml = parseXML(xmlString);

  // Register fonts
  parsedXml.fonts.forEach((fontReg: FontRegistration) => {
    Font.register({
      family: fontReg.family,
      src: fontReg.src,
      fontStyle: fontReg.fontStyle as any,
      fontWeight: fontReg.fontWeight as any,
    });
  });

  const pdfDoc = () => buildReactElement(parsedXml.root, 0);
  if (!pdfDoc || typeof pdfDoc === "string") {
    throw new Error("Root must be a Document element");
  }
  const pdfInstance = await renderToBuffer(jsx(pdfDoc, {}) as any);
  return pdfInstance;
}
