export const farm = {
  location: 'Miraj, Sangli, Maharashtra',
  crop: 'Soybean',
  area: '5 acres',
  sowing: '2026-06-20',
  season: 'Kharif 2026',
  soil: 'Medium black',
  variety: 'JS 335 (classic, 95-100d)'
};

export const yieldInfo = {
  range: '1.7 – 2.2',
  unit: 't/ha',
  productionQuintals: '33.8 q',
  expectedKgHa: '1,670 kg/ha',
  confidence: 'Moderate',
  regional: '1.7 t/ha',
  harvest: '13 Sep → 23 Sep 2026'
};

export const ndvi = [
  { month: 'Jun 12', value: 0.24 },
  { month: 'Jun 28', value: 0.31 },
  { month: 'Jul 14', value: 0.46 },
  { month: 'Jul 30', value: 0.59 },
  { month: 'Aug 15', value: 0.68 },
  { month: 'Aug 31', value: 0.72 },
  { month: 'Sep 16', value: 0.67 },
  { month: 'Oct 02', value: 0.61 }
];

export const weather = [
  { week: 'Aug 1', rainfall: 24, temp: 29 },
  { week: 'Aug 8', rainfall: 38, temp: 28 },
  { week: 'Aug 15', rainfall: 19, temp: 30 },
  { week: 'Aug 22', rainfall: 31, temp: 29 },
  { week: 'Aug 29', rainfall: 14, temp: 31 },
  { week: 'Sep 5', rainfall: 22, temp: 29 },
  { week: 'Sep 12', rainfall: 18, temp: 30 },
  { week: 'Sep 19', rainfall: 12, temp: 31 }
];

export const prices7 = [
  { day: 'Sep 26', price: 4620 },
  { day: 'Sep 27', price: 4650 },
  { day: 'Sep 28', price: 4610 },
  { day: 'Sep 29', price: 4690 },
  { day: 'Sep 30', price: 4720 },
  { day: 'Oct 1', price: 4680 },
  { day: 'Oct 2', price: 4760 }
];

export const prices30 = [
  '4 Sep', '6 Sep', '8 Sep', '10 Sep', '12 Sep', '14 Sep', '16 Sep',
  '18 Sep', '20 Sep', '22 Sep', '24 Sep', '26 Sep', '28 Sep', '30 Sep', '2 Oct'
].map((day, i) => ({
  day,
  price: [4380, 4420, 4390, 4510, 4470, 4560, 4520, 4610, 4550, 4680, 4610, 4720, 4650, 4690, 4760][i]
}));

export const markets = [
  { name: 'Sangli APMC', distance: '12 km', price: 4760, change: '+2.4%', arrivals: '184 t', quality: 'Good', trend: 'up' },
  { name: 'Tasgaon APMC', distance: '28 km', price: 4725, change: '+1.1%', arrivals: '126 t', quality: 'Good', trend: 'up' },
  { name: 'Miraj APMC', distance: '34 km', price: 4680, change: '−0.3%', arrivals: '208 t', quality: 'Moderate', trend: 'flat' },
  { name: 'Kolhapur APMC', distance: '51 km', price: 4810, change: '+0.8%', arrivals: '96 t', quality: 'Partial', trend: 'up' }
];

export const factors = [
  'Harvest window is approaching',
  'Recent prices are comparatively favorable',
  'Market direction is being monitored',
  'Available data quality supports a moderate-confidence outlook'
];

