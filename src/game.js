/* =====================================================================
   BOTS
   ===================================================================== */
const STYLES={
  fish:  {label:'Fish',  color:'#1d9bf0',noise:.12,read:0,  valueRel:2.0, raiseRel:2.4, callFactor:.6, limpRel:.5, bluff:.03,passive:.35,slow:0,  foldy:.35},
  rock:  {label:'Rock',  color:'#6f7d92',noise:.05,read:.5, valueRel:1.6, raiseRel:1.9, callFactor:1.25,limpRel:1.25,bluff:.02,passive:.2,slow:0,  foldy:1.25},
  reg:   {label:'Reg',   color:'#2fae70',noise:.07,read:.5, valueRel:1.45,raiseRel:1.75,callFactor:1.0,limpRel:1.0, bluff:.07,passive:.1,slow:.05,foldy:1},
  shark: {label:'Shark', color:'#ef4f45',noise:.03,read:.8, valueRel:1.3, raiseRel:1.55,callFactor:.95,limpRel:1.05,bluff:.12,passive:.05,slow:.15,foldy:.9},
  maniac:{label:'Maniac',color:'#9a6cf0',noise:.1, read:.1, valueRel:1.0, raiseRel:1.2, callFactor:.8, limpRel:.6, bluff:.28,passive:0, slow:0,  foldy:.5}
};
const DIFFS=[
  {id:'easy',name:'Easy',sub:'Fish who call too much'},
  {id:'medium',name:'Medium',sub:'Solid regulars'},
  {id:'hard',name:'Hard',sub:'Sharks that read bets'},
  {id:'mixed',name:'Mixed',sub:'A different style per seat'}
];
const NAMES=[['Lou','#e2a020'],['Dee Dee','#d6457a'],['Big Mo','#3a8fd8'],['Vic','#4aa36c'],['Nina','#a361d6'],['Tex','#d8633a'],['Rizzo','#3fb3b0'],['Mags','#c0425a'],['Duke','#6f7fd8'],['Penny','#d0943a']];
const LEVELS=[[10,20],[15,30],[25,50],[50,100],[75,150],[100,200],[150,300],[200,400],[300,600],[500,1000]];

/* ---------- campaign ---------- */
const BOSSES={
  bigfish:{name:'The Big Fish',icon:'fish',color:'#1d9bf0',style:'fish',chips:1500,mods:{callFactor:.32,bluff:.01,passive:.55,raiseRel:2.6,foldy:.2},
    rule:'Calls almost anything. Bet your good hands for value and never bluff.',short:'Calls everything',
    lines:{intro:'Blub. I never fold, you know.',win:'Told you I\'d hit something!',hurt:'Hey! I was gonna win that one.',defeat:'Blub… you got me.'}},
  wall:{name:'The Wall',icon:'wall',color:'#7d8899',style:'rock',chips:1500,mods:{read:.9,bluff:0,valueRel:1.75,raiseRel:2.1,callFactor:1.35,limpRel:1.3,foldy:1.4},
    rule:'Only bets strong hands. When The Wall raises, believe it and fold your middling hands.',short:'Only bets the goods',
    lines:{intro:'I can wait all night.',win:'Patience pays.',hurt:'A crack in the wall.',defeat:'The wall comes down.'}},
  gambler:{name:'The Gambler',icon:'dice',color:'#9a6cf0',style:'maniac',chips:1200,mods:{bluff:.34},ante:true,
    rule:'Raises constantly. Every hand also costs everyone an ante, so pots start bigger.',short:'Antes every hand',
    lines:{intro:'Let\'s make this interesting.',win:'Fortune favors the bold!',hurt:'Lady Luck, where\'d you go?',defeat:'Cashing out. You earned it.'}},
  shroud:{name:'The Shroud',icon:'eye',color:'#2f8f7a',style:'reg',chips:1500,mods:{noise:.05,read:.6},noLabel:true,noHud:true,
    rule:'Your hand name and odds meter are hidden. Read the board yourself.',short:'No hand names or odds',
    lines:{intro:'Can you see without your little helpers?',win:'Blind as a bat.',hurt:'You saw that coming?',defeat:'Your eyes are open now.'}},
  clock:{name:'The Clock',icon:'clock',color:'#d89a1c',style:'shark',chips:1200,blindsEvery:3,
    rule:'Blinds go up every 3 hands. Waiting for perfect cards will cost you.',short:'Blinds up every 3 hands',
    lines:{intro:'Tick. Tock.',win:'Time is on my side.',hurt:'Out of time? Not yet.',defeat:'Time\'s up… for me.'}},
  fog:{name:'The Fog',icon:'cloud',color:'#5f6fcf',style:'shark',chips:1500,fog:true,
    rule:'Your second hole card stays face down until the flop.',short:'One card hidden preflop',
    lines:{intro:'What you can\'t see can hurt you.',win:'Lost in the fog.',hurt:'The mist is thinning…',defeat:'Clear skies. Well played.'}},
  mirror:{name:'The Mirror',icon:'mirror',color:'#1fa597',style:'shark',chips:1500,mods:{mirror:true,noise:.06},
    rule:'Often knows how strong your hand is. Don\'t pay off big bets with weak hands.',short:'Reads your hand',
    lines:{intro:'I see exactly what you see.',win:'Saw that one coming.',hurt:'Cracked reflection.',defeat:'You\'ve outgrown your reflection.'}},
  house:{name:'The House',icon:'crown',color:'#d63a30',style:'shark',chips:2500,blindsEvery:5,mods:{noise:.02,read:.85},
    rule:'Starts with 2,500 chips and plays near-perfect poker. Blinds go up every 5 hands.',short:'Big stack, fast blinds',
    lines:{intro:'The House always wins.',win:'The House thanks you.',hurt:'An unusual night.',defeat:'Tonight… the House loses.'}}
};
const ANTES=[
  {name:'Rookie Room',small:['fish'],big:['fish','fish'],boss:'bigfish',reward:'glass'},
  {name:'Corner Bar',small:['fish','rock'],big:['rock','reg'],boss:'wall',reward:'frost'},
  {name:'Riverboat',small:['reg'],big:['reg','maniac'],boss:'gambler',reward:'foil'},
  {name:'Back Alley',small:['reg','reg'],big:['reg','shark'],boss:'shroud',reward:'lava'},
  {name:'High Rollers',small:['shark'],big:['shark','maniac'],boss:'clock',reward:'holo'},
  {name:'Penthouse',small:['shark','reg'],big:['shark','shark'],boss:'fog',reward:'duelist'},
  {name:'Underground',small:['shark','maniac','reg'],big:['shark','shark','rock'],boss:'mirror',reward:'gold'},
  {name:'The Vault',small:['shark','shark'],big:['shark','shark','maniac'],boss:'house',reward:'mythic'}
];
const matchIndex=(a,s)=>a*3+s;
const isBeaten=(a,s)=>SAVE.campaign.beaten.includes(`${a}-${s}`);
const isAvail=(a,s)=>matchIndex(a,s)===0||isBeaten(a,s)||(s>0?isBeaten(a,s-1):isBeaten(a-1,2));
function nextCampaignMatch(){for(let a=0;a<ANTES.length;a++)for(let s=0;s<3;s++) if(!isBeaten(a,s)) return [a,s];return null;}
function campaignConfig(a,s){
  const A=ANTES[a];
  if(s<2) return {mode:'campaign',a,s,title:`Ante ${a+1}: ${s?'Big':'Small'} Blind`,opps:A[s?'big':'small'].map(st=>({style:st})),blindsEvery:8,rule:{noHud:true}};
  const B=BOSSES[A.boss];
  return {mode:'campaign',a,s,title:`Ante ${a+1}: ${B.name}`,boss:B,opps:[{style:B.style,boss:B,chips:B.chips,mods:B.mods}],
    blindsEvery:B.blindsEvery||8,rule:{ante:!!B.ante,noLabel:!!B.noLabel,noHud:true,fog:!!B.fog}};
}
function quickConfig(){
  const n=S().opp,d=S().diff;const pool=['fish','rock','reg','shark','maniac'].sort(()=>Math.random()-.5);
  const opps=[];for(let i=0;i<n;i++) opps.push({style:d==='easy'?'fish':d==='medium'?'reg':d==='hard'?'shark':pool[i%5]});
  return {mode:'quick',title:'Quick play',opps,blindsEvery:10,rule:{}};
}

/* ---------- bot thoughts ---------- */
const VOICE={
  base:{
    value:['{H} is strong here. I think I win about {E} of the time, so I\'ll bet and get paid.','I like {H}. Time to build the pot.'],
    reraise:['They raised, but {H} beats most of what they could have. Re-raise!'],
    slow:['{H} is a monster. I\'ll check and let them bet into me.'],
    bluff:['{H} won\'t win a showdown. A bet might make them fold.','Nobody looks strong. I\'ll take a stab at this pot.'],
    semi:['I\'m drawing with {O} outs. If I bet, I can win now or hit later.'],
    open:['{H} is a good starting hand. Raising.'],
    limp:['{H} isn\'t great, but it\'s cheap to see a flop.'],
    call:['They want {C}. I need {R} to break even and I think I have about {E}. Worth a call.'],
    fold:['That bet is too big for {H}. I need {R} and only have about {E}. Folding.','Their bet looks strong. {H} can\'t take the heat.'],
    foldPre:['{H} isn\'t worth playing here. Fold.'],
    check:['{H} isn\'t strong enough to bet. Check.','Nothing worth betting. I\'ll check.'],
    shove:['My stack is getting short. {H} is good enough. All in!']
  },
  fish:{
    value:['Ooh, {H}! I love it. Raise!'],call:['I can\'t fold now, something good might come! Call.','Call! You never know.'],
    fold:['Ugh, too expensive. Fine, I fold.'],check:['Check! Free cards please.'],limp:['Any two cards can win! I\'ll call.'],
    bluff:['I\'ll bet. Maybe they\'ll get scared.'],foldPre:['These cards are ugly. Fold.']
  },
  maniac:{
    value:['{H}! Let\'s gamble. Raise!'],bluff:['Doesn\'t matter what I have. Pressure! Bet!','Let\'s see if they\'ve got the guts.'],
    call:['I\'m not going anywhere. Call!'],fold:['Fine, take it. I\'ll get you next time.'],open:['Raise! Always raise!']
  },
  rock:{
    fold:['Not good enough. I only play strong hands. Fold.'],foldPre:['Too risky. Fold.'],value:['Finally, {H}. Raise.'],
    check:['Check. I\'ll wait for a real hand.']
  }
};
function thought(kind,p,ctx){
  const v=(VOICE[p.style]&&VOICE[p.style][kind])||VOICE.base[kind]||['…'];
  const H=G.board.length?shortName(evalHand(p.hand.concat(G.board))).toLowerCase():preflopName(p.hand);
  let t=pick(v).replace(/\{H\}/g,H).replace(/\{E\}/g,pct(ctx.eq)).replace(/\{R\}/g,pct(ctx.req)).replace(/\{C\}/g,money(ctx.toCall)).replace(/\{O\}/g,ctx.outs);
  t=t.charAt(0).toUpperCase()+t.slice(1);
  if(p.params.mirror&&ctx.mirrored) t='I can see right through you. '+t;
  return t;
}

function botDecide(p,d){
  const st=p.params;const opps=d.nOpp,toCall=d.toCall,pot=d.pot;
  let eq=d.eq,mirrored=false;
  if(st.mirror&&!G.human.folded&&Math.random()<.65){eq=equityKnown([p.hand,G.human.hand],G.board,300)[0];mirrored=true;}
  if(toCall>0&&st.read&&!(G.street===0&&G.currentBet<=G.bb)){const ratio=toCall/Math.max(G.bb,pot-toCall);eq*=1-st.read*Math.min(1.2,ratio)*.3;}
  eq=clamp(eq+(Math.random()*2-1)*st.noise,0,1);
  const rel=eq*(opps+1),req=d.req;
  const canRaise=d.canRaise&&G.raises<4;
  const late=G.street>0,maxTo=d.maxTo;
  const sizeTo=f=>{let to=G.currentBet+Math.max(G.minRaise,Math.round((pot+toCall)*f/5)*5);if(to>p.bet+p.chips*.65) to=maxTo;return Math.min(to,maxTo);};
  const size=()=>[.5,.66,.75,1][Math.floor(Math.random()*4)];
  const short=p.chips<=G.bb*10;
  const ctx={eq,req,toCall,outs:d.outs,mirrored};
  const R=(a,to,kind)=>({a,to,thought:thought(kind,p,ctx)});
  if(toCall===0){
    if(canRaise&&rel>st.valueRel){if(late&&G.street<3&&Math.random()<st.slow) return R('check',0,'slow');return R('raise',sizeTo(rel>2.4?.9:size()),'value');}
    if(canRaise&&late&&Math.random()<st.bluff) return R('raise',sizeTo(rnd(.45,.7)),'bluff');
    if(canRaise&&late&&G.street<3&&p.style==='shark'&&d.outs>=8&&Math.random()<.4) return R('raise',sizeTo(.6),'semi');
    if(canRaise&&!late&&rel>st.limpRel*1.4&&Math.random()>st.passive) return R('raise',Math.min(G.currentBet+G.bb*2,maxTo),'open');
    return R('check',0,'check');
  }
  if(G.street===0&&short&&canRaise&&rel>1.3&&p.style!=='fish') return R('raise',maxTo,'shove');
  if(canRaise&&rel>st.raiseRel&&Math.random()>st.passive){
    const kind=G.raises>0?'reraise':'value';
    if(G.street===0){const to=Math.round(G.currentBet*(G.currentBet<=G.bb?3:2.6)/5)*5;return R('raise',to>p.bet+p.chips*.6?maxTo:Math.min(to,maxTo),G.currentBet<=G.bb?'open':kind);}
    return R('raise',sizeTo(size()),kind);
  }
  if(G.street===0&&G.currentBet===G.bb&&canRaise&&rel>st.limpRel*1.35&&Math.random()>st.passive+.15) return R('raise',Math.min(G.bb*3,maxTo),'open');
  if(eq>=req*st.callFactor) return R('call',0,'call');
  if(G.street===0&&G.currentBet===G.bb&&rel>st.limpRel) return R('call',0,'limp');
  if(canRaise&&late&&Math.random()<st.bluff*.35) return R('raise',sizeTo(.75),'bluff');
  return R('fold',0,G.street===0?'foldPre':'fold');
}

