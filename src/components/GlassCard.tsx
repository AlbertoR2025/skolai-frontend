import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  compact = false 
}) => {
  const baseClasses = "bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl";
  const paddingClass = compact ? "p-4" : "p-6";
  
  return (
    <div className={`${baseClasses} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;