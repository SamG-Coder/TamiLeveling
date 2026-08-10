import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas=document.querySelector('#threeCanvas');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.1,25);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setClearColor(0x000000,0);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;

scene.add(new THREE.HemisphereLight(0xffe9fa,0x52335e,2.5));
const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-5,7,9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
const rim=new THREE.PointLight(0xf58bc1,25,20);rim.position.set(5,1,6);scene.add(rim);

const device=new THREE.Group();device.rotation.set(0,0,0);scene.add(device);
let deviceShakeStart=-1,deviceShakeStrength=1;addEventListener('step-motion',e=>{deviceShakeStart=performance.now();deviceShakeStrength=e.detail?.source==='WINDOW'?1:.72});
const mat=(color,rough=.4,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
function roughPlastic(color){const m=new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.02});m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat moldGrain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);roughnessFactor=clamp(roughnessFactor+(moldGrain-.5)*.24,0.35,1.0);')};m.customProgramCacheKey=()=>`molded-abs-${color}`;return m}
const profile=window.seedProfile||{rarity:'COMMON',tamiRarity:'COMMON',shell:'VAULT',palette:0,finish:'ROUGH',frame:'RAIL',controls:'ROUND',trim:0,emblem:0,screenTint:0,tami:'KIBI',form:'PRIME',aura:'LEAF'};
const palettes=[[0x2475a8,0x102b3b,0xe66e3f,0xd35f35],[0x48664b,0x172a20,0xd59b3d,0xb96932],[0x5d4c83,0x201d35,0x58a6a6,0xd07845],[0x8d343e,0x29171b,0xd89c42,0xaa5637],[0x555f69,0x161d22,0x79a8c2,0xd36b43],[0x795b32,0x292117,0xb9a46c,0xc86439],[0x285b78,0x0e2735,0xcbd34b,0xd1643b],[0x315650,0x132926,0x9ec7a2,0xb85938],[0x643c52,0x281824,0x4da9a7,0xd08a45],[0x39436c,0x171c36,0xe07a5f,0xc5523d],[0x706c5a,0x292a24,0x78b7c5,0xc66a3c],[0x30343a,0x101418,0xb8c2ce,0xe36b35]],colors=[...palettes[profile.palette%palettes.length]];
if(profile.rarity==='RARE')colors[2]=0x55c7bd;if(profile.rarity==='LEGENDARY')colors[2]=0xe0a52f;if(profile.rarity==='MYTHIC')colors[2]=0xb267ed;
const rareMetal=profile.finish==='METAL'?.55:profile.rarity==='COMMON'?0:profile.rarity==='RARE'?.08:.22,rareTransmission=profile.finish==='FROSTED'?.16:.06,finishRough={ROUGH:.62,FROSTED:.48,CARBON:.68,STONE:.88,METAL:.26}[profile.finish]??.44;
const purple=new THREE.MeshPhysicalMaterial({color:colors[0],roughness:finishRough,metalness:rareMetal,transparent:true,opacity:.76,transmission:rareTransmission,thickness:.5}),dark=roughPlastic(colors[1]),pink=roughPlastic(colors[2]),cream=roughPlastic(colors[3]),black=mat(0x101719,.72),gold=mat(profile.rarity==='MYTHIC'?0xd8b4ff:profile.rarity==='LEGENDARY'?0xe9bd4d:0x8ba5b5,.4,.3);
function mesh(geo,material,pos=[0,0,0],rot=[0,0,0],parent=device){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

// Horizontal translucent command device with a dedicated control rail.
const shellShape={VAULT:[9,6,.3],LINK:[9.2,5.72,.2],RANGER:[8.82,6.18,.42],ARC:[9.1,5.9,.5],BLOCK:[9.28,6.05,.14],SCOUT:[8.76,5.7,.56],TOWER:[8.72,6.3,.25],NEXUS:[9.34,5.86,.36]}[profile.shell];
const rear=mesh(new RoundedBoxGeometry(shellShape[0]+.15,shellShape[1]+.15,1.18,8,shellShape[2]+.04),dark,[0,-.1,-.4]);
const shell=mesh(new RoundedBoxGeometry(shellShape[0],shellShape[1],1.08,8,shellShape[2]),purple,[0,0,0]);
if(profile.finish==='CARBON')for(let i=-4;i<=4;i+=.48)mesh(new RoundedBoxGeometry(.025,5.3,.018,2,.008),dark,[i,0,.57],[0,0,.22]);
if(profile.finish==='STONE')for(let i=0;i<18;i++){const a=(i*2.399+profile.palette)*2.2,r=.018+(i%3)*.008;mesh(new THREE.SphereGeometry(r,5,4),dark,[Math.sin(a)*4.1,Math.cos(a*1.7)*2.65,.57])}
const trimMat=[pink,cream,dark,gold,black][profile.trim%5];if(profile.trim===1||profile.trim===3){mesh(new RoundedBoxGeometry(8.15,.07,.035,2,.02),trimMat,[0,2.72,.64]);mesh(new RoundedBoxGeometry(8.15,.07,.035,2,.02),trimMat,[0,-2.72,.64])}else if(profile.trim===2||profile.trim===4){mesh(new RoundedBoxGeometry(.07,5.1,.035,2,.02),trimMat,[-4.18,0,.64]);mesh(new RoundedBoxGeometry(.07,5.1,.035,2,.02),trimMat,[4.18,0,.64])}
if(profile.rarity!=='COMMON'||profile.emblem>4){const gemCount=profile.rarity==='MYTHIC'?3:profile.rarity==='LEGENDARY'?2:1;for(let i=0;i<gemCount;i++){const gem=mesh(new THREE.OctahedronGeometry(profile.rarity==='MYTHIC'?.19:.14),gold,[2.15+i*.36,2.45,.78]);gem.rotation.z=Math.PI/4}}
mesh(new RoundedBoxGeometry(5.72,4.92,.4,6,.2),dark,[-1.25,.15,.68]);
mesh(new RoundedBoxGeometry(5.46,4.66,.28,5,.14),cream,[-1.25,.15,.94]);
const screenMesh=mesh(new RoundedBoxGeometry(5.05,4.22,.18,4,.12),black,[-1.25,.15,1.14]);

// Live pixel LCD rendered to a canvas texture.
const lcd=document.createElement('canvas');lcd.width=448;lcd.height=423;const ctx=lcd.getContext('2d');ctx.imageSmoothingEnabled=false;
const lcdTex=new THREE.CanvasTexture(lcd);lcdTex.colorSpace=THREE.SRGBColorSpace;lcdTex.magFilter=THREE.NearestFilter;lcdTex.minFilter=THREE.NearestFilter;lcdTex.generateMipmaps=false;
const lcdFace=mesh(new THREE.PlaneGeometry(4.82,3.98),new THREE.MeshBasicMaterial({map:lcdTex}),[-1.25,.15,1.25]);
// Seeded structural frame inspired by early link-battle toys.
const frameMat={RAIL:pink,LOCK:cream,RIVET:gold,FLUSH:dark}[profile.frame];
mesh(new RoundedBoxGeometry(5.72,.16,.2,3,.06),frameMat,[-1.25,2.58,1.25]);mesh(new RoundedBoxGeometry(5.72,.16,.2,3,.06),frameMat,[-1.25,-2.28,1.25]);mesh(new RoundedBoxGeometry(.16,4.92,.2,3,.06),frameMat,[-4.07,.15,1.25]);mesh(new RoundedBoxGeometry(.16,4.92,.2,3,.06),frameMat,[1.57,.15,1.25]);
mesh(new RoundedBoxGeometry(profile.frame==='LOCK'?1.22:1.05,profile.frame==='FLUSH'?1.05:1.35,.28,5,.16),frameMat,[1.58,.15,1.38]);
if(profile.frame==='RIVET')for(const [x,y] of [[-3.92,2.43],[1.42,2.43],[-3.92,-2.13],[1.42,-2.13]])mesh(new THREE.SphereGeometry(.075,10,6),gold,[x,y,1.39]);
function pixelText(t,x,y,size=18,align='left'){ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.fillText(t,x,y)}
function gridSprite(rows,x,y,scale=9,flip=false){ctx.save();if(flip){ctx.translate(x*2,0);ctx.scale(-1,1)}rows.forEach((row,yy)=>[...row].forEach((cell,xx)=>{if(cell==='#')ctx.fillRect(Math.round(x+(xx-row.length/2)*scale),Math.round(y+(yy-rows.length/2)*scale),scale-1,scale-1)}));if(rows.tami){const f=profile.form;if(f==='HORNED'){ctx.fillRect(x-3*scale,y-5*scale,scale-1,scale-1);ctx.fillRect(x+2*scale,y-5*scale,scale-1,scale-1)}if(f==='WINGED'){ctx.fillRect(x-5*scale,y-scale,2*scale,scale-1);ctx.fillRect(x+3*scale,y-scale,2*scale,scale-1)}if(f==='CROWNED'){ctx.fillRect(x-scale,y-5*scale,2*scale,scale-1);ctx.fillRect(x-2*scale,y-4*scale,4*scale,scale-1)}if(f==='SPIKED')for(let i=-2;i<=2;i+=2)ctx.fillRect(x+i*scale,y-5*scale,scale-1,scale-1);if(f==='LONGTAIL'){ctx.fillRect(x+4*scale,y+2*scale,3*scale,scale-1);ctx.fillRect(x+6*scale,y+scale,scale-1,scale-1)}if(f==='MASKED'){ctx.clearRect(x-2*scale,y-2*scale,4*scale,scale-1);ctx.fillRect(x-2*scale,y-2*scale,scale-1,scale-1);ctx.fillRect(x+scale,y-2*scale,scale-1,scale-1)}if(f==='TWIN'){ctx.fillRect(x-5*scale,y,2*scale,2*scale);ctx.fillRect(x+3*scale,y,2*scale,2*scale)}}ctx.restore()}
let lastLCDAction='',lcdActionStart=0;
const screenTints=[['#c7dbad','#17382d','#568b72','#8bc3b5'],['#c6d4c7','#173233','#527b72','#8eb8ad'],['#d6cba9','#382d1b','#83704b','#c0a875'],['#b9cce0','#172b3d','#526f88','#89abc5'],['#d4bfd2','#362238','#765273','#b590ad']][profile.screenTint%5];
const LCD={bg:screenTints[0],ink:screenTints[1],pet:screenTints[1],mid:screenTints[2],sky:screenTints[3],gate:'#78978d',orange:'#dc713d',gold:'#d4a33b',night:'#314c59',light:'#e2e6bc',danger:'#963f3d'};
function drawBaseHabitat(frame){ctx.fillStyle=LCD.sky;ctx.fillRect(13,118,422,174);ctx.fillStyle=LCD.mid;ctx.beginPath();ctx.moveTo(13,250);ctx.lineTo(60,170);ctx.lineTo(116,224);ctx.lineTo(190,145);ctx.lineTo(270,230);ctx.lineTo(342,166);ctx.lineTo(435,240);ctx.lineTo(435,292);ctx.lineTo(13,292);ctx.fill();ctx.fillStyle=LCD.ink;ctx.fillRect(13,269,422,7);for(let i=0;i<11;i++){const gx=i*45+(frame%2)*3;ctx.fillRect(gx,257+(i%2)*7,4,13);ctx.fillRect(gx-5,260+(i%2)*7,14,4)}}
let powerMode='on',powerAnimStart=0;
function drawPowerEffect(time){if(powerMode==='on')return;const black='#07100d',white='#e8f6d0';if(powerMode==='off'){ctx.fillStyle=black;ctx.fillRect(0,0,448,423);return}let p=Math.min(1,(time-powerAnimStart)/760);if(powerMode==='boot')p=1-p;ctx.fillStyle=black;if(p<.58){const edge=Math.round(212*(p/.58));ctx.fillRect(0,0,448,edge);ctx.fillRect(0,423-edge,448,edge)}else{ctx.fillRect(0,0,448,423);const linePhase=(p-.58)/.42,w=Math.max(3,Math.round(420*(1-linePhase)));ctx.fillStyle=white;if(linePhase<.62)ctx.fillRect(Math.round((448-w)/2),210,w,4);else{const dot=Math.max(2,Math.round(10*(1-(linePhase-.62)/.38)));ctx.fillRect(224-Math.round(dot/2),212-Math.round(dot/2),dot,dot)}}if((time-powerAnimStart)>=760)powerMode=powerMode==='shutdown'?'off':'on'}
function drawLCD(time=0){
  ctx.fillStyle=LCD.bg;ctx.fillRect(0,0,lcd.width,lcd.height);ctx.fillStyle=LCD.ink;ctx.globalAlpha=.07;for(let y=0;y<423;y+=4)ctx.fillRect(0,y,448,1);ctx.globalAlpha=1;
  ctx.strokeStyle=LCD.ink;ctx.lineWidth=5;ctx.strokeRect(8,8,432,407);ctx.fillStyle=LCD.ink;pixelText(document.querySelector('#screenRank')?.textContent||'RANK E',22,38,19);pixelText(document.body.dataset.hatched==='true'?`${profile.tamiRarity} ${profile.tami}`:'TAMI ???',224,38,12,'center');pixelText(`LV.${document.querySelector('#playerLevel')?.textContent||1}`,424,38,19,'right');ctx.fillRect(12,53,424,5);
  const mode=document.body.dataset.mode||'WARM',action=document.body.dataset.action||'',notice=document.body.dataset.notice||'';if(action!==lastLCDAction){lastLCDAction=action;lcdActionStart=time}const actionFrame=Math.floor((time-lcdActionStart)/160);pixelText(`< ${mode} >`,224,88,18,'center');if(notice)pixelText(notice,224,112,13,'center');
  const frame=Math.floor(time/160),room=document.body.dataset.room||'HABITAT',taps=Number(document.body.dataset.hatched==='true'?7:(document.querySelector('#questCount')?.textContent||'0').split('/')[0]),hatched=document.body.dataset.hatched==='true';
  const species={KIBI:[[' #   # ','#######','# ### #','#######','# # # #',' ##### ',' #   # '],[' #   # ','#######','# ### #','#######','# # # #',' ##### ','  # #  ']],MOSSBIT:[['  ###  ',' ## ## ','#######','# ### #',' ##### ',' ## ## ',' #   # '],['  ###  ',' ## ## ','#######','# ### #',' ##### ',' # # # ','  # #  ']],EMBERPUP:[['##   ##','#######','# ### #','#######',' ##### ','##   ##',' #   # '],['##   ##','#######','# ### #','#######',' ##### ',' # # ##','  # #  ']],VOIDLING:[['#     #',' ##### ','## # ##','#######',' ##### ','  ###  ',' #   # '],['#     #',' ##### ','## # ##','#######',' ##### ','  ###  ','  # #  ']],AURAKIT:[['# # # #',' ##### ','## # ##','#######',' ##### ',' # # # ','#     #'],['# # # #',' ##### ','## # ##','#######',' ##### ','  # #  ',' #   # ']]},[petA,petB]=species[profile.tami]||species.KIBI,petSit=petB,egg=['  ###  ',' ##### ','#######','#######','#######',' ##### ','  ###  '];petA.tami=petB.tami=petSit.tami=true;
  // Every animated scene is hard-clipped inside the playfield.
  ctx.save();ctx.beginPath();ctx.rect(13,118,422,174);ctx.clip();
  if(room==='GATE'){
    // Gate uses the same large flat layers as the mountain habitat.
    drawBaseHabitat(frame);ctx.fillStyle=LCD.ink;ctx.fillRect(282,155,128,114);for(let x=282;x<410;x+=32)ctx.fillRect(x,140,18,20);ctx.fillStyle=LCD.sky;ctx.fillRect(313,181,66,88);for(let x=320;x<379;x+=15)ctx.fillRect(x,181,6,88);ctx.fillStyle=LCD.orange;pixelText(`${document.body.dataset.gateRank||'E'}-RANK GATE`,224,138,14,'center');
    ctx.fillStyle=LCD.pet;const phase=Math.min(actionFrame,27);if(phase<7){gridSprite(petA,105,220,10);pixelText('ENTER...',105,150,12,'center')}else if(phase<15){gridSprite(phase%2?petA:petB,150+(phase-7)*11,220,10);gridSprite([' ### ','#####','# # #','#####',' # # '],355,220,11)}else if(phase<21){gridSprite(petB,245,220,10);gridSprite([' ### ','#####','# # #','#####',' # # '],355,220,11);ctx.fillRect(280+(phase%3)*12,172,42,6);ctx.fillRect(300,154+(phase%3)*9,6,42);pixelText('SLASH!',250,145,13,'center')}else{gridSprite(petSit,275,220,10);pixelText('GATE CLEAR!',224,145,15,'center')}
  }else if(action==='REST'){
    // Sleep room uses broad silhouettes and the same restrained four-layer composition.
    drawBaseHabitat(frame);ctx.fillStyle=LCD.light;ctx.fillRect(166,215,224,54);ctx.fillStyle=LCD.mid;ctx.fillRect(166,245,224,24);ctx.fillStyle=LCD.pet;gridSprite(petSit,278,224,9);pixelText('SLEEP MODE',87,251,12,'center');for(let i=0;i<3;i++)if((frame+i)%4!==0)pixelText('Z',326+i*22,198-i*22,13+i*2)}
  else{
    // Habitat is static pixel scenery; only discrete grass frames change.
    drawBaseHabitat(frame);
    if(!hatched){const wobble=(frame%8===5?-8:frame%8===6?8:0);gridSprite(egg,224+wobble,211,13);if(taps>=4)pixelText('CRK',224,215,12,'center')}
    else if(action==='FEED'){
      const phase=Math.min(actionFrame,14),berryX=phase<6?330-phase*18:222,berryY=phase<6?130+phase*16:226;ctx.fillStyle=LCD.ink;gridSprite(phase%2?petA:petSit,180,221,10);ctx.fillStyle=LCD.orange;ctx.fillRect(berryX,berryY,13,13);ctx.fillStyle=LCD.mid;ctx.fillRect(berryX+5,berryY-7,4,7);if(phase>8){ctx.fillStyle=LCD.ink;pixelText(phase%2?'CHOMP!':'YUM!',260,150,14,'center')}
    }else if(action==='TRAIN'){
      const phase=Math.min(actionFrame,11);ctx.fillStyle=LCD.ink;gridSprite(phase%2?petA:petB,160+(phase<6?phase*12:72),221,10);ctx.fillStyle=LCD.danger;ctx.fillRect(335,170,8,98);ctx.fillRect(312,178,54,8);if(phase>5){ctx.fillStyle=LCD.orange;ctx.fillRect(255+phase*5,190,48,6);pixelText('POW!',260,148,15,'center')}
    }else{
      // Patrol has walk, idle, look and return phases instead of endless sliding.
      const cycle=frame%48;let px=120,flip=false,sprite=petSit,label='';if(cycle<8){px=120;sprite=petSit;label=cycle>4?'...':''}else if(cycle<20){px=120+(cycle-8)*10;sprite=cycle%2?petA:petB}else if(cycle<28){px=240;sprite=petSit;label=cycle%4===0?'!':''}else if(cycle<40){px=240-(cycle-28)*10;sprite=cycle%2?petA:petB;flip=true}else{px=120;sprite=petSit}gridSprite(sprite,px,221,10,flip);if(label)pixelText(label,px,150,18,'center');
    }
  }
  // Environment polish pass. All details remain inside the active playfield clip.
  if(room==='GATE'){
    ctx.fillStyle=LCD.orange;const flame=frame%3;[[62,188],[420,188]].forEach(([x,y])=>{ctx.fillRect(x-3,y,6,43);ctx.fillRect(x-(flame===1?8:5),y-14,flame===1?16:10,16)});ctx.fillStyle=LCD.danger;ctx.fillRect(347,208,5,5);ctx.fillRect(373,208,5,5);
  }else if(action==='REST'){
    ctx.fillStyle=LCD.light;pixelText(frame%6<3?'Z':'z',397,145,18,'center');
  }else{
    ctx.fillStyle=LCD.light;ctx.fillRect(43,139,31,7);ctx.fillRect(50,132,18,7);ctx.fillRect(352,151,38,7);ctx.fillRect(361,144,20,7);ctx.fillStyle=LCD.bg;ctx.beginPath();ctx.moveTo(166,166);ctx.lineTo(190,145);ctx.lineTo(212,168);ctx.lineTo(198,162);ctx.lineTo(190,153);ctx.lineTo(181,163);ctx.fill();ctx.beginPath();ctx.moveTo(319,185);ctx.lineTo(342,166);ctx.lineTo(362,185);ctx.lineTo(350,180);ctx.lineTo(342,173);ctx.lineTo(334,180);ctx.fill();ctx.fillStyle=LCD.gold;ctx.fillRect(401,128,14,14);ctx.fillRect(396,133,24,4);ctx.fillRect(406,123,4,24);ctx.fillStyle=LCD.mid;for(let x=26;x<430;x+=67){ctx.fillRect(x,261,13,6);ctx.fillRect(x+4,255,5,6)}
  }
  ctx.restore();ctx.strokeStyle=LCD.ink;ctx.fillStyle=LCD.ink;ctx.fillRect(80,294,288,5);pixelText('HUNGER',28,335,15);pixelText('POWER',173,335,15);pixelText('REST',328,335,15);const bars=[['#hungerBar',28],['#powerBar',173],['#restBar',328]];bars.forEach(([id,x])=>{ctx.strokeRect(x,348,93,18);const w=parseFloat(document.querySelector(id)?.style.width)||50;ctx.fillStyle=id==='#hungerBar'?LCD.orange:id==='#powerBar'?LCD.danger:LCD.mid;ctx.fillRect(x+4,352,Math.max(4,w*.85),10);ctx.fillStyle=LCD.ink});const footer=frame%40<20?`${profile.rarity} ${profile.shell} · ${document.querySelector('#stepCount')?.textContent||0} STEP`:(document.body.dataset.gameStatus||'READY');pixelText(footer,224,398,12,'center');drawPowerEffect(time);lcdTex.needsUpdate=true;
}

// Real raised controls.
const clickable=[];
function engravedSymbol(symbol,x,y){const z=1.165;if(symbol==='OK'){mesh(new THREE.RingGeometry(.09,.145,20),dark,[x,y,z]);return}const shape=new THREE.Shape();if(symbol==='UP'){shape.moveTo(0,.19);shape.lineTo(-.16,-.05);shape.lineTo(-.07,-.05);shape.lineTo(-.07,-.18);shape.lineTo(.07,-.18);shape.lineTo(.07,-.05);shape.lineTo(.16,-.05)}else{shape.moveTo(0,-.19);shape.lineTo(-.16,.05);shape.lineTo(-.07,.05);shape.lineTo(-.07,.18);shape.lineTo(.07,.18);shape.lineTo(.07,.05);shape.lineTo(.16,.05)}shape.closePath();mesh(new THREE.ShapeGeometry(shape),dark,[x,y,z])}
function controlTopGeometry(){if(profile.controls==='SQUARE')return new RoundedBoxGeometry(.61,.61,.27,4,.13);if(profile.controls==='CAPSULE')return new RoundedBoxGeometry(.56,.7,.27,5,.22);return new THREE.CylinderGeometry(.32,.35,.27,profile.controls==='HEX'?6:28)}
function button(name,symbol,x,y,color,action){mesh(new THREE.CylinderGeometry(.4,.44,.22,28),dark,[x,y,.82],[Math.PI/2,0,0]);const cylinder=profile.controls==='ROUND'||profile.controls==='HEX',top=mesh(controlTopGeometry(),color,[x,y,1.02],cylinder?[Math.PI/2,0,0]:[0,0,0]);top.name=name;top.userData={action,homeZ:1.02};clickable.push(top);engravedSymbol(symbol,x,y);return top}
button('PREV','UP',3.38,1.45,pink,()=>document.querySelector('#leftButton')?.click());button('ACTION','OK',3.38,.05,pink,()=>document.querySelector('#actionButton')?.click());button('NEXT','DOWN',3.38,-1.35,pink,()=>document.querySelector('#rightButton')?.click());
let zoomLevel=1.5;camera.zoom=zoomLevel;camera.updateProjectionMatrix();
function zoomButton(kind,x,delta){const top=mesh(new RoundedBoxGeometry(.58,.34,.22,4,.08),pink,[x,-2.45,1.02]);top.name=`ZOOM_${kind}`;top.userData={homeZ:1.02,action:()=>{window.playSfx?.('zoom');zoomLevel=THREE.MathUtils.clamp(zoomLevel+delta,.72,1.5);camera.zoom=zoomLevel;camera.updateProjectionMatrix();document.body.dataset.notice=`ZOOM ${Math.round(zoomLevel*100)}%`;clearTimeout(zoomButton.timer);zoomButton.timer=setTimeout(()=>delete document.body.dataset.notice,1000)}};clickable.push(top);mesh(new RoundedBoxGeometry(.25,.04,.025,2,.015),dark,[x,-2.45,1.145]);if(kind==='PLUS')mesh(new RoundedBoxGeometry(.04,.25,.025,2,.015),dark,[x,-2.45,1.146])}
zoomButton('MINUS',2.95,-.12);zoomButton('PLUS',3.8,.12);
const powerBase=mesh(new THREE.CylinderGeometry(.27,.3,.2,28),dark,[4.02,2.5,.88],[Math.PI/2,0,0]);const powerSwitch=mesh(new THREE.CylinderGeometry(.21,.23,.24,28),roughPlastic(0xa64339),[4.02,2.5,1.04],[Math.PI/2,0,0]);powerSwitch.name='POWER';powerSwitch.userData={homeZ:1.04,isPower:true,action:()=>{if(powerMode==='off'){powerMode='boot';powerAnimStart=performance.now()}else if(powerMode==='on'){dispatchEvent(new Event('device-power-off'));powerMode='shutdown';powerAnimStart=performance.now()}}};clickable.push(powerSwitch);mesh(new THREE.RingGeometry(.075,.12,20),cream,[4.02,2.5,1.17]);mesh(new RoundedBoxGeometry(.025,.12,.02,2,.008),cream,[4.02,2.57,1.175]);
// Speaker slots, side lugs, and metal keychain.

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
canvas.addEventListener('pointerup',e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickable)[0];if(hit){const b=hit.object;if(powerMode==='off'&&!b.userData.isPower)return;const eggLocked=document.body.dataset.hatched!=='true';if(eggLocked&&b.name!=='ACTION'&&!b.userData.isPower){document.body.dataset.notice='HATCH EGG FIRST';clearTimeout(canvas.lockTimer);canvas.lockTimer=setTimeout(()=>delete document.body.dataset.notice,1000);window.playSfx?.('nav');navigator.vibrate?.(8);return}b.position.z=.88;setTimeout(()=>b.position.z=b.userData.homeZ,120);b.userData.action();navigator.vibrate?.(25)}});
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const landscape=w/h>1.25;camera.position.z=landscape?18:34;camera.position.y=0;device.scale.setScalar(landscape?.95:.9)}addEventListener('resize',resize);resize();
let lastDraw=0;function animate(t){requestAnimationFrame(animate);if(t-lastDraw>70){drawLCD(t);lastDraw=t}if(deviceShakeStart>=0){const elapsed=t-deviceShakeStart;if(elapsed<680){const decay=Math.exp(-elapsed/190)*deviceShakeStrength,phase=elapsed*.052;device.position.x=Math.sin(phase)*.13*decay;device.position.y=Math.sin(phase*.72)*.045*decay;device.rotation.z=Math.sin(phase+.7)*.012*decay}else{device.position.set(0,0,0);device.rotation.set(0,0,0);deviceShakeStart=-1}}renderer.render(scene,camera)}animate(0);
