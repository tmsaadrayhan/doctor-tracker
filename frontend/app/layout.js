import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Doctor Tracker",
  description: "Doctor and patient administration dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
