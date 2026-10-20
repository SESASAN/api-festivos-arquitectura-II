require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/festivos';

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API de festivos escuchando en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('No fue posible conectar a MongoDB:', error.message);
    process.exit(1);
  });
