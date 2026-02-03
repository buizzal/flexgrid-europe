'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import europeanData from '@/data/european-data.json';
import { EuropeanData, CountryData } from '@/types';
import CountryPanel from '@/components/CountryPanel';
import FlexibilityCalculator from '@/components/FlexibilityCalculator';

// Dynamic import for map to avoid SSR issues
const EuropeMap = dynamic(() => import('@/components/EuropeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
      <div className="text-slate-400">Loading map...</div>
    </div>
  )
});

const data = europeanData as EuropeanData;

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const selectedCountryData: CountryData | null = selectedCountry ? data[selectedCountry] : null;

  // Calculate summary stats
  const countries = Object.values(data);
  const avgPrice = countries.reduce((sum, c) => sum + c.priceStats.avg, 0) / countries.length;
  const totalRecords = countries.reduce((sum, c) => sum + c.recordCount, 0);
  const highestFlex = countries.reduce((max, c) =>
    c.flexibility.spreadEurPerMWh > max.flexibility.spreadEurPerMWh ? c : max
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                FlexGrid Europe
              </h1>
              <p className="text-sm text-slate-400">
                European Electricity Flexibility Dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{countries.length}</div>
                  <div className="text-xs text-slate-500">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{(totalRecords / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-slate-500">Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">€{avgPrice.toFixed(0)}</div>
                  <div className="text-xs text-slate-500">Avg Price/MWh</div>
                </div>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="h-[500px] lg:h-[600px]">
              <EuropeMap
                data={data}
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h2 className="text-lg font-semibold mb-3">🏆 Highest Flexibility Value</h2>
              <div
                className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition"
                onClick={() => setSelectedCountry(highestFlex.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{highestFlex.name}</span>
                  <span className="text-green-400 font-bold">€{highestFlex.flexibility.spreadEurPerMWh}/MWh</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Peak-to-offpeak spread represents potential savings from demand shifting
                </div>
              </div>
            </div>

            {/* Country List */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h2 className="text-lg font-semibold mb-3">Select Country</h2>
              <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
                {countries
                  .sort((a, b) => b.flexibility.spreadEurPerMWh - a.flexibility.spreadEurPerMWh)
                  .map((country) => (
                    <button
                      key={country.name}
                      onClick={() => setSelectedCountry(country.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                        selectedCountry === country.name
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {country.name}
                        {country.hasDetailedCarbon && (
                          <span className="text-[10px] bg-green-600 px-1.5 py-0.5 rounded">CO₂</span>
                        )}
                      </span>
                      <span className={`text-sm ${selectedCountry === country.name ? 'text-white' : 'text-green-400'}`}>
                        €{country.flexibility.spreadEurPerMWh}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Calculator Toggle */}
            {selectedCountryData && (
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                {showCalculator ? 'Hide Calculator' : 'Open Flexibility Calculator'}
              </button>
            )}
          </div>
        </div>

        {/* Calculator Section */}
        {showCalculator && selectedCountryData && (
          <div className="mt-4">
            <FlexibilityCalculator country={selectedCountryData} />
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-lg mb-2">Price Analysis</h3>
            <p className="text-sm text-slate-400">
              Explore wholesale electricity prices across 31 European countries with hourly data from 2015-2026.
            </p>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-semibold text-lg mb-2">Flexibility Value</h3>
            <p className="text-sm text-slate-400">
              Calculate the economic and carbon value of shifting electricity demand from peak to off-peak hours.
            </p>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl mb-2">🇬🇧</div>
            <h3 className="font-semibold text-lg mb-2">UK Carbon Deep-Dive</h3>
            <p className="text-sm text-slate-400">
              Enhanced analysis for the UK with 17 years of half-hourly carbon intensity and generation mix data.
            </p>
          </div>
        </div>

        {/* Methodology */}
        <div className="mt-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">📖 Methodology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h4 className="font-medium text-white mb-2">Economic Flexibility Value</h4>
              <p className="text-slate-400">
                Calculated as the difference between average peak-hour prices (08:00-20:00) and off-peak prices.
                This represents the potential savings from shifting 1 MWh of demand from peak to off-peak periods.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Carbon Flexibility Value</h4>
              <p className="text-slate-400">
                For the UK, we use actual half-hourly carbon intensity data to calculate precise emissions savings.
                For other countries, estimates are based on European grid averages (~35 gCO₂/kWh differential).
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
            <strong>Data Sources:</strong> European wholesale prices from Ember Energy (CC-BY-4.0).
            UK carbon intensity and generation mix from National Grid ESO.
          </div>
        </div>
      </div>

      {/* Country Panel (slide-in) */}
      {selectedCountryData && (
        <CountryPanel
          country={selectedCountryData}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800 py-6">
        <div className="max-w-[1800px] mx-auto px-4 text-center text-sm text-slate-500">
          <p>FlexGrid Europe — Open Source European Electricity Flexibility Dashboard</p>
          <p className="mt-1">
            Data: Ember Energy (prices) • National Grid ESO (UK carbon) • Built with Next.js & React
          </p>
        </div>
      </footer>
    </main>
  );
}
