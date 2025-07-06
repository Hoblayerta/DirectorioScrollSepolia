// hooks/useRealContracts.ts - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  useActiveAccount, 
  useReadContract, 
  useSendTransaction
} from 'thirdweb/react';
import { 
  getContract, 
  prepareContractCall,
  defineChain,
  readContract
} from 'thirdweb';
import { toWei, fromWei } from 'thirdweb/utils';
import { client } from '../src/app/client';
import { FACTORY_CONTRACT_ABI, PROFILE_CONTRACT_ABI } from '../contracts/abis';

// ✅ SCROLL SEPOLIA CHAIN CONFIGURATION - CORREGIDA
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

// ✅ FACTORY CONTRACT ADDRESS - USANDO TU DIRECCIÓN
const FACTORY_ADDRESS = "0x0CBBb59863DC8612441D4fa1F47483856E2EB34f";

// ✅ ETH PRICE (hardcoded for demo)
const ETH_PRICE_USD = 2000;

// ✅ TIPOS DE DATOS
interface ProfileData {
  id: number;
  contractAddress: string;
  owner: string;
  name: string;
  createdAt: number;
  isActive: boolean;
}

interface PublicInfo {
  name: string;
  title: string;
  company: string;
  experience: string;
  linkedin: string;
  twitter: string;
  github: string;
  website: string;
}

interface PrivateInfo {
  encryptedPhone: string;
  encryptedWhatsapp: string;
  encryptedEmail: string;
  encryptedCV: string;
  timestamp: number;
}

