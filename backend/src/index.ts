import { createServer } from './infrastructure/http/server';

const PORT = process.env.PORT ?? 3001;
const app = createServer();

app.listen(PORT, () => {
  console.log(`Map Noir backend running on http://localhost:${PORT}`);
});
