#!/usr/bin/node

import express from 'express';
import router from './routes/index.js';
import logger from './middleware/logger.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(logger);
app.use(express.json())
app.use(router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
