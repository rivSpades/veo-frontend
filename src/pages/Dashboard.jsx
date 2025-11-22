import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { useTranslation } from '../store/LanguageContext';
import { AIReport } from '../components/AIReport';
import {
  Eye,
  Globe,
  TrendingUp,
  Plus,
  BarChart3,
  Pizza,
  Utensils,
  Wine,
  Sparkles,
  QrCode,
  Calendar,
  Lock,
} from 'lucide-react';
import { getMenus } from '../utils/menuStorage';
import { instancesAPI, menusAPI } from '../data/api';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  const [todayScans, setTodayScans] = useState(0);
  const [monthlyScans, setMonthlyScans] = useState([]);
  const [weeklyScans, setWeeklyScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly'); // 'monthly' or 'weekly'
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
      setScansLoading(true);
      try {
        const response = await menusAPI.getDashboardStats(7);
        if (response.success) {
          setDashboardStats(response.data);
        }

        // Load today's scans
        const todayResponse = await menusAPI.getDetailedAnalytics(selectedMenu, 1, 'views');
        if (todayResponse.success && todayResponse.data) {
          const today = new Date().toISOString().split('T')[0];
          const todayCount = todayResponse.data.views_by_day?.[today] || 0;
          setTodayScans(todayCount);
        }

        // Load scans data for charts (last 6 months)
        const scansResponse = await menusAPI.getDetailedAnalytics(selectedMenu, 180, 'views');
        if (scansResponse.success && scansResponse.data) {
          const viewsByDay = scansResponse.data.views_by_day || {};
          const totalScans = scansResponse.data.total_views || 0;
          
          // Only process if there's actual data
          if (totalScans > 0 && Object.keys(viewsByDay).length > 0) {
            // Process monthly data
            const monthlyData = {};
            Object.entries(viewsByDay).forEach(([date, count]) => {
              if (count > 0) {
                const dateObj = new Date(date);
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth();
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + count;
              }
            });
            
            // Convert to array and sort by date
            const monthlyArray = Object.entries(monthlyData)
              .map(([monthKey, scans]) => {
                const [year, month] = monthKey.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1);
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                return { month: monthName, scans, sortKey: monthKey };
              })
              .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
              .slice(-6) // Last 6 months
              .map(({ month, scans }) => ({ month, scans }));
            
            setMonthlyScans(monthlyArray);

            // Process weekly data (by day of week)
            const weeklyData = {
              'Mon': 0,
              'Tue': 0,
              'Wed': 0,
              'Thu': 0,
              'Fri': 0,
              'Sat': 0,
              'Sun': 0,
            };
            
            Object.entries(viewsByDay).forEach(([date, count]) => {
              if (count > 0) {
                const dateObj = new Date(date);
                const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                if (weeklyData.hasOwnProperty(dayOfWeek)) {
                  weeklyData[dayOfWeek] += count;
                }
              }
            });
            
            const weeklyArray = [
              { day: 'Mon', scans: weeklyData['Mon'] },
              { day: 'Tue', scans: weeklyData['Tue'] },
              { day: 'Wed', scans: weeklyData['Wed'] },
              { day: 'Thu', scans: weeklyData['Thu'] },
              { day: 'Fri', scans: weeklyData['Fri'] },
              { day: 'Sat', scans: weeklyData['Sat'] },
              { day: 'Sun', scans: weeklyData['Sun'] },
            ];
            
            setWeeklyScans(weeklyArray);
          } else {
            // No data - set empty arrays
            setMonthlyScans([]);
            setWeeklyScans([]);
          }
        } else {
          // API call failed or no data
          setMonthlyScans([]);
          setWeeklyScans([]);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setStatsLoading(false);
        setScansLoading(false);
      }
    };

    if (menus.length > 0) {
      loadDashboardStats();
    } else {
      setStatsLoading(false);
      setScansLoading(false);
    }
  }, [menus, selectedMenu]);

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

  // Helper function to check if there's actual data (not just zeros)
  const hasData = (data) => {
    if (!data || data.length === 0) return false;
    return data.some(item => (item.scans || item.views || 0) > 0);
  };

  // Check if scans data has actual values
  const hasScansData = hasData(chartView === 'monthly' ? monthlyScans : weeklyScans);
  const hasTodayScans = todayScans > 0;
  
  // Check if menus have views (for Popular Menus)
  const hasMenuViews = menus.some(menu => (menu.views || menu.view_count || 0) > 0);
  
  // For now, Popular Dishes/Sections/Subsections are locked until item-level analytics are implemented
  const hasPopularDishesData = false; // Will be true when item-level analytics are available
  const hasPopularSectionsData = false; // Will be true when item-level analytics are available
  const hasPopularSubsectionsData = false; // Will be true when item-level analytics are available

  // Empty state when no menus exist
  if (!loading && menus.length === 0) {
    return (
      <DashboardLayout
        title={t('dashboard.welcome')}
        subtitle={t('dashboard.welcomeSubtitle')}
      >
        <div className="p-3 md:p-6 flex items-center justify-center min-h-[calc(100vh-200px)] w-full max-w-full overflow-x-hidden">
          <Card className="max-w-2xl w-full mx-auto">
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
        <div className="p-3 md:p-6 w-full max-w-full overflow-x-hidden">
          <div className="animate-pulse space-y-4 md:space-y-6">
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
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

  // Popular dishes - locked until item-level analytics are implemented
  const popularDishes = hasPopularDishesData ? [
    { name: 'Bacalhau à Brás', views: 124, icon: '🐟' },
    { name: 'Bruschetta Italiana', views: 98, icon: '🍞' },
    { name: 'Douro Reserva', views: 87, icon: '🍷' },
    { name: 'Francesinha', views: 76, icon: '🥪' },
  ] : [];

  // Popular sections - locked until section-level analytics are implemented
  const popularSections = hasPopularSectionsData ? [
    { name: t('dashboard.section.mainCourses'), views: 456, icon: Utensils },
    { name: t('dashboard.section.appetizers'), views: 342, icon: Pizza },
    { name: t('dashboard.section.winesBeverages'), views: 298, icon: Wine },
    { name: t('dashboard.section.desserts'), views: 187, icon: '🍰' },
  ] : [];

  // Popular subsections - locked until subsection-level analytics are implemented
  const popularSubsections = hasPopularSubsectionsData ? [
    { name: t('dashboard.subsection.grilledSpecialties'), views: 234, section: t('dashboard.section.mainCourses') },
    { name: t('dashboard.subsection.coldAppetizers'), views: 198, section: t('dashboard.section.appetizers') },
    { name: t('dashboard.subsection.houseWines'), views: 156, section: t('dashboard.section.winesBeverages') },
    { name: t('dashboard.subsection.traditionalDesserts'), views: 134, section: t('dashboard.section.desserts') },
  ] : [];
  
  // Popular menus - use actual menu data sorted by views
  const popularMenus = menus
    .filter(menu => hasMenuViews ? true : (menu.views || menu.view_count || 0) > 0)
    .sort((a, b) => (b.views || b.view_count || 0) - (a.views || a.view_count || 0))
    .slice(0, 4);

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

        {/* KPI Card - Today Scans */}
        <div className="grid gap-6 md:grid-cols-1 max-w-md">
          <Card className={`bg-purple-50 border-purple-200 ${!hasTodayScans && !statsLoading ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${hasTodayScans ? 'bg-purple-100' : 'bg-gray-200'}`}>
                  {hasTodayScans ? (
                    <QrCode className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                {statsLoading ? (
                  <div className="text-3xl font-bold text-gray-900">...</div>
                ) : hasTodayScans ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900">
                      {todayScans.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{t('dashboard.scansToday')}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-400">0</div>
                    <div className="text-sm text-gray-500 mt-1">{t('dashboard.scansToday')}</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t('dashboard.needsMoreData')}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scans Evolution Chart - Combined Stacked Bar + Line */}
        <Card className={!hasScansData && !scansLoading ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {hasScansData ? (
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                {t('dashboard.scansEvolution')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartView === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('monthly')}
                  disabled={!hasScansData}
                  className={chartView === 'monthly' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {t('dashboard.monthly')}
                </Button>
                <Button
                  variant={chartView === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('weekly')}
                  disabled={!hasScansData}
                  className={chartView === 'weekly' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {t('dashboard.weekly')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scansLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">{t('dashboard.loading')}</div>
              </div>
            ) : hasScansData ? (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartView === 'monthly' ? monthlyScans : weeklyScans}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={chartView === 'monthly' ? 'month' : 'day'} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="scans" 
                    fill="#9333ea" 
                    name={t('dashboard.scans')}
                    radius={[8, 8, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name={t('dashboard.trend')}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <Lock className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">{t('dashboard.noDataYet')}</p>
                <p className="text-sm text-gray-400 text-center max-w-md">
                  {t('dashboard.needsMoreDataDesc')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Charts and Lists - Keep popular items */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Popular Dishes */}
          <Card className={!hasPopularDishesData ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasPopularDishesData ? (
                  <Utensils className="w-5 h-5 text-orange-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                {t('dashboard.popularDishes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPopularDishesData && popularDishes.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Lock className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium mb-1">{t('dashboard.noDataYet')}</p>
                  <p className="text-xs text-gray-400 text-center">
                    {t('dashboard.itemAnalyticsComingSoon')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Menus */}
          <Card className={!hasMenuViews && menus.length > 0 ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasMenuViews ? (
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                {t('dashboard.popularMenus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasMenuViews && popularMenus.length > 0 ? (
                <div className="space-y-4">
                  {popularMenus.map((menu, index) => (
                    <div key={menu.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium">{menu.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{menu.views || menu.view_count || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : menus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p className="text-sm text-gray-400">{t('dashboard.noMenus')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Lock className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium mb-1">{t('dashboard.noDataYet')}</p>
                  <p className="text-xs text-gray-400 text-center">
                    {t('dashboard.needsMoreDataDesc')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Sections */}
          <Card className={!hasPopularSectionsData ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasPopularSectionsData ? (
                  <BarChart3 className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                {t('dashboard.popularSections')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPopularSectionsData && popularSections.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Lock className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium mb-1">{t('dashboard.noDataYet')}</p>
                  <p className="text-xs text-gray-400 text-center">
                    {t('dashboard.itemAnalyticsComingSoon')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Subsections */}
          <Card className={!hasPopularSubsectionsData ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasPopularSubsectionsData ? (
                  <Pizza className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                {t('dashboard.popularSubsections')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPopularSubsectionsData && popularSubsections.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Lock className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium mb-1">{t('dashboard.noDataYet')}</p>
                  <p className="text-xs text-gray-400 text-center">
                    {t('dashboard.itemAnalyticsComingSoon')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>


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
