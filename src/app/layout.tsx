import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlexGrid Europe - European Electricity Flexibility Dashboard",
  description: "Interactive map-based analysis of European electricity prices and carbon flexibility value. Explore wholesale prices across 31 countries and calculate the economic and environmental value of demand-side flexibility.",
  keywords: ["electricity", "europe", "flexibility", "carbon intensity", "energy", "grid", "prices"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
