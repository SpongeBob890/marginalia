

var DUM=document.createElement("div"),$=function(i){return document.getElementById(i)||DUM};

BOOKS.forEach(function(b){b.img=IMG[b.id]||""});

var fmt=function(n){return n.toLocaleString("en-US")};
var col=function(h){return "linear-gradient(160deg,hsl("+h+",55%,36%),hsl("+((h+30)%360)+",50%,20%))"};
var esc=function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")};
/* Amazon link, with your affiliate tag added if you set one */
var amz=function(b){return CFG.TAG?b.url+(b.url.indexOf("?")>-1?"&":"?")+"tag="+encodeURIComponent(CFG.TAG):b.url};
var gift=function(b){return CFG.GIFTS.indexOf(b.id)>-1};
var cover=function(b){return b.img?'<img class="cover" src="'+b.img+'" alt="Cover of '+esc(b.t)+' by '+esc(b.a)+'">':'<div class="cover" style="background:'+col(b.h)+'"><small>'+esc(b.g)+'</small><b>'+esc(b.t)+'</b></div>'};
var A=function(b,cls,inner){return '<a class="'+cls+'" href="'+esc(amz(b))+'" target="_blank" rel="noopener noreferrer sponsored" data-view="'+b.id+'">'+inner+'</a>'};
var heart=function(b){return '<button class="like" data-like="'+b.id+'" aria-pressed="'+b.liked+'" aria-label="Like '+esc(b.t)+'"><span aria-hidden="true">'+(b.liked?"♥":"♡")+'</span>'+fmt(b.l)+'</button>'};
var share=function(b){return '<a class="share" target="_blank" rel="noopener noreferrer" aria-label="Share '+esc(b.t)+' on WhatsApp" href="https://wa.me/?text='+encodeURIComponent("Look at this book: "+b.t+" by "+b.a+" "+b.url)+'">↗ Share</a>'};
var eye=function(b){return '<span>👁 '+fmt(b.v)+' views</span>'};

