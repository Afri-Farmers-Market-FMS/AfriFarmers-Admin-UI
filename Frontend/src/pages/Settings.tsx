import { useState, useEffect } from 'react';
import { User, Shield, Save, Users, Plus, Trash2, Edit, AlertCircle, Lock, ShieldCheck, Smartphone, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService, authService, SystemUser } from '../services/api';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const canManageUsers = user?.role === 'Super Admin';
  
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'security'>('profile');
  
  // Users State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [show2FADisableModal, setShow2FADisableModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');

  // --- Modal States ---
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // --- Form States ---
  const [formData, setFormData] = useState<{name: string, email: string, role: 'Super Admin' | 'Admin' | 'Viewer', password?: string, status: 'Active' | 'Inactive'}>({ 
    name: '', email: '', role: 'Viewer', password: '', status: 'Active' 
  });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  // Fetch users on mount
  useEffect(() => {
    if (canManageUsers && activeTab === 'users') {
      fetchUsers();
    }
  }, [canManageUsers, activeTab]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setIs2FAEnabled(user.twoFactorEnabled || false);
    }
  }, [user]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenUserModal = (userToEdit?: SystemUser) => {
    setModalError('');
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({ 
        name: userToEdit.name, 
        email: userToEdit.email, 
        role: userToEdit.role as any, 
        password: '',
        status: userToEdit.status || 'Active'
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'Viewer', password: '', status: 'Active' });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await userService.update(editingUser._id, updateData);
      } else {
        // Create new user
        if (!formData.password) {
          setModalError('Password is required for new users');
          setModalLoading(false);
          return;
        }
        await userService.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          status: formData.status
        });
      }
      await fetchUsers();
      setShowUserModal(false);
    } catch (error: any) {
      setModalError(error.message || 'Failed to save user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if(confirm('Are you sure you want to remove this user access?')) {
      try {
        await userService.delete(id);
        await fetchUsers();
      } catch (error: any) {
        alert(error.message || 'Failed to delete user');
      }
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      await authService.updateProfile(profileData);
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setModalError("New passwords do not match");
      return;
    }
    
    setModalLoading(true);
    setModalError('');
    
    try {
      await authService.changePassword(passwordData.current, passwordData.new);
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      alert("Password updated successfully!");
    } catch (error: any) {
      setModalError(error.message || 'Failed to change password');
    } finally {
      setModalLoading(false);
    }
  };

  // 2FA Setup
  const handleSetup2FA = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      const response = await authService.setup2FA();
      setQrCodeDataUrl(response.qrCodeDataUrl);
      setTwoFactorSecret(response.secret);
      setShow2FASetupModal(true);
    } catch (error: any) {
      setTwoFactorError(error.message || 'Failed to setup 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      await authService.verify2FA(verificationCode);
      setIs2FAEnabled(true);
      await refreshUser();
      setShow2FASetupModal(false);
      setVerificationCode('');
      setQrCodeDataUrl('');
      setTwoFactorSecret('');
    } catch (error: any) {
      setTwoFactorError(error.message || 'Invalid verification code');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      await authService.disable2FA(disablePassword);
      setIs2FAEnabled(false);
      await refreshUser();
      setShow2FADisableModal(false);
      setDisablePassword('');
    } catch (error: any) {
      setTwoFactorError(error.message || 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const menuItems = [
      { id: 'profile', label: 'My Profile', icon: User },
      ...(canManageUsers ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
      { id: 'security', label: 'Security & Access', icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Sidebar Menu */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900 border-l-4 border-green-600 pl-3">System Settings</h2>
            </div>
            <div className="p-2 space-y-1">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === item.id 
                            ? 'bg-green-50 text-green-700' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <item.icon size={18} className={activeTab === item.id ? 'text-green-600' : 'text-gray-400'} />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-1 custom-scrollbar">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <User className="mr-2 text-green-600" size={20} />
                            My Profile
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold border-4 border-white shadow-sm">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{user?.name}</h4>
                                <p className="text-sm text-gray-500">{user?.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`} disabled={isViewer} readOnly={isViewer} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`} disabled={isViewer} readOnly={isViewer} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+250 788 123 456" className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`} disabled={isViewer} readOnly={isViewer} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">System Role</label>
                                <div className={`flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg font-medium ${
                                    user?.role === 'Super Admin' ? 'bg-purple-50 text-purple-800' :
                                    user?.role === 'Admin' ? 'bg-blue-50 text-blue-800' :
                                    'bg-gray-50 text-gray-800'
                                }`}>
                                    <Shield size={16}/> {user?.role || 'Viewer'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end items-center gap-3">
                        {profileSuccess && (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                                <CheckCircle size={16} /> Profile saved successfully
                            </span>
                        )}
                        {!isViewer ? (
                            <button onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all focus:ring-4 focus:ring-green-500/20 disabled:opacity-50">
                                {profileSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                                Save Changes
                            </button>
                        ) : (
                            <span className="text-sm text-gray-500 italic">Profile editing is disabled for Viewers</span>
                        )}
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Users className="mr-2 text-green-600" size={20} />
                            User Management
                        </h3>
                        <button onClick={() => handleOpenUserModal()} className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-bold transition-colors">
                            <Plus size={16} className="mr-1" /> Add New User
                        </button>
                    </div>
                    
                    <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <AlertCircle size={14}/> Role Definitions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                                <span className="font-bold text-gray-900 block mb-1">Super Admin</span>
                                <p className="text-gray-500 text-xs">Full system access + User Management + Security Control.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                                <span className="font-bold text-gray-900 block mb-1">Admin</span>
                                <p className="text-gray-500 text-xs">Read/Write Content. 2FA Supported. No User Management.</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                                <span className="font-bold text-gray-900 block mb-1">Viewer</span>
                                <p className="text-gray-500 text-xs">Read-only. Masked credentials (NID hidden). No exports.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {usersLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 size={32} className="animate-spin text-green-600 mx-auto" />
                                <p className="mt-2 text-gray-500">Loading users...</p>
                            </div>
                        ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">2FA</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.filter(u => u._id !== user?.id && u.email !== user?.email).map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                u.role === 'Super Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                u.role === 'Admin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div> {u.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.twoFactorEnabled ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><ShieldCheck size={14} /> Enabled</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Disabled</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenUserModal(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Permissions">
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                                    title="Delete User"
                                                    disabled={u.role === 'Super Admin' || u._id === user?.id}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <ShieldCheck className="mr-2 text-green-600" size={20} />
                                Security Settings
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-8">
                                <div className={`p-3 rounded-lg ${isViewer ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-600'}`}>
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900">Password Management</h4>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">Update your account password regularly to keep your account secure.</p>
                                    {!isViewer ? (
                                        <button onClick={() => { setShowPasswordModal(true); setModalError(''); }} className="text-sm font-bold text-green-600 hover:text-green-700 border border-green-200 hover:bg-green-50 px-4 py-2 rounded-lg transition-all">Change Password</button>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Password change is disabled for Viewers</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg transition-colors ${is2FAEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                Two-Factor Authentication (2FA)
                                                {is2FAEnabled && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase rounded-full">Enabled</span>}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1 max-w-lg">
                                                Add an extra layer of security to your account. When enabled, you'll need to provide a code from your authenticator app to access the system.
                                            </p>
                                            <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded inline-block">
                                                Requirement: <span className="font-medium text-gray-600">Super Admin</span> & <span className="font-medium text-gray-600">Admin</span> roles only.
                                            </div>
                                            
                                            {twoFactorError && (
                                                <div className="mt-3 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={14} /> {twoFactorError}
                                                </div>
                                            )}
                                            
                                            {!isViewer && (
                                                <div className="mt-4">
                                                    {is2FAEnabled ? (
                                                        <button 
                                                            onClick={() => { setShow2FADisableModal(true); setTwoFactorError(''); }}
                                                            className="text-sm font-bold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                                                        >
                                                            Disable 2FA
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={handleSetup2FA}
                                                            disabled={twoFactorLoading}
                                                            className="text-sm font-bold text-green-600 hover:text-green-700 border border-green-200 hover:bg-green-50 px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {twoFactorLoading && <Loader2 size={14} className="animate-spin" />}
                                                            Enable 2FA
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingUser ? 'Edit User Access' : 'Add New User'}
                            </h3>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    placeholder="e.g. Jean Pierre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    placeholder="email@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    {editingUser ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <input
                                    required={!editingUser}
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    placeholder={editingUser ? "Leave blank to keep current" : "Set initial password"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Assign Role</label>
                                <div className="space-y-2">
                                    {(['Super Admin', 'Admin', 'Viewer'] as const).map(role => (
                                        <label key={role} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            formData.role === role ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role}
                                                checked={formData.role === role}
                                                onChange={() => setFormData({ ...formData, role })}
                                                className="hidden"
                                            />
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                formData.role === role ? 'border-green-600' : 'border-gray-300'
                                            }`}>
                                                {formData.role === role && <div className="w-2 h-2 rounded-full bg-green-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className={`block text-sm font-bold ${formData.role === role ? 'text-green-900' : 'text-gray-700'}`}>
                                                    {role}
                                                </span>
                                                <span className="block text-xs text-gray-500">
                                                    {role === 'Super Admin' ? 'Full control & User Management' : 
                                                     role === 'Admin' ? 'Can edit content, no user management' : 
                                                     'Read-only access to data'}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {modalLoading && <Loader2 size={16} className="animate-spin" />}
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {modalLoading && <Loader2 size={16} className="animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FASetupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Setup Two-Factor Authentication</h3>
                            <button onClick={() => { setShow2FASetupModal(false); setVerificationCode(''); setTwoFactorError(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleVerify2FA} className="p-6 space-y-4">
                            {twoFactorError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} /> {twoFactorError}
                                </div>
                            )}
                            
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                                
                                {qrCodeDataUrl && (
                                    <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                )}
                                
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Or enter this code manually:</p>
                                    <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200 select-all">
                                        {twoFactorSecret}
                                    </code>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Verification Code</label>
                                <p className="text-xs text-gray-500 mb-2">Enter the 6-digit code from your authenticator app to verify setup</p>
                                <input
                                    required
                                    type="text"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => { setShow2FASetupModal(false); setVerificationCode(''); setTwoFactorError(''); }} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={twoFactorLoading || verificationCode.length !== 6}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {twoFactorLoading && <Loader2 size={16} className="animate-spin" />}
                                    Enable 2FA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Disable Modal */}
            {show2FADisableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Disable Two-Factor Authentication</h3>
                            <button onClick={() => { setShow2FADisableModal(false); setDisablePassword(''); setTwoFactorError(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleDisable2FA} className="p-6 space-y-4">
                            {twoFactorError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} /> {twoFactorError}
                                </div>
                            )}
                            
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    <strong>Warning:</strong> Disabling 2FA will make your account less secure. You'll only need your email and password to log in.
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                                <p className="text-xs text-gray-500 mb-2">Enter your password to confirm</p>
                                <input
                                    required
                                    type="password"
                                    value={disablePassword}
                                    onChange={e => setDisablePassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => { setShow2FADisableModal(false); setDisablePassword(''); setTwoFactorError(''); }} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={twoFactorLoading || !disablePassword}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {twoFactorLoading && <Loader2 size={16} className="animate-spin" />}
                                    Disable 2FA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default Settings;
