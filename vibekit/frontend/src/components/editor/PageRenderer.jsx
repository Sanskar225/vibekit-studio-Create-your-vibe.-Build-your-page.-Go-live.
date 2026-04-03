import { useForm } from 'react-hook-form'
import { publicApi } from '../../lib/api'
import toast from 'react-hot-toast'

/* ── Design tokens per theme ────────────────────────────────────────────── */
const T = {
  minimal:      { bg:'#FAFAF9', surface:'#FFFFFF', text:'#1A1A1A', muted:'#6B6B6B', accent:'#1A1A1A', border:'#E8E8E3', fh:"'DM Serif Display',Georgia,serif", fb:"'DM Sans',sans-serif", hs:'clamp(2.5rem,6vw,4.5rem)', fw:'400', lh:'1.7', r:'0px', rc:'0px', rb:'0px', bbg:'transparent', bc:'#1A1A1A', bb:'1.5px solid #1A1A1A', sh:'none', sBtn:'none', sp:'5rem', ls:'-0.02em' },
  'neo-brutal': { bg:'#FFFBEB', surface:'#FFFFFF', text:'#0A0A0A', muted:'#3D3D3D', accent:'#FF3B00', border:'#0A0A0A', fh:"'Space Grotesk','Arial Black',sans-serif", fb:"'Space Grotesk',Arial,sans-serif", hs:'clamp(2.75rem,7vw,5.5rem)', fw:'700', lh:'1.5', r:'0px', rc:'0px', rb:'0px', bbg:'#FF3B00', bc:'#FFFFFF', bb:'2.5px solid #0A0A0A', sh:'4px 4px 0 #0A0A0A', sBtn:'3px 3px 0 #0A0A0A', sp:'4.5rem', ls:'-0.01em' },
  'dark-neon':  { bg:'#0A0A0F', surface:'#13131A', text:'#EEEEF0', muted:'#888899', accent:'#00FF88', border:'#2A2A3A', fh:"'Syne',sans-serif", fb:"'Inter',sans-serif", hs:'clamp(2.5rem,6vw,5rem)', fw:'800', lh:'1.65', r:'4px', rc:'8px', rb:'4px', bbg:'transparent', bc:'#00FF88', bb:'1px solid #00FF88', sh:'0 0 20px rgba(0,255,136,0.1)', sBtn:'0 0 15px rgba(0,255,136,0.4)', sp:'5.5rem', ls:'0.02em' },
  'pastel-soft':{ bg:'#FFF8F5', surface:'#FFFFFF', text:'#2D2320', muted:'#7D6E6A', accent:'#E8756A', border:'#F0E4DF', fh:"'Playfair Display',Georgia,serif", fb:"'Lato',sans-serif", hs:'clamp(2.25rem,5.5vw,4.25rem)', fw:'700', lh:'1.75', r:'12px', rc:'16px', rb:'999px', bbg:'#E8756A', bc:'#FFFFFF', bb:'none', sh:'0 4px 24px rgba(232,117,106,0.12)', sBtn:'0 4px 14px rgba(232,117,106,0.35)', sp:'5rem', ls:'-0.01em' },
  'luxury-serif':{ bg:'#0F0E0C', surface:'#1A1815', text:'#F0EBE3', muted:'#9A9080', accent:'#C9A96E', border:'#2E2B25', fh:"'Cormorant Garamond','Garamond',serif", fb:"'EB Garamond','Georgia',serif", hs:'clamp(2.75rem,6.5vw,5rem)', fw:'300', lh:'1.8', r:'2px', rc:'4px', rb:'2px', bbg:'transparent', bc:'#C9A96E', bb:'1px solid #C9A96E', sh:'0 0 0 1px rgba(201,169,110,0.2)', sBtn:'none', sp:'6.5rem', ls:'0.04em' },
  'retro-pixel':{ bg:'#1A1C2C', surface:'#252741', text:'#E8F4EA', muted:'#9BA8B4', accent:'#F7C948', border:'#4A4F6A', fh:"'Press Start 2P','Courier New',monospace", fb:"'VT323','Courier New',monospace", hs:'clamp(1.4rem,3.5vw,3rem)', fw:'400', lh:'1.6', r:'0px', rc:'0px', rb:'0px', bbg:'transparent', bc:'#F7C948', bb:'3px solid #F7C948', sh:'4px 4px 0 #F7C948', sBtn:'4px 4px 0 #F7C948', sp:'4.5rem', ls:'0.05em' },
}

