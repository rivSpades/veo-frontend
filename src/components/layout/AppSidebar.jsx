import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, QrCode as QrCodeIcon, Settings, User, Utensils, HelpCircle, FileText } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useTranslation } from '../../store/LanguageContext';
import { useSidebar } from '../ui/Sidebar';
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

// Navigation data - will be translated in component
const mainNavigation = [
  {
    titleKey: 'sidebar.dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    titleKey: 'sidebar.menus',
    url: '/dashboard/menus',
    icon: Utensils,
  },
  {
    titleKey: 'sidebar.qrCodes',
    url: '/dashboard/qr-codes',
    icon: QrCodeIcon,
  },
  {
    titleKey: 'sidebar.settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

const supportNavigation = [
  {
    titleKey: 'sidebar.support',
    url: '/dashboard/help',
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { toggleMobile } = useSidebar();
  const pathname = location.pathname;

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      console.log('Calling logout function...');
      await logout();
      console.log('Logout completed, navigating to landing page...');
      navigate('/');
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
            {t('sidebar.group.main')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : ''}
                    >
                      <Link to={item.url} onClick={toggleMobile} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                        <span className={isActive ? 'font-medium text-purple-600' : 'text-gray-700'}>
                          {t(item.titleKey)}
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
            {t('sidebar.group.support')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNavigation.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : ''}
                    >
                      <Link to={item.url} onClick={toggleMobile} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                        <span className={isActive ? 'font-medium text-purple-600' : 'text-gray-700'}>
                          {t(item.titleKey)}
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
            {t('sidebar.group.account')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
                    <LogOut className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{t('sidebar.logout')}</span>
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
