import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillChain | Stellar Scholarship Escrow",
  description: "Transparent, milestone-based scholarship funding powered by Stellar and Soroban.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
