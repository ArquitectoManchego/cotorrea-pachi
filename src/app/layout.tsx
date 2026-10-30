import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cotorrea Pachi - Quedada y Salida con Amigos',
  description:
    'Web app para coordinar eventos y salidas con amigos: disponibilidad de días y horas, mapa interactivo de lugares propuestos y algoritmo de coincidencia.',
  openGraph: {
    title: 'Cotorrea Pachi - ¿Cuándo y Dónde nos vemos?',
    description: 'Arma el plan con tus amigos, vota lugares en el mapa y encuentra el mejor horario.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
