import { WalletProvider } from "../contexts/WalletContext";
import NOPAssistant from "../components/ai/NOPAssistant";

export const metadata = {
  title: 'NOP Intelligence Layer',
  description: 'NOP Intelligence Layer Frontend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
          <NOPAssistant />
        </WalletProvider>
      </body>
    </html>
  );
}

