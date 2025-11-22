import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, AlertCircle, Lightbulb, Target, Download, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useTranslation } from '../store/LanguageContext';
import { menusAPI } from '../data/api';
import { generateAIReport, formatReportPeriod } from '../utils/aiReportGenerator';
import { jsPDF } from 'jspdf';

/**
 * AI Report Component
 * Generates and displays monthly performance reports with AI insights
 */
export function AIReport({ isOpen, onClose, menuId = 'all' }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    if (isOpen && !report) {
      generateReport();
    }
  }, [isOpen, period, menuId]);

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Fetch analytics data
      const days = period === 'all' ? 90 : parseInt(period);
      const response = await menusAPI.getDetailedAnalytics(menuId, days, 'views');
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Calculate additional metrics
        const dailyValues = Object.values(data.views_by_day || {});
        const dailyAverage = dailyValues.length > 0
          ? dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length
          : 0;

        // Find peak day
        let peakDay = null;
        let maxViews = 0;
        Object.entries(data.views_by_day || {}).forEach(([date, views]) => {
          if (views > maxViews) {
            maxViews = views;
            const dateObj = new Date(date);
            peakDay = {
              day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
              date: date,
              views,
            };
          }
        });

        // Find low days (bottom 3)
        const lowDays = Object.entries(data.views_by_day || {})
          .map(([date, views]) => ({
            date,
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
            views,
          }))
          .sort((a, b) => a.views - b.views)
          .slice(0, 3);

        // Calculate growth (compare first half vs second half)
        const sortedDates = Object.keys(data.views_by_day || {}).sort();
        const midpoint = Math.floor(sortedDates.length / 2);
        const firstHalf = sortedDates.slice(0, midpoint).reduce((sum, date) => sum + (data.views_by_day[date] || 0), 0);
        const secondHalf = sortedDates.slice(midpoint).reduce((sum, date) => sum + (data.views_by_day[date] || 0), 0);
        const firstAvg = midpoint > 0 ? firstHalf / midpoint : 0;
        const secondAvg = (sortedDates.length - midpoint) > 0 ? secondHalf / (sortedDates.length - midpoint) : 0;
        const growth = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

        // Generate AI report
        const reportData = generateAIReport({
          totalViews: data.total_views || 0,
          viewsByDay: data.views_by_day || {},
          dailyAverage,
          growth,
          peakDay,
          lowDays,
        }, period);

        setReport(reportData);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Title
    doc.setFontSize(20);
    doc.text(t('aiReport.title'), margin, yPos);
    yPos += 15;

    // Date and Period
    doc.setFontSize(10);
    doc.text(`${t('aiReport.generatedOn')}: ${new Date(report.generatedAt).toLocaleDateString()}`, margin, yPos);
    yPos += 5;
    doc.text(`${t('aiReport.period')}: ${formatReportPeriod(period)}`, margin, yPos);
    yPos += 10;

    // Overall Performance
    doc.setFontSize(16);
    doc.text(t('aiReport.overallPerformance'), margin, yPos);
    yPos += 8;
    doc.setFontSize(12);
    doc.text(`${report.overallPerformance} (${report.performanceScore}/100)`, margin, yPos);
    yPos += 10;

    // Summary
    doc.setFontSize(14);
    doc.text(t('aiReport.summary'), margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`${t('aiReport.totalViews')}: ${report.summary.totalViews}`, margin, yPos);
    yPos += 5;
    doc.text(`${t('aiReport.dailyAverage')}: ${report.summary.dailyAverage.toFixed(1)}`, margin, yPos);
    yPos += 5;
    doc.text(`${t('aiReport.growth')}: ${report.summary.growth}%`, margin, yPos);
    yPos += 10;

    // Insights
    if (report.insights.length > 0) {
      doc.setFontSize(14);
      doc.text(t('aiReport.insights'), margin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      report.insights.forEach((insight) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`${insight.title}: ${insight.message}`, margin, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Tips
    if (report.tips.length > 0) {
      if (yPos > 260) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(14);
      doc.text(t('aiReport.tips'), margin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      report.tips.forEach((tip) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`[${tip.category}] ${tip.tip}`, margin, yPos);
        yPos += 6;
      });
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(14);
      doc.text(t('aiReport.recommendations'), margin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      report.recommendations.forEach((rec) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(11);
        doc.text(rec.title, margin, yPos);
        yPos += 5;
        doc.setFontSize(10);
        doc.text(rec.description, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 8;
      });
    }

    doc.save(`AI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-blue-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('aiReport.title')}</h2>
              <p className="text-sm text-gray-500">{t('aiReport.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setReport(null);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="7">{t('aiReport.periods.7days')}</option>
              <option value="30">{t('aiReport.periods.30days')}</option>
              <option value="90">{t('aiReport.periods.90days')}</option>
            </select>
            {report && (
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t('aiReport.download')}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {generating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-500">{t('aiReport.generating')}</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Overall Performance Score */}
              <Card className={`${getPerformanceColor(report.performanceScore)} border-2`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('aiReport.overallPerformance')}</h3>
                      <div className="text-4xl font-bold">{report.performanceScore}</div>
                      <div className="text-sm mt-1">/ 100</div>
                    </div>
                    <div className="text-right">
                      <Badge className="text-lg px-4 py-2">{report.overallPerformance}</Badge>
                      <p className="text-sm mt-2">{formatReportPeriod(period)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('aiReport.totalViews')}</div>
                    <div className="text-2xl font-bold text-gray-900">{report.summary.totalViews.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('aiReport.dailyAverage')}</div>
                    <div className="text-2xl font-bold text-gray-900">{report.summary.dailyAverage.toFixed(1)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">{t('aiReport.growth')}</div>
                    <div className={`text-2xl font-bold ${report.summary.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.summary.growth >= 0 ? '+' : ''}{report.summary.growth}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights */}
              {report.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      {t('aiReport.insights')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Areas */}
              {report.performanceAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      {t('aiReport.areasForImprovement')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.performanceAreas.map((area, index) => (
                        <div key={index} className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{area.area}</h4>
                            <Badge variant={area.priority === 'high' ? 'destructive' : 'secondary'}>
                              {area.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{area.issue}</p>
                          <p className="text-sm text-gray-700 font-medium">{area.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {report.tips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      {t('aiReport.tips')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{tip.category}</Badge>
                              {tip.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">{t('aiReport.highPriority')}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{tip.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      {t('aiReport.recommendations')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'}>
                              {rec.impact} {t('aiReport.impact')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <p className="text-sm text-gray-700 font-medium">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Sparkles className="w-16 h-16 text-purple-600 mb-4" />
              <p className="text-gray-500">{t('aiReport.clickGenerate')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

