import {requireUser,auth,db,escapeHTML,showError,doc,getDoc,addDoc,collection,query,where,orderBy,onSnapshot,serverTimestamp,status} from './community.js';
let stopThreads,stopMessages,activeId='',threads=[],titles=new Map(),lastMessages=new Map(),names=new Map(),publicEmails=new Map();
const $=id=>document.getElementById(id);
const when=ts=>ts?.toDate?.().toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})||'';
const label=t=>titles.get(t.itemId)||`Report ${t.itemId.slice(0,8)}…`;
const otherId=t=>t.participants.find(id=>id!==auth.currentUser?.uid);
const person=t=>names.get(otherId(t))||'Student';
function heading(t){$('chatTitle').textContent=person(t);$('chatContext').textContent='Regarding: '+label(t);const email=publicEmails.get(otherId(t));$('chatPublicEmail').hidden=!email;$('chatPublicEmail').textContent=email?'Shared email: '+email:'';}
function loadName(t){const uid=otherId(t);if(!uid||names.has(uid))return;names.set(uid,'Student');getDoc(doc(db,'publicNames',uid)).then(s=>{if(s.exists()&&s.data().name){names.set(uid,s.data().name);if(s.data().showEmail===true&&s.data().showProfile!==false&&s.data().email)publicEmails.set(uid,s.data().email);renderThreads();if(activeId===t.id)heading(t);}}).catch(()=>{});}
function renderThreads(){
 $('threads').innerHTML=threads.length?threads.map(t=>`<button class="thread-button ${t.id===activeId?'selected':''}" data-id="${escapeHTML(t.id)}"><span class="thread-name">${escapeHTML(person(t))}</span><span class="thread-meta">${escapeHTML(label(t))} · ${escapeHTML(when(lastMessages.get(t.id)?.createdAt||t.createdAt))}</span>${lastMessages.has(t.id)?`<span class="thread-preview">${escapeHTML(lastMessages.get(t.id).text.slice(0,65))}</span>`:''}</button>`).join(''):'No conversations yet. Open a report and select Message reporter.';
}
function loadTitle(t){
 if(titles.has(t.itemId))return;
 titles.set(t.itemId,`Report ${t.itemId.slice(0,8)}…`);
 getDoc(doc(db,'items',t.itemId)).then(s=>{if(s.exists()){titles.set(t.itemId,s.data().title||label(t));renderThreads();if(activeId===t.id)heading(t);}}).catch(()=>{});
}
requireUser(u=>{
 if(stopThreads)stopThreads();
 stopThreads=onSnapshot(query(collection(db,'conversations'),where('participants','array-contains',u.uid)),snap=>{
  threads=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  threads.forEach(t=>{loadTitle(t);loadName(t);});renderThreads();
  const wanted=new URLSearchParams(location.search).get('thread');
  if(!activeId&&(wanted||threads[0]?.id))openThread(wanted&&threads.some(t=>t.id===wanted)?wanted:threads[0].id);
 },e=>status($('chatStatus'),showError(e),true));
});
$('threads').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)openThread(b.dataset.id);});
function openThread(id){
 const t=threads.find(t=>t.id===id);if(!t)return;
 activeId=id;history.replaceState(null,'',`messages.html?thread=${encodeURIComponent(id)}${new URLSearchParams(location.search).has('draft')?'&draft='+encodeURIComponent(new URLSearchParams(location.search).get('draft')):''}`);
 $('chatText').disabled=false;$('sendBtn').disabled=false;
 heading(t);
 $('chatLog').textContent='Loading messages…';renderThreads();const draft=new URLSearchParams(location.search).get('draft');if(draft&&draft.length<=1000&&!$('chatText').value)$('chatText').value=draft;
 if(stopMessages)stopMessages();
 stopMessages=onSnapshot(query(collection(db,'conversations',id,'messages'),orderBy('createdAt','asc')),snap=>{
  if(activeId!==id)return;
  const messages=snap.docs.map(d=>d.data());
  if(messages.length)lastMessages.set(id,messages[messages.length-1]);
  renderThreads();
  $('chatLog').innerHTML=messages.length?messages.map(m=>`<div class="bubble ${m.senderId===auth.currentUser.uid?'mine':''}"><span>${escapeHTML(m.text)}</span><small class="bubble-time">${escapeHTML(when(m.createdAt))}</small></div>`).join(''):'No messages yet. Say hello!';
  $('chatLog').scrollTop=$('chatLog').scrollHeight;
 },e=>status($('chatStatus'),showError(e),true));
}
$('chatForm').addEventListener('submit',async e=>{
 e.preventDefault();const text=$('chatText').value.trim();if(!activeId||!text)return;
 const btn=$('sendBtn');btn.disabled=true;
 try{await addDoc(collection(db,'conversations',activeId,'messages'),{senderId:auth.currentUser.uid,text,createdAt:serverTimestamp()});$('chatText').value='';status($('chatStatus'),'Message sent.');}
 catch(err){status($('chatStatus'),showError(err),true);}
 finally{btn.disabled=false;}
});