/* =====================================================================
   DECISION ANALYSIS (expected value, move classes, accuracy)
   ===================================================================== */
const CLS={
  master:{n:'Master move',sym:'!!',c:'var(--c-master)'},best:{n:'Best',sym:'★',c:'var(--c-best)'},
  excellent:{n:'Excellent',sym:'!',c:'var(--c-excellent)'},good:{n:'Good',sym:'✓',c:'var(--c-good)'},
  inacc:{n:'Inaccuracy',sym:'?!',c:'var(--c-inacc)'},mistake:{n:'Mistake',sym:'?',c:'var(--c-mistake)'},blunder:{n:'Blunder',sym:'??',c:'var(--c-blunder)'}
};
const CLS_ORDER=['master','best','excellent','good','inacc','mistake','blunder'];
const accColor=a=>a>=90?'var(--c-master)':a>=80?'var(--c-best)':a>=65?'var(--c-inacc)':a>=50?'var(--c-mistake)':'var(--c-blunder)';

function makeDecision(p){
  const toCall=Math.min(G.currentBet-p.bet,p.chips);const pot=potTotal();
  const opps=G.players.filter(o=>o!==p&&!o.folded&&!o.out);
  const fogged=p.human&&G.rule.fog&&G.street===0;
  const d={pid:p.id,human:!!p.human,street:G.street,board:G.board.slice(),hole:fogged?[p.hand[0]]:p.hand.slice(),fogged,
    toCall,pot,nOpp:opps.length,oppIds:opps.map(o=>o.id),foldy:opps.map(o=>o.human?1:o.params.foldy),
    canRaise:p.chips>toCall&&opps.some(o=>!o.allIn),myBet:p.bet,currentBet:G.currentBet,chips:p.chips,
    minTo:Math.min(G.currentBet+G.minRaise,p.bet+p.chips),maxTo:p.bet+p.chips,bb:G.bb,act:null,amount:0,
    unopened:G.street===0&&G.currentBet<=G.bb,oppAvail:Math.max(0,...opps.map(o=>o.chips+o.bet-G.currentBet))};
  return d;
}
function measure(d,iters){
  d.eq=equityRandom(d.hole,d.board,Math.max(1,d.nOpp),iters);
  d.req=d.toCall>0?d.toCall/(d.pot+d.toCall):0;
  d.eqA=d.eq;
  if(d.toCall>0&&!d.unopened){const ratio=d.toCall/Math.max(d.bb,d.pot-d.toCall);d.eqA=d.eq*(1-.28*Math.min(1,ratio));}
  const o=countOuts(d.hole,d.board);d.outs=o.n;d.outKinds=o.kinds;
}
/* Bigger bets fold out more hands, but the hands that DO call are stronger.
   Your equity against that narrower calling range is roughly eq^(1/callRate).
   Only the chips an opponent can actually match count (effective stack). */
function raiseEV(d,to){
  const P=d.pot,C=d.toCall;
  const X=Math.min(to-d.currentBet,Math.max(0,d.oppAvail==null?Infinity:d.oppAvail));
  const A=(d.currentBet-d.myBet)+X;
  const ratio=X/Math.max(1,P+C);
  let f1=clamp(.15+.35*ratio,.05,.85);if(C>0&&!d.unopened) f1*=.8;if(d.street===0) f1*=.85;
  /* even loose players rarely call bets much bigger than the pot */
  const cap=1/(1+.8*ratio);
  const f=d.foldy.reduce((acc,fy)=>acc*(1-Math.min(1-clamp(f1*fy,0,.92),cap)),1);
  const q=Math.max(.06,1-f);
  const eqC=Math.pow(d.eqA,1/q);
  return f*P+(1-f)*(eqC*(P+A+X)-A);
}
function evOptions(d){
  const o=[];
  if(d.toCall>0){o.push({k:'fold',label:'Fold',ev:0});o.push({k:'call',label:d.toCall>=d.chips?`Call all in ${money(d.toCall)}`:`Call ${money(d.toCall)}`,ev:d.eqA*(d.pot+d.toCall)-d.toCall});}
  else o.push({k:'check',label:'Check',ev:d.eqA*d.pot*.92});
  if(d.canRaise){
    const seen=new Set();const word=d.currentBet===0?'Bet':'Raise to';
    for(const [lab,f] of [['½ pot',.5],['pot',1],['all in',null]]){
      let to=f==null?d.maxTo:Math.round(d.currentBet+f*(d.pot+d.toCall));to=clamp(to,d.minTo,d.maxTo);
      if(seen.has(to)) continue;seen.add(to);
      o.push({k:'raise',to,label:to>=d.maxTo?`All in ${money(to)}`:`${word} ${money(to)} (${lab})`,ev:raiseEV(d,to)});
    }
  }
  return o;
}
function classify(d){
  const opts=evOptions(d);
  let chosenEV;
  if(d.act==='fold') chosenEV=0;
  else if(d.act==='check') chosenEV=d.eqA*d.pot*.92;
  else if(d.act==='call') chosenEV=d.toCall>0?d.eqA*(d.pot+d.toCall)-d.toCall:d.eqA*d.pot*.92;
  else chosenEV=raiseEV(d,d.amount);
  const best=opts.reduce((a,b)=>b.ev>a.ev?b:a,opts[0]);
  const bestEV=Math.max(best.ev,chosenEV);
  /* measure a loss against the chips this decision put at stake, not the whole pot */
  const stake=d.act==='call'?d.toCall:(d.act==='raise'||d.act==='allin')?d.amount-d.myBet:(d.toCall||d.pot*.5);
  const unit=Math.max(d.bb*2,stake);const loss=Math.max(0,bestEV-chosenEV);const lf=loss/unit;
  let cls=lf<.02?'best':lf<.06?'excellent':lf<.13?'good':lf<.25?'inacc':lf<.5?'mistake':'blunder';
  if(loss<d.bb*.5&&['inacc','mistake','blunder'].includes(cls)) cls='good';
  if(cls==='best'){
    const isRaise=d.act==='raise'||d.act==='allin';
    const passive=opts.filter(o=>o.k!=='raise').reduce((a,b)=>Math.max(a,b.ev),-1e9);
    if(isRaise&&d.eqA<.45&&chosenEV-passive>.1*unit) cls='master';
    if(d.act==='call'&&d.toCall>=.4*(d.pot-d.toCall)&&d.eqA<.5&&chosenEV>.02*unit&&chosenEV<.25*unit) cls='master';
  }
  d.opts=opts;d.chosenEV=chosenEV;d.best=best;d.loss=loss;d.cls=cls;
  d.acc=cls==='master'||cls==='best'?100:clamp(100*Math.exp(-2.4*lf),0,100);
  return d;
}
function actText(d){
  return {fold:'folded',check:'checked',call:`called ${money(d.toCall)}`,raise:`${d.currentBet?'raised to':'bet'} ${money(d.amount)}`,allin:`went all in for ${money(d.amount)}`}[d.act];
}
function explain(d){
  const out=[];
  const who=d.nOpp>1?`${d.nOpp} opponents`:'one opponent';
  out.push(`Your odds: you'd win about <b>${freq(d.eqA)}</b> (${pct(d.eqA)}) against ${who}${d.fogged?', counting your hidden card as unknown':''}.`);
  if(d.eqA<d.eq-.025) out.push(`Against completely random cards it would be ${pct(d.eq)}, but a bet this size usually means a decent hand, so it's lower.`);
  if(d.toCall>0) out.push(`Calling costs ${money(d.toCall)} to win ${money(d.pot)}, so you break even if you win <b>${freq(d.req)}</b> (${pct(d.req)}). ${d.eqA>=d.req?'Your odds beat that.':'Your odds fall short of that.'}`);
  if(d.outs) out.push(`${d.outs} outs (${d.outKinds.join(', ')}) give you ${pct(hitChance(d.outs,d.board.length))} to improve by the river.`);
  if(d.cls==='master') out.push(d.act==='call'?`<b>Brave, correct call.</b> Most players fold here, but the price was right.`:`<b>Great pressure.</b> Your hand alone wasn't enough, but betting makes them fold often enough to profit.`);
  else if(d.cls==='best') out.push('This was the best option.');
  else if(d.loss>=.5) out.push(`Better: <b>${d.best.label}</b>. It earns about ${money(d.loss)} more on average every time you're in this spot.`);
  else out.push(`Better: <b>${d.best.label}</b>, though the difference is small.`);
  return out;
}

/* =====================================================================
   GAME STATE + ENGINE
   ===================================================================== */
let G=null;
const sleep=ms=>{const g=G;return new Promise((res,rej)=>setTimeout(()=>(g&&g.dead)?rej('abort'):res(),ms*(g&&S().fast?.55:1)));};
const potTotal=()=>G.players.reduce((a,p)=>a+p.total,0);
const inHand=()=>G.players.filter(p=>!p.out&&!p.folded);
const canActList=()=>G.players.filter(p=>!p.out&&!p.folded&&!p.allIn);

function verbify(label,human){
  if(human) return label.toLowerCase();
  const map=[['Call all in','calls all in'],['All in','goes all in for'],['Raise to','raises to'],['Bet','bets'],['Call','calls'],['Check','checks'],['Fold','folds']];
  for(const [a,b] of map) if(label.startsWith(a)) return (b+label.slice(a.length)).replace('for ','for ').trim();
  return label.toLowerCase();
}
function flyCard(fromEl,slot,cardEl){
  const g=G;
  return new Promise((res,rej)=>{
    if(!slot||g.dead){rej('abort');return;}
    const a=fromEl.getBoundingClientRect(),b=slot.getBoundingClientRect();
    const f=makeCard(null,'flycard');f.style.setProperty('--w',b.width+'px');f.style.width=b.width+'px';f.style.height=b.height+'px';fx.appendChild(f);
    const sx=a.left+a.width/2-(b.left+b.width/2),sy=a.top+a.height/2-(b.top+b.height/2),sc=a.width/b.width;
    const anim=f.animate([{transform:`translate(${b.left+sx}px,${b.top+sy}px) scale(${sc}) rotate(-25deg)`},
      {transform:`translate(${b.left}px,${b.top}px) scale(1.12) rotate(6deg)`,offset:.8},{transform:`translate(${b.left}px,${b.top}px) scale(1) rotate(0deg)`}],
      {duration:S().fast?240:380,easing:'cubic-bezier(.2,.8,.3,1)'});
    sfx.deal();anim.onfinish=()=>{f.remove();cardEl.classList.remove('ghost');g.dead?rej('abort'):res();};
  });
}
function flyChips(fromEl,toEl,n=5){
  const a=center(fromEl),b=center(toEl);const dur=S().fast?280:460;
  for(let i=0;i<n;i++){
    const c=document.createElement('div');c.className='chipfly';fx.appendChild(c);const jx=rnd(-10,10),jy=rnd(-8,8);
    const an=c.animate([{transform:`translate(${a.x-7+jx}px,${a.y-7+jy}px) scale(.6)`},{transform:`translate(${(a.x+b.x)/2-7}px,${Math.min(a.y,b.y)-50}px) scale(1.15)`,offset:.5},{transform:`translate(${b.x-7}px,${b.y-7}px) scale(.7)`}],
      {duration:dur,delay:i*45,easing:'cubic-bezier(.4,0,.2,1)',fill:'backwards'});
    an.onfinish=()=>{c.remove();if(i===n-1) sfx.chip();};
  }
  return sleep(dur+n*45);
}

function nextIdx(i,pred=p=>!p.out){const n=G.players.length;for(let k=1;k<=n;k++){const j=(i+k)%n;if(pred(G.players[j])) return j;}return i;}

