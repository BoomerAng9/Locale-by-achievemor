/**
 * Voice Finance Dashboard - Sockeye Financial Theme
 * Minimal "nothing brand" aesthetic with DotGothic16 font
 * 
 * Features:
 * - Voice assistant with waveform visualization
 * - Balance display
 * - Transaction list
 * - Pay Now action
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useMicrophone } from '../../lib/hooks/useMicrophone';

interface VoiceFinanceDashboardProps {
  balance?: number;
  userName?: string;
}

const VoiceFinanceDashboard: React.FC<VoiceFinanceDashboardProps> = ({
  balance = 12450.80,
  userName = 'User'
}) => {
  const { isRecording, waveformData, toggleRecording } = useMicrophone({});

  const transactions = [
    { name: 'Coffee Shop', amount: -4.50 },
    { name: 'Rent Payment', amount: -1200.00 },
    { name: 'Salary Deposit', amount: 4500.00 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-6">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header Card */}
        <div className="voice-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Fish Icon - Pure CSS */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-locale-blue to-locale-darkBlue flex items-center justify-center text-white text-lg shadow-glow">
                ⟨◊⟩
              </div>
              <div>
                <h1 className="font-dots text-sm text-locale-blue text-glow-cyan tracking-widest">LOCALE</h1>
                <p className="font-dots text-[9px] text-locale-blue/50 tracking-[0.2em]">VOICE ASSISTANT</p>
              </div>
            </div>
            
            {/* Mic Button - Inline SVG */}
            <button 
              onClick={toggleRecording}
              className={`mic-btn ${isRecording ? 'active' : ''}`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
              aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className={isRecording ? 'text-white' : 'text-locale-blue'}
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 19v4M8 23h8" />
              </svg>
            </button>
          </div>
          
          {/* Voice Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-locale-blue/5 border border-locale-blue/15">
            <span className={`status-dot ${isRecording ? 'bg-red-500' : 'bg-locale-blue'}`} />
            <span className="font-dots text-[10px] text-locale-lightBlue tracking-wider">
              VOICE {isRecording ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>

        {/* Waveform + Balance Card */}
        <div className="voice-card p-5">
          <div className="waveform-container mb-4">
            <div className="flex items-end justify-center gap-[2px] h-16">
              {waveformData.slice(0, 32).map((level, i) => (
                <motion.div
                  key={i}
                  className="waveform-bar w-1"
                  animate={{
                    height: `${Math.max(6, isRecording ? level * 0.7 : 15 + Math.sin(i * 0.4) * 8)}%`
                  }}
                  transition={{ duration: 0.1 }}
                  style={{ opacity: isRecording ? 1 : 0.35 }}
                />
              ))}
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="text-center">
            <p className="balance-display">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-500 text-[10px] font-dots tracking-widest mt-1">AVAILABLE</p>
          </div>
        </div>

        {/* Pay Button */}
        <button className="w-full btn-locale py-3 tracking-widest">
          PAY NOW
        </button>

        {/* Transactions Card */}
        <div className="voice-card overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <span className="font-dots text-[10px] text-gray-500 tracking-widest">RECENT</span>
          </div>
          {transactions.map((tx, i) => (
            <div key={i} className="transaction-row">
              <span className="text-gray-300">{tx.name}</span>
              <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Warning Bar */}
        <div className="warning-bar flex items-center gap-2">
          <span>⚠</span>
          <span>Unusual activity detected</span>
        </div>

      </div>
    </div>
  );
};

export default VoiceFinanceDashboard;
