const express = require('express');
const app = express();

// ✅ Desde Express v4.16 ya no necesitas body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
// const userRoutes = require('./routes/user');
// const walletRoutes = require('./routes/wallet');
const pagosRoutes = require('./routes/wallet');

// Registrar rutas
// app.use('/api/user', userRoutes);
// app.use('/api/wallet', walletRoutes);
app.use('/api/wallet', pagosRoutes);

// Puerto y arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en el puerto ${PORT}`));
