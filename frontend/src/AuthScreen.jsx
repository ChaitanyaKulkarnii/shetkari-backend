import React, { useState } from 'react'
import { ArrowRight, CalendarDays, Check, Globe2, Leaf, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, Sprout, TrendingUp } from 'lucide-react'

const words = {
  en: { signIn:'Sign in', signUp:'Sign up', welcome:'Welcome back', signinIntro:'Sign in to view your crop-to-market outlook.', signupTitle:'Create your farmer profile', signupIntro:'First time here? Add your details to continue to the demo.', name:'Farmer name', email:'Email address', mobile:'Mobile number', password:'Password', farmerId:'Farmer ID', location:'Farm location', signInAction:'Sign in to KrishiLens', signUpAction:'Continue to demo workspace', noAccount:'New to KrishiLens?', hasAccount:'Already have a profile?', create:'Create profile', return:'Sign in instead', demoNote:'Demo only · No account is created and no details leave this browser.', workspaceNote:'Your profile details stay in this demo session; workspace information is illustrative sample data.', locationHint:'e.g. District, State', identity:'Crop-to-Market Decision Support', insight:'See your crop through a different lens.', summary:'Bring crop condition, expected harvest and market context into one clear view.', featureLabel:'WHAT KRISHILENS BRINGS TOGETHER', featureCrop:'Crop condition', featureCropNote:'Satellite observations and weather context', featureHarvest:'Expected harvest', featureHarvestNote:'A clear window with confidence context', featureMarket:'Market intelligence', featureMarketNote:'Compare nearby markets and price trends', artCaption:'SATELLITE · WEATHER · MARKET' },
  mr: { signIn:'साइन इन', signUp:'नोंदणी', welcome:'पुन्हा स्वागत', signinIntro:'तुमच्या पीक आणि बाजाराचा अंदाज पाहण्यासाठी साइन इन करा.', signupTitle:'शेतकरी प्रोफाइल तयार करा', signupIntro:'पहिल्यांदा वापरत आहात? डेमो सुरू करण्यासाठी माहिती भरा.', name:'शेतकऱ्याचे नाव', email:'ईमेल पत्ता', mobile:'मोबाईल क्रमांक', password:'पासवर्ड', farmerId:'शेतकरी आयडी', location:'शेताचे ठिकाण', signInAction:'KrishiLens मध्ये साइन इन', signUpAction:'डेमो सुरू ठेवा', noAccount:'KrishiLens वर नवीन आहात?', hasAccount:'आधीच प्रोफाइल आहे?', create:'प्रोफाइल तयार करा', return:'साइन इन करा', demoNote:'फक्त डेमो · खाते तयार होत नाही आणि माहिती या ब्राउझरबाहेर पाठवली जात नाही.', workspaceNote:'तुमची प्रोफाइल माहिती या डेमो सत्रापुरती राहते; वर्कस्पेसमधील माहिती नमुना आहे.', locationHint:'उदा. जिल्हा, राज्य', identity:'पीक ते बाजार निर्णय सहाय्य', insight:'तुमच्या पिकाकडे नव्या नजरेने पाहा.', summary:'पीक स्थिती, अपेक्षित कापणी आणि बाजार माहिती एकाच ठिकाणी.', featureLabel:'KRISHILENS काय जोडते', featureCrop:'पीक स्थिती', featureCropNote:'उपग्रह निरीक्षणे आणि हवामान संदर्भ', featureHarvest:'अपेक्षित कापणी', featureHarvestNote:'विश्वास पातळीसह अंदाजित कालावधी', featureMarket:'बाजार माहिती', featureMarketNote:'जवळच्या बाजारांची आणि किंमत कलांची तुलना', artCaption:'उपग्रह · हवामान · बाजार' },
  hi: { signIn:'साइन इन', signUp:'साइन अप', welcome:'वापसी पर स्वागत है', signinIntro:'फसल और बाज़ार का अनुमान देखने के लिए साइन इन करें।', signupTitle:'किसान प्रोफ़ाइल बनाएँ', signupIntro:'पहली बार आए हैं? डेमो के लिए अपनी जानकारी भरें।', name:'किसान का नाम', email:'ईमेल पता', mobile:'मोबाइल नंबर', password:'पासवर्ड', farmerId:'किसान आईडी', location:'खेत का स्थान', signInAction:'KrishiLens में साइन इन करें', signUpAction:'डेमो जारी रखें', noAccount:'KrishiLens पर नए हैं?', hasAccount:'पहले से प्रोफ़ाइल है?', create:'प्रोफ़ाइल बनाएँ', return:'साइन इन करें', demoNote:'केवल डेमो · कोई खाता नहीं बनेगा और जानकारी इस ब्राउज़र से बाहर नहीं जाएगी।', workspaceNote:'आपकी प्रोफ़ाइल जानकारी इस डेमो सत्र तक सीमित है; वर्कस्पेस की जानकारी उदाहरण के लिए है।', locationHint:'जैसे, ज़िला, राज्य', identity:'फसल से बाज़ार तक निर्णय सहायता', insight:'अपनी फसल को एक नए नज़रिए से देखें।', summary:'फसल की स्थिति, संभावित कटाई और बाज़ार की जानकारी एक जगह।', featureLabel:'KRISHILENS क्या जोड़ता है', featureCrop:'फसल की स्थिति', featureCropNote:'उपग्रह अवलोकन और मौसम का संदर्भ', featureHarvest:'संभावित कटाई', featureHarvestNote:'विश्वास स्तर के साथ अनुमानित अवधि', featureMarket:'बाज़ार की जानकारी', featureMarketNote:'आस-पास के बाज़ार और कीमतों की तुलना', artCaption:'उपग्रह · मौसम · बाज़ार' },
}
const languages = [{value:'en',label:'English'},{value:'mr',label:'मराठी'},{value:'hi',label:'हिन्दी'}]

