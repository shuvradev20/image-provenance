import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Inter, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google"; 
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter", 
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProveNode - Secure Image Provenance",
  description: "Protect your digital copyrights and verify content authenticity",

  icons: {
    icon: [
      { media: '(prefers-color-scheme: light)', url: '/logo_dark.svg', type: 'image/svg+xml' },
      { media: '(prefers-color-scheme: dark)', url: '/logo_light.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            {children}
          </GoogleOAuthProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}