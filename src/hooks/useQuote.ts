import { quotes } from '../data/quotes';
import { startOfDay } from 'date-fns';

const getDailyQuote = (): string => {
  const today = startOfDay(new Date()).getTime();
  const index = Math.floor(today / (1000 * 60 * 60 * 24)) % quotes.length;
  return quotes[index];
};

export const useQuote = (): string => getDailyQuote();
