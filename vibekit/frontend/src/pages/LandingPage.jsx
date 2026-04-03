import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Globe, Lock, Layers, Palette, Eye } from 'lucide-react'
import { useAuthStore } from '../store/auth'

/* ── Vanta NET hero background ─────────────────────────────────────────── */
function VantaHero() {
  const ref = useRef(null)
  const fx  = useRef(null)
  useEffect(() => {
    if (!fx.current && window.VANTA?.NET) {
      fx.current = window.VANTA.NET({
        el: ref.current,
        mouseControls: true, touchControls: true, gyroControls: false,
        color: 0x7c3aed, backgroundColor: 0x0a0a0f,
        points: 12, maxDistance: 22, spacing: 18, showDots: true,
      })
    }
    return () => { fx.current?.destroy(); fx.current = null }
  }, [])
  return <div ref={ref} className="absolute inset-0 z-0" />
}

/* ── Theme preview mini cards ──────────────────────────────────────────── */
const PREVIEWS = [
  { id:'minimal',       name:'Minimal',     bg:'#FAFAF9', accent:'#1A1A1A', btnBg:'transparent', btnBorder:'1.5px solid #1A1A1A', btnColor:'#1A1A1A', r:'0px',    shadow:'none' },
  { id:'neo-brutal',    name:'Neo-Brutal',  bg:'#FFFBEB', accent:'#FF3B00', btnBg:'#FF3B00',     btnBorder:'2.5px solid #0A0A0A', btnColor:'#fff',    r:'0px',    shadow:'3px 3px 0 #0A0A0A' },
  { id:'dark-neon',     name:'Dark/Neon',   bg:'#0A0A0F', accent:'#00FF88', btnBg:'transparent', btnBorder:'1px solid #00FF88',   btnColor:'#00FF88', r:'4px',    shadow:'0 0 12px rgba(0,255,136,0.4)' },
  { id:'pastel-soft',   name:'Pastel',      bg:'#FFF8F5', accent:'#E8756A', btnBg:'#E8756A',     btnBorder:'none',                btnColor:'#fff',    r:'999px',  shadow:'0 4px 12px rgba(232,117,106,0.3)' },
  { id:'luxury-serif',  name:'Luxury',      bg:'#0F0E0C', accent:'#C9A96E', btnBg:'transparent', btnBorder:'1px solid #C9A96E',   btnColor:'#C9A96E', r:'2px',    shadow:'none' },
  { id:'retro-pixel',   name:'Retro/Pixel', bg:'#1A1C2C', accent:'#F7C948', btnBg:'transparent', btnBorder:'3px solid #F7C948',   btnColor:'#F7C948', r:'0px',    shadow:'3px 3px 0 #F7C948' },
]

