import "./globals.css";

export const metadata = {
  title: "CrossWord Platform",
  description: "Puzzle Generator & Assessment Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
