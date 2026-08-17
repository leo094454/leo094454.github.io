const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const nav=$('#nav'),menu=$('#menu');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>30),{passive:true});
$('#menuBtn').onclick=()=>menu.classList.toggle('open');$$('#menu a').forEach(a=>a.onclick=()=>menu.classList.remove('open'));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(x=>obs.observe(x));
const dot=$('.cursor-dot'),ring=$('.cursor-ring');let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;burst(mx,my,Math.min(16,innerWidth/80))});
(function loop(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;dot.style.left=mx+'px';dot.style.top=my+'px';ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop)})();
$$('a,button').forEach(el=>{el.addEventListener('mouseenter',()=>{ring.style.width='48px';ring.style.height='48px'});el.addEventListener('mouseleave',()=>{ring.style.width='30px';ring.style.height='30px'});el.addEventListener('click',()=>burst(mx,my,28))});
addEventListener('touchstart',e=>{for(const t of e.touches)burst(t.clientX,t.clientY,34)},{passive:true});addEventListener('touchmove',e=>{for(const t of e.touches)burst(t.clientX,t.clientY,20)},{passive:true});
const canvas=$('#dustCanvas'),ctx=canvas.getContext('2d');let dpr=1,particles=[],bursts=[];
function resize(){dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.min(190,Math.floor(innerWidth/6))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:.08+Math.random()*.5,vy:(Math.random()-.5)*.16,r:.4+Math.random()*1.8,a:.06+Math.random()*.25}));}resize();addEventListener('resize',resize);
function burst(x,y,n){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,s=1+Math.random()*5;bursts.push({x,y,vx:Math.cos(a)*s+1.2,vy:Math.sin(a)*s,r:.7+Math.random()*2,a:.5+Math.random()*.4,life:1})}}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.x+=p.vx;p.y+=p.vy+Math.sin(p.x*.01)*.025;if(p.x>innerWidth+10)p.x=-10;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=`rgba(201,151,75,${p.a})`;ctx.fill()}for(let i=bursts.length-1;i>=0;i--){let p=bursts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy*=.985;p.life-=.025;p.r*=.99;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=`rgba(211,165,91,${p.a*p.life})`;ctx.fill();if(p.life<=0)bursts.splice(i,1)}requestAnimationFrame(draw)}draw();
// Optional background audio: browsers block autoplay. If you place assets/dance-with-the-devil.mp3 in the folder, the SOUND button will control it.
let audio=new Audio('assets/dance-with-the-devil.mp3');audio.loop=true;audio.volume=.24;let soundOn=false;$('#soundBtn').onclick=async()=>{try{if(!soundOn){await audio.play();soundOn=true;$('#soundBtn b').textContent='ON'}else{audio.pause();soundOn=false;$('#soundBtn b').textContent='OFF'}}catch(e){$('#soundBtn b').textContent='ADD MP3'}};
// Tiny parallax on hero atmosphere
addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);document.querySelector('.hero-city').style.transform=`translate(${x*10}px,${y*3}px)`;document.querySelectorAll('.hero-smoke').forEach((s,i)=>s.style.transform=`translate(${x*(i? -15:12)}px,${y*8}px)`)});