function startMatch(cfg){
  if(G){G.dead=true;if(G.pending) try{G.pending.reject('abort');}catch(e){}}
  const names=NAMES.slice().sort(()=>Math.random()-.5);
  const players=[{id:0,name:'You',human:true,chips:1000,color:'#f8b229'}];
  cfg.opps.forEach((o,i)=>{
    const params={...STYLES[o.style],...(o.mods||{})};
    players.push({id:i+1,name:o.boss?o.boss.name:names[i][0],color:o.boss?o.boss.color:names[i][1],human:false,chips:o.chips||1000,style:o.style,params,boss:o.boss||null});
  });
  players.forEach(p=>Object.assign(p,{hand:[],folded:false,allIn:false,bet:0,total:0,acted:false,out:false,matchStart:p.chips}));
  G={cfg,players,human:players[0],boss:players.find(p=>p.boss)||null,dealer:Math.floor(Math.random()*players.length),handNo:0,level:0,sb:10,bb:20,ante:0,
     board:[],deck:[],currentBet:0,minRaise:20,raises:0,street:0,dead:false,decisions:[],snaps:[],lastReview:null,pending:null,
     rule:cfg.rule||{},blindsEvery:cfg.blindsEvery||10,accSum:0,accN:0,streak:0};
  buildTable();show('game');
  if(G.boss){baseSwirl('boss',3);Music.setTheme('boss');bossIntro().then(()=>playLoop());}
  else{baseSwirl(themePalette(),3);Music.setTheme('table');playLoop();}
}
function bossIntro(){
  return new Promise(res=>{
    const B=G.boss.boss;sfx.boss();shake(1.5);
    const el=document.createElement('div');el.id='bossIntro';
    el.appendChild(tokenEl(B.icon,B.color));el.firstChild.classList.add('spin');
    el.insertAdjacentHTML('beforeend',`<div class="bname">${B.name}</div><div class="btaunt">“${B.lines.intro}”</div><div class="brule"><b>Boss rule:</b> ${B.rule}</div><button class="btn b-red">Take a seat</button>`);
    document.body.appendChild(el);
    el.querySelector('button').onclick=()=>{audio();sfx.raise();el.remove();res();};
  });
}

async function playLoop(){
  try{
    while(true){
      const alive=G.players.filter(p=>p.chips>0);
      if(G.human.chips<=0){await sleep(700);endMatch(false);return;}
      if(alive.length===1){await sleep(700);endMatch(true);return;}
      await playHand();
      checkAchievements();
      await waitNext();
    }
  }catch(e){if(e!=='abort') console.error(e);}
}

function snap(text,o={}){
  G.snaps.push({text,board:G.board.slice(),pot:potTotal(),street:G.street,
    ps:G.players.map(p=>({chips:p.chips,bet:p.bet,folded:p.folded,allIn:p.allIn,out:p.out})),
    actor:o.actor??null,thought:o.thought||null,dec:o.dec||null,kind:o.kind||'info'});
}

async function playHand(){
  G.handNo++;
  const lvl=Math.min(Math.floor((G.handNo-1)/G.blindsEvery),LEVELS.length-1);
  const ps=G.players;
  ps.forEach(p=>{p.out=p.chips<=0;Object.assign(p,{hand:[],folded:p.out,allIn:false,bet:0,total:0,acted:false,startChips:p.chips});});
  G.board=[];G.decisions=[];G.snaps=[];G.vpip=false;G.street=0;G.raises=0;G.lastReview=null;G.foldedAt={};
  G.deck=[...Array(52).keys()];for(let i=51;i>0;i--){const j=Math.floor(Math.random()*(i+1));[G.deck[i],G.deck[j]]=[G.deck[j],G.deck[i]];}
  G.dealer=nextIdx(G.dealer);
  resetTableVisuals();
  $('#handNo').textContent='Hand '+G.handNo;
  if(lvl!==G.level){G.level=lvl;[G.sb,G.bb]=LEVELS[lvl];updateBlinds();sfx.blinds();shake(1);await banner('Blinds up',[[`${G.sb} / ${G.bb}`,'var(--red)']],'var(--gold)',null,1200);}
  [G.sb,G.bb]=LEVELS[G.level];G.ante=G.rule.ante?Math.max(5,Math.round(G.bb/4/5)*5):0;updateBlinds();
  renderSeats();

  const live=ps.filter(p=>!p.out);
  if(G.ante) live.forEach(p=>{const a=Math.min(G.ante,p.chips);p.chips-=a;p.total+=a;if(p.chips===0)p.allIn=true;});
  let sbI,bbI;
  if(live.length===2){sbI=G.dealer;bbI=nextIdx(G.dealer);}else{sbI=nextIdx(G.dealer);bbI=nextIdx(sbI);}
  postBlind(ps[sbI],G.sb);postBlind(ps[bbI],G.bb);
  G.currentBet=Math.max(ps[sbI].bet,ps[bbI].bet,G.bb);G.minRaise=G.bb;
  renderSeats();tweenNum($('#potNum'),potTotal()-ps.reduce((a,p)=>a+p.bet,0));
  setStatus('Shuffle up and deal');

  for(let round=0;round<2;round++){
    let i=G.dealer;
    for(let k=0;k<live.length;k++){
      i=nextIdx(i);const p=ps[i];const c=G.deck.pop();p.hand.push(c);
      const slot=seatSlot(p,round);const el=makeCard(c,p.human?'ghost':'ghost sm');slot.appendChild(el);
      await flyCard($('#deck'),slot,el);await sleep(40);
    }
  }
  const heroEls=$$('#heroCards .card');
  for(let i=0;i<heroEls.length;i++){if(G.rule.fog&&i===1) continue;heroEls[i].classList.add('up');bobify(heroEls[i]);sfx.flip();await sleep(140);}
  updateHeroLabel();
  snap(`${ps[sbI].name} post${ps[sbI].human?'':'s'} the small blind (${money(G.sb)}), ${ps[bbI].name} post${ps[bbI].human?'':'s'} the big blind (${money(G.bb)})${G.ante?`, everyone antes ${money(G.ante)}`:''}. Cards are dealt.`);

  await bettingRound(nextIdx(bbI,p=>!p.out));
  let revealed=false;
  for(let st=1;st<=3;st++){
    if(inHand().length<=1) break;
    await collectBets();
    G.street=st;G.raises=0;G.currentBet=0;G.minRaise=G.bb;ps.forEach(p=>{p.acted=false;});
    const runout=canActList().length<=1;
    if(runout&&!revealed){revealed=true;await revealAllIn();}
    await dealBoard(st===1?3:1);
    if(st===1&&G.rule.fog&&!G.human.out){const el=$$('#heroCards .card')[1];if(el){el.classList.add('up');bobify(el);sfx.flip();}}
    updateHeroLabel();
    snap(`${STREETS[st]}: ${G.board.slice(st===1?0:G.board.length-1).map(cardTxt).join(' ')}`,{kind:'street'});
    if(runout){await showRunoutEquity();await sleep(900);continue;}
    await bettingRound(nextIdx(G.dealer,p=>!p.out&&!p.folded));
  }
  await collectBets();
  await resolveHand();
}
function postBlind(p,amt){const a=Math.min(amt,p.chips);p.chips-=a;p.bet+=a;p.total+=a;if(p.chips===0)p.allIn=true;}
function move(p,amt){amt=Math.max(0,Math.min(amt,p.chips));p.chips-=amt;p.bet+=amt;p.total+=amt;if(p.chips===0)p.allIn=true;}

