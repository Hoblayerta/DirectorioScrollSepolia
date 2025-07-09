// components/ProfileCard.tsx - VERSIÓN FINAL CORREGIDA
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
  AlertCircle,
  Zap,
  RefreshCw,
  Edit,
  Save,
  X,
  Plus
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
    getPrivateInfo,
    updatePrivateInfo, // ✅ IMPORTAR LA FUNCIÓN
    refetch
  } = useRealProfileContract(contractAddress);

  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [privateData, setPrivateData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  
  // ✅ ESTADOS PARA EDITAR INFORMACIÓN PRIVADA
  const [isEditingPrivate, setIsEditingPrivate] = useState(false);
  const [editPrivateData, setEditPrivateData] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    fullCV: ''
  });
  const [isSavingPrivate, setIsSavingPrivate] = useState(false);

  // ✅ VERIFICAR OWNER
  useEffect(() => {
    if (account && owner) {
      const ownerCheck = account.address.toLowerCase() === owner.toLowerCase();
      setIsOwner(ownerCheck);
      console.log("🏠 Verificación de owner:", ownerCheck, "para perfil:", name);
    }
  }, [account?.address, owner, name]);

  // ✅ PAGAR POR ACCESO
  const handlePayForAccess = async () => {
    setPaymentError('');
    
    try {
      console.log("💰 Iniciando pago...");
      const result = await payForAccess();
      console.log("✅ Pago exitoso:", result);
      
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 5000);
      setTimeout(() => refetch(), 3000);

    } catch (error: any) {
      console.error('❌ Error en pago:', error);
      
      let errorMessage = 'Error desconocido';
      
      if (error.message?.includes("rejected")) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (error.message?.includes("insufficient")) {
        errorMessage = 'Fondos insuficientes para el pago';
      } else if (error.message?.includes("already has access")) {
        errorMessage = 'Ya tienes acceso a este perfil';
      } else {
        errorMessage = error.message || 'Error procesando el pago';
      }
      
      setPaymentError(errorMessage);
      setTimeout(() => setPaymentError(''), 8000);
    }
  };

  // ✅ VER INFORMACIÓN PRIVADA
  const handleViewPrivateInfo = async () => {
    setLoadingPrivate(true);
    setPaymentError('');
    
    try {
      console.log("👁️ Obteniendo información privada...");
      const data = await getPrivateInfo();
      console.log("📋 Datos privados obtenidos:", data);
      
      setPrivateData(data);
      setShowPrivateInfo(true);
      
      // ✅ SI ES OWNER, LLENAR FORMULARIO DE EDICIÓN
      if (isOwner) {
        setEditPrivateData({
          phone: data.encryptedPhone !== "Sin datos" ? data.encryptedPhone : '',
          whatsapp: data.encryptedWhatsapp !== "Sin datos" ? data.encryptedWhatsapp : '',
          email: data.encryptedEmail !== "Sin datos" ? data.encryptedEmail : '',
          fullCV: data.encryptedCV !== "Sin datos" ? data.encryptedCV : ''
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error obteniendo info privada:', error);
      
      // ✅ SI ES OWNER Y NO HAY DATOS, ABRIR DIRECTAMENTE EL EDITOR
      if (isOwner && (error.message?.includes("Sin acceso") || error.message?.includes("Access denied"))) {
        console.log("🔒 Owner sin información privada - abriendo editor");
        setPrivateData({
          encryptedPhone: "Sin datos",
          encryptedWhatsapp: "Sin datos",
          encryptedEmail: "Sin datos",
          encryptedCV: "Sin datos",
          timestamp: 0
        });
        setShowPrivateInfo(true);
        setIsEditingPrivate(true); // ✅ ABRIR EDITOR DIRECTAMENTE
        return;
      }
      
      let errorMessage = 'Error obteniendo información';
      
      if (error.message?.includes("Access denied") || 
          error.message?.includes("Sin acceso") ||
          error.message?.includes("debes ser el owner")) {
        errorMessage = 'Necesitas pagar por acceso o ser el propietario del perfil.';
        setTimeout(() => refetch(), 1000);
      } else {
        errorMessage = error.message || 'Error desconocido';
      }
      
      setPaymentError(errorMessage);
      setTimeout(() => setPaymentError(''), 5000);
    } finally {
      setLoadingPrivate(false);
    }
  };

  // ✅ FUNCIÓN handleSavePrivateInfo CON MEJOR DEBUG
  const handleSavePrivateInfo = async () => {
    if (!isOwner) return;
    
    setIsSavingPrivate(true);
    setPaymentError('');
    
    try {
      console.log("💾 Iniciando guardado de información privada...");
      console.log("📋 Datos a guardar:", editPrivateData);
      console.log("🏠 Contract address:", contractAddress);
      console.log("👤 Wallet:", account?.address);
      
      // ✅ VALIDAR QUE HAY AL MENOS UN CAMPO LLENO
      const hasData = editPrivateData.phone || editPrivateData.whatsapp || 
                     editPrivateData.email || editPrivateData.fullCV;
      
      if (!hasData) {
        throw new Error('Debes llenar al menos un campo');
      }
      
      console.log("🚀 Enviando a updatePrivateInfo...");
      
      const result = await updatePrivateInfo({
        phone: editPrivateData.phone.trim(),
        whatsapp: editPrivateData.whatsapp.trim(),
        email: editPrivateData.email.trim(),
        fullCV: editPrivateData.fullCV.trim()
      });
      
      console.log("✅ Resultado de updatePrivateInfo:", result);
      
      // ✅ ACTUALIZAR DATOS MOSTRADOS INMEDIATAMENTE
      setPrivateData({
        encryptedPhone: editPrivateData.phone.trim() || "Sin datos",
        encryptedWhatsapp: editPrivateData.whatsapp.trim() || "Sin datos",
        encryptedEmail: editPrivateData.email.trim() || "Sin datos",
        encryptedCV: editPrivateData.fullCV.trim() || "Sin datos",
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      setIsEditingPrivate(false);
      
      // ✅ MOSTRAR MENSAJE DE ÉXITO
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 5000);
      
      // ✅ REFRESCAR DATOS DESPUÉS DE UN DELAY MÁS LARGO
      setTimeout(() => {
        console.log("🔄 Refrescando datos después de guardar...");
        refetch();
      }, 8000);
      
    } catch (error: any) {
      console.error('❌ Error completo guardando información privada:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = 'Error guardando información';
      
      if (error.message?.includes('rejected')) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Fondos insuficientes para la transacción';
      } else if (error.message?.includes('Solo el propietario')) {
        errorMessage = 'Solo el propietario puede actualizar la información';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setPaymentError(errorMessage);
      setTimeout(() => setPaymentError(''), 8000);
    } finally {
      setIsSavingPrivate(false);
    }
  };

  // ✅ AGREGAR INFORMACIÓN PRIVADA (SIN VER PRIMERO)
  const handleAddPrivateInfo = () => {
    console.log("➕ Agregando información privada desde cero");
    setPrivateData({
      encryptedPhone: "Sin datos",
      encryptedWhatsapp: "Sin datos", 
      encryptedEmail: "Sin datos",
      encryptedCV: "Sin datos",
      timestamp: 0
    });
    setEditPrivateData({
      phone: '',
      whatsapp: '',
      email: '',
      fullCV: ''
    });
    setShowPrivateInfo(true);
    setIsEditingPrivate(true);
  };

  // ✅ FORMATEAR FUNCIONES
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
        </div>
        <div className="text-xs text-gray-500 mt-4 flex items-center">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Cargando desde blockchain...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
      {/* ✅ HEADER */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(publicInfo?.name || name || 'P').charAt(0).toUpperCase()}
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

        {/* ✅ EXPERIENCIA */}
        {publicInfo?.experience && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {publicInfo.experience}
          </p>
        )}
      </div>

      {/* ✅ INFORMACIÓN DEL CONTRATO */}
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
            className="font-mono hover:text-blue-600 flex items-center transition-colors"
          >
            {formatAddress(contractAddress)}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* ✅ MENSAJES DE ESTADO */}
        {paymentSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isOwner ? '¡Información actualizada!' : '¡Pago procesado exitosamente!'} 🎉
            </div>
          </div>
        )}

        {paymentError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {paymentError}
            </div>
          </div>
        )}

        {/* ✅ SECCIÓN ESPECIAL PARA OWNERS */}
        {isOwner ? (
          <div className="border-t pt-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      👑 Tu Perfil - Panel de Control
                    </p>
                    <p className="text-xs text-gray-600">
                      Gestiona tu información privada y configuración
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={refetch}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Actualizar datos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* ✅ BOTÓN PRINCIPAL PARA VER/EDITAR INFO PRIVADA */}
                  <button
                    onClick={handleViewPrivateInfo}
                    disabled={loadingPrivate}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center transition-all shadow-lg font-medium text-sm"
                  >
                    {loadingPrivate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver/Editar Información Privada
                      </>
                    )}
                  </button>

                  {/* ✅ BOTÓN ALTERNATIVO PARA AGREGAR DESDE CERO */}
                  <button
                    onClick={handleAddPrivateInfo}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center transition-all shadow-lg font-medium text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Info
                  </button>
                </div>
              </div>

              <div className="text-xs text-green-700 bg-white/70 rounded p-2">
                <p><strong>💰 Precio de acceso:</strong> ${accessPriceUSD.toFixed(2)} USD (~{accessPriceETH.toFixed(6)} ETH)</p>
                <p><strong>📄 Smart Contract:</strong> {formatAddress(contractAddress)}</p>
                <p><strong>👥 Los usuarios pagan para ver tu información de contacto</strong></p>
              </div>
            </div>
          </div>
        ) : (
          // ✅ SECCIÓN PARA NO-OWNERS 
          <div className="border-t pt-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {hasAccess ? (
                    <Unlock className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <Lock className="w-5 h-5 text-purple-500 mr-2" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {hasAccess ? '🔓 Acceso Autorizado' : '🔒 Información de Contacto'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {hasAccess ? 'Puedes ver el contacto privado' : 'Teléfono, email, CV completo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={refetch}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Actualizar estado"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {!hasAccess ? (
                    <button
                      onClick={handlePayForAccess}
                      disabled={isPaying || !account}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all transform hover:scale-105 shadow-lg font-medium"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Pagando...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          💰 Pagar ${accessPriceUSD.toFixed(2)}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleViewPrivateInfo}
                      disabled={loadingPrivate}
                      className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center transition-all transform hover:scale-105 shadow-lg font-medium"
                    >
                      {loadingPrivate ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          👁️ Ver Contacto
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!hasAccess && accessPriceETH > 0 && (
                <div className="text-xs text-purple-700 bg-white/70 rounded p-2">
                  <p><strong>💰 Precio:</strong> ~{accessPriceETH.toFixed(6)} ETH</p>
                  <p><strong>🔗 Red:</strong> Scroll Sepolia</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ MOSTRAR/EDITAR INFORMACIÓN PRIVADA */}
        {showPrivateInfo && (hasAccess || isOwner) && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-800 flex items-center">
                <Unlock className="w-4 h-4 mr-1" />
                Información de Contacto Privada
              </h4>
              <div className="flex items-center space-x-2">
                {isOwner && !isEditingPrivate && (
                  <button
                    onClick={() => setIsEditingPrivate(true)}
                    className="text-blue-600 hover:text-blue-800 text-xs bg-blue-100 px-2 py-1 rounded flex items-center"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </button>
                )}
                <button
                  onClick={() => setShowPrivateInfo(false)}
                  className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                >
                  ✕ Ocultar
                </button>
              </div>
            </div>
            
            {isEditingPrivate && isOwner ? (
              // ✅ FORMULARIO DE EDICIÓN
              <div className="space-y-3 bg-white rounded p-3 border">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={editPrivateData.phone}
                    onChange={(e) => setEditPrivateData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp:</label>
                  <input
                    type="text"
                    value={editPrivateData.whatsapp}
                    onChange={(e) => setEditPrivateData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email:</label>
                  <input
                    type="email"
                    value={editPrivateData.email}
                    onChange={(e) => setEditPrivateData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="contacto@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CV Completo:</label>
                  <textarea
                    value={editPrivateData.fullCV}
                    onChange={(e) => setEditPrivateData(prev => ({ ...prev, fullCV: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    rows={4}
                    placeholder="Experiencia detallada, proyectos, certificaciones..."
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setIsEditingPrivate(false)}
                    className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    <X className="w-3 h-3 inline mr-1" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePrivateInfo}
                    disabled={isSavingPrivate}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isSavingPrivate ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Guardar en Blockchain
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // ✅ MOSTRAR INFORMACIÓN
              <div className="space-y-3 bg-white rounded p-3 border">
                {privateData?.encryptedPhone && privateData.encryptedPhone !== "Sin datos" && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">📞 Teléfono:</span>
                    <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-gray-800">
                      {privateData.encryptedPhone}
                    </span>
                  </div>
                )}
                
                {privateData?.encryptedWhatsapp && privateData.encryptedWhatsapp !== "Sin datos" && (
                  <div className="flex items-center text-sm">
                    <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">💬 WhatsApp:</span>
                    <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-gray-800">
                      {privateData.encryptedWhatsapp}
                    </span>
                  </div>
                )}
                
                {privateData?.encryptedEmail && privateData.encryptedEmail !== "Sin datos" && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">📧 Email:</span>
                    <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-gray-800">
                      {privateData.encryptedEmail}
                    </span>
                  </div>
                )}
                
                {privateData?.encryptedCV && privateData.encryptedCV !== "Sin datos" && (
                  <div className="text-sm">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-medium">📋 CV Completo:</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border text-gray-700 text-xs leading-relaxed">
                      {privateData.encryptedCV}
                    </div>
                  </div>
                )}
                
                {/* ✅ MENSAJE SI NO HAY DATOS */}
                {(!privateData?.encryptedPhone || privateData.encryptedPhone === "Sin datos") &&
                 (!privateData?.encryptedEmail || privateData.encryptedEmail === "Sin datos") &&
                 (!privateData?.encryptedCV || privateData.encryptedCV === "Sin datos") &&
                 (!privateData?.encryptedWhatsapp || privateData.encryptedWhatsapp === "Sin datos") && (
                  <div className="text-sm text-gray-600 italic text-center py-4 bg-yellow-50 border border-yellow-200 rounded">
                    {isOwner ? (
                      <>
                        ⚠️ No has configurado información privada aún.
                        <br />
                        <button
                          onClick={() => setIsEditingPrivate(true)}
                          className="text-blue-600 hover:underline text-xs mt-1 font-medium"
                        >
                          Haz clic en "Editar" para agregar tu información de contacto.
                        </button>
                      </>
                    ) : (
                      <>
                        ⚠️ Este usuario aún no ha configurado información privada.
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ✅ ESTADO DE LA BLOCKCHAIN */}
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
                  Cargando datos...
                </>
              )}
            </span>
            <span className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${hasAccess || isOwner ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              {hasAccess || isOwner ? 'Acceso: SÍ' : 'Acceso: NO'}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Scroll Sepolia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}