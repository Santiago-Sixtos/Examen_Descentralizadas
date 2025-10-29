const express = require('express');
const router = express.Router();
const walletController = require('../Controladores/wallet');


router.post('/deposit', async (req, res) => {
    try {
        const { amount, account } = req.body;
        const receipt = await walletController.deposit(amount, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/submit', async (req, res) => {
    try {
        const { to, amount, account } = req.body;
        const receipt = await walletController.submitTransaction(to, amount, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/approve', async (req, res) => {
    try {
        const { transactionId, account } = req.body;
        const receipt = await walletController.approveTransaction(transactionId, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/execute', async (req, res) => {
    try {
        const { transactionId, account } = req.body;
        const receipt = await walletController.executeTransaction(transactionId, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/release', async (req, res) => {
    try {
        const { account } = req.body;
        const receipt = await walletController.releasePayments(account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/transactions', async (req, res) => {
    try {
        const transactions = await walletController.getTransactions();
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/balance', async (req, res) => {
    try {
        const balance = await walletController.getBalance();
        res.json({ success: true, balance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/product/add', async (req, res) => {
    try {
        const { name, price, account } = req.body;
        const receipt = await walletController.addProduct(name, price, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/product/buy', async (req, res) => {
    try {
        const { productId, amountEth, account } = req.body;
        const receipt = await walletController.buyProduct(productId, amountEth, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/product/disable', async (req, res) => {
    try {
        const { productId, account } = req.body;
        const receipt = await walletController.disableProduct(productId, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/products', async (req, res) => {
    try {
        const products = await walletController.getAllProducts();
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/withdraw', async (req, res) => {
    try {
        const { to, amount, account } = req.body;
        const receipt = await walletController.withdrawFunds(to, amount, account);
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/withdrawals', async (req, res) => {
    try {
        const result = await walletController.getWithdrawals();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
