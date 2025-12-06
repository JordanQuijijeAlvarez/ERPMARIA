const jwt = require('jsonwebtoken');
const SessionManager = require('./sessionManager');
require('dotenv').config();

async function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    
    // Validar formato del header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            message: 'Formato de autorización inválido. Use: Bearer <token>' 
        });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token de acceso requerido' 
        });
    }
    
    try {
        // Verificar y decodificar el token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar si la sesión está activa (solo si el token tiene jti)
        if (verified.jti) {
            const session = await SessionManager.isSessionActive(verified.jti);
            
            if (!session) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Sesión no válida o expirada. Inicie sesión nuevamente.' 
                });
            }
            
            // Verificar device fingerprinting
            const userAgent = req.get('User-Agent');
            const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            
            if (!SessionManager.verifyDeviceFingerprint(session, userAgent, clientIP)) {
                // Invalidar la sesión por seguridad
                await SessionManager.invalidateSession(verified.jti);
                
                return res.status(401).json({ 
                    success: false,
                    message: 'Acceso desde dispositivo no reconocido. Sesión invalidada por seguridad.' 
                });
            }
            
            // Actualizar última actividad
            await SessionManager.updateLastActivity(verified.jti);
            
            // Añadir información de sesión al request
            req.sessionInfo = {
                sessionId: session.session_id,
                userAgent,
                clientIP,
                tokenId: verified.jti
            };
        }
        
        req.user = verified;
        next();
        
    } catch (error) {
        let message = 'Token no válido';
        let status = 401;
        
        if (error.name === 'TokenExpiredError') {
            message = 'Token expirado. Inicie sesión nuevamente.';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Token malformado o corrupto.';
        } else if (error.name === 'NotBeforeError') {
            message = 'Token no válido aún.';
        } else {
            status = 500;
            message = 'Error interno de verificación.';
            console.error('Error de autenticación:', error);
        }
        
        return res.status(status).json({ 
            success: false,
            message 
        });
    }
}

module.exports = authenticateToken;