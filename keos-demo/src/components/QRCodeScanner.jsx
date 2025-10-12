import React, { useState, useRef, useEffect } from 'react';
// import { QrScanner } from 'react-qr-scanner';
import QrScanner from 'react-qr-scanner';

import { Camera, X, AlertCircle, CheckCircle, Building } from 'lucide-react';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Request camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setHasPermission(true);
      })
      .catch((err) => {
        setHasPermission(false);
        setError('Kamera-Zugriff verweigert. Bitte erlauben Sie den Zugriff auf die Kamera.');
      });
  }, []);

  const handleScan = (data) => {
    if (!data) return;

    // react-qr-scanner may pass an object { text } or a string
    const raw = typeof data === 'string' ? data : (data.text || '');
    if (!raw) return;

    // 1) Try parse as URL and extract /building/:id
    try {
      const maybeUrl = new URL(raw);
      const parts = maybeUrl.pathname.split('/').filter(Boolean);
      const buildingIdx = parts.findIndex(p => p.toLowerCase() === 'building');
      if (buildingIdx !== -1 && parts[buildingIdx + 1]) {
        const buildingId = parts[buildingIdx + 1];
        const payload = { type: 'building', buildingId, buildingName: undefined, url: raw };
        setScannedData(payload);
        setIsScanning(false);
        setError(null);
        onScan && onScan(payload);
        return;
      }
    } catch (_) {
      // Not a URL, continue
    }

    // 2) Fallback: try JSON format { type: 'building', buildingId, ... }
    try {
      const qrData = JSON.parse(raw);
      if (qrData && qrData.type === 'building' && qrData.buildingId) {
        setScannedData(qrData);
        setIsScanning(false);
        setError(null);
        onScan && onScan(qrData);
        return;
      }
    } catch (_) {}

    setError('Ungültiger QR Code. Erwartet URL /building/:id oder kompatibles JSON.');
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setError('Fehler beim Scannen. Bitte versuchen Sie es erneut.');
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
    setIsScanning(true);
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Kamera-Zugriff erforderlich
              </h3>
              <p className="text-slate-600 mb-4">
                Um QR Codes zu scannen, benötigen wir Zugriff auf Ihre Kamera.
                Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.
              </p>
              <button
                onClick={onClose}
                className="bg-[#15505d] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d47] transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (scannedData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                QR Code erfolgreich gescannt!
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Building className="h-5 w-5 text-[#15505d] mr-2" />
                  <span className="font-medium">{scannedData.buildingName}</span>
                </div>
                <p className="text-sm text-slate-600">
                  Gebäude-ID: {scannedData.buildingId}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Erneut scannen
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#15505d] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d47] transition-colors"
                >
                  Fortfahren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-[#15505d]" />
              QR Code scannen
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="relative">
            {hasPermission && isScanning && (
              <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
                <QrScanner
                  onScan={handleScan}
                  onError={handleError}
                  style={{ width: '100%', height: '100%' }}
                  constraints={{
                    facingMode: 'environment'
                  }}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#15505d] rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#15505d] rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#15505d] rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#15505d] rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#15505d] rounded-br-lg"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Anleitung:</strong> Richten Sie die Kamera auf einen Gebäude-QR Code. 
              Der Code wird automatisch erkannt und Sie werden zu den entsprechenden Funktionen weitergeleitet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