/* ── Google Fonts loader ────────────────────────────────────────────────── */
const FONTS = {
  minimal:       'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap',
  'neo-brutal':  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap',
  'dark-neon':   'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500&display=swap',
  'pastel-soft': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Lato:wght@400;700&display=swap',
  'luxury-serif':'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=EB+Garamond:wght@400&display=swap',
  'retro-pixel': 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap',
}
function loadFont(theme) {
  const url = FONTS[theme]; if (!url || document.querySelector(`link[href="${url}"]`)) return
  const l = document.createElement('link'); l.rel='stylesheet'; l.href=url; document.head.appendChild(l)
}

/* ── Section: Hero ──────────────────────────────────────────────────────── */
function Hero({ c, t }) {
  return (
    <section style={{ background:t.bg, padding:`${t.sp} 2rem`, textAlign:'center' }}>
      <h1 style={{ fontFamily:t.fh, fontSize:t.hs, fontWeight:t.fw, color:t.text, letterSpacing:t.ls, lineHeight:1.1, maxWidth:800, margin:'0 auto 1.25rem' }}>{c.title||'Page Title'}</h1>
      {c.subtitle && <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'clamp(1rem,2.5vw,1.2rem)', lineHeight:t.lh, maxWidth:560, margin:'0 auto 2.5rem' }}>{c.subtitle}</p>}
      {c.buttonText && (
        <a href={c.buttonUrl||'#'} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', fontFamily:t.fh, fontWeight:600, fontSize:'1rem', padding:'0.875rem 2rem', background:t.bbg, color:t.bc, border:t.bb, borderRadius:t.rb, boxShadow:t.sBtn, textDecoration:'none', transition:'all 0.2s', cursor:'pointer' }}>
          {c.buttonText}
        </a>
      )}
    </section>
  )
}

/* ── Section: Features ──────────────────────────────────────────────────── */
function Features({ c, t }) {
  return (
    <section id="features" style={{ background:t.bg, padding:`${t.sp} 2rem`, borderTop:`1px solid ${t.border}` }}>
      <h2 style={{ fontFamily:t.fh, fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:t.fw, color:t.text, textAlign:'center', letterSpacing:t.ls, marginBottom:'3rem' }}>Features</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap:'1.25rem', maxWidth:900, margin:'0 auto' }}>
        {(c.cards||[]).map((card,i) => (
          <div key={i} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:t.rc, padding:'2rem', boxShadow:t.sh }}>
            <div style={{ width:32, height:4, background:t.accent, borderRadius:2, marginBottom:'1.25rem' }} />
            <h3 style={{ fontFamily:t.fh, fontSize:'1.125rem', fontWeight:t.fw, color:t.text, letterSpacing:t.ls, marginBottom:'0.75rem' }}>{card.title}</h3>
            <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'0.9375rem', lineHeight:t.lh }}>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Section: Gallery ───────────────────────────────────────────────────── */
