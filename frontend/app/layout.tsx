import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Production Todo App",
  description: "Scalable Full-Stack Architecture",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
