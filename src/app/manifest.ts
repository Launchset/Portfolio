import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Launchset — Digital Design & Automation Studio",
    short_name: "Launchset",
    description: "Distinctive websites, useful automations and practical digital systems.",
    start_url: "/",
    display: "standalone",
    background_color: "#080d12",
    theme_color: "#25d38a",
    icons: [
      { src: "/icon.png", sizes: "1024x1024", type: "image/png" },
    ],
  };
}
