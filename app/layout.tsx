import Footer from "@/components/Footer";
import "./globals.css";
import Header from "@/components/Header";
import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    template: "%s | BMW Engine Configurator",
    default: "BMW Engine Configurator", // Used when no child page overrides title
  },
  description:
    "Explore BMW engine configurations, specifications, and details across different models and generations.",
  openGraph: {
    title: {
      template: "%s | BMW Engine Configurator",
      default: "BMW Engine Configurator",
    },
    description:
      "Explore BMW engine configurations, specifications, and details across different models and generations.",
    siteName: "BMW Engine Configurator",
    type: "website",
    images: [
      {
        url: "/api/og", // This will be your default OG image
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | BMW Engine Configurator",
      default: "BMW Engine Configurator",
    },
    description:
      "Explore BMW engine configurations, specifications, and details across different models and generations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter antialiased h-full min-h-screen">
        <Header />

        <div className="max-w-[2800px] w-full px-6 md:px-20 mx-auto mt-10  flex flex-col flex-grow">
          <NextTopLoader
            color="#2563eb" // Tailwind blue-600
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          />
          <div className="mt-10 h-full flex-grow">{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
