import { useState, useEffect } from 'react';
import { quotes } from '../data/quotes';
import { startOfDay } from 'date-fns';

export const useQuote = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Get today's date as a consistent number for the day
    const today = startOfDay(new Date()).getTime();
    
    // Use the date to generate a consistent index for each day
    const index = Math.floor(today / (1000 * 60 * 60 * 24)) % quotes.length;
    
    // Set today's quote
    setQuote(quotes[index]);
  }, []); // Empty dependency array means this runs once when component mounts

  return quote;
}; 