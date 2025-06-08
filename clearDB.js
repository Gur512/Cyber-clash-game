const db = require('./db'); 

db.run('DELETE FROM players', (err) => {
  if (err) {
    return console.error('Error clearing players table:', err.message);
  }
  console.log('All players deleted from the database.');
});

