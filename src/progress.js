/* =====================================================================
   PROGRESSION: score multipliers, XP + levels, quests, booster packs, table themes
   Cards are always dealt fairly. The variable rewards live in packs and bonuses,
   never in the deck, so the odds you learn here are the real odds.
   ===================================================================== */
const HAND_MULT=[0,1,2,3,4,5,7,10,15];
Object.assign(PALETTES,{
  felt:PALETTES.table,
  ocean:[[0.10,0.45,0.70],[0.03,0.10,0.22],[0.35,0.85,0.90]],
  sunset:[[0.92,0.45,0.30],[0.25,0.08,0.20],[1.0,0.78,0.40]],
  toxic:[[0.45,0.80,0.20],[0.06,0.16,0.06],[0.85,1.0,0.35]],
  royal:[[0.35,0.25,0.75],[0.08,0.05,0.20],[0.95,0.75,0.30]],
  midnight:[[0.18,0.22,0.40],[0.03,0.04,0.09],[0.55,0.65,0.95]],
  candy:[[0.95,0.50,0.75],[0.35,0.20,0.45],[0.55,0.90,0.95]]
});
const THEMES=[
  {id:'felt',name:'Green felt',rar:'common'},{id:'ocean',name:'Deep sea',rar:'rare'},{id:'sunset',name:'Sunset strip',rar:'rare'},
  {id:'midnight',name:'Midnight',rar:'rare'},{id:'toxic',name:'Toxic',rar:'epic'},{id:'royal',name:'Royal velvet',rar:'epic'},{id:'candy',name:'Candy floss',rar:'legendary'}
];
CARD_STYLES.push({id:'candy',name:'Candy',rar:'epic',req:'Found in booster packs'},{id:'circuit',name:'Circuit',rar:'legendary',req:'Found in booster packs'});
const PACK_STYLES=['candy','circuit'];
const QUEST_POOL=[
  {id:'win3',text:'Win 3 pots',goal:3,ev:'win'},
  {id:'twopair',text:'Win 2 pots with two pair or better',goal:2,ev:'bigwin'},
  {id:'best5',text:'Make 5 Best or Master moves',goal:5,ev:'best'},
  {id:'fold3',text:'Make 3 correct folds against a bet',goal:3,ev:'goodfold'},
  {id:'steal2',text:'Win 2 pots without a showdown',goal:2,ev:'steal'},
  {id:'play12',text:'Play 12 hands',goal:12,ev:'hand'},
  {id:'allin',text:'Win an all-in',goal:1,ev:'allinwin'},
  {id:'master',text:'Make a Master move',goal:1,ev:'master'},
  {id:'sharp',text:'Score 90+ accuracy on 3 hands',goal:3,ev:'sharp'},
  {id:'bigpot',text:'Win a pot of 25 big blinds or more',goal:1,ev:'bigpot'}
];
const P=()=>SAVE.prog;
const xpNeed=lv=>400+lv*200;
function ensureQuests(){
  const q=P().quests;
  while(q.length<3){const pool=QUEST_POOL.filter(x=>!q.some(y=>y.id===x.id));const n=pick(pool);q.push({id:n.id,prog:0});}
}
const questDef=id=>QUEST_POOL.find(q=>q.id===id);

/* ---------- top bar level chip + packs button ---------- */
function renderLevelChips(){
  const p=P();const f=clamp(p.xp/xpNeed(p.level),0,1)*100;
  $$('.lvlchip').forEach(el=>{el.innerHTML=`Lv ${p.level}<i><b style="width:${f}%"></b></i>`;});
  $$('.packbtn').forEach(b=>{b.hidden=!p.packs;b.textContent=`Open pack${p.packs>1?` ×${p.packs}`:''}`;});
}
function themePalette(){return P().theme||'felt';}

