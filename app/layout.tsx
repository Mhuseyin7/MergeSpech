import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "MergeSpech | Evidence-based PR review", description: "Self-hosted pull request analysis for GitHub." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
