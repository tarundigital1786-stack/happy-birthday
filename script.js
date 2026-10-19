const Q=[
"Dost woh nahi jo hamesha saath ho, dost woh jo har haal mein saath ho.",
"Zindagi ke safar mein tum jaise dost hon, toh manzil ki parwah kaun kare.",
"A friend is someone who knows all about you and still loves you.",
"Birthdays are nature's way of telling us to eat more cake. 🎂",
"Umar badhti hai, par dosti ka maza kabhi purana nahi hota.",
"Age is just a number, but friendship is priceless.",
"Aaj ka din hasi, masti aur dher saari khushiyon ke naam.",
"Tum meri life ke woh chapter ho jo main baar baar padhna chahta hoon.",
"Good friends are like stars: you don't always see them, but you know they're there.",
"Muskurate raho, kyunki tumhari muskaan se kayi logon ka din ban jata hai.",
"Har saal ek naya mauka hai, ek naya sapna jeene ka.",
"Sabse acchi dosti woh hai jisme bina bole sab samajh aa jaye.",
];
const $=s=>document.querySelector(s);
const state=JSON.parse($('#data').textContent||'{"name":"","photos":[]}');
state.photos=state.photos||[];
let claudeArtifact=null,claudeAssets=null,saveTimer=null;

function renderTitle(){
  $('#title').textContent=state.name?('Happy Birthday, '+state.name+'!'):'Happy Birthday!';
}
function newQuote(){$('#fq').textContent=Q[Math.floor(Math.random()*Q.length)]}
function renderQuotes(){
  const el=$('#quotes');el.textContent='';
  Q.forEach(t=>{const d=document.createElement('div');d.textContent=t;el.appendChild(d)});
}
function renderGallery(){
  const g=$('#gallery');g.textContent='';
  if(!state.photos.length){
    const e=document.createElement('div');e.className='empty';
    e.textContent=claudeAssets?'Abhi koi photo nahi hai. Upar se apni photos add karo.':'Photos jaldi aa rahi hain… 📷';
    g.className='';g.appendChild(e);return;
  }
  g.className='gallery';
  state.photos.forEach((p,i)=>{
    const w=document.createElement('div');w.className='ph';
    const im=document.createElement('img');im.src=p.url;im.loading='lazy';im.alt='Yaad '+(i+1);
    im.onclick=()=>{$('#lb img').src=p.url;$('#lb').style.display='flex'};
    w.appendChild(im);
    if(claudeAssets){
      const x=document.createElement('button');x.className='x';x.textContent='✕';x.title='Hatao';
      x.onclick=()=>{state.photos.splice(i,1);renderGallery();queueSave()};
      w.appendChild(x);
    }
    g.appendChild(w);
  });
}
function renderAdmin(){
  const a=$('#admin');a.textContent='';
  if(!claudeAssets||!claudeArtifact)return;
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.hidden=true;
  const b=document.createElement('button');b.textContent='＋ Photos add karo';b.onclick=()=>inp.click();
  const n=document.createElement('button');n.className='ghost';n.textContent='✏️ Dost ka naam';
  n.onclick=()=>{const v=prompt('Dost ka naam likho:',state.name||'');if(v!==null){state.name=v.trim();renderTitle();queueSave()}};
  const s=document.createElement('span');s.id='status';
  a.append(b,n,s,inp);
  inp.onchange=async()=>{
    const files=[...inp.files];let done=0;
    for(const f of files){
      s.textContent='Upload ho raha hai… '+(done+1)+'/'+files.length;
      try{const r=await claudeAssets.upload(f);state.photos.push({id:r.id,url:r.url});renderGallery()}
      catch(e){s.textContent='Ek photo upload nahi hui ('+(e&&e.message||'error')+')'}
      done++;
    }
    inp.value='';
    queueSave();
  };
}
function queueSave(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    const s=$('#status');if(s)s.textContent='Save ho raha hai…';
    try{
      const clone=document.documentElement.cloneNode(true);
      clone.querySelector('#data').textContent=JSON.stringify(state);
      ['#admin','#gallery','#quotes','#fq'].forEach(k=>{const e=clone.querySelector(k);if(e)e.textContent=''});
      const lb=clone.querySelector('#lb');if(lb)lb.style.display='none';
      await claudeArtifact.publish('<!doctype html>\n'+clone.outerHTML);
    }catch(e){const s2=$('#status');if(s2)s2.textContent='Save nahi hua, dobara try karo.'}
  },1200);
}
const cv=$('#fx'),cx=cv.getContext('2d');let parts=[],raf=null,audio=null;
function fit(){cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio}
fit();addEventListener('resize',fit);
const FL=['🌸','🌺','🌼','🌷','🌹','💐'],CO=['#ff4d8d','#ffb24d','#4dd2ff','#7cf29a','#c58bff','#ffe14d'];
function spawn(n){
  const d=devicePixelRatio;
  for(let i=0;i<n;i++){
    const f=Math.random()<.55;
    parts.push({f,x:Math.random()*cv.width,y:-30*d-Math.random()*cv.height*.4,vy:(1.5+Math.random()*2.5)*d,vx:(Math.random()-.5)*1.5*d,s:(f?18+Math.random()*18:6+Math.random()*6)*d,r:Math.random()*6,vr:(Math.random()-.5)*.15,ph:Math.random()*6,c:f?FL[i%FL.length]:CO[i%CO.length]});
  }
  if(!raf)loop();
}
function loop(){
  const d=devicePixelRatio;
  cx.clearRect(0,0,cv.width,cv.height);
  parts.forEach(p=>{
    p.y+=p.vy;p.ph+=.05;p.x+=p.vx+Math.sin(p.ph)*d;p.r+=p.vr;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);
    if(p.f){cx.font=p.s+'px serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(p.c,0,0)}
    else{cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2)}
    cx.restore();
  });
  parts=parts.filter(p=>p.y<cv.height+60*d);
  raf=parts.length?requestAnimationFrame(loop):null;
  if(!raf)cx.clearRect(0,0,cv.width,cv.height);
}
function playTune(){
  try{
    if(audio)audio.close();
    const A=audio=new (window.AudioContext||window.webkitAudioContext)();
    const S=[[392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],
      [392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],
      [392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,1],
      [698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]];
    let t=A.currentTime+.05;const b=.5;
    S.forEach(([f,n])=>{
      const o=A.createOscillator(),g=A.createGain();
      o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(A.destination);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25,t+.03);
      g.gain.exponentialRampToValueAtTime(.001,t+n*b*.95);
      o.start(t);o.stop(t+n*b);t+=n*b;
    });
  }catch(e){}
}
function party(){
  spawn(120);let k=0;
  const t=setInterval(()=>{spawn(25);if(++k>14)clearInterval(t)},500);
  playTune();
}
$('#party').onclick=party;
$('#nq').onclick=newQuote;
$('#lb').onclick=()=>{$('#lb').style.display='none'};
renderTitle();newQuote();renderQuotes();renderGallery();

(async()=>{
  try{
    const [a,s]=await Promise.all([window.claude?claude.use('artifact'):null,window.claude?claude.use('assets'):null]);
    claudeArtifact=a;claudeAssets=s;
    renderAdmin();renderGallery();
  }catch(e){}
})();
