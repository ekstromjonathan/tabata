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
    icons: [
      { src: "/icon.png", sizes: "1024x1024", type: "image/png" },
      { src: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" },
      { src: "/icons/icon-512.webp", sizes: "512x512", type: "image/webp" },
    ],
  }
}
