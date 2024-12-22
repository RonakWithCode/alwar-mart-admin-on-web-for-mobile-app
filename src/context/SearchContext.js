'use client';
import { createContext } from 'react';

export const SearchContext = createContext({
  searchQuery: '',
  setSearchQuery: () => {},
}); 