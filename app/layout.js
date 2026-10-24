import "./globals.css";
export const metadata = { title: "Road to 20 March", description: "Daily English practice exams, A1 to B2" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;700&family=Sarabun:wght@400;500;600;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
