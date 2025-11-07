import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import pool from "./db.js";
import { hashPassword, verifyPassword, signToken } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN?.split(",") || "*",
  }),
);
app.use(express.json());

// tablo kurulumu
async function ensureSchema() {
  const sql = await fs.readFile(new URL("./init.sql", import.meta.url), "utf8");
  await pool.query(sql);
  console.log("✅ DB schema ready");
}
ensureSchema().catch((err) => console.error("DB init error:", err));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });
    const hash = await hashPassword(password);
    await pool.query(`INSERT INTO users(email, password_hash, username) VALUES ($1,$2,$3)`, [
      String(email).toLowerCase(),
      hash,
      username ?? null,
    ]);
    res.json({ ok: true });
  } catch (e: any) {
    if (String(e?.message).includes("duplicate key"))
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: "Server error", detail: String(e) });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const q = await pool.query(`SELECT id, password_hash FROM users WHERE email=$1`, [
      String(email).toLowerCase(),
    ]);
    if (!q.rows[0]) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await verifyPassword(password, q.rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken({ uid: q.rows[0].id });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: String(e) });
  }
});

app.listen(PORT, () => console.log(`API on :${PORT}`));


