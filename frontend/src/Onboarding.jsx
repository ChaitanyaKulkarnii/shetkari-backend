import React, { useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Crosshair,
  Leaf,
  LogOut,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sprout,
  TrendingUp
} from 'lucide-react'
import farmerIllustration from './farmer-illustration.png'
import { useApp } from './context/AppContext'

const copy = {
  en: {
    logo: 'Crop-to-Market Decision Support',
    signout: 'Sign out',
    welcomeKicker: 'AI-POWERED CROP INTELLIGENCE',
    welcomeTitle: 'Analyze your crop. Plan your harvest. Sell smarter.',
    welcomeBody: 'KrishiLens delivers tailored agronomic intelligence, yield forecasts, and Sangli mandi timing for Maharashtra soybean farmers.',
    analyze: 'Analyze Your Crop',
    time: 'Takes ~2 minutes • Calibrated for Sangli district',
    step1: 'Understand Crop Condition',
    step1d: 'Real-time vegetative vigor and growth stage intelligence.',
    step2: 'Plan Around Harvest',
    step2d: 'Calibrated harvest dates, yield ranges, and production quintals.',
    step3: 'Compare Market Options',
    step3d: 'APMC prices, storage costs vs holding gains, and selling signals.',
    trust: 'Trained on 2017–2026 Sangli Kharif observations & APMC Mandi trends',
    back: 'Back',
    formKicker: 'FARM PROFILE & ML INTAKE',
    formTitle: 'Enter your farm details',
    formBody: 'Provide your crop and soil parameters to run the Soybean ML model for your taluka.',
    farmLocation: 'Farm location',
    farmPlaceholder: 'e.g. Miraj, Sangli',
    taluka: 'Taluka in Sangli',
    talukaPlaceholder: 'Select taluka',
    crop: 'Selected crop',
    soil: 'Soil type',
    variety: 'Soybean variety',
    acres: 'Farm size (Acres)',
    sowingDate: 'Sowing date',
    storageCost: 'Storage cost (₹/q/mo)',
    interestRate: 'Interest rate (%/mo)',
    chooseCrop: 'Select a crop',
    soybean: 'Soybean',
    liveLocation: 'GPS Coordinates',
    liveHelp: 'Detect farm latitude & longitude',
    locate: 'Detect Location',
    locating: 'Locating...',
    located: 'GPS locked',
    denied: 'Location access denied. Using district center.',
    unavailable: 'GPS unavailable. Using default coordinates.',
    formNote: 'Your farm parameters run directly on our calibrated Soybean ML model.',
    submit: 'Run Crop Analysis',
    analyzing: 'Running Soybean ML Model...',
    readyKicker: 'AI ADVISORY GENERATED',
    readyTitle: 'Your crop intelligence is ready',
    readyBody: 'We have processed your farm inputs with Sangli district agro-climatic curves and APMC mandi forecasts.',
    readyCrop: 'Crop Health Status',
    readyYield: 'Expected Yield',
    readyHarvest: 'Harvest Window',
    readyDecision: 'Selling Strategy',
    edit: 'Edit farm details',
    workspace: 'Open Farm Workspace',
    readyDisclaimer: 'Calibrated for Sangli district talukas using 2017–2026 APMC and weather data.'
  },
  mr: {
    logo: 'पिकापासून बाजारापर्यंत निर्णय साहाय्य',
    signout: 'बाहेर पडा',
    welcomeKicker: 'कृषी बुद्धिमत्ता (AI)',
    welcomeTitle: 'पिकाचे विश्लेषण करा. कापणीचे नियोजन करा. नफा वाढवा.',
    welcomeBody: 'सांगली जिल्ह्यातील सोयाबीन शेतकऱ्यांसाठी कापणीची तारीख, उत्पादन अंदाज आणि बाजारभाव मार्गदर्शन.',
    analyze: 'पिकाचे विश्लेषण करा',
    time: 'फक्त २ मिनिटे • सांगली जिल्ह्यासाठी विशेष तयार',
    step1: 'पिकाची स्थिती समजून घ्या',
    step1d: 'उपग्रह निरीक्षण व वाढीचा अचूक टप्पा.',
    step2: 'कापणीचे नियोजन',
    step2d: 'अपेक्षित कापणीची तारीख व क्विंटलमध्ये उत्पादनाचा अंदाज.',
    step3: 'बाजार पर्याय तपासा',
    step3d: 'सांगली बाजार समितीचे दर आणि साठवणुकीचा नफा-तोटा.',
    trust: 'सांगली कृषी उत्पन्न बाजार समिती व २०१७-२०२६ हवामान नोंदींवर आधारित',
    back: 'मागे',
    formKicker: 'शेत माहिती व इनपुट',
    formTitle: 'तुमच्या शेताचा तपशील भरा',
    formBody: 'तुमच्या तालुक्यासाठी सोयाबीन मॉडेल चालवण्यासाठी खालील माहिती द्या.',
    farmLocation: 'शेताचे ठिकाण',
    farmPlaceholder: 'उदा. मिरज, सांगली',
    taluka: 'तालुका',
    talukaPlaceholder: 'तालुका निवडा',
    crop: 'पीक',
    soil: 'मातीचा प्रकार',
    variety: 'सोयाबीन वाण',
    acres: 'क्षेत्र (एकरात)',
    sowingDate: 'पेरणीची तारीख',
    storageCost: 'साठवणूक खर्च (₹/क्विंटल/महिना)',
    interestRate: 'व्याज दर (%/महिना)',
    chooseCrop: 'पीक निवडा',
    soybean: 'सोयाबीन',
    liveLocation: 'जीपीएस स्थान',
    liveHelp: 'अचूक अक्षांश व रेखांश मिळवा',
    locate: 'स्थान शोधा',
    locating: 'शोधत आहे...',
    located: 'जीपीएस नोंदवले',
    denied: 'परवानगी नाकारली.',
    unavailable: 'जीपीएस अनुपलब्ध.',
    formNote: 'तुमची माहिती थेट आमच्या सोयाबीन एमएल मॉडेलवर प्रक्रिया केली जाते.',
    submit: 'विश्लेषण सुरू करा',
    analyzing: 'मॉडेल चालवत आहे...',
    readyKicker: 'सल्ला तयार आहे',
    readyTitle: 'तुमचा शेती सल्ला तयार झाला आहे',
    readyBody: 'आम्ही तुमच्या शेताच्या माहितीवर सांगली हवामान व बाजारभावाच्या आधारे विश्लेषण पूर्ण केले आहे.',
    readyCrop: 'पिकाची स्थिती',
    readyYield: 'अपेक्षित उत्पादन',
    readyHarvest: 'कापणीची वेळ',
    readyDecision: 'विक्री सल्ला',
    edit: 'माहिती बदला',
    workspace: 'डॅशबोर्ड उघडा',
    readyDisclaimer: 'सांगली जिल्ह्यातील तालुक्यांसाठी तयार केलेले मॉडेल.'
  }
}

