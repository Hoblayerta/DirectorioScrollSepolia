// components/DebugAccess.tsx - VERSIÓN SIMPLIFICADA
'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

export default function DebugAccess() {
  const account = useActiveAccount();
  const [contractAddress, setContractAddress] = useState('0x5e6C21d909746C6b5c3aDcC3ea27CB13DF5D1E18');

  const checkAccess = () => {
    alert(`Wallet: ${account?.address}\nContrato: ${contractAddress}`);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold mb-4">🔍 Debug Simple</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Dirección del Contrato:
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>

        <div className="text-sm">
          <p><strong>Wallet conectada:</strong> {account?.address || 'No conectada'}</p>
        </div>

        <button
          onClick={checkAccess}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔍 Verificar Info
        </button>
        
        <div className="text-xs text-gray-600 mt-3">
          <p><strong>Problema identificado:</strong></p>
          <p>• El perfil "Gavin Sepolia" se creó ANTES del código actualizado</p>
          <p>• La información privada nunca se guardó en este perfil</p>
          <p>• El pago funciona, pero no hay datos privados que mostrar</p>
        </div>
      </div>
    </div>
  );
}