import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Falcus Media - Staff Management Dashboard",
  description: "Scalable, secure, and modern staff management dashboard for Falcus Media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
