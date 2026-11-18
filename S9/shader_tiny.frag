precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
void main(){
vec2 q=gl_FragCoord.xy/u_resolution.y*9.,i=floor(q),p=fract(q)-.5;
float t=u_time,r=fract(sin(dot(i,vec2(12.9,78.2)))*43758.5),a=t*(r-.5)*3.+r*6.3,l=length(q-4.5);
p*=mat2(cos(a),sin(a),-sin(a),cos(a));
float d=max(abs(p.x),abs(p.y))*(1.+.5*sin(t*2.-l));
gl_FragColor=vec4(.5+.5*cos(6.3*(r*.3+vec3(0,.3,.6)+t*.05+l*.1)),1)*(1.-smoothstep(.3,.34,d));
}
