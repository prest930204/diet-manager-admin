import express from 'express';
import { createServer as createViteServer } from 'vite';
import pkg from 'pg';
const { Pool } = pkg;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  let pool: pkg.Pool | null = null;
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : undefined
    });

    // Initialize tables
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(255)
        );
        CREATE TABLE IF NOT EXISTS members (
          id VARCHAR(255) PRIMARY KEY,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          target_cal INTEGER,
          current_weight INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS diet_records (
          id SERIAL PRIMARY KEY,
          member_id VARCHAR(255) REFERENCES members(id) ON DELETE CASCADE,
          record_date DATE NOT NULL,
          calories INTEGER DEFAULT 0,
          carbs INTEGER DEFAULT 0,
          protein INTEGER DEFAULT 0,
          fat INTEGER DEFAULT 0,
          feedback TEXT,
          UNIQUE(member_id, record_date)
        );
        CREATE TABLE IF NOT EXISTS meals (
          id SERIAL PRIMARY KEY,
          record_id INTEGER REFERENCES diet_records(id) ON DELETE CASCADE,
          meal_type VARCHAR(50),
          description TEXT,
          calories INTEGER DEFAULT 0
        );
      `);
      console.log('Database tables verified/created.');
    } catch (err) {
      console.error('Error initializing DB:', err);
    }
  }

  const checkDB = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!pool) {
      return res.status(503).json({ error: 'DATABASE_URL is not configured. Please set it in AI Studio Secrets.' });
    }
    next();
  };

  app.post('/api/auth/login', checkDB, async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await pool!.query('SELECT * FROM admins WHERE username = $1 AND password = $2', [username, password]);
      if (result.rows.length > 0) {
        res.json({ success: true, user: result.rows[0] });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/register', checkDB, async (req, res) => {
    try {
      const { username, password, email, phone } = req.body;
      await pool!.query(
        'INSERT INTO admins (username, password, email, phone) VALUES ($1, $2, $3, $4)',
        [username, password, email, phone]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/members', checkDB, async (req, res) => {
    try {
      const result = await pool!.query('SELECT * FROM members ORDER BY name ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/members', checkDB, async (req, res) => {
    try {
      const { id, password, name, phone, targetCal } = req.body;
      await pool!.query(
        'INSERT INTO members (id, password, name, phone, target_cal) VALUES ($1, $2, $3, $4, $5)',
        [id, password, name, phone, targetCal]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/members/:id', checkDB, async (req, res) => {
    try {
      await pool!.query('DELETE FROM members WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/members/search', checkDB, async (req, res) => {
    try {
      const { id, phone } = req.query;
      const result = await pool!.query('SELECT * FROM members WHERE id = $1 AND phone = $2', [id, phone]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Member not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/diet-records', checkDB, async (req, res) => {
    try {
      const { memberId, month } = req.query; // month format: YYYY-MM
      const result = await pool!.query(`
        SELECT d.*, 
               COALESCE(json_agg(json_build_object('id', m.id, 'name', m.meal_type, 'desc', m.description, 'cal', m.calories)) FILTER (WHERE m.id IS NOT NULL), '[]') as meals
        FROM diet_records d
        LEFT JOIN meals m ON d.id = m.record_id
        WHERE d.member_id = $1 AND to_char(d.record_date, 'YYYY-MM') = $2
        GROUP BY d.id
      `, [memberId, month]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/diet-records/feedback', checkDB, async (req, res) => {
    try {
      const { memberId, date, feedback } = req.body;
      // Upsert feedback
      await pool!.query(`
        INSERT INTO diet_records (member_id, record_date, feedback)
        VALUES ($1, $2, $3)
        ON CONFLICT (member_id, record_date) 
        DO UPDATE SET feedback = EXCLUDED.feedback
      `, [memberId, date, feedback]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();