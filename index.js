const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pool } = require('./src/db');
const { authMiddleware } = require('./src/auth');
const { router: usersRouter } = require('./src/routes/users.routes');
const { router: transactionsRouter } = require('./src/routes/transactions.routes');
const { router: goalsRouter } = require('./src/routes/goals.routes');
const { router: savingsRouter } = require('./src/routes/savings.routes');
const { router: exchangeRatesRouter } = require('./src/routes/exchangeRates.routes');

const PORT = process.env.PORT || 3000;
const app = express();

const allowed = [
  'https://proyecto-final-frontend-dfs.vercel.app',
  'https://backendbudgetmanager.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
});

app.use(limiter);

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      // Allow any localhost port in development
      if (origin && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      return cb(new Error('CORS blocked: ' + origin));
    },
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('API Gestor de presupuesto');
});

app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter);
app.use('/goals', goalsRouter);
app.use('/savings', savingsRouter);
app.use('/exchange-rates', exchangeRatesRouter);

app.get('/privado', authMiddleware, (req, res) => {
  return res.json({
    ok: true,
    user: req.user,
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
});

app.get('/health/db', async (req, res) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    return res.json({ ok: true, db: r.rows[0].ok });
  } catch (err) {
    console.log('DB Error', err.message);
    return res.status(500).json({ ok: false, error: 'DB unavailable' });
  }
});

const { errorHandler } = require('./src/middlewares/error.middleware');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
