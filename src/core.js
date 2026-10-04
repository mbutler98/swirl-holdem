"use strict";
/* =====================================================================
   CARDS + HAND EVALUATION   card int = rank*4 + suit (rank 0..12 = 2..A; suit s h d c)
   ===================================================================== */
const RANK_LABEL=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RANK_CH=['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const RANK_NAME=['Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Jack','Queen','King','Ace'];
const RANK_PL=['Twos','Threes','Fours','Fives','Sixes','Sevens','Eights','Nines','Tens','Jacks','Queens','Kings','Aces'];
const CAT_NAMES=['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'];
const SUIT_WORD=['spades','hearts','diamonds','clubs'];
const SUIT_CH=['♠','♥','♦','♣'];
const STREETS=['Preflop','Flop','Turn','River'];
const rankOf=c=>c>>2, suitOf=c=>c&3;
const cardTxt=c=>RANK_LABEL[rankOf(c)]+SUIT_CH[suitOf(c)];
const P16=[1048576,65536,4096,256,16,1];

function straightHigh(m){for(let h=12;h>=4;h--){const w=0x1F<<(h-4);if((m&w)===w) return h;} if((m&0x100F)===0x100F) return 3; return -1;}
function pack(cat,ks){let v=cat;for(let i=0;i<5;i++) v=v*16+((ks[i]===undefined?-1:ks[i])+1);return v;}
function catOf(v){return Math.floor(v/1048576);}
function kOf(v,i){return (Math.floor(v/P16[i+1])%16)-1;}
function evalHand(cards){
  const cnt=[0,0,0,0,0,0,0,0,0,0,0,0,0],sc=[0,0,0,0],sm=[0,0,0,0];let all=0;
  for(let i=0;i<cards.length;i++){const c=cards[i],r=c>>2,s=c&3;cnt[r]++;sc[s]++;sm[s]|=1<<r;all|=1<<r;}
  let fs=-1;for(let s=0;s<4;s++) if(sc[s]>=5) fs=s;
  if(fs>=0){const sh=straightHigh(sm[fs]);if(sh>=0) return pack(8,[sh]);}
  const quads=[],trips=[],pairs=[];
  for(let r=12;r>=0;r--){const n=cnt[r];if(n===4)quads.push(r);else if(n===3)trips.push(r);else if(n===2)pairs.push(r);}
  if(quads.length){const q=quads[0];let k=-1;for(let r=12;r>=0;r--) if(r!==q&&cnt[r]){k=r;break;} return pack(7,[q,k]);}
  if(trips.length&&(trips.length>1||pairs.length)){const t=trips[0];const p=Math.max(trips.length>1?trips[1]:-1,pairs.length?pairs[0]:-1);return pack(6,[t,p]);}
  if(fs>=0){const ks=[];for(let r=12;r>=0&&ks.length<5;r--) if(sm[fs]&(1<<r)) ks.push(r);return pack(5,ks);}
  const sh=straightHigh(all);if(sh>=0) return pack(4,[sh]);
  if(trips.length){const t=trips[0],ks=[t];for(let r=12;r>=0&&ks.length<3;r--) if(r!==t&&cnt[r]) ks.push(r);return pack(3,ks);}
  if(pairs.length>=2){const a=pairs[0],b=pairs[1];let k=-1;for(let r=12;r>=0;r--) if(r!==a&&r!==b&&cnt[r]){k=r;break;} return pack(2,[a,b,k]);}
  if(pairs.length){const p=pairs[0],ks=[p];for(let r=12;r>=0&&ks.length<4;r--) if(r!==p&&cnt[r]) ks.push(r);return pack(1,ks);}
  const ks=[];for(let r=12;r>=0&&ks.length<5;r--) if(cnt[r]) ks.push(r);return pack(0,ks);
}
function handTitle(v){const c=catOf(v);if(c===8&&kOf(v,0)===12) return 'Royal Flush';return CAT_NAMES[c];}
function handDetail(v){
  const c=catOf(v),k0=kOf(v,0),k1=kOf(v,1);
  switch(c){
    case 8:case 4:case 5:return `${RANK_NAME[k0]} high`;
    case 7:return `Four ${RANK_PL[k0]}`;
    case 6:return `${RANK_PL[k0]} full of ${RANK_PL[k1]}`;
    case 3:return `Three ${RANK_PL[k0]}`;
    case 2:return `${RANK_PL[k0]} and ${RANK_PL[k1]}`;
    case 1:return `Pair of ${RANK_PL[k0]}`;
    default:return `${RANK_NAME[k0]} high`;
  }
}
function shortName(v){const c=catOf(v);return [0,1,2,3,7].includes(c)?handDetail(v):handTitle(v);}
function preflopName(h){
  const a=Math.max(rankOf(h[0]),rankOf(h[1])),b=Math.min(rankOf(h[0]),rankOf(h[1]));
  if(a===b) return `Pocket ${RANK_PL[a]}`;
  return `${RANK_LABEL[a]}-${RANK_LABEL[b]} ${suitOf(h[0])===suitOf(h[1])?'suited':'offsuit'}`;
}
function handCode(h){const a=Math.max(rankOf(h[0]),rankOf(h[1])),b=Math.min(rankOf(h[0]),rankOf(h[1]));return a===b?RANK_CH[a]+RANK_CH[b]:RANK_CH[a]+RANK_CH[b]+(suitOf(h[0])===suitOf(h[1])?'s':'o');}
function best5(cards){
  if(cards.length<=5) return cards.slice();
  let best=-1,bc=null;const n=cards.length;
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)for(let d=c+1;d<n;d++)for(let e=d+1;e<n;e++){
    const h=[cards[a],cards[b],cards[c],cards[d],cards[e]];const v=evalHand(h);if(v>best){best=v;bc=h;}}
  return bc;
}
/* Chen formula for the starting-hand chart (r: 0..12) */
function chen(hi,lo,suited){
  const pts=r=>r===12?10:r===11?8:r===10?7:r===9?6:(r+2)/2;
  let s=pts(hi);
  if(hi===lo) return Math.max(5,s*2);
  if(suited) s+=2;
  const gap=hi-lo-1;
  s-=gap===0?0:gap===1?1:gap===2?2:gap===3?4:5;
  if(gap<=1&&hi<10) s+=1;
  return Math.ceil(s);
}
function chenTier(score){return score>=10?0:score>=8?1:score>=6?2:score>=5?3:4;}
const TIERS=[['Premium','#e2364a'],['Strong','#ee8516'],['Playable','#c9a227'],['Speculative','#2fae70'],['Usually fold','#3a4454']];

