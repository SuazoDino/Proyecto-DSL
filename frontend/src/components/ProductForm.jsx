import { useState } from 'react';
import { addProduct } from '../services/api';

const CATEGORIAS = ['Electrónica', 'Ropa', 'Alimentos', 'Herramientas', 'Muebles'];

const emptyForm = {
  nombre: '',
  categoria: 'Electrónica',
  precio: '',
  stock: '',
  proveedor: '',
  fecha_ingreso: new Date().toISOString().split('T')[0],
};

export default function ProductForm({ onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.nombre.trim() || !form.proveedor.trim()) {
      setError('Nombre y proveedor son requeridos');
      return;
    }
    if (isNaN(parseFloat(form.precio)) || parseFloat(form.precio) < 0) {
      setError('El precio debe ser un número positivo');
      return;
    }
    if (isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) {
      setError('El stock debe ser un entero positivo');
      return;
    }
    setLoading(true);
    try {
      const result = await addProduct({
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
      });
      setSuccess(result.message);
      setForm(emptyForm);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">Agregar Nuevo Producto</div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: 12 }}><span>✓</span> {success}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}><span>✕</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Producto</label>
            <input
              className="form-control"
              type="text"
              placeholder="Ej: Laptop Lenovo ThinkPad"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              required
            />
          </div>

          <div className="modal-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de Ingreso</label>
              <input
                className="form-control"
                type="date"
                value={form.fecha_ingreso}
                onChange={e => set('fecha_ingreso', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Precio (S/.)</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.precio}
                onChange={e => set('precio', e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Stock (unidades)</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Proveedor</label>
            <input
              className="form-control"
              type="text"
              placeholder="Ej: TechDistrib SAC"
              value={form.proveedor}
              onChange={e => set('proveedor', e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Guardando...</> : '+ Agregar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
