import { useState } from 'react';
import { login } from '../services/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('codelab_token', data.token);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-box">C</div>
          <h1>CodeLAB</h1>
          <p>Sistema de Gestión de Inventario</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              className="form-control"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-control"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? <><span className="spinner"></span> Ingresando...</> : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="credentials-hint">
          <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Credenciales de prueba:</p>
          <p><code>admin</code> / <code>admin123</code> — Rol: Administrador</p>
          <p style={{ marginTop: 4 }}><code>viewer</code> / <code>viewer123</code> — Rol: Solo lectura</p>
        </div>
      </div>
    </div>
  );
}
