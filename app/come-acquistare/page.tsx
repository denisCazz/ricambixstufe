import ComeAcquistareClient from "./ComeAcquistareClient";
import {
  getShippingConfig,
  getZoneShippingPrices,
  type ShippingZone,
} from "@/lib/shipping";

const ZONES: ShippingZone[] = ["italy", "islands_calabria", "europe"];

export const metadata = {
  title: "Come acquistare",
};

export default async function ComeAcquistarePage() {
  const config = await getShippingConfig();
  const zones = ZONES.map((zone) => ({
    zone,
    ...getZoneShippingPrices(zone, config),
  }));

  return <ComeAcquistareClient zones={zones} codSurcharge={config.codSurcharge} />;
}