/* ---------- after every hand ---------- */
async function afterHand(info){
  const p=P();const mine=info.mine;
  const cnt=k=>mine.filter(d=>d.cls===k).length;
  // XP for decisions, win or lose
  let xp=cnt('master')*60+cnt('best')*25+cnt('excellent')*15+cnt('good')*6;
  // score multiplier for winning hands
  if(info.won>0){
    const bon=[];
    if(info.cat!=null&&HAND_MULT[info.cat]) bon.push([handTitle(info.score),'+',HAND_MULT[info.cat]]);
    if(info.cat==null) bon.push(['Took it down','+',1]);
    if(cnt('master')) bon.push([`Master move${cnt('master')>1?' ×'+cnt('master'):''}`,'+',3*cnt('master')]);
    if(cnt('best')) bon.push([`Best move${cnt('best')>1?' ×'+cnt('best'):''}`,'+',cnt('best')]);
    if(G.streak>=2) bon.push([`${G.streak} win streak`,'×',+(1+.25*(G.streak-1)).toFixed(2)]);
    if(p.charm>0){bon.push(['Lucky charm','×',2]);p.charm--;}
    if(info.won>=G.bb*25) bon.push(['Big pot','×',1.5]);
    const score=await scoreModal(info.won,bon,info.cat==null?'Everyone folded':handTitle(info.score),info.cat==null?'':handDetail(info.score),info.beat);
    xp+=Math.min(150,Math.round(score/40));p.totalScore=(p.totalScore||0)+score;
  }else if(info.nearMiss){
    popAt($('#heroCards'),info.nearMiss,'var(--violet)');xp+=20;
  }
  // quests
  const ev={win:info.won>0?1:0,bigwin:info.won>0&&info.cat>=2?1:0,best:cnt('best')+cnt('master'),
    goodfold:mine.filter(d=>d.act==='fold'&&d.toCall>0&&['best','excellent','master'].includes(d.cls)).length,
    steal:info.won>0&&info.cat==null?1:0,hand:1,allinwin:info.allinWin?1:0,master:cnt('master'),
    sharp:info.handAcc!=null&&mine.length>=2&&info.handAcc>=90?1:0,bigpot:info.won>=G.bb*25?1:0};
  ensureQuests();
  let packs=0;
  for(const q of p.quests){const d=questDef(q.id);const before=q.prog;q.prog=Math.min(d.goal,q.prog+(ev[d.ev]||0));
    if(q.prog>=d.goal&&before<d.goal){q.done=true;packs++;xp+=150;toast(`Quest complete: ${d.text}`);sfx.unlock();}}
  p.quests=p.quests.filter(q=>!q.done);ensureQuests();
  // random pack drop with a pity timer
  const chance=.06+.04*(cnt('best')+cnt('master'))+(info.won>=G.bb*20?.1:0);
  p.pity=(p.pity||0)+1;
  if(Math.random()<chance||p.pity>=12){packs++;p.pity=0;}
  // XP + level ups
  if(xp>0) gainXP(xp);
  if(packs){p.packs+=packs;packDropFx(packs);}
  persist();renderLevelChips();
}
function gainXP(xp){
  const p=P();p.xp+=xp;
  while(p.xp>=xpNeed(p.level)){p.xp-=xpNeed(p.level);p.level++;p.packs++;
    toast(`Level ${p.level}: booster pack earned`);}
  renderLevelChips();
}
function packDropFx(n){sfx.unlock();toast(n>1?`${n} booster packs earned. Open them in Collection`:'Booster pack earned. Open it in Collection');const b=$('#collectionBtn');if(b) b.innerHTML='Collection'+packBadge();}