async function bettingRound(startIdx){
  let idx=startIdx,guard=0;
  while(guard++<400){
    if(inHand().length<=1) return;
    const can=canActList();
    if(can.length===0) return;
    if(can.every(p=>p.acted&&p.bet===G.currentBet)) return;
    if(can.length===1&&can[0].bet>=G.currentBet) return;
    const p=G.players[idx];
    if(!p.out&&!p.folded&&!p.allIn&&(!p.acted||p.bet<G.currentBet)){
      const d=makeDecision(p);
      let act;
      if(p.human) act=await humanAction(p,d);
      else{measure(d,G.board.length?320:260);act=await botAction(p,d);}
      const res=applyAction(p,act);
      d.act=res.kind==='allin'?(res.act.a==='call'?'call':'allin'):res.kind;
      if(d.act==='allin'||d.act==='raise') d.amount=p.bet;
      G.decisions.push(d);
      snap(`${p.human?'You':p.name} ${verbify(res.label,p.human)}`,{actor:p.id,thought:act.thought,dec:d,kind:'act'});
      await showAction(p,res,act);
    }
    idx=nextIdx(idx);
  }
}
function applyAction(p,act){
  const toCall=G.currentBet-p.bet;let label='',col='var(--blue)',kind=act.a;
  if(act.a==='fold'){if(toCall<=0) act={...act,a:'check'};else{p.folded=true;G.foldedAt[p.id]=G.street;label='Fold';col='#5c6a80';kind='fold';}}
  if(act.a==='check'){if(toCall>0) act={...act,a:'call'};else{label='Check';kind='check';}}
  if(act.a==='raise'){
    let to=Math.max(act.to,G.currentBet+G.minRaise);to=Math.min(to,p.bet+p.chips);
    if(to<=G.currentBet) act={...act,a:'call'};
    else{
      const wasBet=G.currentBet===0;move(p,to-p.bet);const inc=to-G.currentBet;if(inc>=G.minRaise) G.minRaise=inc;
      G.currentBet=to;G.raises++;G.players.forEach(o=>{if(o!==p) o.acted=false;});
      label=p.allIn?`All in ${money(to)}`:`${wasBet?'Bet':'Raise to'} ${money(to)}`;col=p.allIn?'var(--red)':'var(--gold)';kind=p.allIn?'allin':'raise';
    }
  }
  if(act.a==='call'){const amt=Math.min(toCall,p.chips);move(p,amt);label=p.allIn?`Call all in ${money(amt)}`:`Call ${money(amt)}`;col=p.allIn?'var(--red)':'var(--green)';kind=p.allIn?'allin':'call';}
  p.acted=true;
  if(p.human&&G.street===0&&(act.a==='call'||act.a==='raise')) G.vpip=true;
  return {label,col,kind,act};
}
async function showAction(p,res,act){
  const anchor=p.human?$('#heroCards'):seatEl(p).querySelector('.seat-box');
  popAt(anchor,res.label,res.col);
  ({fold:sfx.fold,check:sfx.check,call:sfx.chip,raise:sfx.raise,allin:sfx.allin})[res.kind]?.();
  if(res.kind==='allin'){shake(1.6);flashSwirl('allin',1800,3);const c=center(anchor);burst(c.x,c.y,26,['#9a6cf0','#ef4f45','#fff']);}
  else if(res.kind==='raise') shake(.6);
  if(!p.human&&act.thought&&S().thoughts) bubbleAt(seatEl(p).querySelector('.seat-box'),act.thought,false,2400);
  renderSeats();
  await sleep(S().thoughts&&!p.human?900:480);
}
async function botAction(p,d){
  const el=seatEl(p);el.classList.add('turn');setStatus(`${p.name} is thinking…`);
  const th=el.querySelector('.thinking');th.hidden=false;
  await sleep(rnd(550,1150));
  const act=botDecide(p,d);
  th.hidden=true;el.classList.remove('turn');
  return act;
}
async function collectBets(){
  const bettors=G.players.filter(p=>p.bet>0);
  if(bettors.length) await Promise.all(bettors.map(p=>flyChips(p.human?$('#heroBet'):seatEl(p).querySelector('.betchip'),$('#pot'),Math.min(6,2+Math.ceil(p.bet/G.bb/2)))));
  G.players.forEach(p=>p.bet=0);renderSeats();tweenNum($('#potNum'),potTotal());
}
async function dealBoard(n){
  const slots=$$('#board .slot');G.deck.pop();
  for(let i=0;i<n;i++){const c=G.deck.pop();G.board.push(c);const slot=slots[G.board.length-1];const el=makeCard(c,'ghost');slot.appendChild(el);await flyCard($('#deck'),slot,el);}
  await sleep(80);
  const els=slots.slice(G.board.length-n,G.board.length).map(s=>s.querySelector('.card'));
  for(const el of els){el.classList.add('up','cardpop');bobify(el);setTimeout(()=>el.classList.remove('cardpop'),480);sfx.flip();await sleep(160);}
  setStatus(STREETS[G.street]);
}
async function revealAllIn(){
  setStatus('All in. Running it out');
  for(const p of inHand()) if(!p.human) flipSeatCards(p);
  if(G.rule.fog){const el=$$('#heroCards .card')[1];if(el) el.classList.add('up');}
  sfx.flip();await sleep(500);await showRunoutEquity();await sleep(700);
}
async function showRunoutEquity(){return;
  const ps=inHand();const eq=equityKnown(ps.map(p=>p.hand),G.board,1500);
  ps.forEach((p,i)=>{const b=p.human?$('#heroEq'):seatEl(p).querySelector('.eqbadge');b.hidden=false;b.textContent=pct(eq[i]);b.classList.remove('numpop');void b.offsetWidth;b.classList.add('numpop');});
}
function flipSeatCards(p){seatEl(p).querySelectorAll('.mini .card').forEach(el=>el.classList.add('up'));}
function buildPots(){
  const contrib=G.players.filter(p=>p.total>0);const levels=[...new Set(contrib.map(p=>p.total))].sort((a,b)=>a-b);
  let prev=0;const pots=[];
  for(const L of levels){
    let amt=0;for(const p of contrib) amt+=Math.min(p.total,L)-Math.min(p.total,prev);
    const elig=G.players.filter(p=>!p.folded&&!p.out&&p.total>=L);
    if(amt>0){const last=pots[pots.length-1];
      if(!elig.length&&last) last.amt+=amt;
      else if(last&&last.elig.length===elig.length&&last.elig.every(e=>elig.includes(e))) last.amt+=amt;
      else pots.push({amt,elig:elig.length?elig:inHand()});}
    prev=L;
  }
  return pots;
}
async function resolveHand(){
  G.players.forEach(p=>seatEl(p)?.classList.remove('turn'));$('#hero').classList.remove('turn');
  const contenders=inHand();const total=potTotal();let mainWinners=[],mainScore=null;
  G.heroWon=0;G.heroCat=null;G.heroScore=null;G.nearMiss=null;G.allinWin=false;G.beat=null;
  if(contenders.length===1){
    const w=contenders[0];w.chips+=total;mainWinners=[w];if(w.human) G.heroWon=total;
    setStatus(`${w.human?'You win':w.name+' wins'} ${money(total)}`);
    snap(`${w.human?'You win':w.name+' wins'} ${money(total)}. Everyone else folded.`,{kind:'end'});
    await flyChips($('#pot'),w.human?$('#heroCards'):seatEl(w).querySelector('.seat-box'),8);
    renderSeats();$('#potNum').dataset.v=0;$('#potNum').textContent='$0';
    if(w.human){sfx.win();flashSwirl('win');const c=center($('#heroCards'));burst(c.x,c.y,30);}
    if(!w.human) await banner(`${w.name} takes it`,[[`+${money(total)}`,'var(--gold)']],'var(--text)',null,1100);
  }else{
    for(const p of contenders) if(!p.human) flipSeatCards(p);
    if(G.rule.fog){const el=$$('#heroCards .card')[1];if(el) el.classList.add('up');}
    sfx.flip();setStatus('Showdown');await sleep(700);
    const scores=new Map(contenders.map(p=>[p,evalHand(p.hand.concat(G.board))]));
    const pots=buildPots();
    const order=[];{let i=G.dealer;for(let k=0;k<G.players.length;k++){i=(i+1)%G.players.length;order.push(G.players[i]);}}
    const payouts=new Map();
    pots.forEach((pot,pi)=>{
      const best=Math.max(...pot.elig.map(p=>scores.get(p)));const ws=order.filter(p=>pot.elig.includes(p)&&scores.get(p)===best);
      const share=Math.floor(pot.amt/ws.length);let rem=pot.amt-share*ws.length;
      ws.forEach(w=>{payouts.set(w,(payouts.get(w)||0)+share+(rem>0?1:0));if(rem>0) rem--;});
      if(pi===0){mainWinners=ws;mainScore=best;}
    });
    const w0=mainWinners[0];const b5=best5(w0.hand.concat(G.board));
    $$('#board .card, #heroCards .card, .mini .card').forEach(el=>{
      const c=+el.dataset.card;const seat=el.closest('.seat');const owner=seat?G.players[+seat.dataset.id]:el.closest('#heroCards')?G.human:null;
      const mine=owner?mainWinners.includes(owner):true;
      if(b5.includes(c)&&mine) el.classList.add('win');else el.classList.add('dim');
    });
    const heroIn=contenders.includes(G.human),heroWins=mainWinners.includes(G.human);
    const who=mainWinners.length>1?'Split pot':heroWins?'You win':`${w0.name} wins`;
    const bigPot=total>=G.bb*25;
    if(heroWins){(bigPot?sfx.bigwin:sfx.win)();flashSwirl('win',3000,bigPot?5:2);shake(bigPot?2.2:1);const c=center($('#heroCards'));burst(c.x,c.y,bigPot?80:40);
      if(catOf(mainScore)>=6) G.bigHandWin=true;}
    else if(heroIn){sfx.lose();flashSwirl('lose',2200,1);const hs=scores.get(G.human);
      if(catOf(hs)===catOf(mainScore)) G.nearMiss=catOf(hs)>=1?'Lost by a kicker!':'So close!';else if(catOf(mainScore)-catOf(hs)===1) G.nearMiss='One step short!';}
    if(heroWins){G.heroScore=scores.get(G.human);G.heroCat=catOf(G.heroScore);G.beat=contenders.filter(p=>!mainWinners.includes(p)).map(p=>`${p.name}: ${shortName(scores.get(p)).toLowerCase()}`);}
    snap(`${who} with ${handTitle(mainScore).toLowerCase()} (${handDetail(mainScore).toLowerCase()}).`,{kind:'end'});
    if(!(heroWins&&mainWinners.length===1)) await banner(handTitle(mainScore),[[handDetail(mainScore),'var(--blue)'],[who,heroWins?'var(--gold)':'var(--red)']],heroWins?'var(--gold)':'var(--text)',null,1500);
    for(const [p,amt] of payouts){p.chips+=amt;if(p.human) G.heroWon+=amt;await flyChips($('#pot'),p.human?$('#heroCards'):seatEl(p).querySelector('.seat-box'),Math.min(10,3+Math.ceil(amt/G.bb/3)));}
    renderSeats();$('#potNum').dataset.v=0;$('#potNum').textContent='$0';setStatus(`${who}: ${shortName(mainScore)}`);
    if(heroIn&&heroWins&&G.players.some(p=>p.allIn)){SAVE.stats.allinWins++;G.allinWin=true;}
  }
  if(S().reveal) G.players.forEach(p=>{if(!p.human&&p.hand.length&&!p.out){flipSeatCards(p);seatEl(p).classList.add('shown');}});
  G.players.forEach(p=>{if(p.human||p.out&&!p.hand.length) return;const dl=p.chips-p.startChips;if(dl) popAt(seatEl(p).querySelector('.seat-box'),smoney(dl),dl>0?'var(--green)':'#5c6a80');});
  G.foldResult=G.human.folded&&!G.human.out&&G.human.hand.length?wouldHaveWon(contenders):null;
  if(G.foldResult) setTimeout(()=>{if(!G.dead) popAt($('#heroCards'),G.foldResult.short,G.foldResult.won?'var(--red)':'var(--green)');},700);
  const net=G.human.chips-G.human.startChips;
  if(net!==0) popAt($('#heroCards'),smoney(net),net>0?'var(--gold)':'var(--red)');
  bossReact(mainWinners);
  const st=SAVE.stats;st.hands++;st.net+=net;if(net>0){st.won++;G.streak++;}else if(net<0) G.streak=0;if(G.vpip) st.vpip++;
  G.lastWinners=mainWinners;
  await sleep(250);
  buildReview(net);
  persist();
  const R=G.lastReview;
  if(!G.human.out) await afterHand({won:G.heroWon,cat:G.heroCat,score:G.heroScore,nearMiss:G.nearMiss,allinWin:G.allinWin,mine:R.mine,handAcc:R.handAcc,beat:S().reveal?G.beat:null});
}
function bossReact(winners){
  if(!G.boss) return;const b=G.boss;const lost=b.startChips-b.chips;
  updateBossBar(lost>0);
  const anchor=seatEl(b).querySelector('.seat-box');
  if(b.chips<=0){bubbleAt(anchor,b.boss.lines.defeat,true,2600);return;}
  if(winners.includes(b)&&b.chips-b.startChips>=G.bb*8) bubbleAt(anchor,b.boss.lines.win,true,2200);
  else if(lost>=b.matchStart*.15){bubbleAt(anchor,b.boss.lines.hurt,true,2200);sfx.hit();}
}

/* =====================================================================
   HUMAN INPUT
   ===================================================================== */
function humanAction(p,d){
  measure(d,1200);
  return new Promise((resolve,reject)=>{
    const toCall=d.toCall;
    $('#hero').classList.add('turn');setStatus('Your move');sfx.tick();
    renderHud(d);renderCoach(d);
    const done=act=>{$('#hero').classList.remove('turn');$('#raiseTray').hidden=true;$('#coach').hidden=true;setActionsWaiting();G.pending=null;resolve(act);};
    G.pending={reject};
    const A=$('#actions');A.className='';A.innerHTML='';
    const bF=btn('Fold','b-red',()=>done({a:'fold'}));
    const bC=toCall>0?btn(toCall>=p.chips?'All in':'Call','b-blue',()=>done({a:'call'}),money(toCall)):btn('Check','b-blue',()=>done({a:'check'}));
    const bR=btn(G.currentBet===0?'Bet':'Raise','b-gold',()=>openRaise(p,d.minTo,d.maxTo,done));
    if(!d.canRaise) bR.disabled=true;
    if(toCall===0) bF.disabled=true;
    A.append(bF,bC,bR);
  });
}
function btn(label,cls,fn,small){
  const b=document.createElement('button');b.className='btn '+cls;b.innerHTML=label+(small?`<small>${small}</small>`:'');
  b.addEventListener('click',()=>{audio();sfx.btn();fn();});return b;
}
function setActionsWaiting(){const A=$('#actions');A.className='';A.innerHTML='<div class="wait">Waiting for the table…</div>';}
function openRaise(p,minTo,maxTo,done){
  const tray=$('#raiseTray'),range=$('#raiseRange'),go=$('#raiseGo');const pot=potTotal(),toCall=G.currentBet-p.bet;
  range.min=minTo;range.max=maxTo;range.step=Math.max(1,Math.min(G.sb,(maxTo-minTo)||1));range.value=minTo;
  const label=()=>{const v=+range.value;go.textContent=v>=maxTo?`All in ${money(maxTo)}`:`${G.currentBet===0?'Bet':'Raise to'} ${money(v)}`;};
  const set=v=>{range.value=clamp(Math.round(v),minTo,maxTo);label();sfx.tick();};
  const P=$('#presets');P.innerHTML='';const potTo=f=>G.currentBet+f*(pot+toCall);
  [['Min',minTo],['½ pot',potTo(.5)],['Pot',potTo(1)],['All in',maxTo]].forEach(([n,v])=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>set(v);P.appendChild(b);});
  range.oninput=()=>{label();sfx.tick();};
  $('#raiseCancel').onclick=()=>{tray.hidden=true;sfx.btn();};
  go.onclick=()=>{audio();sfx.btn();done({a:'raise',to:+range.value});};
  label();tray.hidden=false;
}
function waitNext(){
  return new Promise((resolve,reject)=>{
    G.pending={reject};
    const A=$('#actions');A.className='two';A.innerHTML='';
    const has=G.lastReview&&G.lastReview.mine.length;
    const go=()=>{closeModal();G.pending=null;G.nextHand=null;setActionsWaiting();resolve();};
    G.nextHand=go;
    const rv=btn('Review hand','b-blue',()=>openReview());
    const nx=btn('Next hand','b-gold',go);
    if(!has) rv.disabled=true;
    A.append(rv,nx);$('#hud').hidden=true;
    const g=G;
    if(S().coach&&has) setTimeout(()=>{if(!g.dead&&g.pending&&g.pending.reject===reject&&$('#modal').hidden) openReview();},450);
    else if(S().autoNext){nx.classList.add('auto');setTimeout(()=>{if(!g.dead&&g.pending&&g.pending.reject===reject&&$('#modal').hidden&&$('#sheet').hidden) nx.click();},1700);}
    rv.addEventListener('click',()=>nx.classList.remove('auto'));
  });
}

/* =====================================================================
   TABLE RENDERING
   ===================================================================== */