/* ---------- odds ---------- */
function freshDeckExcluding(used){const s=new Set(used),d=[];for(let c=0;c<52;c++) if(!s.has(c)) d.push(c);return d;}
function equityRandom(hole,board,nOpp,iters){
  const deck=freshDeckExcluding(hole.concat(board));const need=5-board.length;const missing=2-hole.length;
  const draw=need+2*nOpp+missing;let score=0;const L=deck.length;
  for(let it=0;it<iters;it++){
    for(let i=0;i<draw;i++){const j=i+Math.floor(Math.random()*(L-i));const t=deck[i];deck[i]=deck[j];deck[j]=t;}
    const full=board.concat(deck.slice(0,need));
    const mineCards=missing?hole.concat(deck.slice(need+2*nOpp,need+2*nOpp+missing)):hole;
    const mine=evalHand(mineCards.concat(full));let ties=0,lose=false;
    for(let o=0;o<nOpp;o++){const ov=evalHand([deck[need+2*o],deck[need+2*o+1]].concat(full));if(ov>mine){lose=true;break;} if(ov===mine) ties++;}
    if(!lose) score+=1/(ties+1);
  }
  return score/iters;
}
function equityKnown(hands,board,iters=1500){
  const used=board.slice();hands.forEach(h=>used.push(h[0],h[1]));
  const deck=freshDeckExcluding(used);const need=5-board.length;const eq=hands.map(()=>0);let n=0;
  const score=full=>{const vals=hands.map(h=>evalHand(h.concat(full)));const m=Math.max(...vals);
    const w=vals.reduce((a,v)=>a+(v===m?1:0),0);vals.forEach((v,i)=>{if(v===m) eq[i]+=1/w;});n++;};
  if(need===0) score(board);
  else if(need===1) deck.forEach(c=>score(board.concat([c])));
  else if(need===2){for(let i=0;i<deck.length;i++)for(let j=i+1;j<deck.length;j++) score(board.concat([deck[i],deck[j]]));}
  else{const L=deck.length;for(let it=0;it<iters;it++){for(let i=0;i<need;i++){const j=i+Math.floor(Math.random()*(L-i));const t=deck[i];deck[i]=deck[j];deck[j]=t;} score(board.concat(deck.slice(0,need)));}}
  return eq.map(x=>x/n);
}
function countOuts(hole,board){
  if(hole.length<2||board.length<3||board.length>4) return {n:0,kinds:[]};
  const curCat=catOf(evalHand(hole.concat(board)));const used=new Set(hole.concat(board));let n=0;const kinds=new Set();
  for(let c=0;c<52;c++){
    if(used.has(c)) continue;
    const nc=catOf(evalHand(hole.concat(board,[c])));if(nc<=curCat) continue;
    if(catOf(evalHand(board.concat([c])))>=nc) continue;
    n++;kinds.add(nc===5?'flush':nc===4?'straight':nc>=6?'full house+':nc===3?'trips':nc===2?'two pair':'pair');
  }
  return {n,kinds:[...kinds]};
}
function hitChance(outs,boardLen){if(boardLen===3) return 1-((47-outs)/47)*((46-outs)/46);if(boardLen===4) return outs/46;return 0;}

