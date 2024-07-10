<h1 align="center">
  <img src="https://img.ideal-postcodes.co.uk/Address%20Finder%20Logo@3x.png" alt="AddressZen Address Lookup Bundle">
</h1>

> JavaScript browser bundles for the Address Lookup library

![CI](https://github.com/addresszen/address-lookup/workflows/CI/badge.svg)
![Release](https://github.com/addresszen/address-lookup/workflows/Release/badge.svg)

This package exports polyfilled, minified copies of `address-lookup` in various formats available on npm and various JavaScript CDNs. It can be readily [dropped in](#usage) on a page without transpilation of `address-lookup`.

## Download

### Download Latest Bundle

- [address-lookup.js](https://cdn.jsdelivr.net/npm/@addresszen/address-lookup/dist/address-lookup.js)

Serving your own versioned copy is recommended. If a JavaScript CDN is used (e.g. jsDelivr, cdnjs), be sure to pin the version.

Use [address-lookup.esm.js](https://cdn.jsdelivr.net/npm/@addresszen/address-lookup/dist/address-lookup.esm.js) if you need a ES Module compatible build.

### ⚠️ Pinning Versions

It is important you pin your bundle version in production. Pulling directly from latest **will** cause your integration to fail at some point in the future.

For instance, follow the instructions on [jsdelivr.com/address-lookup](https://www.jsdelivr.com/package/npm/@addresszen/address-lookup) to pin a major version in production. E.g.

```html
<script src="https://cdn.jsdelivr.net/npm/@addresszen/address-lookup@1></script>
```

## Links

- [Bundles Overview](#bundles-overview)
- [Usage](#usage)
- [Documentation](https://address-lookup.addresszen.com)
- [npm](https://www.npmjs.com/package/@addresszen/address-lookup)
- [GitHub Repository](https://github.com/addresszen/address-lookup)

## Documentation

### Bundles Overview

#### address-lookup.js

- **UMD compatible**
- Transpiles address-lookup to target Internet Explorer 11 as minimum browser version
- Default export of the npm module

#### address-lookup.esm.js

- **ES Module compatible**
- Targets browsers with [ES Module support](https://caniuse.com/#search=module)
- Default ES Module export

### Usage

#### UMD

```html
<script src="https://cdn.jsdelivr.net/npm/@addresszen/address-lookup@1"></script>

<script>
  AddressZen.AddressLookup.setup({
    apiKey: "iddqd",
    inputField: "#line_1",
    outputFields: {
      line_1: "#line_1",
      line_2: "#line_2",
      line_3: "#line_3",
      post_town: "#post_town",
      postcode: "#postcode",
    },
  });
</script>
```

#### ES Module

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@addresszen/address-lookup@1/dist/address-lookup.esm.js"
></script>

<script type="module">
  import { AddressLookup } from "https://cdn.jsdelivr.net/npm/@addresszen/address-lookup@1/dist/address-lookup.esm.js";
  AddressLookup.setup({
    apiKey: "iddqd",
    inputField: "#line_1",
    outputFields: {
      line_1: "#line_1",
      line_2: "#line_2",
      line_3: "#line_3",
      post_town: "#post_town",
      postcode: "#postcode",
    },
  });
</script>
```

### Client Documentation

For a complete list of client methods, including low level resource methods, please see the [address-lookup documentation](https://address-lookup.addresszen.com/)

## Run Examples

Build, and serve example pages locally:

```bash
npm run build && \ # Build JS bundles
npm start          # Start http server
```

For UMD demo visit [http://localhost:8081/example/umd.html](http://localhost:8081/example/umd.html)

For ES module demo visit [http://localhost:8081/example/esm.html](http://localhost:8081/example/esm.html)
