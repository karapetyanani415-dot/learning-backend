const jwt = require('jsonwebtoken');
require('dotenv').config({ quiet: true });
const SECRET = process.env.SECRET || 'something';

function authentication(req, res, next) {
    const header = req.headers['authorization'];
    if (!header) {
        return res.status(401).json({ error: 'Auth is required' });
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid authorization format' });
    }

    try {
        const verifyToken = jwt.verify(token, SECRET);
        req.user = verifyToken;
        next();
    } catch (err) {
        res.status(401).send({ message: err.message });
    }
}

function authorization(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    }
}
module.exports = { authentication, authorization };