const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const dbPath = path.join(__dirname, 'test.db');
let child; let port; let cookie;
function request(method, route, body) { return new Promise((resolve, reject) => { const req = http.request({ method, port, path: route, headers: { 'Content-Type': 'application/json', Host: `127.0.0.1:${port}`, Origin: `http://127.0.0.1:${port}`, ...(cookie ? { Cookie: cookie } : {}) } }, (res) => { let data = ''; res.on('data', (chunk) => { data += chunk; }); res.on('end', () => { if (res.headers['set-cookie']) cookie = res.headers['set-cookie'][0].split(';')[0]; resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }); }); req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end(); }); }
test.before(async () => { try { fs.unlinkSync(dbPath); } catch {} child = execFile(process.execPath, ['server.js'], { env: { ...process.env, PORT: '0', DB_PATH: dbPath, SESSION_SECRET: 'test' } }); child.stderr.on('data', (chunk) => process.stderr.write(chunk)); await new Promise((resolve, reject) => { child.stdout.on('data', (chunk) => { const match = chunk.toString().match(/:(\d+)/); if (match) { port = Number(match[1]); resolve(); } }); child.on('error', reject); }); });
test.after(() => { child.kill(); try { fs.unlinkSync(dbPath); } catch {} });
test('registers, authenticates, and lists events', async () => { const registered = await request('POST', '/api/auth/register', { name: 'Test User', email: 'test@example.com', password: 'a-secure-password' }); assert.equal(registered.status, 201, JSON.stringify(registered.body)); assert.equal(registered.body.user.role, 'MEMBER'); const me = await request('GET', '/api/auth/me'); assert.equal(me.body.user.email, 'test@example.com'); const events = await request('GET', '/api/events'); assert.equal(events.status, 200); assert.deepEqual(events.body.events, []); });
test('rejects weak passwords and unauthenticated submissions', async () => { cookie = undefined; const weak = await request('POST', '/api/auth/register', { name: 'Weak', email: 'weak@example.com', password: 'short' }); assert.equal(weak.status, 400); const submission = await request('POST', '/api/challenges/1/submissions', { sourceCode: 'print(1)' }); assert.equal(submission.status, 401); });
