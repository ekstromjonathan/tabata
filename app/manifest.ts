import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tabata",
    short_name: "Tabata",
    description: "Minimal tabata-timer. 19 kr i måneden.",
    start_url: "/timer",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "nb",
  }
}
