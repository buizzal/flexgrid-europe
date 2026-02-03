'use client';

import React from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CountryData } from '@/types';

interface CountryPanelProps {
  country: CountryData;
  onClose: () => void;
}

const COLORS = {
  gas: '#f97316',
  coal: '#4b5563',
  nuclear: '#a855f7',
  wind: '#22c55e',
  solar: '#eab308',
  hydro: '#3b82f6',
  biomass: '#84cc16',
  imports: '#06b6d4',
  other: '#9ca3af'
};

export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  // Prepare hourly profile data
  const hourlyData = country.flexibility.hourlyProfile.map((price, hour) => ({
    hour: `${hour}:00`,
    price,
    label: hour
  }));

  // Prepare yearly trend data
  const yearlyData = Object.entries(country.yearlyAverage)
    .map(([year, avg]) => ({ year, price: avg }))
    .sort((a, b) => a.year.localeCompare(b.year));

  // Generation mix (UK only)
  const genMixData = country.carbonData?.generationMix
    ? Object.entries(country.carbonData.generationMix)
        .filter(([_, value]) => value > 0.5)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: COLORS[name as keyof typeof COLORS] || '#9ca3af'
        }))
    : null;

  // Carbon trend data (all countries with carbon data)
  const carbonTrendData = country.carbonData?.yearlyTrend
    ? Object.entries(country.carbonData.yearlyTrend)
        .map(([year, intensity]) => ({ year, intensity }))
        .sort((a, b) => a.year.localeCompare(b.year))
    : null;

  // Hourly carbon profile (UK only - has half-hourly data)
  const carbonHourlyData = country.carbonData?.hourlyProfile
    ? country.carbonData.hourlyProfile.map((intensity, hour) => ({
        hour: `${hour}:00`,
        intensity,
        label: hour
      }))
    : null;

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-slate-900 border-l border-slate-700 overflow-y-auto z-40 shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 flex-wrap">
            {country.name}
            {country.hasCarbonData && (
              <span className={`text-xs px-2 py-1 rounded ${country.hasDetailedCarbon ? 'bg-green-600' : 'bg-emerald-700'}`}>
                {country.hasDetailedCarbon ? '🇬🇧 Detailed Carbon' : '🌱 Carbon Data'}
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">{country.recordCount.toLocaleString()} hourly price records</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Price Statistics */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Price Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">€{country.priceStats.avg}</div>
              <div className="text-xs text-slate-400">Avg Price/MWh</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">€{country.priceStats.min}</div>
              <div className="text-xs text-slate-400">Min Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">€{country.priceStats.max}</div>
              <div className="text-xs text-slate-400">Max Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">€{country.priceStats.stdDev}</div>
              <div className="text-xs text-slate-400">Volatility (σ)</div>
            </div>
          </div>
        </div>

        {/* Flexibility Value */}
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Flexibility Value</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">€{country.flexibility.peakAvg}</div>
              <div className="text-xs text-slate-400">Peak Avg (8-20h)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">€{country.flexibility.offPeakAvg}</div>
              <div className="text-xs text-slate-400">Off-Peak Avg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">€{country.flexibility.spreadEurPerMWh}</div>
              <div className="text-xs text-slate-400">Spread/MWh</div>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            Shifting 1 GWh from peak to off-peak saves approximately <span className="text-green-400 font-bold">€{(country.flexibility.spreadEurPerMWh * 1000).toLocaleString()}</span>
          </p>
        </div>

        {/* Hourly Price Profile */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Hourly Price Profile (Average)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="label"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v % 4 === 0 ? `${v}h` : ''}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => `${label}:00`}
                />
                <Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="url(#priceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Price Trend */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Yearly Average Price Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Avg Price']}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carbon Data Section - For ALL countries with carbon data */}
        {country.hasCarbonData && country.carbonData && (
          <>
            {/* Carbon Intensity Stats */}
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-4 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-1">🌱 Carbon Intensity</h3>
              <p className="text-xs text-slate-400 mb-3">
                Source: {country.carbonData.dataSource} ({country.carbonData.dateRange.start} - {country.carbonData.dateRange.end})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{country.carbonData.carbonStats.current}</div>
                  <div className="text-xs text-slate-400">Recent (gCO₂/kWh)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{country.carbonData.carbonStats.avg}</div>
                  <div className="text-xs text-slate-400">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{country.carbonData.carbonStats.min}</div>
                  <div className="text-xs text-slate-400">Min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{country.carbonData.carbonStats.max}</div>
                  <div className="text-xs text-slate-400">Max</div>
                </div>
              </div>
            </div>

            {/* Carbon Shift Savings */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-1">Carbon Savings by Shift Duration</h3>
              <p className="text-xs text-slate-400 mb-3">
                {country.hasDetailedCarbon ? 'Based on actual hourly carbon data' : 'Estimated from daily carbon variability'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(country.carbonData.shiftSavings).map(([hours, saving]) => (
                  <div key={hours} className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">{hours}h shift</div>
                    <div className="text-lg font-bold text-green-400">{saving}</div>
                    <div className="text-xs text-slate-500">gCO₂/kWh</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Carbon Profile - UK only (has detailed hourly data) */}
            {carbonHourlyData && (
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Hourly Carbon Intensity Profile</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={carbonHourlyData}>
                      <defs>
                        <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="label"
                        stroke="#9ca3af"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => v % 4 === 0 ? `${v}h` : ''}
                      />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value) => [`${value} gCO₂/kWh`, 'Carbon Intensity']}
                        labelFormatter={(label) => `${label}:00`}
                      />
                      <Area type="monotone" dataKey="intensity" stroke="#22c55e" fill="url(#carbonGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Generation Mix - UK only */}
            {genMixData && (
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Current Generation Mix</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genMixData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={{ stroke: '#9ca3af' }}
                      >
                        {genMixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Carbon Trend - All countries with carbon data */}
            {carbonTrendData && (
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Carbon Intensity Trend (Yearly)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={carbonTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value) => [`${value} gCO₂/kWh`, 'Carbon Intensity']}
                      />
                      <Line type="monotone" dataKey="intensity" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
