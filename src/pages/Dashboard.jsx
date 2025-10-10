import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { useTranslation } from '../store/LanguageContext';
import {
  Eye,
  Users,
  Globe,
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  Pizza,
  Utensils,
  Wine,
  Sparkles,
  QrCode,
  Clock,
} from 'lucide-react';
import { getMenus } from '../utils/menuStorage';

/**
 * Dashboard Page - Analytics dashboard with KPIs and insights
 */
function Dashboard() {
  const { menus: initialMenus } = useLoaderData();
  const [menus, setMenus] = useState(initialMenus);
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('all');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadMenus = () => {
      const allMenus = getMenus();
      setMenus(allMenus);
      setLoading(false);
    };

    loadMenus();

    // Listen for storage changes
    const handleStorageChange = () => loadMenus();
    window.addEventListener('veomenu:storage', handleStorageChange);
    return () => window.removeEventListener('veomenu:storage', handleStorageChange);
  }, []);

  const handleCreateMenu = () => {
    navigate('/dashboard/menus/create');
  };

  // Empty state when no menus exist
  if (!loading && menus.length === 0) {
    return (
      <DashboardLayout
        title={t('dashboard.welcome')}
        subtitle={t('dashboard.welcomeSubtitle')}
      >
        <div className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('dashboard.createFirst')}</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t('dashboard.createFirstDesc')}
              </p>
              <div className="grid gap-4 md:grid-cols-3 mb-8 text-left">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <Utensils className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{t('dashboard.feature.addDishes')}</h3>
                  <p className="text-xs text-gray-600">{t('dashboard.feature.addDishesDesc')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{t('dashboard.feature.multiLanguage')}</h3>
                  <p className="text-xs text-gray-600">{t('dashboard.feature.multiLanguageDesc')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{t('dashboard.feature.generateQR')}</h3>
                  <p className="text-xs text-gray-600">{t('dashboard.feature.generateQRDesc')}</p>
                </div>
              </div>
              <Button onClick={handleCreateMenu} className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                {t('dashboard.createFirstButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Welcome back, Restaurant Bella Vista"
        subtitle="Here's what's happening with your menus today"
      >
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalViews = menus.reduce((sum, menu) => sum + (menu.views || 0), 0);
  const previousPeriodViews = Math.floor(totalViews * 0.88); // Mock previous period data
  const viewsGrowth = totalViews > 0 ? Math.round(((totalViews - previousPeriodViews) / previousPeriodViews) * 100) : 0;
  const totalLanguages = 6;
  const activeLanguages = 4;

  // Mock data for analytics
  const weeklyScans = [
    { day: 'Mon', scans: 45 },
    { day: 'Tue', scans: 52 },
    { day: 'Wed', scans: 38 },
    { day: 'Thu', scans: 61 },
    { day: 'Fri', scans: 73 },
    { day: 'Sat', scans: 89 },
    { day: 'Sun', scans: 67 },
  ];

  const monthlyViews = [
    { month: 'Jan', views: 1240 },
    { month: 'Feb', views: 1580 },
    { month: 'Mar', views: 1320 },
    { month: 'Apr', views: 1890 },
    { month: 'May', views: 2100 },
    { month: 'Jun', views: 1950 },
  ];

  const popularLanguages = [
    { name: 'Portuguese', code: 'PT', percentage: 45, flag: '🇵🇹' },
    { name: 'English', code: 'EN', percentage: 35, flag: '🇺🇸' },
    { name: 'Spanish', code: 'ES', percentage: 20, flag: '🇪🇸' },
  ];

  const popularDishes = [
    { name: 'Bacalhau à Brás', views: 124, icon: '🐟' },
    { name: 'Bruschetta Italiana', views: 98, icon: '🍞' },
    { name: 'Douro Reserva', views: 87, icon: '🍷' },
    { name: 'Francesinha', views: 76, icon: '🥪' },
  ];

  const popularSections = [
    { name: 'Main Courses', views: 456, icon: Utensils },
    { name: 'Appetizers', views: 342, icon: Pizza },
    { name: 'Wines & Beverages', views: 298, icon: Wine },
    { name: 'Desserts', views: 187, icon: '🍰' },
  ];

  const popularSubsections = [
    { name: 'Grilled Specialties', views: 234, section: 'Main Courses' },
    { name: 'Cold Appetizers', views: 198, section: 'Appetizers' },
    { name: 'House Wines', views: 156, section: 'Wines & Beverages' },
    { name: 'Traditional Desserts', views: 134, section: 'Desserts' },
  ];

  // Filter data based on selected menu
  const filteredMenus = selectedMenu === 'all' ? menus : menus.filter((m) => m.id === selectedMenu);
  const filteredTotalViews = filteredMenus.reduce((sum, menu) => sum + (menu.views || 0), 0);

  return (
    <DashboardLayout
      title={t('dashboard.welcomeBack', { name: 'Restaurant Bella Vista' })}
      subtitle={t('dashboard.welcomeBackSubtitle')}
      action={
        <Button onClick={handleCreateMenu} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.newMenu')}
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Menu Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.analytics')}</h3>
            <p className="text-sm text-gray-500">{t('dashboard.analyticsDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="menuFilter" className="text-sm font-medium text-gray-700">
              {t('dashboard.filterMenu')}
            </label>
            <Select
              id="menuFilter"
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
              className="w-64"
            >
              <option value="all">{t('dashboard.allMenus')}</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${
                    viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {viewsGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(viewsGrowth)}%
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{filteredTotalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t('dashboard.totalViews')}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedMenu === 'all' ? t('dashboard.allMenusCombined') : t('dashboard.selectedOnly')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-blue-600 text-sm font-medium">{t('dashboard.languagesActive', { count: activeLanguages })}</div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{totalLanguages}</div>
                <div className="text-sm text-gray-600">{t('dashboard.languages')}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  15%
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">
                  {weeklyScans.reduce((sum, day) => sum + day.scans, 0)}
                </div>
                <div className="text-sm text-gray-600">{t('dashboard.weeklyScans')}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-200 text-orange-700 text-xs">{t('dashboard.today')}</Badge>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">
                  {weeklyScans[weeklyScans.length - 1]?.scans || 0}
                </div>
                <div className="text-sm text-gray-600">{t('dashboard.scansToday')}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {t('dashboard.avgPerDay', { avg: Math.round(weeklyScans.reduce((sum, d) => sum + d.scans, 0) / 7) })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts and Lists */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Popular Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {t('dashboard.popularLanguages')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularLanguages.map((lang) => (
                  <div key={lang.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <div className="font-medium text-sm">{lang.name}</div>
                        <div className="text-xs text-gray-500">{lang.code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${lang.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{lang.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Dishes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                {t('dashboard.popularDishes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularDishes.map((dish) => (
                  <div key={dish.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">{dish.icon}</span>
                      </div>
                      <span className="text-sm font-medium">{dish.name}</span>
                    </div>
                    <Badge variant="secondary">{dish.views} views</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Menus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {t('dashboard.popularMenus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menus.slice(0, 4).map((menu, index) => (
                  <div key={menu.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium">{menu.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{menu.views || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                {t('dashboard.popularSections')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularSections.map((section) => (
                  <div key={section.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        {typeof section.icon === 'string' ? (
                          <span className="text-sm">{section.icon}</span>
                        ) : (
                          <section.icon className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{section.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{section.views} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Subsections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pizza className="w-5 h-5 text-indigo-600" />
                {t('dashboard.popularSubsections')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularSubsections.map((subsection, index) => (
                  <div key={subsection.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{subsection.name}</div>
                        <div className="text-xs text-gray-500">{subsection.section}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{subsection.views} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly QR Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                {t('dashboard.scansByDay')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyScans.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                        style={{
                          width: `${(day.scans / Math.max(...weeklyScans.map((d) => d.scans))) * 100}%`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <span className="text-white text-xs font-medium">{day.scans}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              {t('dashboard.monthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {monthlyViews.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-200 rounded-t-sm mx-auto transition-all duration-500"
                      style={{
                        height: `${Math.max((month.views / Math.max(...monthlyViews.map((m) => m.views))) * 120, 20)}px`,
                        width: '40px',
                      }}
                    >
                      <div
                        className="bg-blue-600 rounded-t-sm w-full transition-all duration-1000"
                        style={{
                          height: `${Math.max((month.views / Math.max(...monthlyViews.map((m) => m.views))) * 100, 16)}px`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{month.month}</div>
                  <div className="text-xs text-gray-500">{month.views.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Loader function to fetch menus
Dashboard.loader = async () => {
  const menus = getMenus();
  return { menus };
};

export default Dashboard;
