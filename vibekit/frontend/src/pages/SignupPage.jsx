import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

const PW_RULES = [
  { label:'8+ characters', test: v => v.length >= 8 },
  { label:'Uppercase',     test: v => /[A-Z]/.test(v) },
  { label:'Lowercase',     test: v => /[a-z]/.test(v) },
  { label:'Number',        test: v => /\d/.test(v) },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const password = watch('password', '')

  const onSubmit = async (data) => {
    try {
      await signup(data)
      toast.success('Account created! Welcome 🎉')
      navigate('/app')
    } catch (err) {
      toast.error(err?.message || 'Failed to create account')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 page-enter" style={{ background:'#0A0A0F' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.12), transparent 70%)' }} />

      <div className="relative z-10 w-full" style={{ maxWidth:480, padding:'0 1.5rem' }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:36 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,#7C3AED,#84CC16)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'#fff' }}>V</div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:19, color:'#F0EEF8', letterSpacing:'-0.02em' }}>VibeKit<span style={{ color:'#7C3AED' }}>.</span></span>
        </Link>

        <div className="glass" style={{ borderRadius:20, padding:'2.5rem' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', fontWeight:700, letterSpacing:'-0.03em', marginBottom:6 }}>Create your account</h1>
          <p style={{ color:'#A8A5BE', fontSize:14, marginBottom:'2rem' }}>Build your first themed mini-site in minutes</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Name */}
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:6 }}>Full name</label>
              <input type="text" className="input-base" placeholder="Jane Smith"
                {...register('name', { required:'Name is required', minLength:{ value:2, message:'At least 2 characters' } })} />
              {errors.name && <p style={{ color:'#F87171', fontSize:12, marginTop:5, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11} />{errors.name.message}</p>}
            </div>
            {/* Email */}
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:6 }}>Email</label>
              <input type="email" className="input-base" placeholder="you@example.com"
                {...register('email', { required:'Email is required', pattern:{ value:/\S+@\S+\.\S+/, message:'Invalid email' } })} />
              {errors.email && <p style={{ color:'#F87171', fontSize:12, marginTop:5, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11} />{errors.email.message}</p>}
            </div>
            {/* Password */}
            <div style={{ marginBottom:'1.75rem' }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#A8A5BE', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} className="input-base" style={{ paddingRight:'3rem' }} placeholder="Create a strong password"
                  {...register('password', { required:'Password is required', minLength:{ value:8, message:'At least 8 characters' }, pattern:{ value:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message:'Must include uppercase, lowercase, and number' } })} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#A8A5BE', cursor:'pointer', padding:4 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {PW_RULES.map(r => (
                    <div key={r.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:r.test(password)?'#84CC16':'#4A4A5A', transition:'color 0.2s' }}>
                      <Check size={11} style={{ opacity:r.test(password)?1:0.3 }} />{r.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p style={{ color:'#F87171', fontSize:12, marginTop:5, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11} />{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%' }} disabled={isSubmitting}>
              {isSubmitting
                ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }} />Creating account…</span>
                : <span style={{ display:'flex', alignItems:'center', gap:8 }}>Create account <ArrowRight size={16} /></span>
              }
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign:'center', color:'#A8A5BE', fontSize:14 }}>
            Already have an account? <Link to="/login" style={{ color:'#A78BFA', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
