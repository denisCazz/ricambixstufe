import ComeAcquistareClient from "./ComeAcquistareClient";
import { getShippingConfig } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Come acquistare",
};

export default async function ComeAcquistarePage() {
  const config = await getShippingConfig();
  return <ComeAcquistareClient config={config} />;
}
