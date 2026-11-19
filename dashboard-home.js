import {auth,db,escapeHTML,collection,query,where} from './items.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {onSnapshot} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';
const $=id=>document.getElementById(id);
const count=(id,v)=>{$(id).textContent=String(v);};
const when=ts=>ts?.toDate?.().toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})||'';
function mini(item){
  const href=`item.html?id=${encodeURIComponent(item.id)}`;
  return `<a href="${href}" class="dashboard-mini-item"><span class="dashboard-mini-icon ${item.type==='Lost'?'mini-lost':'mini-found'}">${item.type==='Lost'?'⌕':'✓'}</span><span class="dashboard-mini-text"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.type||'Report')} · ${escapeHTML(item.location||'PICT')} · ${escapeHTML(when(item.createdAt))}</small></span><span class="dashboard-mini-arrow">→</span></a>`;
}
function showReports(items){$('dashboardOwn').innerHTML=items.length?items.slice(0,4).map(mini).join(''):'<div class="dashboard-empty">No reports yet. <a href="report.html">Create your first report</a>.</div>';}
let unsubOwn,unsubClaims,unsubConversations;
onAuthStateChanged(auth,user=>{
  if(!user){location.replace('login.html');return;}
  $('dashboardName').textContent=(user.displayName||'Student').trim().split(/\s+/)[0].slice(0,35);
  [unsubOwn,unsubClaims,unsubConversations].forEach(fn=>fn?.());
  unsubOwn=onSnapshot(query(collection(db,'items'),where('ownerId','==',user.uid)),snap=>{
    const items=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    count('statMyReports',items.length);count('statOpenReports',items.filter(x=>x.status==='Open').length);showReports(items);
  },e=>{console.error('My reports dashboard error',e);$('dashboardOwn').textContent='Unable to load your reports.';});
  unsubClaims=onSnapshot(query(collection(db,'claims'),where('itemOwnerId','==',user.uid)),snap=>count('statClaims',snap.docs.filter(d=>d.data().status==='Pending').length),e=>{console.error('Claims dashboard error',e);$('statClaims').textContent='!';});
  unsubConversations=onSnapshot(query(collection(db,'conversations'),where('participants','array-contains',user.uid)),snap=>count('statMessages',snap.size),e=>{console.error('Messages dashboard error',e);$('statMessages').textContent='!';});
});
