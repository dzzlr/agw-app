const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/audit.log');

function writeAuditLog(event, data) {
  const logEntry = {
    event,
    data,
    timestamp: new Date().toISOString()
  };

  fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', (err) => {
    if (err) console.error('Failed to write audit log:', err);
  });
}

module.exports = { writeAuditLog };