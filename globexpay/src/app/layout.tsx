import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GlobexPay - Сервис загрузки платежных документов",
  description: "Сервис загрузки платежных документов для распознавания и переводов на расчетные счета по инвойсу или по реквизитам компаний",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <script 
          async 
          src="https://telegram.org/js/telegram-widget.js?22" 
          data-telegram-login={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
          data-size="large"
          data-radius="8"
          data-request-access="write"
          data-userpic="false"
          data-lang="ru"
        />
      </head>
      <body className={geistSans.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
