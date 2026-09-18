const fs = require('fs');
const rooftops = fs.readFileSync('rooftops.json', 'utf-8');
const paths = fs.readFileSync('map-paths.json', 'utf-8');
const noStateCount = JSON.parse(rooftops).filter(r => !r.stateAbbr).length;

let html = fs.readFileSync('template.html', 'utf-8');
html = html.replace('__ROOFTOPS_JSON__', rooftops.replace(/<\/script/g, '<\\/script'));
html = html.replace('__STATE_PATHS_JSON__', paths.replace(/<\/script/g, '<\\/script'));
html = html.replace('__NOSTATE_COUNT__', noStateCount);
fs.writeFileSync('rooftop-coverage.html', html);
console.log('wrote rooftop-coverage.html, bytes:', Buffer.byteLength(html));
