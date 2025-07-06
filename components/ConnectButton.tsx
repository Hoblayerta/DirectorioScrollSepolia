// components/ConnectButton.tsx - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../src/app/client";

// ✅ Wallets básicos - SIN Smart Account
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
      theme="dark"
      connectModal={{
        title: "🔑 Conectar Wallet",
        titleIcon: "",
        showThirdwebBranding: false,
        welcomeScreen: {
          title: "DirectorioPro Web3",
          subtitle: "Conecta tu wallet para comenzar",
        },
      }}
    />
  );
}