/* =====================================================================
   FORMATTING
   ===================================================================== */
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const smoney=n=>(n>0.5?'+':n<-0.5?'−':'')+money(Math.abs(n));
const pct=x=>Math.round(x*100)+'%';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
/* "about 4 in 10" phrasing that reads easier than a bare percentage */
function freq(x){
  if(x>=.995) return 'nearly every time';
  if(x<.015) return 'almost never';
  if(x>=.95) return `${Math.round(x*20)} in 20`;
  if(x>=.1){const t=Math.round(x*10);return t>=10?'9 in 10':`${Math.max(1,t)} in 10`;}
  return `1 in ${Math.round(1/x)}`;
}

/* =====================================================================
   SETTINGS + STORAGE
   ===================================================================== */
const STORE_KEY='swirlholdem_v2';
const DEFAULTS={
  settings:{opp:3,diff:'mixed',coach:true,hud:false,handName:true,thoughts:false,music:true,track:'dirty',sound:true,fast:false,autoNext:true,jcoach:true,reveal:true,cardStyle:'classic'},
  prog:{xp:0,level:1,theme:'rabbit',themes:['felt','rabbit'],charm:0,pity:0,quests:[],packs:0,totalScore:0},
  stats:{hands:0,won:0,net:0,vpip:0,accSum:0,accN:0,cls:{master:0,best:0,excellent:0,good:0,inacc:0,mistake:0,blunder:0},bigHands:0,allinWins:0,streak:0,bestStreak:0},
  campaign:{beaten:[]},
  unlocked:['classic','steel','neon','retro','duelist','trainer','spell']
};
function load(){
  try{const s=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
    if(s) return {settings:{...DEFAULTS.settings,...s.settings},stats:{...DEFAULTS.stats,...s.stats,cls:{...DEFAULTS.stats.cls,...(s.stats&&s.stats.cls)}},
      campaign:{...DEFAULTS.campaign,...s.campaign},prog:{...DEFAULTS.prog,...s.prog},unlocked:[...new Set([...DEFAULTS.unlocked,...(s.unlocked||[])])]};}catch(e){}
  return JSON.parse(JSON.stringify(DEFAULTS));
}
function migrate(sv){if(!sv.prog.themes.includes('rabbit')) sv.prog.themes.push('rabbit');if(sv.settings.music===false&&!sv._m){sv.settings.track='off';}sv._m=1;return sv;}
let SAVE=migrate(load());
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(SAVE));}catch(e){}}
const S=()=>SAVE.settings;

/* =====================================================================
   AUDIO: sound effects + generative chiptune music
   ===================================================================== */
