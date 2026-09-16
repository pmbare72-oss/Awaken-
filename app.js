const KEY="awaken_max_v1",OLD=["awaken_v5","awaken_v2"];
const STATS=["Strength","Discipline","Knowledge","Spirit","Language","Cyber","Creation","Practical","Wealth","Communication"];
const QUESTS=[
["Train","Strength",20],["Meditate","Spirit",10],["Study","Knowledge",15],["Spanish","Language",10],
["Spirit","Spirit",10],["Cybersecurity","Cyber",20],["Create","Creation",10],["Practical Skill","Practical",10],
["Wealth","Wealth",10],["Communication","Communication",10]
];
const ACH=[
["first","First Spark",s=>s.totalXP>0],["streak3","3-Day Streak",s=>s.streak>=3],
["streak7","7-Day Streak",s=>s.streak>=7],["level5","Level 5",s=>s.level>=5],
["level10","Level 10",s=>s.level>=10],["stat10","Stat Online",s=>Math.max(...Object.values(s.stats))>=10],
["sweep","Full Sweep",s=>Object.values(s.today).filter(Boolean).length>=10],["boss","Boss Clear",s=>s.bossesCleared>0],
["goal","Mission Complete",s=>s.goals.some(g=>g.done)],["coins","Coin Stack",s=>s.coins>=100],
["backup","Backup Ready",s=>s.backedUp],["creator","Creator Mode",s=>s.logs.creation>=5]
];
const today=()=>new Date().toISOString().slice(0,10);
const week=()=>{let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.toISOString().slice(0,10)};
const month=()=>new Date().toISOString().slice(0,7);
function base(){
return{
name:"Player",level:1,xp:0,totalXP:0,rank:"E",coins:0,streak:0,lastActive:null,bossesCleared:0,backedUp:false,
stats:Object.fromEntries(STATS.map(x=>[x,1])),questDay:today(),today:{},history:{},
achievements:{},goals:[{id:1,title:"Build a strong daily foundation",note:"Train, study, reflect, and keep learning.",done:false}],
daily:{date:today(),done:false},weekly:{week:week(),done:false},monthly:{month:month(),done:false},
logs:{workout:0,creation:0,spanish:0,study:0},wellbeing:{sleep:null,energy:null,water:0},rewards:[],custom:[]
}}
function merge(s){
let b=base(),o={...b,...(s||{}),
stats:{...b.stats,...((s||{}).stats||{})},logs:{...b.logs,...((s||{}).logs||{})},
wellbeing:{...b.wellbeing,...((s||{}).wellbeing||{})},
goals:Array.isArray(s?.goals)?s.goals:b.goals,rewards:Array.isArray(s?.rewards)?s.rewards:[],
custom:Array.isArray(s?.custom)?s.custom:[]
};
if(o.questDay!==today()){o.questDay=today();o.today={}}
if(o.daily.date!==today())o.daily={date:today(),done:false}
if(o.weekly.week!==week())o.weekly={week:week(),done:false}
if(o.monthly.month!==month())o.monthly={month:month(),done:false}
return o
}
function load(){
let r=localStorage.getItem(KEY);
if(r)try{return merge(JSON.parse(r))}catch(e){}
for(const k of OLD){r=localStorage.getItem(k);if(r)try{return merge(JSON.parse(r))}catch(e){}}
return base()
}
let S=load(),page="home";
function save(s=S){localStorage.setItem(KEY,JSON.stringify(s))}
function need(){return 100+(S.level-1)*40}
function rank(){return S.level>=30?"SS":S.level>=20?"S":S.level>=14?"A":S.level>=9?"B":S.level>=5?"C":S.level>=2?"D":"E"}
function toast(x){let e=document.getElementById("toast");e.textContent=x;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1800)}
function touch(){
if(S.lastActive!==today()){
if(S.lastActive){let d=new Date();d.setDate(d.getDate()-1);S.streak=S.lastActive===d.toISOString().slice(0,10)?S.streak+1:1}
else S.streak=1;
S.lastActive=today()
}}
function xp(n,why){
touch();S.xp+=n;S.totalXP+=n;S.coins+=Math.max(1,Math.floor(n/10));
while(S.xp>=need()){S.xp-=need();S.level++}
S.rank=rank();toast("+"+n+" XP • "+why);save();check();render()
}
function quest(i){
let q=QUESTS[i];if(S.today[q[0]])return toast("Already completed.");
S.today[q[0]]=true;S.stats[q[1]]++;xp(q[2],q[0])
}
function boss(t){
let x=t==="daily"?S.daily:t==="weekly"?S.weekly:S.monthly;
if(x.done)return toast("Already cleared.");
x.done=true;S.bossesCleared++;xp(t==="daily"?30:t==="weekly"?100:200,t+" boss")
}
function check(){for(const [id,name,fn] of ACH)if(!S.achievements[id]&&fn(S))S.achievements[id]=today()}
function modal(h){document.getElementById("modal").innerHTML='<div class="modalBox">'+h+"</div>";document.getElementById("modal").classList.remove("hidden")}
function close(){document.getElementById("modal").classList.add("hidden")}
function custom(){
modal('<h2>Custom Quest</h2><div class="grid"><div class="field"><label>Name</label><input id="cn"></div><div class="field"><label>Stat</label><select id="cs">'+STATS.map(x=>`<option>${x}</option>`).join("")+'</select></div><div class="field"><label>XP</label><input id="cx" type="number" min="5" max="100" value="15"></div><div class="row"><button class="btn ghost" data-action="close">Cancel</button><button class="btn primary" data-action="saveCustom">Create</button></div></div>')
}
function saveCustom(){
let n=document.getElementById("cn").value.trim();if(!n)return toast("Name the quest.");
S.custom.push({id:Date.now(),name:n,stat:document.getElementById("cs").value,xp:Math.min(100,Math.max(5,+document.getElementById("cx").value||15)),done:false,day:today()});
save();close();render()
}
function completeCustom(id){
let q=S.custom.find(x=>x.id===id&&x.day===today());if(!q||q.done)return;
q.done=true;S.stats[q.stat]++;xp(q.xp,q.name)
}
function goalModal(){
modal('<h2>New Mission</h2><div class="grid"><div class="field"><label>Mission</label><input id="gt"></div><div class="field"><label>Why it matters</label><textarea id="gn" rows="3"></textarea></div><div class="row"><button class="btn ghost" data-action="close">Cancel</button><button class="btn primary" data-action="saveGoal">Add</button></div></div>')
}
function saveGoal(){
let t=document.getElementById("gt").value.trim();if(!t)return toast("Name the mission.");
S.goals.push({id:Date.now(),title:t,note:document.getElementById("gn").value.trim(),done:false});
save();close();render()
}
function goal(id){let g=S.goals.find(x=>x.id===id);if(!g||g.done)return;g.done=true;xp(50,"Mission Complete")}
function profile(){
modal('<h2>Profile</h2><div class="grid"><div class="field"><label>Display name</label><input id="pn" value="'+(S.name||"Player").replace(/"/g,"&quot;")+'"></div><div class="row"><button class="btn ghost" data-action="close">Cancel</button><button class="btn primary" data-action="saveProfile">Save</button></div></div>')
}
function saveProfile(){S.name=document.getElementById("pn").value.trim()||"Player";save();close();render()}
function wellbeing(){
modal('<h2>Wellbeing Log</h2><p class="muted">Reflection only — nothing here is a target or requirement.</p><div class="grid"><div class="field"><label>Sleep hours</label><input id="sl" type="number" min="0" max="24" step=".5"></div><div class="field"><label>Energy 1–5</label><input id="en" type="number" min="1" max="5"></div><div class="field"><label>Water cups</label><input id="wa" type="number" min="0" max="30"></div><button class="btn primary" data-action="saveWellbeing">Save</button></div>')
}
function saveWellbeing(){
S.wellbeing={sleep:+document.getElementById("sl").value||null,energy:+document.getElementById("en").value||null,water:+document.getElementById("wa").value||0};
save();close();render();toast("Saved")
}
function log(t){
S.logs[t]++;let st=t==="creation"?"Creation":t==="spanish"?"Language":t==="study"?"Knowledge":"Strength";
S.stats[st]++;xp(t==="workout"?15:10,t)
}
function shop(){
let items=[["Quiet hour",30],["New notebook",50],["Art session",40],["Small outing",80]];
modal("<h2>Reward Shop</h2><p class='muted'>Choose safe, realistic rewards for yourself.</p><div class='list'>"+
items.map(x=>`<div class="listItem row"><b>${x[0]}</b><button class="btn primary" data-action="buy" data-name="${x[0]}" data-cost="${x[1]}">${x[1]} ◇</button></div>`).join("")+
"</div>")
}
function buy(n,c){
if(S.coins<c)return toast("Not enough coins.");
S.coins-=c;S.rewards.unshift({name:n,cost:c,date:today()});save();close();render();toast("Reward unlocked")
}
function exportData(){
S.backedUp=true;save();check();
let a=document.createElement("a"),u=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));
a.href=u;a.download="awaken-max-backup-"+today()+".json";a.click();URL.revokeObjectURL(u);toast("Backup exported")
}
function importData(){
let i=document.createElement("input");i.type="file";i.accept=".json";
i.onchange=async()=>{try{S=merge(JSON.parse(await i.files[0].text()));save();render();toast("Backup restored")}catch(e){toast("Invalid backup")}};
i.click()
}
function reset(){if(confirm("Reset AWAKEN MAX? Make sure you have a backup first.")){S=base();save();render()}}
function voice(){
if(!window.speechSynthesis)return toast("Voice unavailable");
speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(document.getElementById("screen").innerText.slice(0,1500)))
}
function home(){
let qs=QUESTS.map((q,i)=>`<div class="listItem quest ${S.today[q[0]]?"done":""}"><div><b class="questName">${q[0]}</b><div class="questMeta">+${q[2]} XP • ${q[1]}</div></div><button class="btn ${S.today[q[0]]?"ghost":"primary"}" data-action="quest" data-i="${i}">${S.today[q[0]]?"✓":"Clear"}</button></div>`).join("");
let cs=S.custom.filter(q=>q.day===today()).map(q=>`<div class="listItem quest ${q.done?"done":""}"><div><b>${q.name}</b><div class="questMeta">+${q.xp} XP • ${q.stat}</div></div><button class="btn primary" data-action="customQuest" data-id="${q.id}">${q.done?"✓":"Clear"}</button></div>`).join("");
return `<div class="grid">
<section class="card hero"><div class="row"><div><div class="rank">${S.rank}-RANK</div><div class="statBig">LEVEL ${S.level}</div><div class="muted">${S.xp}/${need()} XP to next level</div></div><b>✦</b></div><div class="xpbar" style="margin-top:12px"><i style="width:${Math.min(100,S.xp/need()*100)}%"></i></div><div class="row wrap" style="margin-top:12px"><span class="pill">🔥 ${S.streak} day streak</span><span class="pill">◇ ${S.coins}</span><span class="pill">${S.totalXP} total XP</span></div></section>
<div class="grid two"><div class="card"><div class="label">Daily</div><div class="kpi">${Object.values(S.today).filter(Boolean).length}/10</div></div><div class="card"><div class="label">Bosses</div><div class="kpi">${S.bossesCleared}</div></div></div>
<section class="card"><h2>⚔️ Challenges</h2><div class="grid three" style="margin-top:12px"><button class="btn primary" data-action="boss" data-type="daily">Daily +30</button><button class="btn primary" data-action="boss" data-type="weekly">Weekly +100</button><button class="btn primary" data-action="boss" data-type="monthly">Monthly +200</button></div></section>
<section><div class="row sectionTitle"><span>DAILY QUESTS</span><button class="btn ghost" data-action="custom">＋ Custom</button></div><div class="list">${qs}${cs}</div></section>
</div>`
}
function character(){
return `<div class="grid"><section class="card hero"><div class="row"><div><div class="rank">${S.rank}-RANK CHARACTER</div><div class="statBig">${S.name}</div><div class="muted">Level ${S.level} • ${S.totalXP} XP</div></div><button class="btn ghost" data-action="profile">Edit</button></div></section>
<section class="card"><h2>Character Stats</h2>${STATS.map(x=>`<div class="barRow"><span>${x}</span><div class="bar"><i style="width:${Math.min(100,S.stats[x]*5)}%"></i></div><span>${S.stats[x]}</span></div>`).join("")}</section>
<section class="card"><h2>Lifetime Logs</h2><div class="grid two" style="margin-top:10px">${Object.entries(S.logs).map(x=>`<div class="listItem"><div class="label">${x[0]}</div><div class="kpi">${x[1]}</div></div>`).join("")}</div></section></div>`
}
function progress(){
let a=[];for(let i=13;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=d.toISOString().slice(0,10);a.push([k,S.history[k]?.xp||0])}
let mx=Math.max(20,...a.map(x=>x[1]));
return `<div class="grid"><section class="card"><h2>📈 14-Day History</h2><div class="history" style="margin-top:15px">${a.map(x=>`<div class="dayCol"><div class="dayBar" style="--h:${Math.max(4,x[1]/mx*90)}px"></div><small>${x[0].slice(8)}</small></div>`).join("")}</div></section>
<section class="card"><h2>Achievements</h2><div class="grid two" style="margin-top:12px">${ACH.map(x=>`<div class="listItem" style="opacity:${S.achievements[x[0]]?1:.45}"><b>${S.achievements[x[0]]?"🏆":"◇"} ${x[1]}</b><div class="small">${S.achievements[x[0]]?"Unlocked":"Locked"}</div></div>`).join("")}</div></section></div>`
}
function rewards(){
return `<div class="grid"><section class="card hero"><div class="label">AWAKEN COINS</div><div class="statBig">◇ ${S.coins}</div><button class="btn primary" data-action="shop" style="margin-top:12px">Reward Shop</button></section>
<section class="card"><h2>Recent Rewards</h2><div class="list" style="margin-top:10px">${S.rewards.slice(0,8).map(x=>`<div class="listItem row"><span>${x.name}</span><span class="small">${x.cost} ◇</span></div>`).join("")||'<div class="small">None yet.</div>'}</div></section></div>`
}
function more(){
return `<div class="grid"><section class="card"><div class="row"><h2>🎯 Missions</h2><button class="btn primary" data-action="newGoal">＋ Mission</button></div><div class="list" style="margin-top:10px">${S.goals.map(g=>`<div class="listItem row"><div><b>${g.title}</b><div class="small">${g.note||""}</div></div><button class="btn ${g.done?"ghost":"primary"}" data-action="goal" data-id="${g.id}">${g.done?"✓":"Complete"}</button></div>`).join("")}</div></section>
<section class="card"><h2>🧠 Quick Logs</h2><div class="grid two" style="margin-top:10px"><button class="btn primary" data-action="log" data-type="workout">＋ Workout</button><button class="btn primary" data-action="log" data-type="study">＋ Study</button><button class="btn primary" data-action="log" data-type="spanish">＋ Spanish</button><button class="btn primary" data-action="log" data-type="creation">＋ Create</button><button class="btn ghost" data-action="wellbeing">☼ Wellbeing</button></div></section>
<section class="card"><h2>⚙️ System</h2><div class="list" style="margin-top:10px"><button class="btn primary" data-action="export">Export Backup</button><button class="btn ghost" data-action="import">Import Backup</button><button class="btn danger" data-action="reset">Reset</button></div><div class="small notice" style="margin-top:12px">AWAKEN MAX v1 • local-first • offline-ready. Your progress stays in this browser unless you export it.</div></section></div>`
}
function render(){
S=merge(S);
S.history[today()]={xp:S.totalXP,quests:Object.values(S.today).filter(Boolean).length};
save();
document.getElementById("greeting").textContent=(S.name||"Player")+" // "+(page==="home"?"Command Center":page[0].toUpperCase()+page.slice(1));
document.getElementById("dateLine").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"short",year:"numeric"});
document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x.dataset.nav===page));
document.getElementById("screen").innerHTML=page==="home"?home():page==="character"?character():page==="progress"?progress():page==="rewards"?rewards():more();
}
document.addEventListener("click",e=>{
let n=e.target.closest("[data-nav]");if(n){page=n.dataset.nav;render();return}
let a=e.target.closest("[data-action]");if(!a)return;
let x=a.dataset.action;
if(x==="quest")quest(+a.dataset.i);else if(x==="boss")boss(a.dataset.type);else if(x==="custom")custom();else if(x==="saveCustom")saveCustom();
else if(x==="customQuest")completeCustom(+a.dataset.id);else if(x==="newGoal")goalModal();else if(x==="saveGoal")saveGoal();
else if(x==="goal")goal(+a.dataset.id);else if(x==="profile")profile();else if(x==="saveProfile")saveProfile();
else if(x==="wellbeing")wellbeing();else if(x==="saveWellbeing")saveWellbeing();else if(x==="log")log(a.dataset.type);
else if(x==="shop")shop();else if(x==="buy")buy(a.dataset.name,+a.dataset.cost);else if(x==="export")exportData();
else if(x==="import")importData();else if(x==="reset")reset();else if(x==="close")close();else if(x==="voice")voice();
});
if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js").catch(()=>{});
check();save();render();
