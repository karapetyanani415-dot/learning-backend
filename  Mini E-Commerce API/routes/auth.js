const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ quiet: true });

const { writeData, readFile } = require('../utils/fileDB');
const SECRET = process.env.SECRET || 'something';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username & password is empty' });
    }

    const users = await readFile('users.json');
    const user = users.find(u => u.username === username);

    if (user) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    const newId = users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const newUser = {
        id: newId,
        username: username,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'customer'
    };
    users.push(newUser);
    await writeData('users.json', users);
    res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username & password empty' });
    }
    const users = await readFile('users.json')
    const user = users.find(u => u.username === username)

    if (!user || (!await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '10m' });
    res.json({ token });
});

module.exports = router;