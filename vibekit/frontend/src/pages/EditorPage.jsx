import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Globe, EyeOff, Save, Monitor, Tablet, Smartphone,
         ChevronUp, ChevronDown, RefreshCw, Eye, Check, X, Star, Layout, Image, Mail } from 'lucide-react'
import { pagesApi } from '../lib/api'
import PageRenderer from '../components/editor/PageRenderer'
import toast from 'react-hot-toast'

const THEMES = [
  { id:'minimal',      name:'Minimal',    color:'#6B6B6B', bg:'#FAFAF9' },
  { id:'neo-brutal',   name:'Neo-Brutal', color:'#FF3B00', bg:'#FFFBEB' },
  { id:'dark-neon',    name:'Dark/Neon',  color:'#00FF88', bg:'#0A0A0F' },
  { id:'pastel-soft',  name:'Pastel',     color:'#E8756A', bg:'#FFF8F5' },
  { id:'luxury-serif', name:'Luxury',     color:'#C9A96E', bg:'#0F0E0C' },
  { id:'retro-pixel',  name:'Retro',      color:'#F7C948', bg:'#1A1C2C' },
]
const VPS = [
  { id:'desktop', icon:Monitor,    label:'Desktop', width:'100%' },
  { id:'tablet',  icon:Tablet,     label:'Tablet',  width:'768px' },
  { id:'mobile',  icon:Smartphone, label:'Mobile',  width:'375px' },
]
const SMETA = {
  hero:     { label:'Hero',     icon:Star,   color:'#7C3AED' },
  features: { label:'Features', icon:Layout, color:'#00FF88' },
  gallery:  { label:'Gallery',  icon:Image,  color:'#F97316' },
  contact:  { label:'Contact',  icon:Mail,   color:'#A78BFA' },
}
const DEFAULT_SECTIONS = [
  { type:'hero',     order:0, content:{ title:'Page Title', subtitle:'Your compelling subtitle.', buttonText:'Get Started', buttonUrl:'#contact' }},
  { type:'features', order:1, content:{ cards:[{ title:'Feature One', description:'Describe your first feature.' },{ title:'Feature Two', description:'Your second feature.' },{ title:'Feature Three', description:'Your third feature.' }]}},
  { type:'gallery',  order:2, content:{ images:['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800']}},
  { type:'contact',  order:3, content:{}},
]

/* ── Section editors ───────────────────────────────────────────────────── */
function HeroEditor({ c, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {[['title','Headline','Page headline'],['subtitle','Subtitle','Supporting subtitle'],['buttonText','Button text','Get Started'],['buttonUrl','Button URL','#contact']].map(([k,label,ph]) => (
        <div key={k}>
          <label style={{ fontSize:11, color:'#A8A5BE', fontWeight:600, display:'block', marginBottom:4 }}>{label}</label>
          {k==='subtitle'
            ? <textarea className="input-base" rows={2} style={{ resize:'vertical', fontSize:13 }} value={c[k]||''} onChange={e=>onChange({...c,[k]:e.target.value})} placeholder={ph}/>
            : <input className="input-base" style={{ fontSize:13 }} value={c[k]||''} onChange={e=>onChange({...c,[k]:e.target.value})} placeholder={ph}/>
          }
        </div>
      ))}
    </div>
  )
}
function FeaturesEditor({ c, onChange }) {
  const cards = c.cards||[]
  const upd = (i,f,v) => onChange({...c, cards:cards.map((x,j)=>j===i?{...x,[f]:v}:x)})
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {cards.map((card,i) => (
        <div key={i} className="glass" style={{ borderRadius:10, padding:12 }}>
          <div style={{ fontSize:11, color:'#7C3AED', fontWeight:700, marginBottom:8, fontFamily:'var(--font-display)' }}>Card {i+1}</div>
          <input className="input-base" style={{ marginBottom:8, fontSize:13 }} value={card.title} onChange={e=>upd(i,'title',e.target.value)} placeholder="Feature title"/>
          <textarea className="input-base" rows={2} style={{ fontSize:13, resize:'vertical' }} value={card.description} onChange={e=>upd(i,'description',e.target.value)} placeholder="Short description"/>
        </div>
      ))}
    </div>
  )
}
function GalleryEditor({ c, onChange }) {
  const imgs = c.images||[]
  const upd = (i,v) => onChange({...c, images:imgs.map((x,j)=>j===i?v:x)})
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {imgs.map((img,i) => (
        <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
          <img src={img} alt="" style={{ width:44, height:44, objectFit:'cover', borderRadius:6, flexShrink:0 }} onError={e=>e.target.style.display='none'}/>
          <input className="input-base" style={{ flex:1, fontSize:12 }} value={img} onChange={e=>upd(i,e.target.value)} placeholder="Image URL"/>
          {imgs.length > 3 && <button onClick={()=>onChange({...c,images:imgs.filter((_,j)=>j!==i)})} style={{ background:'none', border:'none', color:'#F87171', cursor:'pointer', padding:4, flexShrink:0 }}><X size={14}/></button>}
        </div>
      ))}
      {imgs.length < 8 && <button onClick={()=>onChange({...c,images:[...imgs,'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']})} className="btn btn-secondary btn-sm" style={{ alignSelf:'flex-start' }}>+ Add image</button>}
    </div>
  )
}

