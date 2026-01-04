import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Toaster as ToastContainer } from "react-hot-toast";
import TailwindSafelist from "@/components/admin/TailwindSafelist";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bahrain Dental Society | BDS",
  description: "Professional Dental Community in Bahrain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force light mode - remove dark class if exists
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                
                // Prevent dark mode from being applied
                const observer = new MutationObserver(function(mutations) {
                  if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: ['class']
                });
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-gray-50 overflow-x-hidden`}
      >
        {children}
        <TailwindSafelist />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
        <ToastContainer position="top-right" />
      </body>
    </html>
  );
}
