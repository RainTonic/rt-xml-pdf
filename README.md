# rt-xml-pdf

A simple library for generating PDFs in the browser and on the server using react-pdf, without requiring React. It works by parsing XML files that directly map to react-pdf components, making it easy to create PDFs from structured markup.

## Features

- **XML Parsing**: Define your PDF layout using XML, with a 1-to-1 mapping to react-pdf components.
- **Style Support**: Include styles in a `<style>` tag, just like HTML, and the library will handle them automatically.
- **Style Parsing**: Converts inline styles (like `style="font-size: 16px"`) into JavaScript objects (e.g., `{ fontSize: 16 }`).
- **No React Needed**: Directly calls react-pdf functions to build your PDFs.

## Installation

```bash
npm install rt-xml-pdf
```

## Usage

1. Create an XML file describing your PDF layout.
2. Use the library to parse the XML and generate the PDF.

Example XML:

```xml
<document>
  <style>
    .title { font-size: 24px; color: blue; }
  </style>
  <page>
    <text class="title">Hello World</text>
  </page>
</document>
```

Then, in your code:

```javascript
import { getPdfFromXml } from "rt-xml-pdf";

const xmlString = `...`; // your XML
const pdfBuffer = await getPdfFromXml(xmlString);
// Use the pdf buffer as needed
```

### Templating:

The library works with XML, but you could extend its functionality by
importing a templating library, like Handlebars.

```bash
npm install rt-xml-pdf handlebars

```

```javascript
import Handlebars from "handlebars";
import { getPdfFromXml } from "rt-xml-pdf";

var template = Handlebars.compile("<text>Hello, {{name}}</text>");
// execute the compiled template and pass it to getPdfFromXml
const pdfBuffer = await getPdfFromXml(template({ name: "Freddy" }));
```

## Contributing

Feel free to open issues or pull requests on GitHub.

