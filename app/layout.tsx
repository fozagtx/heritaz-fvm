import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { WalletProvider } from '@/components/providers/walletProvider';
import { ErrorBoundary } from '@/components/common/errorBoundary';

export const metadata: Metadata = {
  metadataBase: new URL("https://heritaz.xyz"),
  title: "Heritaz - Confidential Digital Inheritance",
  description: "Confidential digital inheritance on Zama fhEVM. Automate check-ins, encrypt legacy documents, and distribute assets with FHE privacy.",
  keywords: ["digital inheritance", "Heritaz", "digital legacy", "confidential inheritance", "Zama", "fhEVM", "FHE", "encrypted legacy"],
  openGraph: {
    title: "Heritaz - Confidential Digital Inheritance",
    description: "Confidential digital inheritance powered by Zama fhEVM. Encrypt documents and distribute assets with FHE privacy.",
    url: "https://heritaz.xyz",
    siteName: "Heritaz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heritaz - Confidential Digital Inheritance",
    description: "Confidential digital inheritance powered by Zama fhEVM. Encrypt documents and distribute assets with FHE privacy.",
    creator: "@zanbuilds",
  },
  icons: {
    icon: [
      { url: 'favicon.svg', type: 'image/svg+xml' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "6JtALOS_ykm2LnlrEBOUUjVoc7NCwn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <ErrorBoundary>
          <WalletProvider>
            <Analytics />
            <Toaster />
            {children}
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
