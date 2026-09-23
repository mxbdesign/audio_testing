let C=[];
let phase="round1";
let queue=[];
let winners=[];
let comparison=0;
let finalPool=[];
let top3=[];
let locked=false;
const $=q=>document.querySelector(q);

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function getCandidate(id){return C.find(c=>c.id===id);}
function begin(){
  phase="round1";
  queue=shuffle(C.map(c=>c.id));
  winners=[];
  comparison=0;
  top3=[];
  $("#login").classList.add("hidden");
  showNextPair();
}
function showNextPair(){
  locked=false;
  if(queue.length===0){
    if(phase==="round1"){
      phase="round2";
      queue=shuffle([...winners]);
      winners=[];
    }else{
      finalPool=shuffle([...winners]);
      showFinalChoice();
      return;
    }
  }
  const a=queue.shift();
  const b=queue.shift();
  renderPair(a,b);
}
function renderPair(a,b){
  $("#duel").classList.remove("hidden");
  $("#final").classList.add("hidden");
  $("#results").classList.add("hidden");
  const step=comparison+1;
  $("#stage").textContent=`Choice ${step} of 18`;
  $("#count").textContent=phase==="round1"?"First elimination round":"Final elimination round";
  $("#bar").style.width=`${Math.min(100,comparison/18*100)}%`;
  makeOption($("#a"),a,"Option A");
  makeOption($("#b"),b,"Option B");
}
function makeOption(el,id,label){
  const c=getCandidate(id);
  el.innerHTML=`<div class="eyebrow">${label}</div><h2>Listen, then choose</h2><audio controls src="${encodeURI(c.audio)}"></audio><button class="btn choose">I prefer ${label}</button>`;
  el.querySelector("button").addEventListener("click",()=>chooseWinner(id),{once:true});
}
function chooseWinner(id){
  if(locked)return;
  locked=true;
  document.querySelectorAll(".choose").forEach(b=>b.disabled=true);
  winners.push(id);
  comparison++;
  if(comparison>=15){
    finalPool=shuffle([...winners]);
    showFinalChoice();
    return;
  }
  setTimeout(showNextPair,100);
}
function showFinalChoice(){
  locked=false;
  $("#duel").classList.add("hidden");
  $("#final").classList.remove("hidden");
  const place=top3.length+1;
  $("#finalTitle").textContent=`Choice ${15+place} of 18: select place ${place}`;
  const available=finalPool.filter(id=>!top3.includes(id));
  $("#finalGrid").innerHTML=available.map(id=>{
    const c=getCandidate(id);
    return `<article class="final-card"><audio controls src="${encodeURI(c.audio)}"></audio><button class="btn finalPick" data-id="${id}">Choose this</button></article>`;
  }).join("");
  document.querySelectorAll(".finalPick").forEach(button=>{
    button.addEventListener("click",()=>choosePlace(button.dataset.id),{once:true});
  });
}
function choosePlace(id){
  if(locked)return;
  locked=true;
  document.querySelectorAll(".finalPick").forEach(b=>b.disabled=true);
  top3.push(id);
  if(top3.length===3){
    showResults();
  }else{
    setTimeout(showFinalChoice,100);
  }
}
function details(c){
  return `<p class="details"><b>Phrase:</b> ${c.phraseMethod}<br>${c.phrase}<br><b>Reference:</b> ${c.reference}, ${c.referenceDuration}<br><b>Settings:</b> ${c.model}, ${c.language}, speed ${c.speed}, seed ${c.seed}, text frontend ${c.textFrontend}</p>`;
}
function showResults(){
  phase="done";
  $("#duel").classList.add("hidden");
  $("#final").classList.add("hidden");
  $("#results").classList.remove("hidden");
  $("#podium").innerHTML=top3.map((id,i)=>{
    const c=getCandidate(id);
    return `<article class="place"><div class="eyebrow">${["WINNER","SECOND","THIRD"][i]}</div><h2>${id}</h2><audio controls src="${encodeURI(c.audio)}"></audio>${details(c)}</article>`;
  }).join("");
}
$("#enter").onclick=()=>{
  if($("#pin").value.trim().toUpperCase()!==APP_CONFIG.pin){
    $("#error").textContent="Incorrect PIN";
    return;
  }
  begin();
};
$("#pin").onkeydown=e=>{if(e.key==="Enter")$("#enter").click();};
$("#restart").onclick=()=>location.reload();
$("#copy").onclick=async()=>{
  const text=top3.map((id,i)=>`${i+1}. ${id} - ${getCandidate(id).phraseMethod} - ${getCandidate(id).reference}`).join("\n");
  await navigator.clipboard.writeText(text);
  $("#copy").textContent="Copied";
};
fetch("candidates.json?v=3").then(r=>r.json()).then(data=>{
  C=data;
  $("#title").textContent=APP_CONFIG.title;
}).catch(()=>$("#error").textContent="Could not load candidate data.");
