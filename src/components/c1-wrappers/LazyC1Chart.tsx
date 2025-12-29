import React, { Suspense } from 'react';
import './c1-isolation.css';

// Lazy load the C1 component
// We use React.lazy for Vite/React applications
// This ensures the heavy C1 library and its potential conflicts are loaded only when needed
// and isolated from the main bundle's initial load.

// @ts-ignore - Assuming @thesys/c1-ui will be available or is a placeholder
const C1ChartComponent = React.lazy(() => 
  import('@thesys/c1-ui').then(module => ({ default: module.C1Chart }))
  .catch(() => ({ default: () => <div className="text-red-500 p-4">C1 Module Not Found (Mock)</div> }))
);

export default function LazyC1Chart(props: any) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded w-full"></div>}>
      <div className="c1-container">
        <C1ChartComponent {...props} />
      </div>
    </Suspense>
  );
}