let AC=null,SFX=null,MUS=null,NOISE=null;
function audio(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();SFX=AC.createGain();SFX.gain.value=.9;SFX.connect(AC.destination);
    MUS=AC.createGain();MUS.gain.value=0;MUS.connect(AC.destination);
    NOISE=AC.createBuffer(1,AC.sampleRate*.25,AC.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  }catch(e){AC=null;}}
  if(AC&&AC.state==='suspended') AC.resume();
  if(AC&&S().track!=='off') Music.start();
  return AC;
}
function tone(freq,dur,type='square',vol=.06,when=0,slide=0,dest){
  if(!AC||(!dest&&!S().sound)) return;
  const t=(when>10?when:AC.currentTime+when),o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(dest||SFX);o.start(t);o.stop(t+dur+.03);
}
function noiseHit(t,dur,vol,hp=6000){
  if(!AC) return;const s=AC.createBufferSource();s.buffer=NOISE;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp;
  const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(g).connect(MUS);s.start(t);s.stop(t+dur+.02);
}
const sfx={
  deal(){tone(900+Math.random()*300,.05,'square',.03);},
  flip(){tone(500,.06,'triangle',.06,0,400);},
  chip(){tone(1500,.04,'triangle',.05);tone(2100,.05,'triangle',.04,.04);},
  btn(){tone(330,.05,'square',.035);},
  check(){tone(260,.07,'square',.045);tone(260,.07,'square',.045,.08);},
  fold(){tone(300,.15,'sawtooth',.03,0,-180);},
  raise(){tone(440,.07,'square',.05);tone(660,.09,'square',.05,.07);},
  allin(){tone(110,.35,'sawtooth',.08,0,-60);tone(220,.3,'square',.04,.05);},
  win(){[523,659,784,1046,1318].forEach((f,i)=>tone(f,.14,'square',.05,i*.08));},
  bigwin(){[392,523,659,784,1046,1318,1568].forEach((f,i)=>tone(f,.16,'square',.06,i*.07));tone(130,.6,'triangle',.08);},
  lose(){[392,330,262].forEach((f,i)=>tone(f,.18,'triangle',.06,i*.12));},
  tick(){tone(1200,.025,'square',.022);},
  blinds(){[300,450,600].forEach((f,i)=>tone(f,.1,'square',.05,i*.09));},
  hit(){tone(160,.18,'sawtooth',.08,0,-90);tone(90,.25,'square',.05,.03);},
  unlock(){[659,784,988,1318,1568,1976].forEach((f,i)=>tone(f,.12,'triangle',.06,i*.06));},
  pack(){[523,659,784,1046].forEach((f,i)=>{tone(f,.14,'triangle',.07,i*.09);tone(f*2,.08,'square',.02,i*.09+.04);});tone(1568,.3,'triangle',.05,.4);},
  sparkle(){[1318,1568,2093,1760,2349,2637].forEach((f,i)=>tone(f,.09,'triangle',.045,i*.07));},
  boss(){[110,104,98,92].forEach((f,i)=>tone(f,.3,'sawtooth',.07,i*.18));tone(55,1.2,'square',.05,.1);}
};
const mtof=m=>440*Math.pow(2,(m-69)/12);
const Music={
  on:false,theme:'menu',timer:null,next:0,step:0,mel:null,bar:0,
  themes:{
    menu:{bpm:86,prog:[[48,52,55,59],[57,60,64,67],[53,57,60,64],[55,59,62,65]],scale:[0,2,4,7,9],root:60,bass:'triangle',kick:false,swing:.12},
    table:{bpm:94,prog:[[57,60,64,67],[50,53,57,60],[55,59,62,65],[48,52,55,59]],scale:[0,3,5,7,10],root:57,bass:'triangle',kick:false,swing:.16},
    boss:{bpm:128,prog:[[52,55,59],[48,52,55],[50,54,57],[47,51,54,57]],scale:[0,2,3,7,8],root:52,bass:'sawtooth',kick:true,swing:0}
  },
  el:null,
  start(){if(!AC||this.on||S().track==='off') return;this.on=true;
    MUS.gain.cancelScheduledValues(AC.currentTime);
    if(S().track==='dirty'){
      if(!this.el){this.el=new Audio('dirty-rat.m4a');this.el.loop=true;this.el.preload='auto';this.el.setAttribute('playsinline','');
        try{AC.createMediaElementSource(this.el).connect(MUS);}catch(e){}}
      MUS.gain.setTargetAtTime(.5,AC.currentTime,.4);this.el.play().catch(()=>{this.on=false;});return;}
    this.next=AC.currentTime+.08;this.step=0;this.bar=0;this.mel=null;
    MUS.gain.setTargetAtTime(.55,AC.currentTime,.6);
    this.timer=setInterval(()=>this.tick(),30);},
  stop(){if(!this.on) return;this.on=false;clearInterval(this.timer);this.timer=null;if(this.el) this.el.pause();if(AC) MUS.gain.setTargetAtTime(0,AC.currentTime,.2);},
  setTrack(t){S().track=t;persist();this.stop();if(t!=='off'){audio();this.start();}},
  setTheme(name){if(this.theme===name) return;this.theme=name;this.mel=null;this.step=0;this.bar=0;if(AC&&this.on) this.next=AC.currentTime+.1;},
  makeMel(T){const m=[];let deg=2;for(let i=0;i<32;i++){if(Math.random()<(i%2?.38:.62)){deg=clamp(deg+pick([-2,-1,-1,1,1,2,0]),0,9);m.push(deg);}else m.push(null);}return m;},
  tick(){
    const T=this.themes[this.theme];const sd=60/T.bpm/2;
    while(this.next<AC.currentTime+.15){
      const t=this.next+(this.step%2?T.swing*sd:0);const st=this.step%8;const bar=Math.floor(this.step/8)%4;
      if(!this.mel||(this.step%32===0&&++this.bar%4===0)) this.mel=this.makeMel(T);
      const ch=T.prog[bar];
      if(st===0||st===3||st===4||st===6){const n=(st===4?ch[2]:ch[0])-12;tone(mtof(n),sd*1.6,T.bass,T.kick?.07:.11,t,0,MUS);}
      if(st===2||st===6){ch.forEach(n=>tone(mtof(n),sd*.55,'square',.012,t,0,MUS));}
      const d=this.mel[this.step%32];
      if(d!=null){const sc=T.scale;const n=T.root+12+sc[d%5]+12*Math.floor(d/5);tone(mtof(n),sd*.9,'square',.022,t,0,MUS);}
      noiseHit(t,.03,st%2?.03:.015);
      if(T.kick&&(st===0||st===4)){tone(140,.18,'sine',.16,t,-100,MUS);}
      if(T.kick&&(st===2||st===6)) noiseHit(t,.09,.05,1800);
      this.next+=sd;this.step++;
    }
  }
};
document.addEventListener('visibilitychange',()=>{if(!AC) return;if(document.hidden){AC.suspend();if(Music.el) Music.el.pause();}else{AC.resume();if(Music.on&&Music.el&&S().track==='dirty') Music.el.play().catch(()=>{});}});

/* =====================================================================
   BACKGROUND SWIRL (WebGL)
   ===================================================================== */
