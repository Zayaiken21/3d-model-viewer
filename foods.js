import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const FOODS = [{"id": 4096, "name": "Sunberry", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4097, "name": "Thornpear", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4098, "name": "Frostcap", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4099, "name": "Emberbulb", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4100, "name": "Lumenspore", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4101, "name": "Cragmoss", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4102, "name": "Kelpfruit", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4103, "name": "Tidefruit", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4104, "name": "Reefberry", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4105, "name": "Jungleplum", "color": "#E8734C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4176, "name": "Grain", "color": "#D9C24C", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "Bread"}, {"id": 4177, "name": "Banana", "color": "#F5D340", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "Fruit Bowl, Fruit Tree Seed"}, {"id": 4178, "name": "Mango", "color": "#FF8A3D", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "Fruit Bowl"}, {"id": 4179, "name": "Coconut", "color": "#7A5230", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}, {"id": 4180, "name": "Bread", "color": "#C9A44C", "source": "Crafted", "madeFrom": "3 \u00d7 Grain at the furnace", "goesInto": "\u2014"}, {"id": 4181, "name": "Fruit Bowl", "color": "#FF9E6B", "source": "Crafted", "madeFrom": "1 \u00d7 Banana + 1 \u00d7 Mango + 1 \u00d7 Planks by hand", "goesInto": "\u2014"}, {"id": 4190, "name": "Jungleplum", "color": "#8F5FD0", "source": "Gathered from plants, leaves and coral \u2014 animal food", "goesInto": "\u2014"}];

const host = document.querySelector('#view');
const list = document.querySelector('#foodList');
const sidebar = document.querySelector('#sidebar');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);

const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 100);
camera.position.set(4.8, 3.6, 5.6);

const renderer = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.target.set(0,0.6,0);
controls.minDistance = 2.2;
controls.maxDistance = 11;
controls.autoRotate = false;
controls.autoRotateSpeed = 1.5;

scene.add(new THREE.HemisphereLight(0xdff2ff, 0x183049, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 4.2);
key.position.set(4,7,5); key.castShadow = true;
key.shadow.mapSize.set(2048,2048);
key.shadow.camera.left=-6; key.shadow.camera.right=6; key.shadow.camera.top=6; key.shadow.camera.bottom=-6;
scene.add(key);
const rim = new THREE.DirectionalLight(0x74cfff, 2.0);
rim.position.set(-5,3,-4); scene.add(rim);

const floorMat = new THREE.MeshStandardMaterial({color:0x0b1928,roughness:.92,metalness:.02});
const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.85,.14,64), floorMat);
floor.position.y=-.1; floor.receiveShadow=true; scene.add(floor);
const grid = new THREE.GridHelper(7,28,0x315f82,0x17314a);
grid.position.y=-.015; grid.material.transparent=true; grid.material.opacity=.24; scene.add(grid);

let modelRoot = new THREE.Group();
scene.add(modelRoot);
let selected = 0;
let wire = false;

function col(hex){ return new THREE.Color(hex); }
function shift(hex, amount){
  const c=col(hex); c.offsetHSL(0,0,amount); return '#'+c.getHexString();
}
function mat(hex, opts={}){
  return new THREE.MeshStandardMaterial({
    color:hex, roughness:opts.roughness ?? .68, metalness:opts.metalness ?? .03,
    emissive:opts.emissive ?? 0x000000, emissiveIntensity:opts.emissiveIntensity ?? 0,
    transparent:opts.transparent ?? false, opacity:opts.opacity ?? 1, side:THREE.DoubleSide
  });
}
function add(group, geo, material, p=[0,0,0], r=[0,0,0], s=[1,1,1]){
  const m=new THREE.Mesh(geo,material); m.position.set(...p); m.rotation.set(...r); m.scale.set(...s);
  m.castShadow=true; m.receiveShadow=true; group.add(m); return m;
}
const sphere=(r=1,seg=16)=>new THREE.IcosahedronGeometry(r,2);
const lowSphere=(r=1)=>new THREE.IcosahedronGeometry(r,1);
const box=(x=1,y=1,z=1)=>new THREE.BoxGeometry(x,y,z,2,2,2);
const cyl=(rt=.5,rb=.5,h=1,seg=12)=>new THREE.CylinderGeometry(rt,rb,h,seg,1,false);
const cone=(r=.5,h=1,seg=10)=>new THREE.ConeGeometry(r,h,seg);
const torus=(R=.6,t=.14,seg=12)=>new THREE.TorusGeometry(R,t,8,seg);

