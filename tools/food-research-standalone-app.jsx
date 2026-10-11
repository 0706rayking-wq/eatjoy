const App = () => {
 const [players, setPlayers] = useState([]);
 const [activePhone, setActivePhone] = useState('');
 const [branch, setBranch] = useState('');
 const [ready, setReady] = useState(false);
 const [busy, setBusy] = useState(false);
 const [notice, setNotice] = useState('');
 const soloPath = col => getPublicPath('frsolo_' + col);
 const notify = message => setNotice(message);
 useEffect(() => {
  let stopPlayers = () => {}, disposed = false;
  firebase.auth().signInAnonymously().then(async credential => {
   if (disposed) return;
   const id = 'guest_' + credential.user.uid;
   const ref = db.doc(soloPath('users/' + id));
   await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) tx.set(ref, { phone:id, name:'旅人' + id.slice(-5), branch:['自由營地'], role:'內場正職', status:'approved', guest:true });
   });
   if (disposed) return;
   setBranch('自由營地'); setActivePhone(id); setReady(true);
   stopPlayers = db.collection(soloPath('users')).where('guest', '==', true).onSnapshot(snap => {
    setPlayers(snap.docs.map(doc => ({ phone: doc.id, ...doc.data() })));
   }, () => setNotice('獨立版存檔讀取失敗，請重新整理'));
  }).catch(() => setNotice('連線失敗，請重新整理'));
  return () => { disposed = true; stopPlayers(); };
 }, []);
 const currentUser = players.find(p => p.phone === activePhone);
 const login = async () => {
  window.location.reload();
 };
 return <>
  {currentUser ? <GameCenter onBack={() => setActivePhone('')} config={{isOpen:true,questions:[]}} currentBranch={branch} currentUser={currentUser} getPublicPath={soloPath} triggerNotify={notify} allUsers={players} globalBranches={[...new Set(players.flatMap(p => Array.isArray(p.branch) ? p.branch : [p.branch]).filter(Boolean))]} isSuperAdmin={false} /> : <main style={{minHeight:'100vh',background:'#101418',color:'#f0f3f6',display:'grid',placeItems:'center',padding:24}}><div style={{width:'100%',maxWidth:360}}>
   <img src="assets/food-research/hero-normal-portrait.png" alt="食研所" style={{width:120,height:120,objectFit:'contain',display:'block',margin:'0 auto'}} />
   <h1 style={{fontSize:30,textAlign:'center',margin:'20px 0'}}>食研所</h1>
   <button onClick={login} style={{width:'100%',padding:14,borderRadius:8,background:'#dc3445',color:'#fff',fontWeight:800}}>{ready ? '返回營地' : notice ? '重新連線' : '進入營地中…'}</button>
  </div></main>}
  {notice && <button onClick={() => setNotice('')} role="status" style={{position:'fixed',zIndex:99999,bottom:24,left:'5%',width:'90%',padding:14,background:'#fff',color:'#17202a',borderRadius:8}}>{notice}</button>}
 </>;
};
