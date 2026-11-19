import {requireUser,auth,db,escapeHTML,showError,doc,getDoc,collection,query,where,onSnapshot,runTransaction,status,serverTimestamp} from './community.js';
const $=id=>document.getElementById(id);
let submitted=[],received=[],itemTitles=new Map();
const title=id=>itemTitles.get(id)||`Report ${id.slice(0,8)}…`;
function hydrate(items){
 for(const c of items){
  if(itemTitles.has(c.itemId))continue;
  itemTitles.set(c.itemId,`Report ${c.itemId.slice(0,8)}…`);
  getDoc(doc(db,'items',c.itemId)).then(s=>{if(s.exists()){itemTitles.set(c.itemId,s.data().title||title(c.itemId));render();}}).catch(()=>{});
 }
}
requireUser(u=>{
 onSnapshot(query(collection(db,'claims'),where('claimantId','==',u.uid)),s=>{submitted=s.docs.map(d=>({id:d.id,...d.data()}));hydrate(submitted);render();},e=>status($('claimStatus'),showError(e),true));
 onSnapshot(query(collection(db,'claims'),where('itemOwnerId','==',u.uid)),s=>{received=s.docs.map(d=>({id:d.id,...d.data()}));hydrate(received);render();},e=>status($('claimStatus'),showError(e),true));
});
function card(c,review){
 const canDecide=review;
 return `<article class="claim-card"><strong>${escapeHTML(title(c.itemId))}</strong><p>Status: <strong>${escapeHTML(c.status)}</strong></p><p>Private ownership detail: ${escapeHTML(c.proof)}</p><p><a href="item.html?id=${encodeURIComponent(c.itemId)}">View report</a></p>${canDecide?`<div class="actions">${c.status!=='Approved'?`<button class="btn primary" data-decision="Approved" data-id="${escapeHTML(c.id)}">Approve</button>`:''}${c.status!=='Rejected'?`<button class="btn outline" data-decision="Rejected" data-id="${escapeHTML(c.id)}">${c.status==='Approved'?'Change to rejected':'Reject'}</button>`:''}</div>`:''}</article>`;
}
function render(){
 $('submitted').innerHTML=submitted.length?submitted.map(c=>card(c,false)).join(''):'No submitted claims.';
 $('received').innerHTML=received.length?received.map(c=>card(c,true)).join(''):'No claims to review.';
}
$('received').addEventListener('click',async e=>{
 const btn=e.target.closest('[data-decision]');if(!btn)return;
 const decision=btn.dataset.decision;
 const claim=received.find(c=>c.id===btn.dataset.id);if(!claim)return;
 if(!confirm(`${decision==='Approved'?'Approve this claim and close the report':'Set this claim to rejected and reopen the report'}?`))return;
 btn.disabled=true;
 try{
  await runTransaction(db,async tx=>{
   const claimRef=doc(db,'claims',claim.id),itemRef=doc(db,'items',claim.itemId);
   const [cs,is]=await Promise.all([tx.get(claimRef),tx.get(itemRef)]);
   if(!cs.exists()||!is.exists())throw Error('Claim or report no longer exists.');
   const c=cs.data(),item=is.data();
   if(c.itemOwnerId!==auth.currentUser.uid||item.ownerId!==auth.currentUser.uid)throw Error('Not authorized.');
   if(c.status===decision)throw Error('Already decided.');
   if(!['Pending','Approved','Rejected'].includes(c.status))throw Error('Unknown claim status.');
   if(decision==='Approved'&&received.some(x=>x.itemId===claim.itemId&&x.id!==claim.id&&x.status==='Approved'))
     throw Error('Another claim is already approved for this report.');
   if(decision==='Rejected'&&c.status==='Approved'){
     const otherApproved=received.some(x=>x.itemId===claim.itemId&&x.id!==claim.id&&x.status==='Approved');
     if(otherApproved)throw Error('Another claim is approved for this report. Resolve that decision first.');
   }
   tx.update(claimRef,{status:decision});
   if(decision==='Approved'||c.status==='Approved')
     tx.update(itemRef,{status:decision==='Approved'?'Closed':'Open',updatedAt:serverTimestamp()});
  });
  status($('claimStatus'),decision==='Approved'?'Claim approved; report closed.':'Claim rejected.');
 }catch(err){status($('claimStatus'),showError(err),true);}finally{btn.disabled=false;}
});
