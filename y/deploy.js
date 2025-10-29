/*
const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying NFTClase contract...");

    // El nombre debe ir como string EXACTAMENTE igual que en tu contrato Solidity
    const NFT = await ethers.getContractFactory("NFTClase");

    // Deploy del contrato
    const nft = await NFT.deploy();

    // Esperar a que se mine la transacción
    await nft.waitForDeployment();

    console.log("NFTClase deployed to:", nft.target || nft.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
*/




//const { ethers } = require("hardhat");
//require('dotenv').config();
/*
async function multiDeploy() {
  const owners = [
    "0x0e3EDA76178363fcA64bD4129FDEF278ee2fa195",
    "0x1f77dA4b01631BAE61Ab37CfcAaD0Bc9FaA547d7",
  ];

  const partes = [80, 20];

  console.log("Propietarios:", owners);
  console.log("Porcentajes:", partes);

  const Pagos = await ethers.getContractFactory("Pagos");
  console.log("Desplegando contrato...");

  const pagos = await Pagos.deploy(owners, partes);

  await pagos.waitForDeployment();

  const address = await pagos.getAddress();
  console.log(`✅ Contrato desplegado en: ${address}`);
}

multiDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el despliegue:", error);
    process.exit(1);
  });*/


const { ethers } = require("hardhat");

async function main() {
  // Direcciones de los dueños
  const owners = [
    "0x0e3EDA76178363fcA64bD4129FDEF278ee2fa195",
    "0x1f77dA4b01631BAE61Ab37CfcAaD0Bc9FaA547d7"
  ];

  // Participaciones (deben ser números)
  const shares = [80, 20];

  // Número de aprobaciones requeridas
  const requiredApprovals = 2;

  console.log("🚀 Desplegando contrato MultiSignPaymentWallet...");

  // Crea una instancia del contrato compilado
  const MultiSignPaymentWallet = await ethers.getContractFactory("MultiSignPaymentWallet");

  // Despliegue (constructor recibe: owners, requiredApprovals, payees, shares)
  const wallet = await MultiSignPaymentWallet.deploy(owners, requiredApprovals, owners, shares);

  // Espera a que el contrato se confirme en la red
  await wallet.waitForDeployment();

  console.log(`✅ Contrato desplegado en: ${await wallet.getAddress()}`);
}

// Manejo de errores
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el despliegue:", error);
    process.exit(1);
  });