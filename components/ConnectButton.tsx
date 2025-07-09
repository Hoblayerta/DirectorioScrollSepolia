// components/ConnectButton.tsx - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../src/app/client";
import { defineChain } from "thirdweb/chains";

// ✅ DEFINIR SCROLL SEPOLIA CHAIN
const scrollSepolia = defineChain({
  id: 534351,
  name: "Scroll Sepolia",
  rpc: "https://sepolia-rpc.scroll.io/",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Scrollscan",
      url: "https://sepolia.scrollscan.dev",
    },
  ],
  testnet: true,
});

// ✅ WALLETS BÁSICOS
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
];

export default function CustomConnectButton() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chains={[scrollSepolia]} // ✅ ESPECIFICAR LA CHAIN
      theme="dark"
      connectModal={{
        title: "🔑 Conectar Wallet",
        titleIcon: "",
        showThirdwebBranding: false,
        welcomeScreen: {
          title: "DirectorioPro Web3",
          subtitle: "Conecta tu wallet a Scroll Sepolia para comenzar",
        },
      }}
      switchToActiveChain={true} // ✅ AUTO-SWITCH A SCROLL SEPOLIA
    />
  );
}