export function WelcomeScreen({ name, language, onAnalyze, onWorkspace, onSignOut }) {
  const t = copy[language] || copy.en
  return (
    <main className="flow-page" lang={language}>
      <header className="flow-header">
        <a className="flow-brand">
          <span><Sprout size={18} /></span>
          <b>KrishiLens</b>
          <small>{t.logo}</small>
        </a>
        <div className="flow-user">
          <span>{name}</span>
          <button onClick={onSignOut}><LogOut size={15} />{t.signout}</button>
        </div>
      </header>

      <section className="flow-welcome">
        <div className="flow-welcome-copy">
          <div className="flow-greeting">Welcome, {name?.split(' ')[0] || 'Farmer'}</div>
          <div className="flow-kicker"><span /><span>{t.welcomeKicker}</span></div>
          <h1>{t.welcomeTitle}</h1>
          <p>{t.welcomeBody}</p>
          <div className="flow-actions">
            <button className="flow-primary" onClick={onAnalyze}>
              {t.analyze}<ArrowRight size={17} />
            </button>
            {onWorkspace && (
              <button className="button button-outline flow-alt-btn" onClick={onWorkspace}>
                Explore demo workspace <ArrowRight size={15} />
              </button>
            )}
            <span><Check size={14} />{t.time}</span>
          </div>
        </div>

        <div className="flow-graphic">
          <div className="flow-ring ring-a" />
          <div className="flow-ring ring-b" />
          <div className="flow-center"><Sprout size={34} /></div>
          <span className="flow-graphic-label"><Leaf size={14} />Sangli Calibrated</span>
          <span className="flow-graphic-dot dot-a" />
          <span className="flow-graphic-dot dot-b" />
          <span className="flow-graphic-dot dot-c" />
        </div>
      </section>

      <section className="flow-benefits">
        <article>
          <span className="flow-benefit-icon"><Leaf size={18} /></span>
          <small>01</small>
          <h2>{t.step1}</h2>
          <p>{t.step1d}</p>
        </article>
        <article>
          <span className="flow-benefit-icon"><CalendarDays size={18} /></span>
          <small>02</small>
          <h2>{t.step2}</h2>
          <p>{t.step2d}</p>
        </article>
        <article>
          <span className="flow-benefit-icon"><TrendingUp size={18} /></span>
          <small>03</small>
          <h2>{t.step3}</h2>
          <p>{t.step3d}</p>
        </article>
      </section>

      <footer className="flow-footer">
        <ShieldCheck size={16} />
        <span>{t.trust}</span>
        <span className="flow-footer-brand">KrishiLens • Sangli District</span>
      </footer>
    </main>
  )
}

