const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function replaceOnce(from, to) {
  if (!html.includes(from)) throw new Error('Missing standalone integration: ' + from.slice(0, 90));
  html = html.replace(from, to);
}
// A separate entry uses the existing game engine but never mounts kitchen routes.
const appStart = html.indexOf('    const App = () => {');
const appEnd = html.indexOf('    const root = ReactDOM.createRoot', appStart);
if (appStart < 0 || appEnd < 0) throw new Error('App boundaries not found');
html = html.slice(0, appStart) + fs.readFileSync(path.join(__dirname, 'food-research-standalone-app.jsx'), 'utf8') + '\n' + html.slice(appEnd);
replaceOnce("useState(null); // 新增：用來記錄使用者點選了哪個活動", "useState('food_research'); // Standalone game entry");
replaceOnce("const [selectedActivity, setSelectedActivity] = useState('food_research');", "const selectedActivity = 'food_research'; const setSelectedActivity = () => onBack();");
replaceOnce("const saveKey = 'fr_save_'", "const saveKey = 'frsolo_save_'");
html = html.replace(/(['"`])fr_/g, '$1frsolo_');
replaceOnce(' const getFacilityProgress = (facilityId) => {', ' const getFacilityProgress = (facilityId) => { return { total: REBUILD_TARGET, percent: 100, complete: true };');
replaceOnce('   const baseSave = loadSave();\n   const now = Date.now();', '   const baseSave = loadSave();\n   if (Number(data.gold) > Number(baseSave.gold || 0)) data = { ...data, gold: Number(baseSave.gold || 0) + (Number(data.gold) - Number(baseSave.gold || 0)) * 5 };\n   const now = Date.now();');
const quizStart = html.indexOf('     {/* Task 3: Daily knowledge quiz */}');
const quizEnd = html.indexOf(" if (frPhase === 'gacha')", quizStart);
if (quizStart < 0 || quizEnd < 0) throw new Error('Daily quiz boundaries not found');
html = html.slice(0, quizStart) + '    </div>\n   </div>\n  );\n }\n\n' + html.slice(quizEnd);
replaceOnce('const todayDone = todayQuests.tasks.filter(t=>t.done).length;', 'const todayDone = todayQuests.tasks.slice(0,2).filter(t=>t.done).length;');
replaceOnce('{todayDone}/3', '{todayDone}/2');
replaceOnce('todayDone < 3', 'todayDone < 2');
replaceOnce('{3-todayDone}', '{2-todayDone}');
html = html.replace(/todayQuests\.tasks\[([01])\]\.reward\}/g, 'todayQuests.tasks[$1].reward * 5}');
replaceOnce('const gameBodyWithImportedRevivalQuestions = timingPatchedGameBody.replace(', "const gameBodyWithImportedRevivalQuestions = timingPatchedGameBody.replace('function showRevivalQuiz(){', 'function showRevivalQuiz(){ goBackToCamp(); return;').replace(");
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>食研所｜獨立版</title>');
fs.writeFileSync(path.join(root, 'food-research.html'), html);
console.log('Built food-research.html');
