require("@nomicfoundation/hardhat-toolbox");
//require("dotenv").config({ path: "./test/.env" });
require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_URL = process.env.API_URL;

if (!API_URL) throw new Error("API_URL no está definida en .env");
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY no está definida en .env");

module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : "0x" + PRIVATE_KEY]
    }
  }
};