/* ---- Supabase (plain fetch, no library). Does nothing until SB_URL and SB_KEY are set ---- */
var SB=!!(CFG.SB_URL&&CFG.SB_KEY);
function sb(path,body){return fetch(CFG.SB_URL+"/rest/v1/"+path,{method:body?"POST":"GET",headers:{apikey:CFG.SB_KEY,Authorization:"Bearer "+CFG.SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:body?JSON.stringify(body):undefined}).then(function(r){if(!r.ok)throw new Error(r.status);return r})}
function bump(id,c,n){if(SB)sb("rpc/bump",{bid:id,col:c,amt:n}).catch(function(){})}

try{var saved=JSON.parse(localStorage.getItem("likes")||"[]");BOOKS.forEach(function(b){if(saved.indexOf(b.id)>-1){b.liked=true;if(!SB)b.l++}})}catch(e){}
function saveLikes(){try{localStorage.setItem("likes",JSON.stringify(BOOKS.filter(function(b){return b.liked}).map(function(b){return b.id})))}catch(e){}}
function stats(){$("sb").textContent=BOOKS.length;$("sv").textContent=fmt(BOOKS.reduce(function(s,b){return s+b.v},0));$("sl").textContent=fmt(BOOKS.reduce(function(s,b){return s+b.l},0))}

/* ---- festive bits ---- */
var L=$("lights"),C=["#e8344f","#f0bf4c","#3ecf8e","#fff3d0"];
for(var i=0;i<26;i++){var s=document.createElement("s");s.style.setProperty("--c",C[i%4]);s.style.setProperty("--d",(i*.37%2.6)+"s");L.appendChild(s)}
(function(){var n=new Date(),x=new Date(n.getFullYear(),11,25),d=Math.ceil((x-n)/864e5);$("days").textContent=d>1?d+" days to Christmas":d===1?"Christmas is tomorrow":d===0?"Merry Christmas!":"Happy New Year ✦"})();

var shelf=$("shelf");
BOOKS.slice(0,9).forEach(function(b,i){var s=document.createElement("a");s.className="spine";s.href=amz(b);s.target="_blank";s.rel="noopener noreferrer sponsored";s.setAttribute("data-view",b.id);s.style.background=col(b.h);s.style.height=(62+(i*37%34))+"%";s.textContent=b.t;s.title=b.t+" by "+b.a;shelf.appendChild(s)});
var star=BOOKS[0];
function drawFeat(){var b=star;$("feat").innerHTML=A(b,"open",cover(b))+'<div><span class="tag">Book of the month</span><h2>'+esc(b.t)+' by '+esc(b.a)+'</h2><p>'+esc(b.d)+'</p><div class="stat">'+eye(b)+heart(b)+share(b)+'</div><p>'+A(b,"btn gold","Buy on Amazon")+'</p></div>'}
function drawFA(){var ids=Object.keys(FEAT).map(Number);
$("fs").textContent=fmt(ids.reduce(function(t,i){return t+BOOKS[i].v},0))+" reader views across these author features so far.";
$("fa").innerHTML=ids.map(function(i){var b=BOOKS[i],f=FEAT[i];return '<article class="fi">'+A(b,"open",cover(b))+'<div><div class="lab">'+esc(b.t)+' by '+esc(b.a)+'</div><h3>'+f[0]+'</h3><p class="ex">'+f[1]+'</p><div class="stat">'+eye(b)+heart(b)+share(b)+A(b,"buy","Buy on Amazon")+'</div></div></article>'}).join("")}

var genre="All",q="";
var genres=["All","🎁 Gift picks"].concat(Array.from(new Set(BOOKS.map(function(b){return b.g}))));
var chips=$("chips");
genres.forEach(function(g,i){var c=document.createElement("button");c.className="chip"+(i===1?" gift":"");c.textContent=g;c.setAttribute("aria-pressed",i===0);c.onclick=function(){genre=g;Array.from(chips.querySelectorAll(".chip")).forEach(function(x){x.setAttribute("aria-pressed",x===c)});draw()};chips.appendChild(c)});
var sel=document.createElement("select");sel.setAttribute("aria-label","Sort books");sel.innerHTML='<option value="v">Most viewed</option><option value="l">Most liked</option><option value="t">Title A to Z</option><option value="a">Author A to Z</option>';sel.onchange=draw;chips.appendChild(sel);
$("gsel").innerHTML=genres.slice(2).map(function(g){return "<option>"+g+"</option>"}).join("");
function draw(){
var list=BOOKS.filter(function(b){return (genre==="All"||(genre===genres[1]?gift(b):b.g===genre))&&(b.t+b.a+b.g).toLowerCase().indexOf(q)>-1});
var k=sel.value;list.sort(function(x,y){return (k==="v"||k==="l")?y[k]-x[k]:x[k].localeCompare(y[k])});
$("books").innerHTML=list.length?list.map(function(b){return '<article class="book">'+A(b,"open",(gift(b)?'<span class="ribbon">🎁 Gift pick</span>':"")+cover(b))+'<h3>'+esc(b.t)+'</h3><span class="by">'+esc(b.a)+'</span><div class="stat">'+eye(b)+heart(b)+share(b)+'</div>'+A(b,"buy","Buy on Amazon")+'</article>'}).join(""):'<p class="empty">No books match that search. Try a different word or choose All.</p>'}
function refresh(){draw();drawFeat();drawFA();stats()}
refresh();
if(SB)sb("book_stats?select=book_id,views,likes").then(function(r){return r.json()}).then(function(rows){rows.forEach(function(r){var b=BOOKS[r.book_id];if(b){b.v=r.views;b.l=r.likes}});refresh()}).catch(function(){});

document.addEventListener("click",function(e){var o=e.target.closest("[data-view]"),l=e.target.closest("[data-like]");
if(o){var b=BOOKS[+o.dataset.view];b.v++;bump(b.id,"views",1);stats();setTimeout(refresh,400)}
if(l){var b2=BOOKS[+l.dataset.like];b2.liked=!b2.liked;b2.l+=b2.liked?1:-1;bump(b2.id,"likes",b2.liked?1:-1);saveLikes();refresh()}});
$("hs").onsubmit=function(e){e.preventDefault();q=$("q0").value.trim().toLowerCase();genre="All";Array.from(chips.querySelectorAll(".chip")).forEach(function(x,i){x.setAttribute("aria-pressed",i===0)});draw();$("library").scrollIntoView()};
var MAIL="patrickumoru595@gmail.com";
function mail(subject,data){data._subject=subject;data._template="table";return fetch("https://formsubmit.co/ajax/"+MAIL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)}).then(function(r){if(!r.ok)throw new Error(r.status)})}
function send(table,row,okEl,msg,form,subj){var done=function(){okEl.textContent=msg;form.reset()};
var p=[mail(subj,Object.assign({},row))];if(SB)p.push(sb(table,row));
Promise.all(p).then(done).catch(function(){okEl.textContent="Something went wrong. Please try again in a moment."})}
$("nf").onsubmit=function(e){e.preventDefault();send("subscribers",{email:$("nem").value},$("nok"),"You’re on the list. We’ll email you when it goes live.",this,"New email signup")};
$("up").onsubmit=function(e){e.preventDefault();send("submissions",{title:$("t").value,author:$("au").value,genre:$("gsel").value,description:$("de").value,link:$("li").value},$("ok"),"Sent for review: “"+$("t").value+"”. Thank you!",this,"New book submission")};
$("cf").onsubmit=function(e){e.preventDefault();var f=this;mail("New message from the Marginalia website",{name:$("cn").value,email:$("ce").value,message:$("cm").value}).then(function(){$("cok").textContent="Message sent. We’ll reply to your email soon.";f.reset()}).catch(function(){$("cok").textContent="Message not sent. Please check your connection and try again, or email "+MAIL+" directly."})};
var onB=!!document.getElementById("books");
$("hs").onsubmit=function(e){e.preventDefault();var v=$("q0").value.trim();if(onB){q=v.toLowerCase();draw()}else location.href="books.html?q="+encodeURIComponent(v)};
if(onB){$("q0").oninput=function(){q=this.value.trim().toLowerCase();draw()};var pq=new URLSearchParams(location.search).get("q");if(pq){$("q0").value=pq;q=pq.toLowerCase();draw()}}
var mb=document.getElementById("menu");if(mb)mb.onclick=function(){var o=document.getElementById("nav").classList.toggle("open");mb.setAttribute("aria-expanded",o)};

var gf=document.getElementById("gifts");if(gf)gf.innerHTML=CFG.GIFTS.slice(0,4).map(function(i){var b=BOOKS[i];return '<article class="book">'+A(b,"open",'<span class="ribbon">🎁 Gift pick</span>'+cover(b))+'<h3>'+esc(b.t)+'</h3><span class="by">'+esc(b.a)+'</span>'+A(b,"buy","Buy on Amazon")+'</article>'}).join("");
