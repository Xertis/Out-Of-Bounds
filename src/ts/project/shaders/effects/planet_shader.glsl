#version 300 es

precision highp float;

#define W 1024
#define H 1024

#define uRes vec2(W, H)

#param float uTime;
#param float uSpin;
#param float uScope;
//#param vec3 uTex[W*H];

float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
vec3 rotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.z,p.y,s*p.x+c*p.z);}
vec3 rotZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
// "dUdV": точка на сфере -> координаты текстуры (зеркальный повтор по долготе = без шва)
vec2 uvOf(vec3 q){return vec2((atan(q.x,q.z)/6.2831853+.5)*2.,.5-asin(clamp(q.y,-1.,1.))/3.14159265);}

vec3 getTexColor(vec2 uv) {
    vec2 clampedUV = clamp(uv, vec2(0.0), vec2(1.0));

    int x = int(min(clampedUV.x * uRes.x, uRes.x - 1.0));
    int y = int(min(clampedUV.y * uRes.y, uRes.y - 1.0));

    int index = y * int(uRes.x) + x;

    return vec3(1);//uTex[index];
}

vec4 effect(){
    vec2 p=(gl_FragCoord.xy-.5*uRes)/(.30*min(uRes.x,uRes.y));
    float r=length(p); vec3 col=vec3(0);
    vec3 L=normalize(vec3(-.82,.22,.52));
    float spin=uSpin+uTime*.04, tilt=-.31;
    // звёзды
    vec2 g=floor(gl_FragCoord.xy/2.); float h=hash(vec3(g,3.));
    col+=vec3(step(.9985,h)*(.3+.7*hash(vec3(g,9.))));
    if(r<1.){
        float z=sqrt(1.-r*r); vec3 n=vec3(p,z);
        vec3 q=rotY(rotZ(n,tilt),spin);
        vec3 alb=getTexColor(uvOf(q)).rgb;
        float ht=dot(alb,vec3(.299,.587,.114));
        vec2 gr=vec2(dFdx(ht),dFdy(ht));                       // рельеф из яркости карты
        vec3 nb=normalize(n-vec3(gr*9.,0.)*z);
        float ndl=dot(n,L), lit=clamp(dot(nb,L),0.,1.)*.65+clamp((ndl+.08)/1.08,0.,1.)*.35;
        lit*=clamp(ndl*6.+.9,0.,1.);
        vec3 cq=rotY(rotZ(n,tilt),spin*1.15+.3);                // облака — отдельный слой
        float cd=smoothstep(.52,.78,fbm(cq*vec3(2.4,5.,2.4)));
        float sh=smoothstep(.52,.78,fbm((cq+L*.04)*vec3(2.4,5.,2.4)));
        float gy=dot(alb,vec3(.299,.587,.114)); alb=mix(vec3(gy),alb,.62);
        alb*=1.-.35*sh;                                         // тень облаков
        float limb=.35+.65*sqrt(z);
        vec3 c=alb*lit*vec3(1.,.96,.88)*1.35*limb+alb*vec3(.004,.006,.01);
        c=mix(c,vec3(.93,.94,.96)*lit*1.15,cd*.85);
        float rim=pow(1.-z,3.2)*(.25+.75*clamp(ndl+.45,0.,1.));  // атмосфера, аддитивно
        float sun=pow(clamp(dot(normalize(p+1e-5),normalize(L.xy))*.5+.5,0.,1.),1.6);
        c+=rim*(.02+.98*sun)*vec3(.35,.58,1.)*.7;
        col=c*smoothstep(1.,.992,r);
    } else {
        float sun=pow(clamp(dot(normalize(p),normalize(L.xy))*.5+.5,0.,1.),1.6);
        col+=(exp(-(r-1.)/.018)*.3+exp(-(r-1.)/.07)*.05)*(.02+.98*sun)*vec3(.35,.58,1.)*.7;
    }
    if(uScope>.5){                                           // «старый телескоп»
        float gn=hash(vec3(v_uv * uRes,floor(uTime*24.)))-.5;
        float row=hash(vec3(0.,gl_FragCoord.y,floor(uTime*24.)))-.5;
        float l=dot(col,vec3(.299,.587,.114)); col=mix(vec3(l),col,.8)*vec3(1.03,1.,.95);
        col=1.-exp(-col*1.25); col=pow(col,vec3(1./1.9));
        col=max((col-.06)*1.18,0.);
        col+=gn*(.012+.025*sqrt(l))+row*.006;
        vec2 v=v_uv-.5; col*=1.-.9*dot(v,v);
    } else col=pow(col,vec3(1./2.2));

    return vec4(col,1.);
}