const QUESTS = [
  {id:"str", icon:"🏋️", name:"Train", meta:"Body • controlled movement", xp:20, stat:"STR"},
  {id:"mnd", icon:"🧘", name:"Meditate", meta:"Mind • 5–20 minutes", xp:10, stat:"MND"},
  {id:"int", icon:"📚", name:"Study", meta:"Brain • learn something", xp:15, stat:"INT"},
  {id:"lan", icon:"🇪🇸", name:"Spanish", meta:"Language • Duolingo + practice", xp:10, stat:"LAN"},
  {id:"spi", icon:"📖", name:"Spirit", meta:"Bible • reflection or study", xp:10, stat:"SPI"},
  {id:"tec", icon:"💻", name:"Cybersecurity", meta:"Technology • legal labs only", xp:20, stat:"TEC"},
  {id:"cre", icon:"🎨", name:"Create", meta:"Art • draw or make", xp:10, stat:"CRE"},
  {id:"pra", icon:"🧰", name:"Practical Skill", meta:"Repair • build • practice", xp:10, stat:"PRA"},
  {id:"wlt", icon:"💰", name:"Wealth", meta:"Track, save or learn money skills", xp:10, stat:"WLT"},
  {id:"com", icon:"🗣️", name:"Communication", meta:"Speak, write or listen intentionally", xp:10, stat:"COM"}
];

const STAT_NAMES = {
  STR:"Strength",MND:"Mind",INT:"Intelligence",TEC:"Technology",LAN:"Language",
  SPI:"Spirit",WLT:"Wealth",PRA:"Practical",COM:"Communication",CRE:"Creativity"
};

const defaultState = () => ({
  xp:0, stats:Object.fromEntries(Object.keys(STAT_NAMES).map(k=>[k,0])),
  done:{}, boss:false, date:new Date().toISOString().slice(0,10)
});

let state = JSON.parse(localStorage.getItem("awakenState") || "null") || defaultState();
const today = new Date().toISOString().slice(0,10);
if(state.date !== today){ state.done={}; state.boss=false; state.date=today; save(); }

function save(){localStorage.setItem("awakenState",JSON.stringify(state));}
function level(){return Math.floor(state.xp/100)+1}
function rank(){let l=level();return l<=5?"E":l<=10?"D":l<=20?"C":l<=30?"B":l<=40?"A":l<=50?"S":"SS"}
function addXP(amount,stat){
  state.xp += amount;
  if(stat) state.stats[stat] += amount;
}
function render(){
  document.getElementById("level").textContent=level();
  document.getElementById("rank").textContent=rank();
  document.getElementById("totalXp").textContent=state.xp;
  const progress=state.xp%100;
  document.getElementById("xpFill").style.width=progress+"%";
  document.getElementById("xpText").textContent=`${progress} / 100 XP to next level`;

  const doneCount=QUESTS.filter(q=>state.done[q.id]).length;
  document.getElementById("questCount").textContent=`${doneCount} / ${QUESTS.length}`;

  document.getElementById("quests").innerHTML=QUESTS.map(q=>{
    const done=!!state.done[q.id];
    return `<article class="quest ${done?"done":""}">
      <div class="quest-icon">${q.icon}</div>
      <div><div class="quest-name">${q.name}</div><div class="quest-meta">${q.meta}</div></div>
      <div style="text-align:right"><div class="xp">+${q.xp} XP</div><button class="complete ${done?"checked":""}" data-id="${q.id}" ${done?"disabled":""}>✓</button></div>
    </article>`;
  }).join("");

  document.querySelectorAll(".complete").forEach(btn=>btn.addEventListener("click",()=>{
    const q=QUESTS.find(x=>x.id===btn.dataset.id); if(!q||state.done[q.id])return;
    state.done[q.id]=true; addXP(q.xp,q.stat); save(); render();
  }));

  document.getElementById("stats").innerHTML=Object.entries(STAT_NAMES).map(([key,name])=>{
    const value=state.stats[key];
    const width=Math.min(100,(value%100));
    return `<div class="stat"><div class="stat-top"><span class="stat-name">${name}</span><span class="stat-value">${value}</span></div><div class="stat-bar"><div style="width:${width}%"></div></div></div>`;
  }).join("");

  const boss=document.getElementById("bossBtn");
  boss.disabled=state.boss; boss.textContent=state.boss?"BOSS DEFEATED ✓":"DEFEAT +30 XP";
}
document.getElementById("bossBtn").addEventListener("click",()=>{
  if(state.boss)return;
  state.boss=true; addXP(30); save(); render();
  alert("⚔️ BOSS DEFEATED!\n+30 XP\n\nYou chose progress over avoidance.");
});
document.getElementById("resetBtn").addEventListener("click",()=>{
  if(confirm("Reset ALL AWAKEN progress on this device?")){state=defaultState();save();render();}
});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));}
render();