function buildTable(){
  const O=$('#opps');O.innerHTML='';
  G.players.filter(p=>!p.human).forEach(p=>{
    const st=STYLES[p.style];const el=document.createElement('div');el.className='seat';el.dataset.id=p.id;
    el.innerHTML=`<div class="seat-box"><div class="seat-top">${p.boss||G.players.length>3?'':`<div class="ava" style="--a:${p.color}">${p.name[0]}</div>`}<div class="who"><div class="nm">${p.name}</div><div class="st" style="color:${p.boss?'#ff7a70':st.color}">${p.boss?'Boss':st.label}</div></div><div class="mini"><div class="slot"></div><div class="slot"></div></div></div>
      <div class="seat-bot"><span class="ck" data-v="${p.chips}">${money(p.chips)}</span><span class="dbtn" hidden>D</span><span class="betchip" hidden></span><span class="eqbadge" hidden></span><span class="thinking" hidden>…</span></div></div>`;
    if(p.boss) el.querySelector('.seat-top').prepend(tokenEl(p.boss.icon,p.boss.color,28));
    el.querySelector('.seat-box').style.setProperty('--sc',p.color);
    O.appendChild(el);
  });
  const n=G.players.length-1;
  O.querySelectorAll('.seat').forEach(s=>{s.style.flex=n===1?'0 1 62%':(n===2||n===4)?'1 1 calc((100% - 8px)/2)':'1 1 calc((100% - 16px)/3)';s.style.maxWidth=n===1?'240px':(n===2||n===4)?'50%':'34%';});
  const B=$('#board');B.innerHTML='';for(let i=0;i<5;i++){const s=document.createElement('div');s.className='slot';B.appendChild(s);}
  const D=$('#deck');D.innerHTML='';for(let i=0;i<3;i++){const c=makeCard(null);c.style.setProperty('--w','30px');D.appendChild(c);}
  $('#heroChips').dataset.v=G.human.chips;$('#heroChips').textContent=money(G.human.chips);
  const bb=$('#bossbar');bb.hidden=!G.boss;
  if(G.boss){const B=G.boss.boss;bb.innerHTML='';bb.appendChild(tokenEl(B.icon,B.color,38));
    bb.insertAdjacentHTML('beforeend',`<div class="bmeta"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><span class="bn">${B.name}</span><span class="hpnum" id="bossHp"></span></div><div class="hpwrap"><div class="lag" id="hpLag"></div><div class="hp" id="hpBar"></div></div><div class="brule">${B.short}</div></div>`);
    updateBossBar(false);}
  setActionsWaiting();
  requestAnimationFrame(sizeCards);
}
function updateBossBar(hit){
  if(!G.boss) return;const b=G.boss;const f=clamp(b.chips/b.matchStart,0,1)*100;
  $('#hpBar').style.width=f+'%';$('#hpLag').style.width=f+'%';$('#bossHp').textContent=money(b.chips);
  if(hit){const bb=$('#bossbar');bb.classList.remove('hit');void bb.offsetWidth;bb.classList.add('hit');}
}
function updateBlinds(){$('#blinds').textContent=`${G.sb}/${G.bb}`+(G.ante?` +${G.ante}`:'');}
/* card sizes follow the space actually available, so nothing overlaps on short screens */
function sizeCards(){
  const g=$('#game');if(g.hidden) return;
  const W=Math.min(innerWidth,560)-32;
  const hw=Math.floor(clamp(Math.min(W*.22,innerHeight*.105),46,92));
  g.style.setProperty('--hw',hw+'px');
  const ch=$('#center').clientHeight;
  const bw=Math.floor(clamp(Math.min((W-24)/5,(ch-66)/1.4,74),28,74));
  g.style.setProperty('--bw',bw+'px');
  g.style.setProperty('--actH',$('#actions').offsetHeight+'px');
}
addEventListener('resize',()=>{if(G&&!G.dead) sizeCards();});
if(window.ResizeObserver){const ro=new ResizeObserver(()=>{if(G&&!G.dead) sizeCards();});ro.observe($('#center'));}
const seatEl=p=>document.querySelector(`.seat[data-id="${p.id}"]`);
function seatSlot(p,i){return p.human?$('#heroCards').children[i]:seatEl(p).querySelectorAll('.mini .slot')[i];}
function resetTableVisuals(){
  $$('#board .slot, #heroCards .slot, .mini .slot').forEach(s=>s.innerHTML='');
  $$('.eqbadge').forEach(b=>b.hidden=true);
  $('#heroLabel').hidden=true;$('#hud').hidden=true;$('#raiseTray').hidden=true;
  $('#potNum').dataset.v=0;$('#potNum').textContent='$0';$('#hero').classList.remove('folded','turn');
}
function renderSeats(){
  for(const p of G.players){
    if(p.human){
      const hc=$('#heroChips');if(+hc.dataset.v!==p.chips) tweenNum(hc,p.chips);
      const hb=$('#heroBet');hb.hidden=!p.bet;hb.textContent=money(p.bet);
      $('#heroD').hidden=G.players.indexOf(p)!==G.dealer;$('#hero').classList.toggle('folded',p.folded);continue;
    }
    const el=seatEl(p);if(!el) continue;
    const ck=el.querySelector('.ck');if(p.out) ck.textContent='Busted';else if(+ck.dataset.v!==p.chips) tweenNum(ck,p.chips);
    const b=el.querySelector('.betchip');b.hidden=!p.bet;b.textContent=money(p.bet);
    el.querySelector('.dbtn').hidden=G.players.indexOf(p)!==G.dealer;
    el.classList.toggle('folded',p.folded&&!p.out);el.classList.toggle('out',p.out);
  }
  const pn=$('#potNum');if(+pn.dataset.v!==potTotal()) tweenNum(pn,potTotal());
  if(G.boss) updateBossBar(false);
}
function setStatus(t){$('#status').textContent=t;}
function updateHeroLabel(){
  const h=G.human,L=$('#heroLabel');
  if(!h.hand.length||h.out||!S().handName||G.rule.noLabel||(G.rule.fog&&G.street===0)){L.hidden=true;return;}
  L.hidden=false;L.textContent=G.board.length?shortName(evalHand(h.hand.concat(G.board))):preflopName(h.hand);
}
function renderHud(d){
  const H=$('#hud');
  if(!S().hud||G.rule.noHud){H.hidden=true;return;}
  H.hidden=false;
  const free=d.toCall===0,good=free||d.eqA>=d.req;
  const dc=free?'var(--blue)':good?'var(--green)':'var(--red)';
  const on=Math.round(d.eqA*20);
  const outs=d.outs?`${d.outs} outs: ${pct(hitChance(d.outs,d.board.length))} to hit by the river`:(d.board.length&&d.board.length<5&&!d.fogged?'No clean draws':'');
  H.innerHTML=`<div class="oddsline">
    <div class="oddsbox"><div class="k">Your odds</div><div class="v">${pct(d.eqA)}<small>${freq(d.eqA)}</small></div></div>
    <div class="oddsbox"><div class="k">${free?'Price':'Break-even'}</div><div class="v">${free?'Free':pct(d.req)}<small>${free?'check costs $0':freq(d.req)}</small></div></div>
    <div class="verdict" style="--vc:${dc}">${free?'Free<br>card':good?'Call<br>pays':'Call<br>loses'}</div></div>
    <div class="dots" style="--dc:${dc}">${Array.from({length:20},(_,i)=>`<i class="${i<on?'on':''}"></i>`).join('')}${free?'':`<div class="be" style="left:calc(${(d.req*100).toFixed(1)}% - 1.5px)"></div>`}</div>
    ${outs?`<div class="hudnote"><span>${outs}</span></div>`:''}`;
}
attachTilt($('#heroCards'));

/* =====================================================================
   REVIEW + REPLAY
   ===================================================================== */
