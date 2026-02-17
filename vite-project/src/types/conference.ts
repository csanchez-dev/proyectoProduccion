export type Speaker = {
  name: string
  bio: string
  avatar: string
  organization?: string
}

export type Conference = {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  speaker: Speaker
  category?: string
  level?: string
}
