'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Default translations based on the landing page structure
const initialTranslations = {
  uz: {
    meta_title: "Asadbek Arakulov - Ingliz tili o'qituvchisi",
    nav_about: "Biz haqimizda", nav_courses: "Kurslar", nav_mock: "Mock Test", nav_results: "Natijalar", nav_contact: "Aloqa",
    hero_title: "Ingliz tilini professional darajada o'rganing",
    hero_desc: "6 yillik tajriba, 70+ B2 sertifikatli o'quvchilar, amaliy va natijaga yo'naltirilgan ta'lim.",
    btn_enroll: "Darsga yozilish", btn_more: "Batafsil ma'lumot", btn_enroll_now: "Hoziroq yoziling", btn_map: "Yo'l topish",
    hero_stat1: "500+ O'quvchi", hero_stat2: "70+ B2", hero_stat3: "15K+ Instagram",
    stats_exp: "Yil tajriba", stats_students: "O'quvchilar", stats_certs: "B2 Sertifikat", stats_insta: "Instagram obunachi",
    about_title: "Asadbek Arakulov haqida",
    about_full_desc: "6 yillik tajriba davomida 500+ o'quvchiga ingliz tilini o'rgatib kelmoqdaman. Darslarim faqat nazariy emas — har bir dars amaliyotga asoslangan. Har shanba CEFR mock test o'tkazaman. Mock testdan 55+ ball olgan o'quvchilarga imtihon registratsiya pulini o'zim to'layman. Instagramda 15K+ obunachi bilan faol muloqotda bo'laman.",
    about_li1: "Tajriba: 6 yil+", about_li2: "Amaliy va natijaga yo'naltirilgan darslar", about_li3: "Har shanba bepul Mock Test", about_li4: "55+ ball → imtihon puli ustozdan", about_li5: "Instagram: 15K+ obunachi, pulli o'yinlar",
    certs_title: "Ustoz Sertifikatlari va Yutuqlari", cert_c1: "Ingliz tilida yuqori malaka darajasi", cert_aptis: "British Council tomonidan berilgan xalqaro sertifikat",
    courses_title: "Bizning Kurslar",
    mock_title: "Noyob Mock Test Tizimi", mock_desc: "O'zbekistonda birinchi marta — mock testdan o'tgan o'quvchilarga imtihon registratsiya pulini ustoz to'laydi!",
    mock_s1_title: "Har shanba CEFR mock test", mock_s1_desc: "Haqiqiy imtihon sharoitida test topshirasiz",
    mock_s2_title: "55+ ball olasiz", mock_s2_desc: "Maqsadli ball — B2 sertifikatiga yo'l",
    mock_s3_title: "Imtihon puli ustozdan", mock_s3_desc: "Registratsiya to'lovini ustoz Asadbek o'z zimmasiga oladi",
    rules_title: "Qoida va Shartlar", rule_1: "Faqat CEFR guruh o'quvchilari uchun", rule_2: "Har shanba soat 16:00 da", rule_3: "Natija e'lon qilinadi va 55+ ball olganlar ro'yxatga olinadi", rule_4: "Imtihon sanasi kelganda ustoz to'lov qiladi",
    results_title: "O'quvchilarimiz Natijalari", res_text1: "B2 Sertifikat olgan o'quvchilar", res_text2: "Bu yilda sertifikat olganlar", res_text3: "DTM dan 189/189 maksimal ball",
    sched_title: "Dars Jadvali", sched_time1: "Juft kunlari 14:00—16:00", sched_time2: "Har kuni 16:00—18:00",
    addr_1: "Jizzax viloyati, Forish tumani", addr_2: "Bog'don shaharchasi, \"Barkamol avlod\" majmuasi", addr_3: "Orientir: Forish tumani markazida joylashgan",
    contact_title: "Bog'lanish", footer_motto: "Ingliz tilini o'rganish — bu eng yaxshi investitsiya"
  },
  ru: {
    meta_title: "Асадбек Аракулов - Преподаватель английского",
    nav_about: "О нас", nav_courses: "Курсы", nav_mock: "Mock Test", nav_results: "Результаты", nav_contact: "Контакты",
    hero_title: "Изучайте английский язык профессионально",
    hero_desc: "6 лет опыта, 70+ учеников с сертификатом B2, практическое обучение.",
    btn_enroll: "Записаться на курс", btn_more: "Подробнее", btn_enroll_now: "Записаться сейчас", btn_map: "Маршрут",
    hero_stat1: "500+ Учеников", hero_stat2: "70+ B2", hero_stat3: "15K+ Instagram",
    stats_exp: "Лет опыта", stats_students: "Учеников", stats_certs: "Сертификатов B2", stats_insta: "Подписчиков",
    about_title: "Об Асадбеке Аракулове",
    about_full_desc: "За 6 лет опыта я обучил английскому более 500 студентов. Мои уроки не только теоретические — каждый урок основан на практике. Каждую субботу провожу CEFR mock test. Я лично оплачиваю регистрацию на экзамен студентам, набравшим 55+ баллов. Активно общаюсь в Instagram с 15K+ подписчиками.",
    about_li1: "Опыт: 6 лет+", about_li2: "Практические и результативные уроки", about_li3: "Бесплатный Mock Test каждую субботу", about_li4: "55+ баллов → оплата экзамена учителем", about_li5: "Instagram: 15K+ подписчиков, платные игры",
    certs_title: "Сертификаты и достижения", cert_c1: "Высокий уровень владения английским языком", cert_aptis: "Международный сертификат от British Council",
    courses_title: "Наши Курсы",
    mock_title: "Уникальная Система Mock Test", mock_desc: "Впервые в Узбекистане — учитель оплачивает регистрацию на экзамен ученикам, прошедшим mock test!",
    mock_s1_title: "CEFR mock test каждую субботу", mock_s1_desc: "Тестирование в условиях реального экзамена",
    mock_s2_title: "Наберите 55+ баллов", mock_s2_desc: "Целевой балл — путь к сертификату B2",
    mock_s3_title: "Экзамен оплатит учитель", mock_s3_desc: "Регистрационный взнос берет на себя учитель",
    rules_title: "Правила и условия", rule_1: "Только для учеников группы CEFR", rule_2: "Каждую субботу в 16:00", rule_3: "Объявляются результаты и регистрируются набравшие 55+ баллов", rule_4: "В день экзамена учитель производит оплату",
    results_title: "Результаты Наших Учеников", res_text1: "Учеников, получивших сертификат B2", res_text2: "Получивших сертификат в этом году", res_text3: "Максимальный балл DTM 189/189",
    sched_title: "Расписание Уроков", sched_time1: "Четные дни 14:00—16:00", sched_time2: "Каждый день 16:00—18:00",
    addr_1: "Джизакская область, Форишский район", addr_2: "Поселок Богдан, комплекс \"Баркамол авлод\"", addr_3: "Ориентир: В центре Форишского района",
    contact_title: "Связаться", footer_motto: "Изучение английского — лучшая инвестиция"
  },
  en: {
    meta_title: "Asadbek Arakulov - English Teacher",
    nav_about: "About Us", nav_courses: "Courses", nav_mock: "Mock Test", nav_results: "Results", nav_contact: "Contact",
    hero_title: "Learn English at a Professional Level",
    hero_desc: "6 years experience, 70+ B2 certified students, practical and result-oriented education.",
    btn_enroll: "Enroll Now", btn_more: "Learn More", btn_enroll_now: "Enroll Now", btn_map: "Get Directions",
    hero_stat1: "500+ Students", hero_stat2: "70+ B2", hero_stat3: "15K+ Instagram",
    stats_exp: "Years Experience", stats_students: "Students", stats_certs: "B2 Certificates", stats_insta: "Followers",
    about_title: "About Asadbek Arakulov",
    about_full_desc: "Over 6 years of experience, I have taught English to 500+ students. My classes are not just theoretical — every lesson is practice-based. I conduct CEFR mock tests every Saturday. I personally pay the exam registration fee for students who score 55+. I actively interact with 15K+ followers on Instagram.",
    about_li1: "Experience: 6+ years", about_li2: "Practical and result-oriented classes", about_li3: "Free Mock Test every Saturday", about_li4: "55+ score → exam paid by teacher", about_li5: "Instagram: 15K+ followers, paid games",
    certs_title: "Teacher Certificates & Achievements", cert_c1: "High level of English proficiency", cert_aptis: "International certificate by British Council",
    courses_title: "Our Courses",
    mock_title: "Unique Mock Test System", mock_desc: "For the first time in Uzbekistan — the teacher pays the exam registration fee for students who pass the mock test!",
    mock_s1_title: "CEFR mock test every Saturday", mock_s1_desc: "Take the test in real exam conditions",
    mock_s2_title: "Score 55+ points", mock_s2_desc: "Target score — path to B2 certificate",
    mock_s3_title: "Exam paid by teacher", mock_s3_desc: "Teacher Asadbek covers the registration fee",
    rules_title: "Rules and Conditions", rule_1: "Only for CEFR group students", rule_2: "Every Saturday at 16:00", rule_3: "Results are announced and 55+ scorers are registered", rule_4: "Payment is made by teacher on exam date",
    results_title: "Our Students' Results", res_text1: "Students obtained B2 certificate", res_text2: "Certified students this year", res_text3: "Max DTM score 189/189",
    sched_title: "Class Schedule", sched_time1: "Even days 14:00—16:00", sched_time2: "Every day 16:00—18:00",
    addr_1: "Jizzakh region, Forish district", addr_2: "Bogdon town, \"Barkamol avlod\" complex", addr_3: "Landmark: Center of Forish district",
    contact_title: "Contact Us", footer_motto: "Learning English is the best investment"
  }
}

