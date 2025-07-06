const { ethers } = require("hardhat");

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
    console.log("Current balance:", ethers.formatEther(balance), "ETH");
    console.log("Minimum needed: 0.001 ETH");
    return;
  }
  
  // Deploy ProfileFactory
  console.log("\n📄 Deploying ProfileFactory contract...");
  const ProfileFactory = await ethers.getContractFactory("ProfileFactory");
  
  console.log("⏳ Sending deployment transaction...");
  const profileFactory = await ProfileFactory.deploy();
  
  console.log("⏳ Waiting for deployment to complete...");
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
  console.log(`👤 Deployed by: ${deployer.address}`);
  
  console.log("\n📋 IMPORTANT - Next Steps:");
  console.log("1. Add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  
  console.log("\n2. View on Scroll Sepolia Explorer:");
  console.log(`https://sepolia.scrollscan.dev/address/${factoryAddress}`);
  
  console.log("\n3. Test creating a profile:");
  console.log("Open your React app and try creating a profile!");
  
  // Guardar información del deploy
  const deploymentInfo = {
    factoryAddress: factoryAddress,
    network: "scrollSepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorerUrl: `https://sepolia.scrollscan.dev/address/${factoryAddress}`
  };
  
  const fs = require('fs');
  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");
}

main()
  .then(() => {
    console.log("\n🎯 Deployment completed successfully!");
    console.log("🚀 Your ProfileFactory is now live on Scroll Sepolia!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get more ETH from https://faucet.scroll.io");
    } else if (error.message.includes("nonce")) {
      console.log("\n💡 Solution: Reset your account in MetaMask (Settings > Advanced > Reset Account)");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Solution: Check your internet connection and Scroll Sepolia RPC");
    }
    
    process.exit(1);
  });