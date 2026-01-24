import { LayoutDashboard, Users, Settings, PieChart, LogOut, Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get user initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/farmers", icon: <Users size={20} />, label: "Business Directory" },
        { to: "/analytics", icon: <PieChart size={20} />, label: "Analytics" },
        { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
    ];

    return (
        <header className="bg-green-900 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-full border-2 border-green-700 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                            <img src={logo} alt="Afri-Farmers Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-white leading-none">Afri-Farmers Market</span>
                            <span className="text-xs block text-green-300 font-medium tracking-wide">FMS (Farmer Management System)</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-green-800 text-white shadow-inner"
                                            : "text-green-100 hover:bg-green-800/50 hover:text-white"
                                    }`
                                }
                            >
                                <span className="mr-2 opacity-80">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="hidden md:flex items-center pl-4 border-l border-green-800 ml-4">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-green-100 hover:text-white transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center border border-green-600">
                                <span className="font-bold text-xs">{user ? getInitials(user.name) : 'U'}</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{user?.name || 'User'}</span>
                                <span className="text-[10px] text-green-300">{user?.role || 'Guest'}</span>
                            </div>
                            <LogOut size={16} className="ml-2 opacity-75" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                         <button onClick={toggleMenu} className="p-2 rounded-md text-green-200 hover:text-white hover:bg-green-800 focus:outline-none">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-green-900 border-t border-green-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-3 rounded-md text-base font-medium ${
                                        isActive
                                            ? "bg-green-800 text-white"
                                            : "text-green-100 hover:bg-green-800 hover:text-white"
                                    }`
                                }
                            >
                                <span className="mr-3 opacity-80">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                        <div className="border-t border-green-800 mt-4 pt-4 pb-2">
                             <button 
                                onClick={handleLogout}
                                className="flex items-center px-3 py-2 text-base font-medium text-green-100 hover:bg-green-800 hover:text-white w-full"
                             >
                                <LogOut size={20} className="mr-3" /> Sign Out
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
