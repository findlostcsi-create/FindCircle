import {auth} from './firebase-config.js';
import {onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';

const routes = [
  {href:'dashboard.html',label:'Dashboard Home',icon:'home'},
  {href:'profile.html',label:'My Profile',icon:'person'},
  {href:'my-reports.html',label:'My Reports',icon:'reports'},
  {href:'claims.html',label:'Claims',icon:'claims'},
  {href:'messages.html',label:'Messages',icon:'messages'},
  {href:'recent.html',label:'Recently Reported',icon:'recent'},
  {href:'privacy.html',label:'Privacy & Security',icon:'lock'}
];
const paths = {
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  reports:'<rect x="4" y="3" width="14" height="18" rx="2"/><path d="M8 8h6M8 12h6M8 16h5M18 7h2v12"/>',
  claims:'<path d="M12 3 4 7v6c0 5 4 8 8 9 4-1 8-4 8-9V7z"/><path d="m9 12 2 2 4-4"/>',
  messages:'<path d="M21 11a8 8 0 0 1-8 8H6l-4 3v-8a8 8 0 1 1 19-3z"/>',
  recent:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="M5 5l14 14M19 5 5 19"/>'
};
const icon=(name)=>`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;
const current=location.pathname.split('/').pop()||'dashboard.html';
const active=current==='report.html'?'my-reports.html':current==='item.html'?'recent.html':current;
const labels={'dashboard.html':'Dashboard','profile.html':'My Profile','my-reports.html':'My Reports','claims.html':'Claims','messages.html':'Messages','recent.html':'Recently Reported','privacy.html':'Privacy & Security','report.html':'New Report','item.html':'Report Details'};
const nav=routes.map(r=>`<a class="workspace-link ${r.href===active?'is-active':''}" href="${r.href}" ${r.href===active?'aria-current="page"':''}>${icon(r.icon)}<span>${r.label}</span></a>`).join('');

function closeMenu(){document.body.classList.remove('mobile-nav-open');document.getElementById('workspaceMenu')?.setAttribute('aria-expanded','false');}
function build(user){
  const main=document.querySelector('main');
  if(!main)return;
  const originalHeader=document.querySelector('body > header');
  if(originalHeader)originalHeader.remove();
  const name=(user.displayName||user.email?.split('@')[0]||'Student').trim();
  const initial=(name[0]||'S').toUpperCase();
  const workspace=document.createElement('div');
  workspace.className='workspace';
  workspace.innerHTML=`
    <aside class="workspace-sidebar" id="workspaceSidebar" aria-label="Student dashboard navigation">
      <div class="workspace-sidebar-head"><a class="workspace-brand" href="dashboard.html"><span class="workspace-brandmark">◎</span><span>Find<span class="blue">Circle</span></span></a><button type="button" class="workspace-close-button" id="workspaceClose" aria-label="Close navigation">${icon('close')}</button></div>
      <div class="workspace-campus">PICT · Lost & Found</div>
      <div class="workspace-nav-label">YOUR WORKSPACE</div>
      <nav class="workspace-links" aria-label="Dashboard sections">${nav}</nav>
      <div class="workspace-sidebar-footer"><div class="workspace-mini-profile"><span class="workspace-initial" id="workspaceSidebarInitial"></span><span class="workspace-identity"><strong id="workspaceSidebarName"></strong><small>Student account</small></span></div><button class="workspace-logout" type="button" data-workspace-logout>${icon('logout')}<span>Log out</span></button></div>
    </aside>
    <div class="workspace-overlay" id="workspaceOverlay" aria-hidden="true"></div>
    <div class="workspace-area"><header class="workspace-topbar"><div class="workspace-topbar-left"><button type="button" class="workspace-menu-button" id="workspaceMenu" aria-controls="workspaceSidebar" aria-expanded="false" aria-label="Open navigation">${icon('menu')}</button><div class="workspace-title-block"><span class="workspace-mobile-brand">Find<span class="blue">Circle</span></span><strong>${labels[current]||'Find Circle'}</strong></div></div><div class="workspace-topbar-right"><a class="workspace-create" href="report.html" aria-label="Create a new report" title="Create report">${icon('plus')}<span>New report</span></a><button type="button" class="workspace-top-logout" data-workspace-logout>${icon('logout')}<span>Log out</span></button></div></header><div class="workspace-content" id="workspaceContent"></div></div>`;
  main.parentNode.insertBefore(workspace,main);
  workspace.querySelector('#workspaceContent').append(main);
  document.body.classList.add('app-page');
  workspace.querySelector('#workspaceSidebarInitial').textContent=initial;
  workspace.querySelector('#workspaceSidebarName').textContent=name;
  const menu=workspace.querySelector('#workspaceMenu');
  menu.addEventListener('click',()=>{
    const open=document.body.classList.toggle('mobile-nav-open');
    menu.setAttribute('aria-expanded',String(open));
    if(open)workspace.querySelector('.workspace-links a')?.focus();
  });
  workspace.querySelector('#workspaceOverlay').addEventListener('click',closeMenu);
  workspace.querySelector('#workspaceClose').addEventListener('click',()=>{closeMenu();menu.focus();});
  workspace.querySelectorAll('.workspace-links a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  for(const button of workspace.querySelectorAll('[data-workspace-logout]')){
    button.addEventListener('click',async()=>{
      workspace.querySelectorAll('[data-workspace-logout]').forEach(el=>el.disabled=true);
      try{await signOut(auth);location.replace('login.html');}
      catch(e){workspace.querySelectorAll('[data-workspace-logout]').forEach(el=>el.disabled=false);alert('Could not log out. Please try again.');console.error(e);}
    });
  }
  window.dispatchEvent(new CustomEvent('findcircle:workspace-ready',{detail:{name,user}}));
}
const optional=document.body.dataset.optionalShell==='true';
onAuthStateChanged(auth,user=>{
  if(!user){if(!optional)location.replace('login.html');return;}
  if(!document.querySelector('.workspace'))build(user);
});
