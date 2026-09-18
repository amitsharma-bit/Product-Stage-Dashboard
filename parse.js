const fs = require('fs');

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
      else if (c === '\r') {}
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const text = fs.readFileSync('sheet.csv', 'utf-8');
const rows = parseCSV(text);
const headers = rows[0];
const data = rows.slice(1).filter(r => r.length === headers.length).map(r => {
  const o = {};
  headers.forEach((h, i) => o[h] = r[i]);
  return o;
});

module.exports = { data, headers };

if (require.main === module) {
  console.log('total rows', data.length);
  console.log('stages', [...new Set(data.map(d => d['Product Stage']))]);
  console.log('states count', new Set(data.map(d => d.state)).size);
  console.log('missing geo', data.filter(d => !d.geo_coordinates).length);
  console.log('missing state', data.filter(d => !d.state).length);
  console.log('missing state rows', data.filter(d => !d.state).slice(0,5));
  console.log('sample', data[0]);
}
