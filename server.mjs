/**
 * Backend API Server for GeorgianTrip
 * Replaces Supabase PostgREST + Auth + Storage
 * 
 * Provides a Supabase-compatible REST API on top of iHost PostgreSQL
 */
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// ── Configuration (from .env) ──
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const S3_BUCKET = process.env.S3_BUCKET;
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
app.use(cors());
app.use(express.json());

// ── Auth Middleware ──
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) req.user = decoded;
    });
  }
  next();
}

// ══════════════════════════════════════
//  AUTH ENDPOINTS
// ══════════════════════════════════════

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, options } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const role = options?.data?.role || 'user';
    const metadata = options?.data || {};

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, user_metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, user_metadata, created_at`,
      [email, passwordHash, role, metadata.first_name, metadata.last_name, JSON.stringify(metadata)]
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, user_metadata: user.user_metadata }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { ...user, user_metadata: { ...user.user_metadata, role: user.role } },
      session: { access_token: token, user: { ...user, user_metadata: { ...user.user_metadata, role: user.role } } }
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: { message: 'Email already registered' } });
    }
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: { message: 'Invalid login credentials' } });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: { message: 'Invalid login credentials' } });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, user_metadata: { ...user.user_metadata, role: user.role } },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = {
      id: user.id, email: user.email, role: user.role,
      user_metadata: { ...user.user_metadata, role: user.role },
      created_at: user.created_at,
    };

    res.json({ user: userData, session: { access_token: token, user: userData } });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/auth/signout', (req, res) => {
  res.json({ error: null });
});

app.get('/auth/session', authenticateToken, (req, res) => {
  res.json({ session: { user: req.user, access_token: req.headers['authorization']?.split(' ')[1] } });
});

app.post('/auth/update-user', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    }
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  // Stub — email-based password reset. In production, integrate SMTP.
  res.json({ data: {}, error: null });
});

// ══════════════════════════════════════
//  EDGE FUNCTIONS (PayPal)
// ══════════════════════════════════════

app.post('/functions/:fnName', optionalAuth, async (req, res) => {
  const { fnName } = req.params;
  // Stub — PayPal edge functions need PayPal API integration
  if (fnName === 'paypal-create-order') {
    return res.json({ error: 'PayPal not yet configured on iHost' });
  }
  if (fnName === 'paypal-capture-order') {
    return res.json({ error: 'PayPal not yet configured on iHost' });
  }
  res.status(404).json({ error: `Unknown function: ${fnName}` });
});

// ══════════════════════════════════════
//  SUPABASE-COMPATIBLE /db ENDPOINT
// ══════════════════════════════════════

// Column cache for FK detection
let _columnCache = null;
async function getColumnCache() {
  if (_columnCache) return _columnCache;
  const { rows } = await pool.query(`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' ORDER BY table_name, ordinal_position
  `);
  _columnCache = {};
  for (const r of rows) {
    if (!_columnCache[r.table_name]) _columnCache[r.table_name] = [];
    _columnCache[r.table_name].push(r.column_name);
  }
  return _columnCache;
}
// Refresh column cache every 60s
setInterval(() => { _columnCache = null; }, 60000);

/**
 * Parse Supabase select string into main columns and join specs
 * e.g., "*, driver:drivers(*), images:car_images(*)" ->
 *   mainCols: ["*"], joins: [{alias: "driver", table: "drivers", fk: null, cols: "*"}, ...]
 */
function parseSelectString(selectStr) {
  if (!selectStr || selectStr === '*') return { mainCols: ['*'], joins: [] };

  const joins = [];
  const mainCols = [];
  let depth = 0;
  let current = '';

  // Split by commas at depth 0
  for (let i = 0; i < selectStr.length; i++) {
    const ch = selectStr[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      current = current.trim();
      if (current) processToken(current, mainCols, joins);
      current = '';
      continue;
    }
    current += ch;
  }
  current = current.trim();
  if (current) processToken(current, mainCols, joins);

  return { mainCols, joins };
}

function processToken(token, mainCols, joins) {
  // Check if this is a join: alias:table(cols) or alias:table!fk(cols) or table!inner(cols)
  const joinMatch = token.match(/^(?:(\w+):)?(\w+)(?:!(\w+))?\((.+)\)$/s);
  if (joinMatch) {
    const [, alias, table, fkHint, innerCols] = joinMatch;
    const { mainCols: subCols, joins: subJoins } = parseSelectString(innerCols);
    joins.push({
      alias: alias || table,
      table,
      fkHint: fkHint || null,
      cols: innerCols,
      subCols,
      subJoins,
      inner: fkHint === 'inner',
    });
  } else {
    mainCols.push(token.trim());
  }
}

/**
 * Determine FK column and direction for a join
 */
function resolveFK(mainTable, join, columns) {
  const { alias, table, fkHint } = join;
  const mainTableCols = columns[mainTable] || [];
  const joinTableCols = columns[table] || [];

  // 1. Explicit FK hint: extract column from constraint name
  if (fkHint && fkHint !== 'inner') {
    // Pattern: {table}_{column}_fkey -> column is between table_ and _fkey
    const fkMatch = fkHint.match(/^(\w+?)_(.+?)_fkey$/);
    if (fkMatch) {
      const col = fkMatch[2]; // e.g., "from_location_id"
      if (mainTableCols.includes(col)) {
        return { direction: 'many-to-one', mainCol: col, joinCol: 'id' };
      }
      if (joinTableCols.includes(col)) {
        return { direction: 'one-to-many', mainCol: 'id', joinCol: col };
      }
    }
  }

  // 2. Check if main table has {alias}_id
  const aliasId = `${alias}_id`;
  if (mainTableCols.includes(aliasId)) {
    return { direction: 'many-to-one', mainCol: aliasId, joinCol: 'id' };
  }

  // 3. Special: join alias matches a column ending in _id
  // e.g., tours:tour_id(*) => tour_bookings.tour_id = tours.id
  if (mainTableCols.includes(alias) && alias.endsWith('_id')) {
    return { direction: 'many-to-one', mainCol: alias, joinCol: 'id' };
  }

  // 4. Check if join table has {mainTable singular}_id
  const mainSingular = mainTable.replace(/s$/, '');
  const fkCol = `${mainSingular}_id`;
  if (joinTableCols.includes(fkCol)) {
    return { direction: 'one-to-many', mainCol: 'id', joinCol: fkCol };
  }

  // 5. Check if join table has {mainTable}_id (without singularization)
  if (joinTableCols.includes(`${mainTable}_id`)) {
    return { direction: 'one-to-many', mainCol: 'id', joinCol: `${mainTable}_id` };
  }

  // 6. Fallback: assume main table has {table singular}_id
  const joinSingular = table.replace(/s$/, '');
  if (mainTableCols.includes(`${joinSingular}_id`)) {
    return { direction: 'many-to-one', mainCol: `${joinSingular}_id`, joinCol: 'id' };
  }

  // Last resort: use alias_id in main table
  return { direction: 'many-to-one', mainCol: `${alias}_id`, joinCol: 'id' };
}

/**
 * Build SQL subquery for a join
 */
function buildJoinSubquery(mainTable, mainAlias, join, columns) {
  const fk = resolveFK(mainTable, join, columns);
  const { alias, table, cols, subJoins } = join;

  // Build subqueries for nested joins
  let nestedSubqueries = '';
  if (subJoins && subJoins.length > 0) {
    const subs = subJoins.map(sj => {
      const subSq = buildJoinSubquery(table, `"${alias}_sub"`, sj, columns);
      return `${subSq} as "${sj.alias}"`;
    });
    nestedSubqueries = ', ' + subs.join(', ');
  }

  // Determine what columns to select from joined table
  let selectCols;
  if (cols === '*' || (join.subCols && join.subCols.length === 1 && join.subCols[0] === '*')) {
    selectCols = `"${alias}_t".*`;
  } else {
    // Filter out nested joins from column list
    const plainCols = (join.subCols || []).filter(c => c !== '*').map(c => `"${alias}_t"."${c.trim()}"`);
    selectCols = plainCols.length > 0 ? plainCols.join(', ') : `"${alias}_t".*`;
  }

  if (fk.direction === 'many-to-one') {
    // Returns single object
    if (nestedSubqueries) {
      return `(SELECT row_to_json(x) FROM (SELECT ${selectCols}${nestedSubqueries} FROM "${table}" "${alias}_t" WHERE "${alias}_t"."${fk.joinCol}" = ${mainAlias}."${fk.mainCol}" LIMIT 1) x)`;
    }
    return `(SELECT row_to_json("${alias}_t") FROM "${table}" "${alias}_t" WHERE "${alias}_t"."${fk.joinCol}" = ${mainAlias}."${fk.mainCol}" LIMIT 1)`;
  } else {
    // Returns array
    return `COALESCE((SELECT json_agg("${alias}_t") FROM "${table}" "${alias}_t" WHERE "${alias}_t"."${fk.joinCol}" = ${mainAlias}."${fk.mainCol}"), '[]'::json)`;
  }
}

/**
 * Build WHERE clause from filters
 */
function buildWhereClause(filters, params) {
  const conditions = [];
  for (const f of filters) {
    const idx = params.length + 1;
    switch (f.type) {
      case 'eq':
        conditions.push(`"${f.col}" = $${idx}`); params.push(f.val); break;
      case 'neq':
        conditions.push(`"${f.col}" != $${idx}`); params.push(f.val); break;
      case 'gt':
        conditions.push(`"${f.col}" > $${idx}`); params.push(f.val); break;
      case 'lt':
        conditions.push(`"${f.col}" < $${idx}`); params.push(f.val); break;
      case 'gte':
        conditions.push(`"${f.col}" >= $${idx}`); params.push(f.val); break;
      case 'lte':
        conditions.push(`"${f.col}" <= $${idx}`); params.push(f.val); break;
      case 'in':
        conditions.push(`"${f.col}" = ANY($${idx})`); params.push(f.val); break;
      case 'ilike':
        conditions.push(`"${f.col}" ILIKE $${idx}`); params.push(f.val); break;
      case 'like':
        conditions.push(`"${f.col}" LIKE $${idx}`); params.push(f.val); break;
      case 'is':
        if (f.val === null || f.val === 'null') {
          conditions.push(`"${f.col}" IS NULL`);
        } else if (f.val === true || f.val === 'true') {
          conditions.push(`"${f.col}" IS TRUE`);
        } else if (f.val === false || f.val === 'false') {
          conditions.push(`"${f.col}" IS FALSE`);
        }
        break;
      case 'not':
        if (f.op === 'is' && (f.val === null || f.val === 'null')) {
          conditions.push(`"${f.col}" IS NOT NULL`);
        } else {
          conditions.push(`"${f.col}" != $${idx}`); params.push(f.val);
        }
        break;
      case 'or': {
        // Parse Supabase OR string: "name_en.ilike.%val%, name_ka.ilike.%val%"
        const orParts = parseOrString(f.val, params);
        if (orParts.length > 0) {
          conditions.push(`(${orParts.join(' OR ')})`);
        }
        break;
      }
    }
  }
  return conditions;
}

function parseOrString(orStr, params) {
  // Split by comma (not inside parentheses)
  const parts = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < orStr.length; i++) {
    const ch = orStr[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());

  return parts.map(part => {
    // format: col.op.value
    const firstDot = part.indexOf('.');
    if (firstDot === -1) return 'TRUE';
    const col = part.substring(0, firstDot);
    const rest = part.substring(firstDot + 1);
    const secondDot = rest.indexOf('.');
    if (secondDot === -1) return 'TRUE';
    const op = rest.substring(0, secondDot);
    const val = rest.substring(secondDot + 1);
    const idx = params.length + 1;

    switch (op) {
      case 'eq': params.push(val); return `"${col}" = $${idx}`;
      case 'neq': params.push(val); return `"${col}" != $${idx}`;
      case 'ilike': params.push(val); return `"${col}" ILIKE $${idx}`;
      case 'like': params.push(val); return `"${col}" LIKE $${idx}`;
      case 'gt': params.push(val); return `"${col}" > $${idx}`;
      case 'lt': params.push(val); return `"${col}" < $${idx}`;
      default: params.push(val); return `"${col}" = $${idx}`;
    }
  });
}

// ── Main /db Endpoint ──
app.post('/db', optionalAuth, async (req, res) => {
  try {
    const {
      table, operation, select, selectOptions, returnSelect,
      filters = [], order = [], limit, offset,
      data, upsertOptions, single, maybeSingle
    } = req.body;

    const columns = await getColumnCache();
    const params = [];
    let sql;
    let countOnly = selectOptions?.head === true && selectOptions?.count === 'exact';

    switch (operation) {
      // ─── SELECT ───
      case 'select': {
        if (countOnly) {
          // Count-only query
          sql = `SELECT COUNT(*) as count FROM "${table}"`;
          const conditions = buildWhereClause(filters, params);
          if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
          const { rows } = await pool.query(sql, params);
          return res.json({ data: null, count: parseInt(rows[0].count), error: null });
        }

        const { mainCols, joins } = parseSelectString(select);
        const mainAlias = `"${table}"`;

        // Build SELECT clause
        let selectParts = [];
        if (mainCols.includes('*')) {
          selectParts.push(`${mainAlias}.*`);
        } else {
          selectParts.push(...mainCols.map(c => `${mainAlias}."${c.trim()}"`));
        }

        // Add JOIN subqueries
        for (const join of joins) {
          const subSql = buildJoinSubquery(table, mainAlias, join, columns);
          selectParts.push(`${subSql} as "${join.alias}"`);
        }

        sql = `SELECT ${selectParts.join(', ')} FROM "${table}" ${mainAlias}`;

        // WHERE
        const conditions = buildWhereClause(filters, params);
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');

        // ORDER BY
        if (order.length > 0) {
          const orderParts = order.map(o => `${mainAlias}."${o.col}" ${o.ascending ? 'ASC' : 'DESC'}`);
          sql += ' ORDER BY ' + orderParts.join(', ');
        }

        // LIMIT & OFFSET
        if (limit) sql += ` LIMIT ${parseInt(limit)}`;
        if (offset) sql += ` OFFSET ${parseInt(offset)}`;

        const { rows } = await pool.query(sql, params);

        if (single) {
          return res.json({ data: rows[0] || null, error: rows.length === 0 ? 'Row not found' : null });
        }
        if (maybeSingle) {
          return res.json({ data: rows[0] || null, error: null });
        }
        return res.json({ data: rows, error: null });
      }

      // ─── INSERT ───
      case 'insert': {
        const items = Array.isArray(data) ? data : [data];
        const results = [];

        for (const item of items) {
          const cols = Object.keys(item);
          const vals = cols.map((_, i) => `$${i + 1}`);
          const itemParams = cols.map(c => {
            const v = item[c];
            if (v !== null && typeof v === 'object') return JSON.stringify(v);
            return v;
          });

          const returning = returnSelect ? (returnSelect === '*' ? '*' : returnSelect) : '*';
          const insertSql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')}) RETURNING ${returning}`;
          const { rows } = await pool.query(insertSql, itemParams);
          results.push(rows[0]);
        }

        const resultData = Array.isArray(data) ? results : results[0];
        if (single) return res.json({ data: resultData, error: null });
        return res.json({ data: resultData, error: null });
      }

      // ─── UPDATE ───
      case 'update': {
        const setClauses = [];
        const updateParams = [];
        let idx = 1;

        for (const [col, val] of Object.entries(data)) {
          setClauses.push(`"${col}" = $${idx}`);
          updateParams.push(val !== null && typeof val === 'object' ? JSON.stringify(val) : val);
          idx++;
        }

        const conditions = [];
        for (const f of filters) {
          switch (f.type) {
            case 'eq':
              conditions.push(`"${f.col}" = $${idx}`); updateParams.push(f.val); idx++; break;
            case 'neq':
              conditions.push(`"${f.col}" != $${idx}`); updateParams.push(f.val); idx++; break;
            case 'gt':
              conditions.push(`"${f.col}" > $${idx}`); updateParams.push(f.val); idx++; break;
            case 'lt':
              conditions.push(`"${f.col}" < $${idx}`); updateParams.push(f.val); idx++; break;
            default:
              conditions.push(`"${f.col}" = $${idx}`); updateParams.push(f.val); idx++; break;
          }
        }

        if (conditions.length === 0) {
          return res.status(400).json({ error: 'Filters required for update' });
        }

        const returning = returnSelect ? (returnSelect === '*' ? '*' : returnSelect) : '*';
        sql = `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE ${conditions.join(' AND ')} RETURNING ${returning}`;
        const { rows } = await pool.query(sql, updateParams);

        if (single) return res.json({ data: rows[0] || null, error: null });
        return res.json({ data: rows, error: null });
      }

      // ─── UPSERT ───
      case 'upsert': {
        const items = Array.isArray(data) ? data : [data];
        const results = [];
        const onConflict = upsertOptions?.onConflict || 'id';

        for (const item of items) {
          const cols = Object.keys(item);
          const vals = cols.map((_, i) => `$${i + 1}`);
          const itemParams = cols.map(c => {
            const v = item[c];
            if (v !== null && typeof v === 'object') return JSON.stringify(v);
            return v;
          });

          const updateCols = cols.filter(c => !onConflict.split(',').map(x => x.trim()).includes(c));
          const updateSet = updateCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');

          const returning = returnSelect ? (returnSelect === '*' ? '*' : returnSelect) : '*';
          let upsertSql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')})`;
          if (updateSet) {
            upsertSql += ` ON CONFLICT (${onConflict.split(',').map(c => `"${c.trim()}"`).join(',')}) DO UPDATE SET ${updateSet}`;
          } else {
            upsertSql += ` ON CONFLICT (${onConflict.split(',').map(c => `"${c.trim()}"`).join(',')}) DO NOTHING`;
          }
          upsertSql += ` RETURNING ${returning}`;

          const { rows } = await pool.query(upsertSql, itemParams);
          results.push(rows[0]);
        }

        const resultData = Array.isArray(data) ? results : results[0];
        if (single) return res.json({ data: resultData, error: null });
        return res.json({ data: resultData, error: null });
      }

      // ─── DELETE ───
      case 'delete': {
        const delParams = [];
        const conditions = [];
        let idx = 1;

        for (const f of filters) {
          switch (f.type) {
            case 'eq':
              conditions.push(`"${f.col}" = $${idx}`); delParams.push(f.val); idx++; break;
            default:
              conditions.push(`"${f.col}" = $${idx}`); delParams.push(f.val); idx++; break;
          }
        }

        if (conditions.length === 0) {
          return res.status(400).json({ error: 'Filters required for delete' });
        }

        sql = `DELETE FROM "${table}" WHERE ${conditions.join(' AND ')}`;
        await pool.query(sql, delParams);
        return res.json({ data: null, error: null });
      }

      default:
        return res.status(400).json({ error: `Unknown operation: ${operation}` });
    }
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  GENERIC REST API (PostgREST-like)
// ══════════════════════════════════════

