import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '', size = 'md' }) => {
  const getStyles = () => {
    switch (level) {
      case 'VERY HIGH':
        return 'bg-rose-950/70 text-rose-300 border-rose-800/80';
      case 'HIGH':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/80';
      case 'MODERATE':
        return 'bg-amber-900/40 text-amber-200 border-amber-700/60';
      case 'LOW':
      default:
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3.5 py-1 text-sm font-semibold tracking-wide';
      case 'md':
      default:
        return 'px-2.5 py-0.5 text-xs font-medium tracking-wide';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-mono tabular-nums uppercase ${getStyles()} ${getSizeClasses()} ${className}`}
    >
      {level}
    </span>
  );
};
