import * as T from './assets/three.module.js';
const mix=(a,b,t)=>a+(b-a)*t, smooth=t=>t*t*(3-2*t);
export function startWorld({lite=false,onFail=()=>{}}={}){
 const host=document.querySelector('#world'),scene=new T.Scene(),camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.05,200);
 let renderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{onFail();return{update(){},setLite(){},setPaused(){}}}
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,lite?.8:1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFail()});
 scene.add(new T.HemisphereLight(0xd3e9ef,0x18352d,2));const sun=new T.DirectionalLight(0xffe8ba,3.2);scene.add(sun,sun.target);const rim=new T.DirectionalLight(0x80dfce,1.5);rim.position.set(20,5,-6);scene.add(rim);
 const mat=(color,more={})=>new T.MeshStandardMaterial({color,roughness:.88,...more});
 const m={bark:mat(0x75533a),leaf:mat(0x35795a),light:mat(0x609064),pine:mat(0x285c4c),grass:mat(0x547449),stone:mat(0x7c9182),soil:mat(0x393f35),sand:mat(0xabb790),dark:mat(0x142624),deer:mat(0xbb8754),belly:mat(0xebd7ac),eye:mat(0x101616)};
 function mesh(geo,material,parent,pos=[0,0,0],scale=[1,1,1]){const o=new T.Mesh(geo,material);o.position.set(...pos);o.scale.set(...scale);parent.add(o);return o}
 const sphere=new T.SphereGeometry(1,20,14),ico=new T.IcosahedronGeometry(1,1),cylinder=new T.CylinderGeometry(1,1,1,9),cone=new T.ConeGeometry(1,1,10);
 function rod(parent,a,b,w,material){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(cylinder,material,parent,a,[w,d.length(),w]);o.position.addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
 let dirty=true;const loader=new T.TextureLoader(),earthMap=loader.load('./assets/earth.jpg',()=>dirty=true);earthMap.colorSpace=T.SRGBColorSpace;const cloudMap=loader.load('./assets/clouds.png',()=>dirty=true);
 function globe(x){const g=new T.Group();g.position.x=x;scene.add(g);const earth=mesh(new T.SphereGeometry(2.4,80,56),new T.MeshStandardMaterial({map:earthMap,roughness:.82}),g);earth.rotation.set(.12,-1.4,.05);const clouds=mesh(new T.SphereGeometry(2.425,64,48),new T.MeshStandardMaterial({map:cloudMap,transparent:true,opacity:.35,depthWrite:false}),g);clouds.rotation.copy(earth.rotation);mesh(new T.SphereGeometry(2.49,64,48),new T.ShaderMaterial({transparent:true,side:T.BackSide,depthWrite:false,vertexShader:'varying vec3 n; varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n; varying vec3 v;void main(){float a=pow(1.-abs(dot(n,v)),3.);gl_FragColor=vec4(.20,.61,1.,a*.65);}'}),g);return{g,earth,clouds}}
 const first=globe(0),last=globe(49);
 let seed=13;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}const verts=[];for(let i=0;i<1300;i++)verts.push(rand()*140-40,rand()*75-28,-15-rand()*50);const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(verts,3));const stars=new T.Points(sg,new T.PointsMaterial({color:0xb0d4db,size:.045,transparent:true,opacity:.7}));scene.add(stars);
 const land=new T.Group();land.position.set(25,-.65,0);scene.add(land);
 mesh(new T.CylinderGeometry(5.7,4.7,1.4,64),m.soil,land,[0,-1.8,0],[1,1,.8]);mesh(new T.CylinderGeometry(5.66,5.6,.16,64),m.sand,land,[0,-1.05,0],[1,1,.8]);mesh(sphere,m.grass,land,[-2.6,.01,-.25],[2.85,.65,4.25]);mesh(sphere,m.grass,land,[3,.03,.2],[2.25,.6,3.9]);
 const wg=new T.PlaneGeometry(2.15,8.2,22,70);wg.rotateX(-Math.PI/2);const wm=new T.MeshPhysicalMaterial({color:0x239caa,metalness:.15,roughness:.18,transparent:true,opacity:.76,side:T.DoubleSide,clearcoat:1});mesh(wg,wm,land,[.4,.04,0]);const wb=wg.attributes.position.array.slice();mesh(new T.BoxGeometry(2.15,1.15,8.2),new T.MeshStandardMaterial({color:0x14889a,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide}),land,[.4,-.51,0]);
 const ripples=[];for(let i=0;i<13;i++){const r=mesh(new T.TorusGeometry(.16+rand()*.35,.009,5,48),new T.MeshBasicMaterial({color:0xa6eee4,transparent:true,opacity:.22}),land,[rand()*1.8-.5,.095,rand()*7-3.5]);r.rotation.x=-Math.PI/2;r.scale.x=1.7;ripples.push(r)}
 const trees=[];function tree(x,z,h,pine=false){const g=new T.Group();g.position.set(x,.27,z);land.add(g);mesh(new T.CylinderGeometry(.07*h,.11*h,h,9),m.bark,g,[0,h/2,0]);if(pine){for(let i=0;i<3;i++)mesh(cone,i%2?m.leaf:m.pine,g,[0,h*(.62+i*.2),0],[h*(.38-i*.07),h*.64,h*(.38-i*.07)])}else{for(let i=0;i<5;i++){const a=i*2.4;mesh(ico,i%2?m.light:m.leaf,g,[Math.cos(a)*h*.2,h*(.88+(i%2)*.13),Math.sin(a)*h*.19],[h*.42,h*.48,h*.42])}rod(g,[0,h*.6,0],[h*.35,h*.95,.1],.035*h,m.bark)}g.rotation.y=rand()*6;trees.push(g);return g}
 [[-3.9,-2.6,2.5],[-2.5,-2.9,3.2],[-1.3,-2.3,2.4],[-4.2,-.7,2.9],[-2.9,-.8,2.6],[-1.7,.2,2.3],[-3.9,1.5,2.1],[-2.6,2.3,1.9],[2.2,-2.9,2.6],[3.5,-2.4,3],[4.6,-2,2.1],[4.7,-1.2,1.7]].forEach((v,i)=>tree(...v,i%3===0));
 for(let i=0;i<65;i++){const x=rand()*10-5,z=rand()*7.4-3.7;if(Math.abs(x-.4)<1.28||x*x+z*z/.64>27)continue;const s=.09+rand()*.2,r=mesh(ico,m.stone,land,[x,.21,z],[s*1.6,s,s]);r.rotation.set(rand(),rand(),rand())}
 const grass=new T.InstancedMesh(new T.ConeGeometry(.035,.24,3),mat(0x85aa64),360);let gi=0;const dummy=new T.Object3D();for(let i=0;i<600&&gi<360;i++){let x=rand()*10-5,z=rand()*7-3.5;if(Math.abs(x-.4)<1.5||x*x+z*z/.65>25)continue;dummy.position.set(x,.38,z);dummy.rotation.set(0,rand()*6,(rand()-.5)*.4);dummy.scale.setScalar(.7+rand());dummy.updateMatrix();grass.setMatrixAt(gi++,dummy.matrix)}grass.count=gi;land.add(grass);
 for(let i=0;i<16;i++){let x=-1.8-rand()*2,z=rand()*4-1;mesh(cylinder,m.belly,land,[x,.35,z],[.025,.22,.025]);mesh(new T.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI/2),mat(i%2?0xe8b477:0xa65937),land,[x,.46,z],[1,.7,1])}
 const fish=[];for(let i=0;i<8;i++){const g=new T.Group();g.position.set(.2+(rand()-.5)*1.2,-.42-rand()*.38,rand()*5-2.5);land.add(g);mesh(sphere,mat(i%2?0xe6c986:0xa8c6bf,{metalness:.28}),g,[0,0,0],[.28,.115,.1]);const tail=mesh(cone,mat(0x86bcb1),g,[-.29,0,0],[.12,.2,.03]);tail.rotation.z=-Math.PI/2;mesh(sphere,m.eye,g,[.18,.025,.09],[.018,.018,.012]);g.userData.base=g.position.clone();fish.push(g)}
 for(let i=0;i<16;i++){const g=new T.Group();g.position.set((i%2?1.15:-.38)+rand()*.15,-1,rand()*6-3);land.add(g);for(let j=0;j<3;j++){const points=[new T.Vector3(0,0,0),new T.Vector3(Math.sin(j)*.12,.28,0),new T.Vector3(Math.cos(j)*.19,.55+rand()*.3,.05)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),8,.025,4,false),mat(0x3d9780),g)}}
 function deer(x,z,scale=1){const g=new T.Group();g.position.set(x,.5,z);g.scale.setScalar(scale);land.add(g);mesh(sphere,m.deer,g,[0,.7,0],[.65,.33,.26]);mesh(sphere,m.belly,g,[.09,.58,0],[.46,.2,.265]);rod(g,[.43,.72,0],[.67,1.42,0],.18,m.deer);mesh(sphere,m.deer,g,[.77,1.46,0],[.32,.18,.17]);mesh(sphere,m.eye,g,[1.02,1.44,.02],[.07,.06,.1]);for(const zz of [-.19,.19]){mesh(sphere,m.eye,g,[.85,1.54,zz*.8],[.025,.025,.015]);const ear=mesh(sphere,m.deer,g,[.61,1.69,zz],[.07,.21,.09]);ear.rotation.z=zz>0?-.5:.4;for(const xx of [-.43,.41]){rod(g,[xx,.59,zz],[xx-.05,.08,zz],.045,m.deer);mesh(cylinder,m.dark,g,[xx-.05,.045,zz],[.06,.09,.06])}rod(g,[.62,1.61,zz],[.48,2.04,zz*1.7],.025,m.belly);rod(g,[.50,1.9,zz*1.5],[.73,2.02,zz*1.8],.018,m.belly)}mesh(sphere,m.belly,g,[-.65,.83,0],[.17,.1,.1]);g.rotation.y=-.4;return g}
 deer(2.55,.7,1.05);deer(3.6,1.3,.58);tree(1.95,2.5,1.05);const guard=mesh(new T.TorusGeometry(.53,.025,6,48),mat(0xd7bb7c),land,[1.95,.23,2.5]);guard.rotation.x=Math.PI/2;
 const mg=new T.BufferGeometry(),ma=[];for(let i=0;i<100;i++)ma.push(rand()*10-5,rand()*4,rand()*7-3.5);mg.setAttribute('position',new T.Float32BufferAttribute(ma,3));const motes=new T.Points(mg,new T.PointsMaterial({color:0xf2e5aa,size:.025,transparent:true,opacity:.4}));land.add(motes);
 // Camera points belong to positions on the page, never to elapsed time.
 const keys=[
 {p:[-2.1,.6,10.8],t:[-2.1,0,0],bg:0x071722},
 {p:[-1.65,.8,9.4],t:[-1.65,.1,0],bg:0x102c40},
 {p:[18.6,7.6,14.7],t:[22.4,.5,0],bg:0x173c3c},
 {p:[19.8,3.3,9.8],t:[22.6,.5,0],bg:0x102c2b},
 {p:[21.2,3.2,9.5],t:[24.2,0,.4],bg:0x092a31},
 {p:[24.3,-1.08,5.8],t:[24.7,-1.2,0],bg:0x073748},
 {p:[24,2.8,8.6],t:[26.4,.45,.5],bg:0x142d2a},
 {p:[25,2.15,7.1],t:[26.75,.65,.8],bg:0x172e28},
 {p:[22,4.8,10.8],t:[24.3,.45,1],bg:0x193731},
 {p:[22.8,2.6,7.8],t:[24.9,.55,1.7],bg:0x153831},
 {p:[45.9,2,16],t:[46.9,0,0],bg:0x0b202b},
 {p:[46.9,.6,10.8],t:[46.9,0,0],bg:0x081b25}];
 let position=0,paused=false,time=0,previous=performance.now(),lastFrame=0;
 function draw(now){requestAnimationFrame(draw);let dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden)return;if(now-lastFrame<(lite?90:32)&&!dirty)return;lastFrame=now;if(!lite&&!paused)time+=dt;if((lite||paused)&&!dirty)return;
 const a=Math.min(keys.length-2,Math.floor(position)),b=a+1,u=smooth(position-a),k=keys[a],l=keys[b],cp=k.p.map((v,i)=>mix(v,l.p[i],u)),ct=k.t.map((v,i)=>mix(v,l.t[i],u));
 if(innerWidth<750){cp[0]+=1.65;ct[0]+=1.65;cp[1]+=1.8;ct[1]-=1.6;camera.fov=50}else camera.fov=38;camera.position.set(...cp);camera.lookAt(...ct);camera.updateProjectionMatrix();sun.position.set(cp[0]-4,7,8);sun.target.position.set(ct[0],0,0);
 const bg=new T.Color(k.bg).lerp(new T.Color(l.bg),u),dive=Math.max(0,1-Math.abs(position-5));renderer.setClearColor(bg,1);scene.fog=new T.FogExp2(bg,.009+dive*.025);
 first.earth.rotation.y=-1.4+position*.12;first.clouds.rotation.y=first.earth.rotation.y+.03+time*.004;last.earth.rotation.y=-1.1+(position-10)*.18;last.clouds.rotation.y=last.earth.rotation.y+time*.004;first.g.visible=position<2.3;land.visible=position>1.1&&position<10.6;last.g.visible=position>9.2;stars.material.opacity=position>1.5&&position<9.5?.06:.7;
 if(land.visible){const ar=wg.attributes.position.array;for(let i=0;i<ar.length;i+=3)ar[i+1]=wb[i+1]+Math.sin(ar[i]*4+time*.7)*.018+Math.sin(ar[i+2]*3+time*.9)*.025;wg.attributes.position.needsUpdate=true;wm.opacity=mix(.76,.28,dive);fish.forEach((f,i)=>{f.position.x=f.userData.base.x+Math.sin(time*.28+i)*.16;f.position.z=f.userData.base.z+Math.sin(time*.2+i)*.4;f.rotation.y=Math.sin(time*.2+i)*.35});trees.forEach((t,i)=>t.rotation.z=Math.sin(time*.4+i)*.008);motes.rotation.y=time*.008;ripples.forEach((r,i)=>r.material.opacity=.13+Math.sin(time*.6+i)*.08)}
 renderer.render(scene,camera);dirty=false;
 }requestAnimationFrame(draw);addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;dirty=true});
 return{update(p){position=Math.max(0,Math.min(11,p));dirty=true},setLite(v){lite=v;renderer.setPixelRatio(v?.8:Math.min(devicePixelRatio,1.5));dirty=true},setPaused(v){paused=v;dirty=true}};
}

