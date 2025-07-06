// components/ProfileCard.tsx - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRealProfileContract } from '../hooks/useRealContracts';
import { 
  User, 
  Building, 
  ExternalLink, 
  Lock, 
  Unlock, 
  DollarSign, 
  Phone, 
  MessageCircle,
  Mail,
  FileText,
  Loader2,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileCardProps {
  profileId: number;
  contractAddress: string;
  owner: string;
  name: string;
  createdAt: number;
}

export default function ProfileCard({ 
  profileId, 
  contractAddress, 
  owner, 
  name, 
  createdAt 
}: ProfileCardProps) {
  const account = useActiveAccount();
  const {
    publicInfo,
    accessPrice,
    accessPriceETH,
    accessPriceUSD,
    hasAccess,
    isLoading,
    isPaying,
    payForAccess,
    getPrivateInfo
  } = useRealProfileContract(contractAddress);

  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [privateData, setPrivateData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Verificar si el usuario actual es el dueño del perfil
  useEffect(() => {
    if (account && owner) {
      setIsOwner(account.address.toLowerCase() === owner.toLowerCase());
    }
  }, [account, owner]);

  const handlePayForAccess = async () => {
    try {
      console.log("💰 Iniciando pago por acceso...");
      console.log("📄 Contrato:", contractAddress);
      console.log("💸 Precio:", accessPriceETH, "ETH");

      const result = await payForAccess();
      console.log("✅ Pago exitoso:", result);
      
      setPaymentSuccess(true);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('❌ Error paying for access:', error);
      
      if (error.message && error.message.includes("rejected")) {
        alert('Transacción rechazada por el usuario.');
      } else if (error.message && error.message.includes("insufficient")) {
        alert('Fondos insuficientes para completar el pago.');
      } else {
        alert(`Error al procesar el pago: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  const handleViewPrivateInfo = async () => {
    setLoadingPrivate(true);
    try {
      console.log("👁️ Cargando información privada...");
      const data = await getPrivateInfo();
      console.log("📋 Datos privados obtenidos:", data);
      
      setPrivateData(data);
      setShowPrivateInfo(true);
    } catch (error: any) {
      console.error('❌ Error loading private info:', error);
      alert(`Error al cargar la información privada: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoadingPrivate(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatEthereumAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="text-xs text-gray-500 mt-2">
          Cargando desde blockchain...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(publicInfo?.name || name).charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">
                {publicInfo?.name || name}
              </h3>
              <p className="text-gray-600 text-sm">
                {publicInfo?.title || 'Profesional'}
              </p>
              {publicInfo?.company && (
                <p className="text-gray-500 text-xs flex items-center mt-1">
                  <Building className="w-3 h-3 mr-1" />
                  {publicInfo.company}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {isOwner && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Mi Perfil
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              ID #{profileId}
            </span>
          </div>
        </div>

        {/* Información pública de la blockchain */}
        {publicInfo?.experience && (
          <p className="text-gray-700 text-sm mb-4">
            {publicInfo.experience}
          </p>
        )}

        {/* Enlaces públicos de la blockchain */}
        {(publicInfo?.linkedin || publicInfo?.github || publicInfo?.website) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {publicInfo?.linkedin && (
              <a 
                href={publicInfo.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                LinkedIn
              </a>
            )}
            {publicInfo?.github && (
              <a 
                href={publicInfo.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 text-xs flex items-center"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                GitHub
              </a>
            )}
            {publicInfo?.website && (
              <a 
                href={publicInfo.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 text-xs flex items-center"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Información del contrato */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(createdAt)}
          </span>
          <a
            href={`https://sepolia.scrollscan.dev/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-blue-600 flex items-center"
          >
            {formatEthereumAddress(contractAddress)}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* Mensaje de pago exitoso */}
        {paymentSuccess && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              ¡Pago procesado! Actualizando acceso...
            </div>
          </div>
        )}

        {/* Sección de información privada */}
        {!isOwner && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {hasAccess ? (
                  <Unlock className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  {hasAccess ? 'Tienes acceso' : 'Información privada'}
                </span>
              </div>

              {!hasAccess ? (
                <button
                  onClick={handlePayForAccess}
                  disabled={isPaying || !account}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Pagando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${accessPriceUSD.toFixed(2)}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleViewPrivateInfo}
                  disabled={loadingPrivate}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {loadingPrivate ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Info
                    </>
                  )}
                </button>
              )}
            </div>

            {!hasAccess && accessPriceETH > 0 && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>~{accessPriceETH.toFixed(6)} ETH en Scroll Sepolia</p>
                <p>Precio del contrato: {accessPrice} wei</p>
              </div>
            )}
          </div>
        )}

        {/* Mostrar información privada si tiene acceso */}
        {showPrivateInfo && hasAccess && privateData && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-800 flex items-center">
                <Unlock className="w-4 h-4 mr-1" />
                Información de Contacto (Blockchain)
              </h4>
              <button
                onClick={() => setShowPrivateInfo(false)}
                className="text-green-600 hover:text-green-800 text-xs"
              >
                Ocultar
              </button>
            </div>
            
            <div className="space-y-2">
              {privateData.encryptedPhone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-3 h-3 mr-2 text-green-600" />
                  <span>Teléfono: {privateData.encryptedPhone}</span>
                </div>
              )}
              {privateData.encryptedWhatsapp && (
                <div className="flex items-center text-sm">
                  <MessageCircle className="w-3 h-3 mr-2 text-green-600" />
                  <span>WhatsApp: {privateData.encryptedWhatsapp}</span>
                </div>
              )}
              {privateData.encryptedEmail && (
                <div className="flex items-center text-sm">
                  <Mail className="w-3 h-3 mr-2 text-green-600" />
                  <span>Email: {privateData.encryptedEmail}</span>
                </div>
              )}
              {privateData.encryptedCV && (
                <div className="flex items-start text-sm">
                  <FileText className="w-3 h-3 mr-2 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-medium">CV Completo:</span>
                    <p className="text-gray-700 mt-1 text-xs">
                      {privateData.encryptedCV}
                    </p>
                  </div>
                </div>
              )}
              {privateData.timestamp && (
                <div className="text-xs text-green-600 border-t border-green-200 pt-2 mt-2">
                  Última actualización: {new Date(privateData.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Si es el owner, mostrar estadísticas del contrato */}
        {isOwner && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Tu Perfil en Blockchain</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Precio de acceso: ${accessPriceUSD.toFixed(2)} USD (~{accessPriceETH.toFixed(6)} ETH)</p>
              <p>Precio en wei: {accessPrice}</p>
              <p>Contrato: {formatEthereumAddress(contractAddress)}</p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Los usuarios pueden ver tu información pública gratis y pagar para acceder a tu información de contacto.
            </p>
          </div>
        )}

        {/* Información de estado de la blockchain */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              {publicInfo ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Datos cargados
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />
                  Cargando...
                </>
              )}
            </span>
            <span>Scroll Sepolia</span>
          </div>
        </div>
      </div>
    </div>
  );
}