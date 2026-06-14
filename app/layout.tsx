import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eureka | Socratic STEM Discovery',
  description: 'A Socratic STEM discovery engine that asks sharper questions, catches misconceptions, maps mastery, and verifies ideas through simulations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0D0D14] text-[#F2EDE6] antialiased">
        {children}
      </body>
    </html>
  );
}
