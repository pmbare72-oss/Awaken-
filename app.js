const Q=[["Train",20,"STR"],["Meditate",10,"MND"],["Study",15,"INT"],["Spanish",10,"LAN"],["Spirit",10,"SPI"],["Cybersecurity",20,"TEC"],["Create",10,"CRE"],["Practical Skill",10,"PRA"],["Wealth",10,"WLT"],["Communication",10,"COM"]];
const N={STR:"Strength",MND:"Mind",INT:"Intelligence",TEC:"Technology",LAN:"Language",SPI:"Spirit",WLT:"Wealth",PRA:"Practical",COM:"Communication",CRE:"Creativity"};
const A=[["⚡","First Awakening","First quest",s=>s.xp>=10],["🔥","100 XP","Reach 100 XP",s=>s.xp>=100],["👑","Boss Slayer","Defeat a boss",s=>s.bosses>0],["📚","Scholar","Study 10 times",s=>s.stats.INT>=10],["🌎","Polyglot","Spanish 10 times",s=>s.stats.LAN>=10],["🛡️","Cyber Initiate","Cybersecurity 10 times",s=>s.stats.TEC>=10],["🏆","Level 5","Reach level 5",s=>s.level>=5],["⭐","S-Rank Potential","Reach level 31",s=>s.level>=31]];
const key=()=>new Date().toISOString().slice(0,10);
const fresh=()=>({xp:0,level:1,done:{},bosses:0,stats:Object.fromEntries(Object.keys(N).map(k=>[k,0])),history:{}});
let s=JSON.parse(localStorage.getItem("awaken_v2")||"null")||fresh();
const save=()=>localStorage.setItem("awaken_v2",JSON.stringify(s));
const rank=l=>l>=51?"SS":l>=41?"S":l>=31?"A":l>=21?"B":l>=11?"C":l>=6?"D":"E";
function toast(t){let e=document.querySelector("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1400)}
function render(){
 s.level=Math.floor(s.xp/100)+1;let inside=s.xp%100;
 level.textContent=s.level;rank.textContent=rank(s.level);xp.textContent=s.xp;bar.style.width=inside+"%";next.textContent=`${inside} / 100 XP to next level`;
 let d=s.done[key()]||{}, c=Q.filter(q=>d[q[0]]).length;count.textContent=`${c}/10`;
 quests.innerHTML=Q.map(q=>`<div class="quest ${d[q[0]]?"done":""}" onclick="doQuest('${q[0]}')"><span class="check">${d[q[0]]?"✓":""}</span><span class="name">${q[0]}</span><span class="xp">+${q[1]} XP</span></div>`).join("");
 let bd=s.history[key()]?.boss;boss.disabled=!!bd;boss.textContent=bd?"👑 BOSS DEFEATED":"⚔️ DEFEAT BOSS";bossmsg.textContent=bd?"Today's boss is down.":"";
 stats.innerHTML=Object.entries(N).map(([k,n])=>{let v=s.stats[k]||0;return `<div class="stat"><div class="statrow"><span>${n}</span><span>${v}</span></div><div class="statbar"><i style="width:${Math.min(100,v*5)}%"></i></div></div>`}).join("");
 let ac=A.filter(a=>a[3](s)).length;achcount.textContent=`${ac}/8`;ach.innerHTML=A.map(a=>`<div class="achievement ${a[3](s)?"":"locked"}"><div class="icon">${a[0]}</div><b>${a[1]}</b><small>${a[3](s)?"Unlocked":a[2]}</small></div>`).join("");
 let days=[];for(let i=13;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10))}
 history.innerHTML=days.map(k=>`<div class="day"><div class="daybar"><i style="height:${Math.min(100,s.history[k]?.xp||0)}%"></i></div><small>${k.slice(5)}</small></div>`).join("");
 let st=0,d=new Date();while(s.history[d.toISOString().slice(0,10)]?.xp>0){st++;d.setDate(d.getDate()-1);if(st>365)break}streak.textContent=`${st} day streak`;
}
function doQuest(name){let d=s.done[key()]||{};if(d[name])return;let q=Q.find(x=>x[0]===name);s.done[key()]={...d,[name]:true};s.xp+=q[1];s.stats[q[2]]++;s.history[key()]??={xp:0,boss:false};s.history[key()].xp+=q[1];save();render();toast(`+${q[1]} XP • ${name}`)}
boss.onclick=()=>{s.history[key()]??={xp:0,boss:false};if(s.history[key()].boss)return;s.history[key()].boss=true;s.history[key()].xp+=30;s.xp+=30;s.bosses++;save();render();toast("👑 Boss defeated! +30 XP")};
reset.onclick=()=>{if(confirm("Reset all AWAKEN V2 progress?")){s=fresh();save();render();}};
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));render();