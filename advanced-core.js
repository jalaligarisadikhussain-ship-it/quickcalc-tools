/* QuickCalc Advanced Math Core v4 — local-only calculations, no eval() */
(function(root){
"use strict";
const EPS=1e-10;
function fail(message){throw new Error(message);}
function finite(x){if(!Number.isFinite(x))fail("Result is outside calculator range");return x;}
function fmt(n){
  if(typeof n==="bigint")return n.toString();
  finite(n);if(Math.abs(n)<1e-12)return "0";
  return Number(n.toPrecision(12)).toString();
}
function num(v,name="Value"){
 const n=Number(v);
 if(String(v).trim()===""||!Number.isFinite(n))fail(name+" must be a valid number");
 return n;
}
function integer(v,name="Value"){
 const n=num(v,name);
 if(!Number.isSafeInteger(n))fail(name+" must be a safe integer");
 return n;
}
function list(v,name="Data"){
 const s=String(v).trim().split(/[\s,;]+/).filter(Boolean);
 if(!s.length)fail("Enter "+name.toLowerCase());
 if(s.length>3000)fail("Maximum 3000 numbers");
 return s.map(x=>num(x,name));
}
function trig(name,x,angle){
 const rad=angle==="RAD"?x:x*Math.PI/180;
 const deg=v=>angle==="RAD"?v:v*180/Math.PI;
 if(name==="sin")return Math.sin(rad);
 if(name==="cos")return Math.cos(rad);
 if(name==="tan"){if(Math.abs(Math.cos(rad))<1e-12)fail("Tangent is undefined at this angle");return Math.tan(rad);}
 if(name==="asin"){if(x<-1||x>1)fail("sin⁻¹ domain: -1 to 1");return deg(Math.asin(x));}
 if(name==="acos"){if(x<-1||x>1)fail("cos⁻¹ domain: -1 to 1");return deg(Math.acos(x));}
 if(name==="atan")return deg(Math.atan(x));
}
function factorial(n){
 if(!Number.isInteger(n)||n<0||n>170)fail("Factorial requires an integer 0–170");
 let v=1;for(let i=2;i<=n;i++)v*=i;return finite(v);
}
function ncr(n,r,perm){
 if(!Number.isInteger(n)||!Number.isInteger(r)||n<0||r<0||r>n||n>170)fail("Use 0 ≤ r ≤ n ≤ 170");
 if(perm){let v=1;for(let j=0;j<r;j++)v*=n-j;return finite(v);}
 r=Math.min(r,n-r);let v=1;for(let j=1;j<=r;j++)v=v*(n-r+j)/j;
 return Math.round(v);
}
function evaluate(raw,options={}){
 const angle=options.angle==="RAD"?"RAD":"DEG",vars=options.vars||{},ans=Number(options.ans||0);
 const source=String(raw).replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/π/g,"pi").replace(/\s+/g,"");
 if(!source||source.length>240)fail("Enter an expression under 240 characters");
 const tokens=[];let k=0;
 while(k<source.length){
  const s=source.slice(k);
  const number=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(s);
  if(number){tokens.push({type:"num",value:Number(number[0])});k+=number[0].length;continue;}
  const word=/^(?:nCr|nPr|mod)/.exec(s)||/^[A-Za-z][A-Za-z0-9]*/.exec(s);
  if(word){tokens.push({type:"name",value:word[0]});k+=word[0].length;continue;}
  if("+-*/^%!(),".includes(source[k])){tokens.push({type:"op",value:source[k++]});continue;}
  fail("Unsupported character in expression");
 }
 let i=0;const peek=()=>tokens[i]?.value;
 const eat=(x)=>{if(peek()===x){i++;return true;}return false;};
 function atom(){
  if(eat("(")){const v=add();if(!eat(")"))fail("Missing ')'");return v;}
  const t=tokens[i];
  if(!t)fail("Incomplete expression");
  if(t.type==="num"){i++;return t.value;}
  if(t.type!=="name")fail("Enter a number or function");
  i++;const name=t.value,lower=name.toLowerCase();
  if(lower==="pi")return Math.PI;
  if(lower==="e")return Math.E;
  if(lower==="ans")return ans;
  if(Object.prototype.hasOwnProperty.call(vars,name))return num(vars[name],name);
  if(Object.prototype.hasOwnProperty.call(vars,lower))return num(vars[lower],name);
  if(!eat("("))fail("Write "+name+"(...)");
  const arg=add();
  if(!eat(")"))fail("Close "+name+"(...)");
  if(["sin","cos","tan","asin","acos","atan"].includes(lower))return trig(lower,arg,angle);
  if(lower==="sinh")return Math.sinh(arg);
  if(lower==="cosh")return Math.cosh(arg);
  if(lower==="tanh")return Math.tanh(arg);
  if(lower==="log"){if(arg<=0)fail("log requires x > 0");return Math.log10(arg);}
  if(lower==="log2"){if(arg<=0)fail("log2 requires x > 0");return Math.log2(arg);}
  if(lower==="ln"){if(arg<=0)fail("ln requires x > 0");return Math.log(arg);}
  if(lower==="sqrt"){if(arg<0)fail("sqrt requires x ≥ 0");return Math.sqrt(arg);}
  if(lower==="cbrt")return Math.cbrt(arg);
  if(lower==="exp")return Math.exp(arg);
  if(lower==="abs")return Math.abs(arg);
  if(lower==="floor")return Math.floor(arg);
  if(lower==="ceil")return Math.ceil(arg);
  if(lower==="round")return Math.round(arg);
  fail("Unsupported function: "+name);
 }
 function postfix(){
  let v=atom();
  while(peek()==="!"||peek()==="%"){const op=peek();i++;v=op==="!"?factorial(v):v/100;}
  return v;
 }
 function power(){let v=postfix();if(eat("^"))v=Math.pow(v,unary());return v;}
 function unary(){if(eat("+"))return unary();if(eat("-"))return -unary();return power();}
 function mult(){
  let v=unary();
  while(i<tokens.length){
   const op=peek();
   if(op==="*"||op==="/"||op==="mod"){i++;const b=unary();if((op==="/"||op==="mod")&&b===0)fail("Cannot divide by zero");v=op==="*"?v*b:op==="/"?v/b:v%b;continue;}
   if(op==="nCr"||op==="nPr"){i++;v=ncr(v,unary(),op==="nPr");continue;}
   if(op==="("||(tokens[i]?.type==="name"&&op!=="mod")){v*=unary();continue;}
   break;
  }
  return v;
 }
 function add(){let v=mult();while(peek()==="+"||peek()==="-"){const op=peek();i++;const b=mult();v=op==="+"?v+b:v-b;}return v;}
 const result=add();
 if(i!==tokens.length)fail("Invalid expression");
 return finite(result);
}
function matrix(rows,cols,value){
 if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<1||rows>5||cols<1||cols>5)fail("Matrix size must be 1–5");
 const values=list(value,"Matrix entries");
 if(values.length!==rows*cols)fail("Expected "+(rows*cols)+" matrix values");
 return Array.from({length:rows},(_,r)=>values.slice(r*cols,(r+1)*cols));
}
function matShape(A){if(!Array.isArray(A)||!A.length||!A[0].length||A.some(r=>r.length!==A[0].length))fail("Invalid matrix");return [A.length,A[0].length];}
function matAdd(A,B,sign=1){const [r,c]=matShape(A),[u,v]=matShape(B);if(r!==u||c!==v)fail("Matrix dimensions must match");return A.map((row,i)=>row.map((x,j)=>finite(x+sign*B[i][j])));}
function matMul(A,B){const [r,c]=matShape(A),[u,v]=matShape(B);if(c!==u)fail("A columns must equal B rows");return A.map(row=>Array.from({length:v},(_,j)=>finite(row.reduce((s,x,k)=>s+x*B[k][j],0))));}
function transpose(A){return A[0].map((_,i)=>A.map(row=>row[i]));}
function det(A){
 const [r,c]=matShape(A);if(r!==c)fail("Determinant needs a square matrix");
 const M=A.map(row=>row.slice());let d=1;
 for(let k=0;k<r;k++){
  let p=k;for(let i=k+1;i<r;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;
  if(Math.abs(M[p][k])<EPS)return 0;
  if(k!==p){[M[k],M[p]]=[M[p],M[k]];d=-d;}
  const pivot=M[k][k];d*=pivot;
  for(let i=k+1;i<r;i++){const f=M[i][k]/pivot;for(let j=k+1;j<r;j++)M[i][j]-=f*M[k][j];}
 }return finite(d);
}
function inverse(A){
 const [n,c]=matShape(A);if(n!==c)fail("Inverse needs a square matrix");
 const M=A.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>+(i===j))]);
 for(let k=0;k<n;k++){
  let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;
  if(Math.abs(M[p][k])<EPS)fail("Matrix is singular; inverse does not exist");
  [M[k],M[p]]=[M[p],M[k]];
  const pivot=M[k][k];
  for(let j=0;j<2*n;j++)M[k][j]/=pivot;
  for(let i=0;i<n;i++)if(i!==k){
   const f=M[i][k];for(let j=0;j<2*n;j++)M[i][j]-=f*M[k][j];
  }
 }return M.map(row=>row.slice(n).map(finite));
}
function solveLinear(A,b){const [n,c]=matShape(A);if(n!==c||b.length!==n)fail("System must be square");return matMul(inverse(A),b.map(x=>[x])).map(row=>row[0]);}
function vector(value,dimension=3){const arr=list(value,"Vector");if(arr.length!==dimension)fail("Enter "+dimension+" vector coordinates");return arr;}
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const norm=a=>Math.hypot(...a);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function summary(arr){
 const s=arr.slice().sort((a,b)=>a-b),n=s.length;
 const sum=arr.reduce((a,b)=>a+b,0),mean=sum/n;
 const ss=arr.reduce((z,v)=>z+(v-mean)**2,0);
 const med=x=>{const l=x.length;return l%2?x[(l-1)/2]:(x[l/2-1]+x[l/2])/2;};
 const mid=Math.floor(n/2);
 return {n,sum,mean,median:med(s),minimum:s[0],maximum:s[n-1],range:s[n-1]-s[0],
  q1:n===1?s[0]:med(s.slice(0,mid)),
  q3:n===1?s[0]:med(s.slice(n-mid)),
  populationVariance:ss/n,populationSD:Math.sqrt(ss/n),
  sampleVariance:n>1?ss/(n-1):null,sampleSD:n>1?Math.sqrt(ss/(n-1)):null};
}
function regression(x,y){
 if(x.length!==y.length||x.length<2)fail("Enter equal X and Y lists with at least 2 pairs");
 const n=x.length,mx=x.reduce((a,b)=>a+b,0)/n,my=y.reduce((a,b)=>a+b,0)/n;
 let sxx=0,syy=0,sxy=0;
 for(let j=0;j<n;j++){const dx=x[j]-mx,dy=y[j]-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy;}
 if(sxx<EPS||syy<EPS)fail("Regression requires variation in both X and Y");
 const slope=sxy/sxx,intercept=my-slope*mx,r=sxy/Math.sqrt(sxx*syy);
 return {n,slope,intercept,r,r2:r*r,meanX:mx,meanY:my};
}
function erf(x){const sign=x<0?-1:1;x=Math.abs(x);const t=1/(1+.3275911*x);const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return sign*y;}
function normalPdf(x,mean=0,sd=1){if(sd<=0)fail("Standard deviation must be positive");const z=(x-mean)/sd;return Math.exp(-z*z/2)/(sd*Math.sqrt(2*Math.PI));}
function normalCdf(x,mean=0,sd=1){if(sd<=0)fail("Standard deviation must be positive");return .5*(1+erf((x-mean)/(sd*Math.SQRT2)));}
function normalInv(p,mean=0,sd=1){
 if(sd<=0||p<=0||p>=1)fail("Probability must be between 0 and 1; SD > 0");
 let lo=mean-12*sd,hi=mean+12*sd;
 for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(normalCdf(mid,mean,sd)<p)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
function binomial(n,k,p,cumulative=false){
 if(!Number.isInteger(n)||n<0||n>500||!Number.isInteger(k)||p<0||p>1)fail("Use integer n 0–500, integer k, and probability 0–1");
 const single=(j)=>{
  if(j<0||j>n)return 0;
  if(p===0)return j===0?1:0;
  if(p===1)return j===n?1:0;
  let log=0;for(let q=1;q<=j;q++)log+=Math.log(n-q+1)-Math.log(q);
  return Math.exp(log+j*Math.log(p)+(n-j)*Math.log1p(-p));
 };
 if(!cumulative)return single(k);
 let sum=0;for(let j=0;j<=Math.min(n,k);j++)sum+=single(j);
 return Math.min(1,sum);
}
const cx=(re,im=0)=>({re,im});
const cadd=(a,b)=>cx(a.re+b.re,a.im+b.im);
const csub=(a,b)=>cx(a.re-b.re,a.im-b.im);
const cmul=(a,b)=>cx(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const cdiv=(a,b)=>{
 const d=b.re*b.re+b.im*b.im;if(d<1e-25)fail("Cannot divide complex numbers by zero");
 return cx((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d);
};
const cabs=a=>Math.hypot(a.re,a.im);
const cfmt=z=>{
 const re=Math.abs(z.re)<1e-10?0:z.re,im=Math.abs(z.im)<1e-10?0:z.im;
 if(im===0)return fmt(re);
 if(re===0)return fmt(im)+"i";
 return fmt(re)+(im>=0?" + ":" - ")+fmt(Math.abs(im))+"i";
};
function polynomial(coeff){
 const c=coeff.map(x=>num(x));
 while(c.length>1&&Math.abs(c[0])<1e-14)c.shift();
 const n=c.length-1;
 if(n<1||n>4)fail("Polynomial degree must be 1–4");
 if(n===1)return [cx(-c[1]/c[0])];
 if(n===2){
  const [a,b,d]=c,disc=b*b-4*a*d;
  if(disc>=0)return [cx((-b+Math.sqrt(disc))/(2*a)),cx((-b-Math.sqrt(disc))/(2*a))];
  return [cx(-b/(2*a),Math.sqrt(-disc)/(2*a)),cx(-b/(2*a),-Math.sqrt(-disc)/(2*a))];
 }
 // Durand–Kerner complex iteration for degree 3 or 4.
 const monic=c.map(x=>x/c[0]),r=1+Math.max(...monic.slice(1).map(Math.abs));
 let roots=Array.from({length:n},(_,k)=>cx(r*Math.cos(2*Math.PI*(k+.14)/n),r*Math.sin(2*Math.PI*(k+.14)/n)));
 const poly=z=>monic.slice(1).reduce((v,x)=>cadd(cmul(v,z),cx(x)),cx(1));
 for(let t=0;t<1600;t++){
  let change=0;const next=roots.map((root,i)=>{
   let den=cx(1);for(let j=0;j<n;j++)if(j!==i)den=cmul(den,csub(root,roots[j]));
   if(cabs(den)<1e-24)den=cx(1e-12,1e-12);
   const delta=cdiv(poly(root),den);change=Math.max(change,cabs(delta));
   return csub(root,delta);
  });roots=next;
  if(change<1e-12)break;
 }
 return roots.sort((a,b)=>b.re-a.re||b.im-a.im).map(z=>cx(Math.abs(z.re)<1e-10?0:z.re,Math.abs(z.im)<1e-10?0:z.im));
}
function solveRoot(expr,guess=0,opts={}){
 let x=Number(guess);
 if(!Number.isFinite(x))fail("Enter a valid starting guess");
 const f=value=>evaluate(expr,{...opts,vars:{x:value}});
 for(let i=0;i<200;i++){
  const y=f(x);
  if(Math.abs(y)<1e-10)return {root:x,residual:y,iterations:i+1};
  const h=1e-5*Math.max(1,Math.abs(x));
  const derivative=(f(x+h)-f(x-h))/(2*h);
  if(!Number.isFinite(derivative)||Math.abs(derivative)<1e-13)fail("Flat slope; try another starting guess");
  const next=x-y/derivative;
  if(!Number.isFinite(next))fail("Diverged; try another starting guess");
  if(Math.abs(next-x)<1e-12*Math.max(1,Math.abs(x)))return {root:next,residual:f(next),iterations:i+1};
  x=next;
 }
 fail("No convergence; change starting guess");
}
function table(expr,other,start,end,step,opts={}){
 const a=num(start,"Start"),b=num(end,"End"),h=num(step,"Step");
 if(h===0||Math.sign(b-a)!==Math.sign(h)&&a!==b)fail("Step must point toward end");
 const n=Math.floor(Math.abs((b-a)/h)+1e-9)+1;
 if(n>151)fail("Table is limited to 151 rows");
 const items=[];
 for(let i=0;i<n;i++){
  const x=a+i*h;
  if((h>0&&x>b+1e-8)||(h<0&&x<b-1e-8))break;
  items.push({x,fx:evaluate(expr,{...opts,vars:{x}}),gx:other?evaluate(other,{...opts,vars:{x}}):null});
 }
 return items;
}
function derivative(expr,x,opts={}){
 const h=Math.max(1e-6,Math.abs(x)*1e-5);
 const f=y=>evaluate(expr,{...opts,vars:{x:y}});
 return finite((-f(x+2*h)+8*f(x+h)-8*f(x-h)+f(x-2*h))/(12*h));
}
function integrate(expr,a,b,opts={}){
 if(!Number.isFinite(a)||!Number.isFinite(b))fail("Enter finite bounds");
 const N=400,h=(b-a)/N;
 const f=x=>evaluate(expr,{...opts,vars:{x}});
 let sum=f(a)+f(b);
 for(let k=1;k<N;k++)sum+=(k%2===0?2:4)*f(a+h*k);
 return finite(sum*h/3);
}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;}
function lcm(a,b){return a===0||b===0?0:Math.abs(a/gcd(a,b)*b);}
function factors(n){
 if(n<2||n>1000000000000||!Number.isSafeInteger(n))fail("Use an integer 2 to 10¹²");
 const out=[];
 for(let d=2;d*d<=n;d=d===2?3:d+2){
  while(n%d===0){out.push(d);n/=d;}
 }
 if(n>1)out.push(n);
 return out;
}
const conversions={
 Length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.344,yd:.9144,ft:.3048,in:.0254},
 Mass:{kg:1,g:.001,mg:.000001,lb:.45359237,oz:.028349523125},
 Area:{"m²":1,"km²":1e6,"cm²":.0001,"ft²":.09290304,acre:4046.8564224,hectare:1e4},
 Volume:{L:1,mL:.001,"m³":1000,"US gal":3.785411784,"US cup":.2365882365},
 Speed:{"m/s":1,"km/h":1/3.6,mph:.44704,knot:.5144444444},
 Time:{s:1,min:60,h:3600,day:86400,week:604800},
 Pressure:{Pa:1,kPa:1000,bar:1e5,psi:6894.7572932,atm:101325},
 Energy:{J:1,kJ:1000,cal:4.184,kcal:4184,kWh:3600000},
 Temperature:{C:1,F:1,K:1},
 Angle:{deg:1,rad:180/Math.PI}
};
function convert(category,from,to,value){
 const group=conversions[category];if(!group||!(from in group)||!(to in group))fail("Choose valid units");
 const x=num(value);
 if(category==="Temperature"){
  const kelvin=from==="C"?x+273.15:from==="F"?(x-32)*5/9+273.15:x;
  if(kelvin<0)fail("Temperature cannot be below absolute zero");
  return to==="C"?kelvin-273.15:to==="F"?(kelvin-273.15)*9/5+32:kelvin;
 }
 return finite(x*group[from]/group[to]);
}
function parseBase(value,base){
 let s=String(value).trim().replace(/\s/g,"");if(!s)fail("Enter an integer");
 const neg=s.startsWith("-");if(neg)s=s.slice(1);
 if(!s||s.length>64)fail("Maximum 64 input digits");
 const dict="0123456789ABCDEF";let n=0n;
 for(const digit of s.toUpperCase()){
  const d=dict.indexOf(digit);if(d<0||d>=base)fail("Digit "+digit+" not allowed in base "+base);
  n=n*BigInt(base)+BigInt(d);
 }return neg?-n:n;
}
function baseConvert(value,base){const n=parseBase(value,base);return {bin:n.toString(2),oct:n.toString(8),dec:n.toString(10),hex:n.toString(16).toUpperCase(),value:n};}
function baseBitwise(value,base,other,action){
 const a=parseBase(value,base),b=parseBase(other||"0",base);
 let v;
 if(action==="AND")v=a&b;else if(action==="OR")v=a|b;else if(action==="XOR")v=a^b;
 else if(action==="NOT")v=BigInt.asUintN(32,~a);
 else fail("Unknown bitwise operation");
 return {bin:v.toString(2),oct:v.toString(8),dec:v.toString(),hex:v.toString(16).toUpperCase(),value:v};
}
root.QCAdvancedCore={EPS,fmt,num,integer,list,evaluate,factorial,ncr,matrix,matShape,matAdd,matMul,transpose,det,inverse,solveLinear,vector,dot,norm,cross,summary,regression,normalPdf,normalCdf,normalInv,binomial,cx,cadd,csub,cmul,cdiv,cabs,cfmt,polynomial,solveRoot,table,derivative,integrate,gcd,lcm,factors,conversions,convert,parseBase,baseConvert,baseBitwise};
})(window);