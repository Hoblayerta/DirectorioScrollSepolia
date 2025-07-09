// src/app/page.tsx - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { useState } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import CustomConnectButton from "../../components/ConnectButton";
import CreateProfile from "../../components/CreateProfile";
import ProfileList from "../../components/ProfileList";
import { useRealProfileFactory } from "../../hooks/useRealContracts";
import { Plus, Users, Zap, Shield, Globe, ExternalLink, AlertCircle } from 'lucide-react';

export default function Home() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { totalProfiles, isConnected, contractAddress } = useRealProfileFactory();
  const [activeTab, setActiveTab] = useState<'directory' | 'create'>('directory');

  const isWalletConnected = !!account;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  DirectorioPro Web3
                </h1>
                <p className="text-sm text-gray-600">
                  Perfiles profesionales en Scroll Sepolia
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="hidden md:flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Conectado a blockchain
                </div>
              )}
              <CustomConnectButton />
            </div>
          </div>
        </div>
      </header>

      {!isWalletConnected ? (
        // Página de bienvenida para usuarios no conectados
        
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">🚀</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              El Futuro de los Perfiles Profesionales
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Crea tu perfil profesional en la blockchain de Scroll Sepolia. Controla tu información, 
              monetiza tu experiencia y conecta directamente con quien necesite tus servicios.
            </p>
                        
            {/* Información técnica */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🔗 Información Técnica
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Red:</strong> Scroll Sepolia Testnet (Chain ID: 534351)</p>
                <p><strong>Factory Contract:</strong> 
                  <a 
                    href={`https://sepolia.scrollscan.dev/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline ml-1"
                  >
                    {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}
                    <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                </p>
                <p><strong>Total Perfiles:</strong> {totalProfiles}</p>
                <p><strong>Estado:</strong> ✅ Smart contracts activos</p>
              </div>
            </div>

            <div className="flex justify-center">
              <CustomConnectButton />
            </div>
          </div>

          {/* Características principales */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                100% Descentralizado
              </h3>
              <p className="text-gray-600">
                Tu información está en Scroll Sepolia. Nadie puede censurarte o eliminar tu perfil.
                Datos verificables en blockchain.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monetiza tu Experiencia
              </h3>
              <p className="text-gray-600">
                Establece un precio en ETH para acceder a tu información de contacto. 
                Recibe pagos directamente en tu wallet.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Global
              </h3>
              <p className="text-gray-600">
                Tu perfil es accesible desde cualquier parte del mundo via blockchain.
                Smart contracts garantizan la permanencia.
              </p>
            </div>
          </div>

          {/* Estadísticas en tiempo real */}
          <div className="bg-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Únete a la Revolución Blockchain
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {totalProfiles || 0}
                </div>
                <div className="text-gray-600">Perfiles en Blockchain</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  100%
                </div>
                <div className="text-gray-600">Privacidad Garantizada</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  24/7
                </div>
                <div className="text-gray-600">Disponible</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Datos en tiempo real desde Scroll Sepolia • 
                <a 
                  href="https://sepolia.scrollscan.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Ver en Explorer
                </a>
              </p>
            </div>
          </div>
        </main>
      ) : (
        // Aplicación principal para usuarios conectados
        <>
          {/* Información de conexión */}
          <div className="bg-green-50 border-b border-green-200">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Conectado a Scroll Sepolia</span>
                  <span className="mx-2">•</span>
                  <span>Wallet: {account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                </div>
                <a
                  href={`https://sepolia.scrollscan.dev/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm flex items-center"
                >
                  Ver Factory Contract
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        
          {/* Navigation */}
          <nav className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('directory')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'directory' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Directorio ({totalProfiles || 0})
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'create' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Crear Perfil
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-6xl mx-auto px-4 py-8">
            {activeTab === 'directory' ? (
              <div>
                {/* Header de bienvenida para usuarios conectados */}
                {totalProfiles === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-2xl">👋</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          ¡Bienvenido a DirectorioPro Web3!
                        </h3>
                        <p className="text-blue-800 mb-4">
                          Tu wallet está conectada a Scroll Sepolia. Ahora puedes explorar perfiles 
                          profesionales o crear el tuyo propio en la blockchain.
                        </p>
                        <div className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <p><strong>Wallet:</strong> {account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                          <p><strong>Red:</strong> Scroll Sepolia</p>
                          <p><strong>Estado:</strong> ✅ Conectado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <ProfileList />
              </div>
            ) : (
              <CreateProfile 
                onSuccess={() => setActiveTab('directory')}
                onCancel={() => setActiveTab('directory')}
              />
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">D</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">DirectorioPro Web3</div>
                <div className="text-sm text-gray-600">Construido en Scroll Sepolia</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              {contractAddress && (
                <a 
                  href={`https://sepolia.scrollscan.dev/address/${contractAddress}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Contrato
                </a>
              )}
              <span>•</span>
              <span>Powered by ThirdWeb v5</span>
              <span>•</span>
              <span className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
          
          {/* Información técnica adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong>Chain ID:</strong> 534351
              </div>
              <div>
                <strong>RPC:</strong> sepolia-rpc.scroll.io
              </div>
              <div>
                <strong>Perfiles:</strong> {totalProfiles || 0}
              </div>
              <div>
                <strong>Version:</strong> v1.0.0
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}