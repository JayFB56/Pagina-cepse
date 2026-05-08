const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db_service');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia-este-secret-en-produccion-cepse-cms';
const JWT_EXPIRES_IN = '8h';

function signToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

async function login(username, password) {
    const user = db.findUserByUsername(username);
    if (!user || !user.active) {
        return { ok: false, error: 'Credenciales inválidas' };
    }
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
        return { ok: false, error: 'Credenciales inválidas' };
    }
    db.updateUserLastLogin(user.id);
    const token = signToken(user);
    return {
        ok: true,
        token,
        user: { id: user.id, username: user.username, role: user.role }
    };
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Token requerido' });

    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ success: false, error: 'Token inválido o expirado' });

    const user = db.findUserById(payload.id);
    if (!user || !user.active) {
        return res.status(401).json({ success: false, error: 'Usuario no autorizado' });
    }
    req.user = user;
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Permisos insuficientes' });
        }
        next();
    };
}

function hashPassword(plain) {
    return bcrypt.hashSync(plain, 10);
}

module.exports = {
    login,
    verifyToken,
    authMiddleware,
    requireRole,
    hashPassword,
    signToken
};