// GET /rest/:table - Select with filters
app.get('/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const { select, order, limit, offset, ...filters } = req.query;

    // Build query
    let selectClause = select || '*';
    let sql = `SELECT ${selectClause} FROM "${table}"`;
    const params = [];
    const conditions = [];

    // Process filters (eq, neq, lt, gt, etc.)
    for (const [key, value] of Object.entries(filters)) {
      // Format: column=eq.value or column=neq.value
      if (typeof value === 'string' && value.includes('.')) {
        const [op, ...valParts] = value.split('.');
        const val = valParts.join('.');
        const paramIdx = params.length + 1;

        switch (op) {
          case 'eq': conditions.push(`"${key}" = $${paramIdx}`); params.push(val); break;
          case 'neq': conditions.push(`"${key}" != $${paramIdx}`); params.push(val); break;
          case 'gt': conditions.push(`"${key}" > $${paramIdx}`); params.push(val); break;
          case 'lt': conditions.push(`"${key}" < $${paramIdx}`); params.push(val); break;
          case 'gte': conditions.push(`"${key}" >= $${paramIdx}`); params.push(val); break;
          case 'lte': conditions.push(`"${key}" <= $${paramIdx}`); params.push(val); break;
          case 'is': conditions.push(`"${key}" IS ${val === 'null' ? 'NULL' : val}`); break;
          case 'like': conditions.push(`"${key}" LIKE $${paramIdx}`); params.push(val); break;
          case 'ilike': conditions.push(`"${key}" ILIKE $${paramIdx}`); params.push(val); break;
          default:
            conditions.push(`"${key}" = $${paramIdx}`);
            params.push(value);
        }
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    if (order) {
      const orderParts = order.split(',').map(o => {
        const [col, dir] = o.trim().split('.');
        return `"${col}" ${dir === 'desc' ? 'DESC' : 'ASC'}`;
      });
      sql += ' ORDER BY ' + orderParts.join(', ');
    }

    if (limit) sql += ` LIMIT ${parseInt(limit)}`;
    if (offset) sql += ` OFFSET ${parseInt(offset)}`;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /rest/:table - Insert
app.post('/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const data = Array.isArray(req.body) ? req.body[0] : req.body;
    const cols = Object.keys(data);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => {
      const v = data[c];
      if (typeof v === 'object' && v !== null) return JSON.stringify(v);
      return v;
    });

    const sql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`;
    const { rows } = await pool.query(sql, params);
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /rest/:table - Update
app.patch('/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const { _filters, ...data } = req.body;

    if (!_filters || Object.keys(_filters).length === 0) {
      return res.status(400).json({ error: 'Filters required for update' });
    }

    const setClauses = [];
    const params = [];
    let idx = 1;

    for (const [col, val] of Object.entries(data)) {
      setClauses.push(`"${col}" = $${idx}`);
      params.push(typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
      idx++;
    }

    const whereClauses = [];
    for (const [col, val] of Object.entries(_filters)) {
      whereClauses.push(`"${col}" = $${idx}`);
      params.push(val);
      idx++;
    }

    const sql = `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')} RETURNING *`;
    const { rows } = await pool.query(sql, params);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /rest/:table
app.delete('/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const filters = req.query;
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'string' && value.startsWith('eq.')) {
        params.push(value.slice(3));
        conditions.push(`"${key}" = $${params.length}`);
      }
    }

    if (conditions.length === 0) {
      return res.status(400).json({ error: 'Filters required for delete' });
    }

    const sql = `DELETE FROM "${table}" WHERE ${conditions.join(' AND ')}`;
    await pool.query(sql, params);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  ADVANCED QUERIES (with joins)
// ══════════════════════════════════════

// Cars with driver and transfer and images
app.get('/api/cars/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        row_to_json(d) as driver,
        row_to_json(t) as transfer,
        COALESCE(json_agg(ci ORDER BY ci.display_order) FILTER (WHERE ci.id IS NOT NULL), '[]') as images
      FROM cars c
      LEFT JOIN drivers d ON d.id = c.driver_id
      LEFT JOIN transfers t ON t.id = c.transfer_id
      LEFT JOIN car_images ci ON ci.car_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, d.id, t.id
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Car not found' });

    // Add location details to transfer
    if (rows[0].transfer) {
      const t = rows[0].transfer;
      const [fromLoc, toLoc] = await Promise.all([
        pool.query('SELECT * FROM locations WHERE id = $1', [t.from_location_id]),
        pool.query('SELECT * FROM locations WHERE id = $1', [t.to_location_id]),
      ]);
      rows[0].transfer.from_location = fromLoc.rows[0] || null;
      rows[0].transfer.to_location = toLoc.rows[0] || null;
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cars list (with driver)
app.get('/api/cars', async (req, res) => {
  try {
    const { active, verification_status, transfer_id } = req.query;
    let sql = `
      SELECT c.*,
        row_to_json(d) as driver
      FROM cars c
      LEFT JOIN drivers d ON d.id = c.driver_id
      WHERE 1=1
    `;
    const params = [];

    if (active !== undefined) {
      params.push(active === 'true');
      sql += ` AND c.active = $${params.length}`;
    }
    if (verification_status) {
      params.push(verification_status);
      sql += ` AND c.verification_status = $${params.length}`;
    }
    if (transfer_id) {
      params.push(transfer_id);
      sql += ` AND c.transfer_id = $${params.length}`;
    }

    sql += ' ORDER BY c.created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfers with locations
app.get('/api/transfers', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*,
        row_to_json(fl) as from_location,
        row_to_json(tl) as to_location
      FROM transfers t
      LEFT JOIN locations fl ON fl.id = t.from_location_id
      LEFT JOIN locations tl ON tl.id = t.to_location_id
      WHERE t.is_active = true
      ORDER BY t.display_order ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transfers/:idOrSlug', async (req, res) => {
  try {
    const val = req.params.idOrSlug;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    
    const { rows } = await pool.query(`
      SELECT t.*,
        row_to_json(fl) as from_location,
        row_to_json(tl) as to_location
      FROM transfers t
      LEFT JOIN locations fl ON fl.id = t.from_location_id
      LEFT JOIN locations tl ON tl.id = t.to_location_id
      WHERE ${isUuid ? 't.id = $1' : 't.slug = $1'}
    `, [val]);

    if (rows.length === 0) return res.status(404).json({ error: 'Transfer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer cars
app.get('/api/transfers/:id/cars', async (req, res) => {
  try {
    let { rows } = await pool.query(`
      SELECT c.*, row_to_json(d) as driver
      FROM cars c
      LEFT JOIN drivers d ON d.id = c.driver_id
      WHERE c.transfer_id = $1 AND c.active = true AND c.verification_status = 'approved'
    `, [req.params.id]);

    if (rows.length === 0) {
      // Fallback: all active approved cars
      const result = await pool.query(`
        SELECT c.*, row_to_json(d) as driver
        FROM cars c
        LEFT JOIN drivers d ON d.id = c.driver_id
        WHERE c.active = true AND c.verification_status = 'approved'
      `);
      rows = result.rows;
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tours
app.get('/api/tours', async (req, res) => {
  try {
    const { limit: lim, featured } = req.query;
    let sql = 'SELECT * FROM tours WHERE is_active = true ORDER BY display_order ASC';
    if (lim) sql += ` LIMIT ${parseInt(lim)}`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tours WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tour not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations ORDER BY name_en ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/locations/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Location not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hero settings
app.get('/api/hero-settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hero_settings LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/hero-settings/:id', authenticateToken, async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date().toISOString() };
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]);
    params.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE hero_settings SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// About content
app.get('/api/about', async (req, res) => {
  try {
    const [{ rows: content }, { rows: team }] = await Promise.all([
      pool.query('SELECT * FROM about_content ORDER BY display_order ASC'),
      pool.query('SELECT * FROM team_members ORDER BY display_order ASC'),
    ]);

    const structure = { hero: {}, story: { items: [] }, features: [], stats: [], values: [], team: team || [] };
    content.forEach(item => {
      if (item.section === 'hero') {
        structure.hero[item.key] = item.value;
        if (item.image_url) structure.hero.image_url = item.image_url;
      } else if (item.section === 'story') {
        structure.story[item.key] = item.value;
        if (item.image_url) structure.story.images = [...(structure.story.images || []), item.image_url];
      } else if (['features', 'stats', 'values'].includes(item.section)) {
        structure[item.section].push(item);
      }
    });

    res.json(structure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Site content
app.get('/api/site-content', async (req, res) => {
  try {
    const { page, section } = req.query;
    let sql = 'SELECT * FROM site_content';
    const params = [];
    const conditions = [];

    if (page) { params.push(page); conditions.push(`page = $${params.length}`); }
    if (section) { params.push(section); conditions.push(`section = $${params.length}`); }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY page, section';

    const { rows } = await pool.query(sql, params);

    if (page && !section) {
      const result = {};
      rows.forEach(r => { result[r.section] = r.content; });
      return res.json(result);
    }
    if (page && section) {
      return res.json(rows[0]?.content || null);
    }

    const result = {};
    rows.forEach(r => {
      if (!result[r.page]) result[r.page] = {};
      result[r.page][r.section] = r.content;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/site-content', authenticateToken, async (req, res) => {
  try {
    const { page, section, content } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO site_content (page, section, content, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (page, section) DO UPDATE SET content = $3, updated_at = now()
       RETURNING *`,
      [page, section, JSON.stringify(content)]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin settings
app.get('/api/admin-settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM admin_settings LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin phone numbers
app.get('/api/admin-phones', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM admin_phone_numbers ORDER BY is_primary DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SMS Settings
app.get('/api/sms-settings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sms_settings LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Car reviews
app.get('/api/car-reviews/:carId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM car_reviews WHERE car_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.params.carId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver reviews
app.get('/api/driver-reviews/:driverId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reviews WHERE driver_id = $1 ORDER BY created_at DESC LIMIT 5',
      [req.params.driverId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  RPC ENDPOINTS
// ══════════════════════════════════════

app.post('/rpc/create_booking_v2', async (req, res) => {
  try {
    const { booking_data } = req.body;
    const { rows } = await pool.query('SELECT create_booking_v2($1::jsonb)', [JSON.stringify(booking_data)]);
    res.json(rows[0].create_booking_v2);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rpc/create_tour_booking', async (req, res) => {
  try {
    const { booking_data } = req.body;
    const { rows } = await pool.query('SELECT create_tour_booking($1::jsonb)', [JSON.stringify(booking_data)]);
    res.json(rows[0].create_tour_booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  BOOKINGS
// ══════════════════════════════════════

app.get('/api/bookings/:id', async (req, res) => {
  try {
    // Try transfer bookings first
    const { rows: transfer } = await pool.query(`
      SELECT b.*,
        row_to_json(pl) as pickup_location,
        row_to_json(dl) as dropoff_location,
        row_to_json(c) as car,
        row_to_json(d) as driver
      FROM bookings b
      LEFT JOIN locations pl ON pl.id = b.pickup_location_id
      LEFT JOIN locations dl ON dl.id = b.dropoff_location_id
      LEFT JOIN cars c ON c.id = b.car_id
      LEFT JOIN drivers d ON d.id = b.driver_id
      WHERE b.id = $1
    `, [req.params.id]);

    if (transfer.length > 0) {
      return res.json({ ...transfer[0], type: 'transfer' });
    }

    // Try tour bookings
    const { rows: tour } = await pool.query(`
      SELECT tb.*, row_to_json(t) as tour
      FROM tour_bookings tb
      LEFT JOIN tours t ON t.id = tb.tour_id
      WHERE tb.id = $1
    `, [req.params.id]);

    if (tour.length > 0) {
      return res.json({ ...tour[0], type: 'tour' });
    }

    res.status(404).json({ error: 'Booking not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tour-bookings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT tb.*, row_to_json(t) as tours
      FROM tour_bookings tb
      LEFT JOIN tours t ON t.id = tb.tour_id
      ORDER BY tb.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tour-bookings/:id', authenticateToken, async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date().toISOString() };
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]);
    params.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE tour_bookings SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  SEARCH (cars for route)
// ══════════════════════════════════════

app.get('/api/search/cars', async (req, res) => {
  try {
    const { from_id, to_id } = req.query;

    // Find transfer for this route
    if (from_id && to_id) {
      const { rows: transfers } = await pool.query(
        'SELECT id FROM transfers WHERE from_location_id = $1 AND to_location_id = $2',
        [from_id, to_id]
      );

      if (transfers.length > 0) {
        const { rows } = await pool.query(`
          SELECT c.*, row_to_json(d) as driver
          FROM cars c
          LEFT JOIN drivers d ON d.id = c.driver_id
          WHERE c.transfer_id = $1 AND c.active = true AND c.verification_status = 'approved'
        `, [transfers[0].id]);

        if (rows.length > 0) return res.json(rows);
      }
    }

    // Fallback: all active+approved cars with driver pricing
    const { rows } = await pool.query(`
      SELECT c.*,
        json_build_object(
          'id', d.id, 'first_name', d.first_name, 'last_name', d.last_name,
          'rating', d.rating, 'reviews_count', d.reviews_count,
          'languages_spoken', d.languages_spoken, 'avatar_url', d.avatar_url,
          'verification_status', d.verification_status,
          'driver_pricing', COALESCE(
            (SELECT json_agg(dp) FROM driver_pricing dp WHERE dp.driver_id = d.id),
            '[]'
          )
        ) as driver
      FROM cars c
      LEFT JOIN drivers d ON d.id = c.driver_id
      WHERE c.active = true AND c.verification_status = 'approved'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  STORAGE (File Upload)
// ══════════════════════════════════════

app.post('/storage/upload', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const bucket = req.body.bucket || 'car-photos';
    const path = req.body.path || `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Map bucket/path to S3 key
    const key = `images/${path}`;

    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const publicUrl = `${S3_PUBLIC_URL}/${key}`;
    res.json({ publicUrl, key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  CONTACT & DRIVER APPS
// ══════════════════════════════════════

app.post('/api/contact', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.body.name, req.body.email, req.body.phone, req.body.subject, req.body.message]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/driver-application', async (req, res) => {
  try {
    const d = req.body;
    const { rows } = await pool.query(
      `INSERT INTO driver_applications (first_name, last_name, email, phone, city, car_make, car_model, car_year, experience_years, languages, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [d.first_name, d.last_name, d.email, d.phone, d.city, d.car_make, d.car_model, d.car_year, d.experience_years, d.languages, d.message]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  ADMIN CRUD
// ══════════════════════════════════════

// Drivers
app.get('/api/admin/drivers', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/drivers/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE drivers SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin cars
app.get('/api/admin/cars', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, row_to_json(d) as drivers
      FROM cars c
      LEFT JOIN drivers d ON d.id = c.driver_id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/cars/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE cars SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/cars/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin transfers
app.get('/api/admin/transfers', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, row_to_json(fl) as from_location, row_to_json(tl) as to_location
      FROM transfers t
      LEFT JOIN locations fl ON fl.id = t.from_location_id
      LEFT JOIN locations tl ON tl.id = t.to_location_id
      ORDER BY t.display_order ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/transfers', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const cols = Object.keys(d);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => typeof d[c] === 'object' ? JSON.stringify(d[c]) : d[c]);
    const { rows } = await pool.query(
      `INSERT INTO transfers (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/transfers/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE transfers SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/transfers/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM transfers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin tours
app.get('/api/admin/tours', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tours ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/tours', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const cols = Object.keys(d);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => {
      const v = d[c];
      if (typeof v === 'object' && v !== null) return JSON.stringify(v);
      return v;
    });
    const { rows } = await pool.query(
      `INSERT INTO tours (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/tours/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => {
      const v = data[c];
      if (typeof v === 'object' && v !== null) return JSON.stringify(v);
      return v;
    }), req.params.id];
    const { rows } = await pool.query(
      `UPDATE tours SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/tours/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM tours WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin locations
app.get('/api/admin/locations', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations ORDER BY name_en ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/locations', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const cols = Object.keys(d);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => d[c]);
    const { rows } = await pool.query(
      `INSERT INTO locations (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/locations/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE locations SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/locations/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin phone numbers CRUD
app.post('/api/admin-phones', authenticateToken, async (req, res) => {
  try {
    const { phone_number, label, is_primary } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO admin_phone_numbers (phone_number, label, is_primary) VALUES ($1, $2, $3) RETURNING *',
      [phone_number, label, is_primary || false]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin-phones/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE admin_phone_numbers SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin-phones/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM admin_phone_numbers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SMS logs
app.post('/api/sms-logs', async (req, res) => {
  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body];
    for (const log of logs) {
      await pool.query(
        `INSERT INTO sms_logs (booking_id, recipient_phone, recipient_type, message, status, error_message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [log.booking_id, log.recipient_phone, log.recipient_type, log.message, log.status, log.error_message]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const [cars, drivers, bookings, tourBookings, tours] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM cars'),
      pool.query('SELECT COUNT(*) FROM drivers'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COUNT(*) FROM tour_bookings'),
      pool.query('SELECT COUNT(*) FROM tours'),
    ]);
    res.json({
      cars: parseInt(cars.rows[0].count),
      drivers: parseInt(drivers.rows[0].count),
      bookings: parseInt(bookings.rows[0].count),
      tour_bookings: parseInt(tourBookings.rows[0].count),
      tours: parseInt(tours.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// About content CRUD
app.post('/api/about-content', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const cols = Object.keys(d);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => typeof d[c] === 'object' ? JSON.stringify(d[c]) : d[c]);
    const { rows } = await pool.query(
      `INSERT INTO about_content (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/about-content/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE about_content SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/about-content/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM about_content WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Team members CRUD
app.get('/api/team-members', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM team_members ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/team-members', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const cols = Object.keys(d);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => typeof d[c] === 'object' ? JSON.stringify(d[c]) : d[c]);
    const { rows } = await pool.query(
      `INSERT INTO team_members (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/team-members/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE team_members SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/team-members/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin settings update
app.patch('/api/admin-settings/:id', authenticateToken, async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date().toISOString() };
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE admin_settings SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin-settings', authenticateToken, async (req, res) => {
  try {
    const d = req.body;
    const cols = Object.keys(d);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const params = cols.map(c => typeof d[c] === 'object' ? JSON.stringify(d[c]) : d[c]);
    const { rows } = await pool.query(
      `INSERT INTO admin_settings (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SMS settings update
app.patch('/api/sms-settings/:id', authenticateToken, async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date().toISOString() };
    const cols = Object.keys(data);
    const sets = cols.map((c, i) => `"${c}" = $${i + 1}`);
    const params = [...cols.map(c => typeof data[c] === 'object' ? JSON.stringify(data[c]) : data[c]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE sms_settings SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  STATIC FILES + SPA FALLBACK
// ══════════════════════════════════════
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ══════════════════════════════════════
//  START
// ══════════════════════════════════════

app.listen(PORT, () => {
  console.log(`\n🚀 GeorgianTrip API Server running on http://localhost:${PORT}`);
  console.log(`   Database: iHost PostgreSQL (194.163.172.62)`);
  console.log(`   Storage:  iHost S3 (s3.ihost.ge)`);
  console.log(`   Auth:     JWT-based`);
  console.log(`   Static:   ${distPath}\n`);
});
