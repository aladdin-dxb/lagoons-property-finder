/* Lagoons Property Finder v1.0 · © 2026 Ahmed Aladdin (أحمد علاء الدين). All rights reserved. See LICENSE. */
/* DXBinteract helpers for the Lagoons Property Finder data update. Paste into javascript_tool on https://dxbinteract.com/dubai-house-prices */
window.W={};
W.sleep=ms=>new Promise(r=>setTimeout(r,ms));
W.locInput=()=>{const i=document.getElementById('SearchInput');if(!i.offsetParent){const c=document.querySelector('#SearchComponent');c&&c.click()}return document.getElementById('SearchInput')};
W.options=()=>[...document.querySelectorAll('article, li, [role=option]')].filter(e=>e.offsetParent).map(e=>({el:e,t:e.innerText.replace(/\s+/g,' ').trim()}));
W.pick=async function(query,exact){
  for(let attempt=0;attempt<3;attempt++){
    if(apex.item('P74_DLD_LOCATION_TEXT').getValue()===exact)return exact;
    const inp=W.locInput(); inp.focus(); inp.value=''; inp.dispatchEvent(new Event('input',{bubbles:true}));
    inp.value=query; inp.dispatchEvent(new Event('input',{bubbles:true})); inp.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'a'}));
    let o=null;for(let i=0;i<20&&!o;i++){await W.sleep(400);o=W.options().find(o=>o.t===exact)}
    if(!o)continue;
    o.el.click();
    for(let i=0;i<12;i++){await W.sleep(500);if(apex.item('P74_DLD_LOCATION_TEXT').getValue()===exact)return exact}
  }
  return 'NOT SET: '+exact+' (now: '+apex.item('P74_DLD_LOCATION_TEXT').getValue()+')';
};
/* unit codes come as D112, V294, DL-W176 or DL-M444: drop the DL- prefix and dashes */
W.code=c=>c.replace(/^DL-(?=[A-Z])/,'').replace(/-/g,'');
W.rowsOf=sel=>[...document.querySelectorAll(sel+' tbody > tr')].map(t=>t.innerText.replace(/\s+/g,' ').trim());
W.expand=async function(sel){
  const lk=[...document.querySelectorAll(sel+' a')].find(x=>/paginate/.test(x.getAttribute('href')||''));
  if(lk){lk.setAttribute('href',lk.getAttribute('href').replace(/min=\d+/,'min=1').replace(/max=\d+/,'max=1000').replace(/fetched=\d+/,'fetched=1000'));lk.click();
    for(let i=0;i<40;i++){await W.sleep(500);if(![...document.querySelectorAll(sel+' a')].some(x=>/paginate/.test(x.getAttribute('href')||'')))break}}
  let last=-1,st=0;for(let i=0;i<40;i++){await W.sleep(500);const n=W.rowsOf(sel).length;if(n===last){if(++st>=3)break}else{st=0;last=n}}
};
W.win=async function(deal,a,b){
  apex.item('P74_DEAL').setValue(deal);apex.item('P74_BEDS')&&apex.item('P74_BEDS').setValue('-1');
  apex.item('P74_START_DATE').setValue(a);apex.item('P74_END_DATE').setValue(b);
  const reg=deal==='RENT'?'rentHistory':'soldhistory',sel='#'+reg;
  await apex.region(reg).refresh();await W.sleep(800);await W.expand(sel);
  return W.rowsOf(sel).filter(t=>deal==='RENT'?/Months?/.test(t):/AED/.test(t));
};
W.MO={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
W.ymd=(d,mo,y)=>y+'-'+String(W.MO[mo]).padStart(2,'0')+'-'+String(d).padStart(2,'0');
/* sale row -> phase|unit|price|plot|bua|date|D/I|ready|beds */
W.psale=function(t){
  const ph=(t.match(/^(.*?), Damac Lagoons/)||[])[1]; const u=(t.match(/No\. ?([A-Z]+(?:-[A-Z]+)?-?\d+)/)||[])[1];
  const v=(t.match(/AED ([\d,]+)/)||[])[1]; const dt=t.match(/(\d{1,2}),? ([A-Z][a-z]{2}),? (\d{4})/);
  const sq=[...t.matchAll(/([\d,]+) sqft/g)].map(m=>m[1].replace(/,/g,''));
  const bd=(t.match(/(\d+) Beds?/)||[])[1]||'';
  const k=/\bDeveloper\b/.test(t)?'D':'I';
  if(!ph||!u||!v||!dt)return null;
  return [ph,W.code(u),v.replace(/,/g,''),sq[0]||'',sq[1]||'',W.ymd(dt[1],dt[2],dt[3]),k,/Ready/i.test(t)?'R':'O',bd].join('|');
};
/* rent row -> phase|unit|rent|plot|start|end|months|beds */
W.prent=function(t){
  const m=t.match(/^(.*?), Damac Lagoons .*?No\. ?([A-Z]+(?:-[A-Z]+)?-?\d+)\s*(?:(\d+) Beds?|Studio)?\s*([\d,]+) sqft ([\d,]+) .*?(\d{1,2}) ([A-Z][a-z]{2}), (\d{4}) - (\d{1,2}) ([A-Z][a-z]{2}), (\d{4}) (\d+) Months?/);
  if(!m)return null;
  return [m[1],W.code(m[2]),m[5].replace(/,/g,''),m[4].replace(/,/g,''),W.ymd(m[6],m[7],m[8]),W.ymd(m[9],m[10],m[11]),m[12],m[3]||''].join('|');
};
W.LOCS=[['Costa Brava 1','Costa Brava 1, Damac Lagoons'],['Costa Brava 2','Costa Brava 2, Damac Lagoons'],['Portofino Damac','Portofino, Damac Lagoons'],
 ['Santorini','Santorini, Damac Lagoons'],['Venice Damac','Venice 1, Damac Lagoons'],['Nice Damac','Nice (All Phases), Damac Lagoons'],
 ['Malta Damac','Malta (all buildings), Damac Lagoons'],['Morocco Damac','Morocco (All Phases), Damac Lagoons'],['Monte Carlo Damac','Monte Carlo, Damac Lagoons'],
 ['Ibiza Damac','Ibiza, Damac Lagoons'],['Marbella Damac','Marbella (All Phases), Damac Lagoons'],['Mykonos Damac','Mykonos (All Phases), Damac Lagoons']];
/* run everything for a date range; results in W.out */
W.run=async function(a,b){
  W.out={sales:[],rents:[],log:[],bad:0,badRows:[]};
  for(const [q,name] of W.LOCS){
    const loc=await W.pick(q,name); if(loc!==name){W.out.log.push('LOC FAIL '+name+' -> '+loc);continue}
    for(const deal of ['SALE','RENT']){
      const rows=await W.win(deal,a,b); if(rows.length>=280)W.out.log.push('WARN '+name+' '+deal+' hit cap '+rows.length);
      for(const r of rows){const p=deal==='SALE'?W.psale(r):W.prent(r);if(p)(deal==='SALE'?W.out.sales:W.out.rents).push(p);else{W.out.bad++;W.out.badRows.push(r.slice(0,140))}}
      W.out.log.push(name+' '+deal+' '+rows.length);
    }
  }
  W.out.done=true;
};
/* the run takes a few minutes: start it, then poll W.out.done / W.out.log */
W.start=(a,b)=>{W.run(a,b).catch(e=>{W.out.log.push('ERR '+e.message);W.out.done=true});return 'started'};
W.chunks=()=>{const s=JSON.stringify({sales:[...new Set(W.out.sales)],rents:[...new Set(W.out.rents)]});return s.match(/.{1,900}/g)};
/* W.dump(): data between @@BEGIN@@/@@END@@ plus number padding so the tool output is saved to a file (read it with extract_rows) */
/* W.copy(): in Chrome DevTools console, copies the results to the clipboard; paste into new_rows.json */
W.copy=()=>{copy(JSON.stringify({sales:[...new Set(W.out.sales)],rents:[...new Set(W.out.rents)]}));return (new Set(W.out.sales)).size+" sales, "+(new Set(W.out.rents)).size+" leases copied"};
W.dump=()=>{const c=W.chunks();const f=[];let x=7;for(let i=0;i<60;i++){let s='';for(let j=0;j<150;j++){x=(x*1103515245+12345)%2147483648;s+=String(x%10000).padStart(4,'0')+' '}f.push(s)}return ['@@BEGIN@@',...c,'@@END@@',...f]};
