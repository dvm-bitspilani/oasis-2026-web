type LogoDot={x:number;y:number;size:number;order:number;phase:number;isGap:boolean;clusterId:number;rankInCluster:number;growthJitter:number;settled:boolean;twinkle:boolean};
type GapCluster={id:number;indices:number[];cx:number;cy:number;originRank:number;originX:number;originY:number;threshold:number;launched:boolean;filled:boolean;fillTime:number|null;impactX:number|null;impactY:number|null};
type Message=
 | {type:"init";canvas:OffscreenCanvas}
 | {type:"resize";width:number;height:number;dpr:number;logoDots:LogoDot[];gapClusters:GapCluster[]}
 | {type:"fillCluster";id:number;impactX:number;impactY:number}
 | {type:"pause"}|{type:"resume"}|{type:"destroy"};

let canvas:OffscreenCanvas|null=null;
let ctx:OffscreenCanvasRenderingContext2D|null=null;
let settledCanvas:OffscreenCanvas|null=null;
let settledCtx:OffscreenCanvasRenderingContext2D|null=null;
let width=0,height=0,dpr=1;
let logoDots:LogoDot[]=[];
let gapClusters:GapCluster[]=[];
let settledX=0,settledY=0,clearX=0,clearY=0,clearW=0,clearH=0;
let hasSettled=false,running=false,frame=0,lastFrameTime=0,virtualElapsed=0;

type FrameHandle=number;
const requestWorkerFrame=(cb:(time:number)=>void):FrameHandle=>{
  const scope=globalThis as typeof globalThis & {requestAnimationFrame?: (fn:(time:number)=>void)=>number};
  if(typeof scope.requestAnimationFrame==="function") return scope.requestAnimationFrame(cb);
  return globalThis.setTimeout(()=>cb(performance.now()),16) as unknown as number;
};
const cancelWorkerFrame=(id:FrameHandle)=>{
  const scope=globalThis as typeof globalThis & {cancelAnimationFrame?: (id:number)=>void};
  if(typeof scope.cancelAnimationFrame==="function") scope.cancelAnimationFrame(id);
  else globalThis.clearTimeout(id);
};

const TAU=Math.PI*2;
const AMBIENT_REVEAL_TIME=450,AMBIENT_ORDER_STAGGER=.45,AMBIENT_REVEAL_WINDOW=.35;
const SETTLED_PULSE=.95,IMPACT_LOCK_MS=220,GROWTH_STEP_MS=30,GROWTH_SPEED_JITTER=.5,GROWTH_DOT_FADE_MS=260;
const STRIKE_FLASH_DURATION=260,STRIKE_FLASH_MAX_SIZE=16,SHOCKWAVE_DURATION=420,SHOCKWAVE_MAX_RADIUS=30;
const MAX_FRAME_DT=1000/30,LOGO_FILL="rgb(180, 225, 255)";
const ease=(v:number)=>v*v*(3-2*v);

function makeGlowSprite(size=64){
  const c=new OffscreenCanvas(size,size),g=c.getContext("2d");
  if(!g)return c;
  const grad=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  grad.addColorStop(0,"rgba(255,255,255,1)");
  grad.addColorStop(.4,"rgba(255,255,255,.35)");
  grad.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=grad;g.fillRect(0,0,size,size);return c;
}
const glowSprite=makeGlowSprite();

function drawDot(target:OffscreenCanvasRenderingContext2D,dot:LogoDot,local:number,pulse:number,lockPulse:number){
  const opacity=.035+local*.965*pulse,r=dot.size*(.7+local*.55)*lockPulse;
  if(local>.02){
    const g=r*(4+local*4)*.7;
    target.globalAlpha=opacity*local*.6;
    target.drawImage(glowSprite,dot.x-g/2,dot.y-g/2,g,g);
  }
  target.globalAlpha=opacity;target.beginPath();target.arc(dot.x,dot.y,r*1.3,0,TAU);target.fill();target.globalAlpha=1;
}

function setup(){
  if(!canvas)return;
  canvas.width=Math.max(1,Math.round(width*dpr));
  canvas.height=Math.max(1,Math.round(height*dpr));
  ctx=canvas.getContext("2d");if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=LOGO_FILL;ctx.strokeStyle=LOGO_FILL;
  settledCanvas=new OffscreenCanvas(1,1);settledCtx=settledCanvas.getContext("2d");if(!settledCtx)return;

  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const d of logoDots){if(d.x<minX)minX=d.x;if(d.y<minY)minY=d.y;if(d.x>maxX)maxX=d.x;if(d.y>maxY)maxY=d.y;}
  if(!Number.isFinite(minX)){minX=0;minY=0;maxX=width;maxY=height;}
  const pad=24;settledX=Math.floor(minX-pad);settledY=Math.floor(minY-pad);
  const sw=Math.max(1,Math.ceil(maxX+pad)-settledX),sh=Math.max(1,Math.ceil(maxY+pad)-settledY);
  settledCanvas.width=Math.max(1,Math.ceil(sw*dpr));settledCanvas.height=Math.max(1,Math.ceil(sh*dpr));
  settledCtx.setTransform(dpr,0,0,dpr,-settledX*dpr,-settledY*dpr);settledCtx.fillStyle=LOGO_FILL;

  const ep=52;
  clearX=Math.max(0,settledX-ep);clearY=Math.max(0,settledY-ep);
  clearW=Math.max(0,Math.min(width,settledX+sw+ep)-clearX);
  clearH=Math.max(0,Math.min(height,settledY+sh+ep)-clearY);
  hasSettled=false;
}

