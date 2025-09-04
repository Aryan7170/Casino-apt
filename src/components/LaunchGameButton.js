"use client";
import { useEffect, useRef } from "react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
// import { useAccount, useDisconnect } from "wagmi";
// import "@rainbow-me/rainbowkit/styles.css";
import { useRouter } from "next/navigation";

export default function LaunchGameButton() {
  const router = useRouter();
  // const { isConnecting, address, isConnected, chain } = useAccount();
  // const { openConnectModal } = useConnectModal();
  // const { openAccountModal } = useAccountModal();
  // const { openChainModal } = useChainModal();
  // const { disconnect } = useDisconnect();

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        console.log("🚀 Launch Game button clicked");
        router.push("/game");
      }}
      className="text-white font-display cursor-pointer rounded-xl py-3 px-6 smooth-gradient hover:shadow-lg transition-all"
      type="button"
    >
      Launch game
    </button>
  );
}