function leaf(g,p=[0,0,0],s=[1,1,1],rot=[0,0,0],hex='#4da94b'){
  return add(g, lowSphere(.3), mat(hex,{roughness:.8}), p, rot, [s[0]*1.4,s[1]*.35,s[2]*.75]);
}
function stem(g,p=[0,0,0],h=.5,hex='#4f8d3a',rad=.06){
  return add(g,cyl(rad,rad*1.05,h,8),mat(hex,{roughness:.85}),p);
}
function berryCluster(g, hex, count=7, radius=.34){
  const pts=[[0,.55,0],[.27,.48,.12],[-.25,.48,.1],[.08,.47,-.25],[-.12,.27,.23],[.25,.28,-.14],[-.23,.25,-.17],[0,.18,0]];
  pts.slice(0,count).forEach((p,i)=>add(g,lowSphere(radius*(i?0.84:1)),mat(i?shift(hex,(i%3-1)*.035):hex),p));
}
function thorns(g, n=12, R=.64, color='#7f3425'){
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2, y=.45 + ((i%3)-1)*.28;
    const x=Math.cos(a)*R*.72,z=Math.sin(a)*R*.72;
    const spike=add(g,cone(.055,.27,5),mat(color,{roughness:.7}),[x,y,z]);
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(x,.05,z).normalize());
  }
}
function shard(g,p,hex,scale=.28){
  return add(g,cone(.22,.72,5),mat(hex,{roughness:.28,metalness:.05,emissive:hex,emissiveIntensity:.08}),p,[0,0,0],[scale/.28,scale/.28,scale/.28]);
}