const SWIRL={tgt:null,cur:null,spin:1};
const PALETTES={
  menu:[[0.42,0.20,0.78],[0.04,0.04,0.16],[0.98,0.55,0.18]],
  table:[[0.18,0.52,0.42],[0.06,0.20,0.18],[0.32,0.70,0.55]],
  boss:[[0.62,0.12,0.14],[0.08,0.03,0.05],[0.95,0.35,0.20]],
  win:[[0.85,0.60,0.15],[0.30,0.16,0.05],[1.0,0.88,0.50]],
  lose:[[0.72,0.20,0.18],[0.20,0.06,0.09],[1.0,0.45,0.35]],
  allin:[[0.50,0.28,0.85],[0.10,0.06,0.22],[0.95,0.40,0.55]],
  shop:[[0.40,0.25,0.75],[0.08,0.06,0.20],[0.95,0.55,0.85]]
};
let BASE_SWIRL='menu';
function setSwirl(name,kick=0){SWIRL.tgt=PALETTES[name].map(c=>c.slice());if(!SWIRL.cur) SWIRL.cur=PALETTES[name].map(c=>c.slice());SWIRL.spin+=kick;}
function baseSwirl(name,kick=0){BASE_SWIRL=name;setSwirl(name,kick);}
let swirlTimer=null;
function flashSwirl(name,ms=2600,kick=2){setSwirl(name,kick);clearTimeout(swirlTimer);swirlTimer=setTimeout(()=>setSwirl(BASE_SWIRL),ms);}
(function initSwirl(){
  const cv=document.getElementById('bg');const gl=cv.getContext('webgl',{antialias:false});
  setSwirl('menu');if(!gl) return;
  const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const fs=`precision mediump float;uniform float t;uniform vec2 res;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform float spin;
  void main(){vec2 uv=(gl_FragCoord.xy-.5*res)/min(res.x,res.y);float r=length(uv);float a=atan(uv.y,uv.x);
    a+=spin*(1.6-r)*1.1+t*.06;uv=vec2(cos(a),sin(a))*r*3.2;vec2 p=uv;
    for(int i=0;i<5;i++){float fi=float(i);p+=vec2(sin(p.y*1.25+t*.33+fi*1.3),cos(p.x*1.05-t*.27+fi*1.9))*.42;}
    float v=sin(p.x+p.y)*.5+.5;float w=sin(length(p)*1.6-t*.45)*.5+.5;
    vec3 col=mix(c2,c1,smoothstep(.15,.85,v));col=mix(col,c3,smoothstep(.62,.95,w*v)*.85);col=floor(col*9.)/9.;
    gl_FragColor=vec4(col,1.);}`;
  const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return;
  gl.useProgram(pr);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const U=n=>gl.getUniformLocation(pr,n);const ut=U('t'),ur=U('res'),u1=U('c1'),u2=U('c2'),u3=U('c3'),us=U('spin');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let acc=0,last=performance.now();
  function size(){cv.width=Math.max(60,Math.round(innerWidth/5));cv.height=Math.max(60,Math.round(innerHeight/5));gl.viewport(0,0,cv.width,cv.height);}
  size();addEventListener('resize',size);
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!document.hidden){acc+=dt*(reduce?.15:1)*(1+(SWIRL.spin-1)*.6);SWIRL.spin+=(1-SWIRL.spin)*Math.min(1,dt*1.2);
      for(let i=0;i<3;i++)for(let j=0;j<3;j++) SWIRL.cur[i][j]+=(SWIRL.tgt[i][j]-SWIRL.cur[i][j])*Math.min(1,dt*2.2);
      gl.uniform1f(ut,acc);gl.uniform2f(ur,cv.width,cv.height);gl.uniform3fv(u1,SWIRL.cur[0]);gl.uniform3fv(u2,SWIRL.cur[1]);gl.uniform3fv(u3,SWIRL.cur[2]);
      gl.uniform1f(us,1+(SWIRL.spin-1)*.3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
    requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();

/* =====================================================================
   PIXEL GLYPHS (suits, ranks, icons)
   ===================================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function bitsSvg(rows,extra=''){let r='';rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='X') r+=`<rect x="${x}" y="${y}" width="1.04" height="1.04"/>`;}));
  return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true"${extra}>${r}</svg>`;}
const SUIT_BITS=[
 ["...X...","..XXX..",".XXXXX.","XXXXXXX","XXXXXXX","XX.X.XX","..XXX.."],
 [".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."],
 ["...X...","..XXX..",".XXXXX.","XXXXXXX",".XXXXX.","..XXX..","...X..."],
 ["..XXX..","..XXX..","XXXXXXX","XXXXXXX","XX.X.XX","...X...","..XXX.."]
];
const SUIT_SVG=SUIT_BITS.map(b=>bitsSvg(b));
/* 5x7 rank glyphs drawn for legibility: open-bottom 2, flat-top 5 */
const GLYPH={
 '0':[".XXX.","X...X","X..XX","X.X.X","XX..X","X...X",".XXX."],
 '1':["..X..",".XX..","..X..","..X..","..X..","..X..",".XXX."],
 '2':[".XXX.","X...X","....X","...X.","..X..",".X...","XXXXX"],
 '3':["XXXX.","....X","....X",".XXX.","....X","....X","XXXX."],
 '4':["...X.","..XX.",".X.X.","X..X.","XXXXX","...X.","...X."],
 '5':["XXXXX","X....","XXXX.","....X","....X","X...X",".XXX."],
 '6':["..XX.",".X...","X....","XXXX.","X...X","X...X",".XXX."],
 '7':["XXXXX","....X","...X.","..X..",".X...",".X...",".X..."],
 '8':[".XXX.","X...X","X...X",".XXX.","X...X","X...X",".XXX."],
 '9':[".XXX.","X...X","X...X",".XXXX","....X","...X.",".XX.."],
 'A':[".XXX.","X...X","X...X","XXXXX","X...X","X...X","X...X"],
 'K':["X...X","X..X.","X.X..","XX...","X.X..","X..X.","X...X"],
 'Q':[".XXX.","X...X","X...X","X...X","X.X.X","X..X.",".XX.X"],
 'J':["..XXX","...X.","...X.","...X.","...X.","X..X.",".XX.."]
};
function glyphSvg(text){
  const chars=[...text];let r='';
  chars.forEach((ch,i)=>{const g=GLYPH[ch];g.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='X') r+=`<rect x="${x+i*6}" y="${y}" width="1.06" height="1.06"/>`;}));});
  const w=chars.length*6-1;
  /* thicken: bold stroke via paint-order */
  return `<svg viewBox="-0.3 -0.3 ${w+.6} 7.6" shape-rendering="crispEdges" fill="currentColor" stroke="currentColor" stroke-width=".28" aria-hidden="true">${r}</svg>`;
}
const RANK_SVG=RANK_LABEL.map(glyphSvg);
const ICONS={
 fish:[".........",".........","..XXXX..X",".XXXXXXXX","XX.XXXXX.",".XXXXXXXX","..XXXX..X",".........","........."],
 wall:["XXXX.XXXX","XXXX.XXXX",".........","XX.XXXX.X","XX.XXXX.X",".........","XXXX.XXXX","XXXX.XXXX","........."],
 dice:["XXXXXXXXX","X.......X","X.X...X.X","X.......X","X...X...X","X.......X","X.X...X.X","X.......X","XXXXXXXXX"],
 eye:[".........","..XXXXX..",".X.....X.","X..XXX..X","X..XXX..X",".X.....X.","..XXXXX..",".........","........."],
 clock:["..XXXXX..",".X..X..X.","X...X...X","X...X...X","X...XXX.X","X.......X","X.......X",".X.....X.","..XXXXX.."],
 cloud:[".........","...XX....","..XXXX.X.",".XXXXXXXX","XXXXXXXXX","XXXXXXXXX",".........","X.X.X.X.X",".X.X.X.X."],
 mirror:["....X....","...XXX...","..XX.XX..",".XX...XX.","XX.....XX",".XX...XX.","..XX.XX..","...XXX...","....X...."],
 crown:[".........","X...X...X","XX.XXX.XX","XXXXXXXXX","XXXXXXXXX","XXXXXXXXX",".XXXXXXX.","XXXXXXXXX","........."],
 lock:["..XXX..",".X...X.",".X...X.","XXXXXXX","XXX.XXX","XXX.XXX","XXXXXXX"],
 star:["....X....","....X....","...XXX...","XXXXXXXXX",".XXXXXXX.","..XXXXX..","..XX.XX..",".XX...XX.","........."]
};
const ICON_SVG=Object.fromEntries(Object.entries(ICONS).map(([k,v])=>[k,bitsSvg(v)]));
(function backMask(){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" shape-rendering="crispEdges">${SUIT_BITS[0].map((row,y)=>[...row].map((ch,x)=>ch==='X'?`<rect x="${x}" y="${y}" width="1.03" height="1.03"/>`:'').join('')).join('')}</svg>`;
  document.documentElement.style.setProperty('--spademask',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
})();

/* =====================================================================
   CARD STYLES + CARD ELEMENTS
   ===================================================================== */
const RARITY={common:['Common','var(--r-common)'],rare:['Rare','var(--r-rare)'],epic:['Epic','var(--r-epic)'],legendary:['Legendary','var(--r-legendary)'],mythic:['Mythic','var(--r-mythic)']};
const CARD_STYLES=[
  {id:'classic',name:'Classic',rar:'common',req:'Starter deck'},
  {id:'retro',name:'Parlour',rar:'common',req:'Starter deck'},
  {id:'steel',name:'Steel',rar:'common',req:'Starter deck'},
  {id:'neon',name:'Neon',rar:'common',req:'Starter deck'},
  {id:'glass',name:'Glass',rar:'rare',req:'Beat The Big Fish (Ante 1 boss)'},
  {id:'frost',name:'Frost',rar:'rare',req:'Beat The Wall (Ante 2 boss)'},
  {id:'foil',name:'Foil',rar:'rare',req:'Beat The Gambler (Ante 3 boss)'},
  {id:'lava',name:'Lava',rar:'epic',req:'Beat The Shroud (Ante 4 boss)'},
  {id:'holo',name:'Holographic',rar:'epic',req:'Beat The Clock (Ante 5 boss)'},
  {id:'vapor',name:'Vaporwave',rar:'epic',req:'Play 50 hands'},
  {id:'negative',name:'Negative',rar:'epic',req:'Win a pot with a full house or better'},
  {id:'duelist',name:'Duelist',rar:'legendary',req:'Starter deck'},
  {id:'trainer',name:'Trainer',rar:'legendary',req:'Starter deck'},
  {id:'spell',name:'Spellcaster',rar:'legendary',req:'Starter deck'},
  {id:'gold',name:'Gilded',rar:'legendary',req:'Beat The Mirror (Ante 7 boss)'},
  {id:'polychrome',name:'Polychrome',rar:'legendary',req:'Beat The Fog (Ante 6 boss) or make 10 master moves'},
  {id:'mythic',name:'Mythic',rar:'mythic',req:'Beat The House (final boss)'}
];
const styleById=id=>CARD_STYLES.find(s=>s.id===id)||CARD_STYLES[0];
function makeCard(c,cls='',cs){
  const el=document.createElement('div');el.className='card '+cls;el.dataset.cs=cs||S().cardStyle;
  el.innerHTML='<div class="tilt"><div class="inner"><div class="face"></div><div class="back"></div></div></div>';
  if(c!=null) setFace(el,c);
  return el;
}
function setFace(el,c){
  const r=rankOf(c),s=suitOf(c),f=el.querySelector('.face');
  const stars=Math.min(12,Math.max(1,Math.ceil((r+2)/1.2)-1));
  f.innerHTML=`<span class="rk s${s}">${RANK_SVG[r]}</span><span class="pip s${s}">${SUIT_SVG[s]}</span><span class="big s${s}">${SUIT_SVG[s]}</span><span class="rk rk2 s${s}">${RANK_SVG[r]}</span>`+
   `<span class="dl s${s}"><span class="dl-name"><span class="g">${RANK_SVG[r]}</span><span class="dl-attr">${SUIT_SVG[s]}</span></span><span class="dl-stars">${'<i></i>'.repeat(stars)}</span><span class="dl-art">${SUIT_SVG[s]}</span><span class="dl-txt">ATK/${(r+2)*200} DEF/${(15-r)*100}</span></span>`+
   `<span class="tc s${s}"><span class="tc-top"><span class="g">${RANK_SVG[r]}</span><span class="hp">HP${(r+3)*10}</span><span class="en">${SUIT_SVG[s]}</span></span><span class="tc-art">${SUIT_SVG[s]}</span><span class="tc-move"><span class="en">${SUIT_SVG[s]}</span><span class="mv">${['Bluff','Check-Raise','Slow Play','All In'][s]}</span><b>${(r+2)*10}</b></span><span class="tc-foot">weak ×2 · retreat ●</span></span>`+
   `<span class="mg s${s}"><span class="mg-title"><span class="g">${RANK_SVG[r]}</span><span class="mana">${'<i></i>'.repeat(Math.min(4,1+Math.floor(r/4)))}</span></span><span class="mg-art">${SUIT_SVG[s]}</span><span class="mg-type">Creature · ${['Spade','Heart','Diamond','Club'][s]}</span><span class="mg-text">${['Whenever an opponent folds, draw a card.','Lifelink. Heals you for every pot won.','When this enters, add one gold.','Can block any number of bluffs.'][s]}</span><span class="mg-pt">${Math.ceil((r+2)/2)}/${Math.ceil((15-r)/2)}</span></span>`;
  el.dataset.card=c;el.setAttribute('aria-label',`${RANK_NAME[r]} of ${SUIT_WORD[s]}`);
}
function bobify(el){el.classList.add('bob');el.style.setProperty('--bd',rnd(2.4,3.4).toFixed(2)+'s');el.style.setProperty('--bdl',(-rnd(0,3)).toFixed(2)+'s');
  el.style.setProperty('--r0',rnd(-2.2,-.4).toFixed(2)+'deg');el.style.setProperty('--r1',rnd(.4,2.2).toFixed(2)+'deg');}
function staticCard(c,cls='xs',cs){return makeCard(c,cls+' up',cs);}
function applyCardStyle(id){S().cardStyle=id;persist();$$('.card').forEach(el=>{if(!el.dataset.fixed) el.dataset.cs=id;});}
function attachTilt(container){
  const mv=e=>{const c=e.target.closest('.card');if(!c) return;const r=c.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;const t=c.querySelector('.tilt');
    t.style.setProperty('--ry',(x*30).toFixed(1)+'deg');t.style.setProperty('--rx',(-y*30).toFixed(1)+'deg');};
  const out=()=>container.querySelectorAll('.tilt').forEach(t=>{t.style.setProperty('--rx','0deg');t.style.setProperty('--ry','0deg');});
  container.addEventListener('pointermove',mv);container.addEventListener('pointerdown',mv);
  ['pointerleave','pointerup','pointercancel'].forEach(ev=>container.addEventListener(ev,out));
}
function tokenEl(icon,color,size,text){
  const t=document.createElement('div');t.className='token';t.style.setProperty('--tc',color);if(size) t.style.setProperty('--ts',size+'px');
  t.innerHTML=icon?ICON_SVG[icon]:`<span class="tt">${text||''}</span>`;return t;
}

/* =====================================================================
   FX LAYER
   ===================================================================== */
const fx=$('#fx');
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const parts=$('#parts'),pctx=parts.getContext('2d');let PARTS=[],partsRunning=false;
function sizeParts(){const d=Math.min(2,devicePixelRatio||1);parts.width=innerWidth*d;parts.height=innerHeight*d;pctx.setTransform(d,0,0,d,0,0);}
sizeParts();addEventListener('resize',sizeParts);
function burst(x,y,n=30,colors=['#f8b229','#fff','#ef4f45','#1d9bf0'],power=1){
  if(reduceMotion()) n=Math.min(n,8);
  for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),sp=rnd(2,8)*power;PARTS.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rnd(2,5)*power,s:Math.round(rnd(3,7)),c:colors[i%colors.length],life:rnd(45,90),m:0});}
  if(!partsRunning){partsRunning=true;requestAnimationFrame(partsLoop);}
}
function partsLoop(){
  pctx.clearRect(0,0,innerWidth,innerHeight);PARTS=PARTS.filter(p=>p.m<p.life);
  for(const p of PARTS){p.m++;p.vy+=.28;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;pctx.globalAlpha=Math.max(0,1-p.m/p.life);pctx.fillStyle=p.c;pctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);}
  pctx.globalAlpha=1;if(PARTS.length) requestAnimationFrame(partsLoop);else{partsRunning=false;pctx.clearRect(0,0,innerWidth,innerHeight);}
}
function center(el){const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,r};}
function shake(intensity=1){
  if(reduceMotion()) return;const g=$('#game');g.style.setProperty('--si',intensity);g.classList.remove('shake');void g.offsetWidth;g.classList.add('shake');
  setTimeout(()=>g.classList.remove('shake'),500);
}
function popAt(el,text,color='var(--blue)'){
  const c=center(el);const p=document.createElement('div');p.className='actpop';p.textContent=text;p.style.setProperty('--pc',color);
  p.style.left=clamp(c.x,80,innerWidth-80)+'px';p.style.top=(c.r.top+4)+'px';fx.appendChild(p);setTimeout(()=>p.remove(),1350);
}
function bubbleAt(el,text,boss=false,ms=2600){
  const c=center(el);const b=document.createElement('div');b.className='bubble'+(boss?' boss':'');b.textContent=text;b.style.setProperty('--bt',(ms/1000)+'s');
  fx.appendChild(b);const w=b.offsetWidth;const left=clamp(c.x-30,8,innerWidth-w-8);b.style.left=left+'px';b.style.top=(c.r.bottom+8)+'px';
  b.style.setProperty('--tail',clamp(c.x-left-7,10,w-24)+'px');setTimeout(()=>b.remove(),ms+350);
}
function banner(big,subs=[],color='var(--gold)',y=null,hold=1500){
  const b=document.createElement('div');b.className='banner';b.style.setProperty('--bc',color);
  b.style.top=(y??center($('#board')).y)+'px';
  b.innerHTML=`<div class="big">${big}</div>`+(subs.length?`<div class="sub">${subs.map(s=>`<span style="background:${s[1]}">${s[0]}</span>`).join('')}</div>`:'');
  fx.appendChild(b);
  const g=(typeof G!=='undefined')?G:null;
  return new Promise((res,rej)=>setTimeout(()=>{b.classList.add('out');setTimeout(()=>{b.remove();(g&&g.dead)?rej('abort'):res();},340);},hold));
}
const TQ=[];let tBusy=false;
function toast(text){if(TQ.includes(text)) return;TQ.push(text);if(!tBusy) nextToast();}
function nextToast(){const t=TQ.shift();if(!t){tBusy=false;return;}tBusy=true;const el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>{el.remove();nextToast();},2100);}
function tweenNum(el,to,prefix='$'){
  const from=+el.dataset.v||0;el.dataset.v=to;
  if(from===to){el.textContent=prefix+to.toLocaleString('en-US');return;}
  const t0=performance.now(),dur=450;
  const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=prefix+Math.round(from+(to-from)*e).toLocaleString('en-US');if(k<1) requestAnimationFrame(step);};
  requestAnimationFrame(step);el.classList.remove('numpop');void el.offsetWidth;el.classList.add('numpop');
}
