// NOP Intelligence Layer — Next App (FAZ1)
import "../styles/globals.css";
import { WalletProvider } from "../contexts/WalletContext";
import NOPAssistant from "../components/ai/NOPAssistant";

export default function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
      <NOPAssistant />
    </WalletProvider>
  );
}
