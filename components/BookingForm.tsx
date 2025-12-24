
import React, { useState } from 'react';
import { Service } from '../types';

interface BookingFormProps {
  service: Service;
  professionalName: string;
  onCheckout: (details: { date: string; bookingType: 'local' | 'remote' }) => void;
  isLoading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ service, professionalName, onCheckout, isLoading = false }) => {
  const [bookingType, setBookingType] = useState<'local' | 'remote'>(service.type === 'local' ? 'local' : 'remote');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!date) {
      setError('Please select a requested date.');
      return;
    }
    setError('');
    onCheckout({ date, bookingType });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-2">Book Service</h3>
      <p className="text-gray-500 text-sm mb-6">You are booking <span className="font-semibold text-slate-800">{professionalName}</span></p>
      
      <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-gray-100">
        <h4 className="font-bold text-slate-800 mb-1">{service.title}</h4>
        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
        <div className="text-lg font-bold text-brand-600">
          ${service.price} <span className="text-xs text-gray-500 font-normal">/ {service.unit}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
            <div className="flex gap-3">
               <button 
                 onClick={() => setBookingType('local')}
                 disabled={service.type === 'remote'}
                 className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${bookingType === 'local' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} ${service.type === 'remote' ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                 In-Person (Local)
               </button>
               <button 
                 onClick={() => setBookingType('remote')}
                 disabled={service.type === 'local'}
                 className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${bookingType === 'remote' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} ${service.type === 'local' ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                 Remote
               </button>
            </div>
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requested Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              onChange={(e) => setDate(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
         </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-lg transition-colors shadow-md flex justify-center items-center"
        >
           {isLoading ? (
             <>
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Processing...
             </>
           ) : (
             'Confirm & Pay'
           )}
        </button>
        <p className="text-xs text-center text-gray-400">Secure payment via Stripe. Protected by Locale Satisfaction Guarantee.</p>
      </div>
    </div>
  );
};

export default BookingForm;
