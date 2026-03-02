import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("rma.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    release_date TEXT,
    v2_release_date TEXT
  );

  CREATE TABLE IF NOT EXISTS rma_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    defect_type TEXT NOT NULL,
    report_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS improvements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    description TEXT NOT NULL,
    implementation_date TEXT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed Data
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const products = [
    ["Razer DeathAdder V4 Pro", "Mice", "2024-10-15", null],
    ["Razer DeathAdder V3 Pro", "Mice", "2022-08-11", "2024-04-16"],
    ["Razer Viper V3 Pro", "Mice", "2024-04-23", null],
    ["Razer Basilisk V3 Pro 35K", "Mice", "2024-09-20", null],
    ["Razer Basilisk V3 Pro", "Mice", "2022-08-23", "2024-10-01"],
    ["Razer BlackShark V2 Pro", "Headsets", "2020-09-22", "2023-04-20"],
    ["Razer BlackShark V3 X Hyperspeed", "Headsets", "2024-11-05", null],
    ["Razer Huntsman V3 Pro", "Keyboards", "2023-10-19", null],
    ["Razer Blade 16", "Laptops", "2023-01-05", "2024-01-08"],
    ["Razer Kiyo V2", "Cameras", "2024-10-01", null],
    ["Razer Kiyo Pro Ultra", "Cameras", "2023-01-05", null],
    ["Razer Leviathan V2 Pro", "Audio", "2023-01-05", null],
    ["Razer Enki Pro", "Chairs", "2022-05-24", null],
    ["Razer Cobra Pro", "Mice", "2023-06-29", null],
    ["Razer Naga V2 Pro", "Mice", "2022-11-10", null],
    ["Razer Pro Click V2", "Productivity", "2023-03-15", null]
  ];

  const insertProduct = db.prepare("INSERT INTO products (name, category, release_date, v2_release_date) VALUES (?, ?, ?, ?)");
  products.forEach(p => insertProduct.run(p));

  // Generate some random RMA records
  const defectTypes = ["Sensor Issue", "Click Double-Clicking", "Battery Swelling", "Connection Drop", "Build Quality", "Software Bug"];
  const insertRMA = db.prepare("INSERT INTO rma_records (product_id, defect_type, report_date) VALUES (?, ?, ?)");
  
  // For each product, generate data over the last 12 months
  for (let i = 1; i <= products.length; i++) {
    for (let month = 0; month < 12; month++) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      const dateString = date.toISOString().split('T')[0];
      
      // Random number of RMAs per month (simulating a trend)
      // Some products have higher RMA rates initially, then it drops (improvement)
      let baseRate = Math.floor(Math.random() * 10) + 5;
      if (month > 6) baseRate += 10; // More RMAs in the past

      for (let r = 0; r < baseRate; r++) {
        insertRMA.run(i, defectTypes[Math.floor(Math.random() * defectTypes.length)], dateString);
      }
    }
  }

  // Seed some improvements
  const insertImprovement = db.prepare("INSERT INTO improvements (product_id, description, implementation_date) VALUES (?, ?, ?)");
  insertImprovement.run(1, "Firmware update for sensor stability", "2023-06-15");
  insertImprovement.run(1, "Switch to Gen-3 Optical Switches", "2024-04-16");
  insertImprovement.run(6, "Updated thermal paste application process", "2023-11-01");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/stats/overview", (req, res) => {
    const totalRMAs = db.prepare("SELECT COUNT(*) as count FROM rma_records").get() as any;
    const topDefects = db.prepare(`
      SELECT defect_type, COUNT(*) as count 
      FROM rma_records 
      GROUP BY defect_type 
      ORDER BY count DESC 
      LIMIT 5
    `).all();
    
    const monthlyTrend = db.prepare(`
      SELECT strftime('%Y-%m', report_date) as month, COUNT(*) as count 
      FROM rma_records 
      GROUP BY month 
      ORDER BY month ASC
    `).all();

    res.json({
      totalRMAs: totalRMAs.count,
      topDefects,
      monthlyTrend
    });
  });

  app.get("/api/products/:id/stats", (req, res) => {
    const { id } = req.params;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    const rmas = db.prepare(`
      SELECT strftime('%Y-%m', report_date) as month, COUNT(*) as count 
      FROM rma_records 
      WHERE product_id = ? 
      GROUP BY month 
      ORDER BY month ASC
    `).all(id);
    
    const improvements = db.prepare("SELECT * FROM improvements WHERE product_id = ?").all(id);
    const defectDistribution = db.prepare(`
      SELECT defect_type, COUNT(*) as count 
      FROM rma_records 
      WHERE product_id = ? 
      GROUP BY defect_type
    `).all(id);

    res.json({
      product,
      rmas,
      improvements,
      defectDistribution
    });
  });

  app.get("/api/stats/trends", (req, res) => {
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM products p
      JOIN rma_records r ON p.id = r.product_id
      GROUP BY category
      ORDER BY count DESC
    `).all();

    const defectVelocity = db.prepare(`
      SELECT defect_type, 
             COUNT(CASE WHEN report_date >= date('now', '-30 days') THEN 1 END) as recent_count,
             COUNT(CASE WHEN report_date < date('now', '-30 days') AND report_date >= date('now', '-60 days') THEN 1 END) as previous_count
      FROM rma_records
      GROUP BY defect_type
      HAVING recent_count > 0
    `).all();

    res.json({
      categoryStats,
      defectVelocity
    });
  });

  app.get("/api/rma/recent", (req, res) => {
    const recentRMAs = db.prepare(`
      SELECT r.*, p.name as product_name, p.category
      FROM rma_records r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.report_date DESC, r.id DESC
      LIMIT 50
    `).all();
    res.json(recentRMAs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
