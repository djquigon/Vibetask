import type { Metadata } from "next";
import "./globals.css";

import { getTheme } from "@/features/theme/server/queries";

export const metadata: Metadata = {
  title: "Vibetask",
  description: "A retro-futuristic AI productivity assistant.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getTheme();

  return (
    <html lang="en" data-theme={theme} className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
