'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { API_BASE_URL } from '../api-config';

const LIMIT = 20;

export default function Home() {
  const [cuisine, setCuisine] = useState('');
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    setState({ status: 'loading', data: null, error: null });
    const params = new URLSearchParams({ limit: LIMIT, offset, ...(cuisine && { cuisine }) });
    fetch(`${API_BASE_URL}/api/v1/restaurants?${params}`)
      .then(res => {
        if (res.status === 429) {
          throw new Error('Too many requests, please wait a moment');
        }
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then(json => {
        const results = json?.data ?? [];
        setState({ status: results.length === 0 ? 'empty' : 'success', data: json, error: null });
      })
      .catch(err => setState({ status: 'error', data: null, error: err.message }));
  }, [cuisine, offset]);

  const hasMore = state.data?.meta?.hasMore ?? false;
  const canGoBack = offset > 0;

  const handleCuisineChange = (e) => {
    setCuisine(e.target.value);
    setOffset(0);
  };

  const handlePrevPage = () => {
    setOffset(prev => Math.max(0, prev - LIMIT));
  };

  const handleNextPage = () => {
    setOffset(prev => prev + LIMIT);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Image
          src="/logo.png"
          alt="Daily Meal logo"
          width={320}
          height={142}
          priority
          style={{ height: 'auto' }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="cuisine-filter" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
          Filter by cuisine:
        </label>
        <input
          id="cuisine-filter"
          type="text"
          value={cuisine}
          onChange={handleCuisineChange}
          placeholder="e.g. Italian, Chinese, Indian..."
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '10px 14px',
            fontSize: '1rem',
            border: '2px solid #00A19B',
            borderRadius: 6,
            backgroundColor: 'transparent',
            outline: 'none',
          }}
        />
      </div>

      {state.status === 'loading' && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#00A19B', fontSize: '1.1rem' }}>
          Loading restaurants...
        </div>
      )}

      {state.status === 'empty' && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#00A19B', fontSize: '1.1rem', opacity: 0.6 }}>
          No results found
        </div>
      )}

      {state.status === 'error' && (
        <div style={{
          padding: '20px',
          border: '2px solid #00A19B',
          borderRadius: 6,
        }}>
          <strong>Error:</strong> {state.error}
        </div>
      )}

      {state.status === 'success' && state.data?.data && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {state.data.data.map((restaurant) => (
            <li
              key={restaurant.id}
              style={{
                padding: '16px 20px',
                marginBottom: 12,
                borderRadius: 6,
                borderLeft: '4px solid #00A19B',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>
                {restaurant.name}
              </div>
              {restaurant.cuisine && (
                <div style={{ fontSize: '0.9rem', color: '#00A19B' }}>{restaurant.cuisine}</div>
              )}
              {restaurant.address && (
                <div style={{ fontSize: '0.85rem', color: '#00A19B', opacity: 0.6, marginTop: 4 }}>{restaurant.address}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {state.status === 'success' && (
        <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={handlePrevPage}
            disabled={!canGoBack}
            style={{
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#00A19B',
              color: '#E4DDD3',
              borderRadius: 6,
              opacity: canGoBack ? 1 : 0.6,
              cursor: canGoBack ? 'pointer' : 'not-allowed',
            }}
          >
            Previous page
          </button>
          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            style={{
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#00A19B',
              color: '#E4DDD3',
              borderRadius: 6,
              opacity: hasMore ? 1 : 0.6,
              cursor: hasMore ? 'pointer' : 'not-allowed',
            }}
          >
            Next page
          </button>
        </div>
      )}
    </div>
  );
}
