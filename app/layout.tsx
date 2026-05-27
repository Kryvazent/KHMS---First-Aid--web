import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "First Aid Admin",
  description: "First Aid Admin Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}