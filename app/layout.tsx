import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { WalletProvider } from '@/components/providers/walletProvider';
import { ErrorBoundary } from '@/components/common/errorBoundary';

export const metadata: Metadata = {
  metadataBase: new URL("https://heritaz.xyz"),
  title: "Heritaz - Complete Digital Legacy Platform",
  description: "Secure digital inheritance on Filecoin. Automate check-ins, encrypt legacy documents, and distribute assets trustlessly — powered by FVM smart contracts and IPFS.",
  keywords: ["digital inheritance", "Heritaz", "digital legacy", "crypto inheritance", "Filecoin", "FVM", "IPFS", "encrypted documents"],
  openGraph: {
    title: "Heritaz - Complete Digital Legacy Platform",
    description: "Secure digital inheritance on Filecoin. Automate check-ins, encrypt legacy documents, and distribute assets trustlessly.",
    url: "https://heritaz.xyz",
    siteName: "Heritaz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heritaz - Complete Digital Legacy Platform",
    description: "Secure digital inheritance on Filecoin. Automate check-ins, encrypt legacy documents, and distribute assets trustlessly.",
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
