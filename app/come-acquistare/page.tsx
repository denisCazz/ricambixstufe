import ComeAcquistareClient from "./ComeAcquistareClient";
import {
  COD_SURCHARGE,
  getZoneShippingPrices,
  type ShippingZone,
} from "@/lib/shipping";

const ZONES: ShippingZone[] = ["italy", "islands_calabria", "europe"];

export const metadata = {
  title: "Come acquistare",
};

export default function ComeAcquistarePage() {
  const zones = ZONES.map((zone) => ({
    zone,
    ...getZoneShippingPrices(zone),
  }));

  return <ComeAcquistareClient zones={zones} codSurcharge={COD_SURCHARGE} />;
}
