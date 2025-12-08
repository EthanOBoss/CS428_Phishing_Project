const express = require('express');
const cors = require('cors');
const db = require('./database/config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON bodies

// ============ API ROUTES ============

// Get reports by client
app.get('/api/reports/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const [rows] = await db.query('SELECT * FROM Report WHERE ClientID = ? ORDER BY DateReported DESC', [clientId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Report ORDER BY DateReported DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// get unreviewed reports
app.get('/api/reports/unreviewed', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Report WHERE Reviewed = 0 ORDER BY DateReported DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

//get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Client ORDER BY ClientName ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

//mark report as reviewed
app.put('/api/reports/:reportId/review', async (req, res) => {
  try {
    const { reportId } = req.params;

    await db.query(
      'UPDATE Report SET Reviewed = 1 WHERE ReportID = ?',
      [reportId]
    );

    res.json({ message: 'Report marked as reviewed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

//mark report as unreviewed
app.put('/api/reports/:reportId/review', async (req, res) => {
  try {
    const { reportId } = req.params;

    await db.query(
      'UPDATE Report SET Reviewed = 0 WHERE ReportID = ?',
      [reportId]
    );

    res.json({ message: 'Report marked as unreviewed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});