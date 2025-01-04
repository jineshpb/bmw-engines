import "./globals.css";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter antialiased">
        <div className="max-w-[1440px] w-full px-20 mx-auto">
          <Header />
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
