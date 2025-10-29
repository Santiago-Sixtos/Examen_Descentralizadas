// C:\Users\Mario\Desktop\11vo\Aplicaciones Decentralizadas\proyectoNFT\y\Controladores\pagos.js

require('dotenv').config();
const contracts = require('../artifacts/contracts/Pagos.sol/Pagos.json');
const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
const { ethers } = require('ethers');
const { provider } = require('../utils/acountManager');

// 1. ✅ Obtener la dirección del entorno PRIMERO.
const { PAGOS_CONTRACT_ADDRESS } = process.env;

console.log("PAGOS_CONTRACT_ADDRESS =", PAGOS_CONTRACT_ADDRESS);

// 2. ✅ Inicializar el contrato AHORA, ya que la dirección existe.
const contract = getContract(PAGOS_CONTRACT_ADDRESS, contracts.abi); 


// 💰 Depositar fondos al contrato
async function deposit(amount, account) {
    return await depositToContract(PAGOS_CONTRACT_ADDRESS, contracts.abi, amount, account);
}

// 🔓 Liberar fondos (llama a la función release del contrato)
async function release(account) {
    return await createTransaction(PAGOS_CONTRACT_ADDRESS, contracts.abi, 'release', [], account);
}

// 📊 Obtener balance del contrato
async function getBalance() {
    try {
        const balance = await contract.getBalance();
        console.log('Contract balance:', balance.toString());
        return balance;
    } catch (error) {
        console.error('Error obteniendo balance:', error);
        throw error; 
    }
}


module.exports = {
    deposit,
    release,
    getBalance
};