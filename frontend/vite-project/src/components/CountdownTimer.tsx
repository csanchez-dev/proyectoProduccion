import { useState, useEffect } from "react"
import { getTranslation } from "../utils/i18n"
import type { Language } from "../utils/i18n"

const countdownLabels: Record<Language, { days: string; hours: string; minutes: string; seconds: string }> = {
    es: { days: "Días", hours: "Horas", minutes: "Minutos", seconds: "Segundos" },
    en: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
    pt: { days: "Dias", hours: "Horas", minutes: "Minutos", seconds: "Segundos" },
    fr: { days: "Jours", hours: "Heures", minutes: "Minutes", seconds: "Secondes" },
    de: { days: "Tage", hours: "Stunden", minutes: "Minuten", seconds: "Sekunden" },
    it: { days: "Giorni", hours: "Ore", minutes: "Minuti", seconds: "Secondi" },
    zh: { days: "天", hours: "小时", minutes: "分钟", seconds: "秒" },
    hi: { days: "दिन", hours: "घंटे", minutes: "मिनट", seconds: "सेकंड" },
    ar: { days: "أيام", hours: "ساعات", minutes: "دقائق", seconds: "ثواني" },
    ja: { days: "日", hours: "時間", minutes: "分", seconds: "秒" },
}

export default function CountdownTimer() {
    const targetDate = new Date("2026-10-01T08:00:00").getTime()
    const [lang, setLang] = useState<Language>((localStorage.getItem("app_lang") as Language) || 'es')

    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0
    })

    useEffect(() => {
        const updateLang = () => setLang((localStorage.getItem("app_lang") as Language) || 'es')
        window.addEventListener('app-lang-updated', updateLang)
        return () => window.removeEventListener('app-lang-updated', updateLang)
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const difference = targetDate - now
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                })
            } else {
                clearInterval(timer)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const labels = countdownLabels[lang] || countdownLabels.es

    return (
        <div className="countdown-container fade-in">
            <div className="countdown-item">
                <span className="count-number">{timeLeft.days}</span>
                <span className="count-label">{labels.days}</span>
            </div>
            <div className="countdown-item">
                <span className="count-number">{timeLeft.hours}</span>
                <span className="count-label">{labels.hours}</span>
            </div>
            <div className="countdown-item">
                <span className="count-number">{timeLeft.minutes}</span>
                <span className="count-label">{labels.minutes}</span>
            </div>
            <div className="countdown-item">
                <span className="count-number">{timeLeft.seconds}</span>
                <span className="count-label">{labels.seconds}</span>
            </div>
        </div>
    )
}
