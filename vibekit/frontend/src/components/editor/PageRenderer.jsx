import { useForm } from 'react-hook-form'
import { publicApi } from '../../lib/api'
import toast from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Mail, MapPin, Clock, Sparkles, Send, CheckCircle, Menu, X } from 'lucide-react'

/* ── Enhanced Design Tokens per Theme ────────────────────────────────────────────── */
const T = {
  minimal: { 
    bg:'#FAFAF9', surface:'#FFFFFF', text:'#1A1A1A', muted:'#6B6B6B', accent:'#1A1A1A', 
    border:'#E8E8E3', fh:"'DM Serif Display',Georgia,serif", fb:"'DM Sans',sans-serif", 
    hs:'clamp(2.5rem,6vw,4.5rem)', fw:'400', lh:'1.7', r:'0px', rc:'0px', rb:'0px', 
    bbg:'#1A1A1A', bc:'#FFFFFF', bb:'none', sh:'0 8px 24px rgba(0,0,0,0.04)', 
    sBtn:'none', sp:'5rem', ls:'-0.02em', hoverScale:'scale(1.02)', transition:'0.3s cubic-bezier(0.4,0,0.2,1)'
  },
  'neo-brutal': { 
    bg:'#FFFBEB', surface:'#FFFFFF', text:'#0A0A0A', muted:'#3D3D3D', accent:'#FF3B00', 
    border:'#0A0A0A', fh:"'Space Grotesk','Arial Black',sans-serif", fb:"'Space Grotesk',Arial,sans-serif", 
    hs:'clamp(2.75rem,7vw,5.5rem)', fw:'700', lh:'1.5', r:'0px', rc:'0px', rb:'0px', 
    bbg:'#FF3B00', bc:'#FFFFFF', bb:'2.5px solid #0A0A0A', sh:'4px 4px 0 #0A0A0A', 
    sBtn:'3px 3px 0 #0A0A0A', sp:'4.5rem', ls:'-0.01em', hoverScale:'translate(-2px,-2px)', transition:'0.1s linear'
  },
  'dark-neon': { 
    bg:'#0A0A0F', surface:'#13131A', text:'#EEEEF0', muted:'#888899', accent:'#00FF88', 
    border:'#2A2A3A', fh:"'Syne',sans-serif", fb:"'Inter',sans-serif", 
    hs:'clamp(2.5rem,6vw,5rem)', fw:'800', lh:'1.65', r:'4px', rc:'8px', rb:'4px', 
    bbg:'transparent', bc:'#00FF88', bb:'1px solid #00FF88', sh:'0 0 20px rgba(0,255,136,0.1)', 
    sBtn:'0 0 15px rgba(0,255,136,0.4)', sp:'5.5rem', ls:'0.02em', hoverScale:'scale(1.05)', transition:'0.3s ease'
  },
  'pastel-soft': { 
    bg:'#FFF8F5', surface:'#FFFFFF', text:'#2D2320', muted:'#7D6E6A', accent:'#E8756A', 
    border:'#F0E4DF', fh:"'Playfair Display',Georgia,serif", fb:"'Lato',sans-serif", 
    hs:'clamp(2.25rem,5.5vw,4.25rem)', fw:'700', lh:'1.75', r:'12px', rc:'16px', rb:'999px', 
    bbg:'#E8756A', bc:'#FFFFFF', bb:'none', sh:'0 4px 24px rgba(232,117,106,0.12)', 
    sBtn:'0 4px 14px rgba(232,117,106,0.35)', sp:'5rem', ls:'-0.01em', hoverScale:'scale(1.03)', transition:'0.3s cubic-bezier(0.34,1.56,0.64,1)'
  },
  'luxury-serif': { 
    bg:'#0F0E0C', surface:'#1A1815', text:'#F0EBE3', muted:'#9A9080', accent:'#C9A96E', 
    border:'#2E2B25', fh:"'Cormorant Garamond','Garamond',serif", fb:"'EB Garamond','Georgia',serif", 
    hs:'clamp(2.75rem,6.5vw,5rem)', fw:'300', lh:'1.8', r:'2px', rc:'4px', rb:'2px', 
    bbg:'transparent', bc:'#C9A96E', bb:'1px solid #C9A96E', sh:'0 0 0 1px rgba(201,169,110,0.2)', 
    sBtn:'none', sp:'6.5rem', ls:'0.04em', hoverScale:'scale(1.02)', transition:'0.4s ease'
  },
  'retro-pixel': { 
    bg:'#1A1C2C', surface:'#252741', text:'#E8F4EA', muted:'#9BA8B4', accent:'#F7C948', 
    border:'#4A4F6A', fh:"'Press Start 2P','Courier New',monospace", fb:"'VT323','Courier New',monospace", 
    hs:'clamp(1.4rem,3.5vw,3rem)', fw:'400', lh:'1.6', r:'0px', rc:'0px', rb:'0px', 
    bbg:'transparent', bc:'#F7C948', bb:'3px solid #F7C948', sh:'4px 4px 0 #F7C948', 
    sBtn:'4px 4px 0 #F7C948', sp:'4.5rem', ls:'0.05em', hoverScale:'translate(-3px,-3px)', transition:'0.1s step-end'
  },
}