/* ── Section panel ─────────────────────────────────────────────────────── */
function SectionPanel({ s, index, total, onUpdate, onUp, onDown }) {
  const [open, setOpen] = useState(index===0)
  const m = SMETA[s.type]
  return (
    <div className="glass" style={{ borderRadius:12, overflow:'hidden' }}>
      <div className="flex items-center justify-between cursor-pointer" style={{ padding:'11px 13px', borderBottom:open?'1px solid rgba(255,255,255,0.07)':'none' }} onClick={()=>setOpen(!open)}>
        <div className="flex items-center gap-2.5">
          <div style={{ width:28, height:28, borderRadius:7, background:`${m.color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}><m.icon size={14} style={{ color:m.color }}/></div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, letterSpacing:'-0.01em' }}>{m.label}</span>
        </div>
        <div className="flex items-center gap-1" onClick={e=>e.stopPropagation()}>
          <button onClick={onUp}   disabled={index===0}       className="btn btn-ghost btn-sm" style={{ padding:'4px 6px' }}><ChevronUp size={13}/></button>
          <button onClick={onDown} disabled={index===total-1} className="btn btn-ghost btn-sm" style={{ padding:'4px 6px' }}><ChevronDown size={13}/></button>
          <button onClick={()=>setOpen(!open)} className="btn btn-ghost btn-sm" style={{ padding:'4px 6px' }}>
            <ChevronDown size={13} style={{ transform:open?'rotate(180deg)':'none', transition:'transform 0.2s' }}/>
          </button>
        </div>
      </div>
      {open && (
        <div style={{ padding:13 }}>
          {s.type==='hero'     && <HeroEditor     c={s.content} onChange={c=>onUpdate({...s,content:c})}/>}
          {s.type==='features' && <FeaturesEditor c={s.content} onChange={c=>onUpdate({...s,content:c})}/>}
          {s.type==='gallery'  && <GalleryEditor  c={s.content} onChange={c=>onUpdate({...s,content:c})}/>}
          {s.type==='contact'  && <div style={{ padding:12, borderRadius:10, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.15)' }}><p style={{ color:'#A78BFA', fontSize:13 }}>Contact form renders automatically. Submissions are stored in your database.</p></div>}
        </div>
      )}
    </div>
  )
}

/* ── Editor page ───────────────────────────────────────────────────────── */
export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [sections, setSections] = useState(null)
  const [theme, setTheme] = useState('minimal')
  const [title, setTitle] = useState('')
  const [slug, setSlug]   = useState('')
  const [vp, setVp]       = useState('desktop')
  const [tab, setTab]     = useState('content')
  const [saveState, setSaveState] = useState('idle')
  const timer  = useRef(null)
  const dirty  = useRef(false)

  const { data, isLoading } = useQuery({ queryKey:['page',id], queryFn:()=>pagesApi.get(id) })
  const page = data?.data?.page

  useEffect(() => {
    if (page) { setTitle(page.title); setSlug(page.slug); setTheme(page.theme); setSections(page.sections?.length?page.sections:DEFAULT_SECTIONS) }
  }, [page])

  const { mutate: save } = useMutation({
    mutationFn: () => pagesApi.update(id, { title, slug, theme, sections }),
    onSuccess: (res) => { qc.setQueryData(['page',id],res); dirty.current=false; setSaveState('saved'); setTimeout(()=>setSaveState('idle'),2000) },
    onError: () => { toast.error('Save failed'); setSaveState('idle') },
  })

  const { mutate: togglePub, isPending:publishing } = useMutation({
    mutationFn: ()=> page?.status==='published'?pagesApi.unpublish(id):pagesApi.publish(id),
    onSuccess: (res)=>{ qc.setQueryData(['page',id],res); qc.invalidateQueries({queryKey:['pages']}); toast.success(page?.status==='published'?'Unpublished':'Published! 🎉') },
    onError: (err)=>toast.error(err?.message||'Failed'),
  })

  const triggerSave = useCallback(()=>{
    if(!dirty.current) return
    setSaveState('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(()=>save(), 2000)
  },[save])

  const updSections = useCallback((next)=>{ setSections(next); dirty.current=true; triggerSave() },[triggerSave])
  const updSection  = (i,updated)=> updSections(sections.map((s,j)=>j===i?updated:s))
  const moveSection = (i,dir)=>{
    const next=[...sections]; [next[i],next[i+dir]]=[next[i+dir],next[i]]; next.forEach((s,j)=>s.order=j); updSections(next)
  }

  const vpW = VPS.find(v=>v.id===vp)?.width

  if (isLoading || !sections) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0A0A0F' }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'2px solid #7C3AED', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }}/>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0A0A0F', overflow:'hidden' }}>
      {/* Top bar */}
      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(10,10,15,0.95)', backdropFilter:'blur(20px)', zIndex:40, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1rem', height:52, gap:'1rem' }}>
          <div className="flex items-center gap-3" style={{ minWidth:0 }}>
            <button onClick={()=>navigate('/app')} className="btn btn-ghost btn-sm" style={{ padding:'6px 8px', flexShrink:0 }}><ArrowLeft size={16}/></button>
            <div style={{ minWidth:0 }}>
              <input value={title} onChange={e=>{setTitle(e.target.value);dirty.current=true;triggerSave()}}
                style={{ background:'none', border:'none', color:'#F0EEF8', fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, outline:'none', width:'100%', letterSpacing:'-0.02em' }} placeholder="Page title"/>
              <p style={{ color:'#4A4A5A', fontSize:11 }}>/{slug}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 glass" style={{ borderRadius:8, padding:3 }}>
            {VPS.map(v=>(
              <button key={v.id} onClick={()=>setVp(v.id)} className="btn btn-sm"
                style={{ padding:'5px 10px', background:vp===v.id?'rgba(124,58,237,0.3)':'transparent', color:vp===v.id?'#A78BFA':'#A8A5BE', borderRadius:6, gap:5, fontSize:12 }}>
                <v.icon size={14}/><span className="hidden lg:block">{v.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2" style={{ flexShrink:0 }}>
            <span style={{ fontSize:12, color:saveState==='saved'?'#84CC16':'#A8A5BE', display:'flex', alignItems:'center', gap:5, minWidth:56 }}>
              {saveState==='saving'&&<RefreshCw size={12} style={{ animation:'spin 1s linear infinite' }}/>}
              {saveState==='saved'&&<Check size={12}/>}
              {saveState==='saving'?'Saving…':saveState==='saved'?'Saved':''}
            </span>
            <button onClick={()=>{dirty.current=true;save()}} className="btn btn-secondary btn-sm"><Save size={14}/><span className="hidden sm:block">Save</span></button>
            {page?.status==='published'&&<a href={`/p/${slug}`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><Eye size={14}/><span className="hidden sm:block">View</span></a>}
            <button onClick={()=>togglePub()} disabled={publishing} className={`btn btn-sm ${page?.status==='published'?'btn-secondary':'btn-lime'}`}>
              {page?.status==='published'?<><EyeOff size={14}/><span className="hidden sm:block">Unpublish</span></>:<><Globe size={14}/><span className="hidden sm:block">Publish</span></>}
            </button>
          </div>
        </div>
      </header>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Left panel */}
        <aside style={{ width:296, borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', background:'#0D0D14', overflowY:'auto', flexShrink:0 }}>
          <div className="flex" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 12px' }}>
            {[{id:'content',l:'Content'},{id:'theme',l:'Theme'},{id:'settings',l:'Settings'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:'10px 8px', background:'none', border:'none', cursor:'pointer', color:tab===t.id?'#A78BFA':'#A8A5BE', fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, letterSpacing:'-0.01em', borderBottom:`2px solid ${tab===t.id?'#7C3AED':'transparent'}`, transition:'color 0.2s' }}>{t.l}</button>
            ))}
          </div>
          <div style={{ padding:12, flex:1 }}>
            {tab==='content' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {sections.map((s,i)=>(
                  <SectionPanel key={`${s.type}-${i}`} s={s} index={i} total={sections.length}
                    onUpdate={u=>updSection(i,u)} onUp={()=>moveSection(i,-1)} onDown={()=>moveSection(i,1)}/>
                ))}
              </div>
            )}
            {tab==='theme' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ color:'#A8A5BE', fontSize:12, marginBottom:4 }}>Choose the vibe for your page</p>
                {THEMES.map(th=>(
                  <button key={th.id} onClick={()=>{setTheme(th.id);dirty.current=true;triggerSave()}}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:12, background:theme===th.id?'rgba(124,58,237,0.12)':'rgba(255,255,255,0.03)', border:`1px solid ${theme===th.id?'rgba(124,58,237,0.4)':'rgba(255,255,255,0.07)'}`, borderRadius:10, cursor:'pointer', transition:'all 0.15s', textAlign:'left', width:'100%' }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:th.bg, border:`2px solid ${th.color}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:16, height:3, background:th.color, borderRadius:1 }}/>
                    </div>
                    <p style={{ color:'#F0EEF8', fontSize:13, fontWeight:600, fontFamily:'var(--font-display)', flex:1 }}>{th.name}</p>
                    {theme===th.id && <Check size={14} style={{ color:'#84CC16', flexShrink:0 }}/>}
                  </button>
                ))}
              </div>
            )}
            {tab==='settings' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ fontSize:12, color:'#A8A5BE', fontWeight:600, display:'block', marginBottom:6 }}>Page slug</label>
                  <input className="input-base" value={slug}
                    onChange={e=>{setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-'));dirty.current=true;triggerSave()}}
                    placeholder="my-page-slug" style={{ fontFamily:'var(--font-mono)', fontSize:13 }}/>
                  <p style={{ color:'#4A4A5A', fontSize:11, marginTop:5 }}>yoursite.com/p/{slug||'your-slug'}</p>
                </div>
                <div style={{ padding:14, borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#A8A5BE', marginBottom:8 }}>Status</p>
                  <span className={`badge ${page?.status==='published'?'badge-published':'badge-draft'}`}>
                    {page?.status==='published'?<Globe size={10}/>:null} {page?.status||'draft'}
                  </span>
                  {page?.status==='published'&&<a href={`/p/${slug}`} target="_blank" rel="noopener" style={{ display:'block', marginTop:10, color:'#A78BFA', fontSize:12, textDecoration:'none' }}>→ /p/{slug}</a>}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview */}
        <main style={{ flex:1, overflow:'auto', background:'#0A0A0F', display:'flex', flexDirection:'column', alignItems:'center', padding:16 }}>
          <div className="flex md:hidden items-center gap-1 glass mb-3" style={{ borderRadius:8, padding:3 }}>
            {VPS.map(v=>(
              <button key={v.id} onClick={()=>setVp(v.id)} className="btn btn-sm"
                style={{ padding:'5px 10px', background:vp===v.id?'rgba(124,58,237,0.3)':'transparent', color:vp===v.id?'#A78BFA':'#A8A5BE', borderRadius:6, fontSize:12, gap:4 }}>
                <v.icon size={13}/>
              </button>
            ))}
          </div>
          <div style={{ width:vpW, maxWidth:'100%', background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.08)', transition:'width 0.35s cubic-bezier(0.34,1.56,0.64,1)', flex:1 }}>
            <PageRenderer theme={theme} sections={sections} title={title} slug={slug} isPreview={true}/>
          </div>
        </main>
      </div>
    </div>
  )
}
