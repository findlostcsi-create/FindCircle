import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence, sendEmailVerification, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const form = document.getElementById('authForm');
const status = document.getElementById('authStatus');
const mode = form.dataset.mode;
const submit = form.querySelector('[type="submit"]');
const googleButton = document.getElementById('googleButton');
const errorMessages = {
  'auth/email-already-in-use':'An account with this email already exists. Please log in.',
  'auth/invalid-email':'Please enter a valid email address.',
  'auth/invalid-credential':'Email or password is incorrect.',
  'auth/weak-password':'Please choose a stronger password.',
  'auth/popup-closed-by-user':'Google sign-in was cancelled.',
  'auth/popup-blocked':'Allow popups for this site and try again.',
  'auth/unauthorized-domain':'Add this website domain to Firebase Authentication authorized domains.',
  'auth/operation-not-allowed':'Enable this sign-in method in Firebase Authentication.',
  'auth/network-request-failed':'Network error. Check your connection and retry.',
  'auth/too-many-requests':'Too many attempts. Please try again later.'
};
function notify(message,success=false){status.textContent=message;status.hidden=false;status.style.color=success?'#167b51':'';}
function busy(value){submit.disabled=value;googleButton.disabled=value;submit.textContent=value?'Please wait…':(mode==='signup'?'Create account':'Log in');}
function explain(error){console.error('Firebase authentication error:',error);return errorMessages[error.code] || 'Something went wrong. Please try again.';}
async function persist(){await setPersistence(auth,mode==='signup'||document.getElementById('remember')?.checked?browserLocalPersistence:browserSessionPersistence);}
async function saveProfile(user,displayName){const name=(displayName||user.displayName||'').trim();await setDoc(doc(db,'users',user.uid),{uid:user.uid,name,email:user.email||'',photoURL:user.photoURL||'',updatedAt:serverTimestamp()},{merge:true});if(name)await setDoc(doc(db,'publicNames',user.uid),{name},{merge:true});}
function goHome(){window.location.replace('dashboard.html');}
document.querySelectorAll('[data-toggle]').forEach(button=>button.addEventListener('click',()=>{const input=document.getElementById(button.dataset.toggle);const showing=input.type==='text';input.type=showing?'password':'text';button.textContent=showing?'Show':'Hide';button.setAttribute('aria-label',(showing?'Show ':'Hide ')+button.dataset.toggle);}));
form.addEventListener('submit',async event=>{
 event.preventDefault();status.hidden=true;if(!form.reportValidity())return;
 const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;
 if(mode==='signup'&&password!==document.getElementById('confirmPassword').value){notify('Passwords do not match.');return;}
 busy(true);
 try{
  await persist();
  if(mode==='signup'){
   const name=document.getElementById('name').value.trim();
   const result=await createUserWithEmailAndPassword(auth,email,password);
   await updateProfile(result.user,{displayName:name});
   try{await saveProfile(result.user,name);}catch(e){console.error('Profile save failed:',e);}
   try{await sendEmailVerification(result.user);notify('Account created! Verification email sent. Redirecting…',true);}catch(e){notify('Account created! Please verify your email when prompted. Redirecting…',true);}
  }else{const result=await signInWithEmailAndPassword(auth,email,password);try{await saveProfile(result.user);}catch(e){console.error('Name sync failed:',e);}notify('Login successful. Redirecting…',true);}
  setTimeout(goHome,900);
 }catch(error){notify(explain(error));}finally{busy(false);}
});
googleButton.addEventListener('click',async()=>{
 status.hidden=true;if(mode==='signup'&&!document.getElementById('terms').checked){notify('Please agree to the terms before signing up with Google.');return;}
 busy(true);
 try{await persist();const result=await signInWithPopup(auth,new GoogleAuthProvider());try{await saveProfile(result.user);}catch(e){console.error('Profile save failed:',e);}notify('Signed in with Google. Redirecting…',true);setTimeout(goHome,900);}catch(error){notify(explain(error));}finally{busy(false);}
});
const forgot=document.getElementById('forgotPassword');
if(forgot)forgot.addEventListener('click',async event=>{event.preventDefault();const email=document.getElementById('email').value.trim();if(!email){notify('Enter your email address above first.');return;}try{await sendPasswordResetEmail(auth,email);notify('If this address is eligible, a password reset email will arrive shortly.',true);}catch(error){notify(explain(error));}});
document.getElementById('year').textContent=new Date().getFullYear();
