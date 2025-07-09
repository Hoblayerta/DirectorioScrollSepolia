// hooks/useRealContracts.ts - VERSIÓN BALANCEADA QUE FUNCIONA
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
import { toWei, toEther } from 'thirdweb/utils';
import { client } from '../src/app/client';
import { FACTORY_CONTRACT_ABI, PROFILE_CONTRACT_ABI } from '../contracts/abis';

// ✅ SCROLL SEPOLIA CHAIN
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

const FACTORY_ADDRESS = "0x0CBBb59863DC8612441D4fa1F47483856E2EB34f";
const ETH_PRICE_USD = 2500;

// ✅ TIPOS
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

// ✅ FUNCIÓN PARA DELAY MÁS CORTO
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ✅ HOOK PRINCIPAL DEL FACTORY - VERSIÓN BALANCEADA
export function useRealProfileFactory() {
  const account = useActiveAccount();
  const [profileData, setProfileData] = useState<ProfileData[]>([]);
  const [userProfiles, setUserProfiles] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const factoryContract = getContract({
    client,
    chain: scrollSepolia,
    address: FACTORY_ADDRESS,
    abi: FACTORY_CONTRACT_ABI,
  });

  const { data: totalProfilesData } = useReadContract({
    contract: factoryContract,
    method: "getTotalProfiles",
    params: [],
  });

  const { data: activeProfilesData } = useReadContract({
    contract: factoryContract,
    method: "getActiveProfiles", 
    params: [],
  });

  const { data: ownerProfilesData } = useReadContract({
    contract: factoryContract,
    method: "getOwnerProfiles",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
  });

  const { mutate: sendTransaction } = useSendTransaction();

  // ✅ CARGAR DETALLES CON BALANCE ENTRE VELOCIDAD Y ESTABILIDAD
  const loadProfileDetails = useCallback(async () => {
    if (!activeProfilesData || activeProfilesData.length === 0) {
      console.log("📋 No hay perfiles activos para cargar");
      setProfileData([]);
      setIsLoading(false);
      return;
    }

    console.log(`📋 Cargando ${activeProfilesData.length} perfiles activos...`);
    setIsLoading(true);
    
    try {
      const profiles: ProfileData[] = [];
      
      // ✅ CARGAR EN LOTES PEQUEÑOS PERO EFICIENTES
      const batchSize = 2; // Lotes de 2 perfiles
      const maxProfiles = Math.min(activeProfilesData.length, 15); // Máximo 15 perfiles
      
      for (let i = 0; i < maxProfiles; i += batchSize) {
        const batch = activeProfilesData.slice(i, i + batchSize);
        
        // ✅ PROCESAR CADA LOTE EN PARALELO (PERO LOTES SECUENCIALES)
        const batchPromises = batch.map(async (profileId) => {
          try {
            console.log(`📄 Cargando perfil ID: ${profileId.toString()}`);
            
            const profileResult = await readContract({
              contract: factoryContract,
              method: "getProfile",
              params: [profileId],
            });
            
            if (profileResult && profileResult.isActive) {
              const profile = {
                id: Number(profileResult.id),
                contractAddress: profileResult.contractAddress,
                owner: profileResult.owner,
                name: profileResult.name,
                createdAt: Number(profileResult.createdAt),
                isActive: profileResult.isActive
              };
              
              console.log(`✅ Perfil ${profileId} cargado:`, profile.name);
              return profile;
            }
            return null;
          } catch (error) {
            console.error(`❌ Error cargando perfil ${profileId}:`, error);
            return null;
          }
        });
        
        // ✅ ESPERAR EL LOTE ACTUAL
        const batchResults = await Promise.all(batchPromises);
        const validProfiles = batchResults.filter(p => p !== null) as ProfileData[];
        profiles.push(...validProfiles);
        
        // ✅ PAUSA BREVE ENTRE LOTES (NO ENTRE CADA PERFIL)
        if (i + batchSize < maxProfiles) {
          await delay(300); // Solo 300ms entre lotes
        }
      }

      console.log(`✅ Total perfiles cargados: ${profiles.length}`);
      setProfileData(profiles);
    } catch (error) {
      console.error('❌ Error general:', error);
      setProfileData([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfilesData, factoryContract]);

  const loadUserProfiles = useCallback(async (): Promise<ProfileData[]> => {
    if (!account?.address || !ownerProfilesData || ownerProfilesData.length === 0) {
      setUserProfiles([]);
      return [];
    }

    console.log(`👤 Usuario tiene ${ownerProfilesData.length} perfiles`);
    
    try {
      const profiles: ProfileData[] = [];
      
      // ✅ CARGAR PERFILES DE USUARIO EN PARALELO (SON POCOS)
      const profilePromises = ownerProfilesData.map(async (profileId) => {
        try {
          const profileResult = await readContract({
            contract: factoryContract,
            method: "getProfile",
            params: [profileId],
          });
          
          if (profileResult) {
            return {
              id: Number(profileResult.id),
              contractAddress: profileResult.contractAddress,
              owner: profileResult.owner,
              name: profileResult.name,
              createdAt: Number(profileResult.createdAt),
              isActive: profileResult.isActive
            };
          }
          return null;
        } catch (error) {
          console.error(`❌ Error perfil usuario ${profileId}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(profilePromises);
      const validProfiles = results.filter(p => p !== null) as ProfileData[];
      profiles.push(...validProfiles);

      console.log(`✅ Perfiles usuario cargados: ${profiles.length}`);
      setUserProfiles(profiles);
      return profiles;
    } catch (error) {
      console.error('❌ Error perfiles usuario:', error);
      setUserProfiles([]);
      return [];
    }
  }, [account?.address, ownerProfilesData, factoryContract]);

  const createProfile = useCallback(async (data: {
    name: string;
    title: string;
    company: string;
    experience: string;
    accessPriceUSD: number;
    privateInfo?: {
      phone: string;
      whatsapp: string;
      email: string;
      fullCV: string;
    };
  }) => {
    if (!account) throw new Error('Wallet no conectada');

    if (userProfiles && userProfiles.length > 0) {
      throw new Error('Ya tienes un perfil. Solo un perfil por wallet.');
    }

    setIsCreating(true);
    
    try {
      const accessPriceETH = data.accessPriceUSD / ETH_PRICE_USD;
      const accessPriceWei = toWei(accessPriceETH.toString());

      console.log("💰 Creando perfil:", data.name, "Precio:", accessPriceETH, "ETH");

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

      return new Promise((resolve, reject) => {
        sendTransaction(transaction, {
          onSuccess: async (result) => {
            console.log("✅ Perfil creado, TX:", result.transactionHash);
            
            if (data.privateInfo && (data.privateInfo.phone || data.privateInfo.email || data.privateInfo.fullCV)) {
              console.log("🔒 Esperando para actualizar información privada...");
              
              setTimeout(async () => {
                try {
                  await updatePrivateInfoAfterCreation(data.privateInfo!);
                  console.log("🔒✅ Información privada actualizada");
                } catch (error) {
                  console.error("🔒❌ Error actualizando información privada:", error);
                }
              }, 12000);
            }
            
            resolve({ 
              success: true, 
              transactionHash: result.transactionHash 
            });
          },
          onError: (error) => {
            console.error('❌ Error creando perfil:', error);
            reject(error);
          }
        });
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [account, factoryContract, sendTransaction, userProfiles]);

  const updatePrivateInfoAfterCreation = async (privateInfo: {
    phone: string;
    whatsapp: string;
    email: string;
    fullCV: string;
  }) => {
    if (!account?.address) return;

    try {
      const currentUserProfiles = await readContract({
        contract: factoryContract,
        method: "getOwnerProfiles",
        params: [account.address],
      });

      if (currentUserProfiles && currentUserProfiles.length > 0) {
        const latestProfileId = currentUserProfiles[currentUserProfiles.length - 1];
        
        const profileResult = await readContract({
          contract: factoryContract,
          method: "getProfile",
          params: [latestProfileId],
        });

        if (profileResult && profileResult.contractAddress) {
          console.log("📄 Actualizando información privada en:", profileResult.contractAddress);
          
          const profileContract = getContract({
            client,
            chain: scrollSepolia,
            address: profileResult.contractAddress,
            abi: PROFILE_CONTRACT_ABI,
          });

          const updateTransaction = prepareContractCall({
            contract: profileContract,
            method: "updatePrivateInfo",
            params: [{
              encryptedPhone: privateInfo.phone || "",
              encryptedWhatsapp: privateInfo.whatsapp || "",
              encryptedEmail: privateInfo.email || "",
              encryptedCV: privateInfo.fullCV || "",
              timestamp: Math.floor(Date.now() / 1000)
            }],
          });

          return new Promise((resolve, reject) => {
            sendTransaction(updateTransaction, {
              onSuccess: (updateResult) => {
                console.log("🔒✅ Información privada guardada, TX:", updateResult.transactionHash);
                resolve(updateResult);
              },
              onError: (updateError) => {
                console.error("🔒❌ Error guardando información privada:", updateError);
                reject(updateError);
              }
            });
          });
        }
      }
    } catch (error) {
      console.error("❌ Error en actualización privada:", error);
      throw error;
    }
  };

  const refetchData = useCallback(() => {
    console.log("🔄 Refrescando datos...");
    // Forzar recarga inmediata
    loadProfileDetails();
    loadUserProfiles();
  }, [loadProfileDetails, loadUserProfiles]);

  // ✅ CARGAR DATOS CON MENOS DELAY
  useEffect(() => {
    if (activeProfilesData !== undefined) {
      setTimeout(() => {
        loadProfileDetails();
      }, 500); // Reducido a 500ms
    }
  }, [activeProfilesData]);

  useEffect(() => {
    if (ownerProfilesData !== undefined) {
      setTimeout(() => {
        loadUserProfiles();
      }, 800); // Reducido a 800ms
    }
  }, [ownerProfilesData]);

  return {
    totalProfiles: Number(totalProfilesData || 0),
    activeProfiles: activeProfilesData || [],
    profileData,
    userProfiles,
    isLoading,
    isCreating,
    isConnected: !!account,
    contractAddress: FACTORY_ADDRESS,
    createProfile,
    hasExistingProfile: () => userProfiles && userProfiles.length > 0,
    refetchData,
  };
}

// ✅ HOOK PARA CONTRATOS INDIVIDUALES - MÁS RÁPIDO
export function useRealProfileContract(contractAddress: string) {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [publicInfo, setPublicInfo] = useState<PublicInfo | null>(null);
  const [accessPrice, setAccessPrice] = useState<bigint>(0n);
  const [hasAccess, setHasAccess] = useState(false);

  const profileContract = getContract({
    client,
    chain: scrollSepolia,
    address: contractAddress,
    abi: PROFILE_CONTRACT_ABI,
  });

  const { mutate: sendTransaction } = useSendTransaction();

  const loadContractData = useCallback(async () => {
    if (!contractAddress || contractAddress === "0x0" || contractAddress.length !== 42) {
      setIsLoading(false);
      return;
    }

    console.log(`📄 Cargando datos de contrato: ${contractAddress}`);
    setIsLoading(true);
    
    try {
      // ✅ CARGAR EN PARALELO PARA MAYOR VELOCIDAD
      const [publicResult, priceResult] = await Promise.all([
        readContract({
          contract: profileContract,
          method: "publicInfo",
          params: [],
        }),
        readContract({
          contract: profileContract,
          method: "accessPrice",
          params: [],
        })
      ]);
      
      if (publicResult) {
        const info = {
          name: publicResult[0] || "",
          title: publicResult[1] || "",
          company: publicResult[2] || "",
          experience: publicResult[3] || "",
          linkedin: publicResult[4] || "",
          twitter: publicResult[5] || "",
          github: publicResult[6] || "",
          website: publicResult[7] || "",
        };
        setPublicInfo(info);
        console.log(`✅ Info pública cargada para ${info.name}`);
      }

      if (priceResult) {
        setAccessPrice(priceResult);
        console.log(`💰 Precio: ${priceResult.toString()} wei`);
      }

      // ✅ VERIFICAR ACCESO SI HAY CUENTA
      if (account?.address) {
        try {
          const [accessResult, ownerResult] = await Promise.all([
            readContract({
              contract: profileContract,
              method: "hasAccess",
              params: [account.address],
            }),
            readContract({
              contract: profileContract,
              method: "owner",
              params: [],
            })
          ]);
          
          const isOwner = ownerResult.toLowerCase() === account.address.toLowerCase();
          const hasPaidAccess = !!accessResult;
          const finalAccess = isOwner || hasPaidAccess;
          
          setHasAccess(finalAccess);
          console.log(`🔐 Verificación de acceso:`);
          console.log(`  - Es owner: ${isOwner}`);
          console.log(`  - Pagó acceso: ${hasPaidAccess}`);
          console.log(`  - Acceso final: ${finalAccess}`);
        } catch (accessError) {
          console.error("❌ Error verificando acceso:", accessError);
          setHasAccess(false);
        }
      }

    } catch (error) {
      console.error(`❌ Error cargando ${contractAddress}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, profileContract, account?.address]);

  const payForAccess = useCallback(async () => {
    if (!account) throw new Error('Wallet no conectada');
    if (!accessPrice || accessPrice === 0n) throw new Error('Precio no disponible');

    setIsPaying(true);
    try {
      const transaction = prepareContractCall({
        contract: profileContract,
        method: "payForAccess",
        params: [],
        value: accessPrice,
      });

      return new Promise((resolve, reject) => {
        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Pago exitoso:", result.transactionHash);
            setHasAccess(true);
            setTimeout(() => loadContractData(), 3000); // Reducido a 3 segundos
            resolve({ success: true, transactionHash: result.transactionHash });
          },
          onError: (error) => {
            console.error('❌ Error en pago:', error);
            reject(error);
          }
        });
      });
    } catch (error: any) {
      console.error('❌ Error pago:', error);
      throw error;
    } finally {
      setIsPaying(false);
    }
  }, [account, accessPrice, profileContract, sendTransaction, loadContractData]);

  const getPrivateInfo = useCallback(async (): Promise<PrivateInfo> => {
    if (!account) throw new Error('Wallet no conectada');
    
    try {
      const [ownerResult, accessResult] = await Promise.all([
        readContract({
          contract: profileContract,
          method: "owner",
          params: [],
        }),
        readContract({
          contract: profileContract,
          method: "hasAccess",
          params: [account.address],
        })
      ]);
      
      const isOwner = ownerResult.toLowerCase() === account.address.toLowerCase();
      const hasPaidAccess = !!accessResult;
      
      console.log("🔍 Verificación de acceso para info privada:");
      console.log("  - Wallet:", account.address);
      console.log("  - Owner del contrato:", ownerResult);
      console.log("  - Es owner:", isOwner);
      console.log("  - Tiene acceso pagado:", hasPaidAccess);
      
      if (!isOwner && !hasPaidAccess) {
        throw new Error('Sin acceso - debes ser el owner o haber pagado por acceso');
      }
      
      const result = await readContract({
        contract: profileContract,
        method: "getPrivateInfo",
        params: [],
      });
      
      console.log("📋 Información privada obtenida:", result);
      
      return {
        encryptedPhone: result[0] || "Sin datos",
        encryptedWhatsapp: result[1] || "Sin datos", 
        encryptedEmail: result[2] || "Sin datos",
        encryptedCV: result[3] || "Sin datos",
        timestamp: Number(result[4]) || 0,
      };
    } catch (error: any) {
      console.error('❌ Error info privada:', error);
      throw error;
    }
  }, [account, profileContract]);

  const updatePrivateInfo = useCallback(async (privateInfo: {
    phone: string;
    whatsapp: string;
    email: string;
    fullCV: string;
  }) => {
    if (!account) throw new Error('Wallet no conectada');
    
    try {
      const ownerResult = await readContract({
        contract: profileContract,
        method: "owner",
        params: [],
      });
      
      const isOwner = ownerResult.toLowerCase() === account.address.toLowerCase();
      if (!isOwner) {
        throw new Error('Solo el propietario puede actualizar la información privada');
      }
      
      console.log("💾 Actualizando información privada en smart contract...");
      console.log("📋 Datos a enviar:", privateInfo);
      
      const privateInfoStruct = {
        encryptedPhone: privateInfo.phone || "",
        encryptedWhatsapp: privateInfo.whatsapp || "",
        encryptedEmail: privateInfo.email || "",
        encryptedCV: privateInfo.fullCV || "",
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      };
      
      console.log("🔧 Struct formateado:", privateInfoStruct);
      
      const transaction = prepareContractCall({
        contract: profileContract,
        method: "updatePrivateInfo",
        params: [privateInfoStruct],
      });
      
      console.log("📤 Enviando transacción...");
      
      return new Promise((resolve, reject) => {
        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Información privada actualizada, TX:", result.transactionHash);
            setTimeout(() => {
              resolve({ success: true, transactionHash: result.transactionHash });
            }, 2000); // Reducido a 2 segundos
          },
          onError: (error) => {
            console.error('❌ Error actualizando información privada:', error);
            reject(error);
          }
        });
      });
      
    } catch (error: any) {
      console.error('❌ Error actualizando información privada:', error);
      throw error;
    }
  }, [account, profileContract, sendTransaction]);

  const accessPriceETH = accessPrice ? Number(toEther(accessPrice)) : 0;
  const accessPriceUSD = accessPriceETH * ETH_PRICE_USD;

  // ✅ CARGAR DATOS INMEDIATAMENTE
  useEffect(() => {
    loadContractData();
  }, [contractAddress]);

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
    updatePrivateInfo,
    refetch: loadContractData,
  };
}