function buildReview(net){
  const decs=G.decisions.filter(d=>d.act);
  decs.forEach(classify);
  const mine=decs.filter(d=>d.human);
  const st=SAVE.stats;
  mine.forEach(d=>{st.cls[d.cls]++;st.accSum+=d.acc;st.accN++;G.accSum+=d.acc;G.accN++;});
  const handAcc=mine.length?mine.reduce((a,d)=>a+d.acc,0)/mine.length:null;
  const oppAcc=G.players.filter(p=>!p.human).map(p=>{const ds=decs.filter(d=>d.pid===p.id);return ds.length?{name:p.name,acc:ds.reduce((a,d)=>a+d.acc,0)/ds.length}:null;}).filter(Boolean);
  // hero equity vs actual cards at every replay step
  const cache=new Map();
  G.snaps.forEach(s=>{
    if(G.human.out||s.ps[0].folded||!G.human.hand.length){s.heroEq=null;return;}
    const opps=G.players.filter((p,i)=>i>0&&!s.ps[i].folded&&!s.ps[i].out&&p.hand.length);
    if(!opps.length){s.heroEq=1;return;}
    const key=s.board.length+'|'+opps.map(o=>o.id).join(',');
    if(!cache.has(key)) cache.set(key,equityKnown([G.human.hand,...opps.map(o=>o.hand)],s.board,700)[0]);
    s.heroEq=cache.get(key);
  });
  mine.forEach(d=>{const opps=G.players.filter(p=>d.oppIds.includes(p.id));try{d.actual=equityKnown([d.fullHole,...opps.map(o=>o.hand)],d.board,700)[0];}catch(e){d.actual=null;}});
  G.lastReview={net,handNo:G.handNo,snaps:G.snaps,decs,mine,handAcc,oppAcc,
    players:G.players.map(p=>({id:p.id,name:p.name,human:p.human,style:p.style,color:p.color,boss:p.boss,hand:p.hand.slice(),out:p.out&&!p.hand.length,folded:p.folded,foldedAt:G.foldedAt[p.id],
      score:p.hand.length?evalHand(p.hand.concat(G.board)):0,winner:(G.lastWinners||[]).includes(p)}))};
}
const ICO={start:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 3h2v10H3zM13 3v10L6 8z"/></svg>',prev:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M12 3v10L5 8z"/></svg>',
  play:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3v10l8-5z"/></svg>',pause:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
  next:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 3v10l5-5zM9 3v10l5-5z"/></svg>'};
let RP={idx:0,timer:null};
function clsIcon(cls,size){const c=CLS[cls];return `<span class="cico" style="--cc:${c.c}${size?';width:'+size+'px;height:'+size+'px':''}">${c.sym}</span>`;}
function avatarHtml(p,size=24){return p.boss?`<span class="token" style="--tc:${p.boss.color};--ts:${size}px">${ICON_SVG[p.boss.icon]}</span>`:`<span class="ava" style="--a:${p.color}">${p.human?'Y':p.name[0]}</span>`;}
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
function openReview(){
  const R=G.lastReview;if(!R||!R.mine.length) return;
  const acc=R.handAcc;
  const shown=R.mine.slice(-5);
  const shortBest=b=>b.k==='raise'?`${b.label.split(' (')[0].toLowerCase()}`:b.k;
  const rows=shown.map(d=>{const c=CLS[d.cls];const good=d.cls==='master'||d.cls==='best';
    return `<div class="rv-row" style="--cc:${c.c}"><div class="what">${STREETS[d.street]} <span>· ${cap1(actText(d))}</span></div><div class="g">${clsIcon(d.cls,18)}${c.n}</div>
      <div class="sub">Win <b>${pct(d.eqA)}</b> · ${d.toCall?`need <b>${pct(d.req)}</b>`:'free'}${good?'':` · <span class="bst">Best: ${shortBest(d.best)}${d.loss>=1?` (+${money(d.loss)})`:''}</span>`}</div></div>`;}).join('')+
    (R.mine.length>shown.length?`<div class="note" style="text-align:center">+${R.mine.length-shown.length} earlier decision${R.mine.length-shown.length>1?'s':''} counted in your accuracy</div>`:'');
  openModal(`<div class="rv"><div class="rv-top"><div><div class="bigacc" style="color:${accColor(acc)}">${acc.toFixed(1)}</div><div class="k">Accuracy</div></div>
    <div><div class="net" style="color:${R.net>0?'var(--gold)':R.net<0?'var(--red)':'var(--text)'}">${smoney(R.net)}</div><div class="k" style="text-align:right">This hand</div></div></div>
    ${G.foldResult?`<div class="rv-fold" style="--cc:${G.foldResult.won?'var(--red)':'var(--green)'}">${G.foldResult.text}</div>`:''}
    <div class="rv-list">${rows}</div>
    <div class="btnrow"><button class="btn b-grey" id="rvClose">Close</button><button class="btn b-gold" id="rvNext">Next hand</button></div></div>`);
  $('#rvClose').onclick=()=>{sfx.btn();closeModal();};
  $('#rvNext').onclick=()=>{sfx.btn();closeModal();if(G&&G.nextHand) G.nextHand();};
  sfx.flip();
}
/* replay viewer kept for later; not shown in the current UI */
function openReplay(){}
function startReplay(){
  const R=G.lastReview;if(RP.idx>=R.snaps.length-1) goSnap(0);
  $('#rPlay').innerHTML=ICO.pause;
  RP.timer=setInterval(()=>{
    if(!$('#tline')||!G.lastReview||G.lastReview!==R||$('#sheet').hidden){stopReplay();return;}
    if(RP.idx>=R.snaps.length-1){stopReplay();return;}
    goSnap(RP.idx+1);
    const s=R.snaps[RP.idx];if(s.dec&&s.dec.human) stopReplay();
  },1500);
}
function stopReplay(){clearInterval(RP.timer);RP.timer=null;const b=$('#rPlay');if(b) b.innerHTML=ICO.play;}
function goSnap(i){
  const R=G.lastReview;RP.idx=i;const s=R.snaps[i];sfx.tick();
  // eval bar
  const eb=$('#evalbar');const prev=s.heroEq??[...R.snaps.slice(0,i)].reverse().find(x=>x.heroEq!=null)?.heroEq??.5;
  eb.classList.toggle('folded',s.heroEq==null);
  const v=s.heroEq??prev;eb.querySelector('.fill').style.height=(v*100)+'%';
  const ev=eb.querySelector('.ev');ev.textContent=s.heroEq==null?'—':Math.round(v*100);ev.style.bottom=clamp(v*100-9,1,88)+'%';
  ev.style.color=v*100>12?'var(--ink)':'var(--text)';
  // table
  const RT=$('#rtable');RT.innerHTML='';
  const br=document.createElement('div');br.className='rboard';
  for(let k=0;k<5;k++){if(s.board[k]!=null) br.appendChild(staticCard(s.board[k],'xs'));else{const ph=document.createElement('div');ph.className='ph';br.appendChild(ph);}}
  br.insertAdjacentHTML('beforeend',`<span class="rpot">Pot ${money(s.pot)}</span>`);RT.appendChild(br);
  R.players.forEach((p,pi)=>{
    if(p.out) return;const ps=s.ps[pi];
    const row=document.createElement('div');row.className='rp'+(s.actor===p.id?' act':'')+(ps.folded?' fold':'');
    row.innerHTML=`${avatarHtml(p)}<div class="rn"><b>${p.human?'You':p.name}</b><span>${money(ps.chips)}${ps.folded?' · folded':ps.allIn?' · all in':''}</span></div><div class="cards"></div><div class="rbet">${ps.bet?money(ps.bet):''}</div>`;
    const cc=row.querySelector('.cards');p.hand.forEach(c=>cc.appendChild(staticCard(c,'xs')));
    RT.appendChild(row);
    if(s.actor===p.id&&s.thought){const t=document.createElement('div');t.className='thought';t.textContent=`“${s.thought}”`;RT.appendChild(t);}
  });
  // narration
  const N=$('#narr');const d=s.dec;
  if(d&&d.human){
    N.style.setProperty('--nc',CLS[d.cls].c);
    N.innerHTML=`<div class="nt">${clsIcon(d.cls,24)}<span style="color:${CLS[d.cls].c}">${CLS[d.cls].n}</span><span>You ${actText(d)}</span></div>
      ${explain(d).map(t=>`<p>${t}</p>`).join('')}
      <div class="evtable">${d.opts.map(o=>{const ch=(o.k===d.act)||(o.k==='raise'&&(d.act==='raise'||d.act==='allin')&&o.to===d.amount)||(o.k==='call'&&d.act==='call');
        return `<div class="evrow${ch?' chosen':''}"><span class="el">${o.label}</span>${o===d.best?'<span class="tagbest">Best</span>':''}<span class="evv" style="color:${o.ev>=0?'var(--green)':'var(--red)'}">${smoney(o.ev)}</span></div>`;}).join('')}
        ${(d.act==='raise'||d.act==='allin')&&!d.opts.some(o=>o.to===d.amount)?`<div class="evrow chosen"><span class="el">Your ${d.currentBet?'raise to':'bet of'} ${money(d.amount)}</span><span class="evv" style="color:${d.chosenEV>=0?'var(--green)':'var(--red)'}">${smoney(d.chosenEV)}</span></div>`:''}</div>
      <p class="note">Average result of each option from this moment. Against their real cards you had ${d.actual==null?'–':pct(d.actual)}.</p>`;
  }else{
    N.style.setProperty('--nc','var(--panel-hi)');
    N.innerHTML=`<div class="nt">${s.text}</div>${d&&!d.human?`<p class="note">Graded ${CLS[d.cls].n.toLowerCase()}. They had ${pct(d.eq)} against random hands.</p>`:''}`;
  }
  $$('#tline button').forEach((b,k)=>b.classList.toggle('cur',k===i));
  const cur=$$('#tline button')[i];if(cur) cur.scrollIntoView({block:'nearest',inline:'center'});
}

/* =====================================================================
   SHEETS + MODALS
   ===================================================================== */
function openSheet(title,tall=false){$('#sheetTitle').textContent=title;$('#sheet').classList.toggle('tall',tall);$('#scrim').hidden=false;$('#sheet').hidden=false;$('#sheetBody').scrollTop=0;sfx.flip();}
function closeSheet(){stopReplay();$('#sheet').hidden=true;if($('#modal').hidden) $('#scrim').hidden=true;}
function openModal(html){const M=$('#modal');M.innerHTML=html;M.hidden=false;$('#scrim').hidden=false;}
function closeModal(){$('#modal').hidden=true;if($('#sheet').hidden) $('#scrim').hidden=true;}
$('#sheetClose').onclick=()=>{sfx.btn();closeSheet();};
$('#scrim').onclick=()=>{closeSheet();closeModal();};

function statGrid(){
  const s=SAVE.stats;const acc=s.accN?(s.accSum/s.accN).toFixed(1):'–';
  return `<div class="statgrid"><div>Lifetime accuracy<b style="color:${s.accN?accColor(s.accSum/s.accN):'var(--text)'}">${acc}</b></div><div>Hands played<b>${s.hands}</b></div>
   <div>Hands won<b>${s.hands?Math.round(s.won/s.hands*100)+'%':'–'}</b></div><div>Net chips<b style="color:${s.net>=0?'var(--gold)':'var(--red)'}">${smoney(s.net)}</b></div>
   <div>Master moves<b style="color:var(--c-master)">${s.cls.master}</b></div><div>Blunders<b style="color:var(--c-blunder)">${s.cls.blunder}</b></div></div>`;
}
const SETTINGS=[
  ['music','Music','Chiptune soundtrack'],['sound','Sound effects','Cards, chips and wins'],
  ['coach','Auto hand review','Shows your grades after each hand'],['handName','Show my hand\'s name','Turn off to practise reading hands'],
  ['hud','Live odds meter','Your odds and break-even on your turn'],['jcoach','Joker coach','Plain-words advice on your turn (quick play)'],
  ['reveal','Show everyone\'s cards','Reveal all hands and what you beat after each round'],['fast','Fast dealing','Shorter animations']
];
const SHORT={coach:'Auto review',jcoach:'Joker coach',handName:'Hand name',hud:'Odds meter'};
function settingsHtml(keys,compact,short){return SETTINGS.filter(s=>!keys||keys.includes(s[0])).map(([k,l,s])=>`<button class="tog" data-k="${k}" role="switch" aria-checked="${!!S()[k]}"><span>${short?SHORT[k]||l:l}${compact?'':`<small>${s}</small>`}</span><span class="sw"></span></button>`).join('');}
function wireSettings(root){
  root.querySelectorAll('.tog[data-k]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k;S()[k]=!S()[k];b.setAttribute('aria-checked',S()[k]);persist();audio();sfx.btn();
    if(k==='music'){if(S().music) Music.start();else Music.stop();}
    if(G&&!G.dead){if(k==='handName') updateHeroLabel();if(k==='hud'&&!S().hud) $('#hud').hidden=true;if(k==='jcoach'&&!S().jcoach) $('#coach').hidden=true;}
  });
}
function openMenu(){
  const keys=['music','sound','coach','handName',...(G.cfg.mode==='quick'?['hud','jcoach']:[]),'reveal','fast'];
  openModal(`<h2>Options</h2>${settingsHtml(keys,true)}<div class="btnrow"><button class="btn b-green" id="mCheat">Cheat sheets</button><button class="btn b-violet hasbadge" id="mCol">Collection${packBadge()}</button></div>
    <div class="btnrow"><button class="btn b-red" id="mQuit">Leave table</button><button class="btn b-gold" id="mResume">Resume</button></div>`);
  wireSettings($('#modal'));
  $('#mCheat').onclick=()=>{closeModal();openCheats();};
  $('#mCol').onclick=()=>{closeModal();openCollection(0,'game');};
  $('#mResume').onclick=()=>{sfx.btn();closeModal();};
  $('#mQuit').onclick=()=>{sfx.btn();leaveTable();};
}
function leaveTable(){
  const camp=G&&G.cfg.mode==='campaign';
  if(G){G.dead=true;if(G.pending) try{G.pending.reject('abort');}catch(e){}}
  closeModal();closeSheet();$$('#fx .banner,#fx .actpop,#fx .flycard,#fx .chipfly,#fx .bubble,#bossIntro,#scoreModal').forEach(e=>e.remove());
  renderHome(camp?'camp':'quick');
}

/* ---------- match end + unlocks ---------- */
function unlock(id){
  if(SAVE.unlocked.includes(id)) return false;SAVE.unlocked.push(id);persist();sfx.unlock();toast(`New card style: ${styleById(id).name}`);return true;
}
function checkAchievements(){
  const s=SAVE.stats;
  if(s.hands>=50) unlock('vapor');
  if(G.bigHandWin){unlock('negative');G.bigHandWin=false;}
  if(s.cls.master>=10) unlock('polychrome');
}
function endMatch(won){
  const cfg=G.cfg;const acc=G.accN?(G.accSum/G.accN).toFixed(1):'–';
  if(won){sfx.bigwin();flashSwirl('win',5000,6);burst(innerWidth/2,innerHeight/2,120);shake(2);}else{sfx.lose();flashSwirl('lose',4000,2);}
  const sum=`<div class="statgrid"><div>Hands<b>${G.handNo}</b></div><div>Accuracy<b style="color:${G.accN?accColor(G.accSum/G.accN):'var(--text)'}">${acc}</b></div></div>`;
  if(cfg.mode==='campaign'){
    if(won){
      const id=`${cfg.a}-${cfg.s}`;if(!SAVE.campaign.beaten.includes(id)) SAVE.campaign.beaten.push(id);persist();
      const reward=cfg.s===2?ANTES[cfg.a].reward:null;const fresh=reward?unlock(reward):false;
      openModal(`<h2 style="color:var(--gold)">${cfg.boss?'Boss defeated':'Blind cleared'}</h2>
        <p style="text-align:center">${cfg.boss?`“${cfg.boss.lines.defeat}”`:`You took every chip at the ${cfg.s?'big':'small'} blind table.`}</p>${sum}
        ${reward?`<div class="showcase" id="rewardShow"></div><p style="text-align:center"><b>${styleById(reward).name}</b> cards ${fresh?'unlocked':'(already yours)'}</p>`:''}
        <div class="btnrow">${reward?'<button class="btn b-violet" id="eEquip">Equip</button>':'<button class="btn b-grey" id="eMap">Map</button>'}<button class="btn b-gold" id="eNext">${nextCampaignMatch()?'Next match':'Campaign map'}</button></div>`);
      if(reward){const R=$('#rewardShow');[51,46,41].forEach((c,i)=>{const el=makeCard(c,'up',reward);el.dataset.fixed=1;el.style.setProperty('--w','64px');el.style.animation=`tokspin 1.1s ${i*.15}s cubic-bezier(.2,1.4,.4,1) both`;R.appendChild(el);});attachTilt(R);
        $('#eEquip').onclick=()=>{applyCardStyle(reward);sfx.unlock();$('#eEquip').textContent='Equipped';};}
      else $('#eMap').onclick=()=>{closeModal();leaveTable();};
      $('#eNext').onclick=()=>{closeModal();const n=nextCampaignMatch();if(n) startMatch(campaignConfig(n[0],n[1]));else leaveTable();};
    }else{
      openModal(`<h2 style="color:var(--red)">Busted</h2><p style="text-align:center">${cfg.boss?`“${cfg.boss.lines.win}”`:'You ran out of chips.'} Your best hand review is one tap away, or jump straight back in.</p>${sum}
        <button class="btn b-gold" id="eRetry" style="font-size:24px;padding:15px">Run it back</button><button class="btn b-grey" id="eMap">Campaign map</button>`);
      $('#eMap').onclick=()=>{closeModal();leaveTable();};
      $('#eRetry').onclick=()=>{closeModal();startMatch(campaignConfig(cfg.a,cfg.s));};
    }
  }else{
    openModal(`<h2 style="color:${won?'var(--gold)':'var(--red)'}">${won?'Table cleared':'Busted'}</h2><p style="text-align:center">${won?'You took every chip on the table.':'You ran out of chips.'}</p>${sum}
      <button class="btn b-gold" id="eAgain" style="font-size:24px;padding:15px">${won?'New table':'Run it back'}</button><div class="btnrow">${won?'':'<button class="btn b-blue" id="eRebuy">Rebuy here</button>'}<button class="btn b-grey" id="eNew" ${won?'style="grid-column:1/-1"':''}>Menu</button></div>`);
    $('#eNew').onclick=()=>{closeModal();leaveTable();};
    $('#eAgain').onclick=()=>{closeModal();startMatch(quickConfig());};
    const rb=$('#eRebuy');if(rb) rb.onclick=()=>{closeModal();G.human.chips=1000;renderSeats();playLoop();};
  }
}

/* =====================================================================
   SCREENS
   ===================================================================== */
