'use client';

import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { CountryData, EuropeanData } from '@/types';

const geoUrl = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson';

// Map country names from TopoJSON to our data
const NAME_MAP: { [key: string]: string } = {
  'Czech Republic': 'Czechia',
  'Republic of Serbia': 'Serbia',
  'The former Yugoslav Republic of Macedonia': 'North Macedonia',
  'UK': 'United Kingdom',
  'Great Britain': 'United Kingdom'
};

interface EuropeMapProps {
  data: EuropeanData;
  selectedCountry: string | null;
  onCountrySelect: (country: string | null) => void;
}

export default function EuropeMap({ data, selectedCountry, onCountrySelect }: EuropeMapProps) {
  const [tooltipContent, setTooltipContent] = useState<CountryData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const countryNames = useMemo(() => Object.keys(data), [data]);

  const getCountryData = (geoName: string): CountryData | undefined => {
    const mappedName = NAME_MAP[geoName] || geoName;
    return data[mappedName];
  };

  const getColor = (geoName: string): string => {
    const countryData = getCountryData(geoName);
    if (!countryData) return '#e5e7eb'; // gray for no data

    // Color by price volatility (stdDev)
    const volatility = countryData.priceStats.stdDev;
    if (volatility > 100) return '#ef4444'; // red - high volatility
    if (volatility > 60) return '#f97316'; // orange
    if (volatility > 40) return '#eab308'; // yellow
    if (volatility > 25) return '#22c55e'; // green
    return '#3b82f6'; // blue - low volatility
  };

  const handleMouseEnter = (geo: any, evt: React.MouseEvent) => {
    const countryData = getCountryData(geo.properties.NAME);
    if (countryData) {
      setTooltipContent(countryData);
      setTooltipPos({ x: evt.clientX, y: evt.clientY });
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  const handleClick = (geo: any) => {
    const geoName = geo.properties.NAME;
    const mappedName = NAME_MAP[geoName] || geoName;
    if (data[mappedName]) {
      onCountrySelect(selectedCountry === mappedName ? null : mappedName);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-10, -52, 0],
          scale: 900
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup center={[10, 50]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.NAME;
                const mappedName = NAME_MAP[geoName] || geoName;
                const isSelected = selectedCountry === mappedName;
                const hasData = !!data[mappedName];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(geo)}
                    style={{
                      default: {
                        fill: isSelected ? '#8b5cf6' : getColor(geoName),
                        stroke: '#1e293b',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'default',
                        transition: 'fill 0.2s'
                      },
                      hover: {
                        fill: hasData ? '#a78bfa' : '#e5e7eb',
                        stroke: '#1e293b',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'default'
                      },
                      pressed: {
                        fill: '#7c3aed',
                        stroke: '#1e293b',
                        strokeWidth: 0.5,
                        outline: 'none'
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 bg-slate-800 text-white p-3 rounded-lg shadow-xl pointer-events-none border border-slate-600"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y + 10,
            maxWidth: '280px'
          }}
        >
          <div className="font-bold text-lg flex items-center gap-2">
            {tooltipContent.name}
            {tooltipContent.hasDetailedCarbon && (
              <span className="text-xs bg-green-600 px-2 py-0.5 rounded">Carbon Data</span>
            )}
          </div>
          <div className="text-sm text-slate-300 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Avg Price:</span>
            <span className="font-medium">€{tooltipContent.priceStats.avg}/MWh</span>
            <span>Volatility:</span>
            <span className="font-medium">€{tooltipContent.priceStats.stdDev}/MWh</span>
            <span>Flex Value:</span>
            <span className="font-medium text-green-400">€{tooltipContent.flexibility.spreadEurPerMWh}/MWh</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Click to view details</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 p-3 rounded-lg text-white text-sm">
        <div className="font-medium mb-2">Price Volatility (Std Dev)</div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-blue-500"></div>
            <span>&lt;€25/MWh (Low)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-green-500"></div>
            <span>€25-40/MWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-yellow-500"></div>
            <span>€40-60/MWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-orange-500"></div>
            <span>€60-100/MWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-red-500"></div>
            <span>&gt;€100/MWh (High)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
