import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RicambiXStufe - Ricambi per Stufe a Pellet",
    short_name: "RicambiXStufe",
    description:
      "Ricambi per stufe a pellet: motoriduttori, ventilatori, resistenze, schede elettroniche e molto altro.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#f97316",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
