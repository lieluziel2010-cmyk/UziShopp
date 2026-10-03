import React, { useState } from 'react';
import { Search as SearchIcon, X, ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from './ItemCard';
import { CATEGORIES } from '../data/initialData';
import { Category } from '../types';

export const SearchView: React.FC = () => {
  const { items, dir, t } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'הכל'>('הכל');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Filter items based on user search parameters
  const filteredItems = items.filter(item => {
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    if (selectedCategory !== 'הכל' && item.category !== selectedCategory) {
      return false;
    }

    if (maxPrice !== null && item.price > maxPrice) {
      return false;
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return b.createdAt - a.createdAt;
  });

  const getCategoryPastelClass = (cat: Category | 'הכל', isSelected: boolean) => {
    if (isSelected) {
      return 'bg-purple-600 text-white shadow-xs border-transparent font-bold';
    }

    switch (cat) {
      case 'ביגוד':
        return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/70';
      case 'הנעלה':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70';
      case 'אקססוריז':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70';
      case 'גיימינג':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70';
      case 'אלקטרוניקה':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70';
      case 'חדר ועיצוב':
        return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/70';
      case 'אחר':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70';
      default:
        return 'bg-white text-slate-700 border-purple-100 hover:bg-purple-50/50';
    }
  };

  return (
    <div dir={dir} className="space-y-4 pb-20 text-start">
      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder={t.search.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3.5 ps-11 pe-10 bg-white border border-purple-100/80 rounded-full text-sm focus:outline-hidden focus:border-purple-600 shadow-2xs"
        />
        <SearchIcon className="w-5 h-5 text-purple-400 absolute start-4 top-3.5" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 absolute end-3.5 top-3.5 flex items-center justify-center hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
            aria-label="נקה חיפוש"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 mb-1.5">{t.search.categoryLabel}</p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('הכל')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border cursor-pointer ${getCategoryPastelClass('הכל', selectedCategory === 'הכל')}`}
          >
            {t.categories.all}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border cursor-pointer ${getCategoryPastelClass(cat, selectedCategory === cat)}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price & Sort Quick Filters */}
      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium">{t.search.priceLabel}</span>
          <button
            onClick={() => setMaxPrice(maxPrice === 100 ? null : 100)}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
              maxPrice === 100 ? 'bg-purple-600 border-purple-600 text-white font-bold' : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50/50'
            }`}
          >
            {t.search.under100}
          </button>
          <button
            onClick={() => setMaxPrice(maxPrice === 200 ? null : 200)}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
              maxPrice === 200 ? 'bg-purple-600 border-purple-600 text-white font-bold' : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50/50'
            }`}
          >
            {t.search.under200}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-purple-100 rounded-full px-3 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-purple-600"
          >
            <option value="newest">{t.search.sortNewest}</option>
            <option value="price_asc">{t.search.sortPriceAsc}</option>
            <option value="price_desc">{t.search.sortPriceDesc}</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-slate-600 tabular-nums">
          {t.search.foundCount.replace('{count}', String(sortedItems.length))}
        </span>
        {(query || selectedCategory !== 'הכל' || maxPrice !== null) && (
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('הכל');
              setMaxPrice(null);
            }}
            className="text-xs text-purple-600 hover:underline font-bold cursor-pointer"
          >
            {t.search.clearFilters}
          </button>
        )}
      </div>

      {/* Results Grid */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {sortedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-purple-100 text-center my-6 space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t.search.emptyTitle}</h3>
          <p className="text-xs text-slate-500">
            {t.search.emptyDesc}
          </p>
        </div>
      )}
    </div>
  );
};
