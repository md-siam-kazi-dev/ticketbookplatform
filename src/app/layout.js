import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TicketLagbeNavbar from "@/components/navbar/navbar";
import ThemeProvider from "./providers/ThemeProvider";
import TicketLagbeFooter from "@/components/footer/footer";
// import { DotBackgroundDemo } from "@/components/dotbg";
// import SplashScreen from "@/components/SplashScreen";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TicketLagbe",
  description: "TicketLagbe is Tour Ticket Selling Webapp",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <nav>
            <TicketLagbeNavbar />
          </nav>
          <main>
           
            {children}
          </main>
          <Toaster position="top-center" />
          {/* <DotBackgroundDemo /> */}
          <TicketLagbeFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
