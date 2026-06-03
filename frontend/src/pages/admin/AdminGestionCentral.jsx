import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Users, ShieldCheck, Activity, Settings, ArrowLeft, Edit3, Trash2, Plus,
  Save, RefreshCw, AlertCircle, CheckCircle2, UserPlus, Eye, EyeOff, Lock
} from 'lucide-react';
import AdminAuditorias from './AdminAuditorias';

export default function AdminGestionCentral() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'auditorias', 'users', 'settings'
  const { token, admin: currentAdmin } = useContext(AuthContext);

  // Admin CRUD states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null for new, user object for edit
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [showPassword, setShowPassword] = useState(false);

  // System settings states
  const [settings, setSettings] = useState({ activeYear: new Date().getFullYear(), preinscripcionesAbiertas: true, examenesAbiertos: true });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Alerts
  const [alert, setAlert] = useState({ text: '', type: '' });

  const showAlert = (text, type = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert({ text: '', type: '' }), 4000);
  };

  // ----------------------------------------------------
  // SETTINGS CONTROLLER LOGIC
  // ----------------------------------------------------
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await fetch('http://localhost:5000/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        showAlert('Configuración general actualizada correctamente.');
      } else {
        const err = await response.json();
        showAlert(err.message || 'Error al guardar configuración.', 'error');
      }
    } catch (error) {
      showAlert('Error al conectar con el servidor.', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  // ----------------------------------------------------
  // ADMIN CRUD LOGIC
  // ----------------------------------------------------
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error al obtener administradores:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const openNewUserModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'admin' });
    setShowPassword(false);
    setUserModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setShowPassword(false);
    setUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || (!editingUser && !formData.password)) {
      showAlert('Por favor, complete todos los campos obligatorios.', 'error');
      return;
    }

    try {
      setUsersLoading(true);
      const url = editingUser
        ? `http://localhost:5000/api/auth/users/${editingUser._id}`
        : 'http://localhost:5000/api/auth/users';

      const method = editingUser ? 'PUT' : 'POST';
      const body = { ...formData };
      if (editingUser && !body.password) {
        delete body.password; // Do not update password if blank
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        showAlert(editingUser ? 'Administrador actualizado correctamente.' : 'Nuevo administrador registrado con éxito.');
        setUserModalOpen(false);
        fetchUsers();
      } else {
        const err = await response.json();
        showAlert(err.message || 'Error al procesar la solicitud.', 'error');
      }
    } catch (error) {
      showAlert('Error al conectar con el servidor.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentAdmin._id) {
      showAlert('No puedes eliminar tu propia cuenta.', 'error');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que quieres eliminar la cuenta del administrador "${user.username}"?`)) {
      return;
    }

    try {
      setUsersLoading(true);
      const response = await fetch(`http://localhost:5000/api/auth/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showAlert('Administrador eliminado con éxito.');
        fetchUsers();
      } else {
        const err = await response.json();
        showAlert(err.message || 'Error al eliminar administrador.', 'error');
      }
    } catch (error) {
      showAlert('Error al conectar con el servidor.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // Render Subviews
  if (activeTab === 'auditorias') {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('menu')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Gestión Central ➔ Auditorías</span>
        </div>
        <AdminAuditorias />
      </div>
    );
  }

  if (activeTab === 'users') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('menu')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Administradores del Sistema</h2>
              <p className="text-slate-500 text-sm mt-1">Crea, edita y administra los permisos de acceso al panel.</p>
            </div>
          </div>

          <button
            onClick={openNewUserModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer border border-transparent active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Administrador
          </button>
        </div>

        {alert.text && (
          <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-sm">{alert.text}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {usersLoading ? (
            <div className="p-12 text-center flex flex-col justify-center items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Procesando información de administradores...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol / Privilegio</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Alta</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{user.username}</span>
                        {user._id === currentAdmin._id && (
                          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 border text-[9px] font-extrabold text-slate-500 rounded uppercase">Tú</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-650 font-medium">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${user.role === 'superadmin'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="inline-flex p-1.5 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user._id === currentAdmin._id}
                          className="inline-flex p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Form Modal */}
        {userModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 transform scale-100 transition-transform">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">
                    {editingUser ? 'Editar Administrador' : 'Nuevo Administrador'}
                  </h3>
                </div>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold bg-transparent border-none text-xl"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de Usuario</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ej: javi.ies"
                    className="px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm bg-slate-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ej: administrador@ieslacocha.edu.ar"
                    className="px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm bg-slate-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                    {editingUser && (
                      <span className="text-[10px] text-slate-400 font-bold">(Dejar en blanco para no modificar)</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Nueva contraseña..." : "Contraseña de acceso"}
                      className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rol de Acceso</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={editingUser && editingUser._id === currentAdmin._id}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm bg-white font-medium text-slate-700 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="admin">Administrador estándar (Admin)</option>
                    <option value="superadmin">Superusuario de Control (Superadmin)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2 border border-slate-250 text-slate-650 hover:bg-slate-50 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg text-sm font-bold shadow-md cursor-pointer"
                  >
                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('menu')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Configuración General del Sistema</h2>
            <p className="text-slate-500 text-sm mt-1">Configura los parámetros globales de la dashboard y portales públicos.</p>
          </div>
        </div>

        {alert.text && (
          <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-sm">{alert.text}</span>
          </div>
        )}

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {settingsLoading ? (
            <div className="p-12 text-center flex flex-col justify-center items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Cargando parámetros globales...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6">

              {/* Active Year */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Año Lectivo Activo</h3>
                  <p className="text-slate-500 text-xs max-w-md">
                    Controla qué año académico se muestra y filtra de forma predeterminada tanto en el panel administrativo como en los portales públicos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={settings.activeYear}
                    onChange={(e) => setSettings({ ...settings, activeYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/45 font-bold text-center text-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Preinscriptions Toggle */}
              <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Preinscripciones de Ingreso</h3>
                    <p className="text-slate-500 text-xs max-w-md">
                      Habilita o deshabilita los envíos de nuevos alumnos interesados en cursar en el IES La Cocha desde el sitio web público.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.preinscripcionesAbiertas}
                      onChange={(e) => setSettings({ ...settings, preinscripcionesAbiertas: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Desde (Opcional)</label>
                    <input
                      type="date"
                      value={settings.preinscripcionesInicio ? settings.preinscripcionesInicio.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, preinscripcionesInicio: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Hasta (Opcional)</label>
                    <input
                      type="date"
                      value={settings.preinscripcionesFin ? settings.preinscripcionesFin.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, preinscripcionesFin: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Exam Enrollments Toggle */}
              <div className="flex flex-col gap-4 pb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Inscripciones a Exámenes</h3>
                    <p className="text-slate-500 text-xs max-w-md">
                      Controla si los alumnos activos del instituto pueden rellenar el formulario de inscripción para rendir mesas de examen final.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.examenesAbiertos}
                      onChange={(e) => setSettings({ ...settings, examenesAbiertos: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                  <div className="sm:col-span-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fechas del Primer Llamado</h4>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Desde (Opcional)</label>
                    <input
                      type="date"
                      value={settings.examenes1LlamadoInicio ? settings.examenes1LlamadoInicio.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, examenes1LlamadoInicio: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Hasta (Opcional)</label>
                    <input
                      type="date"
                      value={settings.examenes1LlamadoFin ? settings.examenes1LlamadoFin.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, examenes1LlamadoFin: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fechas del Segundo Llamado</h4>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Desde (Opcional)</label>
                    <input
                      type="date"
                      value={settings.examenes2LlamadoInicio ? settings.examenes2LlamadoInicio.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, examenes2LlamadoInicio: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Hasta (Opcional)</label>
                    <input
                      type="date"
                      value={settings.examenes2LlamadoFin ? settings.examenes2LlamadoFin.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, examenes2LlamadoFin: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fechas del Llamado Especial</h4>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Desde (Opcional)</label>
                    <input
                      type="date"
                      value={settings.examenesEspLlamadoInicio ? settings.examenesEspLlamadoInicio.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, examenesEspLlamadoInicio: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habilitar Hasta (Opcional)</label>
                    <input
                      type="date"
                      value={settings.examenesEspLlamadoFin ? settings.examenesEspLlamadoFin.substring(0, 10) : ''}
                      onChange={(e) => setSettings({ ...settings, examenesEspLlamadoFin: e.target.value || null })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 pl-4 border-l-4 border-l-primary">
                  <AlertCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-650 leading-relaxed font-semibold">
                    <span className="font-bold text-slate-800">Nota sobre Calendario Escolar:</span> Las fechas de inscripción para los exámenes se configuran de forma global arriba para todos los llamados. Los rangos de las mesas de exámenes en sí y los tribunales específicos continúan programándose en el módulo de <strong className="text-primary font-bold">Planificación &gt; Fechas Exámenes</strong> de cada carrera.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // DEFAULT MENU VIEW (3 CARDS)
  // ----------------------------------------------------
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-955 bg-red-950/40 text-red-300 border border-red-900/50 rounded-full text-xs font-bold shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
            Acceso SuperUsuario
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestión Central y Seguridad
          </h2>
          <p className="text-slate-400 text-sm max-w-md mt-1">
            Panel restringido para la administración global de accesos, auditorías completas y configuración del sistema del IES La Cocha.
          </p>
        </div>
      </div>

      {/* Grid of 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Users Management */}
        <button
          onClick={() => setActiveTab('users')}
          className="group text-left bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-56 cursor-pointer relative"
        >
          <div className="space-y-4 w-full">
            <div className="h-12 w-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                Administradores
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Dar de alta nuevos usuarios, modificar accesos, resetear contraseñas y dar de baja administradores del panel.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 group-hover:text-primary flex items-center gap-1 group-hover:translate-x-1 transition-all pt-4 border-t border-slate-100 w-full">
            Gestionar Usuarios &rarr;
          </span>
        </button>

        {/* Card 2: Audit Logs */}
        <button
          onClick={() => setActiveTab('auditorias')}
          className="group text-left bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-56 cursor-pointer relative"
        >
          <div className="space-y-4 w-full">
            <div className="h-12 w-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                Auditoría del Sistema
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Ver el registro completo de logs. Rastrear acciones detalladas (crear, modificar, borrar) agrupadas y filtradas por módulo.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 group-hover:text-primary flex items-center gap-1 group-hover:translate-x-1 transition-all pt-4 border-t border-slate-100 w-full">
            Revisar Bitácora &rarr;
          </span>
        </button>

        {/* Card 3: Global System Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className="group text-left bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-56 cursor-pointer relative"
        >
          <div className="space-y-4 w-full">
            <div className="h-12 w-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary shrink-0">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                Configuración General
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Personalizar el año académico activo y abrir/cerrar los formularios públicos de preinscripción e inscripción a examen.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 group-hover:text-primary flex items-center gap-1 group-hover:translate-x-1 transition-all pt-4 border-t border-slate-100 w-full">
            Ajustar Parámetros &rarr;
          </span>
        </button>

      </div>
    </div>
  );
}
