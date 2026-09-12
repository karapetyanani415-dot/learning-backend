const express = require('express');

const routerAuth = require("./routes/auth");
const routerProducts = require('./routes/products');
const routerOrder = require('./routes/orders');
require('dotenv').config({ quiet: true });

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use('/auth', routerAuth);
app.use('/products', routerProducts);
app.use('/orders', routerOrder);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})