// hooks/useRealContracts.ts - CREAR ESTE ARCHIVO NUEVO
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  useActiveAccount, 
  useReadContract, 
  useSendTransaction,
  useWaitForReceipt 
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

// ✅ SCROLL SEPOLIA CHAIN CONFIGURATION
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

// ✅ FACTORY CONTRACT ADDRESS
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS || "0x0CBBb59863DC8612441D4fa1F47483856E2EB34f";

// ✅ ETH PRICE (hardcoded for demo, in production use a price API)
const ETH_PRICE_USD = 2000;

// ✅ INTERFACE TYPES
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

// ✅ HOOK PRINCIPAL PARA EL FACTORY CONTRACT
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

  // ✅ READ TOTAL PROFILES
  const { data: totalProfiles } = useReadContract({
    contract: factoryContract,
    method: "getTotalProfiles",
    params: [],
  });

  // ✅ READ ACTIVE PROFILES
  const { data: activeProfiles } = useReadContract({
    contract: factoryContract,
    method: "getActiveProfiles",
    params: [],
  });

  // ✅ READ USER PROFILES
  const { data: ownerProfiles } = useReadContract({
    contract: factoryContract,
    method: "getOwnerProfiles",
    params: [account?.address || "0x0"],
  });

  // ✅ TRANSACTION SENDING
  const { mutate: sendTransaction, data: transactionResult } = useSendTransaction();

  // ✅ WAIT FOR RECEIPT
  const { data: receipt } = useWaitForReceipt({
    client,
    chain: scrollSepolia,
    transactionHash: transactionResult?.transactionHash,
  });

  // ✅ LOAD PROFILE DETAILS
  const loadProfileDetails = useCallback(async () => {
    if (!activeProfiles?.length) return;

    setIsLoading(true);
    try {
      const profiles: ProfileData[] = [];
      
      for (const profileId of activeProfiles) {
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
          console.error(`Error loading profile ${profileId}:`, error);
        }
      }

      setProfileData(profiles);
    } catch (error) {
      console.error('Error loading profile details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfiles, factoryContract]);

  // ✅ LOAD USER PROFILES
  const loadUserProfiles = useCallback(async () => {
    if (!account?.address || !ownerProfiles?.length) {
      setUserProfiles([]);
      return;
    }

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
          console.error(`Error loading user profile ${profileId}:`, error);
        }
      }

      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }, [account?.address, ownerProfiles, factoryContract]);

  // ✅ CREATE PROFILE FUNCTION
  const createProfile = useCallback(async (data: {
    name: string;
    title: string;
    company: string;
    experience: string;
    accessPriceUSD: number;
  }) => {
    if (!account) throw new Error('Wallet not connected');

    setIsCreating(true);
    try {
      // Convert USD to wei (using ETH price)
      const accessPriceETH = data.accessPriceUSD / ETH_PRICE_USD;
      const accessPriceWei = toWei(accessPriceETH.toString());

      console.log("💰 Creating profile with:", {
        name: data.name,
        title: data.title,
        company: data.company,
        experience: data.experience,
        accessPriceUSD: data.accessPriceUSD,
        accessPriceETH,
        accessPriceWei: accessPriceWei.toString()
      });

      // Prepare the transaction
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

      // Send transaction
      sendTransaction(transaction);

      // Return transaction info
      return {
        transactionHash: transactionResult?.transactionHash,
        success: true
      };

    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [account, factoryContract, sendTransaction, transactionResult]);

  // ✅ REFETCH DATA
  const refetchData = useCallback(() => {
    loadProfileDetails();
    loadUserProfiles();
  }, [loadProfileDetails, loadUserProfiles]);

  // ✅ EFFECTS
  useEffect(() => {
    loadProfileDetails();
  }, [loadProfileDetails]);

  useEffect(() => {
    loadUserProfiles();
  }, [loadUserProfiles]);

  // ✅ RETURN HOOK STATE
  return {
    // Data
    totalProfiles: Number(totalProfiles || 0),
    activeProfiles: activeProfiles || [],
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
    receipt,
  };
}

// ✅ HOOK PARA INDIVIDUAL PROFILE CONTRACTS
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

  // ✅ LOAD CONTRACT DATA
  const loadContractData = useCallback(async () => {
    if (!contractAddress || contractAddress === "0x0") return;

    setIsLoading(true);
    try {
      // Load public info
      const publicResult = await readContract({
        contract: profileContract,
        method: "publicInfo",
        params: [],
      });
      if (publicResult) {
        setPublicInfo({
          name: publicResult[0],
          title: publicResult[1],
          company: publicResult[2],
          experience: publicResult[3],
          linkedin: publicResult[4],
          twitter: publicResult[5],
          github: publicResult[6],
          website: publicResult[7],
        });
      }

      // Load access price
      const priceResult = await readContract({
        contract: profileContract,
        method: "accessPrice",
        params: [],
      });
      if (priceResult) {
        setAccessPrice(priceResult);
      }

      // Check access if user is connected
      if (account?.address) {
        const accessResult = await readContract({
          contract: profileContract,
          method: "checkAccess",
          params: [account.address],
        });
        setHasAccess(!!accessResult);
      }

    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, profileContract, account?.address]);

  // ✅ PAY FOR ACCESS
  const payForAccess = useCallback(async () => {
    if (!account) throw new Error('Wallet not connected');
    if (!accessPrice) throw new Error('Access price not loaded');

    setIsPaying(true);
    try {
      const transaction = prepareContractCall({
        contract: profileContract,
        method: "payForAccess",
        params: [],
        value: accessPrice,
      });

      sendTransaction(transaction);

      // Update access status after successful payment
      setTimeout(() => {
        setHasAccess(true);
      }, 3000);

      return { success: true };

    } catch (error: any) {
      console.error('❌ Error paying for access:', error);
      throw error;
    } finally {
      setIsPaying(false);
    }
  }, [account, accessPrice, profileContract, sendTransaction]);

  // ✅ GET PRIVATE INFO
  const getPrivateInfo = useCallback(async (): Promise<PrivateInfo> => {
    if (!account) throw new Error('Wallet not connected');
    if (!hasAccess) throw new Error('Access not granted');

    try {
      const result = await readContract({
        contract: profileContract,
        method: "getPrivateInfo",
        params: [],
      });
      
      return {
        encryptedPhone: result[0],
        encryptedWhatsapp: result[1],
        encryptedEmail: result[2],
        encryptedCV: result[3],
        timestamp: Number(result[4]),
      };

    } catch (error: any) {
      console.error('❌ Error getting private info:', error);
      throw error;
    }
  }, [account, hasAccess, profileContract]);

  // ✅ CALCULATE PRICES
  const accessPriceETH = Number(fromWei(accessPrice, 18));
  const accessPriceUSD = accessPriceETH * ETH_PRICE_USD;

  // ✅ EFFECTS
  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  // ✅ RETURN HOOK STATE
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