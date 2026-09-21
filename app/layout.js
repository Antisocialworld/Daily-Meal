import './globals.css';

export const metadata = {
  title: 'Daily Meal',
  description: 'Minimal client for the APE-P-I food delivery API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