function makeSunberry(f){
  const g=new THREE.Group(); berryCluster(g,f.color,8,.35);
  for(let i=0;i<5;i++){ const a=i*Math.PI*2/5; leaf(g,[Math.cos(a)*.3,.88,Math.sin(a)*.3],[.75,.75,.75],[0,a,.3], '#4fa83e');}
  stem(g,[0,.91,0],.32); return g;
}
function makeThornpear(f){
  const g=new THREE.Group();
  add(g,sphere(.72),mat(f.color),[0,.48,0],[0,0,0],[.83,1.05,.83]);
  add(g,sphere(.48),mat(shift(f.color,.02)),[0,1.1,0],[0,0,0],[.68,.72,.68]);
  thorns(g,16,.9);
  stem(g,[0,1.55,0],.35,'#477c32'); leaf(g,[.17,1.66,0],[.8,.8,.8],[0,0,-.45]); return g;
}
function makeFrostcap(f){
  const g=new THREE.Group();
  add(g,cyl(.2,.27,.72,9),mat('#eadfd2'),[0,.28,0]);
  add(g,sphere(.74),mat(f.color,{roughness:.48}),[0,.82,0],[0,0,0],[1,.35,1]);
  for(let i=0;i<6;i++){const a=i*Math.PI*2/6; shard(g,[Math.cos(a)*.48,1.02,Math.sin(a)*.48],'#bfe8ff',.2);}
  return g;
}
function makeEmberbulb(f){
  const g=new THREE.Group();
  for(let i=0;i<8;i++){ const a=i*Math.PI*2/8;
    add(g,sphere(.55),mat(i%2?f.color:shift(f.color,-.04),{emissive:0xff4d10,emissiveIntensity:.08}),
      [Math.cos(a)*.18,.55,Math.sin(a)*.18],[0,0,0],[.72,1.05,.72]);
  }
  stem(g,[0,1.2,0],.38,'#405d2b'); for(let i=0;i<4;i++)leaf(g,[0,1.38,0],[.8,.8,.8],[0,i*Math.PI/2,.8],'#526c2e');
  return g;
}
function makeLumenspore(f){
  const g=new THREE.Group();
  add(g,sphere(.65),mat(f.color,{emissive:f.color,emissiveIntensity:.35,roughness:.4}),[0,.58,0]);
  for(let i=0;i<12;i++){const a=i*Math.PI*2/12; const y=.25+(i%4)*.2;
    add(g,lowSphere(.11),mat('#ffe99e',{emissive:0xffbd5c,emissiveIntensity:.55}),[Math.cos(a)*.62,y,Math.sin(a)*.62]);
  }
  add(g,torus(.52,.055,16),mat('#ffd783',{emissive:0xff9e52,emissiveIntensity:.3}),[0,.6,0],[Math.PI/2,0,0]); return g;
}
function makeCragmoss(f){
  const g=new THREE.Group();
  [[-.3,.3,.1],[.25,.28,.12],[0,.42,-.18],[.05,.2,.3]].forEach((p,i)=>add(g,lowSphere(.42),mat(i%2?'#60634e':'#777761',{roughness:.95}),p,[0,0,0],[1,.7,1]));
  for(let i=0;i<15;i++){const a=i*.9; add(g,lowSphere(.12),mat(i%3?f.color:'#6f9b3c',{roughness:.9}),[Math.cos(a)*.43,.57+(i%3)*.06,Math.sin(a)*.36]);}
  return g;
}
function makeKelpfruit(f){
  const g=new THREE.Group();
  add(g,sphere(.62),mat(f.color),[0,.58,0],[0,0,0],[.75,1.1,.75]);
  for(let i=0;i<6;i++){const a=i*Math.PI*2/6; leaf(g,[Math.cos(a)*.32,1.15,Math.sin(a)*.32],[.8,1.15,.8],[0,a,.6],'#3E8C5A');}
  stem(g,[0,1.3,0],.35,'#2f6e48'); return g;
}
function makeTidefruit(f){
  const g=new THREE.Group();
  add(g,sphere(.67),mat(f.color,{roughness:.5}),[0,.56,0],[0,0,0],[.82,1.12,.82]);
  add(g,cone(.32,.55,8),mat(shift(f.color,-.04)),[0,1.28,0]);
  for(let i=0;i<4;i++){const a=i*Math.PI/2; add(g,box(.07,.35,.55),mat('#4fc8ff',{roughness:.35,transparent:true,opacity:.85}),[Math.cos(a)*.52,.55,Math.sin(a)*.52],[0,-a,0],[1,1,.3]);}
  return g;
}
function makeReefberry(f){
  const g=new THREE.Group(); berryCluster(g,f.color,8,.3);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7; add(g,cone(.09,.55,6),mat(i%2?'#ffb252':'#ff6fa8'),[Math.cos(a)*.34,.88,Math.sin(a)*.34],[0,0,a*.15]);}
  return g;
}
function makeJungleplum(f){
  const g=new THREE.Group();
  add(g,sphere(.72),mat(f.color,{roughness:.58}),[0,.58,0],[0,0,0],[.9,1.02,.9]);
  add(g,torus(.37,.035,14),mat(shift(f.color,-.11)),[0,.59,.54],[0,0,0]);
  stem(g,[0,1.25,0],.3,'#4c6333'); leaf(g,[.24,1.38,0],[.9,.9,.9],[0,.25,-.45],'#3f8b43'); return g;
}
function makeGrain(f){
  const g=new THREE.Group();
  for(let i=0;i<7;i++){const x=(i-3)*.1; stem(g,[x,.42,0],.85,shift(f.color,-.08),.025);
    for(let j=0;j<5;j++){ add(g,lowSphere(.08),mat(f.color),[x+(j%2?.07:-.07),.55+j*.14,0],[0,0,0],[1.4,.75,.7]);}}
  return g;
}
function makeBanana(f){
  const g=new THREE.Group();
  class BananaCurve extends THREE.Curve{
    getPoint(t,target=new THREE.Vector3()){ const a=(-.78+t*1.56); return target.set(Math.sin(a)*.78,.35+Math.cos(a)*.45,0); }
  }
  for(let i=0;i<4;i++){
    const geo=new THREE.TubeGeometry(new BananaCurve(),20,.115,7,false);
    const m=add(g,geo,mat(i%2?f.color:shift(f.color,-.035)),[0,.3,0],[0,i*.14-(.22),i*.12]);
    m.scale.set(.9,.9,.9);
  }
  stem(g,[0,.96,0],.22,'#6d5a2c',.055); return g;
}
function makeMango(f){
  const g=new THREE.Group();
  add(g,sphere(.7),mat(f.color),[0,.58,0],[0,0,-.12],[.78,1.04,.78]);
  add(g,sphere(.5),mat(shift(f.color,.035)),[-.18,.72,.05],[0,0,0],[.5,.72,.5]);
  stem(g,[0,1.25,0],.27,'#4b6730'); leaf(g,[.25,1.35,0],[1,1,1],[0,.3,-.55],'#459344'); return g;
}
function makeCoconut(f){
  const g=new THREE.Group();
  add(g,sphere(.78),mat(f.color,{roughness:.9}),[0,.62,0],[0,0,0],[1,1.08,1]);
  for(let i=0;i<10;i++){const a=i*Math.PI*2/10; add(g,box(.045,.9,.045),mat(shift(f.color,-.08)),[Math.cos(a)*.62,.62,Math.sin(a)*.62],[0,-a,0]);}
  [[-.16,1.22,.5],[0,1.27,.53],[.16,1.22,.5]].forEach(p=>add(g,lowSphere(.055),mat('#352218'),p));
  return g;
}
function makeBread(f){
  const g=new THREE.Group();
  add(g,box(1.55,.72,.9),mat(f.color,{roughness:.88}),[0,.43,0],[0,0,0]);
  add(g,sphere(.52),mat(shift(f.color,.04),{roughness:.82}),[-.48,.76,0],[0,0,0],[.82,.45,.86]);
  add(g,sphere(.52),mat(shift(f.color,.04),{roughness:.82}),[0,.76,0],[0,0,0],[.82,.45,.86]);
  add(g,sphere(.52),mat(shift(f.color,.04),{roughness:.82}),[.48,.76,0],[0,0,0],[.82,.45,.86]);
  for(let x of [-.45,0,.45]) add(g,box(.06,.08,.7),mat(shift(f.color,-.14)),[x,.92,.05],[0,0,.3]);
  return g;
}
function makeFruitBowl(f){
  const g=new THREE.Group();
  const pts=[]; for(let i=0;i<8;i++){const y=-.5+i*.12, r=.28+i*.07; pts.push(new THREE.Vector2(r,y));}
  add(g,new THREE.LatheGeometry(pts,18),mat(f.color,{roughness:.72}),[0,.58,0]);
  const fruit=[['#F5D340',-.32,.96,.05],['#FF8A3D',.25,.93,.08],['#E8734C',0,1.08,-.13],['#8F5FD0',.15,1.04,.28],['#E8734C',-.18,1.02,.25]];
  fruit.forEach(([c,x,y,z],i)=>{add(g,lowSphere(.22),mat(c),[x,y,z],[0,0,0],[1,i===0?.75:1,1]);});
  return g;
}

