import { useState, useEffect } from 'react';
import { quotes } from '../data/quotes';

export const useQuote = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Get today's date as string to use as seed
    const today = new Date().toDateString();
    
    // Use date string to generate consistent index for the day
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Get quote using modulo to wrap around array length
    setQuote(quotes[index % quotes.length]);
  }, []);

  return quote;
}; 