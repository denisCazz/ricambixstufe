/**
 * Smoke test: parse Danea sample XML (no DB). Run: npx tsx scripts/test-danea-parse.ts
 */
import {
  applyCatalogVat,
  parseEasyfattProductsXml,
  resolveCatalogPrice,
} from "../lib/danea-import";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<EasyfattProducts AppVersion="2" Mode="incremental">
  <UpdatedProducts>
    <Product>
      <Code>TEST-001</Code>
      <Description>Ricambio test</Description>
      <Category>Ricambi</Category>
      <Subcategory>Filtri</Subcategory>
      <Vat Perc="22" Class="Imponibile" Description="IVA 22%">22</Vat>
      <NetPrice1>10.00</NetPrice1>
      <GrossPrice1>99.99</GrossPrice1>
      <AvailableQty>5</AvailableQty>
      <Barcode>8031234567890</Barcode>
      <ProducerName>ACME</ProducerName>
      <Notes>Nota breve</Notes>
    </Product>
  </UpdatedProducts>
  <DeletedProducts>
    <Product><Code>OLD-SKU</Code></Product>
  </DeletedProducts>
</EasyfattProducts>`;

const bundle = parseEasyfattProductsXml(xml);
const product = bundle.toUpsert[0];
const catalogPrice = resolveCatalogPrice(product);

// eslint-disable-next-line no-console
console.log("parse:", JSON.stringify(bundle, null, 2));
// eslint-disable-next-line no-console
console.log("catalog price (net+IVA):", catalogPrice, "expected 12.20");
// eslint-disable-next-line no-console
console.assert(catalogPrice === "12.20", "NetPrice wins over stale GrossPrice");
// eslint-disable-next-line no-console
console.assert(applyCatalogVat("100", 0.22) === "122.00", "IVA 22%");