function Gallery({ c, t }) {
  return (
    <section style={{ background:t.surface, padding:`${t.sp} 2rem`, borderTop:`1px solid ${t.border}` }}>
      <h2 style={{ fontFamily:t.fh, fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:t.fw, color:t.text, textAlign:'center', letterSpacing:t.ls, marginBottom:'3rem' }}>Gallery</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap:'1rem', maxWidth:960, margin:'0 auto' }}>
        {(c.images||[]).map((img,i) => (
          <div key={i} style={{ aspectRatio:'4/3', overflow:'hidden', borderRadius:t.rc, border:`1px solid ${t.border}`, boxShadow:t.sh }}>
            <img src={img} alt={`Gallery ${i+1}`} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s ease' }}
              onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
              onMouseLeave={e=>e.target.style.transform='scale(1)'}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Section: Contact ───────────────────────────────────────────────────── */
function Contact({ t, slug, isPreview }) {
  const { register, handleSubmit, reset, formState:{ errors, isSubmitting, isSubmitSuccessful } } = useForm()
  const onSubmit = async (data) => {
    if (isPreview) { toast.success('Contact form works! (preview — not stored)'); return }
    try { await publicApi.contact(slug, data); reset() } catch (e) { toast.error(e?.message||'Failed to send') }
  }
  const inp = { width:'100%', fontFamily:t.fb, fontSize:'0.9375rem', padding:'0.75rem 1rem', background:t.surface, border:`1px solid ${t.border}`, color:t.text, outline:'none', borderRadius:t.r, transition:'border-color 0.2s', boxSizing:'border-box' }
  return (
    <section id="contact" style={{ background:t.bg, padding:`${t.sp} 2rem`, borderTop:`1px solid ${t.border}` }}>
      <div style={{ maxWidth:560, margin:'0 auto' }}>
        <h2 style={{ fontFamily:t.fh, fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:t.fw, color:t.text, textAlign:'center', letterSpacing:t.ls, marginBottom:'2.5rem' }}>Get in touch</h2>
        {isSubmitSuccessful && !isPreview ? (
          <div style={{ textAlign:'center', padding:'2rem', background:t.surface, border:`1px solid ${t.accent}`, borderRadius:t.rc }}>
            <p style={{ fontFamily:t.fb, color:t.accent }}>✓ Message received! We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
              <div>
                <label style={{ display:'block', fontFamily:t.fb, fontSize:'0.8125rem', color:t.muted, marginBottom:6 }}>Name</label>
                <input style={inp} placeholder="Your name" {...register('name',{required:true})} />
                {errors.name && <p style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>Required</p>}
              </div>
              <div>
                <label style={{ display:'block', fontFamily:t.fb, fontSize:'0.8125rem', color:t.muted, marginBottom:6 }}>Email</label>
                <input type="email" style={inp} placeholder="you@email.com" {...register('email',{required:true,pattern:/\S+@\S+\.\S+/})} />
                {errors.email && <p style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>Valid email required</p>}
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontFamily:t.fb, fontSize:'0.8125rem', color:t.muted, marginBottom:6 }}>Message</label>
              <textarea rows={4} style={{ ...inp, resize:'vertical' }} placeholder="Your message…" {...register('message',{required:true,minLength:10})} />
              {errors.message && <p style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>Min 10 characters</p>}
            </div>
            <button type="submit" disabled={isSubmitting} style={{ fontFamily:t.fh, fontWeight:600, fontSize:'1rem', padding:'0.875rem 2rem', background:t.bbg, color:t.bc, border:t.bb, borderRadius:t.rb, cursor:isSubmitting?'wait':'pointer', boxShadow:t.sBtn, transition:'all 0.2s', alignSelf:'flex-start' }}>
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

/* ── Main renderer ──────────────────────────────────────────────────────── */
export default function PageRenderer({ theme='minimal', sections=[], title, slug, isPreview=false, viewCount }) {
  const t = T[theme] || T.minimal
  loadFont(theme)
  const sorted = [...sections].sort((a,b) => a.order - b.order)

  return (
    <div style={{ minHeight:'100%', background:t.bg, color:t.text, fontFamily:t.fb, fontSize:16, lineHeight:t.lh }}>
      {/* Nav */}
      <header style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:'0 2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:60, maxWidth:1200, margin:'0 auto' }}>
          <span style={{ fontFamily:t.fh, fontWeight:t.fw, fontSize:'1.125rem', color:t.text, letterSpacing:t.ls }}>{title||'Page'}</span>
          <nav style={{ display:'flex', gap:'1.5rem' }}>
            {['Features','Gallery','Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily:t.fb, fontSize:'0.875rem', color:t.muted, textDecoration:'none' }}>{item}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* Sections */}
      {sorted.map((s,i) => {
        if (s.type==='hero')     return <Hero     key={i} c={s.content} t={t} />
        if (s.type==='features') return <Features key={i} c={s.content} t={t} />
        if (s.type==='gallery')  return <Gallery  key={i} c={s.content} t={t} />
        if (s.type==='contact')  return <Contact  key={i} t={t} slug={slug} isPreview={isPreview} />
        return null
      })}

      {/* Footer */}
      <footer style={{ background:t.surface, borderTop:`1px solid ${t.border}`, padding:'2rem', textAlign:'center' }}>
        <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'0.8125rem' }}>
          {viewCount !== undefined && `${viewCount} views · `}
          Built with <a href="/" style={{ color:t.accent, textDecoration:'none' }}>VibeKit Studio</a>
        </p>
      </footer>
    </div>
  )
}
