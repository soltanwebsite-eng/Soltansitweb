import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'السلطان | SULTAN — صيانة الهواتف والإكسسوارات', description: 'اطلب صيانة هاتفك، تابع حالة الإصلاح، واكتشف إكسسوارات الهواتف من محل السلطان في بوقطب، ولاية البيض.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#08090d' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
