'use client';

import React, { useState, useMemo } from 'react';
import { CountryData } from '@/types';

interface FlexibilityCalculatorProps {
  country: CountryData;
}

const TREES_PER_TONNE_CO2 = 45; // Approximate trees needed to absorb 1 tonne CO2 per year
const CO2_SOCIAL_COST_EUR = 100; // Social cost of carbon in EUR per tonne

export default function FlexibilityCalculator({ country }: FlexibilityCalculatorProps) {
  const [demandGWh, setDemandGWh] = useState<number>(100);
  const [shiftHours, setShiftHours] = useState<number>(4);

  const results = useMemo(() => {
    // Economic savings calculation (based on price spread)
    const demandMWh = demandGWh * 1000;
    const priceSpread = country.flexibility.spreadEurPerMWh;
    const economicSavingsEur = demandMWh * priceSpread;

    // Carbon savings calculation - use actual data for ALL countries with carbon data
    let co2AvoidedTonnes: number | null = null;
    let carbonMethod: 'detailed' | 'measured' | 'estimated' = 'estimated';

    if (country.hasCarbonData && country.carbonData) {
      // Use actual carbon shift savings data (detailed for UK, daily-based for others)
      const shiftKey = shiftHours as keyof typeof country.carbonData.shiftSavings;
      const gCO2PerKWh = country.carbonData.shiftSavings[shiftKey] || 0;
      // Convert: demand (GWh) * gCO2/kWh savings * 1000 (GWh->MWh) * 1000 (MWh->kWh) / 1,000,000 (g->tonnes)
      co2AvoidedTonnes = (demandGWh * gCO2PerKWh * 1000 * 1000) / 1000000;
      carbonMethod = country.hasDetailedCarbon ? 'detailed' : 'measured';
    } else {
      // Fallback estimate based on European average: ~30-50 gCO2/kWh difference for shifting
      const estimatedGCO2PerKWh = 35 * (shiftHours / 4); // Scale with shift duration
      co2AvoidedTonnes = (demandGWh * estimatedGCO2PerKWh * 1000 * 1000) / 1000000;
      carbonMethod = 'estimated';
    }

    const treesEquivalent = co2AvoidedTonnes ? Math.round(co2AvoidedTonnes * TREES_PER_TONNE_CO2) : null;
    const socialValue = co2AvoidedTonnes ? co2AvoidedTonnes * CO2_SOCIAL_COST_EUR : null;

    return {
      economicSavingsEur,
      co2AvoidedTonnes,
      treesEquivalent,
      socialValue,
      carbonMethod,
      totalValue: economicSavingsEur + (socialValue || 0)
    };
  }, [country, demandGWh, shiftHours]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        ⚡ Flexibility Value Calculator
        {country.hasCarbonData && (
          <span className={`text-xs px-2 py-1 rounded ${country.hasDetailedCarbon ? 'bg-green-600' : 'bg-emerald-700'}`}>
            {country.hasDetailedCarbon ? 'Detailed Carbon Data' : 'Carbon Data'}
          </span>
        )}
      </h3>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Demand to Shift (GWh)</label>
          <input
            type="number"
            value={demandGWh}
            onChange={(e) => setDemandGWh(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition"
            min="0"
            step="10"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Shift Duration (Hours)</label>
          <div className="flex gap-2">
            {[1, 2, 4, 8].map((h) => (
              <button
                key={h}
                onClick={() => setShiftHours(h)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  shiftHours === h
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Economic Savings */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Economic Savings</div>
              <div className="text-xs text-slate-500">Based on peak/off-peak price spread</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                €{results.economicSavingsEur.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Carbon Savings */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 flex items-center gap-2">
                CO₂ Avoided
                {results.carbonMethod === 'detailed' && (
                  <span className="text-xs bg-green-600/50 text-green-300 px-1.5 py-0.5 rounded">Detailed</span>
                )}
                {results.carbonMethod === 'measured' && (
                  <span className="text-xs bg-emerald-600/50 text-emerald-300 px-1.5 py-0.5 rounded">Measured</span>
                )}
                {results.carbonMethod === 'estimated' && (
                  <span className="text-xs bg-yellow-600/50 text-yellow-300 px-1.5 py-0.5 rounded">Est.</span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {results.carbonMethod === 'detailed'
                  ? 'Based on half-hourly carbon intensity data'
                  : results.carbonMethod === 'measured'
                  ? 'Based on daily carbon intensity data'
                  : 'Based on European average estimates'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {results.co2AvoidedTonnes?.toLocaleString(undefined, { maximumFractionDigits: 0 })} tonnes
              </div>
            </div>
          </div>
        </div>

        {/* Equivalents */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-3xl mb-1">🌳</div>
            <div className="text-xl font-bold text-emerald-400">
              {results.treesEquivalent?.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Trees (annual absorption)</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-3xl mb-1">💰</div>
            <div className="text-xl font-bold text-amber-400">
              €{results.socialValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-400">Social Carbon Value</div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-300 font-medium">Total Flexibility Value</div>
              <div className="text-xs text-slate-400">Economic + Social Carbon Value</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                €{results.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology note */}
      <div className="mt-4 text-xs text-slate-500 leading-relaxed">
        <strong>Methodology:</strong> Economic savings calculated from historical peak/off-peak price spreads.
        Carbon savings {results.carbonMethod === 'detailed'
          ? 'use actual half-hourly carbon intensity data from the UK grid (National Grid ESO).'
          : results.carbonMethod === 'measured'
          ? 'use daily carbon intensity data from ECON-PowerCI (2015-2024).'
          : 'are estimated based on European grid averages (~35 gCO₂/kWh differential).'}
        {' '}Social carbon value uses €{CO2_SOCIAL_COST_EUR}/tonne.
      </div>
    </div>
  );
}
