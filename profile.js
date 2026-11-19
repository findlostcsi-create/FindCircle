import {auth,db} from './firebase-config.js';
import {onAuthStateChanged,updateProfile} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {doc,getDoc,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';
const $=id=>document.getElementById(id);
let currentUser=null;
function status(message,error=false){$('profileStatus').textContent=message;$('profileStatus').style.color=error?'#b42318':'#166534';}
function showName(name){$('profileName').textContent=name||'Find Circle Student';$('avatar').textContent=(name||'?').trim().charAt(0).toUpperCase();}
onAuthStateChanged(auth,async user=>{
 if(!user){location.replace('login.html');return;}
 currentUser=user;$('profileEmail').textContent=user.email||'Email not available';$('emailAddress').value=user.email||'';
 let name=user.displayName||'';let data={};
 try{const snap=await getDoc(doc(db,'users',user.uid));if(snap.exists()){data=snap.data();name=data.name||name;}}
 catch(e){status('Could not load saved profile. '+(e.code||e.message),true);}
 $('displayName').value=name;$('branch').value=data.branch||'';$('academicYear').value=data.academicYear||'';$('rollNumber').value=data.rollNumber||'';showName(name);
});
$('profileForm').addEventListener('submit',async event=>{
 event.preventDefault();if(!currentUser)return;
 const name=$('displayName').value.trim();if(name.length<2||name.length>100){status('Name must be 2–100 characters.',true);return;}
 const branch=$('branch').value,academicYear=$('academicYear').value,rollNumber=$('rollNumber').value.trim();if(!branch||!academicYear||!rollNumber){status('Complete all student details.',true);return;}const button=$('saveProfile');button.disabled=true;status('Saving…');
 try{
  await setDoc(doc(db,'users',currentUser.uid),{uid:currentUser.uid,name,email:currentUser.email||'',photoURL:currentUser.photoURL||'',college:'PICT',branch,academicYear,rollNumber,updatedAt:serverTimestamp()},{merge:true});
  await setDoc(doc(db,'publicNames',currentUser.uid),{name},{merge:true});
  await updateProfile(currentUser,{displayName:name});
  showName(name);status('Profile saved. Your updated name will appear in new inbox loads.');
 }catch(e){console.error(e);status('Could not save profile: '+(e.code||e.message),true);}
 finally{button.disabled=false;}
});
