import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "First Aid Admin",
  description: "First Aid Admin Portal",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAgent = (await headers()).get("user-agent") ?? "";
  const isMobilePhone = /Android|iPhone|iPod|IEMobile|Opera Mini/i.test(userAgent);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        {isMobilePhone ? (
          <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
            <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg shadow-gray-200">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
                💻
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Desktop only</h1>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                This website is designed for desktop and laptop use. Please log in from a laptop
                or desktop browser to continue.
              </p>
            </div>
          </main>
        ) : (
          children
        )}
      </body>
    </html>
  );
}