export function CropIntake({ language, onBack, onSubmit }) {
  const t = copy[language] || copy.en
  const { options, runAdvisory, loading } = useApp()

  const [taluka, setTaluka] = useState('Miraj')
  const [soil, setSoil] = useState('Medium black')
  const [variety, setVariety] = useState('medium')
  const [acres, setAcres] = useState(5)
  const [sowingDate, setSowingDate] = useState('2026-06-20')
  const [storageCost, setStorageCost] = useState(15)
  const [interestRate, setInterestRate] = useState(1)
  const [gps, setGps] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle')
  const [apiError, setApiError] = useState(null)

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGps({ latitude: coords.latitude, longitude: coords.longitude })
        setGeoStatus('located')
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    try {
      const formPayload = {
        taluka,
        crop: 'Soybean',
        sowing_date: sowingDate,
        soil,
        variety,
        acres: Number(acres),
        storage_cost: Number(storageCost),
        interest_rate: Number(interestRate)
      }
      const result = await runAdvisory(formPayload)
      onSubmit(result)
    } catch (err) {
      setApiError(err?.detail || err?.message || 'Calculation error. Please verify input values.')
    }
  }

  return (
    <main className="intake-page" lang={language}>
      <header className="flow-header">
        <a className="flow-brand">
          <span><Sprout size={18} /></span>
          <b>KrishiLens</b>
          <small>{t.logo}</small>
        </a>
        <button className="flow-back" onClick={onBack}>
          <ArrowLeft size={15} />{t.back}
        </button>
      </header>

      <div className="intake-layout">
        <section className="intake-intro">
          <div className="flow-kicker"><span className="kicker-dot" /><span>{t.formKicker}</span></div>
          <h1>{t.formTitle}</h1>
          <p>{t.formBody}</p>

          <div className="intake-steps">
            <div className="intake-step">
              <span className="intake-step-number">1</span>
              <div>
                <b>Taluka & Soil</b>
                <small>Sangli agro-climatic zone calibration</small>
              </div>
            </div>
            <div className="intake-step">
              <span className="intake-step-number">2</span>
              <div>
                <b>Crop & Sowing Date</b>
                <small>Growth curve & harvest timing prediction</small>
              </div>
            </div>
          </div>

          <div className="intake-assurance">
            <ShieldCheck size={18} />
            <span>{t.formNote}</span>
          </div>

          <div className="intake-illustration">
            <img src={farmerIllustration} alt="Farmer analyzing crops in field" />
          </div>
        </section>

        <section className="intake-card">
          <form onSubmit={handleSubmit}>
            <div className="intake-card-head">
              <span className="eyebrow">{t.formKicker}</span>
              <h2>{t.formTitle}</h2>
            </div>

            {apiError && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs">
                {apiError}
              </div>
            )}

            {/* Taluka Selector */}
            <label className="intake-field">
              <span>{t.taluka} <i>*</i></span>
              <div className="intake-input select-wrap">
                <Compass size={16} />
                <select 
                  name="taluka" 
                  required 
                  value={taluka} 
                  onChange={e => setTaluka(e.target.value)}
                >
                  {options?.talukas?.map(tal => (
                    <option key={tal} value={tal}>{tal}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="select-arrow" />
              </div>
            </label>

            {/* GPS Location Box */}
            <div className="gps-box">
              <div className="gps-copy">
                <span className="gps-icon"><Crosshair size={16} /></span>
                <span><b>{t.liveLocation}</b><small>{t.liveHelp}</small></span>
              </div>
              <button 
                className="gps-button" 
                type="button" 
                onClick={locate} 
                disabled={geoStatus === 'loading'}
              >
                {geoStatus === 'loading' ? t.locating : t.locate}
              </button>
              {gps && (
                <div className="gps-success">
                  <Check size={13} />
                  {t.located} • {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
                </div>
              )}
              {['denied', 'unavailable'].includes(geoStatus) && (
                <div className="gps-message">
                  {geoStatus === 'denied' ? t.denied : t.unavailable}
                </div>
              )}
            </div>

            {/* Soil Type */}
            <label className="intake-field">
              <span>{t.soil} <i>*</i></span>
              <div className="intake-input select-wrap">
                <Leaf size={16} />
                <select 
                  name="soil" 
                  required 
                  value={soil} 
                  onChange={e => setSoil(e.target.value)}
                >
                  {options?.soils?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="select-arrow" />
              </div>
            </label>

            {/* Soybean Variety */}
            <label className="intake-field">
              <span>{t.variety} <i>*</i></span>
              <div className="intake-input select-wrap">
                <Sprout size={16} />
                <select 
                  name="variety" 
                  required 
                  value={variety} 
                  onChange={e => setVariety(e.target.value)}
                >
                  <option value="early">Early (~90 days, e.g. JS 93-05)</option>
                  <option value="medium">Medium (~100 days, e.g. JS 335, Phule Kalyani)</option>
                  <option value="late">Late (~110 days, e.g. KDS 726 Phule Sangam)</option>
                </select>
                <ChevronDown size={15} className="select-arrow" />
              </div>
            </label>

            {/* Acres */}
            <label className="intake-field">
              <span>{t.acres} <i>*</i></span>
              <div className="intake-input">
                <input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="100" 
                  required 
                  value={acres} 
                  onChange={e => setAcres(e.target.value)}
                />
              </div>
            </label>

            {/* Sowing Date */}
            <label className="intake-field">
              <span>{t.sowingDate} <i>*</i></span>
              <div className="intake-input">
                <CalendarDays size={16} />
                <input 
                  type="date" 
                  required 
                  value={sowingDate} 
                  onChange={e => setSowingDate(e.target.value)}
                />
              </div>
            </label>

            {/* Storage cost & interest rate */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="intake-field">
                <span className="text-[11px]">{t.storageCost}</span>
                <div className="intake-input">
                  <input 
                    type="number" 
                    min="0" 
                    max="60" 
                    value={storageCost} 
                    onChange={e => setStorageCost(e.target.value)}
                  />
                </div>
              </label>
              <label className="intake-field">
                <span className="text-[11px]">{t.interestRate}</span>
                <div className="intake-input">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="5" 
                    value={interestRate} 
                    onChange={e => setInterestRate(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="intake-card-foot">
              <button type="button" className="text-back" onClick={onBack}>
                <ArrowLeft size={14} />{t.back}
              </button>
              <button type="submit" className="flow-primary" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    {t.submit}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export function AnalysisReady({ language, farm, onEdit, onOverview, onWorkspace, onSignOut }) {
  const t = copy[language] || copy.en
  const { uiData } = useApp()

  const data = uiData || farm

  return (
    <main className="flow-page" lang={language}>
      <header className="flow-header">
        <a className="flow-brand">
          <span><Sprout size={18} /></span>
          <b>KrishiLens</b>
          <small>{t.logo}</small>
        </a>
        <div className="flow-user">
          <span>{data?.farm?.location || 'Sangli'}</span>
          <button onClick={onSignOut}><LogOut size={15} />{t.signout}</button>
        </div>
      </header>

      <section className="flow-welcome">
        <div className="flow-welcome-copy">
          <div className="flow-kicker"><span /><span>{t.readyKicker}</span></div>
          <h1>{t.readyTitle}</h1>
          <p>{t.readyBody}</p>

          <div className="flow-actions">
            <button className="flow-primary" onClick={onWorkspace}>
              {t.workspace}<ArrowRight size={17} />
            </button>
            <button className="button button-outline flow-alt-btn" onClick={onEdit}>
              {t.edit}
            </button>
          </div>
        </div>

        {/* Live Model Summary Badge Card */}
        <div className="p-6 rounded-2xl bg-[#EFF4EC] border border-[#E4E8E1] space-y-4 max-w-md w-full shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E1]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#426039]">
              {data?.farm?.location} • {data?.farm?.area}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E8E1] text-[#426039] text-xs font-bold">
              Kharif 2026
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-white border border-[#E4E8E1]">
              <span className="text-[11px] text-[#5E645C] block mb-0.5">{t.readyYield}</span>
              <strong className="text-lg font-bold text-[#1F2420] block">
                {data?.yieldInfo?.range} <small className="text-xs font-normal">t/ha</small>
              </strong>
              <span className="text-[11px] text-[#426039] font-medium">
                ≈ {data?.yieldInfo?.productionQuintals} total
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E4E8E1]">
              <span className="text-[11px] text-[#5E645C] block mb-0.5">{t.readyHarvest}</span>
              <strong className="text-sm font-bold text-[#1F2420] block">
                {data?.harvest?.cropStage || 'Maturity stage'}
              </strong>
              <span className="text-[11px] text-[#5E645C]">
                {data?.harvest?.daysToHarvest > 0 
                  ? `in ${data.harvest.daysToHarvest} days` 
                  : data?.yieldInfo?.harvest}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E4E8E1] text-left">
            <span className="text-[11px] text-[#5E645C] block mb-0.5">{t.readyDecision}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                data?.sellingSignal?.decision === 'HOLD' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {data?.sellingSignal?.signal || 'SELL AT HARVEST'}
              </span>
              <span className="text-xs text-[#1F2420] font-semibold">
                Est. ₹{data?.sellingSignal?.expectedNetPrice?.toLocaleString('en-IN')}/q
              </span>
            </div>
            {data?.sellingSignal?.reason && (
              <p className="text-[11px] text-[#5E645C] mt-1.5 leading-snug">
                {data.sellingSignal.reason}
              </p>
            )}
          </div>
        </div>
      </section>

      <footer className="flow-footer">
        <ShieldCheck size={16} />
        <span>{t.readyDisclaimer}</span>
      </footer>
    </main>
  )
}
