import "./globals.css";

export const metadata = {
  title: "kyriosMICA Lab — TQIM-Davoh v3",
  description: "Plateforme de Bio-Informatique Systémique · Théorie Quantique de l'Information Moléculaire de Davoh · Qudits-36 · Bell/GHZ · MPS",
  authors: [{ name: "Cyrille Egnon Davoh", url: "https://kyriosmica.com" }],
  keywords: ["TQIM-Davoh", "Qudits-36", "kyriosMICA", "ADN", "quantum", "bioinformatics"],
  openGraph: {
    title: "kyriosMICA Lab — TQIM-Davoh v3",
    description: "The first platform computing the complete quantum signature of DNA",
    url: "https://lab.kyriosmica.com",
    siteName: "kyriosMICA",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#020609" />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
