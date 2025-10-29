const express = require('express');
const router = express.Router();
const pagosController = require('../Controladores/pagos');

// 📥 Depósito de fondos
router.post('/deposit', async (req, res) => {
    try {
        const { amount, account } = req.body;

        // Validaciones básicas
        if (amount == null || account == null) { // null o undefined
        return res.status(400).json({ message: 'Faltan parámetros: amount o account' });
        }

        await pagosController.deposit(amount, account);
        res.json({ success: true, message: 'Depósito exitoso' });
    } catch (error) {
        console.error('Error en /deposit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 💸 Liberar fondos
router.post('/release', async (req, res) => {
    try {
        const { account } = req.body;

        if (account == null) {
            return res.status(400).json({ message: 'Falta parámetro: account' });
        }

        const receipt = await pagosController.release(account);
        res.json({ success: true, receipt });
    } catch (error) {
        console.error('Error en /release:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 💰 Consultar balance del contrato o cuentas
router.get('/balance', async (req, res) => {
    try {
        const balance = await pagosController.getBalance();
        res.json({ success: true, balance: balance.toString() });
    } catch (error) {
        console.error('Error en /balance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
