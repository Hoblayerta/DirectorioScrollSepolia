// src/app/client.ts - REEMPLAZAR TODO EL CONTENIDO
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "10000000000000000000000000000000000",
});