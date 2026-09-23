#!/usr/bin/env node
/* ============================================================================
 * export_gate.js — standing export-gate harness for the REAPER UI Layout Editor
 * ----------------------------------------------------------------------------
 * Loads a single-file plugin_ui_layout_v3_NNN.html headlessly (jsdom), builds a
 * fixed fixture by driving the tool's OWN creation functions, then runs
 * genImGui / genSeed. Used to prove that a patch does NOT change the exported
 * output of widgets it shouldn't affect. (genLua was removed from the tool; the
 * gate used to emit an empty third artefact that compared nothing.)
 *
 * The fixture exercises every nesting the placement/coordinate code touches:
 *   - a bare-canvas widget
 *   - a widget inside a Group
 *   - a widget inside a TabItem
 *   - a Table (with cells) and a widget dropped inside a cell
 *   - a CollapsingHeader with a child
 *   - the four locked-size types (ArrowButton, SeparatorText, BulletText,
 *     TextLinkOpenURL), whose w/h are a native contract rather than a grid value
 *
 * USAGE
 *   Capture a baseline (writes golden/<name>.{imgui,seed}, prints sizes):
 *     node export_gate.js plugin_ui_layout_v3_249.html
 *
 *   Gate a patch (run BEFORE vs AFTER, diff the three exports, PASS/FAIL):
 *     node export_gate.js plugin_ui_layout_v3_249.html plugin_ui_layout_v3_250.html
 *
 * READING THE RESULT
 *   - CSS-only / selection-only patch  → expect ALL IDENTICAL (exit 0).
 *   - export / coordinate / placement patch → some diff is expected (the bug you
 *     fixed). Read the diff: ONLY the widgets you intended to move should differ;
 *     any unrelated widget changing is a regression.
 *   - Seed `id` fields are random (uid()) and are normalized before diffing, so a
 *     seed diff is real structure/coords, never just ids.
 *
 * REQUIREMENT:  npm install jsdom        (one-time, in this folder)
 * ============================================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
 
// ---- deterministic 2d-context stub (measureText stable for SmallButton width) ----
function makeCtx2d(){
  const noop=()=>{}; const ctx={};
  ['save','restore','clearRect','fillRect','strokeRect','beginPath','closePath','moveTo',
   'lineTo','arc','arcTo','ellipse','rect','stroke','fill','setLineDash','getLineDash','scale',
   'translate','rotate','setTransform','resetTransform','clip','fillText','strokeText','drawImage',
   'quadraticCurveTo','bezierCurveTo','putImageData','transform'].forEach(m=>ctx[m]=noop);
  ctx.measureText = s => ({ width: ((s==null?'':String(s)).length)*7 });
  ctx.createLinearGradient = () => ({ addColorStop: noop });
  ctx.createRadialGradient = () => ({ addColorStop: noop });
  ctx.getImageData = () => ({ data: new Uint8ClampedArray(4) });
  ['font','fillStyle','strokeStyle','lineWidth','textAlign','textBaseline','globalAlpha',
   'lineCap','lineJoin','lineDashOffset','shadowBlur','shadowColor','miterLimit'].forEach(p=>ctx[p]='');
  return ctx;
}
 
// In-scope bridge appended to the tool's <script> so its closures capture the
// lexical state (shapes, cw, ch, generators, helpers). No tool edits required.
const BRIDGE = `
;window.__H = (function(){
  function reset(){
    shapes.length=0; selection={ids:[],primaryId:null};
    cnt={rect:0,circle:0,poly:0,line:0,text:0,triangle:0,arc:0,widget:0};
    cw=900; ch=700; activeTab='imgui'; auditGridMode=false;
  }
  return {
    reset:reset,
    shapes:function(){return shapes;},
    create:function(t,x,y,ov){return createWidgetAtPoint(t,x,y,ov);},
    cellsOf:function(id){return getCellsOfTable(id);},
    absX:function(s){return getAbsoluteX(s);}, absY:function(s){return getAbsoluteY(s);},
    genImGui:function(){return genImGui();}, genSeed:function(){return genSeed();}
  };
})();`;
 
function loadTool(htmlPath){
  let html = fs.readFileSync(htmlPath,'utf8');
  const lc = html.lastIndexOf('</script>');
  html = html.slice(0,lc) + BRIDGE + html.slice(lc);
  const dom = new JSDOM(html,{ runScripts:'outside-only', pretendToBeVisual:true, url:'https://local.test/' });
  const { window } = dom;
  window.HTMLCanvasElement.prototype.getContext = () => makeCtx2d();
  window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
  window.alert = window.prompt = window.confirm = () => {};
  if(!window.matchMedia) window.matchMedia = () => ({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  const errs = [];
  window.addEventListener('error', e => errs.push('window.error: '+(e.message||e)));
  for(const el of [...window.document.querySelectorAll('script')]){
    try { window.eval(el.textContent); }
    catch(e){ console.error('SCRIPT THROW during init ('+path.basename(htmlPath)+'):', e&&e.stack||e); process.exit(1); }
  }
  if(!window.__H){ console.error('bridge __H missing — injection failed'); process.exit(1); }
  return { H: window.__H, errs };
}
 
function buildFixtureAndExport(htmlPath){
  const { H, errs } = loadTool(htmlPath);
  H.reset();
  H.create('Button', 40, 40);                                   // bare canvas
  const grp = H.create('Group', 40, 120, { w:200, h:120 });
  if(grp) H.create('Checkbox', 70, 160);                        // inside group
  const tabbar = H.create('TabBar', 300, 40, { w:240, h:160 });
  if(tabbar) H.create('SliderInt', 330, 90);                    // inside active tab
  const table = H.create('Table', 40, 280, { w:320, h:110 });
  // Locked-size types: their w/h come from a native ReaImGui contract, not the
  // grid, and an audit found all four drifting between creation and load (F01).
  // The gate reported CLEAN on that patch because none of them were here.
  H.create('ArrowButton',     600,  40);
  H.create('SeparatorText',   600,  90);
  H.create('BulletText',      600, 140);
  H.create('TextLinkOpenURL', 600, 190);
  // CollapsingHeader with a child: the one container whose emission shape is not
  // otherwise covered, and the type whose generated state caused F03.
  const hdr = H.create('CollapsingHeader', 40, 440, { w:200, h:120 });
  if(hdr) H.create('Button', 60, 500);
  // A labelled primitive: size, colour and clipping of a shape label are a code path
  // of their own, and the fixture could not see it - running the gate on the patch that
  // rewrote that path reported CLEAN. Long label, non-default text size, and a stroke
  // colour distinct from any label colour, so a regression in any of the three shows up
  // as a diff rather than as silence.
  // c62-c65 coverage (1.0.68). The gate was blind to all of these, which is how a
  // 2.5-4 px text-landing offset (c64) and invisible tint marks (c65) shipped CLEAN.
  // Native-text landing: TextColored / TextDisabled / HelpMarker.
  H.create('TextColored',  600, 240, { w:140, label:'TextColored' });
  H.create('TextDisabled', 600, 280, { w:140, label:'TextDisabled' });
  H.create('HelpMarker',   600, 320);
  // ProgressBar overlay text (exported verbatim; empty exports "").
  const pb = H.create('ProgressBar', 600, 360, { w:200, h:20 });
  if(pb) pb.overlay = 'Loading';
  // Tint ramp (c65) + cascade to children: marks must differ from the surface.
  const tg = H.create('Group', 300, 440, { w:240, h:150 });
  if(tg){ tg.widgetTint = '#b03a2e'; H.create('Checkbox', 320, 480); H.create('SliderDouble', 320, 530, { w:160 }); }
  const ttb = H.create('TabBar', 600, 420, { w:260, h:140 });
  if(ttb){ ttb.widgetTint = '#6c3483'; H.create('Button', 620, 480, { w:120, h:20 }); }
  // Label-less container (c62): a stored label must not reach the ImGui ID.
  H.create('Panel', 600, 600, { w:200, h:80, label:'IGNORED_LABEL' });
  H.shapes().push({ id:'fixture-rect-label', name:'Rect_label', type:'rect',
    x:400, y:300, w:170, h:90, fill:'#ffffff', stroke:'#ff0000', thickness:2,
    label:'This label is far longer than the shape that carries it', textSize:20 });
  let cellCount = 0;
  if(table){
    const cells = H.cellsOf(table.id);
    cellCount = cells.length;
    if(cells.length){
      const c = cells[0];
      H.create('Text', H.absX(c)+c.w/2-10, H.absY(c)+c.h/2-6, { w:20, h:12 }); // inside a cell
    }
  }
  let imgui,seed,stable;
  try {
    imgui=H.genImGui(); seed=H.genSeed();
    stable = (imgui===H.genImGui()) && (seed===H.genSeed());
  } catch(e){ console.error('GENERATOR THROW ('+path.basename(htmlPath)+'):', e&&e.stack||e); process.exit(1); }
  return { imgui, seed, stable, errs, shapeCount:H.shapes().length, cellCount };
}
 
function normSeed(s){
  const map = new Map();
  return s.replace(/"(id|[A-Za-z0-9_]*[Ii]d)"\s*:\s*"([^"]*)"/g, (m, key, val) => {
    if(!map.has(val)) map.set(val, '<ID'+(map.size+1)+'>');
    return '"'+key+'":"'+map.get(val)+'"';
  });
}
 
const a = process.argv[2], b = process.argv[3];
if(!a){ console.error('usage: node export_gate.js <html> [<after.html>]'); process.exit(2); }
 
if(!b){
  // capture mode
  const r = buildFixtureAndExport(a);
  const dir = path.join(process.cwd(),'golden'); fs.mkdirSync(dir,{recursive:true});
  const name = path.basename(a).replace(/\.html$/,'');
  fs.writeFileSync(path.join(dir,name+'.imgui'), r.imgui);
  fs.writeFileSync(path.join(dir,name+'.seed'), r.seed);
  console.log('── capture ──');
  console.log('file        :', path.basename(a));
  console.log('shapes      :', r.shapeCount, '| table cells:', r.cellCount);
  console.log('init errors :', r.errs.length?r.errs.join(' | '):'none');
  console.log('determinism :', r.stable?'STABLE':'*** NON-DETERMINISTIC ***');
  console.log('bytes       : imgui',Buffer.byteLength(r.imgui),'| seed',Buffer.byteLength(r.seed));
  console.log('written     :', 'golden/'+name+'.{imgui,seed}');
  process.exit(r.stable && r.errs.length===0 ? 0 : 1);
}
 
// compare mode
const A = buildFixtureAndExport(a), B = buildFixtureAndExport(b);
function diffOne(label, x, y, norm){
  const xn = norm?norm(x):x, yn = norm?norm(y):y;
  if(xn===yn){ console.log('  '+label.padEnd(6)+': IDENTICAL'); return true; }
  console.log('  '+label.padEnd(6)+': DIFF');
  const xl=xn.split('\n'), yl=yn.split('\n'); let shown=0;
  for(let i=0;i<Math.max(xl.length,yl.length)&&shown<12;i++){
    if(xl[i]!==yl[i]){ console.log('    - '+(xl[i]??'')); console.log('    + '+(yl[i]??'')); shown++; }
  }
  return false;
}
console.log('── export gate ──');
console.log('before:', path.basename(a), '| after:', path.basename(b));
console.log('init errors:', (A.errs.concat(B.errs)).length || 'none');
const okI = diffOne('imgui', A.imgui, B.imgui);
const okS = diffOne('seed',  A.seed,  B.seed, normSeed);
const allClean = okI && okS;
console.log('result:', allClean ? 'CLEAN — exports byte-identical'
  : 'CHANGED — review the diff: only intentionally-moved widgets should differ');
process.exit(allClean ? 0 : 1);
 