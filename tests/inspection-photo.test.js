const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const source = html.slice(html.indexOf('    const compressImage ='), html.indexOf('    const dataUrlBytes ='));
async function run(mode) {
  let dimensions;
  const canvas = {getContext: () => ({drawImage: (_img, _x, _y, w, h) => {dimensions = [w, h]; if (mode === 'draw-error') throw Error('memory');}}), toDataURL: () => mode === 'empty' ? 'data:,' : 'data:image/jpeg;base64,AAAA'};
  const context = {setTimeout, clearTimeout, document: {createElement: () => canvas}, Image: class {
    constructor() {this.naturalWidth = 3024; this.naturalHeight = 4032;}
    set src(value) {queueMicrotask(() => mode === 'decode-error' ? this.onerror() : this.onload());}
  }};
  vm.createContext(context);
  vm.runInContext(source + '\nthis.compress = compressImage;', context);
  if (mode === 'ok') {
    assert.match(await context.compress('blob:test', 820), /^data:image\/jpeg/);
    assert.deepEqual(dimensions, [615, 820]);
  } else await assert.rejects(context.compress('blob:test', 820), /image-(conversion|load)-failed/);
  if (mode !== 'decode-error') assert.equal(canvas.width, 0);
}
(async () => {
  for (const mode of ['ok', 'draw-error', 'empty', 'decode-error']) await run(mode);
  const handler = html.slice(html.indexOf('   const handleFile = async (e, idx)'), html.indexOf('  const isAllUploaded = useMemo'));
  assert(handler.includes('URL.createObjectURL(file)'));
  assert(handler.includes('URL.revokeObjectURL(photoUrl)'));
  assert(!handler.includes('e.target.value'));
  console.log('Inspection portrait resize, conversion failures, cleanup and input lifecycle PASS');
})().catch(error => {console.error(error); process.exitCode = 1;});
