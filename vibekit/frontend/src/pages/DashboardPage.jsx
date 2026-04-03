import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Trash2, Eye, Globe, FileText, Zap, LogOut, ChevronRight } from 'lucide-react'
import { pagesApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

const THEMES = [
  { id:'minimal',      name:'Minimal',    color:'#1A1A1A', bg:'#FAFAF9' },
  { id:'neo-brutal',   name:'Neo-Brutal', color:'#FF3B00', bg:'#FFFBEB' },
  { id:'dark-neon',    name:'Dark/Neon',  color:'#00FF88', bg:'#0A0A0F' },
  { id:'pastel-soft',  name:'Pastel',     color:'#E8756A', bg:'#FFF8F5' },
  { id:'luxury-serif', name:'Luxury',     color:'#C9A96E', bg:'#0F0E0C' },
  { id:'retro-pixel',  name:'Retro',      color:'#F7C948', bg:'#1A1C2C' },
]
const THEME_COLOR = Object.fromEntries(THEMES.map(t => [t.id, t.color]))

/* ── Skeleton ──────────────────────────────────────────────────────────── */
function Skel() {
  return (
    <div className="card" style={{ padding:24 }}>
      {[['60%',20],['40%',14],['80%',32]].map(([w,h],i) => (
        <div key={i} className="skeleton" style={{ height:h, width:w, marginBottom:i<2?12:0 }} />
      ))}
    </div>
  )
}

/* ── Create modal ──────────────────────────────────────────────────────── */
function CreateModal({ onClose }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('minimal')

  const { mutate, isPending } = useMutation({
    mutationFn: () => pagesApi.create({ title: title.trim(), theme }),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey:['pages'] }); toast.success('Page created!'); navigate(`/app/pages/${res.data.page.id}`) },
    onError:   (err) => toast.error(err?.message || 'Failed to create page'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', padding:'1rem' }}>
      <div className="glass page-enter" style={{ borderRadius:20, padding:'2rem', width:'100%', maxWidth:480 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.375rem', fontWeight:700, letterSpacing:'-0.03em', marginBottom:'1.5rem' }}>Create new page</h2>
        <div style={{ marginBottom:'1.25rem' }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:6 }}>Page title</label>
          <input className="input-base" placeholder="My Awesome Page" value={title} onChange={e => setTitle(e.target.value)} autoFocus
            onKeyDown={e => e.key === 'Enter' && title.trim() && mutate()} />
        </div>
        <div style={{ marginBottom:'1.75rem' }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:10 }}>Choose a vibe</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} style={{ background:t.bg, border:`2px solid ${theme===t.id?t.color:'transparent'}`, borderRadius:10, padding:'10px 8px', cursor:'pointer', transition:'all 0.15s', boxShadow:theme===t.id?`0 0 12px ${t.color}50`:'none' }}>
                <div style={{ width:20, height:3, background:t.color, borderRadius:2, margin:'0 auto 6px' }} />
                <p style={{ color:t.color, fontSize:11, fontWeight:700, fontFamily:'var(--font-display)', textAlign:'center' }}>{t.name}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary" style={{ flex:1 }}>Cancel</button>
          <button onClick={() => mutate()} className="btn btn-primary" style={{ flex:1 }} disabled={!title.trim() || isPending}>
            {isPending ? 'Creating…' : 'Create page'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page card ─────────────────────────────────────────────────────────── */
function PageCard({ page }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)

  const { mutate: dup, isPending: duping } = useMutation({
    mutationFn: () => pagesApi.duplicate(page.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['pages'] }); toast.success('Duplicated!') },
    onError: err => toast.error(err?.message || 'Failed'),
  })
  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => pagesApi.delete(page.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['pages'] }); toast.success('Page deleted') },
    onError: err => toast.error(err?.message || 'Failed'),
  })

  const color = THEME_COLOR[page.theme] || '#7C3AED'

  return (
    <div className="card card-hover" style={{ position:'relative' }}>
      <div style={{ height:3, background:`linear-gradient(90deg,${color},transparent)` }} />
      <div style={{ padding:20 }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, letterSpacing:'-0.02em', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{page.title}</h3>
            <p style={{ color:'#A8A5BE', fontSize:12, fontFamily:'var(--font-mono)' }}>/{page.slug}</p>
          </div>
          <span className={`badge ${page.status==='published'?'badge-published':'badge-draft'}`}>
            {page.status==='published'?<Globe size={10}/>:<FileText size={10}/>} {page.status}
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4" style={{ color:'#A8A5BE', fontSize:12 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Eye size={12}/>{page.view_count} views</span>
          <span style={{ color:'#4A4A5A', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em' }}>{page.theme}</span>
        </div>

        {confirm ? (
          <div className="flex gap-2">
            <button onClick={() => del()} className="btn btn-danger btn-sm" style={{ flex:1 }} disabled={deleting}>{deleting?'Deleting…':'Confirm delete'}</button>
            <button onClick={() => setConfirm(false)} className="btn btn-secondary btn-sm" style={{ flex:1 }}>Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate(`/app/pages/${page.id}`)} className="btn btn-primary btn-sm" style={{ flex:'1 1 auto' }}>Edit <ChevronRight size={14}/></button>
            {page.status==='published' && <a href={`/p/${page.slug}`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><Globe size={14}/></a>}
            <button onClick={() => dup()} className="btn btn-ghost btn-sm" disabled={duping} title="Duplicate"><Copy size={14}/></button>
            <button onClick={() => setConfirm(true)} className="btn btn-ghost btn-sm" style={{ color:'#F87171' }} title="Delete"><Trash2 size={14}/></button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────────────────────────── */
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

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F' }}>
      <div className="fixed top-0 left-0 right-0 h-px z-50" style={{ background:'linear-gradient(90deg,transparent,#7C3AED,transparent)' }} />

      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:40, background:'rgba(10,10,15,0.9)', backdropFilter:'blur(20px)' }}>
        <div className="container-app flex items-center justify-between" style={{ height:60 }}>
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#7C3AED,#84CC16)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'#fff' }}>V</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'#F0EEF8', letterSpacing:'-0.02em' }}>VibeKit<span style={{ color:'#7C3AED' }}>.</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span style={{ color:'#A8A5BE', fontSize:13 }} className="hidden sm:block">Hi, {user?.name?.split(' ')[0]}</span>
            <button onClick={async () => { await logout(); navigate('/') }} className="btn btn-ghost btn-sm">
              <LogOut size={15}/><span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-app py-8 page-enter">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,4vw,2.25rem)', fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>My Pages</h1>
            <p style={{ color:'#A8A5BE', fontSize:14 }}>{pages.length} page{pages.length!==1?'s':''} · {pages.filter(p=>p.status==='published').length} published</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-lg"><Plus size={18}/>New page</button>
        </div>

        <div className="flex gap-2 mb-6" style={{ overflowX:'auto', paddingBottom:4 }}>
          {['all','draft','published'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`} style={{ textTransform:'capitalize', flexShrink:0 }}>{f}</button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {[1,2,3].map(i => <Skel key={i}/>)}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding:'5rem 1rem' }}>
            <div style={{ width:64, height:64, borderRadius:16, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' }}>
              <Zap size={28} style={{ color:'#7C3AED' }}/>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:700, marginBottom:'0.75rem' }}>
              {filter==='all'?'No pages yet':`No ${filter} pages`}
            </h2>
            <p style={{ color:'#A8A5BE', fontSize:14, maxWidth:360, marginBottom:'2rem', lineHeight:1.65 }}>
              {filter==='all'?'Create your first themed mini-site and publish it to a public URL.':`No ${filter} pages yet.`}
            </p>
            {filter==='all' && <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-lg"><Plus size={18}/>Create your first page</button>}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {pages.map(p => <PageCard key={p.id} page={p}/>)}
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)}/>}
    </div>
  )
}
