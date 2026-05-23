import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AditBunta Diecaster | Inventory & Dashboard",
  description: "Modern inventory management & business intelligence for diecast collectors.",
  icons: {
    icon: "/logo_yellow.png",
    apple: "/logo_yellow.png",
  },
  openGraph: {
    title: "AditBunta Diecaster",
    description: "Premium inventory management & marketplace for diecast collectors.",
    url: "https://onlydiecast.vercel.app",
    siteName: "Only Diecaster",
    images: [
      {
        url: "/logo_yellow.png",
        width: 800,
        height: 800,
        alt: "Only Diecaster Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AditBunta Diecaster",
    description: "Premium inventory management & marketplace for diecast collectors.",
    images: ["/logo_yellow.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const role = cookieStore.get('user-role')?.value || null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar initialRole={role} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
