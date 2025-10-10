import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Separator } from '../components/ui/Separator';
import { QrCode, Mail, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'magic-link'
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login, requestMagicLink, isLoading, error: authError, clearError } = useAuth();

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setEmail(location.state.email);
      }
    }
  }, [location.state]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    clearError();

    if (!email || !password) {
      setError(t('auth.login.alertEmailPassword'));
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error?.message || t('auth.login.alertError'));
      }
    } catch (err) {
      setError(t('auth.login.alertError'));
    }
  };

  const handleMagicLink = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMessage('');
    clearError();

    if (!email) {
      setError(t('auth.login.magicLinkAlert'));
      return;
    }

    try {
      const result = await requestMagicLink(email);

      if (result.success) {
        setMagicLinkSent(true);
      } else {
        setError(result.error?.message || t('auth.login.magicLinkError'));
      }
    } catch (err) {
      setError(t('auth.login.magicLinkError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">{t('auth.back')}</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm md:max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2 md:space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-2 md:mb-4">
              <QrCode className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span className="text-xl md:text-2xl font-bold text-white">{t('app.name')}</span>
            </div>
            <CardTitle className="text-xl md:text-2xl text-white">{t('auth.login.title')}</CardTitle>
            <CardDescription className="text-sm md:text-base text-white/80">
              {t('auth.login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/50 text-white px-4 py-2 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            {(error || authError) && (
              <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-md text-sm">
                {error || authError}
              </div>
            )}

            {magicLinkSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 md:py-8"
              >
                <Mail className="h-12 w-12 md:h-16 md:w-16 text-white mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2 text-white">{t('auth.login.magicLinkSent')}</h3>
                <p className="text-sm md:text-base text-white/80 mb-4 px-2">
                  {t('auth.login.magicLinkSentDesc')} <strong>{email}</strong>
                </p>
                <Button
                  variant="outline"
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {t('auth.login.backToLogin')}
                </Button>
              </motion.div>
            ) : (
              <>
                <form onSubmit={authMode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm md:text-base text-white">
                      {t('auth.login.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 md:h-11 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    />
                  </div>

                  {authMode === 'password' && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm md:text-base text-white">
                        {t('auth.login.password')}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.login.passwordPlaceholder')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-10 md:h-11 pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/60 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 md:h-11 bg-white text-purple-600 hover:bg-white/90 font-semibold"
                    disabled={isLoading}
                  >
                    {authMode === 'password' ? (
                      <>{isLoading ? t('auth.login.submitting') : t('auth.login.submit')}</>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {isLoading ? t('auth.login.sending') : t('auth.login.magicLink')}
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/70">{t('auth.login.or')}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-10 md:h-11 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setAuthMode(authMode === 'password' ? 'magic-link' : 'password')}
                >
                  {authMode === 'password' ? (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('auth.login.useMagicLink')}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {t('auth.login.usePassword')}
                    </>
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-white/70">{t('auth.login.noAccount')} </span>
                  <Link to="/auth/register" className="text-white hover:underline font-medium">
                    {t('auth.login.createAccount')}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

Login.loader = async () => {
  return {};
};
