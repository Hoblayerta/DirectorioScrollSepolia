import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ProfileFactory to Scroll Sepolia...");
  
  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Verificar balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Verificar que tenemos suficiente ETH
  if (balance < ethers.parseEther("0.001")) {
    console.log("⚠️ Warning: Low balance. You might need more ETH for deployment.");
    console.log("Get ETH from: https://faucet.scroll.io");
    return;
  }
  
  // Deploy ProfileFactory
  console.log("\n📄 Deploying ProfileFactory contract...");
  const ProfileFactory = await ethers.getContractFactory("ProfileFactory");
  
  const profileFactory = await ProfileFactory.deploy();
  await profileFactory.waitForDeployment();
  
  const factoryAddress = await profileFactory.getAddress();
  console.log("✅ ProfileFactory deployed to:", factoryAddress);
  
  // Esperar confirmaciones
  console.log("\n⏳ Waiting for block confirmations...");
  const deployTx = profileFactory.deploymentTransaction();
  if (deployTx) {
    await deployTx.wait(3); // Esperar 3 confirmaciones
    console.log("✅ Contract confirmed on blockchain");
  }
  
  // Información final
  console.log("\n🎉 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📄 ProfileFactory: ${factoryAddress}`);
  console.log(`🌐 Network: Scroll Sepolia`);
  console.log(`🔗 Explorer: https://sepolia.scrollscan.dev/address/${factoryAddress}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Add this to your .env.local file:");
  console.log(`   NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  
  console.log("\n3. View on explorer:");
  console.log(`   https://sepolia.scrollscan.dev/address/${factoryAddress}`);
}

main()
  .then(() => {
    console.log("\n🎯 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });