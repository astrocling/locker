import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Owner's Locker",
    short_name: "Locker",
    description:
      "Track everything in the Owner's Locker between Disney World visits",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#38bdf8",
    icons: [
      {
        src: "/icon.png",
        sizes: "447x447",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
