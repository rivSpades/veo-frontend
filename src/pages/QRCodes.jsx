import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from '../store/LanguageContext';
import { QrCode, Upload, Palette, Eye, Download, Printer, RotateCcw } from 'lucide-react';
import { instancesAPI, apiFetch } from '../data/api';
import { getMenus } from '../data/menus';
import { jsPDF } from 'jspdf';

const defaultQRSettings = {
  foregroundColor: '#000000',
  size: 400,
  margin: 4,
  errorCorrectionLevel: 'M',
  logoImage: undefined,
};

export default function QRCodes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [menus, setMenus] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (settings) {
      generateQRCodeWithBackground();
    }
  }, [settings]);

  const loadData = async () => {
    try {
      const instanceId = localStorage.getItem('instance_id');
      if (!instanceId) {
        toast({
          title: 'Error',
          description: 'No instance selected. Please select an instance first.',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      // Fetch instance data from backend (includes QR settings)
      const instanceResponse = await instancesAPI.getInstance(instanceId);
      const instanceData = instanceResponse.success ? instanceResponse.data : instanceResponse;

      // Fetch menus only if we need to select one
      const menusResponse = await getMenus(instanceId);
      
      console.log('Menus API Response:', menusResponse);
      
      const allMenus = Array.isArray(menusResponse?.data) 
        ? menusResponse.data 
        : (menusResponse.success && Array.isArray(menusResponse.data) 
          ? menusResponse.data 
          : []);

      console.log('QR Code Data Loaded:', { 
        allMenus, 
        instanceData,
        hasMenus: allMenus.length > 0,
        menusIsArray: Array.isArray(allMenus),
        selectedMenuId: instanceData.qr_selected_menu_id
      });

      // Transform backend QR settings to frontend format
      const qrSettings = {
        selectedMenuId: instanceData.qr_selected_menu_id || allMenus[0]?.id,
        foregroundColor: instanceData.qr_foreground_color || '#000000',
        size: instanceData.qr_size || 400,
        margin: instanceData.qr_margin || 4,
        errorCorrectionLevel: instanceData.qr_error_correction_level || 'M',
        logoImage: instanceData.qr_logo_image || undefined,
      };

      console.log('QR Settings:', qrSettings);

      // Don't show alert if no menu - just continue with empty state
      if (!qrSettings.selectedMenuId) {
        setMenus([]); // Ensure it's set to empty array
        setLoading(false);
        // Continue to show the page even without a menu
      }

      setMenus(allMenus); // allMenus is guaranteed to be an array here
      setSettings(qrSettings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QR code settings. Please refresh the page.',
        type: 'error',
      });
      setLoading(false);
    }
  };

  const generateQRCodeWithBackground = async () => {
    if (!settings || !settings.selectedMenuId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = settings.size || 400;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    try {
      // Generate QR code URL
      const baseUrl = `${window.location.origin}/preview/${settings.selectedMenuId}`;
      const qrParams = new URLSearchParams({
        data: baseUrl,
        size: `${size}x${size}`,
        bgcolor: 'ffffff',
        color: settings.foregroundColor.replace('#', ''),
        margin: (settings.margin || 4).toString(),
        ecc: settings.errorCorrectionLevel || 'M',
        format: 'png',
      });

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?${qrParams.toString()}`;

      // If there's a background image, draw it first
      if (settings.logoImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';

        bgImg.onload = () => {
          // Fill white background first
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);

          // Draw background image to fill entire canvas
          ctx.drawImage(bgImg, 0, 0, size, size);

          // Load and draw QR code on top with blend mode
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';

          qrImg.onload = () => {
            // Set blend mode to multiply for better visibility
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(qrImg, 0, 0, size, size);

            // Reset blend mode
            ctx.globalCompositeOperation = 'source-over';

            // Convert canvas to data URL for preview
            const dataUrl = canvas.toDataURL('image/png');
            console.log('QR Code generated with background:', dataUrl.substring(0, 50));
            setQrCodeUrl(dataUrl);
          };

          qrImg.onerror = () => {
            console.error('Failed to load QR code image');
            setQrCodeUrl(qrUrl);
          };

          qrImg.src = qrUrl;
        };

        bgImg.onerror = () => {
          console.error('Failed to load background image');
          loadQRCodeOnly(qrUrl, ctx, size);
        };

        bgImg.src = settings.logoImage;
      } else {
        // No background image, just load QR code with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        loadQRCodeOnly(qrUrl, ctx, size);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const loadQRCodeOnly = (qrUrl, ctx, size) => {
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';

    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);
      const dataUrl = canvasRef.current?.toDataURL('image/png');
      if (dataUrl) {
        console.log('QR Code generated (no background):', dataUrl.substring(0, 50));
        setQrCodeUrl(dataUrl);
      }
    };

    qrImg.onerror = () => {
      console.error('Failed to load QR code');
      setQrCodeUrl(qrUrl);
    };

    qrImg.src = qrUrl;
  };

  const handleSettingChange = (key, value) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setIsDirty(true);
  };

  // Auto-save immediately
  useEffect(() => {
    if (!isDirty || !settings) return;

    const saveSettings = async () => {
      try {
        const instanceId = localStorage.getItem('instance_id');
        if (!instanceId) return;

        // Transform frontend settings to backend format
        const backendData = {
          qr_selected_menu_id: settings.selectedMenuId,
          qr_foreground_color: settings.foregroundColor,
          qr_size: settings.size,
          qr_margin: settings.margin,
          qr_error_correction_level: settings.errorCorrectionLevel,
        };

        // Only include logoImage if it's changed and not a URL (new upload)
        if (settings.logoImage && !settings.logoImage.startsWith('http')) {
          // For file uploads, use FormData
          const formData = new FormData();
          Object.keys(backendData).forEach(key => {
            formData.append(key, backendData[key]);
          });
          
          // Convert base64 to blob for logo
          if (settings.logoImage) {
            const response = await fetch(settings.logoImage);
            const blob = await response.blob();
            formData.append('qr_logo_image', blob, 'qr-logo.png');
          }
          
          await instancesAPI.updateInstance(instanceId, formData);
        } else {
          await instancesAPI.updateInstance(instanceId, backendData);
        }

        setIsDirty(false);
        console.log('QR settings saved to backend');
      } catch (error) {
        console.error('Error saving QR settings:', error);
        toast({
          title: 'Auto-save failed',
          description: 'Failed to save QR settings. Please try again.',
          type: 'error',
        });
      }
    };

    saveSettings();
  }, [settings, isDirty, toast]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        type: 'error',
      });
      return;
    }

    setLogoUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSettingChange('logoImage', reader.result);
        toast({
          title: 'Background image uploaded',
          description: 'Your background image has been uploaded successfully.',
          type: 'success',
        });
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: t('qrCodes.uploadFailed'),
        description: 'Failed to upload background image. Please try again.',
        type: 'error',
      });
      setLogoUploading(false);
    }
  };

  const handleResetToDefault = () => {
    if (!settings) return;

    const resetSettings = {
      ...settings,
      ...defaultQRSettings,
    };
    setSettings(resetSettings);
    toast({
      title: 'Reset to defaults',
      description: 'QR code settings have been reset to default values.',
      type: 'info',
    });
  };

  const downloadQRCode = async (format) => {
    if (!canvasRef.current || !qrCodeUrl) {
      console.error('Download failed:', { 
        hasCanvas: !!canvasRef.current, 
        hasQrCodeUrl: !!qrCodeUrl 
      });
      toast({
        title: t('qrCodes.cannotDownload'),
        description: 'QR code is not ready. Please wait for it to generate.',
        type: 'error',
      });
      return;
    }

    setDownloading(true);
    try {
      // Ensure menus is an array
      const menusList = Array.isArray(menus) ? menus : [];
      const selectedMenu = menusList.find((m) => m.id === settings?.selectedMenuId);
      const fileName = `qr-code-${selectedMenu?.name || 'menu'}`;

      if (format === 'png') {
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      } else if (format === 'pdf') {
        // Create PDF with jsPDF
        const imgData = canvasRef.current.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // A4 dimensions in mm
        const pageWidth = 210;
        const pageHeight = 297;

        // QR code size (centered on page)
        const qrSize = 100;
        const x = (pageWidth - qrSize) / 2;
        const y = (pageHeight - qrSize) / 2 - 20; // Offset up a bit for text below

        // Add QR code image
        pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);

        // Add menu name below QR code
        const menuName = selectedMenu?.name || 'Menu';
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(menuName, pageWidth / 2, y + qrSize + 15, { align: 'center' });

        // Add instructions
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Scan this QR code with your phone', pageWidth / 2, y + qrSize + 25, { align: 'center' });
        pdf.text('to view our digital menu', pageWidth / 2, y + qrSize + 32, { align: 'center' });

        // Save PDF
        pdf.save(`${fileName}.pdf`);
      }

      toast({
        title: t('qrCodes.downloadStarted'),
        description: `Your QR code is being downloaded as ${format.toUpperCase()}.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t('qrCodes.downloadFailed'),
        description: 'Failed to download QR code. Please try again.',
        type: 'error',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Ensure menus is an array
    const menusList = Array.isArray(menus) ? menus : [];
    const selectedMenu = menusList.find((m) => m.id === settings?.selectedMenuId);
    const menuName = selectedMenu?.name || 'Menu';

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${menuName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
              margin: 0;
            }
            .qr-container {
              display: inline-block;
              padding: 40px;
              border: 2px solid #000;
              margin: 20px;
              page-break-inside: avoid;
            }
            .qr-code {
              display: block;
              margin: 0 auto 20px;
              max-width: 300px;
              height: auto;
            }
            .menu-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 16px;
              color: #666;
              margin-top: 20px;
            }
            @media print {
              body { padding: 20px; }
              .qr-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="menu-name">${menuName}</div>
            <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            <div class="instructions">
              Scan this QR code with your phone<br>
              to view our digital menu
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Print when images are loaded
    printWindow.onload = () => {
      printWindow.print();
    };
  };


  if (loading || !settings) {
    return (
      <DashboardLayout title={t('qrCodes.title')} subtitle={t('qrCodes.subtitle')}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('qrCodes.title')}
      subtitle={t('qrCodes.subtitle')}
    >
      <div className="p-6">
        {/* Hidden canvas for QR code generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customization */}
          <div className="space-y-6">
            {/* Background Image */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Background Image
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.logoImage && (
                  <div className="flex items-center gap-4">
                    <img
                      src={settings.logoImage}
                      alt="Background image"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div>
                      <p className="font-medium">Current Background</p>
                      <p className="text-sm text-gray-600">Will fill entire QR code area</p>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload background image</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Image will fill the entire QR code background
                  </p>
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={logoUploading}
                    />
                    <Button variant="outline" size="sm" disabled={logoUploading}>
                      {logoUploading ? 'Uploading...' : 'Browse Files'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-green-600" />
                  {t('qrCodes.colorTitle')}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="foreground-color">QR Code Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="foreground-color"
                      value={settings.foregroundColor}
                      onChange={(e) => handleSettingChange('foregroundColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.foregroundColor}
                      onChange={(e) => handleSettingChange('foregroundColor', e.target.value)}
                      placeholder={t('dashboard.qrCode.colorPlaceholder')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={handleResetToDefault} className="w-full bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('qrCodes.resetToDefault')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview and Actions */}
          <div className="space-y-6">
            {/* QR Code Preview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Preview
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {qrCodeUrl ? (
                    <div className="space-y-4">
                      <div className="inline-block p-6 rounded-lg border-2 border-dashed border-gray-300 bg-white">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code Preview"
                          className="mx-auto rounded"
                          style={{
                            width: 200,
                            height: 200,
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">Menu QR Code</p>
                        <p className="text-sm text-gray-600">Ready to download or print</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12">
                      <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">QR code will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Download Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  {t('qrCodes.downloadPrint')}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => downloadQRCode('png')}
                  disabled={!qrCodeUrl || downloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? t('qrCodes.downloading') : t('qrCodes.downloadPNG')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => downloadQRCode('pdf')}
                  disabled={!qrCodeUrl || downloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handlePrint}
                  disabled={!qrCodeUrl}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {t('qrCodes.printableVersion')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

QRCodes.loader = async () => {
  return {};
};
