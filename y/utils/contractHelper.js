const { ethers, Wallet } = require('ethers');
const { provider, getWallet, getPublicKey } = require('./acountManager');

// ✅ createTransaction (nombre corregido)
async function createTransaction(contractAddress, abi, method, params, account) {
    const iface = new ethers.Interface(abi);
    const wallet = getWallet(account); // ✅ usar getWallet(account)
    const publicKey = getPublicKey(account); // ✅ corregido nombre
    const nonce = await provider.getTransactionCount(publicKey, 'latest');
    const feeData = await provider.getFeeData();
    const network = await provider.getNetwork();

    const tx = {
        from: publicKey,
        to: contractAddress,
        nonce,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: network.chainId,
        data: iface.encodeFunctionData(method, params),
    };

    // Estimar gas
    tx.gasLimit = await provider.estimateGas(tx);

    // Firmar y enviar
    const signedTx = await wallet.signTransaction(tx);
    const receipt = await wallet.sendTransaction(tx);
    await receipt.wait();

    console.log(`TX ${method} enviada:`, receipt.hash);
    return receipt;
}

// ✅ depositToContract (corrigiendo 'mount' → 'amount' y 'ethers.contract' → 'ethers.Contract')
async function depositToContract(contractAddress, abi, amount, account) {
    const wallet = getWallet(account);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.deposit({ value: ethers.parseEther(amount.toString()) });
    console.log("Depósito realizado:", tx.hash);
    return tx;
}

// ✅ getContract (está bien)
function getContract(contractAddress, abi) {
    return new ethers.Contract(contractAddress, abi, provider);
}

// ✅ Exportaciones corregidas
module.exports = {
    createTransaction,
    depositToContract,
    getContract,
};
