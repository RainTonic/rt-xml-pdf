import { XMLParser } from "fast-xml-parser";

export type ParsedNode =
  | string
  | {
      tag: string;
      attrs: Record<string, any>;
      children: ParsedNode[];
    };

export interface ParsedXML {
  styles: Record<string, Record<string, string>>;
  root: ParsedNode;
}

// Allowed CSS properties (camelCased)
const allowedCssProperties = new Set([
  "fontSize",
  "color",
  "display",
  "margin",
  "padding",
  "border",
  "backgroundColor",
  "width",
  "height",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "textAlign",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "letterSpacing",
  "textDecoration",
  "position",
  "top",
  "left",
  "right",
  "bottom",
  "zIndex",
  "opacity",
  "transform",
  "boxShadow",
  "borderRadius",
  "overflow",
  "whiteSpace",
  "wordWrap",
  "textOverflow",
  "cursor", // wait, test says reject cursor
]);

// Actually, from test, reject cursor, so remove it.
allowedCssProperties.delete("cursor");

// Allowed attributes for each tag (from react-pdf components)
const allowedAttrs: Record<string, Record<string, (value: any) => boolean>> = {
  document: {
    title: () => true,
    author: () => true,
    subject: () => true,
    keywords: () => true,
    creator: () => true,
    producer: () => true,
    pageLayout: (v) =>
      ["singlePage", "oneColumn", "twoColumnLeft", "twoColumnRight"].includes(
        v,
      ),
    pageMode: () => true,
    pageSize: () => true,
  },
  page: {
    size: () => true,
    orientation: (v) => ["portrait", "landscape"].includes(v),
    wrap: () => true,
  },
  view: {
    style: () => true,
    class: () => true,
  },
  text: {
    style: () => true,
    class: () => true,
  },
  style: {},
};

// Convert kebab-case to camelCase
const camelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

export const parseStyle = (styleString: string): Record<string, string> =>
  styleString
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce((result, decl) => {
      const [prop, value] = decl.split(":").map((s) => s.trim());
      if (!prop || !value) return result;
      const camelProp = camelCase(prop);
      if (!allowedCssProperties.has(camelProp)) {
        throw new Error(`Unsupported CSS property: ${prop}`);
      }
      return { ...result, [camelProp]: value };
    }, {});

const parseStylesFromTag = (
  styleContent: string,
): Record<string, Record<string, string>> =>
  styleContent
    .split("}")
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce((styles, rule) => {
      const [selector, declarations] = rule.split("{");
      if (!selector || !declarations) return styles;
      const className = selector.trim().replace(/^\./, "");
      return { ...styles, [className]: parseStyle(declarations) };
    }, {});

const applyClassStyles = (
  node: any,
  styles: Record<string, Record<string, string>>,
): void => {
  if (typeof node === "string") return;
  const classes = Array.isArray(node.attrs?.class)
    ? node.attrs.class
    : (node.attrs?.class || "").split(/\s+/);
  const combinedStyle = classes
    .map((cls: string) => styles[cls])
    .filter(Boolean)
    .reduce(
      (acc: Record<string, string>, style: Record<string, string>) => ({
        ...acc,
        ...style,
      }),
      {},
    );
  if (Object.keys(combinedStyle).length > 0) {
    node.attrs.style = { ...node.attrs.style, ...combinedStyle };
  }
  if (node.children)
    node.children.forEach((child: any) => applyClassStyles(child, styles));
};

const validateNode = (node: any): void => {
  if (typeof node === "string") return;
  const tagValidators = allowedAttrs[node.tag];
  if (!tagValidators) {
    if (node.children) node.children.forEach(validateNode);
    return;
  }
  Object.keys(node.attrs).forEach((attr) => {
    if (!(attr in tagValidators)) {
      throw new Error(`Unrecognized attribute for ${node.tag}: ${attr}`);
    }
    if (!tagValidators[attr](node.attrs[attr])) {
      throw new Error(
        `Invalid value for ${node.tag} attribute ${attr}: ${node.attrs[attr]}`,
      );
    }
  });
  if (node.children) node.children.forEach(validateNode);
};

function buildParsedNode(obj: any, tag: string): ParsedNode {
  const node: ParsedNode = {
    tag,
    attrs: {},
    children: [],
  };
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("@_")) {
      const attr = key.slice(2);
      if (attr === "style" && typeof value === "string") {
        node.attrs.style = parseStyle(value);
      } else if (attr === "class" && typeof value === "string") {
        node.attrs.class = value.split(/\s+/);
      } else {
        node.attrs[attr] = value;
      }
    } else if (key === "#text") {
      node.children.push(value as string);
    } else if (typeof value === "string") {
      if (key === "style") {
        node.children.push({ tag: key, attrs: {}, children: [] });
      } else {
        node.children.push({ tag: key, attrs: {}, children: [value] });
      }
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          node.children.push({ tag: key, attrs: {}, children: [item] });
        } else {
          node.children.push(buildParsedNode(item, key));
        }
      }
    } else if (typeof value === "object" && value !== null) {
      node.children.push(buildParsedNode(value, key));
    }
  }
  return node;
}

const extractStyles = (
  obj: any,
  tag: string,
  styles: Record<string, Record<string, string>>,
): void => {
  if (tag === "style") {
    const content = typeof obj === "string" ? obj : obj?.["#text"];
    if (content) Object.assign(styles, parseStylesFromTag(content));
  }
  if (typeof obj === "object" && obj !== null) {
    Object.entries(obj)
      .filter(([key]) => !key.startsWith("@_") && key !== "#text")
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item: any) => extractStyles(item, key, styles));
        } else {
          extractStyles(value, key, styles);
        }
      });
  }
};

export function parseXML(xmlString: string): ParsedXML {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    parseTagValue: true,
  });
  const parsed = parser.parse(xmlString);
  const rootKeys = Object.keys(parsed);
  if (rootKeys.length !== 1) {
    throw new Error("XML must have exactly one root element");
  }
  const rootTag = rootKeys[0];
  const rootObj = parsed[rootTag];

  // Extract styles
  const styles: Record<string, Record<string, string>> = {};
  extractStyles(rootObj, rootTag, styles);

  const root = buildParsedNode(rootObj, rootTag);

  // Apply class styles
  applyClassStyles(root, styles);

  // Validate
  validateNode(root);

  return { styles, root };
}

