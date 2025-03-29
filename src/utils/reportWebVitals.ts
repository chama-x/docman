import { type ReportHandler, onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals(onPerfEntry?: ReportHandler): void {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Measure Core Web Vitals
    onCLS(onPerfEntry); // Cumulative Layout Shift
    onFID(onPerfEntry); // First Input Delay
    onLCP(onPerfEntry); // Largest Contentful Paint
    
    // Measure other web vitals
    onFCP(onPerfEntry); // First Contentful Paint
    onTTFB(onPerfEntry); // Time to First Byte
  }
} 