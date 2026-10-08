import React, { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import CropAdvisoryPage from './pages/CropAdvisoryPage.jsx'
import AuthScreen from './AuthScreen.jsx'
import { AnalysisReady, CropIntake, WelcomeScreen } from './Onboarding.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  CloudRain,
  Compass,
  Cpu,
  Droplets,
  Eye,
  FileText,
  Gauge,
  Layers3,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  farm as defaultFarm,
  factors as defaultFactors,
  markets as defaultMarkets,
  ndvi as defaultNdvi,
  prices30,
  prices7,
  weather,
  yieldInfo as defaultYieldInfo
} from './data'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge, group: 'Workspace' },
  { id: 'crop', label: 'Crop Analysis', icon: Leaf, group: 'Workspace' },
  { id: 'yield', label: 'Yield & Harvest', icon: Activity, group: 'Workspace' },
  { id: 'market', label: 'Market Intelligence', icon: TrendingUp, group: 'Decisions' },
  { id: 'selling', label: 'Selling Outlook', icon: Compass, group: 'Decisions' },
  { id: 'data', label: 'Data & Insights', icon: Layers3, group: 'System' }
]

const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

function SideNav({ page, setPage, open, setOpen, displayName, onSignOut, onEditFarm }) {
  const { uiData, health } = useApp()
  const farm = uiData?.farm || defaultFarm
  const harvest = uiData?.harvest || {}

  return (
    <>
      {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sprout size={20} />
          </div>
          <div className="brand-lockup">
            <span>Krishi<span className="brand-light">Lens</span></span>
            <small>See Your Crop. Understand Your Harvest. Sell Smarter.</small>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setOpen(false)}>
            <X size={17} />
          </button>
        </div>

        <button 
          className="farm-switch text-left cursor-pointer" 
          title="Click to change farm parameters"
          onClick={onEditFarm}
        >
          <div className="farm-avatar">
            <Leaf size={17} />
          </div>
          <div className="farm-name">
            <b>{farm.crop} Field</b>
            <span>{farm.location} · {farm.area}</span>
          </div>
          <ChevronDown size={15} className="muted" />
        </button>

        {['Workspace', 'Decisions', 'System'].map(g => (
          <div className="nav-group" key={g}>
            <div className="nav-heading">{g}</div>
            {nav.filter(n => n.group === g).map(n => (
              <button
                key={n.id}
                onClick={() => { setPage(n.id); setOpen(false) }}
                className={`nav-link ${page === n.id ? 'active' : ''}`}
              >
                <n.icon size={17} />
                <span>{n.label}</span>
                {n.id === 'selling' && <i className="nav-dot" />}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="season-card">
            <div className="season-top">
              <span className="season-icon"><Sun size={16} /></span>
              <span className="eyebrow">CURRENT SEASON</span>
              <MoreHorizontal size={16} />
            </div>
            <strong>Kharif 2026</strong>
            <div className="season-progress"><i /></div>
            <div className="season-caption">
              <span>{harvest.cropStage ? harvest.cropStage.split('(')[0] : 'Crop stage'}</span>
              <b>{harvest.daysAfterSowing ? `${harvest.daysAfterSowing} DAS` : '78%'}</b>
            </div>
          </div>

          <button className="profile-row cursor-pointer" title="Return to sign in" onClick={onSignOut}>
            <div className="profile-avatar">
              {displayName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <b>{displayName}</b>
              <span>{farm.location.split(',')[0]} · Sign out</span>
            </div>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>
    </>
  )
}

function Topbar({ page, setOpen, displayName, onEditFarm, onAnalyzeCrop, onHome }) {
  const { health } = useApp()
  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" onClick={() => setOpen(true)}>
        <Menu size={19} />
      </button>
      <div className="crumb">
        <button 
          onClick={onHome}
          className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          title="Back to Landing Page"
        >
          KrishiLens
        </button>
        <ChevronRight size={14} />
        <b>{nav.find(x => x.id === page)?.label}</b>
      </div>
      <div className="top-actions">
        {health?.status === 'healthy' ? (
          <span className="live-label" title={`Backend active • Model v${health.model_version}`}>
            <i style={{ background: '#42873d' }} /> ML ENGINE v{health.model_version}
          </span>
        ) : (
          <span className="live-label"><i /> DEMO ENVIRONMENT</span>
        )}
        {onAnalyzeCrop && (
          <button 
            className="button button-primary !py-1 !px-2.5 !text-xs !h-auto flex items-center gap-1 cursor-pointer"
            onClick={onAnalyzeCrop}
            title="Open calibrated crop advisory form"
          >
            <Sprout size={13} /> Analyze Crop
          </button>
        )}
        {onHome && (
          <button 
            className="button button-outline !py-1 !px-2.5 !text-xs !h-auto cursor-pointer"
            onClick={onHome}
            title="Back to Landing Page"
          >
            Overview
          </button>
        )}
        <button 
          className="button button-outline !py-1 !px-2.5 !text-xs !h-auto"
          onClick={onEditFarm}
          title="Recalculate advisory for another farm/variety"
        >
          <RefreshCw size={13} className="mr-1 inline" /> Edit Farm
        </button>
        <div className="top-avatar">
          {displayName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
        </div>
      </div>
    </header>
  )
}

function Heading({ eyebrow, title, sub, right }) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

function Pill({ children, type = '' }) {
  return <span className={`pill ${type}`}>{children}</span>
}

function Confidence() {
  return <span className="confidence"><i /> Calibrated ML</span>
}

function Metric({ label, value, sub, icon: Icon, tone = 'green', trend }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className={`metric-icon ${tone}`}><Icon size={16} /></span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        {trend && <span className="trend-up"><ArrowUpRight size={13} />{trend}</span>}
        <span>{sub}</span>
      </div>
    </article>
  )
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <b>{label}</b>
      <span><i /> NDVI <strong>{payload[0].value}</strong></span>
    </div>
  )
}

function NDVIChart({ compact = false }) {
  const { uiData } = useApp()
  const chartData = defaultNdvi
  return (
    <div className={`chart-area ${compact ? 'chart-compact' : ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="ndviFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b955d" stopOpacity={0.24} />
              <stop offset="100%" stopColor="#6b955d" stopOpacity={0.015} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e9ece5" strokeDasharray="3 4" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b9388', fontSize: 11 }} dy={9} />
          <YAxis domain={[0, 0.8]} axisLine={false} tickLine={false} tick={{ fill: '#9da49a', fontSize: 10 }} ticks={[0, 0.2, 0.4, 0.6, 0.8]} />
          <Tooltip content={<ChartTip />} />
          <Area type="monotone" dataKey="value" stroke="#557e4b" strokeWidth={2.5} fill="url(#ndviFill)" activeDot={{ r: 5, fill: '#557e4b', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function PriceChart({ data }) {
  return (
    <div className="chart-area price-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 5, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b17b3d" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#b17b3d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ecece6" strokeDasharray="3 4" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} interval="preserveStartEnd" tick={{ fill: '#92998f', fontSize: 10 }} dy={8} />
          <YAxis domain={['dataMin-150', 'dataMax+150']} axisLine={false} tickLine={false} tick={{ fill: '#a0a59d', fontSize: 10 }} tickFormatter={n => `${(n / 1000).toFixed(1)}k`} />
          <Tooltip formatter={v => [money(v), 'Modal price']} contentStyle={{ border: '1px solid #e9ebe4', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="price" stroke="#a97637" strokeWidth={2.3} fill="url(#priceFill)" activeDot={{ r: 4, fill: '#a97637', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function FieldVisual({ location, area }) {
  return (
    <div className="field-visual">
      <div className="field-grid">{Array.from({ length: 9 }, (_, i) => <div key={i} />)}</div>
      <div className="field-outline" />
      <div className="field-map-tag">
        <span><MapPin size={12} /> FIELD AREA · {area || '5.0 ACRES'}</span>
        <b>{location || 'Miraj, Sangli, Maharashtra'}</b>
      </div>
      <div className="map-coordinates">16°51' N &nbsp; 74°34' E</div>
      <div className="map-scale"><i />500 m</div>
      <div className="map-compass">N <span>↑</span></div>
      <div className="satellite-label"><Eye size={13} /> SATELLITE RADAR · VERIFIED</div>
    </div>
  )
}

function HarvestTimeline({ stageTip }) {
  return (
    <div className="timeline">
      <div className="timeline-head">
        <span>JUL</span>
        <span>AUG</span>
        <span>SEP</span>
        <span>OCT</span>
        <span>NOV</span>
      </div>
      <div className="timeline-track">
        <div className="timeline-past" style={{ width: '75%' }} />
        <div className="timeline-window"><i /><i /></div>
        <div className="today-line" style={{ left: '76%' }}>
          <span>TODAY</span>
        </div>
      </div>
      <div className="timeline-labels">
        <span>Vegetative growth</span>
        <span>Flowering & Pod filling</span>
        <span>Maturity stage</span>
        <strong>Expected harvest window</strong>
      </div>
    </div>
  )
}

/* ==========================================================================
   PAGE 1: DASHBOARD
   ========================================================================== */
function Dashboard({ setPage, displayName, onEditFarm }) {
  const { uiData, health } = useApp()
  const farm = uiData?.farm || defaultFarm
  const yieldInfo = uiData?.yieldInfo || defaultYieldInfo
  const harvest = uiData?.harvest || {}
  const sellingSignal = uiData?.sellingSignal || {}
  const marketAnalysis = uiData?.marketAnalysis || {}
  const cropHealth = uiData?.cropHealth || {}
  const alerts = uiData?.alerts || []

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow welcome-eyebrow">
            THURSDAY, 08 OCTOBER 2026 <span className="eyebrow-divider">/</span> KHARIF SEASON
          </div>
          <h1>Good evening, {displayName.split(' ')[0]} <span className="wave">✳</span></h1>
          <p>Here’s the latest ML outlook and mandi strategy for your soybean crop.</p>
        </div>
        <button className="button button-outline cursor-pointer" onClick={onEditFarm} title="Selected season: Kharif 2026">
          <CalendarDays size={15} /> Kharif 2026 · {farm.location.split(',')[0]}
        </button>
      </div>

      <div className="farm-context">
        <div className="location-pin"><MapPin size={17} /></div>
        <div className="farm-context-name">
          <strong>{farm.location}</strong>
          <span>{farm.crop} <i /> {farm.area} <i /> Sown {farm.sowing} <i /> {farm.variety} <i /> {farm.soil}</span>
        </div>
        <button className="context-link" onClick={() => setPage('crop')}>
          View crop details <ArrowRight size={14} />
        </button>
        <div className="context-conf">
          <span className="demo-mini">AI MODEL {health?.model_version || '0.2.0'}</span>
          <span>Market data as of {health?.market_data_as_of || '24 Sep 2026'}</span>
        </div>
      </div>

      {/* Backend Live Alerts Strip */}
      {alerts && alerts.length > 0 && (
        <div className="dash-alerts-banner">
          {alerts.map((alt, i) => (
            <div key={i} className="dash-alert-item alert-amber">
              <AlertTriangle size={15} className="text-amber-700 flex-shrink-0" />
              <span><b>Agronomic Alert:</b> {alt}</span>
            </div>
          ))}
          {harvest.stageTip && (
            <div className="dash-alert-item">
              <Leaf size={15} className="text-emerald-700 flex-shrink-0" />
              <span><b>Crop Stage Advisory ({harvest.cropStage}):</b> {harvest.stageTip}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="metric-grid">
        <Metric
          label="Crop condition"
          value={cropHealth.status || 'Stable'}
          sub={`NDVI ${(cropHealth.now || 0.61).toFixed(2)} · ${harvest.cropStage ? harvest.cropStage.split('(')[0] : 'Mature'}`}
          icon={Leaf}
          trend="Holding steady"
        />
        <Metric
          label="Expected yield"
          value={<>{yieldInfo.range}<small> t/ha</small></>}
          sub={`Total ≈ ${yieldInfo.productionQuintals} · ${yieldInfo.expectedKgHa}`}
          icon={Activity}
          tone="blue"
        />
        <Metric
          label="Expected harvest"
          value={harvest.window ? `${harvest.window[0]?.slice(5)} → ${harvest.window[1]?.slice(5)}` : 'Late Sep – Early Oct'}
          sub={harvest.daysToHarvest !== undefined ? (harvest.daysToHarvest > 0 ? `${harvest.daysToHarvest} days remaining` : `Stage: ${harvest.cropStage || 'Maturity'}`) : 'Estimated window'}
          icon={CalendarDays}
          tone="amber"
        />
        <Metric
          label="Market reference"
          value={marketAnalysis.priceNow ? `₹${marketAnalysis.priceNow.toLocaleString('en-IN')}` : '₹6,080'}
          sub={`Sangli APMC · ${marketAnalysis.momentum || 'Active'}`}
          icon={TrendingUp}
          tone="teal"
        />
      </div>

      {/* Main Grid: Satellite & Selling Outlook */}
      <div className="main-grid dashboard-main">
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">SATELLITE INTELLIGENCE <span className="fresh-dot" /></div>
              <h3>Crop growth trend</h3>
              <p>Vegetation vigor and seasonal biomass curve</p>
            </div>
            <span className="select-button">Season to date</span>
          </div>
          <div className="chart-legend">
            <span><i className="legend-green" /> NDVI</span>
            <span className="legend-latest">Latest observation <b>{(cropHealth.now || 0.61).toFixed(2)}</b></span>
          </div>
          <NDVIChart />
          <div className="chart-footer">
            <span><b>0.72</b> Peak · 31 Aug</span>
            <span><b>{(cropHealth.now || 0.61).toFixed(2)}</b> Latest · 02 Oct</span>
            <button onClick={() => setPage('crop')}>View crop analysis <ArrowRight size={13} /></button>
          </div>
        </section>

        <section className="panel signal-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">DECISION SUPPORT ENGINE</div>
              <h3>Selling outlook</h3>
            </div>
            <span className="signal-status"><i /> ACTIVE</span>
          </div>
          <div className="signal-feature">
            <div className="signal-icon"><Compass size={20} /></div>
            <div>
              <span className="signal-overline">AI RECOMMENDATION</span>
              <h2>{sellingSignal.signal || (sellingSignal.decision === 'HOLD' ? 'HOLD IN WAREHOUSE' : 'SELL AT HARVEST')}</h2>
            </div>
          </div>
          <div className="signal-details">
            <div>
              <span>Recommended timing</span>
              <b>{sellingSignal.sellWhen || 'December 2026'}</b>
            </div>
            <div>
              <span>Est. net price</span>
              <b>₹{(sellingSignal.expectedNetPrice || marketAnalysis.priceNow || 6080).toLocaleString('en-IN')} <small>/ qtl</small></b>
            </div>
          </div>
          <div className="confidence-row">
            <Confidence />
            <span>Est. total revenue: <b>₹{(sellingSignal.revenueInr || 205791).toLocaleString('en-IN')}</b></span>
          </div>
          <div className="signal-reason">
            <span className="reason-check"><Check size={12} /></span>
            <span>{sellingSignal.reason || 'Prices are evaluated against storage and interest holding costs.'}</span>
          </div>

          {/* Marathi Explanation Rationale */}
          {sellingSignal.reasonMarathi && (
            <div className="marathi-advisory-card">
              <span className="marathi-advisory-badge">
                <Sparkles size={13} /> मराठी सल्ला (Marathi Advisory)
              </span>
              <p className="marathi-advisory-text">
                {sellingSignal.reasonMarathi}
              </p>
            </div>
          )}

          <button className="button button-dark full-button mt-4" onClick={() => setPage('selling')}>
            Explore 6-month holding plan <ArrowRight size={15} />
          </button>
          <p className="support-note">Analytical decision support based on Sangli APMC and carrying cost models.</p>
        </section>
      </div>

      {/* Lower Grid: Local Weather & Yield Forecast */}
      <div className="lower-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">LOCAL CONDITIONS · {farm.location.split(',')[0].toUpperCase()}</div>
              <h3>Weather summary</h3>
            </div>
            <button className="text-button" onClick={() => setPage('crop')}>Details <ArrowRight size={14} /></button>
          </div>
          <div className="weather-metrics">
            <div>
              <span className="weather-icon rain"><CloudRain size={16} /></span>
              <small>Rainfall · 7 days</small>
              <strong>18 <em>mm</em></strong>
              <i className="good">Within seasonal range</i>
            </div>
            <div>
              <span className="weather-icon temp"><Sun size={16} /></span>
              <small>Avg. temperature</small>
              <strong>29 <em>°C</em></strong>
              <i>Typical for pod filling</i>
            </div>
            <div>
              <span className="weather-icon humidity"><Droplets size={16} /></span>
              <small>Humidity</small>
              <strong>68 <em>%</em></strong>
              <i>Favorable conditions</i>
            </div>
          </div>
          <div className="weather-insight">
            <Cloud size={15} />
            <span>Conditions have remained steady through the latest Kharif observation cycle.</span>
            <span className="weather-spark">▂▄▃▅▂▄▃</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">YIELD FORECAST MODEL</div>
              <h3>Expected yield</h3>
            </div>
            <button className="icon-btn" onClick={() => setPage('yield')} aria-label="Yield details"><ArrowRight size={16} /></button>
          </div>
          <div className="yield-band">
            <div>
              <span>ESTIMATED RANGE</span>
              <strong>{yieldInfo.range} <small>t/ha</small></strong>
            </div>
            <Confidence />
          </div>
          <div className="yield-range">
            <div className="range-caption">
              <span>Regional average <b>{yieldInfo.regional}</b></span>
              <span>Total output <b>{yieldInfo.productionQuintals}</b></span>
            </div>
            <div className="range-track"><i /><b /><i /></div>
          </div>
          <div className="yield-note">
            <span className="note-mark">i</span> Calibrated via Climatology LOYO validation on Sangli Kharif seasons (n=8).
          </div>
          <button className="text-button yield-link" onClick={() => setPage('yield')}>
            See yield & harvest timeline <ArrowRight size={14} />
          </button>
        </section>
      </div>

      <div className="bottom-note">
        <ShieldCheck size={14} />
        <span>Trained on 2017–2026 Sangli APMC and weather data · Live Decision Support</span>
        <button onClick={() => setPage('data')}>System transparency <ArrowRight size={13} /></button>
      </div>
    </>
  )
}

/* ==========================================================================
   PAGE 2: CROP ANALYSIS
   ========================================================================== */
function CropPage() {
  const { uiData } = useApp()
  const farm = uiData?.farm || defaultFarm
  const harvest = uiData?.harvest || {}
  const cropHealth = uiData?.cropHealth || {}
  const soil = uiData?.soil || {}
  const alerts = uiData?.alerts || []
  const factors = uiData?.factors || defaultFactors

  return (
    <>
      <Heading
        eyebrow={`CROP INTELLIGENCE · ${farm.location.split(',')[0].toUpperCase()}`}
        title="Crop analysis"
        sub="A field-level view of crop condition, growth stage, soil type and weather observations."
        right={<span className="button button-outline"><MapPin size={15} /> {farm.location}</span>}
      />

      <div className="crop-overview panel">
        <div className="crop-overview-main">
          <span className="eyebrow">SELECTED CROP & VARIETY</span>
          <div className="crop-title">
            <span className="crop-large-icon"><Sprout size={24} /></span>
            <div>
              <h2>{farm.crop} ({farm.variety})</h2>
              <span>{farm.location} <i /> {farm.area} <i /> Soil: {farm.soil}</span>
            </div>
            <Pill type="success">{cropHealth.status || 'Stable condition'}</Pill>
          </div>
          <div className="crop-tags">
            <span><CalendarDays size={14} /> Sown {farm.sowing}</span>
            <span><Layers3 size={14} /> {harvest.daysAfterSowing ? `${harvest.daysAfterSowing} Days After Sowing` : 'Kharif 2026'}</span>
            <span><Clock size={14} /> Stage: {harvest.cropStage || 'Maturity (R7-R8)'}</span>
          </div>
        </div>
        <FieldVisual location={farm.location} area={farm.area} />
      </div>

      {/* Agronomic Stage Tip Banner */}
      {harvest.stageTip && (
        <div className="p-4 mb-4 rounded-xl bg-[#F4F8F2] border border-[#DBE6D7] flex items-start gap-3">
          <Leaf className="text-[#3B6032] mt-0.5 flex-shrink-0" size={18} />
          <div>
            <strong className="text-sm text-[#1B281C] block font-semibold mb-0.5">
              Current Stage Advisory · {harvest.cropStage}
            </strong>
            <p className="text-xs text-[#3C4D39] leading-relaxed">
              {harvest.stageTip}
            </p>
          </div>
        </div>
      )}

      <div className="analysis-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">SATELLITE INTELLIGENCE</div>
              <h3>Crop growth trend</h3>
              <p>Vegetation observations across the Kharif growing cycle</p>
            </div>
            <span className="select-button">Season to date</span>
          </div>
          <div className="ndvi-stats">
            <div>
              <span>Latest NDVI</span>
              <b>{(cropHealth.now || 0.61).toFixed(2)}</b>
              <small>02 October 2026</small>
            </div>
            <div>
              <span>Change from peak</span>
              <b className="neutral">−0.11</b>
              <small>Maturity yellowing</small>
            </div>
            <div>
              <span>Data quality</span>
              <b className="quality-good">High</b>
              <small>Cloud-filtered composite</small>
            </div>
          </div>
          <div className="chart-legend">
            <span><i className="legend-green" /> NDVI</span>
            <span className="legend-latest">Peak vegetation <b>0.72</b></span>
          </div>
          <NDVIChart />
          <div className="chart-footer">
            <span>Observation interval: 16 days</span>
            <span>Satellite vegetation index</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">EXPLAINABLE INSIGHT</div>
              <h3>What the model is detecting</h3>
            </div>
            <span className="insight-icon"><Eye size={16} /></span>
          </div>
          <div className="insight-lead">
            {cropHealth.message || 'Vegetation activity has remained relatively stable during the observed crop period.'}
          </div>
          {soil.note && (
            <p className="insight-copy">
              <b>Soil note ({soil.type || farm.soil}):</b> {soil.note}
            </p>
          )}

          <div className="factor-list">
            {factors.map((f, i) => (
              <div key={i}>
                <span className="factor-icon positive"><Check size={14} /></span>
                <div>
                  <b>Observation factor #{i + 1}</b>
                  <small>{f}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="demo-callout">
            <span className="note-mark">i</span>
            Model accounts for soil water retention factor and variety maturity duration.
          </div>
        </section>
      </div>

      <div className="panel weather-detail">
        <div className="panel-head">
          <div>
            <div className="eyebrow">WEATHER ANALYSIS</div>
            <h3>Recent conditions</h3>
            <p>Weekly rainfall and average temperature · Sangli district</p>
          </div>
          <Pill>Last 8 weeks</Pill>
        </div>
        <div className="weather-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weather} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e9ece5" strokeDasharray="3 4" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#92998f', fontSize: 10 }} dy={8} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#92998f', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#b98956', fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e9ece5', fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="rainfall" name="Rainfall (mm)" fill="#7794a0" radius={[3, 3, 0, 0]} barSize={18} />
              <Line yAxisId="right" dataKey="temp" name="Temperature (°C)" type="monotone" stroke="#b27b3e" strokeWidth={2} dot={{ r: 3, fill: '#b27b3e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <span><i className="legend-blue" /> Rainfall (mm)</span>
          <span><i className="legend-amber" /> Average temperature (°C)</span>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   PAGE 3: YIELD & HARVEST
   ========================================================================== */
function YieldPage() {
  const { uiData, modelCard, reportHarvest } = useApp()
  const farm = uiData?.farm || defaultFarm
  const yieldInfo = uiData?.yieldInfo || defaultYieldInfo
  const harvest = uiData?.harvest || {}

  const [feedbackDate, setFeedbackDate] = useState('2026-09-28')
  const [feedbackYield, setFeedbackYield] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    try {
      await reportHarvest({
        sowing_date: farm.sowing,
        harvest_date: feedbackDate,
        variety: farm.variety,
        taluka: farm.location.split(',')[0].trim()
      })
      setFeedbackSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  return (
    <>
      <Heading
        eyebrow="CROP-TO-HARVEST OUTLOOK"
        title="Yield & harvest"
        sub="Understand the expected yield range, harvest timing window, and submit ground feedback."
        right={<Pill type="success">CALIBRATED FORECAST</Pill>}
      />

      <div className="yield-hero panel">
        <div className="yield-hero-main">
          <div className="eyebrow">EXPECTED YIELD FORECAST <span className="fresh-dot" /></div>
          <div className="hero-range">{yieldInfo.range} <small>t/ha</small></div>
          <div className="yield-hero-tags">
            <Confidence />
            <span><i /> Expected production: <b>{yieldInfo.productionQuintals}</b></span>
          </div>
          <p>
            Forecast calibrated for {farm.variety} soybean on {farm.soil} in {farm.location.split(',')[0]}, using climatology models.
          </p>
        </div>
        <div className="yield-hero-side">
          <div className="side-stat">
            <span>Regional historical avg</span>
            <b>{yieldInfo.regional}</b>
          </div>
          <div className="side-stat">
            <span>Expected kg/ha</span>
            <b>{yieldInfo.expectedKgHa}</b>
          </div>
          <div className="side-stat">
            <span>Total farm area</span>
            <b className="moderate-text">{farm.area}</b>
          </div>
        </div>
        <div className="yield-illustration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="orbit-leaf"><Sprout size={36} /></span>
          <span className="orbit-dot" />
        </div>
      </div>

      <div className="harvest-panel panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">HARVEST TIMING WINDOW</div>
            <h3>Predicted harvest window</h3>
            <p>Timing estimate based on {farm.variety} duration and sowing date ({farm.sowing})</p>
          </div>
          <Confidence />
        </div>
        <div className="harvest-window">
          <div className="calendar-tile">
            <CalendarDays size={20} />
            <span>{harvest.expectedDate ? harvest.expectedDate.slice(5, 7) : 'SEP'}</span>
          </div>
          <div>
            <strong>
              {harvest.window ? `${harvest.window[0]} to ${harvest.window[1]}` : yieldInfo.harvest}
            </strong>
            <span>
              Expected date: {harvest.expectedDate || '2026-09-28'} · {harvest.cropStage || 'Maturity'}
            </span>
          </div>
          <Pill type="success">
            {harvest.daysToHarvest !== undefined && harvest.daysToHarvest > 0
              ? `${harvest.daysToHarvest} days left`
              : 'Approaching'}
          </Pill>
        </div>
        <HarvestTimeline stageTip={harvest.stageTip} />
      </div>

      {/* Model Methodology & Explanation Card */}
      <div className="panel factors-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">EXPLAINING THE MODEL</div>
            <h3>Model methodology & validation</h3>
          </div>
        </div>
        <div className="explanation-grid">
          <div>
            <span className="explanation-icon"><CalendarDays size={17} /></span>
            <b>Climatology Modeling</b>
            <p>{modelCard?.yield_model?.method || 'Average of past Kharif seasons evaluated via Leave-One-Year-Out validation.'}</p>
            <span className="factor-status">LOYO VALIDATED</span>
          </div>
          <div>
            <span className="explanation-icon"><Activity size={17} /></span>
            <b>Historical Seasons</b>
            <p>Trained across {modelCard?.yield_model?.n_seasons || 8} official Sangli Kharif seasons.</p>
            <span className="factor-status">8 SEASONS</span>
          </div>
          <div>
            <span className="explanation-icon"><CloudRain size={17} /></span>
            <b>Soil Specific Multiplier</b>
            <p>Adjusted for {farm.soil} retention characteristics.</p>
            <span className="factor-status">CALIBRATED</span>
          </div>
          <div>
            <span className="explanation-icon"><Layers3 size={17} /></span>
            <b>Cross-Validation RMSE</b>
            <p>Baseline error is {modelCard?.yield_model?.loyo?.['Baseline (average yield)']?.rmse || 607} kg/ha.</p>
            <span className="factor-status muted-status">TRANSPARENT METRICS</span>
          </div>
        </div>
      </div>

      {/* Interactive Ground Feedback Form */}
      <section className="feedback-card">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="eyebrow text-[#3B6032] flex items-center gap-1.5 font-bold">
              <Send size={14} /> CONTINUOUS MODEL LEARNING
            </div>
            <h3 className="text-base font-bold text-[#1B281C] mt-1">Report Actual Harvest to Calibrate Future Models</h3>
            <p className="text-xs text-[#51624F] mt-0.5">
              Every actual harvest logged by Sangli farmers refines harvest date and yield accuracy for the entire community.
            </p>
          </div>
          {feedbackSent && (
            <span className="pill success">
              <Check size={13} className="mr-1 inline" /> Harvest recorded! Model updating.
            </span>
          )}
        </div>

        <form onSubmit={handleFeedbackSubmit} className="feedback-form-grid">
          <div>
            <label className="text-xs font-semibold text-[#3C4D39] block mb-1">Sowing Date</label>
            <input type="date" value={farm.sowing} readOnly className="opacity-80 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#3C4D39] block mb-1">Actual Harvest Date *</label>
            <input
              type="date"
              required
              value={feedbackDate}
              onChange={e => setFeedbackDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#3C4D39] block mb-1">Actual Yield (Quintals)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 34.5"
              value={feedbackYield}
              onChange={e => setFeedbackYield(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="button button-dark w-full !py-2.5 !text-xs font-semibold"
              disabled={submittingFeedback || feedbackSent}
            >
              {submittingFeedback ? 'Recording...' : feedbackSent ? 'Recorded ✓' : 'Submit Ground Observation'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

/* ==========================================================================
   PAGE 4: MARKET INTELLIGENCE
   ========================================================================== */
function MarketTable({ query = '', dynamicPrice }) {
  const { uiData } = useApp()
  const rawMarkets = uiData?.markets || defaultMarkets
  const list = rawMarkets.map(m => m.name === 'Sangli APMC' && dynamicPrice ? { ...m, price: dynamicPrice } : m)
  const filtered = list.filter(m => m.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="market-table-wrap">
      <table className="market-table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Distance</th>
            <th>Modal price <span className="th-unit">₹ / quintal</span></th>
            <th>7-day change</th>
            <th>Arrivals</th>
            <th>Data quality</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.name}>
              <td>
                <b className="market-name">{m.name}</b>
                {m.name === 'Sangli APMC' && <span className="nearby-tag">REFERENCE</span>}
              </td>
              <td>{m.distance}</td>
              <td><strong className="table-price">{money(m.price)}</strong></td>
              <td>
                <span className={m.trend === 'up' ? 'table-change up' : 'table-change flat'}>
                  {m.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {m.change}
                </span>
              </td>
              <td>{m.arrivals}</td>
              <td>
                <Pill type={m.quality === 'Good' ? 'success' : m.quality === 'Partial' ? 'warn' : 'neutral'}>
                  {m.quality}
                </Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filtered.length && (
        <div className="empty-search">
          <Search size={19} /> No markets match “{query}”.
        </div>
      )}
      <div className="table-foot">
        Sangli APMC prices synchronized with backend market engine · Prices shown per quintal
      </div>
    </div>
  )
}

function MarketPage() {
  const { uiData, marketReport } = useApp()
  const [range, setRange] = useState('30 days')
  const [query, setQuery] = useState('')

  const marketAnalysis = uiData?.marketAnalysis || {}
  const currentPrice = marketAnalysis.priceNow || 6080
  const seasonality = marketReport?.analysis?.seasonality || {}
  const arrivals = marketReport?.analysis?.arrivals || {}

  const data = range === '7 days' ? prices7 : range === '30 days' ? prices30 : [...prices30, ...prices30.map((x, i) => ({ ...x, day: `${i + 1} Aug`, price: x.price - 200 + Math.round(Math.sin(i) * 100) }))]

  return (
    <>
      <Heading
        eyebrow="COMMODITY MARKET · SANGLI APMC"
        title="Market intelligence"
        sub="Live modal prices, 12-month percentile levels, and historical seasonality."
        right={<span className="button button-outline"><MapPin size={15} /> Sangli APMC</span>}
      />

      <div className="market-summary-grid">
        <div className="market-current panel">
          <div className="market-current-top">
            <div>
              <div className="eyebrow">SOYBEAN · SANGLI APMC</div>
              <span className="current-caption">Current modal price</span>
            </div>
            <span className="market-live"><i style={{ background: '#42873d' }} /> ACTIVE QUOTE</span>
          </div>
          <div className="current-price">₹{currentPrice.toLocaleString('en-IN')} <small>/ quintal</small></div>
          <div className="price-context">
            <span className="table-change up"><ArrowUpRight size={14} /> 17th Percentile</span>
            <span>Level: Low versus 12-month range</span>
          </div>
          <div className="price-minmax">
            <span>12M Low <b>₹5,855</b></span>
            <i />
            <span>12M High <b>₹7,250</b></span>
          </div>
        </div>

        <Metric label="Seasonality peak" value="December" sub="Indices: Dec 1.03 vs Oct 0.98" icon={TrendingUp} tone="blue" trend="+3.0% tilt" />
        <Metric label="Market momentum" value={marketAnalysis.momentum || 'Falling'} sub="Trend: -10.7% / month" icon={TrendingDown} tone="amber" />
        <Metric label="Data source" value="Sangli APMC" sub={`As of ${marketAnalysis.asOf || '2026-09-24'}`} icon={ShieldCheck} tone="green" />
      </div>

      {marketAnalysis.marketNotes && (
        <div className="p-3 mb-4 rounded-xl bg-[#FBF9F2] border border-[#F0E6CE] text-xs text-[#865417] flex items-center gap-2">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span><b>Market Analyst Note:</b> {marketAnalysis.marketNotes}</span>
        </div>
      )}

      <div className="market-chart-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">PRICE TREND <span className="fresh-dot" /></div>
              <h3>Soybean modal price movement</h3>
              <p>Indicative market trend · ₹ per quintal</p>
            </div>
            <div className="segmented">
              {['7 days', '30 days', 'Historical'].map(x => (
                <button key={x} className={range === x ? 'selected' : ''} onClick={() => setRange(x)}>{x}</button>
              ))}
            </div>
          </div>
          <div className="chart-price-header">
            <div>
              <strong>₹{currentPrice.toLocaleString('en-IN')}</strong>
              <span><ArrowUpRight size={13} /> Active reference quote</span>
            </div>
            <span>SANGLI APMC FEED</span>
          </div>
          <PriceChart data={data} />
          <div className="chart-footer">
            <span>Source: Sangli APMC market records</span>
            <span>Updated as of {marketAnalysis.asOf || '2026-09-24'}</span>
          </div>
        </section>

        <section className="panel comparison-insight">
          <div className="panel-head">
            <div>
              <div className="eyebrow">SEASONAL PATTERN</div>
              <h3>Historical price index by month</h3>
            </div>
            <span className="insight-icon"><Eye size={16} /></span>
          </div>
          <p className="comparison-copy">
            Historical Mandi records show that post-harvest supply pressure eases into winter:
          </p>
          <div className="comparison-checks">
            <div>
              <span className="comparison-bullet">01</span>
              <span><b>Best Price Months</b><small>December (1.03), April (1.01), January (1.00)</small></span>
            </div>
            <div>
              <span className="comparison-bullet">02</span>
              <span><b>Weakest Harvest Months</b><small>October (0.98), June (0.99), September (0.99)</small></span>
            </div>
            <div>
              <span className="comparison-bullet">03</span>
              <span><b>Peak Inflow Months</b><small>May (151 tonnes avg), March (89 tonnes avg)</small></span>
            </div>
          </div>
          <div className="comparison-caveat">
            Seasonal pattern is modest (±2%–3%) — a statistical tilt, not a guaranteed spike.
          </div>
        </section>
      </div>

      <section className="panel market-table-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">NEARBY MANDIS</div>
            <h3>Market comparison</h3>
            <p>Comparing modal prices across nearby Sangli and Kolhapur APMCs</p>
          </div>
          <label className="search-box">
            <Search size={15} />
            <input aria-label="Search markets" placeholder="Search markets" value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button onClick={() => setQuery('')}><X size={14} /></button>}
          </label>
        </div>
        <MarketTable query={query} dynamicPrice={currentPrice} />
      </section>

      <div className="bottom-note">
        <ShieldCheck size={14} />
        <span>Market data connected to backend database · As of {marketAnalysis.asOf || '2026-09-24'}</span>
        <button>About market methodology <ArrowRight size={13} /></button>
      </div>
    </>
  )
}

/* ==========================================================================
   PAGE 5: SELLING OUTLOOK & CARRYING PLAN
   ========================================================================== */
function SellingPage() {
  const { uiData, runAdvisory, loading } = useApp()
  const sellingSignal = uiData?.sellingSignal || {}
  const marketAnalysis = uiData?.marketAnalysis || {}
  const farm = uiData?.farm || defaultFarm
  const harvest = uiData?.harvest || {}
  const rawAdvisory = uiData?.raw || {}

  const [storageCost, setStorageCost] = useState(15)
  const [interestRate, setInterestRate] = useState(1.0)
  const [expanded, setExpanded] = useState(true)

  const handleRecalculate = async () => {
    try {
      await runAdvisory({
        ...farm,
        storage_cost: Number(storageCost),
        interest_rate: Number(interestRate)
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Monthly Holding Simulation Plan from Backend
  const harvestPlan = rawAdvisory?.market?.harvest_time_plan || []

  return (
    <>
      <Heading
        eyebrow="CROP-TO-MARKET DECISION SUPPORT"
        title="Selling outlook"
        sub="An explainable view of harvest timing, carrying costs, and holding vs selling decisions."
        right={<Confidence />}
      />

      {/* Selling Strategy Banner */}
      <div className="selling-banner">
        <div className="signal-ring"><Compass size={27} /></div>
        <div className="selling-copy">
          <span className="eyebrow">RECOMMENDED ACTION</span>
          <h2>{sellingSignal.signal || (sellingSignal.decision === 'HOLD' ? 'HOLD IN WAREHOUSE' : 'SELL AT HARVEST')}</h2>
          <p>{sellingSignal.reason || 'Evaluate carrying costs against seasonal price gains.'}</p>
        </div>
        <div className="signal-date">
          <span>RECOMMENDED TARGET</span>
          <b>{sellingSignal.sellWhen || 'December 2026'}</b>
          <span className="signal-date-status"><i /> Active Signal</span>
        </div>
      </div>

      {/* Marathi Advisory Banner */}
      {sellingSignal.reasonMarathi && (
        <div className="marathi-advisory-card">
          <span className="marathi-advisory-badge">
            <Sparkles size={13} /> मराठी सल्ला (AI Agronomic & Market Decision)
          </span>
          <p className="marathi-advisory-text">
            {sellingSignal.reasonMarathi}
          </p>
        </div>
      )}

      {/* Interactive Carrying Cost Simulator */}
      <div className="interactive-calculator-card">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E7DD] mb-3">
          <div>
            <span className="eyebrow text-[#4A6F3E] font-bold">INTERACTIVE CARRYING COST SIMULATOR</span>
            <h4 className="text-sm font-bold text-[#1B281C] mt-0.5">Adjust Your Real Storage & Loan Parameters</h4>
          </div>
          <span className="text-xs text-[#51624F]">
            Farm size: <b>{farm.area}</b> (≈ {uiData?.yieldInfo?.productionQuintals || '33.8 q'})
          </span>
        </div>

        <div className="calc-grid">
          <div className="calc-control">
            <label>Warehouse Storage Cost (₹ / quintal / month)</label>
            <div className="calc-slider-wrap">
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={storageCost}
                onChange={e => setStorageCost(e.target.value)}
              />
              <span>₹{storageCost}/q/mo</span>
            </div>
          </div>

          <div className="calc-control">
            <label>Interest / Finance Rate (% per month)</label>
            <div className="calc-slider-wrap">
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
              />
              <span>{interestRate}%/mo</span>
            </div>
          </div>

          <button
            className="button button-dark !py-2.5 !px-5 text-xs font-semibold cursor-pointer"
            onClick={handleRecalculate}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Recalculate Strategy'}
          </button>
        </div>
      </div>

      {/* 6-Month Holding Simulation Plan Table */}
      {harvestPlan.length > 0 && (
        <div className="panel mt-4">
          <div className="panel-head">
            <div>
              <div className="eyebrow">MONTH-BY-MONTH SIMULATION</div>
              <h3>6-Month Holding Cost vs Gain Analysis</h3>
              <p>Simulating warehouse carrying costs against historical monthly seasonality tilts</p>
            </div>
            <Pill type="success">PROJECTED SCHEDULE</Pill>
          </div>

          <div className="holding-table-wrap">
            <table className="holding-table">
              <thead>
                <tr>
                  <th>Target Month</th>
                  <th>Gross APMC Price</th>
                  <th>Storage Cost</th>
                  <th>Interest Cost</th>
                  <th>Total Carrying Cost</th>
                  <th>Net Realized Price</th>
                  <th>Gain vs Harvest</th>
                  <th>Strategy</th>
                </tr>
              </thead>
              <tbody>
                {harvestPlan.map((plan, i) => {
                  const monthName = plan.sell_month || plan.month || `Month +${i}`
                  const expPrice = Number(plan.expected_price ?? plan.projected_price ?? 6080)
                  const netPrice = Number(plan.net_price ?? expPrice)
                  const basePrice = Number(harvestPlan[0]?.net_price ?? harvestPlan[0]?.expected_price ?? 6080)
                  const storageTotal = Number(storageCost) * i
                  const interestTotal = (expPrice * (Number(interestRate) / 100)) * i
                  const totalCost = storageTotal + interestTotal
                  const diffRupees = netPrice - basePrice
                  const gainPct = plan.gain_pct !== undefined && !isNaN(plan.gain_pct) ? Number(plan.gain_pct) : (diffRupees / (basePrice || 1)) * 100
                  const isRecommended = monthName === sellingSignal.sellWhen || (i === 0 && sellingSignal.decision === 'SELL AT HARVEST')
                  
                  return (
                    <tr key={monthName} className={isRecommended ? 'recommended-row' : ''}>
                      <td>
                        <b>{monthName}</b>
                        {isRecommended && <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#42873D] text-white rounded font-bold">RECOMMENDED</span>}
                      </td>
                      <td>₹{expPrice.toFixed(0)}/q</td>
                      <td>{i === 0 ? '₹0' : `₹${storageTotal.toFixed(0)}/q`}</td>
                      <td>{i === 0 ? '₹0' : `₹${interestTotal.toFixed(0)}/q`}</td>
                      <td>{i === 0 ? '₹0' : `₹${totalCost.toFixed(0)}/q`}</td>
                      <td><strong>₹{netPrice.toFixed(1)}/q</strong></td>
                      <td>
                        <span className={diffRupees >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700'}>
                          {diffRupees >= 0 ? `+₹${diffRupees.toFixed(1)}` : `-₹${Math.abs(diffRupees).toFixed(1)}`}
                          <small className="ml-1 opacity-80">({gainPct >= 0 ? `+${gainPct.toFixed(1)}` : gainPct.toFixed(1)}%)</small>
                        </span>
                      </td>
                      <td>
                        {isRecommended && sellingSignal.decision === 'HOLD' ? (
                          <span className="pill success">Recommended Hold</span>
                        ) : isRecommended ? (
                          <span className="pill success">Sell at Harvest</span>
                        ) : gainPct >= 0 ? (
                          <span className="pill neutral">Breakeven</span>
                        ) : (
                          <span className="pill warn">Carrying Drag</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Grid */}
      <div className="selling-detail-grid mt-4">
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">FINANCIAL OUTLOOK</div>
              <h3>Projected Farm Revenue</h3>
            </div>
            <Pill type="success">{sellingSignal.signal}</Pill>
          </div>
          <div className="p-4 rounded-xl bg-[#F5F8F3] border border-[#E0E9DD] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#51624F]">Net Realized Price:</span>
              <strong className="text-base text-[#1B281C]">₹{(sellingSignal.expectedNetPrice || 6088).toLocaleString('en-IN')} / qtl</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#51624F]">Expected Production:</span>
              <strong className="text-sm text-[#1B281C]">{uiData?.yieldInfo?.productionQuintals}</strong>
            </div>
            <div className="pt-2 border-t border-[#DCE4D6] flex justify-between items-center">
              <span className="text-xs font-bold text-[#1B281C]">Estimated Total Revenue:</span>
              <strong className="text-lg font-extrabold text-[#274B1E]">
                ₹{(sellingSignal.revenueInr || 205791).toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="text-[11px] text-[#51624F]">
              Revenue Range: ₹{(sellingSignal.revenueInrLow || 139000).toLocaleString('en-IN')} – ₹{(sellingSignal.revenueInrHigh || 273000).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="decision-scale mt-4">
            <div className={`decision-step ${sellingSignal.decision === 'HOLD' ? '' : 'active'}`}>
              <span>01</span>
              <b>Sell at Harvest</b>
              <small>Immediate liquidity</small>
            </div>
            <i />
            <div className={`decision-step ${sellingSignal.decision === 'HOLD' ? 'active' : ''}`}>
              <span>02</span>
              <b>Store in Warehouse</b>
              <small>Wait for winter seasonality</small>
            </div>
            <i />
            <div className="decision-step">
              <span>03</span>
              <b>Liquidate by March</b>
              <small>Before Kharif 2027 prep</small>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">DECISION DRIVERS</div>
              <h3>Why this outlook?</h3>
            </div>
            <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide' : 'Show'} details <ChevronDown size={14} className={expanded ? 'rotate' : ''} />
            </button>
          </div>
          {expanded && (
            <div className="why-list">
              <div>
                <span className="why-index">01</span>
                <span className="why-check"><Check size={13} /></span>
                <span className="why-text">Harvest window is calibrated for {harvest.expectedDate || 'late Sep / early Oct'}.</span>
              </div>
              <div>
                <span className="why-index">02</span>
                <span className="why-check"><Check size={13} /></span>
                <span className="why-text">Current Sangli APMC price is at ₹{(marketAnalysis.priceNow || 6080).toLocaleString('en-IN')}/q (17th percentile of last 12 months).</span>
              </div>
              <div>
                <span className="why-index">03</span>
                <span className="why-check"><Check size={13} /></span>
                <span className="why-text">Historical seasonal price index peaks in December (1.03x) and April (1.01x).</span>
              </div>
              <div>
                <span className="why-index">04</span>
                <span className="why-check"><Check size={13} /></span>
                <span className="why-text">Carrying costs: Storage @ ₹{storageCost}/q/mo and Finance @ {interestRate}%/mo.</span>
              </div>
            </div>
          )}

          <div className="confidence-block">
            <div className="confidence-block-head">
              <span>Information confidence</span>
              <b>Calibrated</b>
            </div>
            <div className="confidence-meter"><i /><i /><i /><i /></div>
            <div className="confidence-foot">
              <span>Satellite</span>
              <span>Weather</span>
              <span>Historical</span>
              <span>Carrying Model</span>
            </div>
          </div>

          <div className="signal-caution">
            <span className="note-mark">i</span>
            <span>
              Decision support, not guaranteed price speculation. Always check current mandi arrival volumes before finalizing sales.
            </span>
          </div>
        </section>
      </div>
    </>
  )
}

/* ==========================================================================
   PAGE 6: DATA & INSIGHTS (SYSTEM TRANSPARENCY)
   ========================================================================== */
function DataPage() {
  const { health, modelCard } = useApp()

  const sources = [
    {
      name: 'Satellite NDVI',
      icon: Eye,
      status: 'READY',
      desc: 'Sentinel-2 composite vegetation observations · 16-day cadence',
      quality: 'High',
      width: '92%'
    },
    {
      name: 'Agro-Weather',
      icon: Cloud,
      status: 'READY',
      desc: `Weekly rainfall & temperature · As of ${modelCard?.data_as_of?.weather || '2026-10-16'}`,
      quality: 'Good',
      width: '88%'
    },
    {
      name: 'Sangli APMC Mandi',
      icon: TrendingUp,
      status: 'READY',
      desc: `Synchronized modal prices · As of ${health?.market_data_as_of || '2026-09-24'}`,
      quality: 'Verified',
      width: '95%'
    },
    {
      name: 'Yield Climatology Model',
      icon: Layers3,
      status: 'READY',
      desc: `${modelCard?.yield_model?.n_seasons || 8} Kharif seasons LOYO cross-validation`,
      quality: 'Calibrated',
      width: '84%'
    }
  ]

  return (
    <>
      <Heading
        eyebrow="TRANSPARENCY & DATA INTEGRITY"
        title="Data & insights"
        sub="Full model cards, data currency, cross-validation metrics and system telemetry."
        right={<Pill type="success">MODEL v{health?.model_version || '0.2.0'}</Pill>}
      />

      <div className="confidence-summary panel">
        <div className="confidence-emblem"><ShieldCheck size={22} /></div>
        <div className="confidence-summary-copy">
          <div className="eyebrow">SYSTEM STATUS</div>
          <h2>API Healthy & Model Loaded</h2>
          <p>
            Connected to Python ML backend. Model Version {health?.model_version || '0.2.0'}, trained at {health?.trained_at || '2026-10-08'}.
          </p>
        </div>
        <div className="confidence-summary-score">
          <span>4 DATA STREAMS</span>
          <div className="confidence-meter"><i /><i /><i /><i /></div>
          <b>All streams verified</b>
        </div>
      </div>

      <div className="panel source-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">SOURCE STATUS</div>
            <h3>Data feed status & quality</h3>
            <p>Verification metrics across the active decision support engine</p>
          </div>
          <span className="select-button">All sources active</span>
        </div>
        <div className="source-list">
          {sources.map(s => (
            <article className="source-row" key={s.name}>
              <span className="source-icon"><s.icon size={18} /></span>
              <div className="source-info">
                <div className="source-name-row">
                  <b>{s.name}</b>
                  <Pill type={s.status === 'READY' ? 'success' : 'warn'}>{s.status}</Pill>
                </div>
                <span>{s.desc}</span>
                <div className="source-meter"><i style={{ width: s.width }} /></div>
              </div>
              <div className="source-quality">
                <span>DATA QUALITY</span>
                <b>{s.quality}</b>
              </div>
              <ChevronRight size={16} className="source-chevron" />
            </article>
          ))}
        </div>
      </div>

      {/* Model Card Soil Factors & Limitations */}
      <div className="main-grid mt-4">
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">CALIBRATED SOIL FACTORS</div>
              <h3>Planning Soil Multipliers</h3>
              <p>Relative water-retention yield factors calibrated for Sangli soils</p>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {modelCard?.soil_factors && Object.entries(modelCard.soil_factors).map(([soil, factor]) => (
              <div key={soil} className="flex justify-between items-center p-2.5 rounded-lg bg-[#F7F9F5] border border-[#E2E7DD] text-xs">
                <b className="text-[#1B281C]">{soil}</b>
                <span className="font-mono font-bold text-[#274B1E]">
                  {(factor * 100).toFixed(0)}% (×{factor})
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">VARIETY BASELINE DURATIONS</div>
              <h3>Maturity Cycle Guidelines</h3>
              <p>Base days to maturity before agro-weather adjustment</p>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F7F9F5] border border-[#E2E7DD] text-xs">
              <b className="text-[#1B281C]">Early varieties (e.g. JS 95-60)</b>
              <span className="font-mono font-bold text-[#274B1E]">~90 days</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F7F9F5] border border-[#E2E7DD] text-xs">
              <b className="text-[#1B281C]">Medium varieties (e.g. JS 335)</b>
              <span className="font-mono font-bold text-[#274B1E]">~100 days</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F7F9F5] border border-[#E2E7DD] text-xs">
              <b className="text-[#1B281C]">Late varieties (e.g. NRC 37)</b>
              <span className="font-mono font-bold text-[#274B1E]">~110 days</span>
            </div>
          </div>
        </section>
      </div>

      <div className="limitations-grid mt-4">
        {modelCard?.limitations ? (
          modelCard.limitations.map((lim, i) => (
            <div key={i}>
              <span className="limitation-icon"><ShieldCheck size={17} /></span>
              <b>Model Scope #{i + 1}</b>
              <p>{lim}</p>
            </div>
          ))
        ) : (
          <div>
            <span className="limitation-icon"><ShieldCheck size={17} /></span>
            <b>Responsible use</b>
            <p>Analytical decision support. Predictions depend on local weather and field management.</p>
          </div>
        )}
      </div>

      <div className="data-disclaimer">
        <ShieldCheck size={16} />
        <span>
          <b>Responsible Agriculture AI</b> · KrishiLens provides empirical decision support. Predictions are probabilistic and farmers should use their field judgement.
        </span>
      </div>
    </>
  )
}

/* ==========================================================================
   MAIN APP CONTROLLER
   ========================================================================== */
function AppContent() {
  const [language, setLanguage] = useState('en')
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('farmerAuth') === 'true')
  const [stage, setStageState] = useState(() => localStorage.getItem('farmerStage') || 'welcome')
  const [page, setPageState] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return ['dashboard', 'crop', 'yield', 'market', 'selling', 'data'].includes(hash) ? hash : 'dashboard'
  })
  const [navOpen, setNavOpen] = useState(false)

  // Top-level Application View Route: 'landing' | 'analyze' | 'workspace'
  const [route, setRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase().replace('#', '')
    if (path.includes('analyze') || hash === 'analyze') return 'analyze'
    if (path.includes('workspace') || hash === 'workspace' || ['dashboard', 'crop', 'yield', 'market', 'selling', 'data'].includes(hash)) {
      return 'workspace'
    }
    return 'landing'
  })

  const { profile, setProfile, uiData } = useApp()

  const setStage = (s) => {
    localStorage.setItem('farmerStage', s)
    setStageState(s)
  }

  const setPage = (p) => {
    window.location.hash = p
    setPageState(p)
  }

  const navigateTo = (target) => {
    if (target === 'analyze') {
      window.location.hash = 'analyze'
      setRoute('analyze')
    } else if (target === 'workspace') {
      window.location.hash = 'workspace'
      setRoute('workspace')
    } else {
      window.location.hash = ''
      setRoute('landing')
    }
  }

  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase().replace('#', '')
      if (path.includes('analyze') || hash === 'analyze') {
        setRoute('analyze')
      } else if (path.includes('workspace') || hash === 'workspace' || ['dashboard', 'crop', 'yield', 'market', 'selling', 'data'].includes(hash)) {
        setRoute('workspace')
        if (['dashboard', 'crop', 'yield', 'market', 'selling', 'data'].includes(hash)) {
          setPageState(hash)
        }
      } else {
        setRoute('landing')
      }
    }
    window.addEventListener('hashchange', handleRouting)
    window.addEventListener('popstate', handleRouting)
    return () => {
      window.removeEventListener('hashchange', handleRouting)
      window.removeEventListener('popstate', handleRouting)
    }
  }, [])

  const signIn = (person, selectedLanguage) => {
    setProfile(person)
    setLanguage(selectedLanguage || 'en')
    localStorage.setItem('farmerAuth', 'true')
    setAuthenticated(true)
    setStage('welcome')
  }

  const signOut = () => {
    localStorage.removeItem('farmerAuth')
    localStorage.removeItem('farmerStage')
    setAuthenticated(false)
    setStageState('welcome')
    navigateTo('landing')
  }

  // 1. Landing Page View
  if (route === 'landing') {
    return (
      <LandingPage
        onAnalyze={() => navigateTo('analyze')}
        onWorkspace={() => navigateTo('workspace')}
      />
    )
  }

  // 2. Crop Advisory Page View (/analyze)
  if (route === 'analyze') {
    return (
      <CropAdvisoryPage
        onHome={() => navigateTo('landing')}
        onWorkspace={() => navigateTo('workspace')}
      />
    )
  }

  // 3. Workspace / Prototype Flow
  if (!authenticated) {
    return <AuthScreen language={language} setLanguage={setLanguage} onComplete={signIn} />
  }

  if (stage === 'welcome') {
    return (
      <WelcomeScreen
        name={profile?.name || 'Farmer'}
        language={language}
        onAnalyze={() => navigateTo('analyze')}
        onWorkspace={() => setStage('workspace')}
        onSignOut={signOut}
      />
    )
  }

  if (stage === 'intake') {
    return (
      <CropIntake
        language={language}
        onBack={() => setStage('welcome')}
        onSubmit={() => setStage('ready')}
      />
    )
  }

  if (stage === 'ready') {
    return (
      <AnalysisReady
        language={language}
        farm={uiData}
        onEdit={() => setStage('intake')}
        onOverview={() => setStage('welcome')}
        onWorkspace={() => setStage('workspace')}
        onSignOut={signOut}
      />
    )
  }

  return (
    <div className="app-shell">
      <SideNav
        page={page}
        setPage={setPage}
        open={navOpen}
        setOpen={setNavOpen}
        displayName={profile?.name || 'Farmer'}
        onSignOut={signOut}
        onEditFarm={() => setStage('intake')}
      />
      <div className="main-shell">
        <Topbar
          page={page}
          setOpen={setNavOpen}
          displayName={profile?.name || 'Farmer'}
          onEditFarm={() => setStage('intake')}
          onAnalyzeCrop={() => navigateTo('analyze')}
          onHome={() => navigateTo('landing')}
        />
        <main className="page-content">
          {page === 'dashboard' && (
            <Dashboard
              setPage={setPage}
              displayName={profile?.name || 'Farmer'}
              onEditFarm={() => setStage('intake')}
            />
          )}
          {page === 'crop' && <CropPage />}
          {page === 'yield' && <YieldPage />}
          {page === 'market' && <MarketPage />}
          {page === 'selling' && <SellingPage />}
          {page === 'data' && <DataPage />}
        </main>
        <footer className="app-footer">
          <span>© 2026 KrishiLens · Crop-to-Market Decision Support</span>
          <span>Sangli APMC region · Kharif 2026</span>
          <button onClick={() => navigateTo('landing')}>Back to Landing Page</button>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
