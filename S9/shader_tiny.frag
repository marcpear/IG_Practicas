precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
void main(){
vec2 q=gl_FragCoord.xy/u_resolution.y*9.,i=floor(q),p=fract(q)-.5;
float t=u_time,r=fract(sin(dot(i,vec2(13,80)))*5000.),l=length(q-4.5);
float d=max(abs(p.x),abs(p.y))*(1.+.5*sin(t*2.-l));
gl_FragColor=vec4(.5+.5*cos(6.3*(r*.3+vec3(0,0.3,0.4)+t*.05+l*.1)),1)*(1.-smoothstep(.3,.3,d));
}