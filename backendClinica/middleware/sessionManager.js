const crypto = require('crypto');
const { getConnection, oracledb } = require('../configuracion/oraclePool');

class SessionManager {

    // Crear una nueva sesión
    static async createSession(userId, tokenJti, deviceInfo = {}) {
        const sessionUuid = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        const sql = `
            INSERT INTO SESIONES_ACTIVAS
            (usuario_id, session_uuid, token_jti, user_agent, ip_address, device_fingerprint, expires_at)
            VALUES (:userId, :sessionUuid, :tokenJti, :ua, :ip, :finger, :expires)
            RETURNING sesion_id INTO :outId
        `;

        const binds = {
            userId,
            sessionUuid,
            tokenJti,
            ua: deviceInfo.userAgent || null,
            ip: deviceInfo.ipAddress || null,
            finger: deviceInfo.fingerprint || null,
            expires: expiresAt,
            outId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        let conn;
        try {
            conn = await getConnection();
            const result = await conn.execute(sql, binds, { autoCommit: true });

            return {
                success: true,
                session: {
                    sesion_id: result.outBinds.outId[0],
                    session_uuid: sessionUuid,
                    token_jti: tokenJti
                }
            };
        } catch (err) {
            console.error("Error creando sesión:", err);
            return { success: false, error: err.message };
        } finally {
            if (conn) {
                try { await conn.close(); } catch (e) {}
            }
        }
    }

    // Verificar sesión activa
    static async isSessionActive(tokenJti) {
        const sql = `
            SELECT * FROM SESIONES_ACTIVAS
            WHERE token_jti = :token
              AND is_active = 1
              AND expires_at > SYSDATE
        `;

        let conn;
        try {
            conn = await getConnection();
            const result = await conn.execute(sql, { token: tokenJti });
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (err) {
            console.error("Error verificando sesión:", err);
            return null;
        } finally {
            if (conn) {
                try { await conn.close(); } catch (e) {}
            }
        }
    }

    // Actualizar actividad
    static async updateLastActivity(tokenJti) {
        const sql = `
            UPDATE SESIONES_ACTIVAS
            SET last_activity = SYSDATE
            WHERE token_jti = :token AND is_active = 1
        `;

        let conn;
        try {
            conn = await getConnection();
            await conn.execute(sql, { token: tokenJti }, { autoCommit: true });
            return true;
        } catch (err) {
            console.error("Error actualizando actividad:", err);
            return false;
        } finally {
            if (conn) {
                try { await conn.close(); } catch (e) {}
            }
        }
    }

    // Invalidar una sesión
    static async invalidateSession(tokenJti) {
        const sql = `
            UPDATE SESIONES_ACTIVAS
            SET is_active = 0
            WHERE token_jti = :token
        `;

        let conn;
        try {
            conn = await getConnection();
            const result = await conn.execute(sql, { token: tokenJti }, { autoCommit: true });
            return result.rowsAffected > 0;
        } catch (err) {
            console.error("Error invalidando sesión:", err);
            return false;
        } finally {
            if (conn) {
                try { await conn.close(); } catch (e) {}
            }
        }
    }

    // Invalidar todas las sesiones de un usuario
    static async invalidateAllUserSessions(userId, exceptTokenJti = null) {
        let sql = `UPDATE SESIONES_ACTIVAS SET is_active = 0 WHERE usuario_id = :id`;
        const binds = { id: userId };

        if (exceptTokenJti) {
            sql += ` AND token_jti != :token`;
            binds.token = exceptTokenJti;
        }

        let conn;
        try {
            conn = await getConnection();
            const result = await conn.execute(sql, binds, { autoCommit: true });
            return result.rowsAffected;
        } catch (err) {
            console.error("Error invalidando sesiones:", err);
            return 0;
        } finally {
            if (conn) {
                try { await conn.close(); } catch (e) {}
            }
        }
    }

    // Generar fingerprint
    static generateDeviceFingerprint(userAgent, ipAddress) {
        const data = `${userAgent || 'unknown'}_${ipAddress || 'unknown'}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
    }

    // Verificar fingerprint
    static verifyDeviceFingerprint(session, currentUserAgent, currentIpAddress) {
        if (!session.DEVICE_FINGERPRINT) return true;

        const current = this.generateDeviceFingerprint(currentUserAgent, currentIpAddress);
        return session.DEVICE_FINGERPRINT === current;
    }
}

module.exports = SessionManager;