const makers={
  Sunberry:makeSunberry, Thornpear:makeThornpear, Frostcap:makeFrostcap, Emberbulb:makeEmberbulb,
  Lumenspore:makeLumenspore, Cragmoss:makeCragmoss, Kelpfruit:makeKelpfruit, Tidefruit:makeTidefruit,
  Reefberry:makeReefberry, Jungleplum:makeJungleplum, Grain:makeGrain, Banana:makeBanana, Mango:makeMango,
  Coconut:makeCoconut, Bread:makeBread, 'Fruit Bowl':makeFruitBowl
};

function clearModel(){
  scene.remove(modelRoot);
  modelRoot.traverse(o=>{
    if(o.geometry) o.geometry.dispose();
    if(o.material){ const mats=Array.isArray(o.material)?o.material:[o.material]; mats.forEach(m=>m.dispose());}
  });
  modelRoot=new THREE.Group(); scene.add(modelRoot);
}
function setWire(on){
  wire=on; modelRoot.traverse(o=>{if(o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.wireframe=on);}});
  document.querySelector('#wireBtn').classList.toggle('active',on);
}
function loadFood(i){
  selected=i; clearModel();
  const f=FOODS[i], fn=makers[f.name] || makeSunberry;
  modelRoot=fn(f); scene.add(modelRoot);
  // Normalize the model to a consistent inventory scale.
  const box3=new THREE.Box3().setFromObject(modelRoot);
  const size=box3.getSize(new THREE.Vector3()), center=box3.getCenter(new THREE.Vector3());
  const scale=2.25/Math.max(size.x,size.y,size.z);
  modelRoot.scale.setScalar(scale);
  modelRoot.position.sub(center.multiplyScalar(scale));
  modelRoot.position.y += .72;
  if(wire) setWire(true);

  document.querySelector('#title').textContent=f.name;
  document.querySelector('#meta').textContent=`ID ${f.id} • Food • ${f.color}`;
  document.querySelector('#details').innerHTML=
    `<div><strong>Official colour:</strong> ${f.color}</div>`+
    `<div><strong>Where it comes from:</strong> ${f.source}</div>`+
    (f.madeFrom?`<div><strong>Made from:</strong> ${f.madeFrom}</div>`:'')+
    `<div><strong>Goes into:</strong> ${f.goesInto}</div>`;
  [...list.children].forEach((el,n)=>el.classList.toggle('active',n===i));
  setCamera('iso');
}
function setCamera(view){
  const d=5.2, t=new THREE.Vector3(0,.72,0);
  const p={
    iso:[4.8,3.5,5.5], front:[0,.8,d], back:[0,.8,-d], left:[-d,.8,0],
    right:[d,.8,0], top:[0,d,.01], bottom:[0,-d,.01]
  }[view] || [4.8,3.5,5.5];
  camera.position.set(...p); controls.target.copy(t); controls.update();
}
FOODS.forEach((f,i)=>{
  const b=document.createElement('button'); b.className='food';
  b.innerHTML=`<span class="swatch" style="background:${f.color}"></span><span><div class="name">${f.name}</div><div class="id">ID ${f.id}</div></span><span class="badge">${f.color}</span>`;
  b.onclick=()=>{loadFood(i); sidebar.classList.remove('open');}; list.appendChild(b);
});

