import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'السلطان | SULTAN — صيانة الهواتف والإكسسوارات', description: 'السلطان لصيانة الهواتف وبيع الإكسسوارات في بوقطب، ولاية البيض. هاتف: +213659898520. البريد: soltanphene03@gmail.com.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#08090d' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
