// app/layout.tsx
import { GameControllerProvider } from './context/GemeController';


export const metadata = {
  title: 'My Flight Game',
  description: 'A flight game with React Three Fiber',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GameControllerProvider>
        <body>{children}</body>
      </GameControllerProvider>
    </html>
  );
}
