require('dotenv').config();
const { ethers } = require('ethers');
const contractJson = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');
const { provider, getWallet } = require('../utils/acountManager');

const WALLET_CONTRACT = process.env.WALLET_CONTRACT;
if (!WALLET_CONTRACT) {
    throw new Error("❌ WALLET_CONTRACT no está definido en el .env");
}
const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, provider);

// 💰 Depositar ETH directamente al contrato
async function deposit(amount, account) {
    try {
        const wallet = getWallet(account);

        const txResponse = await wallet.sendTransaction({
            to: WALLET_CONTRACT,
            value: ethers.parseEther(amount.toString())
        });

        const receipt = await txResponse.wait();
        console.log("✅ Depósito realizado:", receipt.transactionHash);
        return receipt;
    } catch (err) {
        console.error("❌ Error en deposit:", err);
        throw err;
    }
}

// 📝 Crear una nueva transacción
async function submitTransaction(to, amount, account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.submitTransaction(to, ethers.parseEther(amount.toString()));
        const receipt = await txResponse.wait();

        console.log("✅ Transacción enviada:", receipt.transactionHash);
        return receipt;
    } catch (err) {
        console.error("❌ Error en submitTransaction:", err);
        throw err;
    }
}

// ✅ Aprobar una transacción
async function approveTransaction(txId, account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.approveTransaction(txId);
        const receipt = await txResponse.wait();

        console.log("✅ Transacción aprobada:", receipt.transactionHash);
        return receipt;
    } catch (err) {
        console.error("❌ Error en approveTransaction:", err);
        throw err;
    }
}

// ⚙️ Ejecutar una transacción aprobada
async function executeTransaction(txId, account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.executeTransaction(txId);
        const receipt = await txResponse.wait();

        console.log("✅ Transacción ejecutada:", receipt.transactionHash);
        return receipt;
    } catch (err) {
        console.error("❌ Error en executeTransaction:", err);
        throw err;
    }
}

// 💵 Liberar pagos a todos los payees
async function releasePayments(account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.releasePayments();
        const receipt = await txResponse.wait();

        console.log("✅ Pagos liberados:", receipt.transactionHash);
        return receipt;
    } catch (err) {
        console.error("❌ Error en releasePayments:", err);
        throw err;
    }
}

// 📊 Consultar balance del contrato
async function getBalance() {
    try {
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, provider);
        const balance = await contract.getBalance();
        return ethers.formatEther(balance);
    } catch (err) {
        console.error("❌ Error en getBalance:", err);
        throw err;
    }
}

// 📜 Obtener todas las transacciones
async function getTransactions() {
    try {
        const txList = [];
        const transactionCount = Number(await contract.transactionCount());

        for (let i = 0; i < transactionCount; i++) {
            const txn = await contract.transactions(i);
            const [approvers, timestamps] = await contract.getTransactionApprovals(i);

            const approvalDetails = approvers.map((a, idx) => ({
                approver: a,
                timestamp: timestamps[idx].toString(),
                date: new Date(Number(timestamps[idx]) * 1000).toLocaleString()
            }));

            txList.push({
                txId: i.toString(),
                to: txn.to,
                amount: ethers.formatEther(txn.amount),
                executed: txn.executed,
                totalApprovals: Number(txn.approvals),
                approvals: approvalDetails
            });
        }

        return {
            success: true,
            transactions: txList
        };
    } catch (err) {
        console.error("❌ Error en getTransactions:", err);
        return {
            success: false,
            message: err.message
        };
    }
}

async function addProduct(name, price, account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.addProduct(name, ethers.parseEther(price.toString()));
        const receipt = await txResponse.wait();

        console.log(`✅ Producto agregado: ${name} (${price} ETH)`);
        return receipt;
    } catch (err) {
        console.error("❌ Error en addProduct:", err);
        throw err;
    }
}

// 💰 Comprar producto (usuario normal)
async function buyProduct(productId, amountEth, account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.buyProduct(productId, {
            value: ethers.parseEther(amountEth.toString())
        });
        const receipt = await txResponse.wait();

        console.log(`✅ Producto comprado: ID ${productId} por ${amountEth} ETH`);
        return receipt;
    } catch (err) {
        console.error("❌ Error en buyProduct:", err);
        throw err;
    }
}

// 🚫 Desactivar producto (solo owner)
async function disableProduct(productId, account) {
    try {
        const wallet = getWallet(account);
        const contract = new ethers.Contract(WALLET_CONTRACT, contractJson.abi, wallet);

        const txResponse = await contract.disableProduct(productId);
        const receipt = await txResponse.wait();

        console.log(`✅ Producto deshabilitado: ID ${productId}`);
        return receipt;
    } catch (err) {
        console.error("❌ Error en disableProduct:", err);
        throw err;
    }
}

// 📦 Obtener todos los productos
async function getAllProducts() {
    try {
        const products = await contract.getAllProducts();
        const list = products.map(p => ({
            id: Number(p.id),
            name: p.name,
            price: ethers.formatEther(p.price),
            seller: p.seller,
            active: p.active
        }));
        return list;
    } catch (err) {
        console.error("❌ Error en getAllProducts:", err);
        throw err;
    }
}

module.exports = {
    deposit,
    submitTransaction,
    approveTransaction,
    executeTransaction,
    releasePayments,
    getBalance,
    getTransactions,
    addProduct,
    buyProduct,
    disableProduct,
    getAllProducts // ✅ ahora sí exportada
};
