/**
 * AI Report Generator
 * Generates insights, tips, and recommendations based on analytics data
 */

export function generateAIReport(analyticsData, period = '30') {
  const {
    totalViews,
    viewsByDay = {},
    dailyAverage,
    growth,
    peakDay,
    lowDays = [],
  } = analyticsData;

  const insights = [];
  const tips = [];
  const performanceAreas = [];

  // Analyze total views
  if (totalViews === 0) {
    insights.push({
      type: 'warning',
      title: 'No Activity Detected',
      message: 'Your menu hasn\'t received any views during this period. Consider promoting your QR codes more actively.',
    });
    tips.push({
      category: 'Marketing',
      tip: 'Place QR codes in high-visibility locations like table tents, windows, and entryways.',
      priority: 'high',
    });
  } else if (totalViews < 10) {
    insights.push({
      type: 'info',
      title: 'Low Engagement',
      message: `You've received ${totalViews} views this period. There's room to grow your digital menu adoption.`,
    });
    tips.push({
      category: 'Promotion',
      tip: 'Train your staff to actively direct customers to scan the QR code and highlight the convenience.',
      priority: 'medium',
    });
  } else if (totalViews > 100) {
    insights.push({
      type: 'success',
      title: 'Strong Engagement',
      message: `Great job! You've reached ${totalViews} views this period. Your digital menu is being used effectively.`,
    });
  }

  // Analyze growth trends
  if (growth > 20) {
    insights.push({
      type: 'success',
      title: 'Excellent Growth',
      message: `Your views are growing by ${growth}% compared to the previous period. Keep up the momentum!`,
    });
  } else if (growth < -10) {
    insights.push({
      type: 'warning',
      title: 'Declining Engagement',
      message: `Views have decreased by ${Math.abs(growth)}%. Consider refreshing your menu or increasing visibility.`,
    });
    performanceAreas.push({
      area: 'User Engagement',
      issue: 'Declining views',
      suggestion: 'Review menu presentation and ensure QR codes are easily accessible.',
      priority: 'high',
    });
    tips.push({
      category: 'Content',
      tip: 'Update your menu regularly with seasonal items or specials to encourage repeat visits.',
      priority: 'high',
    });
  }

  // Analyze daily patterns
  if (dailyAverage > 0) {
    const avgPerDay = dailyAverage;
    if (avgPerDay < 2) {
      tips.push({
        category: 'Operations',
        tip: 'Consider offering daily specials or promotions to drive more frequent menu views.',
        priority: 'medium',
      });
    }

    // Identify peak performance
    if (peakDay) {
      insights.push({
        type: 'info',
        title: 'Peak Performance Day',
        message: `${peakDay.day} was your busiest day with ${peakDay.views} views. Consider running promotions on slower days.`,
      });
    }

    // Analyze low performance days
    if (lowDays.length > 0) {
      const lowDaysList = lowDays.slice(0, 3).map(d => d.day).join(', ');
      performanceAreas.push({
        area: 'Day-to-Day Consistency',
        issue: `Low activity on ${lowDaysList}`,
        suggestion: 'Focus marketing efforts on these specific days or consider adjusting hours/promotions.',
        priority: 'medium',
      });
    }
  }

  // View consistency analysis
  const dailyValues = Object.values(viewsByDay);
  if (dailyValues.length > 0) {
    const maxViews = Math.max(...dailyValues);
    const minViews = Math.min(...dailyValues);
    const variance = maxViews > 0 ? ((maxViews - minViews) / maxViews) * 100 : 0;

    if (variance > 70) {
      performanceAreas.push({
        area: 'Consistency',
        issue: 'High variance in daily views',
        suggestion: 'Work on building more consistent traffic through regular promotions and customer engagement.',
        priority: 'medium',
      });
      tips.push({
        category: 'Strategy',
        tip: 'Create a weekly promotion schedule to maintain steady customer engagement throughout the week.',
        priority: 'medium',
      });
    }
  }

  // Generate recommendations based on overall performance
  if (totalViews > 50) {
    tips.push({
      category: 'Optimization',
      tip: 'With good engagement, consider adding more languages or sections to appeal to a broader audience.',
      priority: 'low',
    });
  }

  // Overall performance summary
  let overallPerformance = 'Good';
  let performanceScore = calculatePerformanceScore(totalViews, growth, dailyAverage, period);

  if (performanceScore >= 80) {
    overallPerformance = 'Excellent';
  } else if (performanceScore >= 60) {
    overallPerformance = 'Good';
  } else if (performanceScore >= 40) {
    overallPerformance = 'Fair';
  } else {
    overallPerformance = 'Needs Improvement';
  }

  return {
    generatedAt: new Date().toISOString(),
    period,
    overallPerformance,
    performanceScore,
    summary: {
      totalViews,
      dailyAverage: dailyAverage || 0,
      growth,
    },
    insights,
    tips: tips.slice(0, 5), // Limit to top 5 tips
    performanceAreas,
    recommendations: generateRecommendations(performanceScore, totalViews, growth),
  };
}

