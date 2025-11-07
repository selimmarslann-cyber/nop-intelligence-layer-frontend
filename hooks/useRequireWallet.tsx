// hooks/useRequireWallet.tsx
// Hook to require wallet connection for interactive actions
"use client";

import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import WalletConnectModal from "../components/wallet/WalletConnectModal";

export function useRequireWallet() {
  const { isConnected } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [triggerReason, setTriggerReason] = useState<string | undefined>();

  const requireWallet = (action: string, callback?: () => void) => {
    if (isConnected) {
      callback?.();
      return true;
    } else {
      setTriggerReason(action);
      setShowModal(true);
      return false;
    }
  };

  return {
    requireWallet,
    isConnected,
    WalletModal: (
      <WalletConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        triggerReason={triggerReason}
      />
    ),
  };
}

