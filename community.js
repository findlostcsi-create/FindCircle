import {auth,db} from './firebase-config.js';
import {escapeHTML,showError} from './items.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {doc,getDoc,setDoc,addDoc,collection,query,where,orderBy,onSnapshot,serverTimestamp,updateDoc,runTransaction} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';
export {auth,db,escapeHTML,showError,doc,getDoc,setDoc,addDoc,collection,query,where,orderBy,onSnapshot,serverTimestamp,updateDoc,runTransaction};
export function requireUser(cb){return onAuthStateChanged(auth,u=>u?cb(u):location.replace('login.html'));}
export function threadId(itemId,a,b){return `${itemId}_${[a,b].sort().join('_')}`;}
export async function startThread(itemId){const u=auth.currentUser;if(!u)throw Error('Please sign in first.');const item=await getDoc(doc(db,'items',itemId));if(!item.exists())throw Error('Item no longer exists.');const x=item.data();if(x.status!=='Open')throw Error('This report is closed.');if(x.ownerId===u.uid)throw Error('You cannot message yourself.');const id=threadId(itemId,u.uid,x.ownerId);const ref=doc(db,'conversations',id);try{await setDoc(ref,{itemId,participants:[u.uid,x.ownerId].sort(),itemOwnerId:x.ownerId,initiatorId:u.uid,createdAt:serverTimestamp()});}catch(e){try{const existing=await getDoc(ref);if(!existing.exists()||!existing.data().participants?.includes(u.uid))throw e;}catch(readError){throw e;}}return id;}
export function status(el,message,error=false){el.textContent=message;el.style.color=error?'#b42318':'#166534';}