function Field({label,icon:Icon,type='text',placeholder,autoComplete,name,defaultValue}) { 
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-input-wrap">
        <Icon size={18}/>
        <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder||label} autoComplete={autoComplete}/>
      </div>
    </label> 
  )
}

export default function AuthScreen({onComplete,language,setLanguage}) {
  const [mode,setMode]=useState('signin')
  const copy=words[language]

  const submit=e=>{
    e.preventDefault();
    const values=Object.fromEntries(new FormData(e.currentTarget).entries());
    onComplete({
      name: values.name?.trim() || 'Ramesh Patil',
      email: values.email?.trim() || 'ramesh.patil@krishilens.in',
      mobile: values.mobile?.trim() || '9876543210',
      farmerId: values.farmerId?.trim() || 'MH-SAN-001',
      location: values.location?.trim() || 'Miraj, Sangli'
    }, language)
  }

  const quickDemo = () => {
    onComplete({
      name: 'Ramesh Patil',
      email: 'ramesh.patil@krishilens.in',
      mobile: '9876543210',
      farmerId: 'MH-SAN-001',
      location: 'Miraj, Sangli'
    }, language)
  }

  return <main className="auth-page" lang={language}>
    <section className="auth-story">
      <div className="auth-brand"><span className="auth-brand-icon"><Sprout size={22}/></span><span>Krishi<span>Lens</span></span><i>{copy.identity}</i></div>
      <div className="auth-story-copy"><span className="auth-tag"><Leaf size={13}/>Sangli District</span><h1>{copy.insight}</h1><p>{copy.summary}</p></div>
      <div className="auth-orbit-art"><div className="art-grid"/><div className="art-orbit art-orbit-a"/><div className="art-orbit art-orbit-b"/><div className="art-field"><div/><div/><div/><div/></div><span className="art-leaf"><Sprout size={34}/></span><span className="art-star">✳</span><span className="art-coordinate">{copy.artCaption}</span></div>
      <div className="auth-sample"><span className="eyebrow">{copy.featureLabel}</span><div className="auth-features"><div><span className="auth-feature-icon"><Leaf size={15}/></span><span><b>{copy.featureCrop}</b><small>{copy.featureCropNote}</small></span></div><div><span className="auth-feature-icon"><CalendarDays size={15}/></span><span><b>{copy.featureHarvest}</b><small>{copy.featureHarvestNote}</small></span></div><div><span className="auth-feature-icon"><TrendingUp size={15}/></span><span><b>{copy.featureMarket}</b><small>{copy.featureMarketNote}</small></span></div></div></div>
      <footer className="auth-story-footer"><span>© 2026 KrishiLens</span><span>{copy.identity}</span></footer>
    </section>
    <section className="auth-main"><div className="auth-main-top"><span className="auth-mobile-brand"><Sprout size={20}/> Krishi<span>Lens</span></span><label className="language-select"><Globe2 size={16}/><select aria-label="Select language" value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(l=><option value={l.value} key={l.value}>{l.label}</option>)}</select></label></div>
      <div className="auth-card"><div className="auth-card-head"><span className="eyebrow">{copy.identity.toUpperCase()}</span><h2>{mode==='signin'?copy.welcome:copy.signupTitle}</h2><p>{mode==='signin'?copy.signinIntro:copy.signupIntro}</p></div>
        <div className="auth-tabs"><button type="button" className={mode==='signin'?'selected':''} onClick={()=>setMode('signin')}>{copy.signIn}</button><button type="button" className={mode==='signup'?'selected':''} onClick={()=>setMode('signup')}>{copy.signUp}</button></div>
        <form className="auth-form" onSubmit={submit}>
          {mode==='signup'&&<Field name="farmerId" label={copy.farmerId} icon={ShieldCheck} defaultValue="MH-SAN-001" placeholder="e.g. MH-SAN-0001" autoComplete="off"/>}
          <Field name="name" label={copy.name} icon={Leaf} defaultValue="Ramesh Patil" autoComplete="name"/>
          {mode==='signup'&&<Field name="mobile" label={copy.mobile} icon={Phone} type="tel" defaultValue="9876543210" autoComplete="tel" placeholder="+91 00000 00000"/>}
          <Field name="email" label={copy.email} icon={Mail} type="email" defaultValue="ramesh.patil@krishilens.in" autoComplete="email"/>
          {mode==='signin'&&<><Field name="mobile" label={copy.mobile} icon={Phone} type="tel" defaultValue="9876543210" autoComplete="tel" placeholder="+91 00000 00000"/><Field name="password" label={copy.password} icon={LockKeyhole} type="password" defaultValue="password123" autoComplete="current-password"/></>}
          {mode==='signup'&&<><Field name="location" label={copy.location} icon={MapPin} defaultValue="Miraj, Sangli" placeholder={copy.locationHint} autoComplete="address-level2"/><div className="auth-demo-note"><span className="note-mark">i</span>{copy.workspaceNote}</div></>}
          <button className="auth-submit cursor-pointer" type="submit">{mode==='signin'?copy.signInAction:copy.signUpAction}<ArrowRight size={18}/></button>
          <button type="button" className="button button-outline w-full !py-2.5 !text-xs font-semibold mt-2 cursor-pointer" onClick={quickDemo}>
            ⚡ One-Click Demo Access
          </button>
        </form>
        <div className="auth-switch">{mode==='signin'?<>{copy.noAccount} <button onClick={()=>setMode('signup')}>{copy.create}</button></>:<>{copy.hasAccount} <button onClick={()=>setMode('signin')}>{copy.return}</button></>}</div>
        <div className="auth-privacy"><Check size={15}/>{copy.demoNote}</div>
      </div><div className="auth-foot-mobile">KrishiLens · {copy.identity}</div>
    </section>
  </main>
}


