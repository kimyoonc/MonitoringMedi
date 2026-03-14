import express from 'express';
import cors from 'cors';
import { router } from './routes';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://monitoringmedi.vercel.app',
  ],
}));
app.use(express.json());
app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ success: false, error: '요청한 리소스를 찾을 수 없습니다.' });
});

export default app;
