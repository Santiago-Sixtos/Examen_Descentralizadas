require('dotenv').config({path:require('find-config')('.env')})
const {ethers} = require('ethers')
const {API_URL, PUBLIC_KEY, PRIVATE_KEY} = process.env

const publickey = PUBLIC_KEY.split(',')
const privatekey = PRIVATE_KEY.split(',')
const provider = new ethers.JsonRpcProvider(process.env.API_URL);

function getWallet(account){
    if (account >= privatekey.length) {
        throw new Error(`Account ${account} no exite`)
    }
    // 2. OBTENER LA CLAVE PRIVADA
    const pKey = privatekey[account];

    // 3. RETORNAR LA WALLET CONECTADA AL PROVIDER
    // Esto crea un "Signer" capaz de firmar y enviar transacciones.
    return new ethers.Wallet(pKey, provider);
}

function getPublicKey(account){
    if(account >= publickey.length){
        throw new Error(`public ${account} no existe`);
    }
    // ✅ DEBE DEVOLVER LA DIRECCIÓN
    return publickey[account];
}

function getAllAccount() {
    return publickey.map((key, index) => ({index:index, address:key}))
}

module.exports = {
    provider,
    getWallet,
    getPublicKey,
    getAllAccount,
    publickey,
    privatekey
}