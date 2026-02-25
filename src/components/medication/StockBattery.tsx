'use client';

import { Medication } from '@/types/medication';
import { Progress } from '@/components/ui/progress';

interface StockBatteryProps {
  medication: Medication;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Barra de progreso tipo batería para visualizar stock
 * - Verde: stock > 50%
 * - Amarillo: stock entre 20% y 50%  
 * - Rojo: stock < 20% o menos de 3 unidades
 */
export function StockBattery({ medication, showLabel = true, size = 'md' }: StockBatteryProps) {
  const stock = medication.stock ?? 0;
  const threshold = medication.lowStockThreshold ?? 5;
  
  // Calcular el máximo para la barra (asumimos que el máximo es el doble del umbral o el stock actual)
  const maxStock = Math.max(threshold * 4, stock, 20);
  const percentage = Math.min((stock / maxStock) * 100, 100);
  
  // Determinar el nivel y color
  const getStockLevel = () => {
    const criticalUnits = 3;
    
    // Sin stock
    if (stock === 0) {
      return {
        level: 'empty',
        color: 'red',
        bgColor: 'bg-red-500',
        textColor: 'text-red-600',
        borderColor: 'border-red-300',
        label: 'Sin stock',
        icon: '🔴',
      };
    }
    
    // Crítico: menos de 3 unidades o menos del 20%
    if (stock <= criticalUnits || percentage < 20) {
      return {
        level: 'critical',
        color: 'red',
        bgColor: 'bg-red-500',
        textColor: 'text-red-600',
        borderColor: 'border-red-300',
        label: 'Crítico',
        icon: '🔴',
      };
    }
    
    // Bajo: entre 20% y 50%
    if (percentage < 50) {
      return {
        level: 'low',
        color: 'amber',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-300',
        label: 'Bajo',
        icon: '🟡',
      };
    }
    
    // OK: más del 50%
    return {
      level: 'ok',
      color: 'green',
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      borderColor: 'border-green-300',
      label: 'OK',
      icon: '🟢',
    };
  };

  const stockInfo = getStockLevel();
  
  // Tamaños
  const sizes = {
    sm: { height: 'h-3', segments: 4, text: 'text-xs' },
    md: { height: 'h-4', segments: 5, text: 'text-sm' },
    lg: { height: 'h-6', segments: 5, text: 'text-base' },
  };

  const sizeConfig = sizes[size];
  const segmentCount = sizeConfig.segments;
  
  // Calcular segmentos llenos
  const filledSegments = Math.round((percentage / 100) * segmentCount);

  return (
    <div className="w-full">
      {/* Battery visualization */}
      <div className="flex items-center gap-2">
        {/* Battery body */}
        <div className={`flex-1 relative`}>
          {/* Battery container */}
          <div 
            className={`
              ${sizeConfig.height} w-full rounded-sm border-2 ${stockInfo.borderColor}
              flex gap-0.5 p-0.5 bg-gray-100 overflow-hidden
            `}
          >
            {/* Segments */}
            {Array.from({ length: segmentCount }).map((_, i) => (
              <div
                key={i}
                className={`
                  flex-1 rounded-sm transition-all duration-500
                  ${i < filledSegments ? stockInfo.bgColor : 'bg-gray-200'}
                  ${i < filledSegments ? 'animate-pulse' : ''}
                `}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s',
                }}
              />
            ))}
          </div>
          
          {/* Battery tip */}
          <div 
            className={`
              absolute -right-1 top-1/2 -translate-y-1/2
              w-1.5 ${sizeConfig.height} rounded-r-sm
              ${stockInfo.borderColor} border-2 border-l-0
            `}
          />
        </div>
        
        {/* Percentage */}
        <span className={`${sizeConfig.text} font-medium ${stockInfo.textColor} min-w-[3rem] text-right`}>
          {Math.round(percentage)}%
        </span>
      </div>
      
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${stockInfo.textColor} font-medium flex items-center gap-1`}>
            <span>{stockInfo.icon}</span>
            {stockInfo.label}
          </span>
          <span className="text-xs text-gray-500">
            {stock} {medication.stockUnit || medication.doseUnit}
          </span>
        </div>
      )}
    </div>
  );
}

// Mini versión para usar en tarjetas compactas
export function StockBatteryMini({ medication }: { medication: Medication }) {
  const stock = medication.stock ?? 0;
  const threshold = medication.lowStockThreshold ?? 5;
  const maxStock = Math.max(threshold * 4, stock, 20);
  const percentage = Math.min((stock / maxStock) * 100, 100);
  
  const getColor = () => {
    if (stock === 0 || stock <= 3 || percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center gap-1">
      {/* Mini battery */}
      <div className="w-12 h-3 rounded-sm border border-gray-300 flex gap-px p-px bg-gray-50">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${percentage > (i + 1) * 25 ? getColor() : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{stock}</span>
    </div>
  );
}

export default StockBattery;
