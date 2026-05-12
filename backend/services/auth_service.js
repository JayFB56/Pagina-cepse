'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db_service');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error(
        'JWT_SECRET no está configurado o es demasiado corto. ' +
        'Define una clave larga y segura en el archivo .env.'
    );
}

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function signToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyPassword(plainPassword, passwordHash) {
    if (typeof plainPassword !== 'string' || typeof passwordHash !== 'string') {
        return false;
    }

    if (typeof db.verifyPassword === 'function') {
        return db.verifyPassword(plainPassword, passwordHash);
    }

    return bcrypt.compareSync(plainPassword, passwordHash);
}

function writeAudit(action, data = {}) {
    if (typeof db.logActivity !== 'function') return;

    try {
        db.logActivity({
            userId: data.userId || null,
            action,
            targetType: data.targetType || 'auth',
            targetId: data.targetId || null,
            details: data.details || null,
            ipAddress: data.ipAddress || null,
        });
    } catch (err) {
        // No rompemos autenticación por fallas de auditoría
        console.warn('[auth] No se pudo registrar actividad:', err.message);
    }
}

async function login(username, password, meta = {}) {
    const safeUsername = normalizeText(username);
    const safePassword = typeof password === 'string' ? password : '';

    if (!safeUsername || !safePassword) {
        writeAudit('login_failed_invalid_input', {
            details: 'Usuario o contraseña vacíos',
            ipAddress: meta.ipAddress,
        });
        return { ok: false, error: 'Credenciales inválidas' };
    }

    const user = db.findUserByUsername(safeUsername);

    if (!user || !user.active) {
        writeAudit('login_failed_user_not_found_or_inactive', {
            targetType: 'user',
            details: safeUsername,
            ipAddress: meta.ipAddress,
        });
        return { ok: false, error: 'Credenciales inválidas' };
    }

    const valid = verifyPassword(safePassword, user.password_hash);

    if (!valid) {
        writeAudit('login_failed_wrong_password', {
            userId: user.id,
            targetType: 'user',
            targetId: user.id,
            details: safeUsername,
            ipAddress: meta.ipAddress,
        });
        return { ok: false, error: 'Credenciales inválidas' };
    }

    if (typeof db.updateUserLastLogin === 'function') {
        db.updateUserLastLogin(user.id);
    }

    const token = signToken(user);

    writeAudit('login_success', {
        userId: user.id,
        targetType: 'user',
        targetId: user.id,
        details: safeUsername,
        ipAddress: meta.ipAddress,
    });

    return {
        ok: true,
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
    };
}

function verifyToken(token) {
    const safeToken = normalizeText(token);
    if (!safeToken) return null;

    try {
        return jwt.verify(safeToken, JWT_SECRET);
    } catch {
        return null;
    }
}

function extractToken(req) {
    const header = req?.headers?.authorization || '';
    if (typeof header !== 'string') return null;

    if (header.startsWith('Bearer ')) {
        const token = header.slice(7).trim();
        return token.length ? token : null;
    }

    return null;
}

function authMiddleware(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        writeAudit('auth_missing_token', {
            ipAddress: req.ip,
        });
        return res.status(401).json({ success: false, error: 'Token requerido' });
    }

    const payload = verifyToken(token);

    if (!payload) {
        writeAudit('auth_invalid_token', {
            ipAddress: req.ip,
        });
        return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }

    const user = db.findUserById(payload.id);

    if (!user || !user.active) {
        writeAudit('auth_user_not_authorized', {
            userId: payload.id,
            ipAddress: req.ip,
        });
        return res.status(401).json({ success: false, error: 'Usuario no autorizado' });
    }

    req.user = user;
    next();
}

function requireRole(...roles) {
    const allowedRoles = roles.flat().filter(Boolean);

    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            writeAudit('forbidden_role', {
                userId: req.user?.id || null,
                details: allowedRoles.join(','),
                ipAddress: req.ip,
            });
            return res.status(403).json({ success: false, error: 'Permisos insuficientes' });
        }

        next();
    };
}

function hashPassword(plain) {
    if (typeof plain !== 'string' || plain.trim().length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    return bcrypt.hashSync(plain, 12);
}

module.exports = {
    login,
    verifyToken,
    authMiddleware,
    requireRole,
    hashPassword,
    signToken,
};