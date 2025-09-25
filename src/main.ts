import {
  Document,
  Page,
  View,
  Text,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import { readFileSync } from "fs";
import { parseXML, type ParsedNode } from "./parser";
import { jsx } from "react/jsx-runtime";

// silence react log about keys, since it's not relevant
// console.log = function (...args: any[]) {
//   for (const arg in args) {
//     if (typeof arg === "string" && /warning-keys/.test(arg)) {
//       continue;
//     }
//     console.log(arg);
//   }
// };

const componentMap: Record<string, any> = {
  document: Document,
  page: Page,
  view: View,
  text: Text,
  image: Image,
};

function buildReactElement(node: ParsedNode): any {
  if (typeof node === "string") {
    return node as any; // text content
  }
  if (node.tag === "style") {
    return;
  }
  if (typeof node === "number") {
    return `${node}`;
  }
  const Component = componentMap[node.tag];
  if (!Component) {
    throw new Error(`Unknown tag: ${node.tag}`);
  }
  const props: Record<string, any> = {};
  for (const [key, value] of Object.entries(node.attrs)) {
    if (key === "style" && typeof value === "object") {
      props.style = value;
    } else if (key === "src") {
      if (
        typeof value === "string" &&
        !value.startsWith("http") &&
        !value.startsWith("data:")
      ) {
        const data = readFileSync(value);
        props[key] = { data, format: "png" };
      } else {
        props[key] = value;
        props["source"] = value;
      }
    } else if (key !== "class") {
      // ignore class, already merged
      props[key] = value;
    }
  }
  const children = node.children.map(buildReactElement).filter(Boolean);
  return jsx(Component, { ...props, children });
}

export async function getPdfFromXml(xmlString: string) {
  const parsedXml = parseXML(xmlString);
  console.log(JSON.stringify(parsedXml.root, null, 2));
  const pdfDoc = () => buildReactElement(parsedXml.root);
  if (!pdfDoc || typeof pdfDoc === "string") {
    throw new Error("Root must be a Document element");
  }
  const pdfInstance = await renderToBuffer(jsx(pdfDoc, {}) as any);
  return pdfInstance;
}
