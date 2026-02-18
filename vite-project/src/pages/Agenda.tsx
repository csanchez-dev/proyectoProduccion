import { useState } from "react"
import ConferenceCard from "../components/ConferenceCard"
import { conferences as initialConferences } from "../data/conference_mocks"

export default function Agenda() {
  const [conferencesList] = useState(() => {
    const saved = localStorage.getItem("site_conferences")
    return saved ? JSON.parse(saved) : initialConferences
  })

  return (
    <section className="agenda">
      <h2>Agenda CONIITI 2026</h2>

      {conferencesList.map((conf: any) => (
        <ConferenceCard key={conf.id} conference={conf} />
      ))}

    </section>
  )
}
