(() => {
  'use strict';
  const canvas=document.querySelector('#field-canvas');
  const status=document.querySelector('#render-status');
  if(!canvas)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'high-performance',preserveDrawingBuffer:false});
  if(!gl){if(status)status.textContent='STATIC FALLBACK';return}

  const vs=`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
  const fs=`
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec2 uPointer;
    #define MAX_STEPS 78
    #define FAR 12.0

    float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
    float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}

    float map(vec3 p){
      p.xz*=rot(.16+uPointer.x*.08);p.yz*=rot(-.22+uPointer.y*.06);
      float t=uTime*.12;
      vec3 a=vec3(cos(t)*.64,sin(t*1.13)*.26,sin(t)*.44);
      vec3 b=vec3(cos(t+2.094)*.67,sin(t*.91+1.2)*.31,sin(t+2.094)*.48);
      vec3 c=vec3(cos(t+4.188)*.61,sin(t*1.07+2.4)*.28,sin(t+4.188)*.42);
      float d=smin(smin(length(p-a)-.63,length(p-b)-.60,.73),length(p-c)-.58,.72);
      float corr=sin(p.x*8.+sin(p.z*3.))*sin(p.y*7.-p.z*2.);
      corr+=.55*sin((p.x+p.y+p.z)*13.);d+=corr*.022;
      float cut=-(length(p.xy*vec2(.78,1.))-.29);d=max(d,cut*.45);return d;
    }

    vec3 normalAt(vec3 p){vec2 e=vec2(.0023,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
    float march(vec3 ro,vec3 rd,out vec3 p){float depth=0.;for(int i=0;i<MAX_STEPS;i++){p=ro+rd*depth;float d=map(p);if(abs(d)<.0015||depth>FAR)break;depth+=max(d*.72,.006);}return depth;}
    vec3 stars(vec2 uv){vec2 g=floor(uv*170.);vec2 f=fract(uv*170.)-.5;float h=hash21(g);float star=(1.-smoothstep(0.,.05,length(f)))*step(.985,h);float dust=pow(hash21(g+8.7),18.)*.07;return vec3(.025,.034,.032)+star*mix(vec3(.35,.44,.48),vec3(.95),h)+dust;}

    void main(){
      vec2 frag=gl_FragCoord.xy;vec2 uv=(frag*2.-uResolution.xy)/uResolution.y;vec2 suv=frag/uResolution.xy;
      vec3 bg=stars(suv);float vignette=1.-smoothstep(.18,1.15,length(uv*vec2(.62,.85)));bg*=.68+.32*vignette;
      vec3 ro=vec3(0.,.05,4.05);ro.x+=uPointer.x*.18;ro.y+=uPointer.y*.10;
      float shift=(uResolution.x/uResolution.y<.9)?0.:.30;vec3 rd=normalize(vec3((uv.x-shift)*.80,uv.y*.80,-1.58));
      vec3 p;float depth=march(ro,rd,p);vec3 color=bg;
      if(depth<FAR){
        vec3 n=normalAt(p);vec3 lightDir=normalize(vec3(-.55,.74,.62));float diffuse=max(dot(n,lightDir),0.);
        float rim=pow(1.-max(dot(n,-rd),0.),2.7);float facing=max(dot(n,-rd),0.);
        float bands=.5+.5*sin((p.y*17.+p.x*5.5+p.z*8.)+n.x*5.);bands=smoothstep(.66,.93,bands);
        vec3 lit=vec3(.105,.145,.153)*(.55+diffuse*1.05);lit+=vec3(.35,.43,.44)*rim*.85;lit+=bands*vec3(.18,.22,.22)*(.2+rim);lit+=pow(diffuse,14.)*vec3(.55,.62,.60)*.36;lit*=.78+facing*.32;
        float fade=1.-smoothstep(2.,8.,depth);color=mix(bg,lit,fade);
      }
      color+=sin(gl_FragCoord.y*1.2)*.008;color=pow(color,vec3(.88));gl_FragColor=vec4(color,1.);
    }
  `;

  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(msg||'Shader compilation failed')}return s};

  try{
    const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Program link failed');gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const uRes=gl.getUniformLocation(program,'uResolution'),uTime=gl.getUniformLocation(program,'uTime'),uPointer=gl.getUniformLocation(program,'uPointer');
    const pointer={x:0,y:0,tx:0,ty:0};const started=performance.now();let raf=0,visible=true;

    const resize=()=>{const rect=canvas.parentElement.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,innerWidth<760?1.05:1.45);const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}};
    const frame=now=>{if(!visible)return;resize();pointer.x+=(pointer.tx-pointer.x)*.045;pointer.y+=(pointer.ty-pointer.y)*.045;gl.uniform2f(uRes,canvas.width,canvas.height);gl.uniform1f(uTime,reduced.matches?0:(now-started)/1000);gl.uniform2f(uPointer,pointer.x,pointer.y);gl.drawArrays(gl.TRIANGLES,0,3);raf=requestAnimationFrame(frame)};
    addEventListener('pointermove',e=>{pointer.tx=(e.clientX/innerWidth-.5)*2;pointer.ty=(e.clientY/innerHeight-.5)*-2},{passive:true});
    addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible&&!raf)raf=requestAnimationFrame(frame);if(!visible&&raf){cancelAnimationFrame(raf);raf=0}});
    resize();raf=requestAnimationFrame(frame);if(status)status.textContent=reduced.matches?'MOTION LOCKED':'REALTIME';
  }catch(error){console.warn('WebGL field renderer unavailable.',error);if(status)status.textContent='STATIC FALLBACK'}
})();
