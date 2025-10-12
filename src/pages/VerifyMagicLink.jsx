import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { QrCode, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';

export default function VerifyMagicLink() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { verifyMagicLink } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage(t('auth.verify.noToken'));
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyMagicLink(token);

        if (result.success) {
          setStatus('success');
          // Redirect to dashboard immediately
          navigate('/dashboard');
        } else {
          setStatus('error');
          setErrorMessage(result.error?.message || t('auth.verify.invalid'));
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(t('auth.verify.error'));
      }
    };

    verify();
  }, [searchParams, verifyMagicLink, navigate, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <QrCode className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">{t('app.name')}</span>
            </div>
            <CardTitle className="text-2xl text-white">
              {status === 'verifying' && t('auth.verify.title')}
              {status === 'success' && t('auth.verify.success')}
              {status === 'error' && t('auth.verify.failed')}
            </CardTitle>
            <CardDescription className="text-white/80">
              {status === 'verifying' && t('auth.verify.subtitle')}
              {status === 'success' && t('auth.verify.successDesc')}
              {status === 'error' && errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-white mx-auto animate-spin" />
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-white/80 text-sm">
                  {t('auth.verify.redirecting')}
                </p>
              </motion.div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <XCircle className="h-16 w-16 text-red-400 mx-auto" />
                </motion.div>
                <Link to="/auth/login">
                  <Button className="w-full bg-white text-purple-600 hover:bg-white/90">
                    {t('auth.verify.backToLogin')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

VerifyMagicLink.loader = async () => {
  return {};
};
