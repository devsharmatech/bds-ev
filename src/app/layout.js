import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Toaster as ToastContainer } from "react-hot-toast";


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
