const Q=[["Train",20,"STR"],["Meditate",10,"MND"],["Study",15,"INT"],["Spanish",10,"LAN"],["Spirit",10,"SPI"],["Cybersecurity",20,"TEC"],["Create",10,"CRE"],["Practical Skill",10,"PRA"],["Wealth",10,"WLT"],["Communication",10,"COM"]];
const N={STR:"Strength",MND:"Mind",INT:"Intelligence",TEC:"Technology",LAN:"Language",SPI:"Spirit",WLT:"Wealth",PRA:"Practical",COM:"Communication",CRE:"Creativity"};
const titles=[[1,"Awakened Beginner"],[6,"Disciplined Learner"],[11,"Rising Adventurer"],[21,"Skilled Builder"],[31,"Elite Learner"],[41,"Master Candidate"],[51,"Awakened Master"]];
const ACH=[
["✦","First Awakening","Complete your first quest",s=>s.xp>=10],
["100","Century","Reach 100 XP",s=>s.xp>=100],
["★","Challenge Accepted","Complete a daily challenge",s=>s.bosses>0],
["◈","Weekly Warrior","Complete a weekly boss",s=>s.weeklyBosses>0],
["📚","Scholar","Complete Study 10 times",s=>(s.stats.INT||0)>=10],
["🌎","Polyglot","Complete Spanish 10 times",s=>(s.stats.LAN||0)>=10],
["◉","Cyber Initiate","Complete Cybersecurity 10 times",s=>(s.stats.TEC||0)>=10],
["🔥","Three-Day Flame","Reach a 3-day streak",s=>getStreak(s)>=3],
["🏆","Level 5","Reach level 5",s=>s.level>=5],
["⚡","Level 10","Reach level 10",s=>s.level>=10],
["♛","S-Rank Path","Reach level 31",s=>s.level>=31],
["∞","Long Run","Reach a 7-day streak",s=>getStreak(s)>=7]
];
const WEEKLY=[
"Finish one meaningful task you have been postponing.",
"Complete three learning sessions this week.",
"Do one practical task that improves your environment.",
"Complete a workout and one recovery habit on the same day.",
"Create something from scratch and finish it."
];
const DEFAULT_REWARDS=[
{id:1,name:"30 minutes of guilt-free gaming",cost:50},
{id:2,name:"Watch one episode of a show",cost:80},
{id:3,name:"Favorite snack",cost:100},
{id:4,name:"One relaxed evening",cost:150}
];
const today=()=>new Date().toISOString().slice(0,10);
const weekKey=()=>{let d=new Date();let jan=new Date(d.getFullYear(),0,1);return `${d.getFullYear()}-W${Math.ceil((((d-jan)/86400000)+jan.getDay()+1)/7)}`};
const fresh=()=>({version:5,xp:0,level:1,done:{},bosses:0,weeklyBosses:0,stats:Object.fromEntries(Object.keys(N).map(k=>[k,0])),history:{},coins:0,goals:[],rewards:DEFAULT_REWARDS,unlocked:[]});
let s=JSON.parse(localStorage.getItem("awaken_v5")||"null");
if(!s){const old=JSON.parse(localStorage.getItem("awaken_v2")||"null");s=old?migrate(old):fresh();}
function migrate(o){let n=fresh();Object.assign(n,o);n.version=5;n.coins=Math.floor((o.xp||0)/25);n.weeklyBosses=0;n.goals=[];n.rewards=DEFAULT_REWARDS;n.unlocked=[];return n}
function save(){localStorage.setItem("awaken_v5",JSON.stringify(s))}
function level(){return Math.floor(s.xp/100)+1}
function rank(l){return l>=51?"SS":l>=41?"S":l>=31?"A":l>=21?"B":l>=11?"C":l>=6?"D":"E"}
function title(l){let t=titles[0][1];for(const x of titles)if(l>=x[0])t=x[1];return t}
function getStreak(st){let count=0,d=new Date();while(st.history[d.toISOString().slice(0,10)]?.xp>0){count++;d.setDate(d.getDate()-1);if(count>365)break}return count}
function weekBossDone(){return !!s.history[weekKey()]?.weekly}
function toast(t){const e=document.querySelector("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1600)}
function render(){
 s.level=level();
 const inside=s.xp%100,l=s.level;
 document.querySelector("#level").textContent=l;document.querySelector("#rank").textContent=rank(l);document.querySelector("#xp").textContent=s.xp;
 document.querySelector("#bar").style.width=inside+"%";document.querySelector("#next").textContent=`${inside} / 100 XP to next level`;
 document.querySelector("#title").textContent=title(l);document.querySelector("#charTitle").textContent=title(l);document.querySelector("#charLevel").textContent=l;document.querySelector("#charRank").textContent=rank(l);
 document.querySelector("#coins").textContent=s.coins;document.querySelector("#shopCoins").textContent=s.coins;document.querySelector("#streak").textContent=getStreak(s);document.querySelector("#percent").textContent=Math.round(Q.filter(q=>(s.done[today()]||{})[q[0]]).length/Q.length*100)+"%";
 const d=s.done[today()]||{};const c=Q.filter(q=>d[q[0]]).length;document.querySelector("#count").textContent=`${c}/10`;
 document.querySelector("#quests").innerHTML=Q.map(q=>`<div class="quest ${d[q[0]]?"done":""}" onclick="doQuest('${q[0]}')"><span class="check">${d[q[0]]?"✓":""}</span><span class="name">${q[0]}</span><span class="xp">+${q[1]} XP</span></div>`).join("");
 const bd=s.history[today()]?.boss;const boss=document.querySelector("#boss");boss.disabled=!!bd;boss.textContent=bd?"CHALLENGE COMPLETE":"COMPLETE CHALLENGE";document.querySelector("#bossmsg").textContent=bd?"Today's challenge is complete.":"";
 const wi=weekKey(),wd=weekBossDone();document.querySelector("#weeklyText").textContent=WEEKLY[new Date().getDay()%WEEKLY.length];const wb=document.querySelector("#weeklyBoss");wb.disabled=wd;wb.textContent=wd?"WEEKLY BOSS COMPLETE":"DEFEAT WEEKLY BOSS";document.querySelector("#weeklyMsg").textContent=wd?"This week's boss is complete.":"";
 document.querySelector("#stats").innerHTML=Object.entries(N).map(([k,n])=>{let v=s.stats[k]||0;return `<div class="stat"><div class="statrow"><span>${n}</span><span>${v}</span></div><div class="statbar"><i style="width:${Math.min(100,v*4)}%"></i></div></div>`}).join("");
 const ac=ACH.filter(a=>a[3](s)).length;document.querySelector("#achCount").textContent=ac;document.querySelector("#achCount2").textContent=`${ac}/${ACH.length}`;
 document.querySelector("#ach").innerHTML=ACH.map(a=>`<div class="achievement ${a[3](s)?"":"locked"}"><div class="icon">${a[0]}</div><b>${a[1]}</b><small>${a[3](s)?"Unlocked":a[2]}</small></div>`).join("");
 renderHistory();renderGoals();renderRewards();
}
function renderHistory(){
 const days=[];for(let i=29;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10))}
 document.querySelector("#history").innerHTML=days.map(k=>`<div class="day"><div class="daybar"><i style="height:${Math.min(100,s.history[k]?.xp||0)}%"></i></div><small>${k.slice(5)}</small></div>`).join("");
 const entries=Object.entries(s.done).sort((a,b)=>b[0].localeCompare(a[0]));let total=0;let html="";
 for(const [date,done] of entries.slice(0,14)){const names=Object.keys(done).filter(k=>done[k]);total+=names.length;html+=`<div class="history-item"><span>${date}</span><b>${names.length} quests</b></div>`}
 document.querySelector("#historySummary").textContent=`${total} completed`;
 document.querySelector("#questHistory").innerHTML=html||`<div class="history-item"><span>No completed quests yet.</span></div>`;
}
function renderGoals(){
 const g=document.querySelector("#goals");if(!s.goals.length){g.innerHTML=`<p class="muted">Add a goal you want AWAKEN to help you build.</p>`;return}
 g.innerHTML=s.goals.map((x,i)=>`<div class="history-item"><span>${x}</span><button class="smallbtn" onclick="removeGoal(${i})">Done</button></div>`).join("");
}
function renderRewards(){
 document.querySelector("#rewardsList").innerHTML=s.rewards.map(r=>`<div class="reward"><b>${r.name}</b><small>${r.cost} coins</small><button onclick="buyReward(${r.id})" ${s.coins<r.cost?"disabled":""}>Redeem</button></div>`).join("");
 document.querySelector("#unlockedCount").textContent=s.unlocked.length;
 document.querySelector("#unlocked").innerHTML=s.unlocked.length?s.unlocked.map(x=>`<div class="history-item"><span>${x.name}</span><small>${x.date}</small></div>`).join(""):`<p class="muted">No rewards redeemed yet.</p>`;
}
function doQuest(name){
 const d=s.done[today()]||{};if(d[name])return;
 const q=Q.find(x=>x[0]===name);s.done[today()]={...d,[name]:true};s.xp+=q[1];s.coins+=Math.max(1,Math.floor(q[1]/5));s.stats[q[2]]++;
 s.history[today()]??={xp:0,boss:false,weekly:false};s.history[today()].xp+=q[1];
 save();render();toast(`+${q[1]} XP • +${Math.max(1,Math.floor(q[1]/5))} coin`);
}
document.querySelector("#boss").onclick=()=>{s.history[today()]??={xp:0,boss:false,weekly:false};if(s.history[today()].boss)return;s.history[today()].boss=true;s.history[today()].xp+=30;s.xp+=30;s.coins+=6;s.bosses++;save();render();toast("+30 XP • Daily challenge complete")};
document.querySelector("#weeklyBoss").onclick=()=>{if(weekBossDone())return;s.history[weekKey()]??={xp:0,boss:false,weekly:false};s.history[weekKey()].weekly=true;s.xp+=100;s.coins+=20;s.weeklyBosses++;save();render();toast("+100 XP • Weekly boss defeated")};
document.querySelector("#addGoal").onclick=()=>{const g=prompt("Enter a personal goal:");if(g?.trim()){s.goals.push(g.trim());save();render();toast("Goal added")}};
window.removeGoal=i=>{s.goals.splice(i,1);save();render();toast("Goal completed")};
document.querySelector("#addReward").onclick=()=>{const n=prompt("Reward name:");if(!n?.trim())return;const c=parseInt(prompt("Coin cost (example: 100):"),10);if(!Number.isFinite(c)||c<1)return;s.rewards.push({id:Date.now(),name:n.trim(),cost:c});save();render();toast("Reward added")};
window.buyReward=id=>{const r=s.rewards.find(x=>x.id===id);if(!r||s.coins<r.cost)return;s.coins-=r.cost;s.unlocked.unshift({name:r.name,date:today()});save();render();toast("Reward redeemed ★")};
document.querySelector("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(s,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`awaken-v5-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Backup exported")};
document.querySelector("#importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x||typeof x.xp!=="number"||!x.stats)throw 0;s=x;s.version=5;save();render();toast("Progress restored")}catch{toast("That backup is not valid")}};r.readAsText(f)};
document.querySelector("#reset").onclick=()=>{if(confirm("Reset all AWAKEN progress? This cannot be undone unless you exported a backup.")){s=fresh();save();render();toast("AWAKEN reset")}};
document.querySelectorAll(".navbtn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".navbtn").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.querySelector("#"+b.dataset.screen).classList.add("active");window.scrollTo(0,0)});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
render();