const SCREENS=['home','collection','game'];
const HOME={mode:'quick',ante:null,sel:null};
function show(id){SCREENS.forEach(s=>$('#'+s).hidden=s!==id);if(id!=='game') Music.setTheme('menu');}
function renderHome(mode){
  if(G) G.dead=true;
  if(mode) HOME.mode=mode;
  show('home');
  $$('.logo [data-word]').forEach(w=>{if(!w.children.length) w.innerHTML=[...w.dataset.word].map((ch,i)=>`<span style="--i:${i}">${ch}</span>`).join('');});
  const LC=$('#logoCards');LC.innerHTML='';
  [[48,-14],[37,-6],[26,0],[15,6],[4,14]].forEach(([c,r],i)=>{const el=makeCard(c,'up');el.style.setProperty('--w','40px');bobify(el);el.style.setProperty('--r0',(r-2)+'deg');el.style.setProperty('--r1',(r+2)+'deg');el.style.marginTop=(Math.abs(i-2)*6)+'px';LC.appendChild(el);});
  $('#collectionBtn').innerHTML='Collection'+packBadge();
  const camp=HOME.mode==='camp';
  $('#modeQuick').setAttribute('aria-selected',!camp);$('#modeCamp').setAttribute('aria-selected',camp);
  $('#quickPanel').hidden=camp;$('#campPanel').hidden=!camp;
  baseSwirl(camp?'boss':themePalette(),1);
  if(camp) renderCampPanel();else renderQuickPanel();
}
function renderQuickPanel(){
  const so=$('#segOpp');so.innerHTML='';
  for(let i=1;i<=5;i++){const b=document.createElement('button');b.textContent=i;b.setAttribute('aria-pressed',S().opp===i);b.onclick=()=>{audio();sfx.btn();S().opp=i;persist();renderQuickPanel();};so.appendChild(b);}
  const sd=$('#segDiff');sd.innerHTML='';
  DIFFS.forEach(d=>{const b=document.createElement('button');b.innerHTML=`${d.name}<small>${d.sub}</small>`;b.setAttribute('aria-pressed',S().diff===d.id);b.onclick=()=>{audio();sfx.btn();S().diff=d.id;persist();renderQuickPanel();};sd.appendChild(b);});
  const T=$('#quickToggles');T.innerHTML=settingsHtml(['coach','jcoach','handName','hud'],true,true);wireSettings(T);
  $('#primaryBtn').textContent='Deal me in';$('#primaryBtn').disabled=false;
}
function renderCampPanel(){
  const next=nextCampaignMatch();
  if(HOME.ante==null) HOME.ante=next?next[0]:ANTES.length-1;
  const a=HOME.ante;
  if(HOME.sel==null||!isAvail(a,HOME.sel)) HOME.sel=(next&&next[0]===a)?next[1]:(isAvail(a,0)?0:null);
  const A=ANTES[a],B=BOSSES[A.boss];
  $('#anteName').textContent=`Ante ${a+1}: ${A.name}`;
  $('#anteSub').textContent=`Boss reward: ${styleById(A.reward).name} cards`;
  $('#antePrev').disabled=a===0;$('#anteNext').disabled=a===ANTES.length-1;
  const C=$('#blindCards');C.innerHTML='';
  [['Small blind','#1d9bf0',A.small],['Big blind','#e2a020',A.big],['Boss',B.color,null]].forEach(([lab,col,lineup],s)=>{
    const done=isBeaten(a,s),av=isAvail(a,s);
    const b=document.createElement('button');b.className='blindcard'+(done?' done':'')+(av?'':' lock');b.setAttribute('aria-pressed',HOME.sel===s);
    b.appendChild(s===2?tokenEl(B.icon,B.color,48):tokenEl(null,col,48,lab[0]));
    b.insertAdjacentHTML('beforeend',`<span class="bl">${s===2?B.name:lab}</span><span class="bs">${s===2?B.short:lineup.map(x=>STYLES[x].label).join(' + ')}</span>`);
    b.onclick=()=>{audio();sfx.btn();if(!av){$('#blindInfo').textContent='Beat the previous blind to unlock this one.';return;}HOME.sel=s;renderCampPanel();};
    C.appendChild(b);
  });
  const sel=HOME.sel;
  $('#blindInfo').innerHTML=sel==null?'Clear the earlier antes to unlock this one.':sel===2?`<b>${B.name}:</b> ${B.rule}`:tipFor(A[sel?'big':'small']);
  const T=$('#campToggles');T.innerHTML=settingsHtml(['coach','handName'],true,true);wireSettings(T);
  const pb=$('#primaryBtn');pb.disabled=sel==null;
  pb.textContent=sel!=null&&isBeaten(a,sel)?'Replay match':SAVE.campaign.beaten.length?'Continue campaign':'Start campaign';
}
function tipFor(styles){
  const tips={fish:'Fish call too much: bet your good hands bigger and skip the bluffs.',rock:'Rocks fold a lot: steal their blinds, but fold when they raise.',
    reg:'Regulars follow pot odds: mix up your bet sizes.',shark:'Sharks read bet sizes: don\'t pay off big bets without a strong hand.',maniac:'Maniacs bluff constantly: call them down with medium hands.'};
  return [...new Set(styles)].map(s=>tips[s]).join(' ');
}

/* ---------- collection: packs, card styles, tables ---------- */
const COL={page:0,sel:null};
const RAR_ORDER=['common','rare','epic','legendary','mythic'];
function colPages(){const pages=[{k:'packs',t:'Booster packs'}];
  RAR_ORDER.forEach(r=>{if(CARD_STYLES.some(s=>s.rar===r)) pages.push({k:'cards',rar:r,t:`Cards: ${RARITY[r][0]}`});});
  pages.push({k:'tables',t:'Tables'});return pages;}
function packBadge(){const n=P().packs;return n?`<span class="badge">${n}</span>`:'';}
function openCollection(page=0,from='home'){COL.from=from;show('collection');baseSwirl('shop',1);COL.page=page;COL.sel=null;renderCollection();}
function closeCollection(){if(COL.from==='game'&&G&&!G.dead){show('game');Music.setTheme(G.boss?'boss':'table');baseSwirl(G.boss?'boss':themePalette());requestAnimationFrame(sizeCards);}else renderHome();}
function renderCollection(){
  const pages=colPages();COL.page=clamp(COL.page,0,pages.length-1);const pg=pages[COL.page];
  $('#colTitle').textContent=pg.t;$('#colDots').textContent=pages.map((_,i)=>i===COL.page?'●':'○').join(' ');
  $('#colPrev').disabled=COL.page===0;$('#colNext').disabled=COL.page===pages.length-1;
  const PG=$('#colPage');PG.className='colpage';PG.innerHTML='';const CP=$('#colCaption');CP.innerHTML='';
  if(pg.k==='packs'){
    const p=P();ensureQuests();persist();PG.classList.add('single');
    PG.innerHTML=(p.packs?`<div class="pack" id="colPack"><span>Swirl</span><b>PACK</b><span>Tap to open</span></div><div class="packcount">${p.packs} pack${p.packs>1?'s':''} ready</div>`
      :`<p style="margin:0;font-size:18px;line-height:1.4">No packs yet.<br><span style="color:var(--muted);font-size:15px">Play some more hands to earn them.</span></p>`)+
      `<div class="qlist">${p.quests.map(q=>{const d=questDef(q.id);return `<div class="quest"><span>${d.text}</span><span>${q.prog}/${d.goal}</span><i><b style="width:${q.prog/d.goal*100}%"></b></i></div>`;}).join('')}</div>`;
    const cp=$('#colPack');if(cp) cp.onclick=openPack;
    CP.innerHTML=`<span>Level ${p.level}</span><small>${p.xp} / ${xpNeed(p.level)} XP to the next pack</small>`;
  }
  if(pg.k==='cards'){
    CARD_STYLES.filter(s=>s.rar===pg.rar).forEach(st=>{
      const un=SAVE.unlocked.includes(st.id);
      const b=document.createElement('button');b.className='citem'+(un?'':' locked')+(S().cardStyle===st.id?' eq':'')+(COL.sel===st.id?' sel':'');
      const c=makeCard(48,'up',st.id);c.dataset.fixed=1;b.appendChild(c);
      if(!un) b.insertAdjacentHTML('beforeend',`<span class="lk">${ICON_SVG.lock}</span>`);
      b.onclick=()=>{audio();COL.sel=st.id;if(un){applyCardStyle(st.id);sfx.unlock();}else sfx.btn();renderCollection();};
      PG.appendChild(b);
    });
    const sel=styleById(COL.sel||S().cardStyle);const [rn,rc]=RARITY[sel.rar];const un=SAVE.unlocked.includes(sel.id);
    CP.innerHTML=`<span><b>${sel.name}</b> <span class="rar" style="--rc:${rc}">${rn}</span></span><small>${un?(S().cardStyle===sel.id?'Equipped':'Tap to equip'):sel.req}</small>`;
  }
  if(pg.k==='tables'){
    THEMES.slice().sort((a,b)=>RAR_ORDER.indexOf(a.rar)-RAR_ORDER.indexOf(b.rar)).forEach(t=>{
      const own=P().themes.includes(t.id);const pal=PALETTES[t.id];
      const b=document.createElement('button');b.className='citem'+(own?'':' locked')+(themePalette()===t.id?' eq':'')+(COL.sel===t.id?' sel':'');
      b.innerHTML=`<span class="swatch sm" style="background:radial-gradient(circle at 35% 35%,${rgb(pal[2])},${rgb(pal[0])} 45%,${rgb(pal[1])})"></span><span class="cn" style="color:${RARITY[t.rar][1]}">${t.name}</span>${own?'':`<span class="lk">${ICON_SVG.lock}</span>`}`;
      b.onclick=()=>{audio();sfx.btn();COL.sel=t.id;setSwirl(t.id,2);if(own){P().theme=t.id;persist();BASE_SWIRL=t.id;}else setTimeout(()=>setSwirl(BASE_SWIRL),1600);renderCollection();};
      PG.appendChild(b);
    });
    const t=THEMES.find(x=>x.id===(COL.sel||themePalette()))||THEMES[0];const [rn,rc]=RARITY[t.rar];const own=P().themes.includes(t.id);
    CP.innerHTML=`<span><b>${t.name}</b> <span class="rar" style="--rc:${rc}">${rn}</span></span><small>${own?(themePalette()===t.id?'In use':'Tap to use'):'Found in booster packs'}</small>`;
  }
}

