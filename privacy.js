import {auth,db} from './firebase-config.js';
import {
  onAuthStateChanged, updatePassword, reauthenticateWithCredential,
  reauthenticateWithPopup, EmailAuthProvider, GoogleAuthProvider, deleteUser
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {
  doc, getDoc, getDocs, setDoc, collection, query, where, writeBatch
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const $=id=>document.getElementById(id);
let user=null, passwordAccount=false;
const feedback=(id,message,error=false)=>{const el=$(id);el.textContent=message;el.classList.toggle('is-error',!!error);};
const message=e=>{
  console.error('Find Circle account settings:',e);
  switch(e?.code){
    case 'auth/wrong-password':case 'auth/invalid-credential':return 'The current password is incorrect.';
    case 'auth/requires-recent-login':return 'Please sign out, log in again, and retry.';
    case 'auth/weak-password':return 'Choose a stronger password.';
    case 'auth/popup-closed-by-user':return 'Google verification was cancelled.';
    case 'permission-denied':return 'Access denied. Publish the included Firestore security rules and try again.';
    default:return e?.message||'Something went wrong. Please retry.';
  }
};
function syncEmailToggle(){
 const show=$('showProfile').checked, email=$('showEmail');
 email.disabled=!show;
 if(!show)email.checked=false;
}
$('showProfile').addEventListener('change',syncEmailToggle);

onAuthStateChanged(auth,async current=>{
 if(!current){location.replace('login.html');return;}
 user=current;
 passwordAccount=current.providerData.some(p=>p.providerId==='password');
 $('passwordForm').hidden=!passwordAccount;
 $('passwordGoogle').hidden=passwordAccount;
 $('deletePasswordRow').hidden=!passwordAccount;
 feedback('privacyStatus','Loading settings…');
 try{
  const snap=await getDoc(doc(db,'publicNames',current.uid));
  if(auth.currentUser?.uid!==current.uid)return;
  const settings=snap.exists()?snap.data():{};
  $('showProfile').checked=settings.showProfile!==false;
  $('showEmail').checked=settings.showEmail===true&&settings.showProfile!==false;
  syncEmailToggle();feedback('privacyStatus','');
 }catch(e){feedback('privacyStatus',message(e),true);}
});

$('privacyForm').addEventListener('submit',async event=>{
 event.preventDefault();if(!user)return;
 const button=$('savePrivacy'),showProfile=$('showProfile').checked;
 const showEmail=showProfile&&$('showEmail').checked;
 button.disabled=true;feedback('privacyStatus','Saving…');
 try{
  const name=(user.displayName||'').trim() || 'Find Circle Student';
  // Email is present in the public document ONLY if the owner opts in.
  await setDoc(doc(db,'publicNames',user.uid),{
   name,showProfile,showEmail,email:showEmail?(user.email||''):''
  },{merge:true});
  feedback('privacyStatus','Privacy settings saved. Other students will see the changes after reloading their inbox.');
 }catch(e){feedback('privacyStatus',message(e),true);}
 finally{button.disabled=false;}
});

$('passwordForm').addEventListener('submit',async event=>{
 event.preventDefault();if(!user||!passwordAccount)return;
 if(!$('passwordForm').reportValidity())return;
 const now=$('currentPassword').value, next=$('newPassword').value;
 if(next!==$('confirmNewPassword').value){feedback('passwordStatus','New passwords do not match.',true);return;}
 if(next===now){feedback('passwordStatus','Choose a new password different from your current password.',true);return;}
 const button=$('changePassword');button.disabled=true;feedback('passwordStatus','Updating password…');
 try{
  await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,now));
  await updatePassword(user,next);
  $('passwordForm').reset();feedback('passwordStatus','Password changed successfully.');
 }catch(e){feedback('passwordStatus',message(e),true);}
 finally{button.disabled=false;}
});

