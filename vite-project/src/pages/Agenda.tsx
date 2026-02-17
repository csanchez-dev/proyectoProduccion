import ConferenceCard from "../components/ConferenceCard"
import { conferences } from "../data/conference_mocks"

export default function Agenda() {
  return (
    <section className="agenda">
      <h2>Agenda CONIITI 2026</h2>

      {conferences.map((conf) => (
        <ConferenceCard key={conf.id} conference={conf} />
      ))}
      
    </section>
  )
}
