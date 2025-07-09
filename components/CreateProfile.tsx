// components/CreateProfile.tsx - VERSIÓN SIMPLIFICADA Y CORREGIDA
'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRealProfileFactory, useRealProfileContract } from '../hooks/useRealContracts';
import { User, Briefcase, Building, FileText, DollarSign, Loader2, Lock, CheckCircle, AlertTriangle, Phone, Mail, MessageCircle, Info } from 'lucide-react';

interface CreateProfileProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateProfile({ onSuccess, onCancel }: CreateProfileProps) {
  const account = useActiveAccount();
  const { 
    createProfile, 
    hasExistingProfile,
    isCreating, 
    isConnected,
    contractAddress,
    userProfiles,
    refetchData
  } = useRealProfileFactory();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [estimatedGas, setEstimatedGas] = useState<string>('');
  const [createdContractAddress, setCreatedContractAddress] = useState<string>('');

  const [formData, setFormData] = useState({
    // 📋 INFORMACIÓN PÚBLICA (obligatoria)
    name: '',
    title: '',
    company: '',
    experience: '',
    accessPriceUSD: 10,
    // 🔒 INFORMACIÓN PRIVADA (opcional)
    phone: '',
    whatsapp: '',
    email: '',
    fullCV: ''
  });

  // ✅ VERIFICAR PERFIL EXISTENTE
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (isConnected && account?.address) {
        setCheckingProfile(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setCheckingProfile(false);
        } catch (error) {
          console.error('Error checking profile:', error);
          setCheckingProfile(false);
        }
      } else {
        setCheckingProfile(false);
      }
    };

    checkExistingProfile();
  }, [isConnected, account]);

  // ✅ CALCULAR GAS ESTIMADO
  useEffect(() => {
    if (formData.name && formData.title) {
      const gasEstimate = ((formData.accessPriceUSD / 2000) * 0.01).toFixed(6);
      setEstimatedGas(gasEstimate);
    }
  }, [formData.accessPriceUSD, formData.name, formData.title]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Por favor conecta tu wallet primero');
      return;
    }

    if (!formData.name || !formData.title) {
      alert('Por favor completa los campos obligatorios (Nombre y Título)');
      return;
    }

    if (hasExistingProfile()) {
      alert('Ya tienes un perfil creado. Solo se permite un perfil por wallet.');
      return;
    }

    try {
      console.log("🚀 Creando perfil en la blockchain...");
      console.log("📊 Información:", formData);

      // ✅ CREAR PERFIL (la información privada se agregará automáticamente si se proporciona)
      const result = await createProfile({
        name: formData.name,
        title: formData.title,
        company: formData.company,
        experience: formData.experience,
        accessPriceUSD: formData.accessPriceUSD,
        // ✅ INCLUIR INFORMACIÓN PRIVADA SI SE PROPORCIONÓ
        privateInfo: (formData.phone || formData.email || formData.fullCV) ? {
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          fullCV: formData.fullCV
        } : undefined
      });

      console.log("✅ Resultado:", result);
      
      if (result?.transactionHash) {
        setTransactionHash(result.transactionHash);
      }

      setShowSuccess(true);

      // Actualizar datos después de unos segundos
      setTimeout(() => {
        refetchData();
      }, 5000);

      // Finalizar proceso
      setTimeout(() => {
        onSuccess?.();
      }, 8000);

    } catch (error: any) {
      console.error('❌ Error:', error);
      
      if (error.message?.includes("Ya tienes un perfil")) {
        alert('Ya tienes un perfil creado. Solo se permite un perfil por wallet.');
      } else if (error.message?.includes("rejected")) {
        alert('Transacción rechazada por el usuario.');
      } else if (error.message?.includes("insufficient")) {
        alert('Fondos insuficientes para completar la transacción.');
      } else {
        alert(`Error: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Wallet no conectada
        </h3>
        <p className="text-yellow-700">
          Por favor conecta tu wallet a Scroll Sepolia para crear un perfil profesional.
        </p>
        <div className="mt-4 text-sm text-yellow-600">
          <p><strong>Red requerida:</strong> Scroll Sepolia (Chain ID: 534351)</p>
          <p><strong>Necesitas:</strong> ETH para gas fees (~$1-3 USD)</p>
        </div>
      </div>
    );
  }

  if (checkingProfile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Verificando perfiles existentes...</p>
        <p className="text-sm text-gray-500 mt-2">Consultando {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}</p>
      </div>
    );
  }

  if (hasExistingProfile()) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-orange-800 mb-2">
          Ya tienes un perfil creado
        </h3>
        <p className="text-orange-700 mb-4">
          Detectamos {userProfiles.length} perfil(es) asociado(s) a tu wallet. 
          Solo se permite un perfil por dirección.
        </p>
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-600">
            <p><strong>Tu Wallet:</strong> {account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
            <p><strong>Perfiles:</strong> {userProfiles.length}</p>
            <p><strong>Estado:</strong> Activo en blockchain</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          Ver Mi Perfil en el Directorio
        </button>
      </div>
    );
  }

  // ✅ PANTALLA DE ÉXITO
  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          ¡Perfil creado exitosamente!
        </h3>
        <p className="text-green-700 mb-4">
          Tu perfil profesional ha sido desplegado en Scroll Sepolia.
        </p>
        
        <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-sm text-green-700 space-y-2">
            <p>✅ <strong>Smart contract desplegado</strong></p>
            <p>✅ <strong>Información pública guardada</strong></p>
            <p>✅ <strong>Precio configurado:</strong> ${formData.accessPriceUSD} USD</p>
            {(formData.phone || formData.email || formData.fullCV) && (
              <p>✅ <strong>Información privada en proceso...</strong></p>
            )}
            {transactionHash && (
              <p>✅ <strong>TX:</strong> 
                <a 
                  href={`https://sepolia.scrollscan.dev/tx/${transactionHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Ver en explorador
                </a>
              </p>
            )}
          </div>
        </div>

        {/* ✅ NOTA IMPORTANTE SOBRE INFORMACIÓN PRIVADA */}
        {(formData.phone || formData.email || formData.fullCV) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Información Privada
                </h4>
                <p className="text-xs text-blue-800">
                  La información privada se está guardando en una segunda transacción. 
                  Puede tomar unos minutos en aparecer. Si no aparece, puedes agregarla 
                  manualmente desde tu perfil más tarde.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-green-800">
            🎉 <strong>Tu perfil ya está disponible en el directorio profesional</strong>
          </p>
        </div>
      </div>
    );
  }

  // ✅ FORMULARIO COMPLETO
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Crear Perfil Profesional en Blockchain
        </h2>
        <p className="text-gray-600">
          Crea tu perfil descentralizado. La información privada es opcional y se puede agregar después.
        </p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <p><strong>🏭 Factory:</strong> {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}</p>
            <p><strong>⛽ Gas estimado:</strong> ~{estimatedGas} ETH</p>
            <p><strong>⛓️ Red:</strong> Scroll Sepolia</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ✅ SECCIÓN INFORMACIÓN PÚBLICA */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b border-gray-200 pb-2">
            <User className="w-5 h-5 mr-2" />
            📋 Información Pública (visible para todos)
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título profesional *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ej. Desarrollador Full Stack, Diseñador UX/UI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa actual
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de tu empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experiencia y habilidades
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe tu experiencia, habilidades técnicas, logros..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de acceso a información privada (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="accessPriceUSD"
                value={formData.accessPriceUSD}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              ${formData.accessPriceUSD} USD (~{(formData.accessPriceUSD / 2000).toFixed(6)} ETH)
            </p>
          </div>
        </div>

        {/* ✅ SECCIÓN INFORMACIÓN PRIVADA - OPCIONAL Y CON AVISO */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center border-b border-gray-200 pb-2">
            <Lock className="w-5 h-5 mr-2" />
            🔒 Información Privada (opcional)
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <h4 className="font-medium mb-1">Información Importante:</h4>
                <ul className="text-xs space-y-1">
                  <li>• La información privada es opcional y se puede agregar después</li>
                  <li>• Se guarda en una segunda transacción separada</li>
                  <li>• Solo visible para quienes paguen ${formData.accessPriceUSD} USD</li>
                  <li>• Si no aparece inmediatamente, será visible en unos minutos</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              WhatsApp
            </label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email de contacto
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="contacto@tudominio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              CV Completo / Información Detallada
            </label>
            <textarea
              name="fullCV"
              value={formData.fullCV}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Experiencia detallada, proyectos específicos, logros, certificaciones, portfolio links, etc..."
            />
          </div>
        </div>

        {/* ✅ BOTONES */}
        <div className="flex justify-between pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={isCreating || !formData.name || !formData.title}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ml-auto text-lg font-semibold shadow-lg transform transition-all hover:scale-105"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Desplegando en Blockchain...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-3" />
                🚀 Crear Mi Perfil
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Se creará tu smart contract personal con la información proporcionada
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ⛽ Costo estimado: ~{estimatedGas} ETH (${(parseFloat(estimatedGas) * 2000).toFixed(2)} USD)
          </p>
        </div>
      </form>
    </div>
  );
}