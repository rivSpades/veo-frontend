import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { useTranslation } from '../store/LanguageContext';
import { AnalyticsDetail } from '../components/AnalyticsDetail';
import { AIReport } from '../components/AIReport';
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
  ArrowRight,
} from 'lucide-react';
import { getMenus } from '../utils/menuStorage';
import { instancesAPI, menusAPI } from '../data/api';

/**
 * Dashboard Page - Analytics dashboard with KPIs and insights
 */
function Dashboard() {
  const { menus: initialMenus } = useLoaderData();
  const [menus, setMenus] = useState(initialMenus);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('all');
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [todayViews, setTodayViews] = useState(0);
  const [todayScans, setTodayScans] = useState(0);
  const [analyticsDetailOpen, setAnalyticsDetailOpen] = useState(false);
  const [analyticsDetailType, setAnalyticsDetailType] = useState('views');
  const [aiReportOpen, setAIReportOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadMenus = async () => {
      try {
        // Try to load from API first
        const response = await menusAPI.getMenus();
        if (response.success) {
          const menusData = Array.isArray(response.data) ? response.data : (response.data?.results || []);
          setMenus(menusData);
        } else {
          // Fallback to localStorage
          const allMenus = getMenus();
          setMenus(allMenus);
        }
      } catch (error) {
        console.error('Error loading menus:', error);
        // Fallback to localStorage
        const allMenus = getMenus();
        setMenus(allMenus);
      }
      setLoading(false);
    };

    loadMenus();

    // Listen for storage changes
    const handleStorageChange = () => {
      const allMenus = getMenus();
      setMenus(allMenus);
    };
    window.addEventListener('veomenu:storage', handleStorageChange);
    return () => window.removeEventListener('veomenu:storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const loadDashboardStats = async () => {
      setStatsLoading(true);
      try {
        const response = await menusAPI.getDashboardStats(7);
        if (response.success) {
          setDashboardStats(response.data);
        }

        // Load today's views and scans
        const todayResponse = await menusAPI.getDetailedAnalytics(selectedMenu, 1, 'views');
        if (todayResponse.success && todayResponse.data) {
          const today = new Date().toISOString().split('T')[0];
          const todayCount = todayResponse.data.views_by_day?.[today] || 0;
          setTodayViews(todayCount);
          setTodayScans(todayCount); // Scans are the same as views (QR code scans create views)
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (menus.length > 0) {
      loadDashboardStats();
    } else {
      setStatsLoading(false);
    }
  }, [menus, selectedMenu]);

  const handleCardClick = (type) => {
    setAnalyticsDetailType(type);
    setAnalyticsDetailOpen(true);
  };

  useEffect(() => {
    const loadRestaurantName = async () => {
      try {
        const instanceId = localStorage.getItem('instance_id');
        if (instanceId) {
          const response = await instancesAPI.getInstance(instanceId);
          if (response.success && response.data) {
            setRestaurantName(response.data.name || 'Restaurant');
          }
        }
      } catch (error) {
        console.error('Error loading restaurant name:', error);
      }
    };

    loadRestaurantName();
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
        title={t('dashboard.welcomeBack').replace('{name}', restaurantName)}
        subtitle={t('dashboard.welcomeBackSubtitle')}
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

  // Use real stats if available, otherwise use fallback data
  const totalViews = dashboardStats?.totalViews || menus.reduce((sum, menu) => sum + (menu.views || 0), 0);
  const previousPeriodViews = Math.floor(totalViews * 0.88); // Calculate from 88% of current (mock previous period)
  const viewsGrowth = totalViews > 0 ? Math.round(((totalViews - previousPeriodViews) / previousPeriodViews) * 100) : 0;
  
  const uniqueLanguages = dashboardStats?.languages || [];
  const totalLanguages = uniqueLanguages.length || menus.reduce((acc, menu) => {
    if (menu.available_languages && Array.isArray(menu.available_languages)) {
      menu.available_languages.forEach(lang => acc.add(lang));
    }
    return acc;
  }, new Set()).size || 0;
  const activeLanguages = totalLanguages;

  // Use real weekly scans if available, otherwise use fallback
  const weeklyScans = dashboardStats?.weeklyScans || [
    { day: 'Mon', scans: 0 },
    { day: 'Tue', scans: 0 },
    { day: 'Wed', scans: 0 },
    { day: 'Thu', scans: 0 },
    { day: 'Fri', scans: 0 },
    { day: 'Sat', scans: 0 },
    { day: 'Sun', scans: 0 },
  ];

  const monthlyViews = [
    { month: 'Jan', views: 1240 },
    { month: 'Feb', views: 1580 },
    { month: 'Mar', views: 1320 },
    { month: 'Apr', views: 1890 },
    { month: 'May', views: 2100 },
    { month: 'Jun', views: 1950 },
  ];

  // Use real popular languages if available, otherwise use fallback
  const languageFlags = { pt: '🇵🇹', en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹' };
  const languageNames = {
    pt: t('dashboard.language.portuguese'),
    en: t('dashboard.language.english'),
    es: t('dashboard.language.spanish'),
    fr: t('dashboard.language.french'),
    de: t('dashboard.language.german'),
    it: t('dashboard.language.italian'),
  };

  const popularLanguages = dashboardStats?.popularLanguages?.map(lang => ({
    name: languageNames[lang.code.toLowerCase()] || lang.code,
    code: lang.code,
    percentage: lang.percentage,
    flag: languageFlags[lang.code.toLowerCase()] || '🌐',
  })) || (totalViews > 0 ? [] : [
    { name: t('dashboard.language.portuguese'), code: 'PT', percentage: 0, flag: '🇵🇹' },
    { name: t('dashboard.language.english'), code: 'EN', percentage: 0, flag: '🇺🇸' },
    { name: t('dashboard.language.spanish'), code: 'ES', percentage: 0, flag: '🇪🇸' },
  ]);

  const popularDishes = [
    { name: 'Bacalhau à Brás', views: 124, icon: '🐟' },
    { name: 'Bruschetta Italiana', views: 98, icon: '🍞' },
    { name: 'Douro Reserva', views: 87, icon: '🍷' },
    { name: 'Francesinha', views: 76, icon: '🥪' },
  ];

  const popularSections = [
    { name: t('dashboard.section.mainCourses'), views: 456, icon: Utensils },
    { name: t('dashboard.section.appetizers'), views: 342, icon: Pizza },
    { name: t('dashboard.section.winesBeverages'), views: 298, icon: Wine },
    { name: t('dashboard.section.desserts'), views: 187, icon: '🍰' },
  ];

  const popularSubsections = [
    { name: t('dashboard.subsection.grilledSpecialties'), views: 234, section: t('dashboard.section.mainCourses') },
    { name: t('dashboard.subsection.coldAppetizers'), views: 198, section: t('dashboard.section.appetizers') },
    { name: t('dashboard.subsection.houseWines'), views: 156, section: t('dashboard.section.winesBeverages') },
    { name: t('dashboard.subsection.traditionalDesserts'), views: 134, section: t('dashboard.section.desserts') },
  ];

  // Filter data based on selected menu
  const filteredMenus = selectedMenu === 'all' ? menus : menus.filter((m) => m.id === selectedMenu);
  const filteredTotalViews = filteredMenus.reduce((sum, menu) => sum + (menu.views || 0), 0);

  return (
    <DashboardLayout
      title={t('dashboard.welcomeBack').replace('{name}', restaurantName)}
      subtitle={t('dashboard.welcomeBackSubtitle')}
      action={
        <div className="flex gap-2">
          <Button onClick={() => setAIReportOpen(true)} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('dashboard.generateAIReport')}
          </Button>
          <Button onClick={handleCreateMenu} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.newMenu')}
          </Button>
        </div>
      }
    >
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Menu Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.analytics')}</h3>
            <p className="text-sm text-gray-500">{t('dashboard.analyticsDesc')}</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label htmlFor="menuFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t('dashboard.filterMenu')}
            </label>
            <Select
              id="menuFilter"
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
              className="flex-1 md:w-64"
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

        {/* KPI Cards - Simplified to 2 main metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card 
            className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick('views')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : todayViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">{t('dashboard.viewsToday')}</div>
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  {t('dashboard.clickForDetails')}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-purple-50 border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick('scans')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <QrCode className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : todayScans.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">{t('dashboard.scansToday')}</div>
                <div className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                  {t('dashboard.clickForDetails')}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              {t('dashboard.performanceEvolution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              {t('dashboard.clickCardsAbove')}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts and Lists - Keep popular items */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

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
                    <Badge variant="secondary">{dish.views} {t('dashboard.views')}</Badge>
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
                    <span className="text-sm text-gray-600">{section.views} {t('dashboard.views')}</span>
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
                    <span className="text-sm text-gray-600">{subsection.views} {t('dashboard.views')}</span>
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

        {/* Analytics Detail Modal */}
        <AnalyticsDetail
          isOpen={analyticsDetailOpen}
          onClose={() => setAnalyticsDetailOpen(false)}
          type={analyticsDetailType}
          menuId={selectedMenu}
        />

        {/* AI Report Modal */}
        <AIReport
          isOpen={aiReportOpen}
          onClose={() => setAIReportOpen(false)}
          menuId={selectedMenu}
        />
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
