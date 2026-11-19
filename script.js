import {auth} from './firebase-config.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';

const $=id=>document.getElementById(id);

// Public landing page: quick report actions only; item browsing is under Recently Reported.

document.querySelectorAll('[data-action]').forEach(button=>{
  button.addEventListener('click',()=>{
    const type=button.dataset.action==='found'?'Found':'Lost';
    location.href='report.html?type='+encodeURIComponent(type);
  });
});

$('menuBtn').addEventListener('click',()=>{
  const open=$('navlinks').classList.toggle('open');
  $('menuBtn').setAttribute('aria-expanded',String(open));
  $('menuBtn').textContent=open?'×':'☰';
});
$('navlinks').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  $('navlinks').classList.remove('open');
  $('menuBtn').setAttribute('aria-expanded','false');
  $('menuBtn').textContent='☰';
}));

// Signed-in students always use the workspace instead of the public homepage.
onAuthStateChanged(auth,user=>{if(user)location.replace('dashboard.html');});
$('year').textContent=new Date().getFullYear();
