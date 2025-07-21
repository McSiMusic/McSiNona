import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/_components/header/Header";

export const metadata: Metadata = {
    title: "McSiNona",
    description: "Nonograms",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header className="header" />
                <div className="content">{children}</div>
            </body>
        </html>
    );
}
