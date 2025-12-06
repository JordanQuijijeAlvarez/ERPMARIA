const pool = require('../configuracion/db');
const crypto = require('crypto');

class SessionManager {
    
    // Crear una nueva sesión activa
    static async createSession(userId, tokenJti, deviceInfo = {}) {
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        
        const query = `
            INSERT INTO sesiones_activas 
            (usuario_id, session_id, token_jti, user_agent, ip_address, device_fingerprint, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            userId,
            sessionId,
            tokenJti,
            deviceInfo.userAgent || null,
            deviceInfo.ipAddress || null,
            deviceInfo.fingerprint || null,
            expiresAt
        ];
        
        try {
            const result = await pool.query(query, values);
            return { success: true, session: result.rows[0] };
        } catch (error) {
            console.error('Error creando sesión:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Verificar si una sesión está activa
    static async isSessionActive(tokenJti) {
        const query = `
            SELECT * FROM sesiones_activas 
            WHERE token_jti = $1 
            AND is_active = true 
            AND expires_at > NOW()
        `;
        
        try {
            const result = await pool.query(query, [tokenJti]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return null;
        }
    }
    
    // Actualizar última actividad de una sesión
    static async updateLastActivity(tokenJti) {
        const query = `
            UPDATE sesiones_activas 
            SET last_activity = NOW() 
            WHERE token_jti = $1 AND is_active = true
        `;
        
        try {
            await pool.query(query, [tokenJti]);
            return true;
        } catch (error) {
            console.error('Error actualizando actividad:', error);
            return false;
        }
    }
    
    // Invalidar una sesión específica
    static async invalidateSession(tokenJti) {
        const query = `
            UPDATE sesiones_activas 
            SET is_active = false 
            WHERE token_jti = $1
        `;
        
        try {
            const result = await pool.query(query, [tokenJti]);
            return result.rowCount > 0;
        } catch (error) {
            console.error('Error invalidando sesión:', error);
            return false;
        }
    }
    
    // Invalidar todas las sesiones de un usuario
    static async invalidateAllUserSessions(userId, exceptTokenJti = null) {
        let query = `
            UPDATE sesiones_activas 
            SET is_active = false 
            WHERE usuario_id = $1
        `;
        let values = [userId];
        
        if (exceptTokenJti) {
            query += ` AND token_jti != $2`;
            values.push(exceptTokenJti);
        }
        
        try {
            const result = await pool.query(query, values);
            return result.rowCount;
        } catch (error) {
            console.error('Error invalidando sesiones del usuario:', error);
            return 0;
        }
    }
    
    // Obtener sesiones activas de un usuario
    static async getUserActiveSessions(userId) {
        const query = `
            SELECT session_id, user_agent, ip_address, created_at, last_activity
            FROM sesiones_activas 
            WHERE usuario_id = $1 AND is_active = true AND expires_at > NOW()
            ORDER BY last_activity DESC
        `;
        
        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo sesiones del usuario:', error);
            return [];
        }
    }
    
    // Limpiar sesiones expiradas
    static async cleanExpiredSessions() {
        const query = `
            DELETE FROM sesiones_activas 
            WHERE expires_at < NOW() OR is_active = false
        `;
        
        try {
            const result = await pool.query(query);
            return result.rowCount;
        } catch (error) {
            console.error('Error limpiando sesiones expiradas:', error);
            return 0;
        }
    }
    
    // Generar fingerprint básico del dispositivo
    static generateDeviceFingerprint(userAgent, ipAddress) {
        const data = `${userAgent || 'unknown'}_${ipAddress || 'unknown'}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
    }
    
    // Verificar si el dispositivo coincide
    static verifyDeviceFingerprint(session, currentUserAgent, currentIpAddress) {
        if (!session.device_fingerprint) return true; // Si no hay fingerprint guardado, permitir
        
        const currentFingerprint = this.generateDeviceFingerprint(currentUserAgent, currentIpAddress);
        return session.device_fingerprint === currentFingerprint;
    }
}

module.exports = SessionManager;