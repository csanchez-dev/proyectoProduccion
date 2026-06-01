import app from './app'

import { logger } from './src/utils/logger'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  logger.info(`🚀 Agenda-service corriendo en puerto ${PORT}`)
})