import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

function VantaBg({ elRef }) {
  const fx = useRef(null)
  useEffect(() => {
    if (!fx.current && window.VANTA?.WAVES && elRef.current) {
      fx.current = window.VANTA.WAVES({
        el: elRef.current, mouseControls: false, touchControls: false,
        color: 0x0d0b1a, shininess: 40, waveHeight: 15, waveSpeed: 0.6, zoom: 0.85,
      })
    }
    return () => { fx.current?.destroy(); fx.current = null }
  }, [elRef])
  return null
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const bgRef = useRef(null)
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate('/app')
    } catch (err) {
      toast.error(err?.message || 'Invalid email or password')
    }
  }

  return (
    <div ref={bgRef} className="relative min-h-screen flex items-center justify-center" style={{ background:'#0A0A0F' }}>
      <VantaBg elRef={bgRef} />
      <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at center, rgba(10,10,15,0.5), rgba(10,10,15,0.8))' }} />

      <div className="relative z-10 w-full page-enter" style={{ maxWidth:440, padding:'0 1.5rem' }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:36 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,#7C3AED,#84CC16)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'#fff' }}>V</div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:19, color:'#F0EEF8', letterSpacing:'-0.02em' }}>VibeKit<span style={{ color:'#7C3AED' }}>.</span></span>
        </Link>

        <div className="glass" style={{ borderRadius:20, padding:'2.5rem' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', fontWeight:700, letterSpacing:'-0.03em', marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'#A8A5BE', fontSize:14, marginBottom:'2rem' }}>Sign in to your VibeKit Studio account</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:6 }}>Email</label>
              <input type="email" className="input-base" placeholder="you@example.com"
                {...register('email', { required:'Email is required', pattern:{ value:/\S+@\S+\.\S+/, message:'Invalid email' } })} />
              {errors.email && <p style={{ color:'#F87171', fontSize:12, marginTop:5, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11} />{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom:'1.75rem' }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} className="input-base" style={{ paddingRight:'3rem' }} placeholder="••••••••"
                  {...register('password', { required:'Password is required' })} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#A8A5BE', cursor:'pointer', padding:4 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color:'#F87171', fontSize:12, marginTop:5, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11} />{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%' }} disabled={isSubmitting}>
              {isSubmitting
                ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }} />Signing in…</span>
                : <span style={{ display:'flex', alignItems:'center', gap:8 }}>Sign in <ArrowRight size={16} /></span>
              }
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign:'center', color:'#A8A5BE', fontSize:14 }}>
            No account? <Link to="/signup" style={{ color:'#A78BFA', fontWeight:600, textDecoration:'none' }}>Sign up free</Link>
          </p>
          <div style={{ marginTop:'1.25rem', padding:'12px 14px', borderRadius:10, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)' }}>
            <p style={{ color:'#A78BFA', fontSize:12, fontWeight:600, marginBottom:4 }}>Test credentials</p>
            <p style={{ color:'#A8A5BE', fontSize:12, fontFamily:'var(--font-mono)' }}>demo@vibekit.studio / Demo1234!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
