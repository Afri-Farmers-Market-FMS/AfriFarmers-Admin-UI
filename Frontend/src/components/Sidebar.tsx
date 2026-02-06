import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sprout, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Farmers', icon: <Users size={20} />, path: '/farmers' },
    { title: 'Crops', icon: <Sprout size={20} />, path: '/crops' },
    { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className={`h-screen bg-green-900 text-white flex flex-col fixed left-0 top-0 border-r border-green-800 transition-all duration-300 z-20 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-6 border-b border-green-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
             <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <Sprout className="mr-2" />
                    AFM
                </h1>
                <p className="text-xs text-green-200 mt-1">Empowering Farmers</p>
            </div>
        )}
        {isCollapsed && <Sprout className="text-white" size={24} />}
        
        <button 
            onClick={toggleSidebar}
            className={`text-green-200 hover:text-white transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
        >
            <ChevronLeft size={20} />
        </button>
      </div>

       {/* Mobile/Collapsed Toggle (visible only when collapsed in desktop view usually, but here likely handled by layout) */}
       {isCollapsed && (
         <button onClick={toggleSidebar} className="mx-auto mt-2 text-green-200 hover:text-white">
            <ChevronRight size={20} />
         </button>
       )}


      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            title={isCollapsed ? item.title : ''}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${
                isActive
                  ? 'bg-green-800 text-white font-medium border-l-4 border-green-400'
                  : 'text-green-100 hover:bg-green-800 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <span className={`${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
            {!isCollapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-green-800 bg-green-950">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white font-bold border border-green-600 flex-shrink-0">
            JD
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">John Doe</p>
                <p className="text-xs text-green-300 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
