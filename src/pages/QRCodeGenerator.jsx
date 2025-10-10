import React, { useState, useRef } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ArrowLeft, QrCode as QrCodeIcon } from 'lucide-react';
import { useTranslation } from '../store/LanguageContext';
import { LanguageSwitcher } from '../components/i18n/LanguageSwitcher';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { getMenus } from '../utils/menuStorage';

/**
 * QRCodeGenerator Page - Generate QR codes for menus
 */
function QRCodeGenerator() {
  const { menus } = useLoaderData();
  const { t } = useTranslation();
  const qrRef = useRef(null);

  const [settings, setSettings] = useState({
    selectedMenuId: menus[0]?.id || null,
    size: 300,
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorLevel: 'M',
  });

  const selectedMenu = menus.find((m) => m.id === Number(settings.selectedMenuId));
  const qrValue = selectedMenu
    ? `${window.location.origin}/preview/${selectedMenu.id}`
    : 'https://veomenu.com';

  const handleDownload = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${selectedMenu?.name || 'menu'}.png`;
    link.click();
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <QrCodeIcon className="w-8 h-8 text-primary-600" />
                <span className="text-2xl font-bold text-secondary-900">{t('app.name')}</span>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">QR Code Generator</h1>
            <p className="text-secondary-600">
              Generate QR codes for your menus to share with customers
            </p>
          </div>

          {menus.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <QrCodeIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No menus available</h3>
                <p className="text-secondary-600 mb-6">Create a menu first to generate QR codes</p>
                <Link to="/dashboard/menus/create">
                  <Button>Create Menu</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Settings Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Settings</CardTitle>
                  <CardDescription>Customize your QR code appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Select Menu */}
                  <div>
                    <Label htmlFor="menu-select">Select Menu</Label>
                    <Select
                      id="menu-select"
                      value={settings.selectedMenuId || ''}
                      onChange={(e) => handleChange('selectedMenuId', Number(e.target.value))}
                    >
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Size */}
                  <div>
                    <Label htmlFor="size">Size (pixels)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="100"
                      max="1000"
                      step="50"
                      value={settings.size}
                      onChange={(e) => handleChange('size', Number(e.target.value))}
                    />
                  </div>

                  {/* Foreground Color */}
                  <div>
                    <Label htmlFor="fg-color">Foreground Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="fg-color"
                        type="color"
                        value={settings.fgColor}
                        onChange={(e) => handleChange('fgColor', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.fgColor}
                        onChange={(e) => handleChange('fgColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="bg-color"
                        type="color"
                        value={settings.bgColor}
                        onChange={(e) => handleChange('bgColor', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.bgColor}
                        onChange={(e) => handleChange('bgColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Error Correction Level */}
                  <div>
                    <Label htmlFor="error-level">Error Correction Level</Label>
                    <Select
                      id="error-level"
                      value={settings.errorLevel}
                      onChange={(e) => handleChange('errorLevel', e.target.value)}
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </Select>
                  </div>

                  {/* URL Preview */}
                  <div>
                    <Label>QR Code URL</Label>
                    <div className="p-3 bg-secondary-100 rounded-lg">
                      <code className="text-sm text-secondary-900 break-all">{qrValue}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Your QR code preview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div
                      ref={qrRef}
                      className="p-6 bg-white rounded-lg border-2 border-secondary-200 shadow-lg"
                    >
                      <QRCodeCanvas
                        value={qrValue}
                        size={settings.size}
                        fgColor={settings.fgColor}
                        bgColor={settings.bgColor}
                        level={settings.errorLevel}
                        includeMargin={true}
                      />
                    </div>

                    {selectedMenu && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-secondary-600 mb-1">Menu:</p>
                        <p className="font-semibold text-secondary-900">{selectedMenu.name}</p>
                      </div>
                    )}

                    <Button onClick={handleDownload} className="mt-6 gap-2" size="lg">
                      <Download className="w-5 h-5" />
                      Download PNG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Loader function
QRCodeGenerator.loader = async () => {
  const menus = getMenus();
  return { menus };
};

export default QRCodeGenerator;
