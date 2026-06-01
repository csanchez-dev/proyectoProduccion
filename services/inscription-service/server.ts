import app from './app';

import { logger } from './src/utils/logger';

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`🚀 Inscription-service corriendo en puerto ${PORT}`);
});
