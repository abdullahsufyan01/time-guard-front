import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Building, Eye } from 'lucide-react';

const QRCodeGenerator = ({ building, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  // Generate QR code target URL (encode URL string directly for compatibility)
  const qrUrl = `${window.location.origin}/building/${building.id}`;

  React.useEffect(() => {
    generateQRCode();
  }, [building]);

  const generateQRCode = async () => {
    try {
      const dataURL = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#15505d',
          light: '#ffffff'
        }
      });
      setQrCodeDataURL(dataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `QR-Code-${building.name.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeDataURL;
    link.click();
  };

  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Building className="h-5 w-5 mr-2 text-[#15505d]" />
              QR Code für {building.name}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-slate-200 inline-block">
              {qrCodeDataURL ? (
                <img 
                  src={qrCodeDataURL} 
                  alt="QR Code" 
                  className="w-56 h-56 sm:w-64 sm:h-64"
                />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-100 rounded flex items-center justify-center">
                  <div className="text-slate-500">Generiere QR Code...</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 mb-2">QR Code Informationen:</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <div><strong>Gebäude:</strong> {building.name}</div>
                <div><strong>URL:</strong> {qrUrl}</div>
                <div><strong>Erstellt:</strong> {new Date().toLocaleDateString('de-DE')}</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={downloadQRCode}
              className="flex-1 bg-[#15505d] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d47] transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={copyQRData}
              className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <span className="mr-2 flex items-center">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </span>
              <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Drucken Sie diesen QR Code aus und platzieren Sie ihn im Gebäude. 
              Bewohner können ihn scannen, um direkt Meldungen zu erstellen oder den Status zu prüfen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