/* ---------- cheat sheets ---------- */
const CHEAT_TABS=[['hands','Starting hands'],['ranks','Hand rankings'],['odds','Outs & odds'],['pot','Pot odds'],['play','Strategy'],['words','Glossary']];
function openCheats(tab='hands'){
  openSheet('Cheat sheets',true);const B=$('#sheetBody');
  B.innerHTML=`<div class="tabs" role="tablist">${CHEAT_TABS.map(([k,l])=>`<button class="tab" role="tab" data-t="${k}" aria-selected="${k===tab}">${l}</button>`).join('')}</div><div class="cs" id="csBody"></div>`;
  B.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{sfx.btn();B.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));renderCheat(t.dataset.t);});
  renderCheat(tab);
}
function renderCheat(t){
  const C=$('#csBody');C.innerHTML='';
  if(t==='hands'){
    const mine=G&&!G.dead&&G.human.hand.length===2&&!(G.rule.fog&&G.street===0)?handCode(G.human.hand):null;
    let g='<div class="hgrid">';
    for(let i=12;i>=0;i--)for(let j=12;j>=0;j--){
      const hi=Math.max(i,j),lo=Math.min(i,j),suited=j<i;const code=i===j?RANK_CH[i]+RANK_CH[j]:RANK_CH[hi]+RANK_CH[lo]+(suited?'s':'o');
      const tier=chenTier(chen(hi,lo,i!==j&&suited));g+=`<div style="background:${TIERS[tier][1]}" class="${code===mine?'me':''}">${code}</div>`;
    }
    g+='</div>';
    C.innerHTML=`<p>Pairs run down the diagonal. Above it are suited hands (s), below are offsuit (o).${mine?` Your current hand, <b>${mine}</b>, is outlined.`:''}</p>${g}
      <div class="legend" style="margin-top:10px">${TIERS.map(([n,c])=>`<span><i style="--lc:${c}"></i>${n}</span>`).join('')}</div>
      <div class="tipcard" style="margin-top:12px"><b>How to use it</b><span>With 1–2 opponents, play premium through playable. With 4–5 opponents, stick to premium and strong unless it's cheap to see a flop. Speculative hands (small pairs, suited connectors) want cheap flops and big pots when they hit.</span></div>`;
  }
  if(t==='ranks'){
    const ex=[['Royal Flush','A K Q J 10, same suit','0.003%',[50,46,42,38,34]],['Straight Flush','Five in a row, same suit','0.03%',[33,29,25,21,17]],
      ['Four of a Kind','Four of one rank','0.17%',[24,25,26,27,8]],['Full House','Three of a kind plus a pair','2.6%',[44,45,46,12,13]],['Flush','Any five of one suit','3.0%',[49,41,29,17,5]],
      ['Straight','Five ranks in a row','4.6%',[36,33,30,27,22]],['Three of a Kind','Three of one rank','4.8%',[28,29,30,51,6]],['Two Pair','Two different pairs','23.5%',[44,45,16,17,49]],
      ['Pair','Two of one rank','43.8%',[40,41,51,26,9]],['High Card','Nothing else','17.4%',[51,41,30,17,0]]];
    C.innerHTML='<p>Best to worst. The % is how often you finish with that hand by the river.</p><div class="ranks" id="rk"></div><p style="margin-top:10px">Ties are broken by the highest cards (kickers). The best five of your seven cards count.</p>';
    const R=$('#rk');ex.forEach(([n,sub,p,cards])=>{const row=document.createElement('div');row.className='rankrow';const cs=document.createElement('div');cs.className='cards';
      cards.forEach(c=>{const el=staticCard(c,'xs');el.style.setProperty('--w','24px');cs.appendChild(el);});row.appendChild(cs);
      row.insertAdjacentHTML('beforeend',`<div class="nm2">${n}<span>${sub}</span></div><div class="pct">${p}</div>`);R.appendChild(row);});
  }
  if(t==='odds'){
    let rows='';for(let o=1;o<=15;o++) rows+=`<tr><td class="hl">${o}</td><td>${pct(hitChance(o,4))}</td><td>${pct(hitChance(o,3))}</td><td>${o*2}% / ${o*4}%</td></tr>`;
    C.innerHTML=`<p><b>Outs</b> are the unseen cards that improve you to a likely winner. Count them, then read your chance below.</p>
      <table class="ctable"><tr><th>Outs</th><th>Next card</th><th>Flop to river</th><th>Rule of 2 / 4</th></tr>${rows}</table>
      <div class="tipcard" style="margin-top:12px"><b>Rule of 2 and 4</b><span>On the flop, outs × 4 ≈ your % to hit by the river. On the turn, outs × 2 ≈ your % to hit on the river.</span></div>
      <div class="tipcard" style="margin-top:8px"><b>Common draws</b><span>Flush draw: 9 outs (35% from the flop). Open-ended straight: 8 outs (32%). Gutshot straight: 4 outs (17%). Two overcards: 6 outs (24%). Flush + straight draw: 15 outs (54%).</span></div>`;
  }
  if(t==='pot'){
    const sizes=[['¼ pot',.25],['⅓ pot',1/3],['½ pot',.5],['⅔ pot',2/3],['¾ pot',.75],['Pot',1],['2× pot',2]];
    C.innerHTML=`<p><b>Pot odds</b> tell you how often you need to win for a call to break even: <b>call ÷ (pot after you call)</b>.</p>
      <p>Example: the pot is $60 and they bet $20, so the pot is $80. You call $20 to win $80: $20 ÷ $100 = 20%.</p>
      <table class="ctable"><tr><th>They bet</th><th>You need</th><th>Roughly</th></tr>${sizes.map(([l,f])=>{const r=f/(1+2*f);return `<tr><td>${l}</td><td class="hl">${pct(r)}</td><td>${freq(r)}</td></tr>`;}).join('')}</table>
      <div class="tipcard" style="margin-top:12px"><b>The habit to build</b><span>Before every call: estimate your odds, compare them to the break-even number, and call only when your odds are higher. Big bets usually mean strong hands, so shade your odds down when facing them.</span></div>`;
  }
  if(t==='play'){
    C.innerHTML=`${[['Position','Acting last is a big edge: you see what others do first. Play more hands on the dealer button, fewer in the blinds.'],
      ['Value betting','When you think you have the best hand, bet. Checking strong hands gives free cards and wins smaller pots.'],
      ['Bluffing','Bluff against one or two players, on scary boards, against players who fold. Never bluff a fish.'],
      ['Facing a raise','Raises mean strength more often than not. Fold medium hands to big raises from tight players.'],
      ['Fish','Call too much. Bet bigger for value; don\'t bluff.'],['Rock','Fold too much. Steal their blinds; respect their raises.'],
      ['Regular','Plays by the odds. Vary your bet sizes.'],['Shark','Reads bet sizes and bluffs well. Avoid big pots without big hands.'],
      ['Maniac','Bets and raises constantly. Call down with decent hands and let them hang themselves.']]
      .map(([b,s])=>`<div class="tipcard" style="margin-bottom:8px"><b>${b}</b><span>${s}</span></div>`).join('')}`;
  }
  if(t==='words'){
    C.innerHTML=`<dl>${[['Equity','Your share of the pot if all the cards were dealt out: your chance to win.'],['Pot odds','The break-even win chance for a call.'],
      ['Outs','Unseen cards that improve your hand.'],['Expected value (EV)','The average result of a choice if you made it many times. Positive is profitable.'],
      ['Accuracy','How close your choices were to the best one, on a 0–100 scale like chess analysis.'],['Value bet','Betting a strong hand so worse hands pay you.'],
      ['Bluff','Betting a weak hand so better hands fold.'],['Semi-bluff','Betting a draw: it can win now or improve later.'],['Kicker','The side card that breaks ties between equal pairs.'],
      ['Nuts','The best possible hand on this board.'],['Check-raise','Checking, then raising after someone bets.'],['Blinds','Forced bets that start each pot.'],
      ['Ante','A small forced bet from everyone each hand.'],['Range','All the hands a player might have in a spot.']]
      .map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  }
}

/* ---------- move class legend in settings is the review sheet itself ---------- */
function openHowGraded(){
  openSheet('How grading works',false);
  $('#sheetBody').innerHTML=`<p class="note" style="color:#dfe4ec">Every decision is scored by comparing the average result of each option you had (fold, call, check, bet sizes) using only what you could see. Your accuracy is like a chess engine's: 100 means you picked the best option every time.</p>
   <div class="ranks">${CLS_ORDER.map(k=>`<div class="rankrow">${clsIcon(k,26)}<div class="nm2">${CLS[k].n}<span>${{master:'The best move, and a hard one: a well-timed bluff or a brave correct call.',best:'The option with the highest average result.',excellent:'Within a few percent of the best.',good:'Small leak, fine to make.',inacc:'Costs a noticeable slice of the pot.',mistake:'Costs a big piece of the pot.',blunder:'Costs half the pot or more on average.'}[k]}</span></div></div>`).join('')}</div>`;
}

/* =====================================================================
   WIRING
   ===================================================================== */
$('#modeQuick').onclick=()=>{audio();sfx.btn();renderHome('quick');};
$('#modeCamp').onclick=()=>{audio();sfx.btn();renderHome('camp');};
$('#antePrev').onclick=()=>{sfx.btn();HOME.ante=Math.max(0,HOME.ante-1);HOME.sel=null;renderCampPanel();};
$('#anteNext').onclick=()=>{sfx.btn();HOME.ante=Math.min(ANTES.length-1,HOME.ante+1);HOME.sel=null;renderCampPanel();};
$('#primaryBtn').onclick=()=>{audio();sfx.raise();if(HOME.mode==='camp'){if(HOME.sel!=null) startMatch(campaignConfig(HOME.ante,HOME.sel));}else startMatch(quickConfig());};
$('#collectionBtn').onclick=()=>{audio();sfx.btn();openCollection();};
$('#colPrev').onclick=()=>{sfx.btn();COL.page--;COL.sel=null;renderCollection();};
$('#colNext').onclick=()=>{sfx.btn();COL.page++;COL.sel=null;renderCollection();};
$('#colBack').onclick=()=>{sfx.btn();closeCollection();};
$('#menuBtn').onclick=()=>{audio();sfx.btn();openMenu();};
$('#cheatBtn').onclick=()=>{audio();sfx.btn();openCheats();};
document.addEventListener('pointerdown',()=>audio(),{once:true});
if('serviceWorker' in navigator&&location.protocol==='https:'&&!/claude\.ai|claudeusercontent/.test(location.hostname)){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

/* ---------- what would have happened if you hadn't folded (uses the real next cards) ---------- */
function wouldHaveWon(contenders){
  const deck=G.deck.slice();const board=G.board.slice();
  if(board.length===0){deck.pop();board.push(deck.pop(),deck.pop(),deck.pop());}
  while(board.length<5){deck.pop();board.push(deck.pop());}
  const mine=evalHand(G.human.hand.concat(board));
  const rivals=(contenders.length?contenders:G.players.filter(p=>!p.human&&!p.out&&p.hand.length)).filter(p=>!p.human);
  let best=null,bestV=-1;rivals.forEach(p=>{const v=evalHand(p.hand.concat(board));if(v>bestV){bestV=v;best=p;}});
  if(!best) return null;
  const mineName=shortName(mine).toLowerCase(),theirs=shortName(bestV).toLowerCase();
  if(mine>bestV) return {won:true,short:'Fold cost you the pot',text:`If you'd stayed in, you would have <b>won</b> with ${mineName} against ${best.name}'s ${theirs}. Folding can still be right if the price was too high.`};
  if(mine===bestV) return {won:true,short:'You’d have split it',text:`If you'd stayed in, you would have split the pot with ${best.name} (${theirs}).`};
  return {won:false,short:'Good fold!',text:`Good fold: you would have <b>lost</b> to ${best.name}'s ${theirs} with your ${mineName}.`};
}

/* ---------- Joker coach ---------- */
const JOKER=[
 "Y.........Y","GG.......PP",".GGG...PPP.","..GGGGPPP..",".YYYYYYYYY.",".SSSSSSSSS.",
 "SWKWSSSWKWS",".SSSSRSSSS.",".SKSSSSSKS.","..SKKKKKS..","...SSSSS...","..WWRWRWW.."
];
const JCOL={Y:'#f8b229',G:'#2fae70',P:'#9a6cf0',S:'#f3d2b0',W:'#ffffff',K:'#17131f',R:'#ef4f45'};
const JOKER_SVG=(()=>{let r='';JOKER.forEach((row,y)=>[...row].forEach((ch,x)=>{if(JCOL[ch]) r+=`<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${JCOL[ch]}"/>`;}));return `<svg viewBox="0 0 11 12" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;})();
function strengthWord(d){
  if(d.board.length===0){const h=d.hole;if(h.length<2) return 'a mystery hand (one card is hidden)';
    const t=chenTier(chen(Math.max(rankOf(h[0]),rankOf(h[1])),Math.min(rankOf(h[0]),rankOf(h[1])),suitOf(h[0])===suitOf(h[1])&&rankOf(h[0])!==rankOf(h[1])));
    return ['a premium','a strong','a playable','a speculative','a weak'][t]+' starting hand';}
  const rel=d.eqA*(d.nOpp+1);
  if(rel>=1.8) return 'a very strong hand here';
  if(rel>=1.25) return 'a good hand here';
  if(d.outs>=8) return 'a drawing hand';
  if(rel>=.85) return 'a middling hand here';
  return 'a weak hand here';
}
function coachText(d){
  const out=[];const showName=S().handName&&!G.rule.noLabel&&!d.fogged;
  const name=d.board.length?shortName(evalHand(d.hole.concat(d.board))).toLowerCase():(d.hole.length===2?preflopName(d.hole):'');
  out.push(showName&&d.hole.length===2?`You have ${name}. That's ${strengthWord(d)}.`:`You hold ${strengthWord(d)}.`);
  if(d.outs) out.push(`You have <b>${d.outs} outs</b> (${d.outKinds.slice(0,2).join(', ')}), about ${pct(hitChance(d.outs,d.board.length))} to improve by the river.`);
  out.push(`It wins about <b>${pct(d.eqA)}</b> against ${d.nOpp>1?`${d.nOpp} random hands`:'a random hand'}${d.eqA<d.eq-.025?' (less than usual, because a bet this big usually means strength)':''}.`);
  if(d.toCall>0) out.push(`Calling costs ${money(d.toCall)} to win ${money(d.pot)}, so you need to win <b>${pct(d.req)}</b> of the time.`);
  const opts=evOptions(d);const best=opts.reduce((a,b)=>b.ev>a.ev?b:a,opts[0]);
  let adv;
  if(best.k==='fold') adv=`My advice: <b>fold</b>. It isn't worth the price.`;
  else if(best.k==='check') adv=`My advice: <b>check</b> and see what comes for free.`;
  else if(best.k==='call') adv=`My advice: <b>call</b>. The price is right.`;
  else{const bet=best.to;const frac=(bet-d.currentBet)/Math.max(1,d.pot+d.toCall);
    const sz=best.to>=d.maxTo?'all in':frac<.6?'about half the pot':frac<.85?'about two-thirds of the pot':'about the size of the pot';
    adv=`My advice: <b>${d.currentBet?'raise':'bet'} ${sz}</b> (${money(bet)}). ${d.eqA*(d.nOpp+1)>=1.25?'Make worse hands pay.':'Pressure can make them fold.'}`;}
  out.push(adv);
  return out;
}
function renderCoach(d){
  const C=$('#coach');
  if(!S().jcoach||G.cfg.mode!=='quick'||G.rule.noHud){C.hidden=true;return;}
  $('#hud').hidden=true;
  C.hidden=false;C.innerHTML=`<div class="jk">${JOKER_SVG}</div><div class="jt">${coachText(d).map(t=>`<span>${t}</span>`).join(' ')}</div>`;
  C.classList.remove('in');void C.offsetWidth;C.classList.add('in');
}
