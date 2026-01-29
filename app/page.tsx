'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';

const COUNTRY_DATA: Record<string, { population: number; region: string; code: string; name: string }> = {
  'United States of America': { population: 331000000, region: 'NA', code: 'US', name: 'USA' },
  'China': { population: 1412000000, region: 'AS', code: 'CN', name: 'China' },
  'India': { population: 1380000000, region: 'AS', code: 'IN', name: 'India' },
  'Indonesia': { population: 273500000, region: 'AS', code: 'ID', name: 'Indonesia' },
  'Pakistan': { population: 220900000, region: 'AS', code: 'PK', name: 'Pakistan' },
  'Brazil': { population: 212600000, region: 'SA', code: 'BR', name: 'Brazil' },
  'Nigeria': { population: 206100000, region: 'AF', code: 'NG', name: 'Nigeria' },
  'Bangladesh': { population: 164700000, region: 'AS', code: 'BD', name: 'Bangladesh' },
  'Russia': { population: 145900000, region: 'EU', code: 'RU', name: 'Russia' },
  'Mexico': { population: 128900000, region: 'NA', code: 'MX', name: 'Mexico' },
  'Japan': { population: 126500000, region: 'AS', code: 'JP', name: 'Japan' },
  'Ethiopia': { population: 115000000, region: 'AF', code: 'ET', name: 'Ethiopia' },
  'Philippines': { population: 109600000, region: 'AS', code: 'PH', name: 'Philippines' },
  'Egypt': { population: 102300000, region: 'AF', code: 'EG', name: 'Egypt' },
  'Vietnam': { population: 97300000, region: 'AS', code: 'VN', name: 'Vietnam' },
  'Germany': { population: 83780000, region: 'EU', code: 'DE', name: 'Germany' },
  'Turkey': { population: 84330000, region: 'EU', code: 'TR', name: 'Turkey' },
  'Iran': { population: 83990000, region: 'AS', code: 'IR', name: 'Iran' },
  'United Kingdom': { population: 67880000, region: 'EU', code: 'GB', name: 'UK' },
  'France': { population: 65270000, region: 'EU', code: 'FR', name: 'France' },
  'Italy': { population: 60460000, region: 'EU', code: 'IT', name: 'Italy' },
  'South Africa': { population: 59310000, region: 'AF', code: 'ZA', name: 'South Africa' },
  'South Korea': { population: 51780000, region: 'AS', code: 'KR', name: 'South Korea' },
  'Spain': { population: 47350000, region: 'EU', code: 'ES', name: 'Spain' },
  'Argentina': { population: 45380000, region: 'SA', code: 'AR', name: 'Argentina' },
  'Canada': { population: 38000000, region: 'NA', code: 'CA', name: 'Canada' },
  'Australia': { population: 25690000, region: 'OC', code: 'AU', name: 'Australia' },
};

const TARGET = 1000000000;

interface Selection {
  country: string;
  amount: number;
}

interface UserSubmission {
  selections: Selection[];
  timestamp: number;
}