function calculatePerformanceScore(totalViews, growth, dailyAverage, period) {
  let score = 50; // Base score

  // Views score (0-30 points)
  const viewsScore = Math.min((totalViews / 100) * 30, 30);
  score += viewsScore;

  // Growth score (0-20 points)
  if (growth > 0) {
    score += Math.min(growth / 5, 20);
  } else if (growth < -20) {
    score -= 10;
  }

  // Daily average score (0-30 points)
  if (dailyAverage > 0) {
    const avgScore = Math.min((dailyAverage / 10) * 30, 30);
    score += avgScore;
  }

  // Adjust for period length
  const periodMultiplier = parseInt(period) === 30 ? 1 : parseInt(period) / 30;
  score = score * periodMultiplier;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

function generateRecommendations(score, totalViews, growth) {
  const recommendations = [];

  if (score < 40) {
    recommendations.push({
      title: 'Boost Visibility',
      description: 'Focus on making your QR codes more visible and training staff to promote the digital menu.',
      action: 'Increase QR code placement and staff training',
      impact: 'high',
    });
    recommendations.push({
      title: 'Menu Updates',
      description: 'Regularly update your menu with fresh content to encourage repeat views.',
      action: 'Add new items or update descriptions weekly',
      impact: 'medium',
    });
  } else if (score < 60) {
    recommendations.push({
      title: 'Engagement Strategies',
      description: 'Implement weekly promotions or specials to maintain steady customer engagement.',
      action: 'Create a promotion calendar',
      impact: 'medium',
    });
    recommendations.push({
      title: 'Multi-language Support',
      description: 'Consider adding more languages to reach a broader customer base.',
      action: 'Add language options based on customer demographics',
      impact: 'low',
    });
  } else if (score < 80) {
    recommendations.push({
      title: 'Optimize Menu Sections',
      description: 'Review which sections get the most views and optimize less popular ones.',
      action: 'Analyze section performance and adjust content',
      impact: 'medium',
    });
    recommendations.push({
      title: 'Customer Feedback',
      description: 'Collect feedback from customers about their digital menu experience.',
      action: 'Add feedback mechanism or surveys',
      impact: 'low',
    });
  } else {
    recommendations.push({
      title: 'Scale Your Success',
      description: 'Your digital menu is performing well! Consider expanding features or creating additional menus.',
      action: 'Explore advanced features and menu variations',
      impact: 'low',
    });
    recommendations.push({
      title: 'Maintain Momentum',
      description: 'Keep up the excellent work by maintaining regular updates and engaging content.',
      action: 'Continue current strategies and monitor performance',
      impact: 'low',
    });
  }

  return recommendations;
}

export function formatReportPeriod(period) {
  if (period === 'all') return 'All Time';
  if (period === '7') return 'Last 7 Days';
  if (period === '30') return 'Last 30 Days';
  if (period === '90') return 'Last 90 Days';
  return `Last ${period} Days`;
}

