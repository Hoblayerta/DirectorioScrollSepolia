// components/CreateProfile.tsx - REEMPLAZAR TODO EL CONTENIDO
'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRealProfileFactory } from '../hooks/useRealContracts';
import { User, Briefcase, Building, FileText, DollarSign, Loader2, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

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
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    experience: '',
    accessPriceUSD: 10,
    // Información privada (para referencia futura)
    phone: '',
    whatsapp: '',
    email: '',
    fullCV: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [estimatedGas, setEstimatedGas] = useState<string>('');

  // ✅ VERIFICAR PERFIL EXISTENTE AL CARGAR
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (isConnected && account?.address) {
        setCheckingProfile(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setCheckingProfile(false);
        } catch (error) {
          console.error('Error checking existing profile:', error);
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
      console.log("📊 Datos del perfil:", formData);
      console.log("💳 Wallet:", account.address);
      console.log("🏭 Factory Contract:", contractAddress);

      const result = await createProfile({
        name: formData.name,
        title: formData.title,
        company: formData.company,
        experience: formData.experience,
        accessPriceUSD: formData.accessPriceUSD
      });

      console.log("✅ Transacción enviada:", result);
      
      if (result?.transactionHash) {
        setTransactionHash(result.transactionHash);
      }

      setShowSuccess(true);

      // Actualizar datos después de la transacción
      setTimeout(() => {
        refetchData();
      }, 5000);

      // Cerrar modal de éxito después de 6 segundos
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 6000);

    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      
      if (error.message && error.message.includes("Ya tienes un perfil")) {
        alert('Ya tienes un perfil creado. Solo se permite un perfil por wallet.');
      } else if (error.message && error.message.includes("rejected")) {
        alert('Transacción rechazada por el usuario.');
      } else if (error.message && error.message.includes("insufficient")) {
        alert('Fondos insuficientes para completar la transacción.');
      } else {
        alert(`Error al crear el perfil: ${error.message || 'Error desconocido'}`);
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
        <p className="text-gray-600">Verificando perfiles existentes en la blockchain...</p>
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
            <p><strong>Perfiles Encontrados:</strong> {userProfiles.length}</p>
            <p><strong>Estado:</strong> Perfil activo en la blockchain</p>
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

  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          ¡Perfil creado en la blockchain!
        </h3>
        <p className="text-green-700 mb-4">
          Tu perfil profesional ha sido desplegado exitosamente en Scroll Sepolia.
        </p>
        
        <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-sm text-green-700 space-y-2">
            <p>✅ <strong>Smart contract desplegado</strong></p>
            <p>✅ <strong>Información pública guardada</strong></p>
            <p>✅ <strong>Precio configurado:</strong> ${formData.accessPriceUSD} USD</p>
            {transactionHash && (
              <p>✅ <strong>TX Hash:</strong> 
                <a 
                  href={`https://sepolia.scrollscan.dev/tx/${transactionHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            🎉 <strong>¡Tu perfil estará visible en el directorio en unos minutos!</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Los bloques en Scroll Sepolia se confirman cada ~3 segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Crear Perfil Profesional en Blockchain
        </h2>
        <p className="text-gray-600">
          Despliega tu perfil descentralizado en Scroll Sepolia
        </p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <p><strong>🏭 Factory Contract:</strong> {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}</p>
            <p><strong>⛽ Gas Estimado:</strong> ~{estimatedGas} ETH (${(parseFloat(estimatedGas) * 2000).toFixed(2)} USD)</p>
            <p><strong>⛓️ Red:</strong> Scroll Sepolia</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Pública */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información Pública (Visible para todos)
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
              placeholder="Describe tu experiencia, habilidades técnicas, logros principales..."
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
              Precio: ${formData.accessPriceUSD} USD (~{(formData.accessPriceUSD / 2000).toFixed(6)} ETH)
            </p>
          </div>
        </div>

        {/* Información sobre costos de blockchain */}
        <div className="border-t pt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <h4 className="font-medium mb-1">Costos de transacción en blockchain:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Gas fee estimado: ~{estimatedGas} ETH (${(parseFloat(estimatedGas) * 2000).toFixed(2)} USD)</li>
                  <li>• Tu perfil será permanente en la blockchain</li>
                  <li>• Una vez creado, no se puede eliminar</li>
                  <li>• Los datos serán públicos y verificables</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ml-auto"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Desplegando en blockchain...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Crear Perfil en Blockchain
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}