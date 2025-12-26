import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IndustryTemplate } from '../types';

interface ConsultationContextType {
  mode: 'standard' | 'consultation';
  activeIndustry: IndustryTemplate | null;
  setMode: (mode: 'standard' | 'consultation') => void;
  setActiveIndustry: (industry: IndustryTemplate | null) => void;
  toggleConsultation: () => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'standard' | 'consultation'>('standard');
  const [activeIndustry, setActiveIndustry] = useState<IndustryTemplate | null>(null);

  const toggleConsultation = () => {
    setMode(prev => prev === 'standard' ? 'consultation' : 'standard');
  };

  return (
    <ConsultationContext.Provider value={{ 
      mode, 
      activeIndustry, 
      setMode, 
      setActiveIndustry,
      toggleConsultation 
    }}>
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
