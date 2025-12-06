// EJEMPLO DE IMPLEMENTACIÓN FRONTEND - NUEVO FLUJO DE LOGIN CON 2FA

class AuthService {
  
  /**
   * Método principal de login con 2FA integrado
   */
  async login(nombreUsuario, contrasenia, codigoOTP = null) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_usuario: nombreUsuario,
          contrasenia: contrasenia,
          codigo_otp: codigoOTP
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      // Si requiere OTP, devolver información para solicitar código
      if (data.requiresOTP) {
        return {
          success: true,
          requiresOTP: true,
          message: data.message,
          usuarioCodigo: data.usuario_codigo
        };
      }

      // Si login es exitoso, guardar token
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.usuario));
        return {
          success: true,
          requiresOTP: false,
          token: data.token,
          usuario: data.usuario
        };
      }

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Reenviar código OTP si el usuario no lo recibió
   */
  async reenviarOTP(usuarioCodigo) {
    try {
      const response = await fetch('/usuarios/reenviar-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario_codigo: usuarioCodigo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error reenviando OTP');
      }

      return data;
    } catch (error) {
      console.error('Error reenviando OTP:', error);
      throw error;
    }
  }

  /**
   * Logout seguro que invalida la sesión
   */
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await fetch('/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Limpiar datos locales
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún así limpiar datos locales
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  /**
   * Obtener sesiones activas del usuario
   */
  async getSesionesActivas() {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/sesiones-activas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo sesiones');
      }

      return data.sesiones;
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw error;
    }
  }

  /**
   * Cerrar todas las otras sesiones del usuario
   */
  async cerrarOtrasSesiones() {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/invalidar-otras-sesiones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error cerrando sesiones');
      }

      return data;
    } catch (error) {
      console.error('Error cerrando otras sesiones:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Obtener datos del usuario logueado
   */
  getUsuario() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Obtener token de autenticación
   */
  getToken() {
    return localStorage.getItem('authToken');
  }
}

// EJEMPLO DE USO EN COMPONENTE DE LOGIN
class LoginComponent {
  constructor() {
    this.authService = new AuthService();
    this.currentStep = 'credentials'; // 'credentials' | 'otp'
    this.usuarioCodigo = null;
  }

  async handleSubmit(formData) {
    try {
      if (this.currentStep === 'credentials') {
        // Primer paso: validar credenciales
        const result = await this.authService.login(
          formData.nombreUsuario, 
          formData.contrasenia
        );

        if (result.requiresOTP) {
          // Cambiar a paso de OTP
          this.currentStep = 'otp';
          this.usuarioCodigo = result.usuarioCodigo;
          this.showMessage(result.message);
        } else if (result.success) {
          // Login exitoso directo (no debería pasar con 2FA activo)
          this.redirectToDashboard();
        }
      } 
      else if (this.currentStep === 'otp') {
        // Segundo paso: validar OTP
        const result = await this.authService.login(
          formData.nombreUsuario,
          formData.contrasenia,
          formData.codigoOTP
        );

        if (result.success) {
          this.showMessage('Login exitoso');
          this.redirectToDashboard();
        }
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleReenviarOTP() {
    try {
      await this.authService.reenviarOTP(this.usuarioCodigo);
      this.showMessage('Nuevo código enviado a tu correo');
    } catch (error) {
      this.showError(error.message);
    }
  }

  showMessage(message) {
    // Implementar notificación de éxito
    console.log('SUCCESS:', message);
  }

  showError(error) {
    // Implementar notificación de error
    console.error('ERROR:', error);
  }

  redirectToDashboard() {
    // Redirigir al dashboard principal
    window.location.href = '/dashboard';
  }
}

// EJEMPLO DE USO EN ANGULAR SERVICE
/*
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  async login(nombreUsuario: string, contrasenia: string, codigoOTP?: string) {
    const loginData = {
      nombre_usuario: nombreUsuario,
      contrasenia: contrasenia,
      ...(codigoOTP && { codigo_otp: codigoOTP })
    };

    return this.http.post<any>('/login', loginData).toPromise();
  }

  async logout() {
    await this.http.post('/logout', {}).toPromise();
    this.router.navigate(['/login']);
  }

  getSesionesActivas() {
    return this.http.get<any>('/sesiones-activas').toPromise();
  }
}
*/
