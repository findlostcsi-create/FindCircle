import {readItems,itemCard,CATEGORIES} from './items.js';
let items=[],type='All',category='All',search='';
const initialSearch=new URLSearchParams(location.search).get('q')||'';
const $=id=>document.getElementById(id);
if(initialSearch){$('recentSearch').value=initialSearch;search=initialSearch.trim().toLowerCase();}
const select=$('recentCategory');
for(const name of CATEGORIES){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option);}
function render(){
 const filtered=items.filter(x=>(type==='All'||x.type===type)&&(category==='All'||x.category===category)&&(!search||[x.title,x.category,x.description,x.location].join(' ').toLowerCase().includes(search)));
 $('recentStatus').textContent=filtered.length?`${filtered.length} open report${filtered.length===1?'':'s'} found`:'No matching open reports.';
 $('recentResults').innerHTML=filtered.length?filtered.map(itemCard).join(''):'<div class="dashboard-empty recent-empty">Try another search or <a href="report.html">create a new report</a>.</div>';
}
$('recentSearch').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();render();});
select.addEventListener('change',e=>{category=e.target.value;render();});
document.querySelectorAll('[data-recent-type]').forEach(b=>b.addEventListener('click',()=>{type=b.dataset.recentType;document.querySelectorAll('[data-recent-type]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',String(t===b));});render();}));
readItems((data,err)=>{if(err){$('recentStatus').textContent='Could not load reports. Check Firestore rules and connection.';console.error(err);return;}items=data;render();});
