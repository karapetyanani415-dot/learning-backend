const express = require('express');

const { readFile, writeData } = require('../utils/fileDB');
const { authentication, authorization } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    const products = await readFile('products.json');
    let { category, sort, search } = req.query;
    let result = products;

    if (category) {
        result = result.filter(product => product.category === category);
    }

    if (search) {
        const term = search.toLowerCase();
        result = result.filter(product => product.name.toLowerCase().includes(term));
    }

    if (sort === 'price') {
        result = [...result].sort((a, b) => a.price - b.price);
    }

    res.json(result);
});
router.get('/:id', async (req, res) => {
    const products = await readFile('products.json');
    const { id } = req.params;
    const product = products.find(p => p.id === Number(id));

    if (!product) {
        return res.status(404).json({ error: "not found" });
    }

    res.json(product);
});
router.post('/', authentication, authorization('admin'), async (req, res) => {
    const { name, price, category, stock } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'name & price require' });
    }

    const products = await readFile('products.json');
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
        id: newId,
        name,
        price,
        category,
        stock
    };
    products.push(newProduct);
    await writeData('products.json', products);
    res.status(201).json(newProduct);
});
router.put('/:id', authentication, authorization('admin'), async (req, res) => {
    const { id } = req.params;
    const products = await readFile('products.json');
    const product = products.find(p => p.id === Number(id));

    if (!product) {
        return res.status(404).json({ error: "not found" });
    }

    const { name, price, category, stock } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'name & price require' });
    }

    product.name = name;
    product.price = price;
    product.category = category !== undefined ? category : null;
    product.stock = stock !== undefined ? stock : 0;
    await writeData('products.json', products);
    res.json(product);
});
router.delete('/:id', authentication, authorization('admin'), async (req, res) => {
    const { id } = req.params;
    const products = await readFile('products.json');
    const product = products.find(p => p.id === Number(id));

    if (!product) {
        return res.status(404).json({ error: "not found" });
    }

    const updatedProducts = products.filter(p => p.id !== Number(id));
    await writeData('products.json', updatedProducts);
    res.status(204).send();
});

module.exports = router;