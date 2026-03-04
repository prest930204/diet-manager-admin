import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
const { Pool } = pg;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  let pool: pg.Pool | null = null;
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
      `);
      
      // 기존 DB 테이블에 feedback 컬럼이 없다면 추가 (마이그레이션)
      try {
        await pool.query('ALTER TABLE health_log ADD COLUMN feedback TEXT;');
        console.log('Added feedback column to health_log table.');
      } catch (e) {
        // 이미 컬럼이 존재하면 에러가 발생하므로 무시합니다.
      }
      
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
      const result = await pool!.query('SELECT id, username, phone, target_calories as target_cal, target_weight FROM "user" ORDER BY username ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/members', checkDB, async (req, res) => {
    try {
      const { username, password, phone, targetCal, targetWeight } = req.body;
      await pool!.query(
        'INSERT INTO "user" (username, password, phone, target_calories, target_weight, role) VALUES ($1, $2, $3, $4, $5, $6)',
        [username, password, phone, targetCal, targetWeight || 0, 'user']
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/members/:id', checkDB, async (req, res) => {
    try {
      await pool!.query('DELETE FROM "user" WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/members/:id', checkDB, async (req, res) => {
    try {
      const { username, phone, targetCal, targetWeight } = req.body;
      await pool!.query(
        'UPDATE "user" SET username = $1, phone = $2, target_calories = $3, target_weight = $4 WHERE id = $5',
        [username, phone, targetCal, targetWeight || 0, req.params.id]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/members/search', checkDB, async (req, res) => {
    try {
      const { username, phone } = req.query;
      let query = 'SELECT id, username, phone, target_calories as target_cal, target_weight FROM "user" WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (username) {
        query += ` AND username = $${paramCount++}`;
        params.push(username);
      }
      if (phone) {
        query += ` AND phone = $${paramCount++}`;
        params.push(phone);
      }

      if (params.length === 0) {
        return res.status(400).json({ error: 'Search parameters required' });
      }

      const result = await pool!.query(query, params);
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
        SELECT id, user_id as member_id, date as record_date, 
               total_calories as calories, total_carbs as carbs, 
               total_protein as protein, total_fat as fat, 
               food_list, current_weight, feedback
        FROM health_log
        WHERE user_id = $1 AND to_char(date, 'YYYY-MM') = $2
      `, [memberId, month]);
      
      const records = result.rows.map(row => ({
        ...row,
        meals: row.food_list ? [{ id: row.id, name: '식단 기록', desc: row.food_list, cal: row.calories }] : []
      }));
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/diet-records/feedback', checkDB, async (req, res) => {
    try {
      const { memberId, date, feedback } = req.body;
      await pool!.query(`
        UPDATE health_log 
        SET feedback = $3 
        WHERE user_id = $1 AND to_char(date, 'YYYY-MM-DD') = $2
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