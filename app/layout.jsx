import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import MotionProvider from './_components/MotionProvider'; // 👈 Import new wrapper

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Quiz Platform',
  description: 'AI-Powered Quizzes for Students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <AuthProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
