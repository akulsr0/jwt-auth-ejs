const mongoose = require('mongoose');
const config = require('config');

const dburl = config.get('DB_URL');

mongoose.connect(
  dburl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log(`Database Connected`);
  }
);
