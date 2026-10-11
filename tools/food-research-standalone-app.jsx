const App = () => {
 const [profiles, setProfiles] = useState([]);
 const [players, setPlayers] = useState([]);
 const [phone, setPhone] = useState('');
 const [activePhone, setActivePhone] = useState('');
 const [branch, setBranch] = useState('');
 const [ready, setReady] = useState(false);
 const [busy, setBusy] = useState(false);
 const [notice, setNotice] = useState('');
 const soloPath = col => getPublicPath('frsolo_' + col);
 const notify = message => setNotice(message);
 useEffect(() => {
  let stopProfiles = () => {}, stopPlayers = () => {}, disposed = false;
  firebase.auth().signInAnonymously().then(() => {
   if (disposed) return;
   stopProfiles = db.collection(getPublicPath('users')).onSnapshot(snap => {
    setProfiles(snap.docs.map(doc => ({ phone: doc.id, ...doc.data() })));
    setReady(true);
   }, () => setNotice('帳號資料讀取失敗，請重新整理'));
   stopPlayers = db.collection(soloPath('users')).onSnapshot(snap => {
    setPlayers(snap.docs.map(doc => ({ phone: doc.id, ...doc.data() })));
   }, () => setNotice('獨立版存檔讀取失敗，請重新整理'));
  }).catch(() => setNotice('連線失敗，請重新整理'));
  return () => { disposed = true; stopProfiles(); stopPlayers(); };
 }, []);
 const currentUser = players.find(p => p.phone === activePhone);
 const login = async () => {
  const profile = profiles.find(p => p.phone === phone.trim() && p.status === 'approved');
  if (!profile) return notify('請使用已核准的廚務帳號手機號碼');
  const branches = Array.isArray(profile.branch) ? profile.branch : [profile.branch];
  if (!branches[0]) return notify('帳號尚未設定分店');
  setBusy(true);
  try {
   // Copy identity only. Original gameSave/gameGold never enter the solo world.
   await db.doc(soloPath('users/' + profile.phone)).set({ phone: profile.phone, name: profile.name || '', branch: branches, role: profile.role || '', status: 'approved' }, { merge: true });
   setBranch(branches[0]); setActivePhone(profile.phone); setNotice('');
  } catch { notify('獨立版帳號建立失敗，請稍後重試'); }
  finally { setBusy(false); }
 };
 return <>
  {currentUser ? <GameCenter onBack={() => setActivePhone('')} config={{isOpen:true,questions:[]}} currentBranch={branch} currentUser={currentUser} getPublicPath={soloPath} triggerNotify={notify} allUsers={players} globalBranches={[...new Set(players.flatMap(p => Array.isArray(p.branch) ? p.branch : [p.branch]).filter(Boolean))]} isSuperAdmin={false} /> : <main style={{minHeight:'100vh',background:'#101418',color:'#f0f3f6',display:'grid',placeItems:'center',padding:24}}><div style={{width:'100%',maxWidth:360}}>
   <img src="assets/food-research/hero-normal-portrait.png" alt="食研所" style={{width:120,height:120,objectFit:'contain',display:'block',margin:'0 auto'}} />
   <h1 style={{fontSize:30,textAlign:'center',margin:'20px 0'}}>食研所</h1>
   <label htmlFor="solo-phone">帳號手機號碼</label><input id="solo-phone" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{display:'block',width:'100%',padding:14,margin:'8px 0 16px',borderRadius:8,color:'#17202a',background:'#fff'}} />
   <button disabled={!ready || busy} onClick={login} style={{width:'100%',padding:14,borderRadius:8,background:'#dc3445',color:'#fff',fontWeight:800}}>{busy ? '登入中…' : ready ? '進入食研所' : '連線中…'}</button>
  </div></main>}
  {notice && <button onClick={() => setNotice('')} role="status" style={{position:'fixed',zIndex:99999,bottom:24,left:'5%',width:'90%',padding:14,background:'#fff',color:'#17202a',borderRadius:8}}>{notice}</button>}
 </>;
};
