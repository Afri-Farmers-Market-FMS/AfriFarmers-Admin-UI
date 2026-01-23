import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    // Specific credentials for demo
    const CREDENTIALS = {
        'super@afrifarmers.com': { password: 'password123', role: 'Super Admin', name: 'John Doe' },
        'admin@afrifarmers.com': { password: 'password123', role: 'Admin', name: 'Jane Smith' },
        'viewer@afrifarmers.com': { password: 'password123', role: 'Viewer', name: 'Guest User' }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            const userKey = email.toLowerCase() as keyof typeof CREDENTIALS;
            const validUser = CREDENTIALS[userKey];

            if (validUser && validUser.password === password) {
                login(email, validUser.role as any, validUser.name);
                navigate('/dashboard');
            } else {
                setError('Invalid email or password. Please check the demo credentials.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="bg-green-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1625246333195-bf466d3a8552?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-700 mb-4 shadow-lg transform rotate-3">
                            <Sprout size={32} />
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

                        {/* Demo Hint */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                           <p className="font-bold mb-1">Demo Credentials:</p>
                           <ul className="space-y-1 pl-3 list-disc">
                             <li><span className="font-semibold">Super:</span> super@afrifarmers.com / password123</li>
                             <li><span className="font-semibold">Admin:</span> admin@afrifarmers.com / password123</li>
                             <li><span className="font-semibold">Viewer:</span> viewer@afrifarmers.com / password123</li>
                           </ul>
                        </div>

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
