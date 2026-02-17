import type { Conference } from "../types/conference"

type Props = {
  conference: Conference
}

export default function ConferenceCard({ conference }: Props) {
  return (
 
    <div className="card">
      <h3>{conference.title}</h3>
      <img src="/conference-card.jpg" alt="conference card image" />
      <p>{conference.description}</p>
      <p>
        {new Date(conference.startTime).toLocaleTimeString()} -{" "}
        {new Date(conference.endTime).toLocaleTimeString()}
      </p>
      <p>{conference.location}</p>
      <p>Ponente: {conference.speaker.name}</p>

     <button className="btn">Inscribirse</button> 
    </div>

  )
}
