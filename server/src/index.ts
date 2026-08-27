import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 5000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`AITU Diploma API: http://localhost:${PORT}`);
});