document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setCamera(b.dataset.view));
document.querySelector('#autoBtn').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.classList.toggle('active',controls.autoRotate);}
document.querySelector('#wireBtn').onclick=()=>setWire(!wire);
document.querySelector('#gridBtn').onclick=e=>{grid.visible=!grid.visible;e.currentTarget.classList.toggle('active',grid.visible);}
document.querySelector('#resetBtn').onclick=()=>setCamera('iso');
document.querySelector('#menuBtn').onclick=()=>sidebar.classList.toggle('open');

document.querySelector('#pngBtn').onclick=()=>{
  renderer.render(scene,camera);
  const a=document.createElement('a');
  a.download=`${FOODS[selected].id}_${FOODS[selected].name.toLowerCase().replaceAll(' ','_')}.png`;
  a.href=renderer.domElement.toDataURL('image/png'); a.click();
};
document.querySelector('#glbBtn').onclick=()=>{
  const exporter=new GLTFExporter();
  const clone=modelRoot.clone(true);
  exporter.parse(clone,(result)=>{
    const blob=new Blob([result],{type:'model/gltf-binary'});
    const a=document.createElement('a');
    a.download=`${FOODS[selected].id}_${FOODS[selected].name.toLowerCase().replaceAll(' ','_')}.glb`;
    a.href=URL.createObjectURL(blob); a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  },console.error,{binary:true,onlyVisible:true});
};

function resize(){
  const w=host.clientWidth,h=host.clientHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
addEventListener('resize',resize); resize();

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
loadFood(0); animate();
