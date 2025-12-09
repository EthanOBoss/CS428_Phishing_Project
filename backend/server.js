const express = require('express');
const cors = require('cors');
const db = require('./database/config');
require('dotenv').config();

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { simpleParser } = require('mailparser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON bodies


//store the uploaded .eml files - using multer
const storage = multer.diskStorage({
    //save files to uploads folder 
  destination: (req, file, cb) => cb(null, './uploads'),
  //generate unique file name for the .eml file
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

//initialize multer
const upload = multer({ storage });

//parse eml file
async function parseEml(filePath) {
  const buffer = fs.readFileSync(filePath);
  return await simpleParser(buffer);
}


//handles file upload, database lookup, inserting data
app.post('/api/submit', upload.single('file'), async (req, res) => {
  try {
    //extract submitted form fields
    const { company, name, email, description } = req.body;
    const filePath = req.file ? req.file.path : null;
    //parse .eml
    let parsed = filePath ? await parseEml(filePath) : null;

    //extract parsed data
    const emailSender = parsed?.from?.text || "Unknown Sender";
    const emailContents = parsed?.text || parsed?.html || "No email content";

    //check if the client already exists in DB
    const [clientRows] = await db.query(
      "SELECT ClientID FROM Client WHERE ClientEmail = ?",
      [email]
    );

    let clientID;
    if (clientRows.length > 0) {
        //if client already exists, use existing clientID
      clientID = clientRows[0].ClientID;
    } else {
        //if client doesn't exist, add new client
      const [result] = await db.query(
        "INSERT INTO Client (ClientName, ClientEmail) VALUES (?, ?)",
        [company || "Unknown Company", email]
      );
      clientID = result.insertId;
    }

    //check if the employee exists in DB
    const [employeeRows] = await db.query(
      "SELECT EmployeeID FROM Employee WHERE EmployeeEmail = ?",
      [email]
    );

    let employeeID;
    if (employeeRows.length > 0) {
        //if employee already exists, use existing employeeID
      employeeID = employeeRows[0].EmployeeID;
    } else {
        //if employee doesn't exist, add new employee
      const [result] = await db.query(
        "INSERT INTO Employee (EmployeeEmail, ClientID) VALUES (?, ?)",
        [email, clientID]
      );
      employeeID = result.insertId;
    }

    //store parsed email data and employee submitted info
    await db.query(
      `INSERT INTO Report 
        (EmailContents, EmployeeMessage, DateReported, EmailSender, Reviewed, EmployeeID, ClientID)
       VALUES (?, ?, NOW(), ?, 0, ?, ?)`,
      [emailContents, description, emailSender, employeeID, clientID]
    );

    res.json({
      status: "success",
      message: "Report submitted successfully",
      clientID,
      employeeID
    });

  } catch (error) {
    console.error("Submit route error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


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
