/**
 * Smoke test: parse Danea sample XML (no DB). Run: npx tsx scripts/test-danea-parse.ts
 */
import { parseEasyfattProductsXml } from "../lib/danea-import";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<EasyfattProducts AppVersion="2" Mode="incremental">
  <UpdatedProducts>
    <Product>
      <Code>TEST-001</Code>
      <Description>Ricambio test</Description>
      <Category>Ricambi</Category>
      <Subcategory>Filtri</Subcategory>
      <GrossPrice1>12.50</GrossPrice1>
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

// eslint-disable-next-line no-console
console.log(JSON.stringify(parseEasyfattProductsXml(xml), null, 2));