function render(time:number){
  if(!running||!ctx){frame=0;return;}
  const dt=Math.min(Math.max(time-lastFrameTime,0),MAX_FRAME_DT);
  lastFrameTime=time;virtualElapsed+=dt;
  const elapsed=virtualElapsed;
  ctx.clearRect(clearX,clearY,clearW,clearH);
  if(hasSettled&&settledCanvas)ctx.drawImage(settledCanvas,settledX,settledY,settledCanvas.width/dpr,settledCanvas.height/dpr);

  for(let i=0;i<logoDots.length;i++){
    const dot=logoDots[i];if(dot.settled)continue;
    let local=0,cluster:GapCluster|undefined;
    if(dot.isGap){
      cluster=gapClusters[dot.clusterId];if(!cluster||!cluster.filled||cluster.fillTime===null)continue;
      const rankDist=Math.abs(dot.rankInCluster-cluster.originRank);
      const speedFactor=1-GROWTH_SPEED_JITTER/2+dot.growthJitter*GROWTH_SPEED_JITTER;
      const arrivalTime=rankDist===0?0:IMPACT_LOCK_MS+rankDist*GROWTH_STEP_MS*speedFactor;
      local=ease(Math.min(1,Math.max(0,(elapsed-cluster.fillTime-arrivalTime)/GROWTH_DOT_FADE_MS)));
    }else{
      const ambientP=Math.min(1,elapsed/AMBIENT_REVEAL_TIME);
      local=ease(Math.min(1,Math.max(0,(ambientP-dot.order*AMBIENT_ORDER_STAGGER)/AMBIENT_REVEAL_WINDOW)));
    }
    if(local<=.001)continue;
    const isImpact=!!cluster&&dot.rankInCluster===cluster.originRank;
    const lockAge=cluster&&cluster.fillTime!==null?elapsed-cluster.fillTime:Infinity;
    const locking=isImpact&&lockAge<IMPACT_LOCK_MS;
    const lockPulse=locking?1+Math.sin(lockAge/IMPACT_LOCK_MS*Math.PI)*.45:1;
    const pulse=dot.twinkle?.9+.1*((Math.sin(elapsed*.002+dot.phase)+1)/2):SETTLED_PULSE;
    drawDot(ctx,dot,local,pulse,lockPulse);
    if(!dot.twinkle&&local>=1&&!locking&&settledCtx){drawDot(settledCtx,dot,1,SETTLED_PULSE,1);dot.settled=true;hasSettled=true;}
  }

  for(let i=0;i<gapClusters.length;i++){
    const c=gapClusters[i];if(!c.filled||c.fillTime===null)continue;
    const age=elapsed-c.fillTime;if(age>=SHOCKWAVE_DURATION)continue;
    const ix=c.impactX??c.originX,iy=c.impactY??c.originY;
    if(age<STRIKE_FLASH_DURATION){
      const e=ease(age/STRIKE_FLASH_DURATION),size=7+e*(STRIKE_FLASH_MAX_SIZE+5);
      ctx.globalAlpha=(1-e)*.75;ctx.drawImage(glowSprite,ix-size/2,iy-size/2,size,size);
    }
    const e=ease(age/SHOCKWAVE_DURATION);ctx.globalAlpha=(1-e)*.35;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(ix,iy,2+e*SHOCKWAVE_MAX_RADIUS,0,TAU);ctx.stroke();ctx.globalAlpha=1;
  }
  frame=requestWorkerFrame(render);
}

function start(){if(running||!ctx)return;running=true;lastFrameTime=performance.now();frame=requestWorkerFrame(render);}
function stop(){running=false;if(frame){cancelWorkerFrame(frame);frame=0;}}

const workerScope=globalThis as unknown as {onmessage:((event:MessageEvent<Message>)=>void)|null};
workerScope.onmessage=(event)=>{
  const m=event.data;
  if(m.type==="init"){canvas=m.canvas;return;}
  if(m.type==="resize"){width=m.width;height=m.height;dpr=m.dpr;logoDots=m.logoDots;gapClusters=m.gapClusters;virtualElapsed=0;setup();start();return;}
  if(m.type==="fillCluster"){const c=gapClusters[m.id];if(c){c.filled=true;c.fillTime=virtualElapsed;c.impactX=m.impactX;c.impactY=m.impactY;}return;}
  if(m.type==="pause"){stop();return;}
  if(m.type==="resume"){start();return;}
  stop();canvas=null;ctx=null;settledCanvas=null;settledCtx=null;logoDots=[];gapClusters=[];
};
export {};