/* ---------- chips × mult score burst (Balatro-style) ---------- */
function scoreBurst(chips,bon){
  return new Promise(res=>{
    const g=G;const el=document.createElement('div');el.className='scoreburst';
    const y=center($('#board')).y;el.style.top=y+'px';
    el.innerHTML=`<div class="sb-row"><div class="sb-chips"><small>Chips</small><b class="num">${chips.toLocaleString('en-US')}</b></div><div class="sb-x">×</div><div class="sb-mult"><small>Mult</small><b class="num" id="sbMult">1</b></div></div><div class="sb-tags"></div><div class="sb-total num"></div>`;
    fx.appendChild(el);
    const tags=el.querySelector('.sb-tags'),mEl=el.querySelector('#sbMult'),tot=el.querySelector('.sb-total');
    let mult=1,i=0;const step=S().fast?200:300;
    const next=()=>{
      if(g.dead){el.remove();res(0);return;}
      if(i<bon.length){
        const [name,op,v]=bon[i++];mult=op==='+'?mult+v:mult*v;mult=Math.round(mult*100)/100;
        const t=document.createElement('span');t.className='sb-tag'+(op==='×'?' xm':'');t.textContent=`${name} ${op}${v}`;tags.appendChild(t);
        mEl.textContent=mult;mEl.parentElement.classList.remove('bump');void mEl.offsetWidth;mEl.parentElement.classList.add('bump');
        tone(300+i*90,.08,'square',.05);if(op==='×') shake(.5+i*.15);
        if(mult>=8) el.classList.add('hot');
        setTimeout(next,step);
      }else{
        const score=Math.round(chips*mult);
        const t0=performance.now(),dur=500;
        const tick=now=>{const k=Math.min(1,(now-t0)/dur);tot.textContent=Math.round(score*(1-Math.pow(1-k,3))).toLocaleString('en-US');if(k<1) requestAnimationFrame(tick);};
        requestAnimationFrame(tick);tot.classList.add('in');
        if(score>=chips*6){sfx.bigwin();shake(2);flashSwirl('win',2400,4);const c=center(tot);burst(c.x,c.y,60,['#ef4f45','#f8b229','#fff','#1d9bf0'],1.3);}else sfx.win();
        setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();res(score);},300);},S().fast?650:950);
      }
    };
    setTimeout(next,220);
  });
}

