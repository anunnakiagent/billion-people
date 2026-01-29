'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, LineChart, Line } from 'recharts';

const COUNTRY_DATA: Record<string, { population: number; region: string; code: string; name: string; flag: string }> = {
  'United States of America': { population: 331000000, region: 'North America', code: 'US', name: 'USA', flag: '🇺🇸' },
  'China': { population: 1412000000, region: 'Asia', code: 'CN', name: 'China', flag: '🇨🇳' },
  'India': { population: 1380000000, region: 'Asia', code: 'IN', name: 'India', flag: '🇮🇳' },
  'Indonesia': { population: 273500000, region: 'Asia', code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  'Pakistan': { population: 220900000, region: 'Asia', code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  'Brazil': { population: 212600000, region: 'South America', code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  'Nigeria': { population: 206100000, region: 'Africa', code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  'Bangladesh': { population: 164700000, region: 'Asia', code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  'Russia': { population: 145900000, region: 'Europe', code: 'RU', name: 'Russia', flag: '🇷🇺' },
  'Mexico': { population: 128900000, region: 'North America', code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  'Japan': { population: 126500000, region: 'Asia', code: 'JP', name: 'Japan', flag: '🇯🇵' },
  'Ethiopia': { population: 115000000, region: 'Africa', code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  'Philippines': { population: 109600000, region: 'Asia', code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  'Egypt': { population: 102300000, region: 'Africa', code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  'Vietnam': { population: 97300000, region: 'Asia', code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  'Germany': { population: 83780000, region: 'Europe', code: 'DE', name: 'Germany', flag: '🇩🇪' },
  'Turkey': { population: 84330000, region: 'Europe', code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  'Iran': { population: 83990000, region: 'Asia', code: 'IR', name: 'Iran', flag: '🇮🇷' },
  'United Kingdom': { population: 67880000, region: 'Europe', code: 'GB', name: 'UK', flag: '🇬🇧' },
  'France': { population: 65270000, region: 'Europe', code: 'FR', name: 'France', flag: '🇫🇷' },
  'Italy': { population: 60460000, region: 'Europe', code: 'IT', name: 'Italy', flag: '🇮🇹' },
  'South Africa': { population: 59310000, region: 'Africa', code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  'South Korea': { population: 51780000, region: 'Asia', code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  'Spain': { population: 47350000, region: 'Europe', code: 'ES', name: 'Spain', flag: '🇪🇸' },
  'Argentina': { population: 45380000, region: 'South America', code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  'Canada': { population: 38000000, region: 'North America', code: 'CA', name: 'Canada', flag: '🇨🇦' },
  'Australia': { population: 25690000, region: 'Oceania', code: 'AU', name: 'Australia', flag: '🇦🇺' },
};

const TARGET = 1000000000;
const COLORS = ['#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];

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
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

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

  const countryTotals = allSubmissions.flatMap(s => s.selections).reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || { amount: 0, count: 0 });
    acc[s.country].amount += s.amount;
    acc[s.country].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  const totalPeopleSelected = Object.values(countryTotals).reduce((sum, data) => sum + data.amount, 0);
  const maxSelections = Math.max(...Object.values(countryTotals).map(d => d.count), 1);

  const statsData = Object.entries(countryTotals)
    .map(([country, data]) => ({
      country: COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.name || country,
      flag: COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.flag || '🌍',
      totalSelected: data.amount / 1000000,
      selectionCount: data.count,
      population: (COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.population || 0) / 1000000,
      avgPerUser: data.amount / data.count / 1000000,
      percentOfPop: ((data.amount / (COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.population || 1)) * 100),
      selectionFreq: (data.count / maxSelections) * 100,
    }))
    .sort((a, b) => b.totalSelected - a.totalSelected);

  const top15Countries = statsData.slice(0, 15);

  const regionData = Object.entries(countryTotals).reduce((acc, [country, data]) => {
    const region = COUNTRY_DATA[country as keyof typeof COUNTRY_DATA]?.region || 'Other';
    acc[region] = (acc[region] || 0) + data.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(regionData).map(([region, amount]) => ({
    name: region,
    value: amount / 1000000,
  })).sort((a, b) => b.value - a.value);

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
      <div className="min-h-screen bg-yellow-50">
        {/* Brutalist Header */}
        <div className="border-b-8 border-black bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-6xl md:text-7xl font-black text-center tracking-tight mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              <span className="text-red-600">THE BILLION</span>
              <span className="text-blue-600"> PEOPLE</span>
            </h1>
            <p className="text-center text-xl md:text-2xl font-bold text-gray-700">
              🌍 GLOBAL STATISTICS DASHBOARD 🌍
            </p>
          </div>
        </div>

        {/* Animated Banner */}
        <div className="bg-black text-white py-3 overflow-hidden border-b-8 border-black">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-8 text-xl font-black">🎮 {allSubmissions.length} PLAYERS</span>
            <span className="mx-8 text-xl font-black">👥 {(totalPeopleSelected / 1000000000).toFixed(2)} BILLION SELECTED</span>
            <span className="mx-8 text-xl font-black">🌎 {Object.keys(countryTotals).length} COUNTRIES</span>
            <span className="mx-8 text-xl font-black">⚡ AVERAGE {(totalPeopleSelected / allSubmissions.length / 1000000).toFixed(0)}M PER PLAYER</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          
          {/* Key Stats Cards - Bigger and Bolder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-500 border-8 border-black p-8 shadow-brutalist card-brutalist">
              <div className="text-sm font-black text-white uppercase tracking-widest mb-2">TOTAL PLAYERS</div>
              <div className="text-7xl font-black text-white">{allSubmissions.length}</div>
              <div className="mt-4 text-2xl font-bold bg-yellow-400 border-4 border-black px-4 py-2 inline-block">
                PEOPLE PLAYING
              </div>
            </div>
            <div className="bg-blue-500 border-8 border-black p-8 shadow-brutalist card-brutalist">
              <div className="text-sm font-black text-white uppercase tracking-widest mb-2">TOTAL SELECTED</div>
              <div className="text-6xl font-black text-white">{(totalPeopleSelected / 1000000000).toFixed(1)}B</div>
              <div className="mt-4 text-2xl font-bold bg-yellow-400 border-4 border-black px-4 py-2 inline-block">
                PEOPLE CHOSEN
              </div>
            </div>
            <div className="bg-yellow-400 border-8 border-black p-8 shadow-brutalist card-brutalist">
              <div className="text-sm font-black text-black uppercase tracking-widest mb-2">UNIQUE COUNTRIES</div>
              <div className="text-7xl font-black text-black">{Object.keys(countryTotals).length}</div>
              <div className="mt-4 text-2xl font-bold bg-red-500 text-white border-4 border-black px-4 py-2 inline-block">
                DIFFERENT PLACES
              </div>
            </div>
          </div>

          {/* Top 15 Countries Chart */}
          <div className="bg-white border-8 border-black p-8 shadow-brutalist">
            <h2 className="text-5xl font-black mb-6 text-center">🏆 TOP 15 COUNTRIES</h2>
            <p className="text-center text-xl font-bold text-gray-600 mb-6">Total Selected (Millions) + Selection Frequency</p>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={top15Countries} layout="vertical">
                <CartesianGrid strokeDasharray="4 4" stroke="#000" strokeWidth={2} />
                <XAxis type="number" tick={{ fill: '#000', fontSize: 14 }} />
                <YAxis dataKey="country" type="category" width={120} tick={{ fill: '#000', fontSize: 14, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 0, 0.3)' }}
                  contentStyle={{ backgroundColor: '#000', border: '4px solid #000', borderRadius: '0', fontWeight: 'bold', color: '#fff' }}
                  labelStyle={{ color: '#FFFF00' }}
                  formatter={(value: any, name?: string) => {
                    if (name === 'totalSelected') return [`${value.toFixed(0)}M`, 'Total Selected'];
                    if (name === 'selectionFreq') return [`${value.toFixed(0)}%`, 'Selection Freq'];
                    return [value, name || ''];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '18px', fontWeight: 'bold' }} />
                <Bar dataKey="totalSelected" fill="#FF0000" name="Total Selected (Millions)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="selectionFreq" fill="#0000FF" name="Selection Frequency %" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-white border-8 border-black p-8 shadow-brutalist">
            <h2 className="text-5xl font-black mb-6 text-center">📊 DETAILED STATISTICS</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-6 border-black bg-yellow-400">
                    <th className="text-left p-4 font-black text-xl">#</th>
                    <th className="text-left p-4 font-black text-xl">Country</th>
                    <th className="text-right p-4 font-black text-xl">Total Selected</th>
                    <th className="text-right p-4 font-black text-xl">Selections</th>
                    <th className="text-right p-4 font-black text-xl">Avg/Person</th>
                    <th className="text-right p-4 font-black text-xl">% of Pop</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.map((stat, i) => (
                    <tr key={i} className={`border-b-4 border-black ${i % 2 === 0 ? 'bg-red-50' : 'bg-blue-50'} hover:bg-yellow-200 transition-colors`}>
                      <td className="p-4 font-black text-2xl">{i + 1}</td>
                      <td className="p-4 font-black text-xl">{stat.flag} {stat.country}</td>
                      <td className="text-right p-4 font-mono font-black text-xl text-red-600">{stat.totalSelected.toFixed(0)}M</td>
                      <td className="text-right p-4 font-mono font-black text-xl text-blue-600">{stat.selectionCount}</td>
                      <td className="text-right p-4 font-mono font-black text-xl">{stat.avgPerUser.toFixed(1)}M</td>
                      <td className="text-right p-4 font-mono font-black text-xl">{stat.percentOfPop.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Distribution + Top 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regional Pie Chart */}
            <div className="bg-white border-8 border-black p-8 shadow-brutalist">
              <h2 className="text-4xl font-black mb-6 text-center">🗺️ REGIONAL DISTRIBUTION</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={4}
                    stroke="#000"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '4px solid #000', borderRadius: '0', fontWeight: 'bold', color: '#fff' }}
                    formatter={(value: any) => [`${value.toFixed(0)}M`, 'Total Selected']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Hall of Fame */}
            <div className="bg-gradient-to-br from-red-600 to-blue-600 border-8 border-black p-8 shadow-brutalist text-white">
              <h2 className="text-5xl font-black mb-6 text-center wiggle">🏆 HALL OF FAME 🏆</h2>
              <div className="space-y-4">
                {statsData.slice(0, 5).map((stat, i) => (
                  <div key={i} className={`border-6 border-black p-6 shadow-brutalist ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-white text-black'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl font-black">{i + 1}</div>
                        <div>
                          <div className="text-4xl font-black">{stat.flag} {stat.country}</div>
                          <div className="text-xl font-bold mt-2">
                            {stat.totalSelected.toFixed(0)}M total • {stat.selectionCount} selections
                          </div>
                        </div>
                      </div>
                      {i === 0 && <div className="text-6xl bounce-brutalist">👑</div>}
                      {i === 1 && <div className="text-5xl">🥈</div>}
                      {i === 2 && <div className="text-5xl">🥉</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-6 justify-center pt-8">
            <button
              onClick={() => setShowStats(false)}
              className="btn-brutalist bg-blue-600 text-white font-black text-2xl px-12 py-6 border-6 border-black"
            >
              ← BACK TO GAME
            </button>
            {!hasSubmitted && (
              <button
                onClick={reset}
                className="btn-brutalist bg-green-600 text-white font-black text-2xl px-12 py-6 border-6 border-black"
              >
                PLAY AGAIN →
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-8 border-black bg-black text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-2xl font-black mb-4">🌍 THE BILLION PEOPLE 🌍</p>
            <p className="text-lg font-bold">A brutalist social experiment in population selection</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white border-8 border-black p-12 shadow-brutalist">
          <h1 className="text-6xl font-black text-center mb-8" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            <span className="text-red-600">CONFIRM</span> YOUR CHOICE
          </h1>
          
          <div className="mb-8">
            <div className="text-4xl font-black text-center mb-6">You've chosen exactly 1 BILLION people:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selections.map((s, i) => (
                <div key={i} className="bg-yellow-400 border-6 border-black p-6 shadow-brutalist-sm">
                  <div className="font-black text-2xl">{s.country}</div>
                  <div className="text-5xl font-black text-red-600 mt-2">{(s.amount / 1000000).toFixed(0)}M</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setStep('selection')}
              className="btn-brutalist bg-gray-300 text-black font-black text-xl px-12 py-6 border-6 border-black"
            >
              ← GO BACK
            </button>
            <button
              onClick={confirmSubmission}
              className="btn-brutalist bg-green-600 text-white font-black text-xl px-12 py-6 border-6 border-black pulse-brutalist"
            >
              CONFIRM & SEE STATS →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Brutalist Header */}
      <div className="border-b-8 border-black bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              <span className="text-red-600">THE BILLION</span>
              <span className="text-blue-600"> PEOPLE</span>
            </h1>
            <button
              onClick={() => setShowStats(true)}
              className="btn-brutalist bg-purple-600 text-white font-black text-lg px-8 py-4 border-6 border-black"
            >
              📊 GLOBAL STATS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Progress Bar - Brutalist Style */}
        <div className="mb-8">
          <div className="bg-white border-8 border-black p-6 shadow-brutalist">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl md:text-3xl font-black">
                <span className="text-red-600">{(totalSelected / 1000000000).toFixed(2)}</span> / 1.00 BILLION
              </div>
              <div className="text-5xl font-black">{progress.toFixed(0)}%</div>
            </div>
            <div className="h-16 bg-gray-200 border-6 border-black overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-yellow-400 to-green-600 transition-all duration-500 flex items-center justify-center font-black text-2xl text-black"
                style={{ width: `${progress}%` }}
              >
                {progress >= 100 ? '✓ COMPLETE!' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Map Section */}
          <div className="lg:col-span-2 bg-white border-8 border-black p-8 shadow-brutalist">
            <h2 className="text-3xl font-black mb-6">🌍 CLICK COUNTRIES TO SELECT POPULATION</h2>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b-4 border-black">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-4 border-black bg-red-600"></div>
                <span className="font-bold">Your Selection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-4 border-black bg-yellow-400"></div>
                <span className="font-bold">Popular Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-4 border-black bg-gray-300"></div>
                <span className="font-bold">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-4 border-black bg-cyan-400"></div>
                <span className="font-bold">Hover</span>
              </div>
            </div>

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
                    const isHovered = hoveredCountry === countryName;
                    const countryData = COUNTRY_DATA[countryName as keyof typeof COUNTRY_DATA];
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          if (countryData && !hasSubmitted) handleCountryClick(countryName);
                        }}
                        onMouseEnter={() => setHoveredCountry(countryName)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        style={{
                          default: {
                            fill: isSelected ? '#FF0000' : selectionCount > 0 ? '#FFFF00' : '#E0E0E0',
                            stroke: '#000',
                            strokeWidth: 0.5,
                            outline: 'none',
                          },
                          hover: {
                            fill: hasSubmitted ? '#E0E0E0' : '#00FFFF',
                            stroke: '#000',
                            strokeWidth: 2,
                            outline: 'none',
                            cursor: hasSubmitted ? 'default' : 'pointer',
                          },
                          pressed: {
                            fill: '#FF0000',
                            outline: 'none',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {/* Hover Info */}
            {hoveredCountry && COUNTRY_DATA[hoveredCountry as keyof typeof COUNTRY_DATA] && (
              <div className="mt-6 bg-cyan-400 border-6 border-black p-6 shadow-brutalist">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black">{COUNTRY_DATA[hoveredCountry as keyof typeof COUNTRY_DATA]?.flag} {hoveredCountry}</div>
                    <div className="text-xl font-bold mt-2">
                      Population: {(COUNTRY_DATA[hoveredCountry as keyof typeof COUNTRY_DATA]?.population || 0).toLocaleString()}
                    </div>
                    {countryTotals[hoveredCountry] && (
                      <div className="text-lg font-bold mt-2 text-blue-600">
                        Selected by {countryTotals[hoveredCountry].count} players
                      </div>
                    )}
                  </div>
                  <div className="text-6xl">👆</div>
                </div>
              </div>
            )}
          </div>

          {/* Selection Panel */}
          <div className="space-y-6">
            
            {/* Country Info */}
            {selectedCountry && (
              <div className="bg-blue-100 border-8 border-black p-6 shadow-brutalist">
                <h3 className="text-3xl font-black mb-2">
                  {COUNTRY_DATA[selectedCountry as keyof typeof COUNTRY_DATA]?.flag} {selectedCountry}
                </h3>
                <p className="text-lg mb-4 font-bold">
                  Population: {(COUNTRY_DATA[selectedCountry as keyof typeof COUNTRY_DATA]?.population || 0).toLocaleString()}
                </p>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Amount in millions"
                  className="w-full border-6 border-black px-4 py-4 text-2xl font-black focus:outline-none focus:ring-0 mb-4"
                  disabled={hasSubmitted}
                />
                <button
                  onClick={addSelection}
                  disabled={hasSubmitted}
                  className="btn-brutalist w-full bg-red-600 text-white font-black text-xl py-4 border-6 border-black disabled:opacity-50"
                >
                  ADD SELECTION
                </button>
              </div>
            )}

            {/* Current Selections */}
            <div className="bg-white border-8 border-black p-6 shadow-brutalist">
              <h3 className="text-2xl font-black mb-4">YOUR SELECTIONS</h3>
              {selections.length === 0 ? (
                <p className="text-gray-500 text-center py-8 font-bold text-xl">Click the map to start selecting countries</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selections.map((s, i) => (
                    <div key={i} className="bg-yellow-400 border-6 border-black p-4 flex justify-between items-center shadow-brutalist-sm">
                      <div>
                        <div className="font-black text-lg">{s.country}</div>
                        <div className="text-red-600 font-black text-2xl">{(s.amount / 1000000).toFixed(0)}M</div>
                      </div>
                      {!hasSubmitted && (
                        <button
                          onClick={() => removeSelection(i)}
                          className="bg-red-600 text-white font-black px-6 py-3 border-4 border-black text-xl hover:bg-red-700 transition-colors"
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
                className={`btn-brutalist w-full ${totalSelected === TARGET ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'} text-white font-black text-2xl py-6 border-8 border-black disabled:opacity-50`}
              >
                {hasSubmitted ? '✓ SUBMITTED' : 'SEE RESULTS →'}
              </button>
            )}

            {/* Tips */}
            <div className="bg-yellow-400 border-8 border-black p-6 shadow-brutalist">
              <h3 className="text-xl font-black mb-4">💡 TIPS</h3>
              <ul className="space-y-2 font-bold text-lg">
                <li>• Select exactly 1 billion people</li>
                <li>• Click countries on the map</li>
                <li>• Yellow = popular choice</li>
                <li>• View global stats anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
