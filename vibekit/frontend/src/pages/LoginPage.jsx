import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, Star, Zap, Shield, Mail, Lock, Fingerprint } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

function VantaBg({ elRef }) {
  const fx = useRef(null)
  useEffect(() => {
    if (!fx.current && window.VANTA?.WAVES && elRef.current) {
      fx.current = window.VANTA.WAVES({
        el: elRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        color: 0x7C3AED,
        shininess: 60,
        waveHeight: 20,
        waveSpeed: 0.8,
        zoom: 0.75,
        scale: 1.2,
        scaleMobile: 1.0
      })
    }
    return () => { fx.current?.destroy(); fx.current = null }
  }, [elRef])
  return null
}

// Animated background particles
function ParticleField() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    
    const initParticles = () => {
      particles = []
      const particleCount = Math.min(100, Math.floor(window.innerWidth / 20))
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2
        })
      }
    }
    
    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(124, 58, 237, ${p.opacity})`
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    window.addEventListener('resize', resize)
    resize()
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])
  
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />
}

// Animated gradient orb
function GradientOrb() {
  return (
    <div style={{
      position:'fixed',
      top:'-30%',
      right:'-20%',
      width:'80%',
      height:'80%',
      background:'radial-gradient(circle, rgba(124,58,237,0.3), rgba(132,204,22,0.1), transparent 70%)',
      borderRadius:'50%',
      filter:'blur(60px)',
      animation:'float 20s ease-in-out infinite',
      pointerEvents:'none',
      zIndex:0
    }} />
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const bgRef = useRef(null)
  const [showPw, setShowPw] = useState(false)
  const [isFocused, setIsFocused] = useState({ email: false, password: false })
  const [isHovered, setIsHovered] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await login(data)
      toast.custom((t) => (
        <div style={{
          background:'linear-gradient(135deg, #7C3AED, #84CC16)',
          color:'white',
          padding:'14px 24px',
          borderRadius:16,
          boxShadow:'0 8px 32px rgba(124,58,237,0.3)',
          animation:'slideIn 0.3s ease',
          display:'flex',
          alignItems:'center',
          gap:12
        }}>
          <Sparkles size={20} />
          <span>Welcome back! ✨ Redirecting to dashboard...</span>
        </div>
      ))
      setTimeout(() => navigate('/app'), 500)
    } catch (err) {
      toast.error(err?.message || 'Invalid email or password')
    }
  }

  return (
    <div ref={bgRef} className="relative min-h-screen flex items-center justify-center" style={{ background:'#0A0A0F', overflow:'hidden' }}>
      <VantaBg elRef={bgRef} />
      <ParticleField />
      <GradientOrb />
      
      {/* Animated gradient border overlay */}
      <div style={{
        position:'fixed',
        inset:0,
        background:'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.15), transparent 70%)',
        pointerEvents:'none',
        zIndex:0
      }} />
      
      <div className="relative z-10 w-full page-enter" style={{ maxWidth:480, padding:'0 1.5rem' }}>
        {/* Logo with animation */}
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:48, group:true }}>
          <div style={{
            width:48,
            height:48,
            borderRadius:14,
            background:'linear-gradient(135deg, #7C3AED, #84CC16)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontFamily:'var(--font-display)',
            fontWeight:700,
            fontSize:24,
            color:'#fff',
            boxShadow:'0 8px 24px rgba(124,58,237,0.4)',
            transition:'all 0.3s ease',
            animation:'pulse 2s infinite'
          }}>
            V
          </div>
          <span style={{
            fontFamily:'var(--font-display)',
            fontWeight:700,
            fontSize:22,
            color:'#F0EEF8',
            letterSpacing:'-0.02em',
            background:'linear-gradient(135deg, #fff, #A8A5BE)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent'
          }}>
            VibeKit<span style={{ color:'#7C3AED', WebkitTextFillColor:'#7C3AED' }}>.</span>
          </span>
        </Link>

        {/* Main Card with Glassmorphism */}
        <div className="glass" style={{
          borderRadius:28,
          padding:'2.5rem',
          background:'rgba(20, 20, 30, 0.6)',
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(124,58,237,0.2)',
          boxShadow:'0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.1)',
          transition:'transform 0.3s ease, box-shadow 0.3s ease',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
        }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{
              width:48,
              height:48,
              borderRadius:24,
              background:'rgba(124,58,237,0.2)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              margin:'0 auto 1rem',
              border:'1px solid rgba(124,58,237,0.3)'
            }}>
              <Zap size={24} style={{ color:'#7C3AED' }} />
            </div>
            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:'2rem',
              fontWeight:700,
              letterSpacing:'-0.03em',
              marginBottom:8,
              background:'linear-gradient(135deg, #fff, #A8A5BE)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent'
            }}>
              Welcome back
            </h1>
            <p style={{ color:'#A8A5BE', fontSize:14 }}>
              Sign in to continue your creative journey
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{
                display:'flex',
                alignItems:'center',
                gap:8,
                fontSize:13,
                fontWeight:600,
                color:'#A8A5BE',
                marginBottom:8
              }}>
                <Mail size={14} />
                Email address
              </label>
              <div style={{
                position:'relative',
                transition:'all 0.3s ease',
                transform: isFocused.email ? 'scale(1.02)' : 'scale(1)'
              }}>
                <input
                  type="email"
                  className="input-base"
                  placeholder="you@example.com"
                  style={{
                    paddingLeft:44,
                    borderColor: errors.email ? '#F87171' : isFocused.email ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                    boxShadow: isFocused.email ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none'
                  }}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email' }
                  })}
                />
                <Mail size={16} style={{
                  position:'absolute',
                  left:14,
                  top:'50%',
                  transform:'translateY(-50%)',
                  color: isFocused.email ? '#7C3AED' : '#A8A5BE',
                  transition:'color 0.3s ease'
                }} />
              </div>
              {errors.email && (
                <p style={{
                  color:'#F87171',
                  fontSize:12,
                  marginTop:6,
                  display:'flex',
                  alignItems:'center',
                  gap:6
                }}>
                  <AlertCircle size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom:'2rem' }}>
              <label style={{
                display:'flex',
                alignItems:'center',
                gap:8,
                fontSize:13,
                fontWeight:600,
                color:'#A8A5BE',
                marginBottom:8
              }}>
                <Lock size={14} />
                Password
              </label>
              <div style={{
                position:'relative',
                transition:'all 0.3s ease',
                transform: isFocused.password ? 'scale(1.02)' : 'scale(1)'
              }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-base"
                  style={{
                    paddingLeft:44,
                    paddingRight:44,
                    borderColor: errors.password ? '#F87171' : isFocused.password ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                    boxShadow: isFocused.password ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none'
                  }}
                  placeholder="••••••••"
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  {...register('password', { required: 'Password is required' })}
                />
                <Lock size={16} style={{
                  position:'absolute',
                  left:14,
                  top:'50%',
                  transform:'translateY(-50%)',
                  color: isFocused.password ? '#7C3AED' : '#A8A5BE',
                  transition:'color 0.3s ease'
                }} />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position:'absolute',
                    right:14,
                    top:'50%',
                    transform:'translateY(-50%)',
                    background:'none',
                    border:'none',
                    color:'#A8A5BE',
                    cursor:'pointer',
                    padding:4,
                    transition:'color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#7C3AED'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A8A5BE'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{
                  color:'#F87171',
                  fontSize:12,
                  marginTop:6,
                  display:'flex',
                  alignItems:'center',
                  gap:6
                }}>
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign:'right', marginBottom:'1.75rem' }}>
              <a href="#" style={{
                color:'#A78BFA',
                fontSize:12,
                textDecoration:'none',
                transition:'color 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.color = '#7C3AED'}
              onMouseLeave={e => e.target.style.color = '#A78BFA'}>
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                width:'100%',
                borderRadius:14,
                padding:'1rem',
                background: isSubmitting
                  ? 'linear-gradient(135deg, #5a2b9e, #6b9e12)'
                  : 'linear-gradient(135deg, #7C3AED, #84CC16)',
                position:'relative',
                overflow:'hidden'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
                  <div className="spinner" style={{
                    width:18,
                    height:18,
                    border:'2px solid rgba(255,255,255,0.3)',
                    borderTopColor:'#fff',
                    borderRadius:'50%',
                    animation:'spin 0.6s linear infinite'
                  }} />
                  Authenticating...
                </span>
              ) : (
                <span style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
                  Sign in
                  <ArrowRight size={18} style={{ transition:'transform 0.3s ease' }} />
                </span>
              )}
            </button>
          </form>

          <hr className="divider" style={{ margin:'2rem 0 1.5rem' }} />

          {/* Sign Up Link */}
          <p style={{ textAlign:'center', color:'#A8A5BE', fontSize:14, marginBottom:'1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color:'#A78BFA',
              fontWeight:600,
              textDecoration:'none',
              position:'relative',
              transition:'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.color = '#7C3AED'}
            onMouseLeave={e => e.target.style.color = '#A78BFA'}>
              Create free account
              <span style={{
                position:'absolute',
                bottom:-2,
                left:0,
                width:0,
                height:2,
                background:'linear-gradient(90deg, #7C3AED, #84CC16)',
                transition:'width 0.3s ease'
              }} />
            </Link>
          </p>

          {/* Demo Credentials Card */}
          <div style={{
            padding:'16px 20px',
            borderRadius:16,
            background:'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(132,204,22,0.1))',
            border:'1px solid rgba(124,58,237,0.3)',
            backdropFilter:'blur(4px)'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <Fingerprint size={16} style={{ color:'#A78BFA' }} />
              <p style={{ color:'#A78BFA', fontSize:12, fontWeight:700, letterSpacing:'0.5px' }}>DEMO ACCESS</p>
              <Star size={12} style={{ color:'#84CC16', marginLeft:'auto' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
              <div>
                <p style={{ color:'#A8A5BE', fontSize:11, fontFamily:'var(--font-mono)', marginBottom:2 }}>
                  <span style={{ color:'#7C3AED' }}>📧</span> demo@vibekit.studio
                </p>
                <p style={{ color:'#A8A5BE', fontSize:11, fontFamily:'var(--font-mono)' }}>
                  <span style={{ color:'#84CC16' }}>🔒</span> Demo1234!
                </p>
              </div>
              <div style={{
                padding:'4px 10px',
                borderRadius:20,
                background:'rgba(124,58,237,0.2)',
                fontSize:10,
                color:'#A78BFA',
                fontWeight:600
              }}>
                Click to copy ✨
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p style={{
          textAlign:'center',
          color:'#5A5A6A',
          fontSize:12,
          marginTop:'2rem',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:6
        }}>
          <Shield size={12} />
          Secure authentication powered by VibeKit
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -20px) rotate(2deg); }
          66% { transform: translate(-10px, 10px) rotate(-2deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .page-enter {
          animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .glass:hover {
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4), 0 0 0 2px rgba(124,58,237,0.2);
        }
      `}</style>
    </div>
  )
}