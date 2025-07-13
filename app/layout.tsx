// app/layout.tsx

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
        <body>{children}</body>
    </html>
  );
}