const rows=async(col,field,operator,value)=>{
 const snap=await getDocs(query(collection(db,col),where(field,operator,value)));
 return snap.docs.map(d=>({id:d.id,...d.data()}));
};
const cleaned=value=>JSON.parse(JSON.stringify(value,(key,v)=>{
 if(v&&typeof v==='object'&&typeof v.toDate==='function')return v.toDate().toISOString();
 return v;
}));
$('downloadData').addEventListener('click',async()=>{
 if(!user)return;
 const button=$('downloadData');button.disabled=true;feedback('exportStatus','Preparing your data…');
 try{
  const [privateDoc,publicDoc,reports,submitted,received,conversations]=await Promise.all([
   getDoc(doc(db,'users',user.uid)),getDoc(doc(db,'publicNames',user.uid)),
   rows('items','ownerId','==',user.uid),
   rows('claims','claimantId','==',user.uid),rows('claims','itemOwnerId','==',user.uid),
   rows('conversations','participants','array-contains',user.uid)
  ]);
  const chats=[];
  for(const thread of conversations){
   const snap=await getDocs(collection(db,'conversations',thread.id,'messages'));
   chats.push({conversation:thread,messages:snap.docs.map(d=>({id:d.id,...d.data()}))});
  }
  const json=cleaned({
   app:'Find Circle',exportedAt:new Date().toISOString(),account:{uid:user.uid,email:user.email,displayName:user.displayName,
    providerIds:user.providerData.map(p=>p.providerId),createdAt:user.metadata.creationTime},
   privateProfile:privateDoc.exists()?privateDoc.data():null,
   publicProfile:publicDoc.exists()?publicDoc.data():null,
   reports,claims:{submitted,received},conversations:chats
  });
  const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'});
  const href=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=href;a.download=`find-circle-my-data-${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),3000);
  feedback('exportStatus','Download created. Keep this file private: it can contain messages and identifying information.');
 }catch(e){feedback('exportStatus','Export could not finish: '+message(e),true);}
 finally{button.disabled=false;}
});

$('showDelete').addEventListener('click',()=>{
 const p=$('deletePanel');p.hidden=!p.hidden;
 $('showDelete').setAttribute('aria-expanded',String(!p.hidden));
 if(!p.hidden)$('deletePhrase').focus();
});
$('cancelDelete').addEventListener('click',()=>{
 $('deletePanel').hidden=true;$('showDelete').setAttribute('aria-expanded','false');
 $('deletePhrase').value='';$('deletePassword').value='';$('confirmDelete').disabled=true;feedback('deleteStatus','');
});
$('deletePhrase').addEventListener('input',()=>{
 $('confirmDelete').disabled=$('deletePhrase').value.trim()!=='DELETE';
});

async function reauthenticate(){
 if(passwordAccount){
  const pass=$('deletePassword').value;
  if(!pass)throw Error('Enter your current password to verify account deletion.');
  await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,pass));
  return;
 }
 // Google sign-in requires a fresh popup verification before destructive operations.
 if(user.providerData.some(p=>p.providerId==='google.com')){
  await reauthenticateWithPopup(user,new GoogleAuthProvider());return;
 }
 throw Error('This sign-in method is not supported for self-service deletion. Contact the site administrator.');
}
$('confirmDelete').addEventListener('click',async()=>{
 if(!user||$('deletePhrase').value.trim()!=='DELETE')return;
 if(!confirm('Permanently delete your Find Circle login, private profile and reports? Shared messages, claims and Cloudinary photos may remain.'))return;
 const btn=$('confirmDelete');btn.disabled=true;
 feedback('deleteStatus','Verifying your account…');
 try{
  await reauthenticate();
  feedback('deleteStatus','Removing your profile and reports…');
  const owned=await rows('items','ownerId','==',user.uid);
  if(owned.length>400)throw Error('Too many reports for browser-based account deletion. Contact the site administrator for assisted deletion.');
  // Cleanup in one Firestore batch. If it fails, the Firebase login is NOT deleted.
  const batch=writeBatch(db);
  for(const item of owned)batch.delete(doc(db,'items',item.id));
  batch.delete(doc(db,'users',user.uid));
  batch.delete(doc(db,'publicNames',user.uid));
  await batch.commit();
  feedback('deleteStatus','Deleting Firebase authentication account…');
  await deleteUser(user);
  location.replace('index.html?accountDeleted=1');
 }catch(e){
  feedback('deleteStatus','Deletion was not completed: '+message(e)+
    ' If your profile or reports were already removed, your sign-in may still exist. Log in again or contact the administrator.',true);
  btn.disabled=false;
 }
});
