import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QrCode,
  Globe,
  Palette,
  BarChart3,
  Smartphone,
  Zap,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { useTranslation } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { DemoWidget } from '../components/DemoWidget';
import { getDemoMenu } from '../data/menus';
import { instancesAPI } from '../data/api';
import Footer from '../components/Footer';

const features = [
  { icon: QrCode, titleKey: 'feature.qr.title', descKey: 'feature.qr.desc' },
  { icon: Globe, titleKey: 'feature.translate.title', descKey: 'feature.translate.desc' },
  { icon: Palette, titleKey: 'feature.design.title', descKey: 'feature.design.desc' },
  { icon: Smartphone, titleKey: 'feature.mobile.title', descKey: 'feature.mobile.desc' },
  { icon: BarChart3, titleKey: 'feature.analytics.title', descKey: 'feature.analytics.desc' },
  { icon: Zap, titleKey: 'feature.ease.title', descKey: 'feature.ease.desc' },
];

/**
 * Landing Page - Main marketing page with modern gradient design
 */
function Landing() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [demoMenu, setDemoMenu] = useState(null);
  const [demoRestaurant, setDemoRestaurant] = useState(null);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Load demo menu and restaurant from backend
  useEffect(() => {
    const loadDemoData = async () => {
      try {
        // Use fetch directly to avoid automatic redirect on 401
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
        
        const [menuResponse, instanceResponse] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/menus/demo/`, { method: 'GET' }),
          fetch(`${API_BASE_URL}/instances/demo/`, { method: 'GET' }),
        ]);

        // Handle menu response
        if (menuResponse.status === 'fulfilled' && menuResponse.value.ok) {
          const menuData = await menuResponse.value.json();
          setDemoMenu(menuData);
        }

        // Handle instance response
        if (instanceResponse.status === 'fulfilled' && instanceResponse.value.ok) {
          const instanceData = await instanceResponse.value.json();
          setDemoRestaurant(instanceData);
        }
      } catch (error) {
        console.error('Error loading demo data:', error);
        // Fallback to default demo data in DemoWidget if backend fails
      }
    };

    loadDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <QrCode className="h-6 w-6 md:h-8 md:w-8 text-white" />
            <span className="text-xl md:text-2xl font-bold text-white">{t('app.name')}</span>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher />
            <Link to="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm md:text-base text-gray-900 hover:bg-gray-100 bg-white/90"
              >
                {t('auth.login')}
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button
                size="sm"
                className="text-sm md:text-base bg-white text-purple-600 hover:bg-white/90"
              >
                {t('auth.register')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t('landing.hero.title')}{' '}
                <span className="text-yellow-300">{t('landing.hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
                {t('landing.hero.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-base md:text-lg px-8 py-4 bg-white text-purple-600 hover:bg-white/90 font-semibold"
                  >
                    {t('landing.cta.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/70 mt-4">
                {t('landing.trial')}
              </p>
            </motion.div>

            {/* Right Content - iPhone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* iPhone Frame */}
                <div className="w-80 h-[600px] bg-black rounded-[2.5rem] p-3 shadow-2xl">
                  {/* Device notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/80 rounded-full z-10" />

                  {/* Screen with full demo functionality */}
                  <div className="bg-white rounded-[28px] overflow-hidden w-full h-full border shadow-inner scrollbar-hide">
                    <DemoWidget restaurant={demoRestaurant} menu={demoMenu} />
                  </div>
                </div>

                {/* QR Code for mobile scanning */}
                <div className="hidden xl:block absolute -right-24 top-1/2 -translate-y-1/2 bg-white p-3 rounded-lg shadow-lg z-0">
                  <div className="text-center mb-2">
                    <p className="text-xs font-medium text-gray-700">{t('landing.scanToTry')}</p>
                    <p className="text-xs text-gray-500">{t('landing.scanOnMobile')}</p>
                  </div>
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + '/preview')}`}
                      alt="QR Code for demo"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.whyChoose')}
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {t('landing.whyChooseDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-lg md:text-xl text-white">{t(feature.titleKey)}</CardTitle>
                      <CardDescription className="text-sm md:text-base text-white/80">
                        {t(feature.descKey)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('landing.ctaSection.title')}</h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('landing.ctaSection.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button
                  size="lg"
                  className="text-base md:text-lg px-8 py-4 bg-white text-purple-600 hover:bg-white/90 font-semibold"
                >
                  {t('landing.cta.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base md:text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 font-semibold bg-transparent"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {t('landing.ctaSection.contactSales')}
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/70 mt-6">{t('landing.trial')}</p>
          </motion.div>
        </div>
      </section>

     {/* <Footer /> */}
    </div>
  );
}

// Loader for this page
Landing.loader = async () => {
  return {};
};

export default Landing;
