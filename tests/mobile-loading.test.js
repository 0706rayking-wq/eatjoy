const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const begin = html.indexOf('// Image-heavy libraries');
const end = html.indexOf('}, [user, currentBranch, needsMenuImages, needsIngredientImages]);', begin);
assert.ok(begin > 0 && end > begin);
const source = html.slice(begin, end + '}, [user, currentBranch, needsMenuImages, needsIngredientImages]);'.length);
function setup(page) {
 const effects=[], listeners=new Map(), closed=[], reads=[], state={};
 const setters = Object.fromEntries(['GlobalRecipes','MenuData','IngredientData','Announcements','OnboardingData','BenefitsData','RulesData'].map(key=>['set'+key,v=>{state[key]=typeof v==='function'?v(state[key]||{}):v;}]));
 const db={collection:path=>({onSnapshot:fn=>{listeners.set(path,fn);return ()=>{closed.push(path);listeners.delete(path);};}}),doc:path=>({get:()=>new Promise(resolve=>reads.push({path,resolve}))})};
 vm.runInNewContext(source,{currentPage:page,user:{uid:'test'},currentBranch:'TEST',useEffect:fn=>effects.push(fn),db,getPublicPath:x=>x,triggerNotify:()=>{},RULE_CATEGORIES:['rules'],...setters});
 const cleanGlobal=effects[0](),cleanMerged=effects[2]();
 return {listeners,closed,reads,state,cleanup:()=>{cleanGlobal?.();cleanMerged?.();}};
}
const menu='menu/list_TEST/items', specs='ingredients/specs_TEST/items';
(async()=>{
 for(const page of ['home','inspection','auth']){
  const s=setup(page);
  assert.ok(!s.listeners.has('global_recipes')&&!s.listeners.has(menu)&&!s.listeners.has(specs));
  assert.ok(s.listeners.has('announcements/branch_TEST/items'));
  s.cleanup();assert.equal(s.listeners.size,0);
 }
 for(const [page,expected] of [['menu',[menu]],['ingredient-specs',[specs]],['admin',[menu,specs,'global_recipes']]]){
  const s=setup(page);
  for(const path of [menu,specs,'global_recipes'])assert.equal(s.listeners.has(path),expected.includes(path),page+': '+path);
  s.cleanup();assert.equal(s.listeners.size,0);
 }
 const s=setup('menu');
 const snap=name=>({docs:[{id:'one',data:()=>({id:'one',title:name,timestamp:1})}]});
 s.listeners.get(menu)(snap('old'));s.listeners.get(menu)(snap('latest'));
 s.reads[1].resolve({exists:false});await new Promise(r=>setImmediate(r));
 s.reads[0].resolve({exists:false});await new Promise(r=>setImmediate(r));
 assert.equal(s.state.MenuData.items[0].title,'latest');
 s.listeners.get(menu)(snap('after leaving'));s.cleanup();
 s.reads[2].resolve({exists:false});await new Promise(r=>setImmediate(r));
 assert.equal(s.state.MenuData.items[0].title,'latest');
 assert.ok(!html.includes('CACHE_SIZE_UNLIMITED'));
 assert.ok(html.includes('id="mobile-render-stability"'));
 console.log('Mobile loading: route gating, cleanup, stale-response protection, cache and CSS checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
