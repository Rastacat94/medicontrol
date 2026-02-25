'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Pill,
  Zap,
  X
} from 'lucide-react';
import { useMedicationStore, getNextMedicationColor } from '@/store/medication-store';
import { Medication, DoseUnit } from '@/types/medication';

interface ScanResult {
  name: string | null;
  genericName: string | null;
  dose: number | null;
  doseUnit: string | null;
  laboratory: string | null;
  stockInBox: number | null;
  confidence: number;
}

interface MedicationScannerProps {
  open: boolean;
  onClose: () => void;
  onMedicationScanned: (medication: Partial<Medication>) => void;
}

export function MedicationScanner({ open, onClose, onMedicationScanned }: MedicationScannerProps) {
  const { medications } = useMedicationStore();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useManualEntry, setUseManualEntry] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError('No se pudo acceder a la cámara. Usa la opción de subir imagen.');
      setUseManualEntry(true);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    setImagePreview(base64Image);
    stopCamera();
    analyzeImage(base64Image);
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = async (base64Image: string) => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    
    try {
      const response = await fetch('/api/scan-medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al analizar la imagen');
      }
      
      setScanResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar la imagen');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!scanResult?.name) {
      setError('No se pudo identificar el medicamento. Por favor, ingresa los datos manualmente.');
      return;
    }
    
    const doseUnitMap: Record<string, DoseUnit> = {
      'mg': 'mg',
      'ml': 'ml',
      'pastillas': 'pastillas',
      'gotas': 'gotas',
      'cápsulas': 'capsulas',
      'capsulas': 'capsulas',
      'g': 'g',
      'unidades': 'unidades'
    };
    
    const medication: Partial<Medication> = {
      name: scanResult.name,
      genericName: scanResult.genericName || undefined,
      dose: scanResult.dose || 1,
      doseUnit: doseUnitMap[scanResult.doseUnit?.toLowerCase() || ''] || 'mg',
      stock: scanResult.stockInBox || 0,
      color: getNextMedicationColor(medications)
    };
    
    onMedicationScanned(medication);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setImagePreview(null);
    setError(null);
    setUseManualEntry(false);
    onClose();
  };

  const resetScan = () => {
    setScanResult(null);
    setImagePreview(null);
    setError(null);
    startCamera();
  };

  // Start camera when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      startCamera();
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Escanear Medicamento
          </DialogTitle>
          <DialogDescription>
            Apunta la cámara a la caja del medicamento. La IA reconocerá el nombre y dosis automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera view or image preview */}
          {!imagePreview ? (
            <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                </div>
              </div>
              
              {/* Capture button */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 border-white/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-white" />
                </Button>
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-white"
                  onClick={capturePhoto}
                >
                  <Camera className="h-6 w-6 text-black" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Medicamento escaneado"
                className="w-full h-full object-contain"
              />
              {!isScanning && !scanResult && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetScan}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reintentar
                </Button>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Scanning indicator */}
          {isScanning && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-800">Analizando medicamento...</p>
                  <p className="text-sm text-blue-600">La IA está identificando el nombre y dosis</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Error al escanear</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan result */}
          {scanResult && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Medicamento identificado</span>
                  {scanResult.confidence && (
                    <Badge variant="secondary" className="ml-auto">
                      {Math.round(scanResult.confidence * 100)}% confianza
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  {scanResult.name && (
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{scanResult.name}</span>
                    </div>
                  )}
                  {scanResult.genericName && (
                    <div className="text-gray-600 ml-6">
                      Genérico: {scanResult.genericName}
                    </div>
                  )}
                  {scanResult.dose && (
                    <div className="text-gray-600 ml-6">
                      Dosis: {scanResult.dose} {scanResult.doseUnit}
                    </div>
                  )}
                  {scanResult.stockInBox && (
                    <div className="text-gray-600 ml-6">
                      Unidades en caja: {scanResult.stockInBox}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={resetScan} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Escanear otro
                  </Button>
                  <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Usar estos datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual entry toggle */}
          {(error || !stream) && !scanResult && !isScanning && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setUseManualEntry(!useManualEntry)}
            >
              {useManualEntry ? 'Usar cámara' : 'Ingresar manualmente'}
            </Button>
          )}

          {/* Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 Consejos para mejor resultado:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Asegúrate de que haya buena iluminación</li>
              <li>Enfoca el nombre del medicamento</li>
              <li>Evita reflejos y sombras</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
