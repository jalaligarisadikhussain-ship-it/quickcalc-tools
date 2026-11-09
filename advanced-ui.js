/* QuickCalc Advanced Workbench v4 */
(() => {
"use strict";
const C=window.QCAdvancedCore;
if(!C) return;
const nav=document.getElementById("qc-mode-nav");
const advanced=document.getElementById("advanced-workbench");
const main=document.querySelector("main.main");
const view=document.getElementById("adv-view");
const output=document.getElementById("adv-result");
const title=document.getElementById("adv-title");
const desc=document.getElementById("adv-subtitle");
const saved={};
let mode="scientific";
const names=[
 ["scientific","Scientific","sin, cos, log, powers & memory"],
 ["basic","Basic","Fast everyday arithmetic"],
 ["equations","Equations","Polynomials, simultaneous equations & inequalities"],
 ["matrix","Matrices","Determinants, inverses, products & linear systems"],
 ["vector","Vectors","Dot, cross, magnitude & angle"],
 ["statistics","Statistics","1-variable summaries & linear regression"],
 ["distribution","Distribution","Normal and binomial probability"],
 ["complex","Complex","a + bi operations and polar form"],
 ["table","Table","Generate f(x) and g(x) values"],
 ["calculus","Calculus","Numerical derivative, integral & solve"],
 ["base","Base-N","Binary, octal, decimal, hex & logic"],
 ["units","Conversion","Lengths, mass, temperature & more"],
 ["number","Number tools","Prime factors, GCD, LCM & ratios"],
 ["spreadsheet","Spreadsheet","5×5 formula worksheet"]
];
const esc=str=>String(str).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function field(id,label,value="",type="text",hint=""){
 const hintAttr=hint?' placeholder="'+esc(hint)+'"':"";
 return '<label class="adv-field"><span>'+esc(label)+'</span><input id="qc-'+esc(id)+'" type="'+type+'" value="'+esc(value)+'"'+hintAttr+' autocomplete="off" spellcheck="false"></label>';
}
function textArea(id,label,value="",placeholder=""){
 return '<label class="adv-field"><span>'+esc(label)+'</span><textarea id="qc-'+esc(id)+'" rows="3" placeholder="'+esc(placeholder||value)+'">'+esc(value)+'</textarea></label>';
}
function select(id,label,choices){
 return '<label class="adv-field"><span>'+esc(label)+'</span><select id="qc-'+esc(id)+'">'+choices.map(item=>typeof item==="string"?'<option value="'+esc(item)+'">'+esc(item)+'</option>':'<option value="'+esc(item[0])+'">'+esc(item[1])+'</option>').join("")+'</select></label>';
}
function btn(label="Calculate"){return '<button class="adv-submit" type="submit">'+esc(label)+'</button>';}
const wrap=(content,help)=>'<form id="adv-form" class="adv-form"><div class="adv-fields">'+content+'</div>'+btn()+'</form>'+(help?'<p class="adv-help">'+esc(help)+'</p>':"");
function sheetFields(){
 let s='<p class="adv-help">Enter numbers or formulas starting with =, e.g. =A1*2+B1. References A1–E5 are supported.</p><div class="sheet-wrap"><div class="sheet-grid">';
 s+='<div class="sheet-head">•</div>';
 for(let c=0;c<5;c++)s+='<div class="sheet-head">'+String.fromCharCode(65+c)+'</div>';
 for(let r=1;r<=5;r++){
  s+='<div class="sheet-head">'+r+'</div>';
  for(let c=0;c<5;c++){
   const id=String.fromCharCode(65+c)+r;
   s+='<input aria-label="Cell '+id+'" id="qc-cell-'+id+'" data-sheet-cell="'+id+'" placeholder="'+id+'" autocomplete="off" spellcheck="false">';
  }
 }
 return s+'</div></div><form id="adv-form">'+btn("Calculate spreadsheet")+'</form>';
}
const templates={
 equations:()=>wrap(
  select("eq-type","Problem type",[["polynomial","Polynomial roots (degree 1–4)"],["linear2","2 simultaneous equations"],["linear3","3 simultaneous equations"],["root","Solve f(x)=0 numerically"],["inequality","Quadratic inequality"]])+
  field("eq-coeff","Polynomial coefficients (highest to constant)","1,-6,11,-6","text","e.g. 1,-3,2 for x²−3x+2")+
  textArea("eq-lines","Simultaneous system (one row per equation)","2,1,5\n1,-1,1","For 2×2: a,b,c on each row for ax+by=c")+
  field("eq-fx","Equation f(x)","x^2-2")+
  field("eq-guess","Starting guess","1","number")+
  select("eq-sign","Inequality sign",[">",">=","<","<="]),
  "Polynomial coefficients are listed from highest power to constant. For 3 unknowns, enter 3 rows with 4 numbers each."),
 matrix:()=>wrap(
  select("mat-op","Operation",[["det","det(A)"],["inverse","A inverse"],["transpose","Transpose A"],["add","A + B"],["subtract","A − B"],["multiply","A × B"],["solve","Solve A × x = b"]])+
  select("mat-r","A rows",["1","2","3","4","5"])+select("mat-c","A columns",["1","2","3","4","5"])+
  textArea("mat-a","A values, row by row","2,1,1,3")+
  select("mat-br","B rows",["1","2","3","4","5"])+select("mat-bc","B columns",["1","2","3","4","5"])+
  textArea("mat-b","B values, row by row","1,2,3,4")+
  field("mat-rhs","Right-hand side b for Ax=b","5,7"),
  "Sizes 1×1 to 5×5. Separate entries with commas or spaces. Default A is 2×2."),
 vector:()=>wrap(
  select("vec-dim","Vector dimension",["3","2"])+
  select("vec-op","Operation",[["add","A + B"],["subtract","A − B"],["dot","A · B"],["cross","A × B (3D)"],["angle","Angle between A & B"],["norm","Magnitude |A|"],["unit","Unit vector A"],["projection","Projection of A onto B"]])+
  field("vec-a","Vector A","1,2,3")+field("vec-b","Vector B","4,5,6"),
  "2D or 3D coordinates separated by commas."),
 statistics:()=>wrap(
  select("stats-op","Calculation",[["summary","One-variable statistics"],["regression","Linear regression y = a + bx"]])+
  textArea("stats-x","X values","2,4,4,4,5,5,7,9")+
  textArea("stats-y","Y values (for regression)","1,3,4,6,7,8,9,11"),
  "Shows mean, median, quartiles, standard deviation and variance. Regression uses paired X and Y values."),
 distribution:()=>wrap(
  select("dist-op","Distribution",[["normalPdf","Normal PDF at x"],["normalCdf","Normal P(X ≤ x)"],["normalInv","Inverse normal quantile"],["binomialPdf","Binomial P(X = k)"],["binomialCdf","Binomial P(X ≤ k)"]])+
  field("dist-x","x (or probability for inverse)","1","number")+
  field("dist-mu","Normal mean μ","0","number")+
  field("dist-sigma","Normal SD σ","1","number")+
  field("dist-n","Binomial trials n","10","number")+
  field("dist-k","Binomial k","3","number")+
  field("dist-p","Success probability p","0.5","number"),
  "Normal values are numerical approximations. Probabilities must be between 0 and 1."),
 complex:()=>wrap(
  select("complex-op","Operation",[["add","A + B"],["subtract","A − B"],["multiply","A × B"],["divide","A ÷ B"],["conjugate","Conjugate A"],["absolute","Magnitude |A|"],["argument","Angle Arg(A)"],["polar","Polar form of A"],["square","A squared"]])+
  field("complex-ar","A real part","3","number")+field("complex-ai","A imaginary part","4","number")+
  field("complex-br","B real part","1","number")+field("complex-bi","B imaginary part","-2","number")+
  select("complex-angle","Angle units",["DEG","RAD"]),
  "Enter A = a + bi and B = c + di. Both rectangular and polar results are supported."),
 table:()=>wrap(
  field("table-fx","f(x)","x^2+2*x")+field("table-gx","g(x), optional","sin(x)")+
  field("table-start","Start","0","number")+field("table-end","End","10","number")+
  field("table-step","Step","1","number")+select("table-angle","Angle",["DEG","RAD"]),
  "Generates up to 151 rows. Try x^2, sin(x), sqrt(x), or log(x)."),
 calculus:()=>wrap(
  select("calc-op","Operation",[["derivative","Derivative f′(x) at x"],["integral","Definite integral ∫ f(x) dx"],["solve","Solve f(x) = 0"]])+
  field("calc-fx","f(x)","x^2-4")+
  field("calc-x","At x / starting guess","2","number")+
  field("calc-a","Lower integration bound","0","number")+
  field("calc-b","Upper integration bound","2","number")+
  select("calc-angle","Angle units",["DEG","RAD"]),
  "Uses numerical approximations, not symbolic algebra. Integrals use Simpson's rule."),
 base:()=>wrap(
  select("base-from","Input base",[["10","Decimal (DEC)"],["2","Binary (BIN)"],["8","Octal (OCT)"],["16","Hexadecimal (HEX)"]])+
  field("base-value","Input integer","255")+
  select("base-op","Operation",[["convert","Convert to all bases"],["AND","Bitwise AND"],["OR","Bitwise OR"],["XOR","Bitwise XOR"],["NOT","Bitwise NOT (32-bit)"]])+
  field("base-other","Second integer (same base)","15"),
  "Supports integer base conversions and bitwise logic. NOT uses 32-bit unsigned output."),
 units:()=>wrap(
  select("unit-category","Category",Object.keys(C.conversions))+
  select("unit-from","From",Object.keys(C.conversions.Length))+
  select("unit-to","To",Object.keys(C.conversions.Length))+
  field("unit-value","Value to convert","1","number"),
  "Includes length, mass, area, volume, speed, time, pressure, energy, temperature and angle."),
 number:()=>wrap(
  select("number-op","Operation",[["gcd","Greatest common divisor"],["lcm","Least common multiple"],["prime","Prime factorization"],["factorial","Factorial"],["ncr","Combinations nCr"],["npr","Permutations nPr"],["ratio","Solve a:b = c:d"]])+
  field("number-a","First number / a","24","number")+
  field("number-b","Second number / b","18","number")+
  field("number-c","Ratio value c","6","number")+
  field("number-d","Ratio value d (leave blank if unknown)","","text"),
  "For the ratio solver, leave exactly one of a, b, c, d blank. Enter integers where needed."),
 spreadsheet:()=>sheetFields()
};
function capture(){
 if(!view||["scientific","basic"].includes(mode))return;
 const data={};
 view.querySelectorAll("input,textarea,select").forEach(input=>{data[input.id]=input.value;});
 saved[mode]=data;
}
function restore(){
 const data=saved[mode]||{};
 Object.entries(data).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value;});
}
function activate(next){
 if(!names.some(row=>row[0]===next))return;
 capture();mode=next;
 const normal=next==="scientific"||next==="basic";
 main.hidden=!normal;advanced.hidden=normal;
 nav.querySelectorAll("button[data-mode]").forEach(b=>{
  const yes=b.dataset.mode===next;b.classList.toggle("active",yes);b.setAttribute("aria-current",yes?"true":"false");
 });
 if(normal){
  document.getElementById(next+"-mode")?.click();
  return;
 }
 const item=names.find(row=>row[0]===next);
 title.textContent=item[1];desc.textContent=item[2];
 view.innerHTML=templates[next]();
 restore();
 if(next==="matrix"&&!saved.matrix){
  document.getElementById("qc-mat-r").value="2";document.getElementById("qc-mat-c").value="2";
  document.getElementById("qc-mat-br").value="2";document.getElementById("qc-mat-bc").value="2";
 }
 if(next==="units")repopulateUnits();
 output.hidden=true;output.replaceChildren();
 view.querySelector("#adv-form")?.addEventListener("submit",event=>{event.preventDefault();calculate();});
 view.querySelector("#qc-unit-category")?.addEventListener("change",repopulateUnits);
}
function val(name){
 const el=document.getElementById("qc-"+name);
 if(!el)throw Error("Missing input: "+name);
 return el.value;
}
const n=(id)=>C.num(val(id),id),int=id=>C.integer(val(id),id),li=id=>C.list(val(id),id);
const pretty=x=>x===null?"Not defined":typeof x==="string"?x:C.fmt(x);
const keyValue=(items)=>items.map(row=>({label:row[0],value:pretty(row[1])}));
function report(heading,items,table=null){
 output.replaceChildren();output.hidden=false;
 const h=document.createElement("h3");h.textContent=heading;output.appendChild(h);
 if(items&&items.length){
  const dl=document.createElement("dl");dl.className="result-grid";
  items.forEach(entry=>{
   const dt=document.createElement("dt"),dd=document.createElement("dd");
   dt.textContent=entry.label;dd.textContent=entry.value;
   dl.append(dt,dd);
  });
  output.appendChild(dl);
 }
 if(table?.length){
  const scrolling=document.createElement("div");scrolling.className="results-scroll";
  const el=document.createElement("table");el.className="result-table";
  const head=document.createElement("thead"),headRow=document.createElement("tr");
  table[0].forEach((_,i)=>{const th=document.createElement("th");th.textContent=table.headers?.[i]||String(i+1);headRow.appendChild(th);});
  head.appendChild(headRow);el.appendChild(head);
  const body=document.createElement("tbody");
  table.forEach(row=>{
   const tr=document.createElement("tr");
   row.forEach(value=>{const td=document.createElement("td");td.textContent=pretty(value);tr.appendChild(td);});
   body.appendChild(tr);
  });el.appendChild(body);scrolling.appendChild(el);output.appendChild(scrolling);
 }
}
function matrixReport(title,mat){
 const m=mat.map(row=>row.map(v=>C.fmt(v)));
 report(title,[{label:"Size",value:m.length+" × "+m[0].length}],m);
}
function repopulateUnits(){
 const category=val("unit-category"),u=Object.keys(C.conversions[category]);
 for(const which of ["from","to"]){
  const select=document.getElementById("qc-unit-"+which);
  select.replaceChildren();
  u.forEach((unit,index)=>{const option=document.createElement("option");option.value=unit;option.textContent=unit;select.appendChild(option);});
  select.value=u[which==="from"?0:Math.min(1,u.length-1)];
 }
}
function calculate(){
 try{
  if(mode==="equations"){
   const operation=val("eq-type");
   if(operation==="polynomial"){
    const roots=C.polynomial(li("eq-coeff"));
    report("Polynomial roots",roots.map((z,i)=>({label:"x"+(i+1),value:C.cfmt(z)})));return;
   }
   if(operation==="linear2"||operation==="linear3"){
    const count=operation==="linear2"?2:3;
    const lines=val("eq-lines").trim().split(/\n+/).map(row=>C.list(row,"System row"));
    if(lines.length!==count||lines.some(row=>row.length!==count+1))throw Error("Enter "+count+" rows of "+(count+1)+" values");
    const x=C.solveLinear(lines.map(row=>row.slice(0,count)),lines.map(row=>row[count]));
    report("Simultaneous equation solution",x.map((v,i)=>({label:"x"+(i+1),value:C.fmt(v)})));return;
   }
   if(operation==="root"){
    const r=C.solveRoot(val("eq-fx"),n("eq-guess"));
    report("Numerical equation root",keyValue([["x",r.root],["Residual f(x)",r.residual],["Iterations",r.iterations]]));return;
   }
   if(operation==="inequality"){
    const c=li("eq-coeff");
    if(c.length!==3||c[0]===0)throw Error("Enter exactly 3 coefficients a,b,c with a≠0");
    const [a,b,d]=c,delta=b*b-4*a*d,sign=val("eq-sign");
    const roots=delta<0?[]:delta===0?[-b/(2*a)]:[(-b-Math.sqrt(delta))/(2*a),(-b+Math.sqrt(delta))/(2*a)].sort((x,y)=>x-y);
    const pos=a>0,strict=sign===">"||sign==="<",greater=sign===">"||sign===">=";
    let regions;
    if(!roots.length)regions=(pos===greater)?"All real x":"No solution";
    else if(roots.length===1){
      regions=(pos===greater)?(strict?"All real x except "+C.fmt(roots[0]):"All real x"):(strict?"No solution":"x = "+C.fmt(roots[0]));
    } else {
      const L=C.fmt(roots[0]),R=C.fmt(roots[1]);
      const outer=pos===greater,bracket=strict?"<":"≤",rightBracket=strict?">":"≥";
      regions=outer?"x "+bracket+" "+L+" or x "+rightBracket+" "+R:"x "+(strict?">":"≥")+" "+L+" and x "+(strict?"<":"≤")+" "+R;
    }
    report("Quadratic inequality",[{label:"Solution",value:regions},{label:"Real roots",value:roots.map(C.fmt).join(", ")||"None"}]);return;
   }
  }
  if(mode==="matrix"){
   const op=val("mat-op"),A=C.matrix(int("mat-r"),int("mat-c"),val("mat-a"));
   if(op==="det"){report("Determinant of A",keyValue([["det(A)",C.det(A)]]));return;}
   if(op==="inverse"){matrixReport("Inverse A⁻¹",C.inverse(A));return;}
   if(op==="transpose"){matrixReport("Transpose Aᵀ",C.transpose(A));return;}
   if(op==="solve"){const values=li("mat-rhs");report("Solution to A×x=b",C.solveLinear(A,values).map((v,i)=>({label:"x"+(i+1),value:C.fmt(v)})));return;}
   const B=C.matrix(int("mat-br"),int("mat-bc"),val("mat-b"));
   matrixReport(op==="multiply"?"A × B":op==="subtract"?"A − B":"A + B",op==="multiply"?C.matMul(A,B):C.matAdd(A,B,op==="subtract"?-1:1));return;
  }
  if(mode==="vector"){
   const dim=int("vec-dim"),op=val("vec-op"),a=C.vector(val("vec-a"),dim);
   if(op==="norm"){report("Magnitude",keyValue([["|A|",C.norm(a)]]));return;}
   if(op==="unit"){const m=C.norm(a);if(m<1e-12)throw Error("Zero vector has no direction");report("Unit vector A",a.map((v,i)=>({label:"Component "+(i+1),value:C.fmt(v/m)})));return;}
   const b=C.vector(val("vec-b"),dim);
   if(op==="dot"){report("Dot product",keyValue([["A · B",C.dot(a,b)]]));return;}
   if(op==="angle"){
    const denominator=C.norm(a)*C.norm(b);if(denominator<1e-12)throw Error("Angle with zero vector undefined");
    const rad=Math.acos(Math.max(-1,Math.min(1,C.dot(a,b)/denominator)));
    report("Angle between vectors",keyValue([["Degrees",rad*180/Math.PI],["Radians",rad]]));return;
   }
   if(op==="cross"){
    if(dim!==3)throw Error("Cross product is available for 3D vectors");
    report("Cross product A × B",C.cross(a,b).map((v,i)=>({label:"Component "+(i+1),value:C.fmt(v)})));return;
   }
   if(op==="projection"){
    const d=C.dot(b,b);if(d<1e-12)throw Error("Cannot project onto zero vector");
    report("Projection of A onto B",b.map((v,i)=>({label:"Component "+(i+1),value:C.fmt(v*C.dot(a,b)/d)})));return;
   }
   report(op==="add"?"A + B":"A − B",a.map((v,i)=>({label:"Component "+(i+1),value:C.fmt(op==="add"?v+b[i]:v-b[i])})));return;
  }
  if(mode==="statistics"){
   const x=li("stats-x"),op=val("stats-op");
   if(op==="summary"){
    const s=C.summary(x);report("One-variable statistics",keyValue([
      ["Count n",s.n],["Sum Σx",s.sum],["Mean",s.mean],["Median",s.median],["Minimum",s.minimum],["Maximum",s.maximum],["Range",s.range],
      ["Q1",s.q1],["Q3",s.q3],["Population variance σ²",s.populationVariance],["Population SD σ",s.populationSD],
      ["Sample variance s²",s.sampleVariance],["Sample SD s",s.sampleSD]
    ]));return;
   }
   const r=C.regression(x,li("stats-y"));
   report("Linear regression y = a + bx",keyValue([["Pairs n",r.n],["Intercept a",r.intercept],["Slope b",r.slope],["Pearson correlation r",r.r],["R²",r.r2],["Mean X",r.meanX],["Mean Y",r.meanY]]));return;
  }
  if(mode==="distribution"){
   const op=val("dist-op");
   if(op==="normalPdf"||op==="normalCdf"||op==="normalInv"){
    const x=n("dist-x"),mu=n("dist-mu"),sd=n("dist-sigma");
    const answer=op==="normalPdf"?C.normalPdf(x,mu,sd):op==="normalCdf"?C.normalCdf(x,mu,sd):C.normalInv(x,mu,sd);
    report("Normal distribution",keyValue([[op==="normalPdf"?"PDF":op==="normalCdf"?"Cumulative probability":"Quantile",answer]]));return;
   }
   const answer=C.binomial(int("dist-n"),int("dist-k"),n("dist-p"),op==="binomialCdf");
   report("Binomial distribution",keyValue([[op==="binomialCdf"?"P(X ≤ k)":"P(X = k)",answer]]));return;
  }
  if(mode==="complex"){
   const a=C.cx(n("complex-ar"),n("complex-ai")),b=C.cx(n("complex-br"),n("complex-bi")),op=val("complex-op");
   const angle=val("complex-angle"),degree=angle==="DEG"?180/Math.PI:1;
   let result;
   if(op==="add")result=C.cadd(a,b);
   if(op==="subtract")result=C.csub(a,b);
   if(op==="multiply")result=C.cmul(a,b);
   if(op==="divide")result=C.cdiv(a,b);
   if(op==="square")result=C.cmul(a,a);
   if(op==="conjugate")result=C.cx(a.re,-a.im);
   if(result){report("Complex number result",[{label:"Rectangular",value:C.cfmt(result)},{label:"Real",value:C.fmt(result.re)},{label:"Imaginary",value:C.fmt(result.im)}]);return;}
   const theta=Math.atan2(a.im,a.re)*degree;
   if(op==="absolute")report("Magnitude",keyValue([["|A|",C.cabs(a)]]));
   if(op==="argument")report("Argument",keyValue([["Angle ("+angle+")",theta]]));
   if(op==="polar")report("Polar form",[{label:"r ∠ θ",value:C.fmt(C.cabs(a))+" ∠ "+C.fmt(theta)+"°".replace("°",angle==="DEG"?"°":" rad")},{label:"Magnitude",value:C.fmt(C.cabs(a))},{label:"Angle",value:C.fmt(theta)+" "+angle}]);
   return;
  }
  if(mode==="table"){
   const values=C.table(val("table-fx"),val("table-gx").trim(),n("table-start"),n("table-end"),n("table-step"),{angle:val("table-angle")});
   const rows=values.map(item=>item.gx===null?[item.x,item.fx]:[item.x,item.fx,item.gx]);
   rows.headers=values[0]?.gx===null?["x","f(x)"]:["x","f(x)","g(x)"];
   report("Function table ("+values.length+" rows)",[],rows);return;
  }
  if(mode==="calculus"){
   const op=val("calc-op"),f=val("calc-fx"),opts={angle:val("calc-angle")};
   if(op==="derivative"){report("Numerical derivative",keyValue([["f′(x)",C.derivative(f,n("calc-x"),opts)],["At x",n("calc-x")]]));return;}
   if(op==="integral"){report("Numerical definite integral",keyValue([["Integral",C.integrate(f,n("calc-a"),n("calc-b"),opts)]]));return;}
   const r=C.solveRoot(f,n("calc-x"),opts);report("Numerical root",keyValue([["x",r.root],["Residual",r.residual],["Iterations",r.iterations]]));return;
  }
  if(mode==="base"){
   const base=int("base-from"),op=val("base-op");
   const r=op==="convert"?C.baseConvert(val("base-value"),base):C.baseBitwise(val("base-value"),base,val("base-other"),op);
   report(op==="convert"?"Number base conversion":op+" result",[{label:"Binary (BIN)",value:r.bin},{label:"Octal (OCT)",value:r.oct},{label:"Decimal (DEC)",value:r.dec},{label:"Hexadecimal (HEX)",value:r.hex}]);return;
  }
  if(mode==="units"){
   const category=val("unit-category"),from=val("unit-from"),to=val("unit-to"),value=n("unit-value"),r=C.convert(category,from,to,value);
   report(category+" conversion",[{label:"Input",value:C.fmt(value)+" "+from},{label:"Converted",value:C.fmt(r)+" "+to}]);return;
  }
  if(mode==="number"){
   const op=val("number-op");
   if(op==="ratio"){
    const keys=["a","b","c","d"],values=keys.map(k=>val("number-"+k).trim()),blanks=values.map((v,i)=>v===""?i:-1).filter(x=>x>=0);
    if(blanks.length!==1)throw Error("Leave exactly one ratio value blank");
    const nums=values.map(v=>v===""?null:C.num(v)),i=blanks[0],a=nums[0],b=nums[1],c=nums[2],d=nums[3];
    let answer;
    if(i===0){if(d===0)throw Error("Cannot divide by zero");answer=b*c/d;}
    if(i===1){if(c===0)throw Error("Cannot divide by zero");answer=a*d/c;}
    if(i===2){if(b===0)throw Error("Cannot divide by zero");answer=a*d/b;}
    if(i===3){if(a===0)throw Error("Cannot divide by zero");answer=b*c/a;}
    report("Ratio a:b = c:d",keyValue([["Missing "+keys[i],answer]]));return;
   }
   const a=int("number-a");
   if(op==="factorial"){report("Factorial",keyValue([["a!",C.factorial(a)]]));return;}
   if(op==="prime"){report("Prime factorization",[{label:"Factors",value:C.factors(a).join(" × ")}]);return;}
   const b=int("number-b");
   if(op==="gcd"){report("Greatest common divisor",keyValue([["GCD",C.gcd(a,b)]]));return;}
   if(op==="lcm"){report("Least common multiple",keyValue([["LCM",C.lcm(a,b)]]));return;}
   report(op==="ncr"?"Combinations":"Permutations",keyValue([[op==="ncr"?"nCr":"nPr",C.ncr(a,b,op==="npr")]]));return;
  }
  if(mode==="spreadsheet"){
   const cells={},cache={},running=new Set();
   for(let row=1;row<=5;row++)for(const col of ["A","B","C","D","E"]){
    const key=col+row;cells[key]=document.getElementById("qc-cell-"+key).value.trim();
   }
   function cell(key){
    if(key in cache)return cache[key];
    if(running.has(key))throw Error("Circular reference at "+key);
    running.add(key);
    const raw=cells[key];
    if(!raw){running.delete(key);return cache[key]=0;}
    let result;
    if(raw.startsWith("=")){
      const expr=raw.slice(1),vars={};
      for(const other of new Set(expr.match(/\b[A-E][1-5]\b/g)||[]))vars[other]=cell(other);
      result=C.evaluate(expr,{vars});
    }else result=C.evaluate(raw);
    running.delete(key);return cache[key]=result;
   }
   const rows=[];
   for(let row=1;row<=5;row++)rows.push([""+row,...["A","B","C","D","E"].map(col=>cell(col+row))]);
   rows.headers=["Row","A","B","C","D","E"];
   report("Spreadsheet results (A1–E5)",[],rows);return;
  }
  throw Error("Choose a calculator mode");
 }catch(e){
  output.hidden=false;output.replaceChildren();
  const p=document.createElement("p");p.className="adv-error";p.textContent=e.message||"Calculation error";output.appendChild(p);
 }
}
names.forEach(([id,label])=>{
 const b=document.createElement("button");
 b.type="button";b.className="qc-tab";b.textContent=label;b.dataset.mode=id;
 b.setAttribute("aria-label","Open "+label+" calculator");
 b.addEventListener("click",()=>activate(id));
 nav.appendChild(b);
});
activate("scientific");
})();
