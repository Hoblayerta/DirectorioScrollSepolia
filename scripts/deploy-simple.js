const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProfileFactory...");
  
  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Verificar balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy ProfileFactory (SIN esperar confirmaciones)
  console.log("\n📄 Deploying ProfileFactory contract...");
  const ProfileFactory = await ethers.getContractFactory("ProfileFactory");
  
  const profileFactory = await ProfileFactory.deploy();
  await profileFactory.waitForDeployment();
  
  const factoryAddress = await profileFactory.getAddress();
  console.log("✅ ProfileFactory deployed to:", factoryAddress);
  
  // NO esperar confirmaciones - solo mostrar info
  console.log("\n🎉 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📄 Contract Address: ${factoryAddress}`);
  console.log(`👤 Deployed by: ${deployer.address}`);
  console.log(`💰 Balance used: ~0.001 ETH`);
  
  // Test rápido del contrato
  console.log("\n🧪 Testing contract...");
  try {
    const totalProfiles = await profileFactory.getTotalProfiles();
    console.log("✅ Contract is working! Total profiles:", totalProfiles.toString());
    
    // Test crear perfil
    console.log("⏳ Testing profile creation...");
    const tx = await profileFactory.createProfile(
      "Test Profile",
      "Developer",
      "Test Company", 
      "Testing experience",
      ethers.parseEther("0.01") // 0.01 ETH
    );
    await tx.wait();
    
    const newTotal = await profileFactory.getTotalProfiles();
    console.log("✅ Profile created! New total:", newTotal.toString());
    
  } catch (error) {
    console.log("⚠️ Contract test failed:", error.message);
  }
  
  console.log("\n📋 Next Steps:");
  console.log("1. Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  console.log("\n2. Run the React app:");
  console.log("npm run dev");
  
  return factoryAddress;
}

main()
  .then((address) => {
    console.log("\n🎯 SUCCESS! Contract deployed to:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    process.exit(1);
  });