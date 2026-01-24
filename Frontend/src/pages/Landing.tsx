import { useNavigate } from 'react-router-dom';
import { Sprout, ShieldCheck, Users, BarChart3, ArrowRight } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="bg-green-700 text-white p-2 rounded-lg">
                        <Sprout size={24} />
                    </div>
                    <span className="text-xl font-bold text-green-900 tracking-tight">Afri-Farmers Market</span>
                </div>
                <button 
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-all shadow-lg shadow-green-700/20"
                >
                    Login to Portal
                </button>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 font-bold text-xs uppercase tracking-wider mb-8 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                    National Farmer Registry System
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-green-950 mb-6 leading-tight">
                    Empowering Agriculture <br/> Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Digital Data</span>
                </h1>
                
                <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
                    A comprehensive management system for tracking farmer profiles, 
                    monitoring agricultural output, and facilitating data-driven decisions for cooperatives and government bodies.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-green-700 text-white rounded-xl font-bold text-lg hover:bg-green-800 transition-all shadow-xl shadow-green-700/20 flex items-center justify-center gap-2 group"
                    >
                        Access Dashboard <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-white text-green-800 border border-green-200 rounded-xl font-bold text-lg hover:bg-green-50 transition-all">
                        Learn More
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 hover:border-green-200 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Farmer Profiles</h3>
                        <p className="text-gray-500 text-sm"> comprehensive database of farmers including demographics, location, and business size.</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 hover:border-green-200 transition-colors">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Yield Analytics</h3>
                        <p className="text-gray-500 text-sm">Real-time visualization of agricultural data, seasonal trends, and regional output metrics.</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 hover:border-green-200 transition-colors">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Secure Access</h3>
                        <p className="text-gray-500 text-sm">Role-based authentication ensuring data privacy and restricted access to sensitive information.</p>
                    </div>
                </div>
            </main>

            <footer className="p-6 text-center text-green-800/60 text-sm font-medium">
                © 2026 Afri-Farmers Market System. restricted Access.
            </footer>
        </div>
    );
};

export default Landing;
