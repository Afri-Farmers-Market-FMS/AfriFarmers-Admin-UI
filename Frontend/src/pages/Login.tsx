import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ChevronRight, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    
    // 2FA State
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    
    const { login, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);

        console.log('🔐 Login form submitted', { email, requiresTwoFactor, hasTwoFactorCode: !!twoFactorCode });

        try {
            // Pass the 2FA code if we're on the verification step
            console.log('📤 Calling login...');
            const result = await login(email, password, requiresTwoFactor ? twoFactorCode : undefined);
            console.log('📥 Login result:', result);
            
            if (result.requiresTwoFactor) {
                console.log('🔐 2FA required - showing 2FA screen');
                setRequiresTwoFactor(true);
                setLocalLoading(false);
                return;
            }
            
            // Success - navigate to dashboard
            console.log('✅ Login successful, navigating to dashboard');
            setLocalLoading(false);
            navigate('/');
        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError(err.message || 'Invalid email or password.');
            // Clear the 2FA code on error so user can re-enter
            if (requiresTwoFactor) {
                setTwoFactorCode('');
            }
            setLocalLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setRequiresTwoFactor(false);
        setTwoFactorCode('');
        setError('');
        setPassword(''); // Also clear password when going back
    };

    const isLoading = localLoading || authLoading;

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="bg-green-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1625246333195-bf466d3a8552?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3 overflow-hidden border-2 border-green-700">
                            <img src={logo} alt="Afri-Farmers Logo" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                        <p className="text-green-200 text-sm mt-1">Sign in to AFM Administration Portal</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {!requiresTwoFactor ? (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            required
                                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                                                {/* ...existing code... */}

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-700/20 hover:bg-green-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>Sign In <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} /></>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* 2FA Verification Step */}
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Shield size={32} className="text-green-700" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter the 6-digit code from your authenticator app
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Verification Code</label>
                                    <input 
                                        type="text" 
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-center text-2xl tracking-widest font-mono"
                                        placeholder="000000"
                                        value={twoFactorCode}
                                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        autoFocus
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading || twoFactorCode.length !== 6}
                                    className="w-full py-3.5 bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-700/20 hover:bg-green-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>Verify <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} /></>
                                    )}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={handleBackToLogin}
                                    className="w-full py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    ← Back to Login
                                </button>
                            </>
                        )}
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs">
                            © 2026 Afri-Farmers Market. Secure Access Only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
