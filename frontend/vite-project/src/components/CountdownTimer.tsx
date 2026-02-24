import { useState, useEffect } from "react"

export default function CountdownTimer() {
    const targetDate = new Date("2026-10-01T08:00:00").getTime()

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

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

    return (
        <div className="countdown-container fade-in">
            <div className="countdown-item">
                <span className="count-number">{timeLeft.days}</span>
                <span className="count-label">Días</span>
            </div>
            <div className="countdown-item">
                <span className="count-number">{timeLeft.hours}</span>
                <span className="count-label">Horas</span>
            </div>
            <div className="countdown-item">
                <span className="count-number">{timeLeft.minutes}</span>
                <span className="count-label">Minutos</span>
            </div>
            <div className="countdown-item">
                <span className="count-number">{timeLeft.seconds}</span>
                <span className="count-label">Segundos</span>
            </div>
        </div>
    )
}
