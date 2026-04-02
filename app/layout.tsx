import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';

export const metadata: Metadata = {
  title: 'CityVend Admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.APP_ENV === 'DEV';

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {isDev && (
          <div style={{
            background: '#dc3545',
            color: '#fff',
            textAlign: 'center',
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
          }}>
            This is a Dev Server and will be updating the Development database
          </div>
        )}
        <div style={{
          background: '#001529',
          color: '#fff',
          textAlign: 'center',
          padding: '12px 16px',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}>
          CityVend Admin
        </div>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
