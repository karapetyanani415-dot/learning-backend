const express = require('express');

const { readFile, writeData } = require('../utils/fileDB');
const { authentication, authorization } = require('../middleware/auth');

const router = express.Router();

const STATUS_TRANSITIONS = {
    pending: ['shipped'],
    shipped: ['delivered'],
    delivered: []
};

router.post('/', authentication, async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items must be a non-empty array' });
    }

    for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            return res.status(400).json({ error: 'Each item needs a valid productId and a positive integer quantity' });
        }
    }
    
    const quantityByProductId = new Map();

    for (const item of items) {
        quantityByProductId.set(
            item.productId,
            (quantityByProductId.get(item.productId) || 0) + item.quantity
        );
    }

    const products = await readFile('products.json');
    let total = 0;
    let allOrder = []

    for (const [productId, quantity] of quantityByProductId) {
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(400).json({ error: `Product ${productId} not found` });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Not enough stock for product' });
        }

        total += product.price * quantity;
        allOrder.push({
            productId: product.id,
            name: product.name,
            quantity: quantity,
            price: product.price,
        })
    }

    for (const [productId, quantity] of quantityByProductId) {
        const product = products.find(p => p.id === productId);
        product.stock -= quantity;
    }

    const orders = await readFile('orders.json');
    const newId = orders.length ? Math.max(...orders.map(order => order.id)) + 1 : 1;
    const newOrder = {
        id: newId,
        userId: req.user.id,
        items: allOrder,
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    await writeData('orders.json', orders);
    await writeData('products.json', products);
    res.status(201).json(newOrder);
});
router.get('/', authentication, async (req, res) => {
    const orders = await readFile('orders.json');
    const userId = req.user.id;
    const userOrders = orders.filter(o => o.userId === userId);
    res.json(userOrders);
});
router.get('/:id', authentication, async (req, res) => {
    const { id } = req.params;
    const orders = await readFile('orders.json');
    const order = orders.find(o => o.id === Number(id));

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId === req.user.id) {
        return res.json(order);
    }

    if (req.user.role === 'admin') {
        return res.json(order);
    }

    res.status(403).json({ error: 'Forbidden' });
});
router.patch('/:id', authentication, authorization('admin'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ error: 'status must be one of: pending, shipped, delivered' });
    }

    const orders = await readFile('orders.json');
    const order = orders.find(o => o.id === Number(id));
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const currentStatus = order.status || 'pending';
    if (!STATUS_TRANSITIONS[currentStatus].includes(status)) {
        return res.status(400).json({ error: `Cannot move order from ${currentStatus} to ${status}` });
    }

    order.status = status;
    await writeData('orders.json', orders);
    res.json(order);
});
router.delete('/:id', authentication, async (req, res) => {
    const { id } = req.params;
    const orders = await readFile('orders.json');
    const order = orders.find(o => o.id === Number(id));
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const currentStatus = order.status || 'pending';
    if (currentStatus !== 'pending') {
        return res.status(400).json({ error: `Cannot cancel an order that is already ${currentStatus}` });
    }

    const products = await readFile('products.json');
    for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock += item.quantity;
        }
    }
    await writeData('products.json', products);

    const remainingOrders = orders.filter(o => o.id !== Number(id));
    await writeData('orders.json', remainingOrders);

    res.status(204).send();
});

module.exports = router;