export function transformAdvisoryData(apiData) {
  if (!apiData) return null;

  const lowTonnes = (apiData.yield_outlook?.kg_per_ha?.low / 1000).toFixed(1);
  const highTonnes = (apiData.yield_outlook?.kg_per_ha?.high / 1000).toFixed(1);
  const regionalTonnes = (apiData.yield_outlook?.long_term_avg_kg_ha / 1000).toFixed(1);

  const dynamicMarkets = markets.map(m => {
    if (m.name === 'Sangli APMC' && apiData.market?.analysis?.price_now) {
      return {
        ...m,
        price: apiData.market.analysis.price_now,
        trend: apiData.market.analysis.momentum === 'Falling' ? 'flat' : 'up'
      };
    }
    return m;
  });

  const dynamicFactors = [
    `Harvest window: ${apiData.harvest?.window?.[0]} to ${apiData.harvest?.window?.[1]}`,
    apiData.advisory?.reason || 'Prices are evaluated against storage and interest holding costs.',
    apiData.crop_health?.message || 'Satellite greenness aligns with seasonal soybean growth curve.',
    'Model calibrated on historical 2017–2026 Sangli APMC and weather observations.'
  ];

  return {
    raw: apiData,
    farm: {
      location: `${apiData.farmer?.taluka || 'Miraj'}, Sangli, Maharashtra`,
      crop: apiData.farmer?.crop || 'Soybean',
      area: `${apiData.farmer?.acres || 5} acres`,
      sowing: apiData.farmer?.sowing_date || '2026-06-20',
      season: 'Kharif 2026',
      soil: apiData.farmer?.soil || 'Medium black',
      variety: apiData.farmer?.variety || 'JS 335'
    },
    yieldInfo: {
      range: `${lowTonnes} – ${highTonnes}`,
      unit: 't/ha',
      productionQuintals: `${apiData.yield_outlook?.production_quintals?.expected?.toFixed(1) || '33.8'} q`,
      expectedKgHa: `${apiData.yield_outlook?.kg_per_ha?.expected?.toFixed(0) || '1,670'} kg/ha`,
      confidence: 'Moderate',
      regional: `${regionalTonnes} t/ha`,
      harvest: apiData.harvest ? `${apiData.harvest.window[0]} → ${apiData.harvest.window[1]}` : 'Mid October'
    },
    harvest: {
      expectedDate: apiData.harvest?.expected_date,
      window: apiData.harvest?.window,
      daysToHarvest: apiData.harvest?.days_to_harvest,
      daysAfterSowing: apiData.harvest?.days_after_sowing,
      cropStage: apiData.harvest?.crop_stage,
      stageTip: apiData.harvest?.stage_tip
    },
    sellingSignal: {
      decision: apiData.advisory?.decision || 'SELL AT HARVEST',
      signal: apiData.advisory?.decision === 'HOLD' ? 'HOLD IN WAREHOUSE' : 'SELL AT HARVEST',
      sellWhen: apiData.advisory?.sell_when || 'Harvest Period',
      expectedNetPrice: apiData.advisory?.expected_net_price || 0,
      reason: apiData.advisory?.reason,
      reasonMarathi: apiData.advisory?.reason_marathi,
      revenueInr: apiData.advisory?.revenue_inr?.expected || 0,
      revenueInrLow: apiData.advisory?.revenue_inr?.low || 0,
      revenueInrHigh: apiData.advisory?.revenue_inr?.high || 0
    },
    marketAnalysis: {
      priceNow: apiData.market?.analysis?.price_now || 4760,
      momentum: apiData.market?.analysis?.momentum || 'Favorable',
      marketNotes: apiData.market?.analysis?.market_notes || '',
      asOf: apiData.market?.analysis?.as_of || '2026-09-24',
      harvestTimePlan: apiData.market?.harvest_time_plan || [],
      predictedBestPrice: apiData.predicted_best_price || null,
      predictedPriceNotes: apiData.predicted_price_notes || ''
    },
    cropHealth: {
      status: apiData.crop_health?.status || 'Healthy',
      message: apiData.crop_health?.message || 'Healthy soybean foliage',
      now: apiData.crop_health?.now || 0.61
    },
    weatherSummary: apiData.weather_summary || { avg_temp: 29, humidity: 68, rainfall_7d: 18 },
    soil: apiData.soil || { type: 'Medium black', note: 'Good water retention during pod filling.' },
    alerts: apiData.alerts || [],
    markets: dynamicMarkets,
    factors: dynamicFactors,
    chartData: apiData.chart_data || null
  };
}