export default function Home() {
  const [step, setStep] = useState<'selection' | 'confirm' | 'stats'>('selection');
  const [selections, setSelections] = useState<Selection[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [allSubmissions, setAllSubmissions] = useState<UserSubmission[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('billionPeopleSubmissions');
    if (stored) {
      setAllSubmissions(JSON.parse(stored));
    }
    const submitted = localStorage.getItem('billionPeopleHasSubmitted');
    if (submitted) {
      setHasSubmitted(true);
    }
  }, []);

  const totalSelected = selections.reduce((sum, s) => sum + s.amount, 0);
  const progress = Math.min((totalSelected / TARGET) * 100, 100);

  const handleCountryClick = (countryName: string) => {
    if (hasSubmitted) return;
    setSelectedCountry(countryName);
    setInputAmount('');
  };

  const addSelection = () => {
    if (!selectedCountry || !inputAmount) return;
    
    const amount = parseInt(inputAmount) * 1000000;
    const countryData = COUNTRY_DATA[selectedCountry as keyof typeof COUNTRY_DATA];
    
    if (!countryData) return;
    
    const alreadySelected = selections
      .filter(s => s.country === selectedCountry)
      .reduce((sum, s) => sum + s.amount, 0);
    
    const remaining = countryData.population - alreadySelected;
    
    if (amount > remaining) {
      alert(`Can only select ${((remaining)/1000000).toFixed(0)}M more from ${selectedCountry}`);
      return;
    }

    setSelections([...selections, { country: selectedCountry, amount }]);
    setInputAmount('');
    setSelectedCountry(null);
  };

  const removeSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  // Calculate global statistics
  const countryTotals = allSubmissions.flatMap(s => s.selections).reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || { amount: 0, count: 0 });
    acc[s.country].amount += s.amount;
    acc[s.country].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  const statsData = Object.entries(countryTotals)
    .map(([country, data]) => ({
      country: COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.name || country,
      totalSelected: data.amount / 1000000,
      selectionCount: data.count,
      population: (COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.population || 0) / 1000000,
      avgPerUser: data.amount / data.count / 1000000,
    }))
    .sort((a, b) => b.totalSelected - a.totalSelected)
    .slice(0, 15);

  const regionData = Object.entries(countryTotals).reduce((acc, [country, data]) => {
    const region = COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.region || 'Other';
    acc[region] = (acc[region] || 0) + data.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(regionData).map(([region, amount]) => ({
    name: region,
    value: amount / 1000000,
  }));

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  const handleSubmit = () => {
    if (totalSelected !== TARGET) {
      alert(`Must select exactly 1 billion! Currently: ${(totalSelected/1000000000).toFixed(2)}B`);
      return;
    }
    setStep('confirm');
  };

  const confirmSubmission = () => {
    const submission: UserSubmission = {
      selections,
      timestamp: Date.now()
    };
    const updated = [...allSubmissions, submission];
    setAllSubmissions(updated);
    localStorage.setItem('billionPeopleSubmissions', JSON.stringify(updated));
    localStorage.setItem('billionPeopleHasSubmitted', 'true');
    setHasSubmitted(true);
    setStep('stats');
  };

  const reset = () => {
    localStorage.removeItem('billionPeopleHasSubmitted');
    setHasSubmitted(false);
    setStep('selection');
    setSelections([]);
    setShowStats(false);
  };

  if (step === 'stats' || showStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        {/* Header */}
        <div className="border-b-4 border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-7xl font-black text-center tracking-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              <span className="text-red-600">THE BILLION</span>
              <span className="text-blue-600"> PEOPLE</span>
            </h1>
            <p className="text-center text-2xl mt-4 font-bold text-gray-700">
              Global Statistics • {allSubmissions.length} {allSubmissions.length === 1 ? 'Person' : 'People'} Have Played
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Players</div>
              <div className="text-6xl font-black mt-2">{allSubmissions.length}</div>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">People Selected</div>
              <div className="text-6xl font-black mt-2">{(allSubmissions.length * 1000).toLocaleString()}M</div>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Countries</div>
              <div className="text-6xl font-black mt-2">{Object.keys(countryTotals).length}</div>
            </div>
          </div>

          {/* Top Countries Chart */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
            <h2 className="text-4xl font-black mb-6">🌍 Most Selected Countries</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} tick={{ fill: '#000' }} />
                <YAxis tick={{ fill: '#000' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ backgroundColor: '#000', border: '3px solid #000', borderRadius: '0', fontWeight: 'bold' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="totalSelected" fill="#FF6B6B" name="Total Selected (Millions)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="selectionCount" fill="#4ECDC4" name="Times Selected" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
            <h2 className="text-4xl font-black mb-6">📊 Country Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-4 border-black">
                    <th className="text-left p-4 font-black text-xl">Country</th>
                    <th className="text-right p-4 font-black text-xl">Total Selected</th>
                    <th className="text-right p-4 font-black text-xl">Selections</th>
                    <th className="text-right p-4 font-black text-xl">Avg/Person</th>
                    <th className="text-right p-4 font-black text-xl">% of Pop</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.map((stat, i) => (
                    <tr key={i} className="border-b-2 border-gray-200 hover:bg-yellow-50">
                      <td className="p-4 font-bold text-lg">{stat.country}</td>
                      <td className="text-right p-4 font-mono text-lg">{stat.totalSelected.toFixed(0)}M</td>
                      <td className="text-right p-4 font-mono text-lg">{stat.selectionCount}</td>
                      <td className="text-right p-4 font-mono text-lg">{stat.avgPerUser.toFixed(1)}M</td>
                      <td className="text-right p-4 font-mono text-lg">{((stat.totalSelected / stat.population) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
              <h2 className="text-4xl font-black mb-6">🗺️ Regional Distribution</h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '3px solid #000', borderRadius: '0' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-blue-600 border-4 border-black p-8 shadow-[8px_8px_0_0_#000] text-white">
              <h2 className="text-4xl font-black mb-6">🏆 Top Picks</h2>
              <div className="space-y-4">
                {statsData.slice(0, 5).map((stat, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur border-3 border-white p-4">
                    <div className="text-3xl font-black">#{i + 1} {stat.country}</div>
                    <div className="text-xl mt-2">{stat.totalSelected.toFixed(0)}M total • {stat.selectionCount} selections</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowStats(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl px-12 py-6 border-4 border-black shadow-[6px_6px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000]"
            >
              ← Back to Game
            </button>
            {!hasSubmitted && (
              <button
                onClick={reset}
                className="bg-green-600 hover:bg-green-700 text-white font-black text-xl px-12 py-6 border-4 border-black shadow-[6px_6px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000]"
              >
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white border-4 border-black p-12 shadow-[12px_12px_0_0_#000]">
          <h1 className="text-6xl font-black text-center mb-8" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            <span className="text-red-600">CONFIRM</span> YOUR SELECTION
          </h1>
          
          <div className="mb-8">
            <div className="text-4xl font-black text-center mb-6">You've chosen 1 BILLION people:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selections.map((s, i) => (
                <div key={i} className="bg-yellow-100 border-3 border-black p-4 shadow-[4px_4px_0_0_#000]">
                  <div className="font-bold text-xl">{s.country}</div>
                  <div className="text-3xl font-black text-red-600">{(s.amount / 1000000).toFixed(0)}M</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep('selection')}
              className="bg-gray-200 hover:bg-gray-300 text-black font-black text-xl px-12 py-6 border-4 border-black shadow-[6px_6px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000]"
            >
              ← Go Back
            </button>
            <button
              onClick={confirmSubmission}
              className="bg-green-500 hover:bg-green-600 text-white font-black text-xl px-12 py-6 border-4 border-black shadow-[6px_6px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000]"
            >
              CONFIRM & SEE STATS →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              <span className="text-red-600">THE BILLION</span>
              <span className="text-blue-600"> PEOPLE</span>
            </h1>
            <button
              onClick={() => setShowStats(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-lg px-8 py-4 border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000] transition-all"
            >
              📊 Global Stats
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Progress */}
        <div className="mb-12">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-black">
                <span className="text-red-600">{(totalSelected / 1000000000).toFixed(2)}</span> / 1.00 BILLION
              </div>
              <div className="text-4xl font-black">{progress.toFixed(0)}%</div>
            </div>
            <div className="h-12 bg-gray-200 border-3 border-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500 flex items-center justify-center font-black text-xl text-white"
                style={{ width: `${progress}%` }}
              >
                {progress >= 100 ? '✓ COMPLETE!' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Map */}
          <div className="lg:col-span-2 bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
            <h2 className="text-3xl font-black mb-6">🌍 Click countries to select population</h2>
            <ComposableMap
              projectionConfig={{ scale: 160, center: [0, 20] }}
              className="w-full"
            >
              <Geographies geography="/features.json">
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name || '';
                    const isSelected = selections.some(s => s.country === countryName);
                    const selectionCount = countryTotals[countryName]?.count || 0;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          const data = COUNTRY_DATA[countryName as keyof typeof COUNTRY_DATA];
                          if (data && !hasSubmitted) handleCountryClick(countryName);
                        }}
                        style={{
                          default: {
                            fill: selectionCount > 0 ? '#FFE66D' : isSelected ? '#FF6B6B' : '#E0E0E0',
                            stroke: '#000',
                            strokeWidth: 0.5,
                            outline: 'none',
                          },
                          hover: {
                            fill: hasSubmitted ? '#E0E0E0' : '#4ECDC4',
                            stroke: '#000',
                            strokeWidth: 1,
                            outline: 'none',
                            cursor: hasSubmitted ? 'default' : 'pointer',
                          },
                          pressed: {
                            fill: '#FF6B6B',
                            outline: 'none',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            <div className="mt-4 text-center text-sm font-bold text-gray-600">
              Yellow highlight = Popular choice • Red = Your selection
            </div>
          </div>

          {/* Selection Panel */}
          <div className="space-y-6">
            
            {/* Country Info */}
            {selectedCountry && (
              <div className="bg-blue-100 border-4 border-black p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="text-3xl font-black mb-2">{selectedCountry}</h3>
                <p className="text-lg mb-4">Population: {(COUNTRY_DATA[selectedCountry as keyof typeof COUNTRY_DATA]?.population || 0).toLocaleString()}</p>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Amount in millions"
                  className="w-full border-3 border-black px-4 py-3 text-xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 mb-4"
                  disabled={hasSubmitted}
                />
                <button
                  onClick={addSelection}
                  disabled={hasSubmitted}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl py-4 border-4 border-black shadow-[4px_4px_0_0_#000] disabled:from-gray-600 disabled:to-gray-700 hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000] transition-all"
                >
                  ADD SELECTION
                </button>
              </div>
            )}

            {/* Current Selections */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-2xl font-black mb-4">Your Selections</h3>
              {selections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Click the map to start selecting countries</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selections.map((s, i) => (
                    <div key={i} className="bg-yellow-100 border-3 border-black p-3 flex justify-between items-center shadow-[2px_2px_0_0_#000]">
                      <div>
                        <div className="font-bold">{s.country}</div>
                        <div className="text-red-600 font-black">{(s.amount / 1000000).toFixed(0)}M</div>
                      </div>
                      {!hasSubmitted && (
                        <button
                          onClick={() => removeSelection(i)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 border-2 border-black text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Button */}
            {totalSelected >= TARGET && (
              <button
                onClick={handleSubmit}
                disabled={hasSubmitted || totalSelected !== TARGET}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-2xl py-6 border-4 border-black shadow-[6px_6px_0_0_#000] disabled:from-gray-600 disabled:to-gray-700 hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000] transition-all"
              >
                {hasSubmitted ? '✓ Submitted' : 'SEE RESULTS →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
