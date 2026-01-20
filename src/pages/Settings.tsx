import { User, Bell, Shield, HelpCircle, Save } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account and platform preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <User className="mr-2" size={20} />
                    Profile Information
                </h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" defaultValue="John Doe" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" defaultValue="admin@afrifarmers.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="text" defaultValue="+250 788 123 456" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input type="text" defaultValue="Super Admin" disabled className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500" />
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <Save size={18} className="mr-2" />
                    Save Changes
                </button>
            </div>
        </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Bell className="mr-2" size={20} />
                    Notifications
                </h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                         <p className="font-medium text-gray-900">Email Notifications</p>
                         <p className="text-sm text-gray-500">Receive daily summaries and system alerts via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                         <p className="font-medium text-gray-900">Weather Alerts</p>
                         <p className="text-sm text-gray-500">Get instant SMS alerts for severe weather in registered regions.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;