/* ---------- booster pack opening ---------- */
function rollPack(){
  const p=P();const r=Math.random();
  const lockedStyles=PACK_STYLES.filter(id=>!SAVE.unlocked.includes(id));
  const lockedThemes=THEMES.filter(t=>!p.themes.includes(t.id));
  if(r<.12&&lockedStyles.length){const id=pick(lockedStyles);return {kind:'style',id,rar:styleById(id).rar,name:`${styleById(id).name} cards`};}
  if(r<.36&&lockedThemes.length){const t=pick(lockedThemes);return {kind:'theme',id:t.id,rar:t.rar,name:`${t.name} table`};}
  if(r<.6) return {kind:'charm',rar:'rare',name:'Lucky charm',sub:'Doubles the mult on your next winning hand'};
  const big=Math.random()<.12;const amt=big?500:Math.random()<.4?250:100+Math.round(Math.random()*5)*20;
  return {kind:'xp',amt,rar:big?'epic':amt>=250?'rare':'common',name:`${amt} XP`,sub:big?'Jackpot!':'Bonus experience'};
}
function openPack(){
  const p=P();if(!p.packs) return;
  audio();sfx.btn();
  openModal(`<h2>Booster pack</h2><div class="packwrap"><div class="pack" id="pack"><span class="px">Swirl</span><b class="px">PACK</b><span>Tap to open</span></div></div><p style="text-align:center;color:var(--muted)">${p.packs} pack${p.packs>1?'s':''} waiting</p>`);
  const pk=$('#pack');let opened=false;
  pk.onclick=()=>{
    if(opened) return;opened=true;pk.classList.add('rip');sfx.pack();
    setTimeout(()=>{
      p.packs--;const item=rollPack();const [rn,rc]=RARITY[item.rar];
      if(item.kind==='style') unlock(item.id);
      if(item.kind==='theme'){p.themes.push(item.id);}
      if(item.kind==='charm') p.charm=Math.min(3,(p.charm||0)+1);
      if(item.kind==='xp') gainXP(item.amt);
      persist();renderLevelChips();
      const c=center(pk);burst(c.x,c.y,item.rar==='common'?24:item.rar==='rare'?45:80,[rc.includes('legendary')?'#f8b229':'#fff','#9a6cf0','#f8b229','#1d9bf0'],1.2);
      sfx.unlock();if(item.rar!=='common'){shake(1.2);flashSwirl(item.rar==='legendary'||item.rar==='epic'?'win':'shop',2000,4);}
      const M=$('#modal');
      M.innerHTML=`<h2 style="color:${rc}">${rn}!</h2><div class="reveal" id="reveal"></div><p style="text-align:center;font-size:18px"><b>${item.name}</b></p>${item.sub?`<p style="text-align:center;color:var(--muted)">${item.sub}</p>`:''}
        <div class="btnrow">${item.kind==='style'?'<button class="btn b-violet" id="pkUse">Equip</button>':item.kind==='theme'?'<button class="btn b-violet" id="pkUse">Use table</button>':'<span></span>'}<button class="btn b-gold" id="pkNext">${p.packs?`Next pack (${p.packs})`:'Collect'}</button></div>`;
      const R=$('#reveal');R.style.setProperty('--rc',rc);
      if(item.kind==='style'){[51,46,41].forEach((cd,i)=>{const el=makeCard(cd,'up',item.id);el.dataset.fixed=1;el.style.setProperty('--w','64px');el.style.animation=`tokspin 1s ${i*.12}s cubic-bezier(.2,1.4,.4,1) both`;R.appendChild(el);});attachTilt(R);}
      else if(item.kind==='theme'){const pal=PALETTES[item.id];R.innerHTML=`<div class="swatch" style="background:radial-gradient(circle at 35% 35%,${rgb(pal[2])},${rgb(pal[0])} 45%,${rgb(pal[1])})"></div>`;}
      else if(item.kind==='charm'){R.appendChild(tokenEl('star','#f8b229',110));R.firstChild.classList.add('spin');}
      else R.innerHTML=`<div class="xpbig num">+${item.amt}</div>`;
      const use=$('#pkUse');if(use) use.onclick=()=>{if(item.kind==='style') applyCardStyle(item.id);else{p.theme=item.id;persist();if(G&&!G.dead&&!G.boss) baseSwirl(item.id);}use.textContent='Done';sfx.btn();};
      $('#pkNext').onclick=()=>{sfx.btn();if(p.packs) openPack();else closeModal();if(!$('#collection').hidden) renderCollection();};
      setTimeout(()=>sfx.sparkle(),150);
    },650);
  };
}
const rgb=c=>`rgb(${c.map(v=>Math.round(v*255)).join(',')})`;

