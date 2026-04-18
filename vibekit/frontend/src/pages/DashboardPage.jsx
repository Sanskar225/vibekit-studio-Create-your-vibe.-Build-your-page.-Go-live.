import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Trash2, Eye, Globe, FileText, Zap, LogOut, ChevronRight, Sparkles, TrendingUp, Clock, Star } from 'lucide-react'
import { pagesApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

const THEMES = [
  { id:'minimal',      name:'Minimal',    color:'#1A1A1A', bg:'#FAFAF9', gradient:'linear-gradient(135deg,#1A1A1A,#404040)' },
  { id:'neo-brutal',   name:'Neo-Brutal', color:'#FF3B00', bg:'#FFFBEB', gradient:'linear-gradient(135deg,#FF3B00,#FF6B3D)' },
  { id:'dark-neon',    name:'Dark/Neon',  color:'#00FF88', bg:'#0A0A0F', gradient:'linear-gradient(135deg,#00FF88,#00D4FF)' },
  { id:'pastel-soft',  name:'Pastel',     color:'#E8756A', bg:'#FFF8F5', gradient:'linear-gradient(135deg,#E8756A,#F5A97F)' },
  { id:'luxury-serif', name:'Luxury',     color:'#C9A96E', bg:'#0F0E0C', gradient:'linear-gradient(135deg,#C9A96E,#E8D5A8)' },
  { id:'retro-pixel',  name:'Retro',      color:'#F7C948', bg:'#1A1C2C', gradient:'linear-gradient(135deg,#F7C948,#FF6B9D)' },
]

const THEME_COLOR = Object.fromEntries(THEMES.map(t => [t.id, t.color]))

// Animated skeleton loader
function Skel() {
  return (
    <div className="card" style={{ padding:24, position:'relative', overflow:'hidden' }}>
      <div className="skeleton-shimmer" style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)', animation:'shimmer 1.5s infinite' }} />
      {[['60%',20],['40%',14],['80%',32]].map(([w,h],i) => (
        <div key={i} className="skeleton" style={{ height:h, width:w, marginBottom:i<2?12:0 }} />
      ))}
    </div>
  )
}

