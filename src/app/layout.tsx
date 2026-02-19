import './globals.css';

export const metadata = {
  title: 'Pandora QE Workshop — SDLC Agentic Transformation',
  description: 'Interactive workshop tool for redefining Quality Engineering across the SDLC lifecycle with Claude Agents',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
