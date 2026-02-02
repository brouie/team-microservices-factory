import "./globals.css";

export const metadata = {
  title: "Agent-Launched Microservices Factory",
  description: "Submit ideas, mint tokens, and access services."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <h1>Agent-Launched Microservices Factory</h1>
          <p>Submit an idea, deploy a service, mint a token, and access the API.</p>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
