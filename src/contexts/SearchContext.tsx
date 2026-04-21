'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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
  const [results, setResults] = useState<SearchResult[]>([]); // Artık API'den gelen veriyi tutacak
  const [isSearching, setIsSearching] = useState(false); // Yüklenme durumu

  const pathname = usePathname();
  const router = useRouter();

  const pageConfig = useMemo(() => {
    if (pathname.startsWith('/sirketler/')) return pageSearchConfigs['/sirketler'];
    return pageSearchConfigs[pathname] || pageSearchConfigs['/'];
  }, [pathname]);

  // Arama mantığı (Debounce işlemi eklendi)
  useEffect(() => {
    // 2 karakterden az yazıldıysa arama yapma
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Kullanıcı yazmayı bitirdikten 300ms sonra API isteği at
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Kendi projenin API yapısına göre bu adresi güncelle
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Arama yapılırken hata oluştu:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer); // Yeni harf girilirse önceki sayacı iptal et
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
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
        isSearching,
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