// Enhanced create modal with animations
function CreateModal({ onClose }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('minimal') 
  const [isHovered, setIsHovered] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => pagesApi.create({ title: title.trim(), theme }),
    onSuccess: (res) => { 
      qc.invalidateQueries({ queryKey:['pages'] }); 
      toast.custom((t) => (
        <div className={`toast-animate-in ${t.visible ? 'opacity-100' : 'opacity-0'}`} style={{ background:'linear-gradient(135deg,#7C3AED,#84CC16)', color:'white', padding:'12px 20px', borderRadius:'12px', boxShadow:'0 8px 20px rgba(0,0,0,0.2)' }}>
          ✨ Page "{title}" created successfully!
        </div>
      ));
      navigate(`/app/pages/${res.data.page.id}`);
    },
    onError:   (err) => toast.error(err?.message || 'Failed to create page'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)', padding:'1rem', animation:'fadeIn 0.2s ease' }}>
      <div className="glass page-enter" style={{ borderRadius:24, padding:'2rem', width:'100%', maxWidth:520, transform: isHovered ? 'scale(1.02)' : 'scale(1)', transition:'transform 0.2s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700, letterSpacing:'-0.03em', background:'linear-gradient(135deg,#fff,#A8A5BE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Create new page</h2>
          <button onClick={onClose} style={{ color:'#A8A5BE', fontSize:24, cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='#A8A5BE'}>×</button>
        </div>
        
        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:8 }}>Page title</label>
          <input 
            className="input-base" 
            placeholder="e.g., My Portfolio, Blog, Landing Page" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            autoFocus
            style={{ fontSize:16, padding:'12px 16px', borderRadius:12 }}
            onKeyDown={e => e.key === 'Enter' && title.trim() && mutate()} 
          />
        </div>
        
        <div style={{ marginBottom:'2rem' }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:12 }}>Choose a vibe ✨</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {THEMES.map(t => (
              <button 
                key={t.id} 
                onClick={() => setTheme(t.id)} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ 
                  background:t.bg, 
                  border:`2px solid ${theme===t.id?t.color:'transparent'}`, 
                  borderRadius:12, 
                  padding:'12px 8px', 
                  cursor:'pointer', 
                  transition:'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow:theme===t.id?`0 0 20px ${t.color}50`:'none',
                  transform:theme===t.id?'scale(1.02)':'scale(1)'
                }}>
                <div style={{ width:24, height:3, background:t.gradient, borderRadius:2, margin:'0 auto 8px' }} />
                <p style={{ color:t.color, fontSize:12, fontWeight:700, fontFamily:'var(--font-display)', textAlign:'center' }}>{t.name}</p>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary" style={{ flex:1, borderRadius:12 }}>Cancel</button>
          <button onClick={() => mutate()} className="btn btn-primary" style={{ flex:1, borderRadius:12, background: title.trim() ? 'linear-gradient(135deg,#7C3AED,#84CC16)' : '#2A2A35' }} disabled={!title.trim() || isPending}>
            {isPending ? (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div className="spinner" style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
                Creating...
              </div>
            ) : (
              <>✨ Create page</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced page card with hover effects and metrics
function PageCard({ page }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const { mutate: dup, isPending: duping } = useMutation({
    mutationFn: () => pagesApi.duplicate(page.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['pages'] }); toast.success('📄 Page duplicated!') },
    onError: err => toast.error(err?.message || 'Failed'),
  })
  
  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => pagesApi.delete(page.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['pages'] }); toast.success('🗑️ Page deleted') },
    onError: err => toast.error(err?.message || 'Failed'),
  })

  const color = THEME_COLOR[page.theme] || '#7C3AED'
  const gradient = THEMES.find(t => t.id === page.theme)?.gradient || `linear-gradient(135deg,${color},${color}88)`

  return (
    <div 
      className="card card-hover" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        position:'relative', 
        transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div style={{ height:4, background:gradient, borderRadius:'4px 4px 0 0' }} />
      <div style={{ padding:24 }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginBottom:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {page.title}
            </h3>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Globe size={12} color="#A8A5BE" />
              <p style={{ color:'#A8A5BE', fontSize:12, fontFamily:'var(--font-mono)' }}>/{page.slug}</p>
            </div>
          </div>
          <span className={`badge ${page.status==='published'?'badge-published':'badge-draft'}`} style={{ display:'flex', alignItems:'center', gap:6 }}>
            {page.status==='published'?<Globe size={12}/>:<FileText size={12}/>} 
            {page.status}
          </span>
        </div>
        
        <div className="flex items-center gap-5 mb-5" style={{ color:'#A8A5BE', fontSize:12, borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12 }}>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Eye size={13} /> 
            <strong style={{ color:'#fff' }}>{page.view_count}</strong> views
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Clock size={13} />
            {new Date(page.updated_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
          </span>
          <span style={{ color:'#4A4A5A', fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:20 }}>
            {page.theme}
          </span>
        </div>

        {confirm ? (
          <div className="flex gap-2">
            <button onClick={() => del()} className="btn btn-danger btn-sm" style={{ flex:1, borderRadius:10 }} disabled={deleting}>
              {deleting ? 'Deleting...' : '⚠️ Confirm delete'}
            </button>
            <button onClick={() => setConfirm(false)} className="btn btn-secondary btn-sm" style={{ flex:1, borderRadius:10 }}>Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => navigate(`/app/pages/${page.id}`)} 
              className="btn btn-primary btn-sm" 
              style={{ flex:'1 1 auto', borderRadius:10, background:gradient, border:'none' }}
            >
              Edit <ChevronRight size={14}/>
            </button>
            {page.status==='published' && (
              <a href={`/p/${page.slug}`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm" style={{ borderRadius:10 }}>
                <Globe size={14}/>
              </a>
            )}
            <button onClick={() => dup()} className="btn btn-ghost btn-sm" style={{ borderRadius:10 }} disabled={duping} title="Duplicate">
              <Copy size={14}/>
            </button>
            <button onClick={() => setConfirm(true)} className="btn btn-ghost btn-sm" style={{ color:'#F87171', borderRadius:10 }} title="Delete">
              <Trash2 size={14}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['pages', filter],
    queryFn: () => pagesApi.list(filter !== 'all' ? { status: filter } : {}),
  })
  const pages = data?.data?.pages || []

  const publishedCount = pages.filter(p => p.status === 'published').length
  const totalViews = pages.reduce((sum, p) => sum + p.view_count, 0)

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(circle at 0% 0%, #0A0A0F, #050508)' }}>
      {/* Animated gradient orb */}
      <div style={{ position:'fixed', top:'-20%', right:'-10%', width:'60%', height:'60%', background:'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      
      <div className="fixed top-0 left-0 right-0 h-px z-50" style={{ background:'linear-gradient(90deg,transparent,#7C3AED,#84CC16,transparent)' }} />

      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:40, background:'rgba(10,10,15,0.85)', backdropFilter:'blur(20px)' }}>
        <div className="container-app flex items-center justify-between" style={{ height:64 }}>
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#7C3AED,#84CC16)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'#fff', boxShadow:'0 4px 12px rgba(124,58,237,0.3)' }}>V</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'#F0EEF8', letterSpacing:'-0.02em' }}>VibeKit<span style={{ color:'#7C3AED' }}>.</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(124,58,237,0.1)', padding:'6px 12px', borderRadius:20 }}>
              <Sparkles size={14} color="#7C3AED" />
              <span style={{ color:'#A8A5BE', fontSize:13 }} className="hidden sm:block">Welcome back, {user?.name?.split(' ')[0]}</span>
            </div>
            <button onClick={async () => { await logout(); navigate('/') }} className="btn btn-ghost btn-sm" style={{ borderRadius:10 }}>
              <LogOut size={15}/><span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-app py-10 page-enter" style={{ position:'relative', zIndex:1 }}>
        {/* Stats cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:32 }}>
          <div className="card" style={{ padding:20, background:'rgba(255,255,255,0.02)', backdropFilter:'blur(10px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FileText size={20} color="#7C3AED" />
              </div>
              <div>
                <p style={{ color:'#A8A5BE', fontSize:12 }}>Total Pages</p>
                <p style={{ fontSize:28, fontWeight:700, color:'#fff' }}>{pages.length}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding:20, background:'rgba(255,255,255,0.02)', backdropFilter:'blur(10px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(132,204,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Globe size={20} color="#84CC16" />
              </div>
              <div>
                <p style={{ color:'#A8A5BE', fontSize:12 }}>Published</p>
                <p style={{ fontSize:28, fontWeight:700, color:'#fff' }}>{publishedCount}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding:20, background:'rgba(255,255,255,0.02)', backdropFilter:'blur(10px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(168,165,190,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Eye size={20} color="#A8A5BE" />
              </div>
              <div>
                <p style={{ color:'#A8A5BE', fontSize:12 }}>Total Views</p>
                <p style={{ fontSize:28, fontWeight:700, color:'#fff' }}>{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:700, letterSpacing:'-0.03em', marginBottom:8, background:'linear-gradient(135deg,#fff,#A8A5BE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              My Pages
            </h1>
            <p style={{ color:'#A8A5BE', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
              <TrendingUp size={14} /> 
              {pages.length} page{pages.length !== 1 ? 's' : ''} · {publishedCount} live · {totalViews.toLocaleString()} total views
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-lg" style={{ borderRadius:12, gap:8 }}>
            <Plus size={18}/> New page
          </button>
        </div>

        <div className="flex gap-3 mb-8" style={{ overflowX:'auto', paddingBottom:4 }}>
          {[
            { id:'all', label:'All Pages', icon:Star },
            { id:'draft', label:'Drafts', icon:FileText },
            { id:'published', label:'Published', icon:Globe }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)} 
              className={`btn btn-sm ${filter===f.id?'btn-primary':'btn-secondary'}`} 
              style={{ textTransform:'capitalize', flexShrink:0, borderRadius:10, gap:6 }}
            >
              <f.icon size={14} /> {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {[1,2,3,4].map(i => <Skel key={i}/>)}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding:'4rem 1rem' }}>
            <div style={{ width:80, height:80, borderRadius:20, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'2rem', animation:'pulse 2s infinite' }}>
              <Zap size={36} style={{ color:'#7C3AED' }}/>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.75rem' }}>
              {filter==='all' ? '✨ Ready to create magic?' : `No ${filter} pages yet`}
            </h2>
            <p style={{ color:'#A8A5BE', fontSize:14, maxWidth:400, marginBottom:'2rem', lineHeight:1.65 }}>
              {filter==='all' 
                ? 'Create your first themed mini-site and publish it to a unique URL. Choose from 6 stunning themes!' 
                : `Start by creating a ${filter} page from the button above.`}
            </p>
            {filter==='all' && (
              <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-lg" style={{ borderRadius:12, gap:8 }}>
                <Sparkles size={18}/> Create your first page
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {pages.map(p => <PageCard key={p.id} page={p}/>)}
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)}/>}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .toast-animate-in {
          animation: fadeIn 0.3s ease;
        }
        .page-enter {
          animation: fadeIn 0.4s ease;
        }
      `}</style>
    </div>
  )
}