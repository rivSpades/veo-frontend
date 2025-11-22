import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp, Eye, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Select } from './ui/Select';
import { useTranslation } from '../store/LanguageContext';
import { menusAPI } from '../data/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Analytics Detail Modal Component
 * Shows detailed analytics with charts and daily breakdown
 */
export function AnalyticsDetail({ isOpen, onClose, type, menuId = 'all' }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // days: 7, 30, 90, all
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, period, menuId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = period === 'all' ? 365 : parseInt(period);
      const response = await menusAPI.getDetailedAnalytics(menuId, days, type);
      
      if (response.success && response.data) {
        setData(response.data);
        
        // Format chart data
        const formatted = formatChartData(response.data.views_by_day || {});
        setChartData(formatted);
        
        // Format daily breakdown
        const daily = formatDailyData(response.data.views_by_day || {});
        setDailyData(daily);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (viewsByDay) => {
    const entries = Object.entries(viewsByDay)
      .map(([date, count]) => ({
        date: formatDate(date),
        views: count,
        dateRaw: date,
      }))
      .sort((a, b) => new Date(a.dateRaw) - new Date(b.dateRaw));
    
    return entries;
  };

  const formatDailyData = (viewsByDay) => {
    return Object.entries(viewsByDay)
      .map(([date, count]) => ({
        date: formatDate(date),
        dateRaw: date,
        count,
      }))
      .sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw))
      .slice(0, 30); // Last 30 days
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTotal = () => {
    if (!data) return 0;
    return data.total_views || 0;
  };

  const getTodayCount = () => {
    if (!data || !data.views_by_day) return 0;
    const today = new Date().toISOString().split('T')[0];
    return data.views_by_day[today] || 0;
  };

  const getAverage = () => {
    if (!chartData || chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.views, 0);
    return Math.round(sum / chartData.length);
  };

  const getGrowth = () => {
    if (!chartData || chartData.length < 2) return 0;
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstAvg = firstHalf.reduce((acc, item) => acc + item.views, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, item) => acc + item.views, 0) / secondHalf.length;
    if (firstAvg === 0) return 0;
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  };

  if (!isOpen) return null;

  const title = type === 'views' 
    ? t('analytics.views.title') 
    : t('analytics.scans.title');
  const icon = type === 'views' ? Eye : QrCode;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {React.createElement(icon, { className: 'w-6 h-6 text-blue-600' })}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{t('analytics.detailedAnalysis')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-32"
            >
              <option value="7">{t('analytics.period.7days')}</option>
              <option value="30">{t('analytics.period.30days')}</option>
              <option value="90">{t('analytics.period.90days')}</option>
              <option value="all">{t('analytics.period.allTime')}</option>
            </Select>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-gray-500">{t('analytics.loading')}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('analytics.total')}</div>
                    <div className="text-2xl font-bold text-gray-900">{getTotal().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('analytics.today')}</div>
                    <div className="text-2xl font-bold text-gray-900">{getTodayCount().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('analytics.average')}</div>
                    <div className="text-2xl font-bold text-gray-900">{getAverage().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('analytics.growth')}</div>
                    <div className={`text-2xl font-bold ${getGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getGrowth() >= 0 ? '+' : ''}{getGrowth()}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    {t('analytics.performanceChart')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name={type === 'views' ? t('analytics.views.label') : t('analytics.scans.label')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      {t('analytics.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {t('analytics.dailyBreakdown')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {dailyData.length > 0 ? (
                      dailyData.map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{day.date}</Badge>
                            <span className="text-sm text-gray-600">{day.dateRaw}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900">{day.count}</span>
                            <span className="text-sm text-gray-500">
                              {type === 'views' ? t('analytics.views.label') : t('analytics.scans.label')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">{t('analytics.noData')}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



