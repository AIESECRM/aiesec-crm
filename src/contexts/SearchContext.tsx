'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface SearchResult {
  id: string;
  type: 'company' | 'contact' | 'deal' | 'activity';
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
}

interface PageSearchConfig {
  placeholder: string;
}

const pageSearchConfigs: Record<string, PageSearchConfig> = {
  '/': { placeholder: 'Şirket, kişi veya teklif aratın...' },
  '/sirketler': { placeholder: 'Şirket adı aratın...' },
  '/kisiler': { placeholder: 'Kişi adı veya email aratın...' },
  '/teklifler': { placeholder: 'Teklif başlığı aratın...' },
  '/aktiviteler': { placeholder: 'Şirket veya aktivite türü aratın...' },
};

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  placeholder: string;
  clearSearch: () => void;
  navigateToResult: (result: SearchResult) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const pageConfig = useMemo(() => {
    if (pathname.startsWith('/sirketler/')) return pageSearchConfigs['/sirketler'];
    return pageSearchConfigs[pathname] || pageSearchConfigs['/'];
  }, [pathname]);

  // Arama sonuçları artık API'den geliyor, context sadece query tutuyor
  const results: SearchResult[] = [];

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const navigateToResult = useCallback((result: SearchResult) => {
    router.push(result.href);
    clearSearch();
  }, [router, clearSearch]);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        isSearching: false,
        placeholder: pageConfig.placeholder,
        clearSearch,
        navigateToResult,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}