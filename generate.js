const fs = require('fs');
const rooftops = fs.readFileSync('rooftops.json', 'utf-8');
const paths = fs.readFileSync('map-paths.json', 'utf-8');
const noStateCount = JSON.parse(rooftops).filter(r => !r.stateAbbr).length;

let body = fs.readFileSync('template.html', 'utf-8');
body = body.replace('__ROOFTOPS_JSON__', rooftops.replace(/<\/script/g, '<\\/script'));
body = body.replace('__STATE_PATHS_JSON__', paths.replace(/<\/script/g, '<\\/script'));
body = body.replace('__NOSTATE_COUNT__', noStateCount);

const html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n${body}\n</body>\n</html>\n`;

fs.writeFileSync('rooftop-coverage.html', html);
fs.writeFileSync('index.html', html);
console.log('wrote rooftop-coverage.html + index.html, bytes:', Buffer.byteLength(html));
