require('dotenv').config({ path: '../test/.env' });
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const { ethers } = require('ethers') // ethers v6

const contract = require('../artifacts/contracts/NFT.sol/NFTClase.json')


const {
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
  NFT_CONTRACT_ADDRESS,
  PUBLIC_KEY,
  PRIVATE_KEY,
  API_URL
} = process.env

async function createImgInfo(imageRoute) {
  const stream = fs.createReadStream(imageRoute)
  const data = new FormData()
  data.append('file', stream)

  const fileResponse = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    data,
    {
      headers: {
        ...data.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY
      }
    }
  )

  const { IpfsHash } = fileResponse.data
  const fileIPFs = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`
  return fileIPFs
}

async function createJsonInfo(metaData) {
  const jsonResponse = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    metaData,
    {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY
      }
    }
  )

  const { IpfsHash } = jsonResponse.data
  const tokenUri = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`
  return tokenUri
}

/**
 * Miente el NFT y extrae el ID del token del evento 'Transfer' en el recibo de la transacción.
 * @param {string} tokenUri La URI de los metadatos del NFT.
 * @returns {object} Un objeto con el hash de la transacción y el ID del token.
 */
// La función usa ethersInterface.parseLog(log) que lee la data y los tópicos.

async function mintNFT(tokenUri) {
    const provider = new ethers.JsonRpcProvider(API_URL); 
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider); 

    // Usaremos esta interfaz para decodificar el log
    const ethersInterface = new ethers.Interface(contract.abi); 
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, contract.abi, wallet);

    // 1. Preparación de la transacción
    const tx = await nftContract.mintNFT.populateTransaction(PUBLIC_KEY, tokenUri);
    
    const nonce = await provider.getTransactionCount(PUBLIC_KEY, "latest");
    const network = await provider.getNetwork();
    const feeData = await provider.getFeeData(); 
    const gasPrice = feeData.gasPrice ?? ethers.parseUnits("10", "gwei");

    const transaction = {
        from: PUBLIC_KEY,
        to: NFT_CONTRACT_ADDRESS,
        nonce,
        chainId: network.chainId,
        gasPrice,
        data: tx.data,
        value: 0
    };

    // 2. Estimación de gas
    try {
        const estimateGas = await provider.estimateGas(transaction);
        transaction.gasLimit = estimateGas;
    } catch (error) {
        console.error("Error estimando gas:", error);
        transaction.gasLimit = 500000;
    }

    // 3. Envío y espera del recibo
    const result = await wallet.sendTransaction(transaction);
    const receipt = await result.wait(); 

    let tokenId = null;

    // 4. Decodificación Robusta de Eventos
    if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
            try {
                // Intentar parsear el log usando la interfaz del contrato (ABI)
                const parsedLog = ethersInterface.parseLog(log);
                
                // Buscar específicamente el evento 'Transfer'
                if (parsedLog && parsedLog.name === 'Transfer') {
                    // El tokenId es el tercer argumento del evento (índice 2 en el array args)
                    tokenId = parsedLog.args[2].toString(); 
                    break; 
                }
            } catch (e) {
                // Ignorar logs que no son el evento que buscamos
            }
        }
    }

    console.log("NFT mintado, hash:", result.hash);
    if (tokenId) {
        console.log("Token ID:", tokenId);
    } else {
        console.log("❌ Advertencia: No se pudo obtener el Token ID del evento Transfer.");
    }
    
    return { hash: result.hash, tokenId };
}

async function createNFT() {
  try {
    console.log('🚀 Comenzando el proceso de creación de NFT...');
    
    const imgInfo = await createImgInfo('../imagen/Tu_te_Callas.jpg')
    console.log('✅ Imagen subida a IPFS:', imgInfo)

    const metaData = {
      image: imgInfo,
      name: 'Tu_te_Callas',
      description: 'Tu_te_Callas',
      attributes: [
        { trait_type: 'color', value: 'white' },
        { trait_type: 'background', value: 'white' }
      ]
    }

    const tokenUri = await createJsonInfo(metaData)
    console.log('✅ Metadata subida a IPFS:', tokenUri)
    
    // Llamar a la función mint actualizada y desestructurar los resultados
    const { hash: nftHash, tokenId } = await mintNFT(tokenUri)
    
    console.log('\n--- 🎉 Resumen de la Transacción Exitosa ---')
    console.log('Hash de la transacción:', nftHash)
    console.log('Token ID (NFT ID):', tokenId)
    
  } catch (error) {
    console.error('❌ Error fatal al crear el NFT:', error.message)
  }
}

createNFT()