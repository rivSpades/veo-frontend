import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { QrCode, Phone, ArrowLeft, RotateCcw, Shield, Mail } from 'lucide-react';
import { useTranslation } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import { authAPI } from '../data/api';

export default function VerifyOTP() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuth();

  // Get data from navigation state
  const { email, phone, name } = location.state || {};

  // Redirect if no email or phone
  useEffect(() => {
    if (!email || !phone) {
      navigate('/auth/register');
    }
  }, [email, phone, navigate]);

  // Timer for verification code
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerificationCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const otpCode = verificationCode.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      // Verify OTP
      const response = await authAPI.verifyOTP(email, phone, otpCode);

      if (response.success) {
        // Automatically logged in - tokens stored in api.js
        navigate('/onboarding', {
          state: {
            message: 'Registration successful! Welcome to VEOmenu.',
          },
        });
      } else {
        setError(response.error?.message || response.error?.data?.otp_code?.[0] || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.resendOTP(email, phone);

      if (response.success) {
        setTimeLeft(600);
        setCanResend(false);
        setVerificationCode(['', '', '', '', '', '']);
        // Focus first input
        document.getElementById('code-0')?.focus();
      } else {
        setError(response.error?.message || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      {/* Back to Register */}
      <Link
        to="/auth/register"
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Register</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <QrCode className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span className="text-xl md:text-2xl font-bold text-white">VEOmenu</span>
            </div>
            <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verify Your Phone</CardTitle>
            <CardDescription className="text-white/80">
              We sent a 6-digit code to
            </CardDescription>
            <p className="text-white font-semibold">{phone}</p>
            <p className="text-white/70 text-sm">and {email}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              {/* Verification Code Input */}
              <div className="flex justify-center gap-2">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/30 text-white focus:border-white/50"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-white/80 mb-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  <span className="text-sm">Code expires in</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatTime(timeLeft)}</div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
                disabled={isLoading || verificationCode.some((digit) => digit === '')}
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </form>

            {/* Resend Code */}
            <div className="text-center space-y-3">
              <p className="text-white/80 text-sm">Didn't receive the code?</p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={!canResend || isLoading}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resend Code
              </Button>
            </div>

            {/* Security Info */}
            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Secure Verification</h4>
                  <p className="text-sm text-white/80">
                    We verify your phone number to keep your account secure and prevent unauthorized access.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Backup Info */}
            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/90">
                  <strong>Tip:</strong> Check your email inbox for a backup code if you didn't receive the SMS.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

VerifyOTP.loader = async () => {
  return {};
};
