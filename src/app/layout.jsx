import './globals.css';

export const metadata = {
  title: 'RAILFLOW — Predict the seat before it becomes empty.',
  description: 'Passenger-declared travel intent system for railway operations. Prototype only.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
