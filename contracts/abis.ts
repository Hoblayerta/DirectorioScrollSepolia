// contracts/abis.ts - CREAR ESTE ARCHIVO NUEVO
export const PROFILE_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_accessPrice",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "company",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "experience",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "linkedin",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "twitter",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "github",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "website",
            "type": "string"
          }
        ],
        "internalType": "struct ProfileContract.PublicInfo",
        "name": "_publicInfo",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "accessPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "checkAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPrivateInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "encryptedPhone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "encryptedWhatsapp",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "encryptedEmail",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "encryptedCV",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct ProfileContract.PrivateInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payForAccess",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "publicInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "company",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "experience",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "linkedin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "twitter",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "github",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "website",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "encryptedPhone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "encryptedWhatsapp",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "encryptedEmail",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "encryptedCV",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct ProfileContract.PrivateInfo",
        "name": "_privateInfo",
        "type": "tuple"
      }
    ],
    "name": "updatePrivateInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// ✅ FACTORY CONTRACT ABI REAL - DE TU SMART CONTRACT DESPLEGADO
export const FACTORY_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_company",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_experience",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_accessPrice",
        "type": "uint256"
      }
    ],
    "name": "createProfile",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalProfiles",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveProfiles",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "getOwnerProfiles",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_profileId",
        "type": "uint256"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct ProfileFactory.Profile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProfileCreated",
    "type": "event"
  }
] as const;