import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, QrCode as QrCodeIcon, Settings, User, Utensils, HelpCircle, FileText } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui/Sidebar';

// Navigation data
const mainNavigation = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Menus',
    url: '/dashboard/menus',
    icon: Utensils,
  },
  {
    title: 'QR Codes',
    url: '/dashboard/qr-codes',
    icon: QrCodeIcon,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

const supportNavigation = [
  {
    title: 'Support',
    url: '/dashboard/help',
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const pathname = location.pathname;

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      console.log('Calling logout function...');
      await logout();
      console.log('Logout completed, navigating to login...');
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sidebar variant="sidebar">
      {/* Header with VEOmenu branding */}
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">VEOmenu</h1>
            <p className="text-xs text-gray-500 -mt-1">Digital Menus</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
            MAIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : ''}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                        <span className={isActive ? 'font-medium text-purple-600' : 'text-gray-700'}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support Navigation */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
            SUPPORT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNavigation.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : ''}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                        <span className={isActive ? 'font-medium text-purple-600' : 'text-gray-700'}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Navigation */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
            ACCOUNT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
                    <LogOut className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Logout</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
