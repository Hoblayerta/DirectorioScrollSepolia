// components/ProfileList.tsx - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { useState, useEffect } from 'react';
import { useRealProfileFactory } from '../hooks/useRealContracts';
import ProfileCard from './ProfileCard';
import { Loader2, Users, Search, AlertCircle } from 'lucide-react';

export default function ProfileList() {
  const { 
    totalProfiles, 
    activeProfiles, 
    profileData,
    isLoading, 
    isConnected,
    contractAddress 
  } = useRealProfileFactory();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar perfiles por búsqueda
  const filteredProfiles = profileData.filter(profile =>
    profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile?.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfiles desde la blockchain...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando a Scroll Sepolia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas REALES */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Directorio de Profesionales
              </h2>
              <p className="text-gray-600">
                {totalProfiles} perfiles totales • {activeProfiles?.length || 0} activos
              </p>
              {isConnected && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ Conectado a Scroll Sepolia • {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {profileData.length}
            </div>
            <div className="text-sm text-gray-500">
              Perfiles cargados
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Estado de información de la blockchain */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">⛓️</span>
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Datos en Tiempo Real de la Blockchain
            </h4>
            <div className="text-sm text-blue-800 mt-1 space-y-1">
              <p><strong>Red:</strong> Scroll Sepolia (Chain ID: 534351)</p>
              <p><strong>Factory Contract:</strong> {contractAddress}</p>
              <p><strong>Perfiles Encontrados:</strong> {totalProfiles}</p>
              <p><strong>Estado:</strong> {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de perfiles REALES */}
      {!isConnected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-900 mb-2">
            Wallet no conectada
          </h3>
          <p className="text-yellow-800">
            Conecta tu wallet para ver los perfiles profesionales en la blockchain.
          </p>
        </div>
      ) : profileData.length === 0 && totalProfiles === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay perfiles en la blockchain
          </h3>
          <p className="text-gray-600 mb-4">
            Sé el primero en crear un perfil profesional descentralizado.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p><strong>Nota:</strong> Los perfiles se almacenan permanentemente en Scroll Sepolia.</p>
            <p>Una vez creados, estarán disponibles para siempre en la blockchain.</p>
          </div>
        </div>
      ) : profileData.length === 0 && totalProfiles > 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            Cargando perfiles...
          </h3>
          <p className="text-orange-800">
            Se encontraron {totalProfiles} perfiles. Cargando información desde los contratos...
          </p>
        </div>
      ) : (
        <>
          {/* Resultado de búsqueda */}
          {searchTerm && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Mostrando {filteredProfiles.length} de {profileData.length} perfiles
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
          )}

          {/* Grid de perfiles */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profileId={profile.id}
                contractAddress={profile.contractAddress}
                owner={profile.owner}
                name={profile.name}
                createdAt={profile.createdAt}
              />
            ))}
          </div>

          {/* Paginación futura */}
          {filteredProfiles.length > 9 && (
            <div className="text-center pt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Cargar más perfiles
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer de información técnica */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <strong>Total Profiles:</strong><br/>
            {totalProfiles}
          </div>
          <div>
            <strong>Active Profiles:</strong><br/>
            {activeProfiles?.length || 0}
          </div>
          <div>
            <strong>Loaded Data:</strong><br/>
            {profileData.length}
          </div>
          <div>
            <strong>Network:</strong><br/>
            Scroll Sepolia
          </div>
        </div>
      </div>
    </div>
  );
}