function ThemeCard({ t, index }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const id = setTimeout(() => setVis(true), index * 100); return () => clearTimeout(id) }, [index])
  const textColor = ['dark-neon','luxury-serif','retro-pixel'].includes(t.id) ? '#eee' : '#111'
  return (
    <div className="card card-hover flex-shrink-0" style={{ width:220, opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(20px)', transition:'all 0.5s ease' }}>
      <div style={{ background:t.bg, padding:18, minHeight:160 }}>
        <div style={{ background:t.accent, height:3, width:32, borderRadius:2, marginBottom:10 }} />
        <p style={{ color:textColor, fontSize:13, fontWeight:700, marginBottom:5 }}>Page Title</p>
        <p style={{ color:textColor, fontSize:10, opacity:0.55, marginBottom:12, lineHeight:1.4 }}>A compelling subtitle for your page</p>
        <button style={{ background:t.btnBg, color:t.btnColor, border:t.btnBorder, borderRadius:t.r, padding:'5px 12px', fontSize:10, fontWeight:700, cursor:'default', boxShadow:t.shadow }}>Get Started</button>
        <div style={{ display:'flex', gap:5, marginTop:12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex:1, background:textColor==='#eee'?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)', border:`1px solid ${t.accent}22`, borderRadius:t.r==='999px'?6:2, padding:6 }}>
              <div style={{ background:t.accent, height:2, width:14, borderRadius:1 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'10px 14px' }}>
        <p style={{ fontSize:12, fontWeight:700, fontFamily:'var(--font-display)', color:'#F0EEF8' }}>{t.name}</p>
      </div>
    </div>
  )
}

/* ── Features grid ─────────────────────────────────────────────────────── */
const FEATURES = [
  { icon:Palette, title:'6 Vibe Presets',     desc:'Full CSS design tokens per theme — colors, typography, spacing, buttons. Preview = published, always.', color:'#7C3AED' },
  { icon:Layers,  title:'Live Page Builder',  desc:'Edit sections, reorder them, toggle Desktop/Tablet/Mobile preview width. Auto-saves while you type.', color:'#00FF88' },
  { icon:Globe,   title:'Instant Publish',    desc:'One click gets you a public URL. Share it anywhere. Unpublish or edit at any time.',                    color:'#F97316' },
  { icon:Eye,     title:'Analytics Built-in', desc:'View counts with deduplication, unique visitors, referrer breakdown — all stored in PostgreSQL.',        color:'#F7C948' },
  { icon:Lock,    title:'Secure by Default',  desc:'JWT in httpOnly cookies, bcrypt passwords, Zod validation, rate limiting, ownership checks on every API call.', color:'#A78BFA' },
  { icon:Zap,     title:'Blazing Fast',       desc:'Serverless Netlify Functions, CDN-cached public pages, pg connection pooling, optimised indexes.',       color:'#84CC16' },
]

/* ── Navbar ────────────────────────────────────────────────────────────── */
function Navbar() {
  const { user } = useAuthStore()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: scrolled ? 'rgba(10,10,15,0.9)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
      <div className="container-app">
        <div className="flex items-center justify-between" style={{ height:64 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7C3AED,#84CC16)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'#fff' }}>V</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'#F0EEF8', letterSpacing:'-0.02em' }}>VibeKit<span style={{ color:'#7C3AED' }}>.</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#themes"   style={{ color:'#A8A5BE', fontSize:14, textDecoration:'none', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#A8A5BE'}>Themes</a>
            <a href="#features" style={{ color:'#A8A5BE', fontSize:14, textDecoration:'none', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#A8A5BE'}>Features</a>
            {user
              ? <Link to="/app" className="btn btn-primary btn-sm">Dashboard</Link>
              : <div className="flex items-center gap-3"><Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link><Link to="/signup" className="btn btn-primary btn-sm">Get started</Link></div>
            }
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden btn btn-ghost btn-sm" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <div className="flex flex-col gap-1.5" style={{ width:20 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display:'block', height:2, background:'#A8A5BE', borderRadius:2, transition:'all 0.2s',
                  transform: menuOpen && i===0 ? 'rotate(45deg) translateY(6px)' : menuOpen && i===2 ? 'rotate(-45deg) translateY(-6px)' : 'none',
                  opacity:   menuOpen && i===1 ? 0 : 1 }} />
              ))}
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden glass" style={{ borderRadius:12, marginBottom:12, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            <a href="#themes"   style={{ color:'#A8A5BE', fontSize:15, textDecoration:'none' }} onClick={() => setMenuOpen(false)}>Themes</a>
            <a href="#features" style={{ color:'#A8A5BE', fontSize:15, textDecoration:'none' }} onClick={() => setMenuOpen(false)}>Features</a>
            {user
              ? <Link to="/app" className="btn btn-primary">Dashboard</Link>
              : <><Link to="/login" className="btn btn-secondary">Sign in</Link><Link to="/signup" className="btn btn-primary">Get started free</Link></>
            }
          </div>
        )}
      </div>
    </nav>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuthStore()

  return (
    <div style={{ background:'#0A0A0F', minHeight:'100vh' }}>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ minHeight:'100vh', display:'flex', alignItems:'center' }}>
        <VantaHero />
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(124,58,237,0.18), transparent 70%)' }} />

        <div className="container-app relative z-20 text-center" style={{ paddingTop:100, paddingBottom:80 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:24, opacity:0, animation:'fadeUp 0.6s ease 0.1s forwards' }} className="badge badge-violet">
            <Zap size={11} /> Build · Theme · Publish in minutes
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.75rem,8vw,6.5rem)', fontWeight:700, lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:'1.5rem', opacity:0, animation:'fadeUp 0.7s ease 0.2s forwards' }}>
            Generate a <span className="gradient-text">vibe</span>.<br />
            Build your <span className="gradient-text-coral">mini-site</span>.<br />
            Publish it.
          </h1>

          <p style={{ color:'#A8A5BE', fontSize:'clamp(1rem,2.5vw,1.25rem)', lineHeight:1.65, maxWidth:560, margin:'0 auto 2.5rem', opacity:0, animation:'fadeUp 0.6s ease 0.35s forwards' }}>
            Choose from 6 stunning theme presets, build with a live editor, and get a public URL that looks polished and loads fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity:0, animation:'fadeUp 0.6s ease 0.5s forwards' }}>
            <Link to={user ? '/app' : '/signup'} className="btn btn-primary btn-xl">
              {user ? 'Go to Dashboard' : 'Create your first page'} <ArrowRight size={18} />
            </Link>
            <a href="#themes" className="btn btn-secondary btn-xl">Browse themes</a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10" style={{ opacity:0, animation:'fadeUp 0.6s ease 0.65s forwards' }}>
            {['No credit card','Free to start','Instant publish'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#84CC16' }} />
                <span style={{ color:'#A8A5BE', fontSize:13 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2" style={{ opacity:0, animation:'fadeIn 1s ease 1.2s forwards' }}>
          <span style={{ color:'#A8A5BE', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' }}>Scroll</span>
          <div className="animate-float" style={{ width:1, height:36, background:'linear-gradient(to bottom,#7C3AED,transparent)' }} />
        </div>
      </section>

      {/* THEMES */}
      <section id="themes" style={{ padding:'7rem 0', background:'#0D0D14' }}>
        <div className="container-app">
          <div className="text-center mb-14">
            <span className="badge badge-violet mb-4">Theme System</span>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:700, letterSpacing:'-0.03em', marginBottom:'1rem' }}>
              6 Vibe Presets.<br /><span className="gradient-text">Infinite possibilities.</span>
            </h2>
            <p style={{ color:'#A8A5BE', fontSize:'1.0625rem', maxWidth:480, margin:'0 auto', lineHeight:1.65 }}>
              Every preset ships with full CSS design tokens. Preview and published pages always match exactly.
            </p>
          </div>
          <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:16, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {PREVIEWS.map((t, i) => <ThemeCard key={t.id} t={t} index={i} />)}
          </div>
          <div className="text-center mt-10">
            <Link to={user ? '/app' : '/signup'} className="btn btn-primary btn-lg">
              Start building with a theme <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:'7rem 0' }}>
        <div className="container-app">
          <div className="text-center mb-14">
            <span className="badge badge-violet mb-4">Everything you need</span>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.25rem)', fontWeight:700, letterSpacing:'-0.03em' }}>
              Built for builders.<br /><span className="gradient-text">Designed for makers.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="glass glass-hover" style={{ borderRadius:16, padding:28, opacity:0, animation:`fadeUp 0.5s ease ${i*0.08}s forwards` }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${f.color}20`, border:`1px solid ${f.color}35`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <f.icon size={20} style={{ color:f.color }} />
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, marginBottom:8, letterSpacing:'-0.02em' }}>{f.title}</h3>
                <p style={{ color:'#A8A5BE', fontSize:14, lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'6rem 0' }}>
        <div className="container-app">
          <div className="relative overflow-hidden" style={{ borderRadius:24, background:'linear-gradient(135deg,#13131F,#1a1028,#0f1a0f)', border:'1px solid rgba(124,58,237,0.25)', padding:'clamp(3rem,6vw,5rem)', textAlign:'center' }}>
            <div style={{ position:'absolute', top:'-50%', left:'50%', transform:'translateX(-50%)', width:600, height:400, background:'radial-gradient(ellipse, rgba(124,58,237,0.2), transparent 70%)', pointerEvents:'none' }} />
            <div className="relative z-10">
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:700, letterSpacing:'-0.03em', marginBottom:'1.25rem' }}>
                Ready to build your<br /><span className="gradient-text">perfect mini-site?</span>
              </h2>
              <p style={{ color:'#A8A5BE', fontSize:'1.0625rem', maxWidth:440, margin:'0 auto 2.5rem', lineHeight:1.65 }}>
                Create your first themed page in under 5 minutes.
              </p>
              <Link to={user ? '/app' : '/signup'} className="btn btn-lime btn-xl">
                {user ? 'Open Dashboard' : "Get started — it's free"} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'2.5rem 0' }}>
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#7C3AED,#84CC16)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>V</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'#A8A5BE', fontSize:14 }}>VibeKit Studio</span>
          </div>
          <p style={{ color:'#4A4A5A', fontSize:13 }}>Built for the Purple Merit Full Stack Vibe Coder Internship</p>
        </div>
      </footer>
    </div>
  )
}
