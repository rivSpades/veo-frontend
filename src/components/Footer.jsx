import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import { useTranslation } from '../store/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <QrCode className="h-6 w-6 text-white" />
              <span className="text-xl font-bold text-white">{t('app.name')}</span>
            </div>
            <p className="text-white/70 text-sm">{t('landing.footer.tagline')}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.product')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  {t('landing.footer.features')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  {t('landing.footer.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-white transition-colors">
                  {t('landing.footer.templates')}
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-white transition-colors">
                  {t('landing.footer.integrations')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.company')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  {t('landing.footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  {t('landing.footer.blog')}
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  {t('landing.footer.careers')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t('landing.footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.support')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  {t('landing.footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  {t('landing.footer.documentation')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  {t('landing.footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  {t('landing.footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-sm text-white/70">{t('landing.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

