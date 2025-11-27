import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "RCM Process Streamliner",
    description: "Revenue Cycle Management Prior Authorization System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