export default function MessagesPage() {
  const [translations, setTranslations] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('settings').select('*').eq('key', 'site_translations')
      if (data && data.length > 0) {
        try {
          const parsed = JSON.parse(data[0].value)
          setTranslations(parsed)
        } catch (e) {
          setTranslations(initialTranslations)
        }
      } else {
        setTranslations(initialTranslations)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('settings').upsert({
      key: 'site_translations',
      value: JSON.stringify(translations),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' })
    
    if (error) {
      toast.error("Xatolik: " + error.message)
    } else {
      toast.success("Matnlar muvaffaqiyatli saqlandi! Saytda aks etadi.")
    }
    setSaving(false)
  }

  const handleUpdate = (lang: string, key: string, value: string) => {
    setTranslations((prev: any) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: value
      }
    }))
  }

  const handleAddKey = () => {
    if (!newKey) return
    const key = newKey.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    
    setTranslations((prev: any) => ({
      uz: { ...prev.uz, [key]: '' },
      ru: { ...prev.ru, [key]: '' },
      en: { ...prev.en, [key]: '' },
    }))
    setNewKey('')
    toast.success("Yangi matn klyuchi qo'shildi")
  }

  const handleDeleteKey = (key: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    setTranslations((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev))
      delete updated.uz[key]
      delete updated.ru[key]
      delete updated.en[key]
      return updated
    })
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} /></div>
  }

  // Get all unique keys
  const allKeys = Object.keys(translations.uz)

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? '12px' : '0', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-h1" style={{ fontSize: '24px' }}>Matnlar va Tarjimalar</h1>
          <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>Landing page dagi barcha yozuvlarni tahrirlash</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>

      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Yangi matn klyuchi (masalan: welcome_text)" 
            value={newKey} 
            onChange={(e) => setNewKey(e.target.value)} 
            style={{ flex: 1, width: isMobile ? '100%' : undefined }}
          />
          <button className="btn-primary" onClick={handleAddKey} style={{ whiteSpace: 'nowrap', width: isMobile ? '100%' : undefined }}><Plus size={16} /> Qo'shish</button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        {isMobile ? (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allKeys.map(key => (
              <div key={key} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#FF6B00', background: 'rgba(255,107,0,0.08)', padding: '3px 10px', borderRadius: 20 }}>{key}</span>
                  <button onClick={() => handleDeleteKey(key)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                </div>
                {['uz', 'ru', 'en'].map(lang => (
                  <div key={lang}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>{lang === 'uz' ? "O'zbekcha" : lang === 'ru' ? 'Ruscha' : 'Inglizcha'}</label>
                    <textarea className="form-input" style={{ minHeight: '52px', padding: '8px', fontSize: '13px', lineHeight: 1.4, width: '100%' }}
                      value={translations[lang]?.[key] || ''} onChange={e => handleUpdate(lang, key, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Klyuch</th>
                <th style={{ width: '25%' }}>O'zbekcha</th>
                <th style={{ width: '25%' }}>Ruscha</th>
                <th style={{ width: '25%' }}>Inglizcha</th>
                <th style={{ width: '10%' }}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {allKeys.map(key => (
                <tr key={key}>
                  <td className="admin-text" style={{ fontWeight: 600, fontSize: '13px' }}>{key}</td>
                  <td>
                    <textarea 
                      className="form-input" 
                      style={{ minHeight: '60px', padding: '8px', fontSize: '13px', lineHeight: 1.4 }} 
                      value={translations.uz[key] || ''} 
                      onChange={e => handleUpdate('uz', key, e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea 
                      className="form-input" 
                      style={{ minHeight: '60px', padding: '8px', fontSize: '13px', lineHeight: 1.4 }} 
                      value={translations.ru[key] || ''} 
                      onChange={e => handleUpdate('ru', key, e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea 
                      className="form-input" 
                      style={{ minHeight: '60px', padding: '8px', fontSize: '13px', lineHeight: 1.4 }} 
                      value={translations.en[key] || ''} 
                      onChange={e => handleUpdate('en', key, e.target.value)}
                    />
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteKey(key)} 
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#EF4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