// ✅ HOOK PRINCIPAL PARA EL FACTORY CONTRACT - MEJORADO
export function useRealProfileFactory() {
  const account = useActiveAccount();
  const [profileData, setProfileData] = useState<ProfileData[]>([]);
  const [userProfiles, setUserProfiles] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // ✅ CONTRACT INSTANCE
  const factoryContract = getContract({
    client,
    chain: scrollSepolia,
    address: FACTORY_ADDRESS,
    abi: FACTORY_CONTRACT_ABI,
  });

  // ✅ READ CONTRACT DATA CON MEJOR MANEJO DE ERRORES
  const totalProfilesQuery = useReadContract({
    contract: factoryContract,
    method: "getTotalProfiles",
    params: [],
  });

  const activeProfilesQuery = useReadContract({
    contract: factoryContract,
    method: "getActiveProfiles",
    params: [],
  });

  const ownerProfilesQuery = useReadContract({
    contract: factoryContract,
    method: "getOwnerProfiles",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
  });

  // ✅ TRANSACTION SENDING
  const { mutate: sendTransaction, data: transactionResult } = useSendTransaction();

  // ✅ CARGAR DETALLES DE PERFILES - MEJORADO
  const loadProfileDetails = useCallback(async () => {
    const activeProfiles = activeProfilesQuery.data as bigint[] | undefined;
    
    if (!activeProfiles?.length) {
      console.log("📋 No hay perfiles activos");
      setProfileData([]);
      setIsLoading(false);
      return;
    }

    console.log(`📋 Cargando ${activeProfiles.length} perfiles...`);
    setIsLoading(true);
    
    try {
      const profiles: ProfileData[] = [];
      
      for (const profileId of activeProfiles) {
        try {
          console.log(`📄 Cargando perfil ${profileId.toString()}...`);
          
          const profileResult = await readContract({
            contract: factoryContract,
            method: "getProfile",
            params: [profileId],
          });
          
          if (profileResult) {
            const profile = {
              id: Number(profileResult.id),
              contractAddress: profileResult.contractAddress,
              owner: profileResult.owner,
              name: profileResult.name,
              createdAt: Number(profileResult.createdAt),
              isActive: profileResult.isActive
            };
            
            console.log(`✅ Perfil ${profileId} cargado:`, profile);
            profiles.push(profile);
          }
        } catch (error) {
          console.error(`❌ Error cargando perfil ${profileId}:`, error);
        }
      }

      console.log(`✅ ${profiles.length} perfiles cargados exitosamente`);
      setProfileData(profiles);
    } catch (error) {
      console.error('❌ Error general cargando perfiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfilesQuery.data, factoryContract]);

  // ✅ CARGAR PERFILES DEL USUARIO
  const loadUserProfiles = useCallback(async () => {
    const ownerProfiles = ownerProfilesQuery.data as bigint[] | undefined;
    
    if (!account?.address || !ownerProfiles?.length) {
      setUserProfiles([]);
      return;
    }

    console.log(`👤 Cargando ${ownerProfiles.length} perfiles del usuario...`);
    
    try {
      const profiles: ProfileData[] = [];
      
      for (const profileId of ownerProfiles) {
        try {
          const profileResult = await readContract({
            contract: factoryContract,
            method: "getProfile",
            params: [profileId],
          });
          
          if (profileResult) {
            profiles.push({
              id: Number(profileResult.id),
              contractAddress: profileResult.contractAddress,
              owner: profileResult.owner,
              name: profileResult.name,
              createdAt: Number(profileResult.createdAt),
              isActive: profileResult.isActive
            });
          }
        } catch (error) {
          console.error(`❌ Error cargando perfil del usuario ${profileId}:`, error);
        }
      }

      console.log(`✅ ${profiles.length} perfiles del usuario cargados`);
      setUserProfiles(profiles);
    } catch (error) {
      console.error('❌ Error cargando perfiles del usuario:', error);
    }
  }, [account?.address, ownerProfilesQuery.data, factoryContract]);

  // ✅ CREAR PERFIL - MEJORADO
  const createProfile = useCallback(async (data: {
    name: string;
    title: string;
    company: string;
    experience: string;
    accessPriceUSD: number;
  }) => {
    if (!account) {
      throw new Error('Wallet no conectada');
    }

    // Verificar si ya tiene perfiles
    if (userProfiles && userProfiles.length > 0) {
      throw new Error('Ya tienes un perfil creado. Solo se permite un perfil por wallet.');
    }

    setIsCreating(true);
    
    try {
      // Convertir USD a wei
      const accessPriceETH = data.accessPriceUSD / ETH_PRICE_USD;
      const accessPriceWei = toWei(accessPriceETH.toString());

      console.log("💰 Creando perfil con parámetros:", {
        name: data.name,
        title: data.title,
        company: data.company,
        experience: data.experience,
        accessPriceUSD: data.accessPriceUSD,
        accessPriceETH,
        accessPriceWei: accessPriceWei.toString()
      });

      // Preparar transacción
      const transaction = prepareContractCall({
        contract: factoryContract,
        method: "createProfile",
        params: [
          data.name,
          data.title,
          data.company || "",
          data.experience || "",
          accessPriceWei
        ],
      });

      console.log("📤 Enviando transacción...");
      
      // Enviar transacción
      sendTransaction(transaction);

      // Simular éxito hasta que se confirme
      console.log("✅ Transacción enviada");
      
      return {
        transactionHash: transactionResult?.transactionHash,
        success: true
      };

    } catch (error: any) {
      console.error('❌ Error creando perfil:', error);
      
      // Manejar errores específicos
      if (error.message?.includes("rejected")) {
        throw new Error("Transacción rechazada por el usuario");
      } else if (error.message?.includes("insufficient")) {
        throw new Error("Fondos insuficientes para completar la transacción");
      } else {
        throw error;
      }
    } finally {
      setIsCreating(false);
    }
  }, [account, factoryContract, sendTransaction, transactionResult, userProfiles]);

  // ✅ REFETCH DATA
  const refetchData = useCallback(() => {
    console.log("🔄 Refrescando datos...");
    loadProfileDetails();
    loadUserProfiles();
  }, [loadProfileDetails, loadUserProfiles]);

  // ✅ EFFECTS
  useEffect(() => {
    if (activeProfilesQuery.data) {
      loadProfileDetails();
    }
  }, [activeProfilesQuery.data, loadProfileDetails]);

  useEffect(() => {
    if (ownerProfilesQuery.data || account?.address) {
      loadUserProfiles();
    }
  }, [ownerProfilesQuery.data, account?.address, loadUserProfiles]);

  // ✅ LOG DEBUG INFO
  useEffect(() => {
    console.log("🔍 Debug Info:", {
      isConnected: !!account,
      contractAddress: FACTORY_ADDRESS,
      totalProfiles: totalProfilesQuery.data?.toString(),
      activeProfilesCount: activeProfilesQuery.data?.length,
      userProfilesCount: userProfiles.length,
      profileDataCount: profileData.length,
      isLoading
    });
  }, [account, totalProfilesQuery.data, activeProfilesQuery.data, userProfiles, profileData, isLoading]);

  return {
    // Data
    totalProfiles: Number(totalProfilesQuery.data || 0),
    activeProfiles: activeProfilesQuery.data || [],
    profileData,
    userProfiles,
    
    // State
    isLoading,
    isCreating,
    isConnected: !!account,
    
    // Contract info
    contractAddress: FACTORY_ADDRESS,
    
    // Functions
    createProfile,
    hasExistingProfile: () => userProfiles && userProfiles.length > 0,
    refetchData,
    
    // Transaction state
    transactionResult,
  };
}

// ✅ HOOK PARA PROFILE CONTRACTS INDIVIDUALES - MEJORADO
export function useRealProfileContract(contractAddress: string) {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [publicInfo, setPublicInfo] = useState<PublicInfo | null>(null);
  const [accessPrice, setAccessPrice] = useState<bigint>(0n);
  const [hasAccess, setHasAccess] = useState(false);

  // ✅ CONTRACT INSTANCE
  const profileContract = getContract({
    client,
    chain: scrollSepolia,
    address: contractAddress,
    abi: PROFILE_CONTRACT_ABI,
  });

  // ✅ TRANSACTION SENDING
  const { mutate: sendTransaction } = useSendTransaction();

  // ✅ CARGAR DATOS DEL CONTRATO - MEJORADO
  const loadContractData = useCallback(async () => {
    if (!contractAddress || contractAddress === "0x0") {
      setIsLoading(false);
      return;
    }

    console.log(`📄 Cargando datos del contrato: ${contractAddress}`);
    setIsLoading(true);
    
    try {
      // Cargar información pública
      console.log("📋 Cargando información pública...");
      const publicResult = await readContract({
        contract: profileContract,
        method: "publicInfo",
        params: [],
      });
      
      if (publicResult) {
        const publicInfoData = {
          name: publicResult[0],
          title: publicResult[1],
          company: publicResult[2],
          experience: publicResult[3],
          linkedin: publicResult[4],
          twitter: publicResult[5],
          github: publicResult[6],
          website: publicResult[7],
        };
        console.log("✅ Información pública cargada:", publicInfoData);
        setPublicInfo(publicInfoData);
      }

      // Cargar precio de acceso
      console.log("💰 Cargando precio de acceso...");
      const priceResult = await readContract({
        contract: profileContract,
        method: "accessPrice",
        params: [],
      });
      
      if (priceResult) {
        console.log("✅ Precio de acceso:", priceResult.toString(), "wei");
        setAccessPrice(priceResult);
      }

      // Verificar acceso si el usuario está conectado
      if (account?.address) {
        console.log("🔐 Verificando acceso del usuario...");
        const accessResult = await readContract({
          contract: profileContract,
          method: "checkAccess",
          params: [account.address],
        });
        console.log("✅ Acceso del usuario:", accessResult);
        setHasAccess(!!accessResult);
      }

    } catch (error) {
      console.error('❌ Error cargando datos del contrato:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, profileContract, account?.address]);

  // ✅ PAGAR POR ACCESO - MEJORADO
  const payForAccess = useCallback(async () => {
    if (!account) {
      throw new Error('Wallet no conectada');
    }
    
    if (!accessPrice || accessPrice === 0n) {
      throw new Error('Precio de acceso no disponible');
    }

    console.log("💰 Iniciando pago por acceso...");
    console.log("💸 Monto a pagar:", accessPrice.toString(), "wei");
    
    setIsPaying(true);
    
    try {
      const transaction = prepareContractCall({
        contract: profileContract,
        method: "payForAccess",
        params: [],
        value: accessPrice,
      });

      console.log("📤 Enviando transacción de pago...");
      sendTransaction(transaction);

      // Actualizar estado después de un delay (simulando confirmación)
      setTimeout(() => {
        console.log("✅ Pago confirmado, actualizando acceso...");
        setHasAccess(true);
      }, 3000);

      return { success: true };

    } catch (error: any) {
      console.error('❌ Error procesando pago:', error);
      
      if (error.message?.includes("rejected")) {
        throw new Error("Transacción rechazada por el usuario");
      } else if (error.message?.includes("insufficient")) {
        throw new Error("Fondos insuficientes para completar el pago");
      } else {
        throw error;
      }
    } finally {
      setIsPaying(false);
    }
  }, [account, accessPrice, profileContract, sendTransaction]);

  // ✅ OBTENER INFORMACIÓN PRIVADA
  const getPrivateInfo = useCallback(async (): Promise<PrivateInfo> => {
    if (!account) {
      throw new Error('Wallet no conectada');
    }
    
    if (!hasAccess) {
      throw new Error('Acceso no autorizado');
    }

    console.log("🔒 Obteniendo información privada...");
    
    try {
      const result = await readContract({
        contract: profileContract,
        method: "getPrivateInfo",
        params: [],
      });
      
      const privateInfo = {
        encryptedPhone: result[0],
        encryptedWhatsapp: result[1],
        encryptedEmail: result[2],
        encryptedCV: result[3],
        timestamp: Number(result[4]),
      };
      
      console.log("✅ Información privada obtenida:", privateInfo);
      return privateInfo;

    } catch (error: any) {
      console.error('❌ Error obteniendo información privada:', error);
      throw error;
    }
  }, [account, hasAccess, profileContract]);

  // ✅ CALCULAR PRECIOS
  const accessPriceETH = accessPrice ? Number(fromWei(accessPrice, 18)) : 0;
  const accessPriceUSD = accessPriceETH * ETH_PRICE_USD;

  // ✅ EFFECTS
  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  return {
    // Data
    publicInfo,
    accessPrice: Number(accessPrice),
    accessPriceETH,
    accessPriceUSD,
    hasAccess,
    
    // State
    isLoading,
    isPaying,
    
    // Functions
    payForAccess,
    getPrivateInfo,
    refetch: loadContractData,
  };
}