/* ── Google Fonts loader with async loading ────────────────────────────────────────────────── */
const FONTS = {
  minimal: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&display=swap',
  'neo-brutal': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap',
  'dark-neon': 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap',
  'pastel-soft': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Lato:wght@400;700&display=swap',
  'luxury-serif': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=EB+Garamond:wght@400;500&display=swap',
  'retro-pixel': 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap',
}

function loadFont(theme) {
  const url = FONTS[theme]
  if (!url || document.querySelector(`link[href="${url}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

/* ── Animated Section Wrapper with Intersection Observer ──────────────────────────────────── */
function AnimatedSection({ children, t, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ── Hero Section with Particle Effect ──────────────────────────────────── */
function Hero({ c, t }) {
  return (
    <section style={{ background:t.bg, padding:`${t.sp} 2rem`, textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {t.accent === '#00FF88' && (
          <div style={{ position:'absolute', top:'20%', left:'10%', width:300, height:300, background:'radial-gradient(circle, rgba(0,255,136,0.1), transparent)', borderRadius:'50%', animation:'pulse 4s ease-in-out infinite' }} />
        )}
      </div>
      
      <AnimatedSection t={t} delay={0.1}>
        <h1 style={{ 
          fontFamily:t.fh, fontSize:t.hs, fontWeight:t.fw, color:t.text, 
          letterSpacing:t.ls, lineHeight:1.1, maxWidth:800, margin:'0 auto 1.25rem',
          background: t.accent === '#00FF88' ? 'linear-gradient(135deg, #00FF88, #00D4FF)' : 'none',
          WebkitBackgroundClip: t.accent === '#00FF88' ? 'text' : 'none',
          WebkitTextFillColor: t.accent === '#00FF88' ? 'transparent' : 'none',
        }}>
          {c.title || 'Your Amazing Title'}
        </h1>
      </AnimatedSection>
      
      {c.subtitle && (
        <AnimatedSection t={t} delay={0.2}>
          <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'clamp(1rem,2.5vw,1.2rem)', lineHeight:t.lh, maxWidth:560, margin:'0 auto 2.5rem' }}>
            {c.subtitle}
          </p>
        </AnimatedSection>
      )}
      
      {c.buttonText && (
        <AnimatedSection t={t} delay={0.3}>
          <a 
            href={c.buttonUrl || '#'} 
            style={{ 
              display:'inline-flex', alignItems:'center', gap:'0.75rem', fontFamily:t.fh, 
              fontWeight:600, fontSize:'1rem', padding:'0.875rem 2rem', background:t.bbg, 
              color:t.bc, border:t.bb, borderRadius:t.rb, boxShadow:t.sBtn, textDecoration:'none', 
              transition:`all ${t.transition}`, cursor:'pointer', position:'relative', overflow:'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = t.hoverScale; e.currentTarget.style.boxShadow = t.accent === '#00FF88' ? '0 0 25px rgba(0,255,136,0.6)' : t.sBtn }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = t.sBtn }}
          >
            {c.buttonText}
            <ArrowRight size={18} style={{ transition:'transform 0.3s' }} />
          </a>
        </AnimatedSection>
      )}
    </section>
  )
}

/* ── Features Section with Hover Cards ──────────────────────────────────── */
function Features({ c, t }) {
  return (
    <section id="features" style={{ background:t.bg, padding:`${t.sp} 2rem`, borderTop:`1px solid ${t.border}` }}>
      <AnimatedSection t={t} delay={0.1}>
        <h2 style={{ fontFamily:t.fh, fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:t.fw, color:t.text, textAlign:'center', letterSpacing:t.ls, marginBottom:'1rem' }}>
          {c.title || 'Features'}
        </h2>
        {c.subtitle && <p style={{ fontFamily:t.fb, color:t.muted, textAlign:'center', marginBottom:'3rem', fontSize:'1rem' }}>{c.subtitle}</p>}
      </AnimatedSection>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap:'2rem', maxWidth:1100, margin:'0 auto' }}>
        {(c.cards || []).map((card, i) => (
          <AnimatedSection key={i} t={t} delay={0.1 + i * 0.1}>
            <div 
              style={{ 
                background:t.surface, border:`1px solid ${t.border}`, borderRadius:t.rc, 
                padding:'2rem', boxShadow:t.sh, transition:`all ${t.transition}`, height:'100%',
                cursor:'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = t.hoverScale; e.currentTarget.style.boxShadow = t.accent === '#C9A96E' ? '0 8px 32px rgba(201,169,110,0.2)' : t.sh }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = t.sh }}
            >
              <div style={{ width:40, height:4, background:t.accent, borderRadius:2, marginBottom:'1.5rem' }} />
              <h3 style={{ fontFamily:t.fh, fontSize:'1.25rem', fontWeight:t.fw, color:t.text, letterSpacing:t.ls, marginBottom:'0.75rem' }}>
                {card.title}
              </h3>
              <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'0.9375rem', lineHeight:t.lh }}>
                {card.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ── Gallery Section with Lightbox Effect ───────────────────────────────── */
function Gallery({ c, t }) {
  const [selectedImg, setSelectedImg] = useState(null)

  return (
    <section id="gallery" style={{ background:t.surface, padding:`${t.sp} 2rem`, borderTop:`1px solid ${t.border}` }}>
      <AnimatedSection t={t} delay={0.1}>
        <h2 style={{ fontFamily:t.fh, fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:t.fw, color:t.text, textAlign:'center', letterSpacing:t.ls, marginBottom:'3rem' }}>
          {c.title || 'Gallery'}
        </h2>
      </AnimatedSection>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap:'1.5rem', maxWidth:1100, margin:'0 auto' }}>
        {(c.images || []).map((img, i) => (
          <AnimatedSection key={i} t={t} delay={0.1 + i * 0.05}>
            <div 
              style={{ 
                aspectRatio:'4/3', overflow:'hidden', borderRadius:t.rc, border:`1px solid ${t.border}`, 
                boxShadow:t.sh, cursor:'pointer', position:'relative', group:'true'
              }}
              onClick={() => setSelectedImg(img)}
            >
              <img 
                src={img} alt={`Gallery ${i+1}`} loading="lazy" 
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:`transform ${t.transition}` }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', transition:'background 0.3s', display:'flex', alignItems:'center', justifyContent:'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
              >
                <Sparkles size={24} style={{ color:'white', opacity:0, transition:'opacity 0.3s' }} 
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                />
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.95)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', animation:'fadeIn 0.3s ease' }}
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} alt="Lightbox" style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain', borderRadius:12 }} />
        </div>
      )}
    </section>
  )
}

/* ── Enhanced Contact Section with Animations ───────────────────────────── */
function Contact({ t, slug, isPreview }) {
  const { register, handleSubmit, reset, formState:{ errors, isSubmitting, isSubmitSuccessful } } = useForm()
  const [isSent, setIsSent] = useState(false)

  const onSubmit = async (data) => {
    if (isPreview) { 
      toast.custom((t) => (
        <div style={{ background:'linear-gradient(135deg,#7C3AED,#84CC16)', color:'white', padding:'12px 24px', borderRadius:12, boxShadow:'0 8px 20px rgba(0,0,0,0.2)', animation:'slideIn 0.3s ease' }}>
          ✨ Demo mode! Message would be sent in production
        </div>
      ))
      setIsSent(true)
      setTimeout(() => setIsSent(false), 3000)
      reset()
      return 
    }
    try { 
      await publicApi.contact(slug, data)
      setIsSent(true)
      reset()
      setTimeout(() => setIsSent(false), 3000)
      toast.success('Message sent! ✨')
    } catch (e) { 
      toast.error(e?.message || 'Failed to send')
    }
  }

  const inp = { 
    width:'100%', fontFamily:t.fb, fontSize:'0.9375rem', padding:'0.875rem 1rem', 
    background:t.surface, border:`1px solid ${errors.name ? '#ef4444' : t.border}`, 
    color:t.text, outline:'none', borderRadius:t.r, transition:'all 0.3s', 
    boxSizing:'border-box'
  }

  return (
    <section id="contact" style={{ background:t.bg, padding:`${t.sp} 2rem`, borderTop:`1px solid ${t.border}`, position:'relative' }}>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <AnimatedSection t={t} delay={0.1}>
          <h2 style={{ fontFamily:t.fh, fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:t.fw, color:t.text, textAlign:'center', letterSpacing:t.ls, marginBottom:'1rem' }}>
            Get in touch
          </h2>
          <p style={{ fontFamily:t.fb, color:t.muted, textAlign:'center', marginBottom:'3rem', fontSize:'1rem' }}>
            We'd love to hear from you
          </p>
        </AnimatedSection>

        {isSent ? (
          <AnimatedSection t={t} delay={0.2}>
            <div style={{ textAlign:'center', padding:'3rem 2rem', background:t.surface, border:`2px solid ${t.accent}`, borderRadius:t.rc, animation:'bounceIn 0.5s ease' }}>
              <CheckCircle size={48} style={{ color:t.accent, marginBottom:'1rem' }} />
              <p style={{ fontFamily:t.fb, color:t.text, fontSize:'1.125rem' }}>✓ Message received!</p>
              <p style={{ fontFamily:t.fb, color:t.muted, marginTop:'0.5rem' }}>We'll get back to you soon.</p>
            </div>
          </AnimatedSection>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.5rem' }}>
              <div>
                <label style={{ display:'block', fontFamily:t.fb, fontSize:'0.8125rem', color:t.muted, marginBottom:8, fontWeight:500 }}>Your name</label>
                <input style={inp} placeholder="John Doe" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p style={{ color:'#ef4444', fontSize:11, marginTop:6 }}>⚠️ {errors.name.message}</p>}
              </div>
              <div>
                <label style={{ display:'block', fontFamily:t.fb, fontSize:'0.8125rem', color:t.muted, marginBottom:8, fontWeight:500 }}>Email address</label>
                <input type="email" style={inp} placeholder="hello@example.com" {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                {errors.email && <p style={{ color:'#ef4444', fontSize:11, marginTop:6 }}>⚠️ {errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontFamily:t.fb, fontSize:'0.8125rem', color:t.muted, marginBottom:8, fontWeight:500 }}>Message</label>
              <textarea rows={5} style={{ ...inp, resize:'vertical' }} placeholder="Tell us about your project..." {...register('message', { required: 'Message required', minLength: { value: 10, message: 'Min 10 characters' } })} />
              {errors.message && <p style={{ color:'#ef4444', fontSize:11, marginTop:6 }}>⚠️ {errors.message.message}</p>}
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                fontFamily:t.fh, fontWeight:600, fontSize:'1rem', padding:'1rem 2rem', 
                background:t.bbg, color:t.bc, border:t.bb, borderRadius:t.rb, 
                cursor:isSubmitting ? 'wait' : 'pointer', boxShadow:t.sBtn, 
                transition:`all ${t.transition}`, display:'inline-flex', alignItems:'center', 
                gap:'0.75rem', width:'fit-content'
              }}
              onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.transform = t.hoverScale }}
              onMouseLeave={e => { if(!isSubmitting) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width:16, height:16, border:`2px solid ${t.bc}40`, borderTopColor:t.bc, borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} /> Send message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

/* ── Mobile Navigation Menu ────────────────────────────────────────────── */
function MobileNav({ t, title }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background:'none', border:'none', color:t.text, cursor:'pointer', padding:8 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isOpen && (
        <div style={{ position:'absolute', top:60, left:0, right:0, background:t.surface, borderBottom:`1px solid ${t.border}`, padding:'1rem 2rem', zIndex:100 }}>
          <nav style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {['Features','Gallery','Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily:t.fb, fontSize:'1rem', color:t.text, textDecoration:'none', padding:'0.5rem 0' }} onClick={() => setIsOpen(false)}>
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

/* ── Main Renderer with Performance Optimizations ──────────────────────── */
export default function PageRenderer({ theme = 'minimal', sections = [], title, slug, isPreview = false, viewCount }) {
  const t = T[theme] || T.minimal
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    loadFont(theme)
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [theme])

  return (
    <div style={{ minHeight:'100%', background:t.bg, color:t.text, fontFamily:t.fb, fontSize:16, lineHeight:t.lh }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.5); opacity: 0.2; }
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Sticky Header with Scroll Effect */}
      <header style={{ 
        background:t.surface, 
        borderBottom:`1px solid ${t.border}`, 
        padding:'0 2rem', 
        position:'sticky', 
        top:0, 
        zIndex:50,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        background: scrolled ? `${t.surface}CC` : t.surface,
        transition:'all 0.3s ease'
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64, maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${t.accent}, ${t.accent}80)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={16} color={t.bc === '#FFFFFF' ? '#fff' : t.text} />
            </div>
            <span style={{ fontFamily:t.fh, fontWeight:t.fw, fontSize:'1.125rem', color:t.text, letterSpacing:t.ls }}>
              {title || 'VibeKit'}
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav style={{ display:'flex', gap:'2rem', alignItems:'center' }}>
            {['Features','Gallery','Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily:t.fb, fontSize:'0.875rem', color:t.muted, textDecoration:'none', transition:'color 0.2s', position:'relative' }}
                onMouseEnter={e => { e.target.style.color = t.accent }}
                onMouseLeave={e => { e.target.style.color = t.muted }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="mobile-only" style={{ display:'none', '@media (max-width: 768px)': { display:'block' } }}>
            <MobileNav t={t} title={title} />
          </div>
        </div>
      </header>

      {/* Dynamic Sections */}
      {sorted.map((s, i) => {
        if (s.type === 'hero') return <Hero key={i} c={s.content} t={t} />
        if (s.type === 'features') return <Features key={i} c={s.content} t={t} />
        if (s.type === 'gallery') return <Gallery key={i} c={s.content} t={t} />
        if (s.type === 'contact') return <Contact key={i} t={t} slug={slug} isPreview={isPreview} />
        return null
      })}

      {/* Premium Footer */}
      <footer style={{ background:t.surface, borderTop:`1px solid ${t.border}`, padding:'3rem 2rem 2rem', textAlign:'center' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:'2rem', marginBottom:'2rem', flexWrap:'wrap' }}>
            <a href="#" style={{ color:t.muted, textDecoration:'none', fontSize:'0.875rem' }}>About</a>
            <a href="#" style={{ color:t.muted, textDecoration:'none', fontSize:'0.875rem' }}>Privacy</a>
            <a href="#" style={{ color:t.muted, textDecoration:'none', fontSize:'0.875rem' }}>Terms</a>
          </div>
          <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'0.8125rem', marginBottom:'0.5rem' }}>
            {viewCount !== undefined && `✨ ${viewCount.toLocaleString()} views · `}
            Built with <a href="/" style={{ color:t.accent, textDecoration:'none', fontWeight:600 }}>VibeKit Studio</a>
          </p>
          <p style={{ fontFamily:t.fb, color:t.muted, fontSize:'0.75rem', opacity:0.6 }}>
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}