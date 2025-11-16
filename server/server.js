const express = require('express');
const cors = require('cors');
const knex = require('knex');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const galleryRoutes = require('./routes/gallery');

const app = express();
app.use(cors());
app.use(express.json());

// configure DB (Postgres)
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.PGHOST || 'db',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'photoapp'
  }
});
app.set('db', db);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);

// static serving when using local filesystem storage
if (process.env.STORAGE_TYPE !== 's3') {
  app.use('/media', express.static(process.env.LOCAL_MEDIA_PATH || '/app/media'));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
