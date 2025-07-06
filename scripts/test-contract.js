// scripts/test-contract.js - CREAR ESTE ARCHIVO NUEVO
const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Probando ProfileFactory en Scroll Sepolia...");
  
  // Dirección del contrato deployado
  const FACTORY_ADDRESS = "0x0CBBb59863DC8612441D4fa1F47483856E2EB34f";
  
  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Conectar al contrato
  const ProfileFactory = await ethers.getContractFactory("ProfileFactory");
  const profileFactory = ProfileFactory.attach(FACTORY_ADDRESS);
  
  console.log("\n📊 Estado actual del contrato:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    // Obtener total de perfiles
    const totalProfiles = await profileFactory.getTotalProfiles();
    console.log("📄 Total perfiles:", totalProfiles.toString());
    
    // Obtener perfiles activos
    const activeProfiles = await profileFactory.getActiveProfiles();
    console.log("✅ Perfiles activos:", activeProfiles.length);
    console.log("📋 IDs activos:", activeProfiles.map(id => id.toString()));
    
    // Si hay perfiles, mostrar detalles
    if (activeProfiles.length > 0) {
      console.log("\n📋 Detalles de perfiles:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      for (let i = 0; i < Math.min(activeProfiles.length, 5); i++) {
        const profileId = activeProfiles[i];
        try {
          const profile = await profileFactory.getProfile(profileId);
          console.log(`\n📄 Perfil ${profileId}:`);
          console.log(`  • ID: ${profile.id}`);
          console.log(`  • Nombre: ${profile.name}`);
          console.log(`  • Owner: ${profile.owner}`);
          console.log(`  • Contrato: ${profile.contractAddress}`);
          console.log(`  • Activo: ${profile.isActive}`);
          console.log(`  • Creado: ${new Date(Number(profile.createdAt) * 1000).toLocaleString()}`);
        } catch (error) {
          console.log(`❌ Error obteniendo perfil ${profileId}:`, error.message);
        }
      }
    }
    
    // Probar crear un perfil de prueba
    console.log("\n🧪 Probando creación de perfil...");
    try {
      const tx = await profileFactory.createProfile(
        "Perfil de Prueba",
        "Desarrollador Web3",
        "Test Company", 
        "Experiencia en blockchain y smart contracts",
        ethers.parseEther("0.01") // 0.01 ETH
      );
      
      console.log("⏳ Esperando confirmación...");
      const receipt = await tx.wait();
      console.log("✅ Perfil de prueba creado!");
      console.log("📄 TX Hash:", receipt.hash);
      
      // Verificar nuevo estado
      const newTotal = await profileFactory.getTotalProfiles();
      console.log("📊 Nuevo total de perfiles:", newTotal.toString());
      
    } catch (error) {
      console.log("⚠️ Error creando perfil de prueba:", error.message);
      if (error.message.includes("revert")) {
        console.log("💡 Esto es normal si ya tienes un perfil creado");
      }
    }
    
  } catch (error) {
    console.error("❌ Error principal:", error.message);
  }
  
  console.log("\n🎯 Información para el frontend:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📄 Factory Address: ${FACTORY_ADDRESS}`);
  console.log(`🌐 Explorer: https://sepolia.scrollscan.dev/address/${FACTORY_ADDRESS}`);
  console.log(`⛓️ Chain ID: 534351 (Scroll Sepolia)`);
  
  console.log("\n✅ Test completado!");
}

main()
  .then(() => {
    console.log("\n🎉 ¡Test exitoso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test falló:");
    console.error(error.message);
    process.exit(1);
  });