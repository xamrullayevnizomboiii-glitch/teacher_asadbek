'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, UserProfile } from '@/lib/supabase'
import {
  LayoutDashboard, BookOpen, Users, Star, BarChart3,
  Settings, LogOut, Menu, Bell, ChevronRight, GraduationCap,
  Sun, Moon, X, MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'moderator'] },
  { href: '/admin/courses', label: 'Kurslar', icon: BookOpen, roles: ['super_admin', 'admin'] },
  { href: '/admin/enrollments', label: 'Yozilishlar', icon: Users, roles: ['super_admin', 'admin', 'moderator'] },
  { href: '/admin/reviews', label: 'Sharhlar', icon: Star, roles: ['super_admin', 'admin', 'moderator'] },
  { href: '/admin/statistics', label: 'Statistika', icon: BarChart3, roles: ['super_admin', 'admin'] },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users, roles: ['super_admin'] },
  { href: '/admin/messages', label: 'Matnlar (Tarjimalar)', icon: MessageSquare, roles: ['super_admin', 'admin'] },
  { href: '/admin/settings', label: 'Sozlamalar', icon: Settings, roles: ['super_admin', 'admin'] },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Apply saved theme immediately
    const saved = (localStorage.getItem('admin-theme') || 'dark') as 'dark' | 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      // Try to get profile from users table
      const { data: profile } = await supabase
        .from('users').select('*').eq('id', session.user.id).single()
      
      if (profile) {
        setUser(profile as UserProfile)
      } else {
        // Fallback: use auth session data, assume super_admin for first user
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin',
          role: 'super_admin',
          avatar_url: null,
          created_at: session.user.created_at,
        })
      }

      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPendingCount(count || 0)
      setAuthChecked(true)
    }
    init()

    // Listen for auth changes (logout from another tab, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, [router])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('admin-theme', next)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Chiqildi!')
    router.replace('/login')
  }

  const currentPage = navItems.find(n => n.href === pathname)
  // Show all nav items as fallback while user profile loads
  const filteredNav = user?.role 
    ? navItems.filter(item => item.roles.includes(user.role))
    : navItems // fallback: show all while loading

  const isDark = theme === 'dark'

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(255,107,0,0.2)', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px' }}>Tekshirilmoqda...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', background: 'var(--bg-sidebar)' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', padding: '4px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 38, height: 38, background: 'rgba(255,107,0,0.15)', border: '1.5px solid rgba(255,107,0,0.4)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GraduationCap size={20} color="#FF6B00" />
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <p style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.2 }}>AA Admin</p>
              <p style={{ fontSize: '11px', color: '#FF6B00', fontWeight: 600 }}>Panel</p>
            </div>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav label */}
      {(!collapsed || isMobile) && (
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>
          Navigatsiya
        </p>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filteredNav.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !isMobile ? item.label : undefined}
              style={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {(!collapsed || isMobile) && active && (
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#FF6B00' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user info */}
      {user && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '12px', background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.1)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: 'white', flexShrink: 0 }}>
              {user.full_name?.charAt(0) || 'A'}
            </div>
            {(!collapsed || isMobile) && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.full_name}</p>
                  <p style={{ fontSize: '11px', color: '#FF6B00', fontWeight: 600, textTransform: 'capitalize' }}>{user.role?.replace('_', ' ')}</p>
                </div>
                <button onClick={handleLogout} title="Chiqish" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const sidebarW = collapsed ? 68 : 244

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: sidebarW, background: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255,107,0,0.2)',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 30, transition: 'width 0.25s ease',
        boxShadow: isDark ? '2px 0 12px rgba(0,0,0,0.2)' : '2px 0 12px rgba(0,0,0,0.04)',
      }}>
        <SidebarInner />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', top: 76, right: -13,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--bg-card)', border: `1px solid var(--border-color)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}>
          <ChevronRight size={13} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }} />
        </button>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
            onClick={() => setMobileOpen(false)} />
          <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, boxShadow: '4px 0 24px rgba(0,0,0,0.2)', zIndex: 1 }}>
            <SidebarInner isMobile />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarW, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.25s ease', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 64, background: 'var(--bg-sidebar)',
          borderBottom: '1px solid rgba(255,107,0,0.2)',
          display: 'flex', alignItems: 'center',
          paddingInline: '20px', gap: '12px',
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Hamburger (mobile) */}
          <button onClick={() => setMobileOpen(true)}
            style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', minWidth: 0 }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Admin</span>
            <ChevronRight size={14} color="var(--text-muted)" style={{ opacity: 0.4, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-main)', fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {currentPage?.label || 'Dashboard'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={{
            background: 'rgba(255,107,0,0.08)', border: '1px solid var(--border-color)',
            borderRadius: '10px', padding: '7px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 600, color: 'var(--text-main)',
            transition: 'all 0.2s',
          }}>
            {isDark
              ? <><Sun size={15} color="#EAB308" /><span>Light</span></>
              : <><Moon size={15} color="#6366F1" /><span>Dark</span></>
            }
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <Link href="/admin/enrollments" style={{
              display: 'flex', textDecoration: 'none',
              background: 'rgba(255,107,0,0.08)', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '8px', color: 'var(--text-muted)', cursor: 'pointer',
            }}>
              <Bell size={18} />
              {pendingCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#FF6B00', color: 'white', fontSize: '10px', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          </div>

          {/* Avatar Dropdown */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,107,0,0.08)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-main)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: 'white' }}>
                  {user.full_name?.charAt(0) || 'A'}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.full_name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setDropdownOpen(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '8px', minWidth: 200, zIndex: 40, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{user.full_name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</p>
                      <span style={{ fontSize: '11px', color: '#FF6B00', fontWeight: 600, textTransform: 'capitalize' }}>{user.role?.replace('_', ' ')}</span>
                    </div>
                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <LogOut size={14} /> Tizimdan chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Page */}
        <main style={{ flex: 1, padding: '28px 24px', background: 'var(--bg-main)', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
