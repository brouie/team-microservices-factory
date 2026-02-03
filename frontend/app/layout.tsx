import "./globals.css";

export const metadata = {
  title: "Microservices Factory",
  description: "Submit ideas, deploy services, mint tokens, access APIs."
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
          <h1>Microservices Factory</h1>
          <p>Submit an idea. Deploy a service. Mint a token. Access the API.</p>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