/* ---------- home progress card ---------- */
function renderProgressCard(){
  ensureQuests();persist();
  const p=P();const f=clamp(p.xp/xpNeed(p.level),0,1)*100;
  const el=$('#progressCard');
  el.innerHTML=`<div class="pc-top"><span class="px pc-lv">Level ${p.level}</span><span class="pc-xp num">${p.xp} / ${xpNeed(p.level)} XP</span></div>
    <div class="xpbar"><b style="width:${f}%"></b></div>
    <div class="quests">${p.quests.map(q=>{const d=questDef(q.id);return `<div class="quest"><span>${d.text}</span><span class="num">${q.prog}/${d.goal}</span><i><b style="width:${q.prog/d.goal*100}%"></b></i></div>`;}).join('')}</div>
    <div class="pc-foot">${p.charm?`<span class="charm">${ICON_SVG.star} Lucky charm ×${p.charm}</span>`:'<span class="note">Quests and level-ups give booster packs.</span>'}<button class="btn b-violet packbtn" ${p.packs?'':'hidden'}></button></div>`;
  el.querySelector('.packbtn').onclick=openPack;
  renderLevelChips();
}
function renderThemes(){
  const T=$('#themeGrid');if(!T) return;T.innerHTML='';
  THEMES.forEach(t=>{const own=P().themes.includes(t.id);const pal=PALETTES[t.id];const [rn,rc]=RARITY[t.rar];
    const b=document.createElement('button');b.className='themetile'+(P().theme===t.id?' eq':'')+(own?'':' locked');
    b.innerHTML=`<span class="swatch sm" style="background:radial-gradient(circle at 35% 35%,${rgb(pal[2])},${rgb(pal[0])} 45%,${rgb(pal[1])})"></span><span class="tn">${t.name}</span><span class="rar" style="--rc:${rc}">${rn}</span><span class="req">${own?(P().theme===t.id?'In use':'Tap to use'):'Found in packs'}</span>`;
    b.onclick=()=>{sfx.btn();if(!own){setSwirl(t.id,2);setTimeout(()=>setSwirl(BASE_SWIRL),1600);toast('Preview: find this table in booster packs');return;}P().theme=t.id;persist();setSwirl(t.id,3);setTimeout(()=>setSwirl(BASE_SWIRL),1600);renderThemes();};
    T.appendChild(b);});
}

addEventListener('unhandledrejection',e=>{if(e.reason==='abort') e.preventDefault();});

/* ---------- chips × mult as a clear modal ---------- */
function scoreModal(chips,bon,title,sub,beat){
  return new Promise(res=>{
    const g=G;const M=document.createElement('div');M.id='scoreModal';
    M.innerHTML=`<div class="panel scorecard"><div class="sc-title">${title}</div>${sub?`<div class="sc-hand">${sub}</div>`:''}${beat&&beat.length?`<div class="sc-beat">Beat ${beat.join(' · ')}</div>`:''}
      <div class="sc-lines"></div>
      <div class="sc-eq"><span class="sc-box c">${chips.toLocaleString('en-US')}</span><span>×</span><span class="sc-box m" id="scM">1</span></div>
      <div class="sc-total"></div><div class="sc-tap">Tap to continue</div></div>`;
    document.body.appendChild(M);
    const L=M.querySelector('.sc-lines'),mEl=M.querySelector('#scM'),tot=M.querySelector('.sc-total');
    let mult=1,i=0,done=false,score=0,timer=null;
    const finish=()=>{if(done) return;done=true;clearTimeout(timer);M.remove();res(score);};
    M.onclick=()=>{if(i>bon.length) finish();};
    const step=S().fast?220:340;
    const next=()=>{
      if(g.dead){finish();return;}
      if(i<bon.length){
        const [name,op,v]=bon[i++];mult=op==='+'?mult+v:mult*v;mult=Math.round(mult*100)/100;
        L.insertAdjacentHTML('beforeend',`<div class="sc-line"><span>${name}</span><b class="${op==='×'?'x':''}">${op}${v} mult</b></div>`);
        mEl.textContent=mult;mEl.classList.remove('bump');void mEl.offsetWidth;mEl.classList.add('bump');tone(300+i*90,.08,'square',.05);
        timer=setTimeout(next,step);
      }else{
        i++;score=Math.round(chips*mult);
        const t0=performance.now(),dur=450;
        const tick=now=>{const k=Math.min(1,(now-t0)/dur);tot.textContent='+'+Math.round(score*(1-Math.pow(1-k,3))).toLocaleString('en-US')+' pts';if(k<1) requestAnimationFrame(tick);};
        requestAnimationFrame(tick);
        if(mult>=6){sfx.bigwin();flashSwirl('win',2400,4);const c=center(tot);burst(c.x,c.y,50,['#ef4f45','#f8b229','#fff','#1d9bf0'],1.2);}else sfx.win();
        timer=setTimeout(finish,S().fast?1300:1900);
      }
    };
    timer=setTimeout(next,250);
  });
}
