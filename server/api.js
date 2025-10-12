const express = require('express');
const cors = require('cors');
const { setPasswordForUser, createUser, deleteUser, getUserByEmail, admin } = require('./firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// Public building data by id or name
app.get('/api/public/building/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const { id } = req.params;

    // Resolve building (collection: 'gebaeude') by id then by name
    let buildingDoc = await db.doc(`gebaeude/${id}`).get();
    let building = null;
    if (buildingDoc.exists) {
      building = { id: buildingDoc.id, ...buildingDoc.data() };
    } else {
      const byNameSnap = await db.collection('gebaeude').where('name', '==', id).limit(1).get();
      if (!byNameSnap.empty) {
        const d = byNameSnap.docs[0];
        building = { id: d.id, ...d.data() };
      }
    }

    if (!building) return res.status(404).json({ error: 'not_found' });

    // Tasks: match either by name or by id
    const tasks = [];
    const seenTask = new Set();
    const taskQueries = [
      db.collection('tasks').where('gebaeude', '==', building.name).orderBy('erstellt', 'desc').get(),
      db.collection('tasks').where('gebaeudeId', '==', building.id).orderBy('erstellt', 'desc').get(),
    ];
    const taskResults = await Promise.allSettled(taskQueries);
    for (const r of taskResults) {
      if (r.status === 'fulfilled') {
        for (const d of r.value.docs) {
          if (seenTask.has(d.id)) continue;
          seenTask.add(d.id);
          tasks.push({ id: d.id, ...d.data() });
        }
      }
    }

    // Reports: support id, name, numeric legacy
    const reports = [];
    const seenRep = new Set();
    const reportQueries = [
      db.collection('meldungen').where('building', '==', building.id).orderBy('created', 'desc').get(),
      db.collection('meldungen').where('building', '==', building.name).orderBy('created', 'desc').get(),
    ];
    const num = Number(id);
    if (!Number.isNaN(num)) {
      reportQueries.push(db.collection('meldungen').where('building', '==', num).orderBy('created', 'desc').get());
    }
    const repResults = await Promise.allSettled(reportQueries);
    for (const r of repResults) {
      if (r.status === 'fulfilled') {
        for (const d of r.value.docs) {
          if (seenRep.has(d.id)) continue;
          seenRep.add(d.id);
          reports.push({ id: d.id, ...d.data() });
        }
      }
    }

    res.json({ building, tasks, reports });
  } catch (e) {
    console.error('Public building fetch failed', e);
    res.status(500).json({ error: 'server_error' });
  }
});
app.post('/api/users/set-password', async (req, res) => {
  const { uid, newPassword } = req.body;
  
  if (!uid || !newPassword) {
    return res.status(400).json({ error: 'UID und neues Passwort sind erforderlich' });
  }
  
  const result = await setPasswordForUser(uid, newPassword);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.post('/api/users/create', async (req, res) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
  }
  
  const result = await createUser(email, password, displayName);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.delete('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;
  
  const result = await deleteUser(uid);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  const { email } = req.params;
  
  const result = await getUserByEmail(email);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});