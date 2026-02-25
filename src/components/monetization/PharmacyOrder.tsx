'use client';

import { useState } from 'react';
import { useMonetizationStore } from '@/store/monetization-store';
import { useMedicationStore } from '@/store/medication-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Store, 
  MapPin, 
  Clock, 
  Star, 
  Truck, 
  ShoppingCart,
  Pill,
  Phone,
  ExternalLink,
  CheckCircle2,
  Package
} from 'lucide-react';
import { Medication } from '@/types/medication';

interface PharmacyOrderProps {
  open: boolean;
  onClose: () => void;
  medication?: Medication;
}

export function PharmacyOrder({ open, onClose, medication }: PharmacyOrderProps) {
  const { pharmacies, createOrder, orders } = useMonetizationStore();
  const { updateStock } = useMedicationStore();
  
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [urgent, setUrgent] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrder, setLastOrder] = useState<ReturnType<typeof createOrder> | null>(null);

  const handlePlaceOrder = () => {
    if (!selectedPharmacy || !medication) return;
    
    const order = createOrder({
      medicationId: medication.id,
      medicationName: medication.name,
      currentStock: medication.stock ?? 0,
      requestedQuantity: parseInt(quantity),
      urgent
    }, selectedPharmacy);
    
    setLastOrder(order);
    setOrderPlaced(true);
  };

  const handleClose = () => {
    setOrderPlaced(false);
    setSelectedPharmacy('');
    setQuantity('1');
    setUrgent(false);
    setLastOrder(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            Pedir Reposición
          </DialogTitle>
          <DialogDescription>
            {medication ? `Reponer ${medication.name}` : 'Selecciona una farmacia'}
          </DialogDescription>
        </DialogHeader>

        {orderPlaced && lastOrder ? (
          /* Order Confirmation */
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">¡Pedido Enviado!</h3>
            <p className="text-gray-600 mb-4">
              Tu pedido ha sido enviado a la farmacia
            </p>
            
            <Card className="text-left mb-4">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Medicamento:</span>
                  <span className="font-medium">{lastOrder.medicationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cantidad:</span>
                  <span className="font-medium">{lastOrder.quantity} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-bold text-lg">{formatPrice(lastOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entrega estimada:</span>
                  <span className="font-medium">{lastOrder.estimatedDelivery}</span>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-xs text-gray-400 mb-4">
              La farmacia te contactará para confirmar el pedido
            </p>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cerrar
              </Button>
              <Button className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Llamar farmacia
              </Button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <div className="space-y-4 py-4">
            {/* Medication Info */}
            {medication && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: medication.color + '20' }}
                    >
                      <Pill className="h-5 w-5" style={{ color: medication.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{medication.name}</p>
                      <p className="text-sm text-gray-600">
                        Stock actual: {medication.stock ?? 0} {medication.stockUnit || medication.doseUnit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity Selection */}
            <div className="space-y-2">
              <Label>Cantidad a pedir</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="flex-1"
                />
                <Button
                  variant={urgent ? 'destructive' : 'outline'}
                  onClick={() => setUrgent(!urgent)}
                >
                  {urgent ? '🚨 Urgente' : 'Marcar urgente'}
                </Button>
              </div>
            </div>

            {/* Pharmacy Selection */}
            <div className="space-y-3">
              <Label>Selecciona una farmacia</Label>
              <div className="space-y-2">
                {pharmacies.map((pharmacy) => (
                  <Card 
                    key={pharmacy.id}
                    className={`cursor-pointer transition-all ${
                      selectedPharmacy === pharmacy.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPharmacy(pharmacy.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{pharmacy.name}</p>
                            {pharmacy.rating >= 4.5 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {pharmacy.rating}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {pharmacy.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {formatPrice(pharmacy.deliveryFee)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Mín.</p>
                          <p className="text-sm font-medium">{formatPrice(pharmacy.minOrder)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {selectedPharmacy && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Resumen del pedido</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Medicamento ({quantity} uds)</span>
                      <span>{formatPrice(15000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>{formatPrice(pharmacies.find(p => p.id === selectedPharmacy)?.deliveryFee || 0)}</span>
                    </div>
                    <div className="border-t pt-1 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPrice(15000 + (pharmacies.find(p => p.id === selectedPharmacy)?.deliveryFee || 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handlePlaceOrder}
                disabled={!selectedPharmacy}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Hacer pedido
              </Button>
            </div>

            {/* Affiliate Note */}
            <p className="text-xs text-gray-400 text-center">
              Este servicio conecta con farmacias asociadas. 
              Los precios pueden variar según disponibilidad.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
