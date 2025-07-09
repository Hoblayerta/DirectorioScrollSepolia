# 🚀 DirectorioPro Web3

**Plataforma descentralizada de perfiles profesionales en Scroll Sepolia**

Un directorio de profesionales construido completamente en blockchain, donde los usuarios pueden crear perfiles verificables y monetizar el acceso a su información de contacto.

## ✨ Características principales

- 🔗 **100% Descentralizado** - Datos almacenados en Scroll Sepolia
- 💰 **Monetización** - Los usuarios establecen precios para acceder a su información privada
- 🛡️ **Inmutable** - Perfiles verificables y permanentes en blockchain
- 🌍 **Acceso Global** - Disponible desde cualquier parte del mundo
- 🔒 **Control de Privacidad** - Información pública/privada separada

## 🛠️ Tecnologías utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Scroll Sepolia Testnet
- **Web3**: ThirdWeb v5
- **Smart Contracts**: Solidity (Factory + Profile contracts)
- **Wallet**: MetaMask, Coinbase Wallet, Rainbow, Rabby

## 📋 Contratos desplegados

- **Factory Contract**: `0x0CBBb59863DC8612441D4fa1F47483856E2EB34f`
- **Network**: Scroll Sepolia (Chain ID: 534351)
- **Explorer**: [Ver en Scrollscan](https://sepolia.scrollscan.dev/address/0x0CBBb59863DC8612441D4fa1F47483856E2EB34f)

## 🚀 Instalación y configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Wallet con Scroll Sepolia ETH

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/directorio-pro-web3.git
cd directorio-pro-web3
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id_aqui
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
# o
yarn dev
```

5. **Abrir en navegador**
```
http://localhost:3000
```

## 🔧 Configuración de Wallet

### Añadir Scroll Sepolia a tu wallet:

- **Network Name**: Scroll Sepolia
- **RPC URL**: `https://sepolia-rpc.scroll.io/`
- **Chain ID**: `534351`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://sepolia.scrollscan.dev`

### Obtener ETH de prueba:
- [Scroll Sepolia Faucet](https://sepolia.scroll.io/faucet)

## 📖 Cómo usar

### Para usuarios:
1. **Conectar wallet** a Scroll Sepolia
2. **Explorar perfiles** en el directorio
3. **Pagar para ver contactos** de profesionales
4. **Crear tu propio perfil** profesional

### Para desarrolladores:
1. **Revisar contratos** en `/contracts/abis.ts`
2. **Hooks de blockchain** en `/hooks/useRealContracts.ts`
3. **Componentes React** en `/components/`

## 🏗️ Arquitectura

```
DirectorioPro Web3
├── 📁 Frontend (Next.js)
│   ├── UI Components
│   ├── Blockchain Hooks
│   └── Web3 Integration
├── 🔗 Scroll Sepolia
│   ├── Factory Contract
│   └── Profile Contracts
└── 💾 Datos
    ├── Información Pública
    └── Información Privada (Pagada)
```

## 🔄 Funcionalidades

### ✅ Implementadas
- [x] Conexión a Scroll Sepolia
- [x] Creación de perfiles
- [x] Directorio de profesionales
- [x] Sistema de pagos para acceso
- [x] Información privada encriptada
- [x] UI responsive y moderna
- [x] Manejo de errores optimizado

### 🚧 En desarrollo
- [ ] Sistema de reputación
- [ ] Búsqueda avanzada
- [ ] Integración con IPFS
- [ ] Notificaciones push
- [ ] API pública

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces útiles

- [Demo en vivo](https://tu-dominio.vercel.app)
- [Documentación técnica](./docs/README.md)
- [Smart Contracts](https://sepolia.scrollscan.dev/address/0x0CBBb59863DC8612441D4fa1F47483856E2EB34f)
- [ThirdWeb Documentation](https://portal.thirdweb.com/)
- [Scroll Sepolia](https://scroll.io/)

## 👨‍💻 Desarrollado por

**Tu Nombre** - [@tu_twitter](https://twitter.com/tu_twitter)

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐
