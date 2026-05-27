'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/admin')
    })
  }, [router])

  const showAlert = (type: 'error' | 'success', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { showAlert('error', 'Email va parolni kiriting!'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      showAlert('error', 'Email yoki parol noto\'g\'ri! Qaytadan urinib ko\'ring.')
      setLoading(false)
      return
    }
    showAlert('success', 'Xush kelibsiz! Yo\'naltirilmoqda...')
    setTimeout(() => router.push('/admin'), 1000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Alert - sahifa o'rtasida yuqorida */}
      {alert && (
        <div style={{
          position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, minWidth: '340px', maxWidth: '480px',
          background: alert.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1.5px solid ${alert.type === 'success' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
          borderRadius: '14px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 8px 32px ${alert.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          animation: 'toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {alert.type === 'success'
            ? <CheckCircle size={22} color="#22C55E" style={{ flexShrink: 0 }} />
            : <AlertCircle size={22} color="#EF4444" style={{ flexShrink: 0 }} />
          }
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: alert.type === 'success' ? '#22C55E' : '#EF4444' }}>
              {alert.type === 'success' ? 'Muvaffaqiyat!' : 'Xatolik!'}
            </p>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>{alert.message}</p>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Teacher Photo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
            border: '3px solid #FF6B00',
            boxShadow: '0 0 0 6px rgba(255,107,0,0.15), 0 8px 32px rgba(255,107,0,0.3)',
            overflow: 'hidden', position: 'relative',
          }}>
            <Image
              src="/teacher.jpg"
              alt="Asadbek Arakulov"
              width={100}
              height={100}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <h1 className="admin-h1" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>
            Asadbek <span style={{ color: '#FF6B00' }}>Arakulov</span>
          </h1>
          <p className="admin-text" style={{ fontSize: '13px', marginTop: '4px' }}>Admin boshqaruv paneli</p>
        </div>

        {/* Card */}
        <div className="admin-card" style={{
          backdropFilter: 'blur(16px)',
          borderRadius: '24px', padding: '36px',
        }}>
          <h2 className="admin-h1" style={{ fontSize: '18px', marginBottom: '24px', textAlign: 'center' }}>
            Tizimga kirish
          </h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ color: 'var(--login-label-color)' }}>Email manzil</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label className="form-label" style={{ color: 'var(--login-label-color)' }}>Parol</label>
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '44px' }}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#FF6B00' }} />
              <label htmlFor="remember" className="admin-text" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Meni eslab qol (24 soat)
              </label>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px', borderRadius: '12px' }}>
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Kirilmoqda...</>
                : <>Kirish &rarr;</>
              }
            </button>
          </form>
        </div>

        <p className="admin-text" style={{ textAlign: 'center', fontSize: '12px', marginTop: '20px' }}>
          © 2025 Asadbek Arakulov. Barcha huquqlar himoyalangan.
        </p>
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
