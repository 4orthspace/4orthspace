/* 4orth Space — shared client script. */
(function(){
  "use strict";
  var rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav scroll state + back to top ---------- */
  var hdr=document.getElementById("hdr"), totop=document.getElementById("totop");
  function onScroll(){
    var y=window.scrollY;
    hdr.classList.toggle("scrolled", y>40);
    totop.classList.toggle("show", y>700);
  }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
  totop.addEventListener("click",function(){window.scrollTo({top:0,behavior:rm?"auto":"smooth"});});

  /* ---------- mobile drawer ---------- */
  var burger=document.getElementById("burger"), drawer=document.getElementById("drawer");
  function toggleDrawer(open){
    burger.classList.toggle("open",open); drawer.classList.toggle("open",open);
    burger.setAttribute("aria-expanded",open); drawer.setAttribute("aria-hidden",!open);
    document.body.style.overflow=open?"hidden":"";
  }
  burger.addEventListener("click",function(){toggleDrawer(!drawer.classList.contains("open"));});
  drawer.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){toggleDrawer(false);});});

  /* ---------- reveal on scroll ---------- */
  var revs=document.querySelectorAll(".reveal");
  if(rm){revs.forEach(function(r){r.classList.add("in");});}
  else{
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});
    },{threshold:.12,rootMargin:"0px 0px -8% 0px"});
    revs.forEach(function(r){io.observe(r);});
  }

  /* ---------- count up ---------- */
  var counted=false;
  function runCount(){
    if(counted) return; counted=true;
    document.querySelectorAll("[data-count]").forEach(function(el){
      var target=+el.getAttribute("data-count"), suf=el.getAttribute("data-suffix")||"", dur=1500, t0=null;
      if(rm){el.textContent=target+suf;return;}
      function step(ts){
        if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1);
        var val=Math.floor((1-Math.pow(1-p,3))*target);
        el.textContent=val+suf;
        if(p<1)requestAnimationFrame(step); else el.textContent=target+suf;
      }
      requestAnimationFrame(step);
    });
  }
  var statSec=document.querySelector(".stats");
  if(statSec){
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)runCount();});},{threshold:.4});
    so.observe(statSec);
  }

  /* ---------- spaces data + render + filter ---------- */
  var SPACES=[
    {t:"Flexible Space",c:"flexible",d:"A bright, open, adaptable room for private classes, workshops, training sessions and events. Open to members and non-members alike.",p:"Hourly · Half day · Full day",img:"flex"},
    {t:"4orth Space (lounge &amp; café)",c:"creative",d:"Exclusive use of the open lounge and café, full days only. Booking closes the space to the public, ideal for brand activations and private events.",p:"Full day only",img:"cafeSpace"},
    {t:"Conference Room",c:"meeting",d:"A glass-walled meeting room with panoramic views of Abuja, for team sessions, client meetings and strategy days.",p:"Coming soon",img:"meeting"},
    {t:"Rooftop Café",c:"creative",d:"Fresh pasta and signature drinks from our in-house café. Walk-ins welcome, no membership required.",p:"Open to all",img:"cafe"},
    {t:"Private Office",c:"private",d:"A fully furnished, lockable office for focused work and confidential meetings.",p:"From ₦250,000<span>/mo</span>",img:"meeting"},
    {t:"Dedicated Desk",c:"flexible",d:"A desk that's always yours, with lockable storage and a business address.",p:"From ₦85,000<span>/mo</span>",img:"flex"},
    {t:"Hot Desk",c:"flexible",d:"Drop in and take any open seat. The easiest way into the fourth space.",p:"From ₦8,000<span>/day</span>",img:"cafeSpace"}
  ];
  var IMG={
    cafe:"cafe-image.webp",
    cafeSpace:"cafe-space.webp",
    flex:"flexible-room.webp",
    meeting:"meeting-room.webp"
  };
  var CATLBL={private:"Private",meeting:"Meeting",creative:"Creative",flexible:"Flexible"};
  var grid=document.getElementById("spGrid");
  grid.innerHTML=SPACES.map(function(s){
    return '<article class="sp-card" data-c="'+s.c+'">'
      +'<div class="sp-media"><span class="sp-cat">'+CATLBL[s.c]+'</span>'
      +'<img loading="lazy" src="'+IMG[s.img]+'" alt="'+s.t.replace(/&amp;/g,"&")+'"></div>'
      +'<div class="sp-body"><h3>'+s.t+'</h3><p>'+s.d+'</p>'
      +'<div class="sp-foot"><span class="sp-price">'+s.p.replace(/<span>/g,'<b style="color:var(--brass)"> ').replace(/<\/span>/g,'</b>')+'</span>'
      +'<a href="#/reserve">Reserve →</a></div></div></article>';
  }).join("");
  document.getElementById("filters").addEventListener("click",function(e){
    var b=e.target.closest(".filter"); if(!b)return;
    this.querySelectorAll(".filter").forEach(function(f){f.classList.remove("active");});
    b.classList.add("active");
    var f=b.getAttribute("data-f");
    grid.querySelectorAll(".sp-card").forEach(function(c){
      c.classList.toggle("hide", f!=="all" && c.getAttribute("data-c")!==f);
    });
  });

  /* ---------- membership billing toggle ---------- */
  var billing=document.getElementById("billing");
  billing.addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b)return;
    this.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});
    b.classList.add("on");
    var annual=b.getAttribute("data-b")==="annual";
    document.querySelectorAll(".plan .amt").forEach(function(a){
      var v=+a.getAttribute(annual?"data-a":"data-m");
      a.style.opacity="0";
      setTimeout(function(){ a.textContent=v.toLocaleString("en-NG"); a.style.opacity="1"; },120);
    });
    document.querySelectorAll(".plan .per").forEach(function(p){p.textContent=annual?"/ mo, billed yearly":"/ month";});
  });

  /* ---------- booking ---------- */
  var tabs=document.querySelectorAll(".bk-tab"), panes=document.querySelectorAll(".bk-pane");
  var activePane="work";
  tabs.forEach(function(t){
    t.addEventListener("click",function(){
      activePane=t.getAttribute("data-pane");
      tabs.forEach(function(x){x.classList.remove("on");}); t.classList.add("on");
      panes.forEach(function(p){p.classList.toggle("on",p.getAttribute("data-pane")===activePane);});
      updateSummary();
    });
  });
  var NGN=function(n){return "₦"+Math.round(n).toLocaleString("en-NG");};
  var DURLBL={day:"Day pass",week:"Weekly",month:"Monthly"};
  var RATEUNIT={day:"day",week:"wk",month:"mo"};
  function updateSummary(){
    var title=document.getElementById("sumTitle"), lines=document.getElementById("sumLines"),
        total=document.getElementById("sumTotal"), note=document.getElementById("sumNote");
    if(activePane==="work"){
      var tp=document.getElementById("wType"), tpTxt=tp.options[tp.selectedIndex].text,
          tpv=tp.value.split("|"), // key,day,week,month
          dur=document.getElementById("wDur").value.split("|"), durKey=dur[0], durIdx=+dur[1],
          qty=+document.getElementById("wQty").value,
          rate=+tpv[durIdx];
      var sub=rate*qty;
      title.textContent=tpTxt+" · "+DURLBL[durKey];
      lines.innerHTML=
        '<div class="sum-line"><span class="k">Space</span><span class="v">'+tpTxt+'</span></div>'
       +'<div class="sum-line"><span class="k">Commitment</span><span class="v">'+DURLBL[durKey]+'</span></div>'
       +'<div class="sum-line"><span class="k">People</span><span class="v">'+(qty>=5?"5+ people":qty+(qty>1?" people":" person"))+'</span></div>'
       +'<div class="sum-line"><span class="k">Rate</span><span class="v">'+NGN(rate)+' / '+RATEUNIT[durKey]+(qty>1?" × "+qty:"")+'</span></div>';
      total.textContent=NGN(sub);
      note.textContent=durKey==="month"?"Billed monthly. No booking fee — your concierge confirms availability first."
        :durKey==="week"?"One week of access. Extend or convert to monthly any time."
        :"A single day of full access. The best way to try the fourth space.";
    } else if(activePane==="room"){
      var rd=document.getElementById("rDur"), rdTxt=rd.options[rd.selectedIndex].text, base=+rd.value.split("|")[1],
          rc=document.getElementById("rCap"), rcTxt=rc.options[rc.selectedIndex].text, mult=+rc.value.split("|")[1];
      var sub2=base*mult;
      title.textContent="Meeting room · "+rdTxt;
      lines.innerHTML=
        '<div class="sum-line"><span class="k">Booking</span><span class="v">Meeting room</span></div>'
       +'<div class="sum-line"><span class="k">Duration</span><span class="v">'+rdTxt+'</span></div>'
       +'<div class="sum-line"><span class="k">Capacity</span><span class="v">'+rcTxt+'</span></div>'
       +'<div class="sum-line"><span class="k">Base rate</span><span class="v">'+NGN(base)+(mult>1?" × "+mult:"")+'</span></div>';
      total.textContent=NGN(sub2);
      note.textContent="Includes screen, whiteboard, water and barista coffee. Members use included hours first.";
    } else {
      title.textContent="Private tour";
      lines.innerHTML=
        '<div class="sum-line"><span class="k">Booking</span><span class="v">Guided tour</span></div>'
       +'<div class="sum-line"><span class="k">Duration</span><span class="v">~30 minutes</span></div>'
       +'<div class="sum-line"><span class="k">Cost</span><span class="v">Complimentary</span></div>';
      total.textContent="Free";
      note.textContent="Walk the floor, meet the team, and see whether 4orth is your fourth space.";
    }
  }
  document.querySelectorAll("[data-price]").forEach(function(el){el.addEventListener("change",updateSummary);});
  updateSummary();

  /* ---------- validation helpers ---------- */
  function setInvalid(field,bad){ field.classList.toggle("invalid",bad); }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validateScope(scope){
    var ok=true;
    scope.querySelectorAll("[data-req]").forEach(function(inp){
      var f=inp.closest(".field"), v=inp.value.trim(), bad=false;
      if(!v) bad=true;
      else if(inp.type==="email" && !validEmail(v)) bad=true;
      setInvalid(f,bad); if(bad)ok=false;
    });
    return ok;
  }
  // clear error on input
  document.querySelectorAll("[data-req]").forEach(function(inp){
    inp.addEventListener("input",function(){ if(inp.closest(".field").classList.contains("invalid")) setInvalid(inp.closest(".field"),false); });
  });

  /* ---------- booking submit ---------- */
  var bkForm=document.getElementById("bkForm"), bkSuccess=document.getElementById("bkSuccess"), sumLive=document.getElementById("sumLive");
  bkForm.addEventListener("submit",function(e){
    e.preventDefault();
    var pane=document.querySelector('.bk-pane.on');
    var scopeOk=validateScope(pane);
    // shared name/email live in form but outside panes
    var sharedOk=true;
    [document.getElementById("bName"),document.getElementById("bEmail")].forEach(function(inp){
      var f=inp.closest(".field"), v=inp.value.trim(), bad=!v||(inp.type==="email"&&!validEmail(v));
      setInvalid(f,bad); if(bad)sharedOk=false;
    });
    if(!scopeOk||!sharedOk) return;
    var ref="4S-"+Math.floor(100000+Math.random()*899999);
    document.getElementById("bkRef").textContent="REF · "+ref;
    // capture the reservation for the operations dashboard before the form resets
    var paneKey=activePane, dateVal="";
    if(paneKey==="work") dateVal=document.getElementById("wDate").value;
    else if(paneKey==="room") dateVal=document.getElementById("rDate").value+" "+document.getElementById("rTime").value;
    else dateVal=document.getElementById("tDate").value+" · "+document.getElementById("tTime").value;
    if(window.OS) window.OS.addBooking({
      ref:ref,
      type:paneKey,
      space:document.getElementById("sumTitle").textContent,
      date:dateVal,
      value:document.getElementById("sumTotal").textContent,
      name:document.getElementById("bName").value.trim(),
      email:document.getElementById("bEmail").value.trim()
    });
    sumLive.style.display="none"; bkSuccess.classList.add("show");
    bkForm.reset();
  });
  document.getElementById("bkAgain").addEventListener("click",function(){
    bkSuccess.classList.remove("show"); sumLive.style.display="block"; updateSummary();
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".qa button").forEach(function(btn){
    btn.addEventListener("click",function(){
      var qa=btn.parentElement, ans=qa.querySelector(".ans"), open=qa.classList.contains("open");
      document.querySelectorAll(".qa").forEach(function(o){
        o.classList.remove("open"); o.querySelector(".ans").style.maxHeight=null; o.querySelector("button").setAttribute("aria-expanded","false");
      });
      if(!open){ qa.classList.add("open"); ans.style.maxHeight=ans.scrollHeight+"px"; btn.setAttribute("aria-expanded","true"); }
    });
  });

  /* ---------- contact submit ---------- */
  var ctForm=document.getElementById("ctForm"), ctOk=document.getElementById("ctOk");
  ctForm.addEventListener("submit",function(e){
    e.preventDefault();
    if(!validateScope(ctForm)) return;
    if(window.OS) window.OS.addEnquiry({
      name:document.getElementById("cName").value.trim(),
      email:document.getElementById("cEmail").value.trim(),
      topic:document.getElementById("cTopic").value,
      message:document.getElementById("cMsg").value.trim()
    });
    ctOk.classList.add("show"); ctForm.querySelector("button").textContent="Sent ✓";
    setTimeout(function(){
      ctForm.reset(); ctOk.classList.remove("show"); ctForm.querySelector("button").textContent="Send message";
    },4000);
  });

  /* ---------- founding 40 application ---------- */
  var fndForm=document.getElementById("fndForm"), fndSuccess=document.getElementById("fndSuccess");
  var fndClaimed=0, fndTarget=40;
  var fConsent=document.getElementById("fConsent"), fConsentErr=document.getElementById("fConsentErr");
  var fPics=document.getElementById("fPics"), fPicsErr=document.getElementById("fPicsErr");
  fConsent.addEventListener("change",function(){ if(fConsent.checked) fConsentErr.style.display="none"; });
  fPics.addEventListener("change",function(){ if(fPics.checked) fPicsErr.style.display="none"; });
  fndForm.addEventListener("submit",function(e){
    e.preventDefault();
    var ok=validateScope(fndForm);
    if(!fConsent.checked){ fConsentErr.style.display="block"; ok=false; } else { fConsentErr.style.display="none"; }
    if(!fPics.checked){ fPicsErr.style.display="block"; ok=false; } else { fPicsErr.style.display="none"; }
    if(!ok){ fndForm.querySelector(".field.invalid")&&fndForm.querySelector(".field.invalid").scrollIntoView({block:"center",behavior:"smooth"}); return; }
    var claimedNow=(window.OS&&window.OS.foundingCount)?window.OS.foundingCount():fndClaimed;
    var seat=Math.min(claimedNow+1, fndTarget);
    fndClaimed=seat;
    var memberId="4F-"+("000"+seat).slice(-4);
    document.getElementById("fndCount").textContent=fndClaimed;
    document.getElementById("fndBar").style.width=(fndClaimed/fndTarget*100)+"%";
    var visitDate=document.getElementById("fVisitDate").value, visitTime=document.getElementById("fVisitTime").value;
    document.getElementById("fndId").textContent=memberId;
    document.getElementById("fndSeatLine").textContent="Charter seat #"+seat+" of "+fndTarget;
    document.getElementById("fndVisitLine").textContent="Visit booked: "+(visitDate?visitDate+" at "+visitTime:"—");
    if(window.OS) window.OS.addApplication({
      name:document.getElementById("fName").value.trim(),
      email:document.getElementById("fEmail").value.trim(),
      phone:document.getElementById("fPhone").value.trim(),
      work:document.getElementById("fWork").value.trim(),
      days:document.getElementById("fDays").value,
      start:document.getElementById("fStart").value,
      visitDate:visitDate, visitTime:visitTime,
      why:document.getElementById("fWhy").value.trim(),
      seat:seat, memberId:memberId, picsPolicy:true
    });
    fndForm.style.display="none"; fndSuccess.classList.add("show");
    fndForm.reset();
  });
  document.getElementById("fndAgain").addEventListener("click",function(){
    fndSuccess.classList.remove("show"); fndForm.style.display="block";
    fndForm.scrollIntoView({block:"center",behavior:"smooth"});
  });

  /* ---------- kickboxing classes ---------- */
  var CLASS_SCHEDULE=[
    {id:"KB-MON-PM",day:"Monday",time:"7:00 PM",level:"All levels",coach:"Coach Tari",price:"₦5,000 drop-in"},
    {id:"KB-TUE-AM",day:"Tuesday",time:"6:30 AM",level:"Beginner",coach:"Coach Tari",price:"₦5,000 drop-in"},
    {id:"KB-WED-PM",day:"Wednesday",time:"7:00 PM",level:"All levels",coach:"Coach Zee",price:"₦5,000 drop-in"},
    {id:"KB-THU-AM",day:"Thursday",time:"6:30 AM",level:"Intermediate",coach:"Coach Zee",price:"₦5,000 drop-in"},
    {id:"KB-FRI-PM",day:"Friday",time:"7:00 PM",level:"All levels",coach:"Coach Tari",price:"₦5,000 drop-in"},
    {id:"KB-SAT-AM",day:"Saturday",time:"10:00 AM",level:"All levels",coach:"Coach Zee",price:"₦5,000 drop-in"}
  ];
  var clsGrid=document.getElementById("clsGrid"), clsBook=document.getElementById("clsBook"),
      clsForm=document.getElementById("clsForm"), clsSuccess=document.getElementById("clsSuccess"), clsSel=null;
  if(clsGrid){
    clsGrid.innerHTML=CLASS_SCHEDULE.map(function(s){
      return '<div class="cls-card" data-sess="'+s.id+'"><div class="d">'+s.day+'</div><div class="t">Kickboxing · '+s.time+'</div>'
        +'<div class="m">'+s.level+' · '+s.coach+'</div><div class="p">'+s.price+'</div>'
        +'<button type="button" data-cls="'+s.id+'">Book this time</button></div>';
    }).join("");
    clsGrid.addEventListener("click",function(e){
      var b=e.target.closest("[data-cls]"); if(!b) return;
      clsSel=CLASS_SCHEDULE.filter(function(x){return x.id===b.dataset.cls;})[0];
      clsGrid.querySelectorAll(".cls-card").forEach(function(c){c.classList.toggle("sel",c.getAttribute("data-sess")===clsSel.id);});
      clsForm.style.display="block"; clsSuccess.classList.remove("show");
      document.getElementById("clsBookTitle").textContent="Kickboxing — "+clsSel.day+" "+clsSel.time;
      clsBook.hidden=false; clsBook.scrollIntoView({block:"center",behavior:"smooth"});
    });
    clsForm.addEventListener("submit",function(e){
      e.preventDefault();
      if(!validateScope(clsForm) || !clsSel){ var bad=clsForm.querySelector(".field.invalid"); if(bad)bad.scrollIntoView({block:"center",behavior:"smooth"}); return; }
      var rec=null;
      if(window.OS) rec=window.OS.addClass({
        session:clsSel.id, title:"Kickboxing", day:clsSel.day, time:clsSel.time,
        date:document.getElementById("clDate").value,
        name:document.getElementById("clName").value.trim(),
        email:document.getElementById("clEmail").value.trim(),
        phone:document.getElementById("clPhone").value.trim()
      });
      document.getElementById("clsSuccessLine").textContent="Kickboxing · "+clsSel.day+" "+clsSel.time+(rec?" · ref "+rec.id:"");
      clsForm.style.display="none"; clsSuccess.classList.add("show"); clsForm.reset();
    });
    document.getElementById("clsAgain").addEventListener("click",function(){
      clsSuccess.classList.remove("show"); clsForm.style.display="block"; clsBook.scrollIntoView({block:"center",behavior:"smooth"});
    });
  }

  /* ---------- active page (separate .html files) ---------- */
  function initPage(){
    var vis=document.querySelector("section[data-page]:not([hidden])");
    var r=vis?vis.getAttribute("data-page"):"home";
    var want=(r==="home")?"index.html":r+".html";
    [].slice.call(document.querySelectorAll(".nav-links a, .drawer a")).forEach(function(a){
      a.classList.toggle("active-link",(a.getAttribute("href")||"")===want);
    });
    [].slice.call(document.querySelectorAll("section[data-page]:not([hidden]) .reveal")).forEach(function(el){ el.classList.add("in"); });
    if(r==="home") runCount();
  }
  initPage();

  /* ---------- year ---------- */
  document.getElementById("yr").textContent=new Date().getFullYear();
})();

/* ======================================================
   4orth BUSINESS OS — localStorage store, admin panel, member portal
   Demo prototype. Change ADMIN below before deploying.
   ====================================================== */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s);};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});};
  var NGN=function(n){return "₦"+Math.round(+n||0).toLocaleString("en-NG");};
  var shortN=function(n){n=+n||0;return n>=1e6?("₦"+(n/1e6).toFixed(1)+"M"):NGN(n);};
  var fmt=function(d){try{return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});}catch(e){return d;}};
  var DAY=86400000, NOW=Date.now();
  var iso=function(off){return new Date(NOW+(off||0)*DAY).toISOString().slice(0,10);};
  var todayISO=iso(0);
  var rid=function(p){return p+Math.floor(100000+Math.random()*899999);};

  var ADMIN={user:"Ameera", pass:"bestspace"};   // change before deploying
  var CLIENT_PIN="0000";
  var POINT_VALUE=10;                        // ₦ cash value per point
  var TIER_THRESH={Resident:0, Signature:5000, Executive:20000};
  var TIER_ORDER=["Resident","Signature","Executive"];

  /* ---------------- seed + store ---------------- */
  function seed(){
    return {
      meta:{currency:"NGN", seededAt:NOW, foundingBase:24, foundingTarget:40},
      staff:[
        {id:"S1",name:"Amina Yusuf",role:"Club Manager",dept:"Executive",reportsTo:"",email:"amina@4orthspace.com"},
        {id:"S2",name:"Tunde Bello",role:"Front of House",dept:"Spaces",reportsTo:"S1",email:"tunde@4orthspace.com"},
        {id:"S3",name:"Chidinma Okoro",role:"Membership & Community",dept:"Members",reportsTo:"S1",email:"chidinma@4orthspace.com"},
        {id:"S4",name:"Emeka Nwankwo",role:"Facilities",dept:"Operations",reportsTo:"S1",email:"emeka@4orthspace.com"},
        {id:"S5",name:"Fatima Sani",role:"Finance",dept:"Accounting",reportsTo:"S1",email:"fatima@4orthspace.com"}
      ],
      clients:[
        {id:"4M-0001",name:"Amara Okonkwo",email:"amara@okonkwo.co",phone:"+234 803 000 1122",tier:"Signature",points:12400,repId:"S3",since:"2026-02",pin:"0000",space:"Dedicated desk DD-02",family:{partner:" Chidi",children:"—",birthday:"14 Mar"},prefs:"Quiet corner desk, oat flat white"},
        {id:"4M-0002",name:"David Achebe",email:"david.a@gmail.com",phone:"+234 701 555 2210",tier:"Resident",points:3200,repId:"S3",since:"2026-05",pin:"0000",space:"Hot desk pool",family:{partner:"—",children:"2",birthday:"2 Aug"},prefs:"Hot desk near the windows"},
        {id:"4M-0003",name:"Nkechi Bello",email:"hello@formandfield.co",phone:"+234 805 221 0043",tier:"Signature",points:8600,repId:"S3",since:"2026-03",pin:"0000",space:"Creative studio ST-1",family:{partner:"—",children:"—",birthday:"9 Nov"},prefs:"Studio light, afternoons"},
        {id:"4M-0004",name:"Lumen Fintech",email:"ops@lumen.ng",phone:"+234 809 400 7788",tier:"Executive",points:24000,repId:"S1",since:"2026-01",pin:"0000",space:"Private office PO-1",family:{partner:"—",children:"—",birthday:"—"},prefs:"Boardroom standing booking, Tue AM"},
        {id:"4M-0005",name:"Kemi Adeyemi",email:"kemi@studiok.ng",phone:"+234 802 118 9001",tier:"Resident",points:1500,repId:"S3",since:"2026-09",pin:"0000",space:"Hot desk pool",family:{partner:"—",children:"1",birthday:"21 Jun"},prefs:"Day passes, mornings"},
        {id:"4M-0006",name:"Zaina Group",email:"pa@zaina.group",phone:"+234 806 770 3321",tier:"Executive",points:30200,repId:"S1",since:"2025-12",pin:"0000",space:"Private office PO-2",family:{partner:"—",children:"—",birthday:"—"},prefs:"Monthly boardroom, catering"}
      ],
      spaces:[
        {id:"HD-01",item:"Hot desk HD-01",type:"Hot desk",status:"Occupied",price:8000,unit:"day"},
        {id:"HD-02",item:"Hot desk HD-02",type:"Hot desk",status:"Occupied",price:8000,unit:"day"},
        {id:"HD-03",item:"Hot desk HD-03",type:"Hot desk",status:"Available",price:8000,unit:"day"},
        {id:"HD-04",item:"Hot desk HD-04",type:"Hot desk",status:"Available",price:8000,unit:"day"},
        {id:"HD-05",item:"Hot desk HD-05",type:"Hot desk",status:"Reserved",price:8000,unit:"day"},
        {id:"HD-06",item:"Hot desk HD-06",type:"Hot desk",status:"Available",price:8000,unit:"day"},
        {id:"DD-01",item:"Dedicated desk DD-01",type:"Dedicated desk",status:"Occupied",price:85000,unit:"month"},
        {id:"DD-02",item:"Dedicated desk DD-02",type:"Dedicated desk",status:"Occupied",price:85000,unit:"month"},
        {id:"DD-03",item:"Dedicated desk DD-03",type:"Dedicated desk",status:"Available",price:85000,unit:"month"},
        {id:"DD-04",item:"Dedicated desk DD-04",type:"Dedicated desk",status:"Reserved",price:85000,unit:"month"},
        {id:"PO-1",item:"Private office PO-1",type:"Private office",status:"Occupied",price:250000,unit:"month"},
        {id:"PO-2",item:"Private office PO-2",type:"Private office",status:"Occupied",price:250000,unit:"month"},
        {id:"PO-3",item:"Private office PO-3",type:"Private office",status:"Available",price:250000,unit:"month"},
        {id:"MR-1",item:"Meeting room MR-1",type:"Meeting room",status:"Available",price:15000,unit:"hour"},
        {id:"MR-2",item:"Meeting room MR-2",type:"Meeting room",status:"Reserved",price:15000,unit:"hour"},
        {id:"BR-1",item:"Boardroom",type:"Boardroom",status:"Occupied",price:120000,unit:"day"},
        {id:"ST-1",item:"Creative studio ST-1",type:"Studio",status:"Occupied",price:180000,unit:"month"}
      ],
      bookings:[
        {ref:"4S-482910",type:"work",space:"Private office · Monthly",member:"Amara Okonkwo",email:"amara@okonkwo.co",date:iso(5),value:"₦250,000",status:"Confirmed",at:NOW-2*DAY},
        {ref:"4S-471223",type:"room",space:"Boardroom · Full day",member:"Lumen Fintech",email:"ops@lumen.ng",date:iso(2),value:"₦120,000",status:"Confirmed",at:NOW-1*DAY},
        {ref:"4S-465002",type:"work",space:"Hot desk · Day pass",member:"David Achebe",email:"david.a@gmail.com",date:iso(0),value:"₦8,000",status:"Completed",at:NOW-3*DAY},
        {ref:"4S-459871",type:"work",space:"Creative studio · Monthly",member:"Nkechi Bello",email:"hello@formandfield.co",date:iso(4),value:"₦180,000",status:"Requested",at:NOW-4*DAY},
        {ref:"4S-448190",type:"room",space:"Meeting room · 4 hours",member:"Zaina Group",email:"pa@zaina.group",date:iso(1),value:"₦52,000",status:"Confirmed",at:NOW-5*DAY},
        {ref:"4S-441007",type:"tour",space:"Private tour",member:"Kemi Adeyemi",email:"kemi@studiok.ng",date:iso(3),value:"Free",status:"Requested",at:NOW-6*DAY}
      ],
      enquiries:[
        {id:"ENQ-204881",name:"Ifeoma Nwosu",email:"ifeoma@design.ng",topic:"Membership",message:"Interested in Signature for our three-person design team. Space from December, and can we split billing?",received:fmt(NOW-2*DAY),status:"New",at:NOW-2*DAY},
        {id:"ENQ-204790",name:"Bricks & Co",email:"events@bricks.co",topic:"Meeting / event hire",message:"Looking to host a 40-person product launch in December. Is the event floor free midweek evenings?",received:fmt(NOW-3*DAY),status:"Replied",at:NOW-3*DAY}
      ],
      applications:[
        {id:"F40-028",memberId:"4F-0026",seat:26,name:"Chioma Okeke",email:"chioma@okekestudio.com",phone:"+234 803 000 1122",work:"Brand designer",days:"3–4 days",start:"As soon as you open",why:"Running a small studio solo and need somewhere calmer than home.",received:fmt(NOW-2*DAY),status:"New",at:NOW-2*DAY},
        {id:"F40-027",memberId:"4F-0025",seat:25,name:"Emeka Dafe",email:"emeka@dafe.dev",phone:"+234 701 555 8890",work:"Software engineer",days:"Most days",start:"Within two weeks",why:"Remote for a London fintech, tired of cafés.",received:fmt(NOW-3*DAY),status:"Reviewed",at:NOW-3*DAY},
        {id:"F40-026",memberId:"4F-0024",seat:24,name:"Hauwa Bello",email:"hauwa.b@gmail.com",phone:"+234 805 221 0043",work:"Writer & researcher",days:"1–2 days",start:"Within a month",why:"Writing a book, want focused days away from the house.",received:fmt(NOW-4*DAY),status:"New",at:NOW-4*DAY}
      ],
      tasks:[
        {id:"T1",title:"Confirm fibre + backup power install date",owner:"S4",due:iso(-2),priority:"High",status:"In progress"},
        {id:"T2",title:"Call Signature applicants from last week",owner:"S3",due:iso(-1),priority:"High",status:"To do"},
        {id:"T3",title:"Restock the pantry for the week",owner:"S2",due:iso(0),priority:"Medium",status:"To do"},
        {id:"T4",title:"Draft November member newsletter",owner:"S3",due:iso(4),priority:"Medium",status:"To do"},
        {id:"T5",title:"Reconcile October café takings",owner:"S5",due:iso(-3),priority:"Medium",status:"Done"}
      ],
      loyaltyTx:[
        {id:"LX1",clientId:"4M-0001",type:"earn",points:1200,note:"Signature membership — November",at:NOW-6*DAY},
        {id:"LX2",clientId:"4M-0001",type:"spend",points:-500,note:"Guest day pass",at:NOW-3*DAY},
        {id:"LX3",clientId:"4M-0004",type:"earn",points:3500,note:"Executive office — November",at:NOW-7*DAY},
        {id:"LX4",clientId:"4M-0003",type:"earn",points:900,note:"Studio hire",at:NOW-5*DAY}
      ],
      invoices:[
        {id:"INV-2041",clientId:"4M-0001",date:iso(-16),amount:85000,status:"Paid",desc:"Signature membership — November"},
        {id:"INV-2042",clientId:"4M-0004",date:iso(-16),amount:250000,status:"Paid",desc:"Executive office — November"},
        {id:"INV-2043",clientId:"4M-0003",date:iso(-16),amount:85000,status:"Paid",desc:"Signature membership — November"},
        {id:"INV-2051",clientId:"4M-0002",date:iso(-6),amount:45000,status:"Due",desc:"Resident membership — November"},
        {id:"INV-2052",clientId:"4M-0006",date:iso(-16),amount:250000,status:"Paid",desc:"Executive office — November"}
      ],
      events:[
        {id:"EV-1",title:"Founders' breakfast",date:iso(11),rsvp:["4M-0001","4M-0004"]},
        {id:"EV-2",title:"Design & coffee: a studio evening",date:iso(18),rsvp:["4M-0003"]},
        {id:"EV-3",title:"Year-end member mixer",date:iso(32),rsvp:[]}
      ],
      documents:[
        {id:"DOC-1",clientId:"4M-0001",name:"Membership agreement.pdf",kind:"Agreement"},
        {id:"DOC-2",clientId:"4M-0001",name:"Invoice INV-2041.pdf",kind:"Invoice"},
        {id:"DOC-3",clientId:"4M-0004",name:"Membership agreement.pdf",kind:"Agreement"},
        {id:"DOC-4",clientId:"4M-0003",name:"Studio house rules.pdf",kind:"Policy"}
      ],
      rewards:[
        {id:"R1",name:"Free day pass",cost:800},
        {id:"R2",name:"Boardroom hour",cost:1500},
        {id:"R3",name:"Barista drinks voucher (₦5,000)",cost:500},
        {id:"R4",name:"Guest pass",cost:1000},
        {id:"R5",name:"Member event +1",cost:600}
      ],
      outbox:[
        {id:"EM-1",to:"members@4orthspace.com",subject:"Founders' breakfast — RSVP now",body:"You're invited to the first Founders' breakfast at 4orth.",at:NOW-1*DAY}
      ],
      classes:[
        {id:"KB-204011",session:"KB-MON-PM",title:"Kickboxing",day:"Monday",time:"7:00 PM",date:iso(3),name:"Kemi Adeyemi",email:"kemi@studiok.ng",phone:"+234 802 118 9001",status:"Booked",received:fmt(NOW-1*DAY),at:NOW-1*DAY},
        {id:"KB-203980",session:"KB-SAT-AM",title:"Kickboxing",day:"Saturday",time:"10:00 AM",date:iso(5),name:"David Achebe",email:"david.a@gmail.com",phone:"+234 701 555 2210",status:"Booked",received:fmt(NOW-2*DAY),at:NOW-2*DAY}
      ],
      attendance:[
        {id:"ATT-9001",staffId:"S2",date:iso(-1),inAt:NOW-1*DAY-9*3600000,outAt:NOW-1*DAY-1*3600000,hours:8},
        {id:"ATT-9002",staffId:"S3",date:iso(-1),inAt:NOW-1*DAY-9*3600000,outAt:NOW-1*DAY-2*3600000,hours:7},
        {id:"ATT-9003",staffId:"S2",date:iso(-2),inAt:NOW-2*DAY-9*3600000,outAt:NOW-2*DAY-1.5*3600000,hours:7.5},
        {id:"ATT-9004",staffId:"S4",date:iso(-2),inAt:NOW-2*DAY-8*3600000,outAt:NOW-2*DAY-0*3600000,hours:8}
      ],
      dailyReports:[
        {id:"DR-9001",staffId:"S2",date:iso(-1),done:"Covered front desk, onboarded two day-pass guests, restocked the pantry.",tomorrow:"Set up for the Founders' breakfast.",blockers:"None",hours:8,at:NOW-1*DAY,replies:[{by:"S1",text:"Great work, thank you Tunde.",at:NOW-1*DAY+1800000}]},
        {id:"DR-9002",staffId:"S3",date:iso(-1),done:"Called five Signature applicants, three booked tours.",tomorrow:"Follow up on the Zaina Group proposal.",blockers:"Waiting on pricing sign-off from finance.",hours:7,at:NOW-1*DAY,replies:[]}
      ],
      queries:[
        {id:"Q-9001",staffId:"S3",subject:"Membership follow-ups",body:"Please make sure every Signature lead from last week is contacted and logged before the end of the week.",deadline:iso(2),issuedBy:"S1",status:"Open",at:NOW-2*DAY,replies:[]},
        {id:"Q-9002",staffId:"S2",subject:"Opening checklist",body:"Can you confirm the morning opening checklist is being completed and signed each day?",deadline:iso(1),issuedBy:"S1",status:"Open",at:NOW-1*DAY,replies:[]}
      ],
      reminders:[
        {id:"RM-9001",staffId:"S3",message:"Reminder: please submit today's daily report before 3pm.",by:"S1",at:NOW-90*60000,read:false},
        {id:"RM-9002",staffId:"S2",message:"Don't forget to log the pantry restock on the ops sheet.",by:"S1",at:NOW-3*3600000,read:false}
      ],
      calendar:[
        {id:"CAL-1",title:"All-hands team meeting",date:iso(1),type:"Meeting",who:"All staff"},
        {id:"CAL-2",title:"Emeka on leave",date:iso(2),type:"Leave",who:"Emeka Nwankwo"},
        {id:"CAL-3",title:"Coffee beans delivery",date:iso(3),type:"Delivery",who:"Matcha Street"},
        {id:"CAL-4",title:"Founders' breakfast setup",date:iso(11),type:"Meeting",who:"Front of house"}
      ],
      posts:[
        {id:"PST-1",title:"Why Abuja needs a fourth space",body:"A short note on the thinking behind 4orth: a members' club and creative workspace for people whose ambition needs somewhere to live.",status:"Published",author:"Amina Yusuf",at:NOW-5*DAY},
        {id:"PST-2",title:"Meet the Founding 40",body:"Draft introducing our charter members and what the first months of 4orth will look like.",status:"Draft",author:"Chidinma Okoro",at:NOW-1*DAY}
      ],
      newsletters:[
        {id:"NL-1",subject:"4orth is almost open",body:"We're counting down to opening the rooftop. Here's what Founding 40 members can expect.",at:NOW-7*DAY,recipients:6}
      ],
      expenses:[
        {id:"EX-1",category:"Rent",amount:1200000,date:iso(-10),note:"Guzape premises — monthly"},
        {id:"EX-2",category:"Salaries",amount:1770000,date:iso(-8),note:"Team payroll"},
        {id:"EX-3",category:"Utilities",amount:240000,date:iso(-7),note:"Power, water, internet"},
        {id:"EX-4",category:"Supplies",amount:180000,date:iso(-5),note:"Café and pantry stock"},
        {id:"EX-5",category:"Marketing",amount:150000,date:iso(-4),note:"Pre-launch campaign"},
        {id:"EX-6",category:"Maintenance",amount:90000,date:iso(-3),note:"Furniture and fittings"},
        {id:"EX-7",category:"Rent",amount:1200000,date:iso(-40),note:"Guzape premises — monthly"},
        {id:"EX-8",category:"Salaries",amount:1770000,date:iso(-38),note:"Team payroll"},
        {id:"EX-9",category:"Utilities",amount:220000,date:iso(-37),note:"Power, water, internet"}
      ],
      permissions:{},
      audit:[]
    };
  }
  /* Clean starting state: structure kept (staff, spaces, rewards), all records empty.
     This is the default the dashboard loads with. Swap startState=seed to load sample data. */
  function emptyState(){
    var s=seed();
    ["clients","bookings","enquiries","applications","tasks","loyaltyTx","invoices","events","documents","outbox","classes","attendance","dailyReports","queries","reminders","payrollRuns","reports","outreach","calendar","posts","newsletters","expenses","audit"].forEach(function(k){ s[k]=[]; });
    s.checklist={}; s.execNotes={}; s.permissions={};
    if(s.staff) s.staff.forEach(function(st){ st.training=[]; });
    s.meta.foundingBase=0;
    return s;
  }
  function startState(){ return emptyState(); }

  var KEY="fourthOS_v5", DB=null;
  function load(){ try{var r=localStorage.getItem(KEY);DB=r?JSON.parse(r):startState();}catch(e){DB=startState();} if(!DB||!DB.meta)DB=startState(); }
  function save(){ try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){} }
  load();
  if(!DB.classes) DB.classes=[];
  ["attendance","dailyReports","queries","reminders","payrollRuns","reports","outreach","calendar","posts","newsletters","expenses","audit"].forEach(function(k){ if(!DB[k]) DB[k]=[]; });
  if(!DB.permissions) DB.permissions={};
  if(!DB.checklist) DB.checklist={};
  if(!DB.execNotes) DB.execNotes={};
  if(DB.enquiries) DB.enquiries.forEach(function(en){ if(en.source==null)en.source="Website"; if(en.owner==null)en.owner=""; });
  if(DB.staff) DB.staff.forEach(function(s){ if(!s.pin) s.pin="0000"; if(s.salary==null) s.salary={S1:600000,S2:220000,S3:300000,S4:250000,S5:400000}[s.id]||250000; if(!s.training) s.training=[]; });

  /* ---------------- spreadsheet storage (Google Sheets via Apps Script) ----------------
     1. Make a Google Sheet. Extensions > Apps Script, paste the code from apps-script.gs.
     2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone. Copy the /exec URL.
     3. Paste it into SHEET.url below. Leave blank to run on local demo data (localStorage).
     When set: every new record is POSTed to the sheet, and the admin can pull live data from it. */
  var SHEET={ url:"https://script.google.com/macros/s/AKfycbyvedIzGs_FlVe8S_3PyLv72dYSWWsi1E9fdYR-rfvkpOc0W7s4hsUa-E0WVXcAKI8_gw/exec" };
  function postSheet(kind,data){
    if(!SHEET.url) return;
    try{ fetch(SHEET.url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({kind:kind,data:data})}); }catch(e){}
  }
  function syncFromSheet(done){
    if(!SHEET.url){ if(done)done(false,"no-url"); return; }
    var cbName="__os_sheet_"+Date.now();
    var s=document.createElement("script");
    var to=setTimeout(function(){ cleanup(); if(done)done(false,"timeout"); },12000);
    function cleanup(){ clearTimeout(to); try{delete window[cbName];}catch(e){window[cbName]=undefined;} if(s.parentNode)s.parentNode.removeChild(s); }
    window[cbName]=function(res){
      try{ ["applications","bookings","enquiries","classes","clients","tasks"].forEach(function(k){ if(res&&Array.isArray(res[k])){ DB[k]=res[k]; } }); save(); }catch(e){}
      cleanup(); if(done)done(true);
    };
    s.src=SHEET.url+(SHEET.url.indexOf("?")>=0?"&":"?")+"callback="+cbName+"&t="+Date.now();
    s.onerror=function(){ cleanup(); if(done)done(false,"error"); };
    document.body.appendChild(s);
  }

  /* ---------------- helpers ---------------- */
  function download(name, text){ try{var b=new Blob([text],{type:"text/csv;charset=utf-8"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},500);}catch(e){} }
  function toCSV(rows){ if(!rows||!rows.length)return ""; var keys=Object.keys(rows[0]); var cell=function(v){v=(v==null)?"":String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}; return keys.join(",")+"\n"+rows.map(function(r){return keys.map(function(k){return cell(r[k]);}).join(",");}).join("\n"); }
  function mail(to,subject,body){ DB.outbox.unshift({id:rid("EM-"),to:to,subject:subject,body:body,at:Date.now()}); save(); }
  function staffName(id){var s=DB.staff.filter(function(x){return x.id===id;})[0];return s?s.name:"—";}
  function pill(s){ var m={Confirmed:"confirmed",Completed:"confirmed",Paid:"confirmed",Active:"confirmed",Done:"confirmed",Reviewed:"confirmed",Replied:"confirmed",Available:"confirmed",Requested:"new",New:"new","To do":"new",Occupied:"new",Pending:"pending","In progress":"pending",Due:"pending",Reserved:"pending",Cancelled:"",Rejected:""}; return '<span class="d-status '+(m[s]||"")+'"><i></i>'+esc(s)+'</span>'; }
  function tbl(headers, rows){ return '<div class="d-tblwrap"><table><thead><tr>'+headers.map(function(h){return '<th>'+h+'</th>';}).join("")+'</tr></thead><tbody>'+(rows.join("")||'<tr><td colspan="'+headers.length+'"><div class="d-empty" style="margin:8px 0">Nothing here yet.</div></td></tr>')+'</tbody></table></div>'; }
  function overdue(t){ return t.status!=="Done" && t.due<todayISO; }
  function money(v){ v=String(v).replace(/[^0-9.]/g,""); return +v||0; }
  function occupancy(){ var tot=DB.spaces.length, occ=DB.spaces.filter(function(s){return s.status==="Occupied";}).length; return tot?Math.round(occ/tot*100):0; }
  function foundingClaimed(){ return (DB.meta.foundingBase||0)+DB.applications.length; }

  /* ---------------- public API (site forms write here) ---------------- */
  window.OS={
    addBooking:function(b){ var r={ref:b.ref||rid("4S-"),type:b.type||"work",space:b.space||"",member:b.name||b.member||"Guest",email:b.email||"",phone:b.phone||"",date:b.date||"",value:b.value||"",status:"Requested",received:fmt(Date.now()),at:Date.now()}; DB.bookings.unshift(r); mail("frontdesk@4orthspace.com","New booking "+r.ref,r.member+" requested "+r.space); save(); postSheet("booking",r); if(adminAuthed)refreshAdmin(); return r; },
    addEnquiry:function(en){ var r={id:rid("ENQ-"),name:en.name,email:en.email,topic:en.topic,message:en.message,source:en.source||"Website",owner:"",received:fmt(Date.now()),status:"New",at:Date.now()}; DB.enquiries.unshift(r); save(); postSheet("enquiry",r); if(adminAuthed)refreshAdmin(); return r; },
    addApplication:function(ap){ var r={id:rid("F40-"),memberId:ap.memberId||("4F-"+("000"+(ap.seat||0)).slice(-4)),seat:ap.seat,name:ap.name,email:ap.email,phone:ap.phone,work:ap.work,days:ap.days,start:ap.start,visitDate:ap.visitDate||"",visitTime:ap.visitTime||"",why:ap.why,picsPolicy:ap.picsPolicy===true,received:fmt(Date.now()),status:"New",at:Date.now()}; DB.applications.unshift(r); save(); postSheet("application",r); if(adminAuthed)refreshAdmin(); return r; },
    addClass:function(c){ var r={id:rid("KB-"),session:c.session||"",title:c.title||"Kickboxing",day:c.day||"",time:c.time||"",date:c.date||"",name:c.name||"",email:c.email||"",phone:c.phone||"",status:"Booked",received:fmt(Date.now()),at:Date.now()}; DB.classes.unshift(r); mail("classes@4orthspace.com","Class booking "+r.id,r.name+" booked "+r.title+" "+r.day+" "+r.time); save(); postSheet("class",r); if(adminAuthed)refreshAdmin(); return r; },
    addMember:function(mm){ var mx=0; DB.clients.forEach(function(c){var g=/(\d+)$/.exec(c.id||"");if(g){mx=Math.max(mx,parseInt(g[1],10));}}); var r={id:mm.id||("4M-"+("000"+(mx+1)).slice(-4)),name:mm.name,email:mm.email||"",phone:mm.phone||"",tier:"Resident",points:0,repId:"S3",since:new Date().toISOString().slice(0,7),pin:mm.pin||CLIENT_PIN,space:"Hot desk pool",family:{partner:"—",children:"—",birthday:"—"},prefs:"New member"}; DB.clients.unshift(r); mail("members@4orthspace.com","New member "+r.id,r.name+" created an account"); save(); postSheet("member",{id:r.id,name:r.name,email:r.email,phone:r.phone,tier:r.tier,points:r.points,space:r.space,since:r.since,status:"Active",received:fmt(Date.now()),at:Date.now()}); if(adminAuthed)refreshAdmin(); return r; },
    sync:function(done){ syncFromSheet(done); },
    foundingCount:function(){ return foundingClaimed(); },
    hasSheet:function(){ return !!SHEET.url; },
    reset:function(){ DB=startState(); save(); }
  };

  /* ================= ADMIN ================= */
  var adminAuthed=false, adminTab="overview";
  var fBookings="all", fEnq="all", fTasks="all", fSpaces="all", membersSub="members";
  var dash=$("#dash"), dGate=$("#dashGate"), dApp=$("#dashApp");
  var TITLES={overview:"Executive overview",clients:"Clients & CRM",operations:"Operations",marketing:"Marketing",hr:"Human resources",accounting:"Accounting",platform:"Platform"};
  var clientsSub="crm", clientsSel=null, opsSub="calendar", opsCalYM=null, mktSub="journal", accPeriod="month";
  var hrSub="people";

  function openAdmin(){ closePortal(); closeStaff(); dash.classList.add("open"); document.body.style.overflow="hidden"; (adminAuthed?$("#dashOut"):$("#dashUser")).focus(); }
  function closeAdmin(){ dash.classList.remove("open"); if(!$("#portal").classList.contains("open")) document.body.style.overflow=""; }

  function adminAuth(){
    if($("#dashUser").value.trim()===ADMIN.user && $("#dashPass").value===ADMIN.pass){
      adminAuthed=true; dGate.hidden=true; dApp.hidden=false; $("#dashLiveTag").hidden=false; $("#dashReset").hidden=false;
      if(window.OS&&window.OS.hasSheet()) $("#dashSync").hidden=false;
      $("#dashDate").textContent="Guzape, Abuja · "+new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
      renderAdmin(); $("#dashOut").focus();
      if(window.OS&&window.OS.hasSheet()) syncFromSheet(function(ok){ if(ok) renderAdmin(); });
    } else { dGate.classList.add("bad"); $("#dashErr").style.display="block"; $("#dashPass").select(); }
  }
  function signOutAdmin(){ adminAuthed=false; dApp.hidden=true; dGate.hidden=false; $("#dashLiveTag").hidden=true; $("#dashReset").hidden=true; $("#dashUser").value=""; $("#dashPass").value=""; }

  function refreshAdmin(){ if(adminAuthed){ renderCounts(); renderAdmin(); } }
  function renderCounts(){
    var bc=$("#bkCount"); if(bc)bc.textContent="("+DB.bookings.length+")";
    var ec=$("#enqCount"); if(ec){var ne=DB.enquiries.filter(function(x){return x.status==="New";}).length; ec.textContent=ne?("("+ne+")"):"";}
    var tc=$("#taskCount"); if(tc){var ot=DB.tasks.filter(overdue).length; tc.textContent=ot?("("+ot+")"):"";}
  }

  function renderAdmin(){
    renderCounts();
    ({overview:aOverview,clients:aClients,operations:aOps,marketing:aMarketing,hr:aHR,accounting:aAccounting,platform:aPlatform}[adminTab])();
  }

  function aOverview(){
    var revMonth=DB.invoices.filter(function(i){return i.status==="Paid";}).reduce(function(a,b){return a+b.amount;},0);
    var openEnq=DB.enquiries.filter(function(x){return x.status==="New";}).length;
    var openBk=DB.bookings.filter(function(x){return x.status==="Requested"||x.status==="Confirmed";}).length;
    var ptsLiab=DB.clients.reduce(function(a,b){return a+b.points;},0)*POINT_VALUE;
    var od=DB.tasks.filter(overdue);
    var seatsLeft=(DB.meta.foundingTarget||40)-foundingClaimed();
    var kpis=[
      ["<span>"+occupancy()+"%</span>","Occupancy","of "+DB.spaces.length+" spaces"],
      [DB.clients.length,"Active members","CRM profiles"],
      [shortN(revMonth).replace("₦","<span>₦")+"</span>","Revenue booked","paid invoices"],
      [openBk,"Open bookings","requested + confirmed"],
      [openEnq,"Open enquiries",openEnq?"awaiting reply":"inbox clear"],
      ["<span>"+shortN(ptsLiab)+"</span>","Points liability",DB.clients.reduce(function(a,b){return a+b.points;},0).toLocaleString()+" pts"]
    ];
    var html='<div class="d-kpis">'+kpis.map(function(k){return '<div class="d-kpi"><b>'+k[0]+'</b><div class="lab">'+k[1]+'</div><em>'+k[2]+'</em></div>';}).join("")+'</div>';
    html+=reportBanner();
    // alerts
    if(od.length){
      html+='<div class="os-alert red"><div><b>'+od.length+' overdue task'+(od.length>1?"s":"")+'</b> — '+esc(od.map(function(t){return staffName(t.owner);}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(", "))+'</div><button class="os-btn" data-remindall="1">Remind all</button></div>';
    }
    if(seatsLeft>0){ html+='<div class="os-alert amber"><div><b>Founding 40:</b> '+foundingClaimed()+' of '+(DB.meta.foundingTarget||40)+' charter seats claimed, '+seatsLeft+' open</div><button class="os-btn" data-gotab="members">Review applicants</button></div>'; }
    // panels
    var done=DB.tasks.filter(function(t){return t.status==="Done";}).length;
    var byTier=TIER_ORDER.map(function(t){return {t:t,n:DB.clients.filter(function(c){return c.tier===t;}).length};});
    var maxTier=Math.max.apply(null,byTier.map(function(x){return x.n;}))||1;
    html+='<div class="d-split"><div class="d-panel"><h3>Membership by tier</h3><div class="ph">Active members</div><div class="d-bars">'+
      byTier.map(function(x){return '<div class="d-bar-row"><span>'+x.t+'</span><span class="d-track"><span class="d-fill" style="width:'+(x.n/maxTier*100)+'%"></span></span><span class="val">'+x.n+'</span></div>';}).join("")+
      '</div></div><div class="d-panel"><h3>Recent loyalty activity</h3><div class="ph">Points earned and spent</div><ul class="d-feed">'+
      DB.loyaltyTx.slice(0,6).map(function(x){var c=DB.clients.filter(function(cl){return cl.id===x.clientId;})[0];return '<li><time>'+(x.points>0?"+":"")+x.points+'</time><span>'+esc(c?c.name:x.clientId)+' — '+esc(x.note)+'</span></li>';}).join("")+
      '</ul></div></div>';
    // task completion + outbox
    html+='<div class="d-split"><div class="d-panel"><h3>Team task completion</h3><div class="ph">'+done+' of '+DB.tasks.length+' done</div><div class="d-track" style="height:10px"><span class="d-fill" style="width:'+(DB.tasks.length?done/DB.tasks.length*100:0)+'%"></span></div><div style="margin-top:16px" class="d-feed">'+
      DB.bookings.slice(0,4).map(function(b){return '<li><time>'+esc(fmt(b.at))+'</time><span>'+esc(b.member)+' — '+esc(b.space)+' '+pill(b.status)+'</span></li>';}).join("")+'</div></div>'+
      '<div class="d-panel"><h3>Email outbox</h3><div class="ph">'+DB.outbox.length+' sent · demo</div><ul class="d-feed">'+
      DB.outbox.slice(0,6).map(function(m){return '<li><time>'+esc(fmt(m.at))+'</time><span>'+esc(m.subject)+' <span style="color:var(--muted)">→ '+esc(m.to)+'</span></span></li>';}).join("")+'</ul></div></div>';
    html+=execChecklist()+'<div class="d-split">'+execNotesPanel()+execReportsPanel()+'</div>';
    $("#dv-overview").innerHTML=html;
  }

  function aSpaces(){
    var types=["all"].concat(DB.spaces.map(function(s){return s.type;}).filter(function(v,i,a){return a.indexOf(v)===i;}));
    var list=fSpaces==="all"?DB.spaces:DB.spaces.filter(function(s){return s.type===fSpaces;});
    var rows=list.map(function(s){return '<tr><td class="d-ref">'+esc(s.id)+'</td><td>'+esc(s.item)+'</td><td style="color:var(--muted)">'+esc(s.type)+'</td><td>'+NGN(s.price)+' <span style="color:var(--muted);font-family:var(--f-mono);font-size:.7rem">/'+esc(s.unit)+'</span></td><td>'+pill(s.status)+'</td></tr>';});
    var floor='<div class="floor-grid">'+DB.spaces.map(function(s){return '<button class="floor-cell fc-'+s.status.toLowerCase()+'" data-floor="'+esc(s.id)+'"><div class="fc-id">'+esc(s.id)+'</div><div class="fc-t">'+esc(s.type)+'</div><div class="fc-s fc-'+s.status.toLowerCase()+'"><i></i>'+esc(s.status)+'</div></button>';}).join("")+'</div>';
    return (
      '<div class="d-panel"><h3>Floor status</h3><div class="ph">Guzape · one floor · tap a space to cycle Available → Reserved → Occupied</div>'+floor+'</div>'+
      '<div class="os-actions"><span class="lab" style="font-family:var(--f-mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Filter:</span>'+
      types.map(function(t){return '<button class="d-chip'+(fSpaces===t?" on":"")+'" data-fsp="'+esc(t)+'">'+(t==="all"?"All":esc(t))+'</button>';}).join("")+
      '<button class="os-btn" data-csv="spaces" style="margin-left:auto">Export CSV</button></div>'+
      '<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["ID","Space","Type","Price","Status"],rows)+'</div>');
  }

  function aBookings(){
    var opts=[["all","All"],["work","Workspace"],["room","Meeting room"],["tour","Tour"]];
    var list=fBookings==="all"?DB.bookings:DB.bookings.filter(function(b){return b.type===fBookings;});
    var rows=list.map(function(b){
      var next={Requested:"Confirmed",Confirmed:"Completed",Completed:"Completed",Cancelled:"Cancelled"}[b.status]||"Confirmed";
      var actions;
      if(b.status==="Requested"){ actions='<button class="os-btn brass" data-bkapprove="'+esc(b.ref)+'">Approve</button> <button class="os-btn" data-bkreject="'+esc(b.ref)+'">Reject</button>'; }
      else if(b.status!=="Completed"&&b.status!=="Cancelled"){ actions='<button class="os-btn" data-badv="'+esc(b.ref)+'" data-next="'+next+'">→ '+next+'</button>'; }
      else { actions='<span style="color:var(--muted)">—</span>'; }
      return '<tr><td class="d-ref">'+esc(b.ref)+'</td><td><div>'+esc(b.member)+'</div><div style="font-family:var(--f-mono);font-size:.7rem;color:var(--muted)">'+esc(b.email)+'</div></td><td>'+esc(b.space)+'</td><td style="color:var(--muted);white-space:nowrap">'+esc(b.date||"—")+'</td><td>'+esc(b.value)+'</td><td>'+pill(b.status)+'</td><td style="white-space:nowrap">'+actions+'</td></tr>';
    });
    var clsRows=DB.classes.map(function(c){return '<tr><td class="d-ref">'+esc(c.id)+'</td><td><div>'+esc(c.name)+'</div><div style="font-family:var(--f-mono);font-size:.7rem;color:var(--muted)">'+esc(c.email)+' · '+esc(c.phone||"—")+'</div></td><td>'+esc(c.title)+' · '+esc(c.day)+' '+esc(c.time)+'</td><td style="color:var(--muted);white-space:nowrap">'+esc(c.date||"—")+'</td><td>'+pill(c.status)+'</td></tr>';});
    return (
      '<div class="os-actions">'+opts.map(function(o){return '<button class="d-chip'+(fBookings===o[0]?" on":"")+'" data-fbk="'+o[0]+'">'+o[1]+'</button>';}).join("")+'<button class="os-btn" data-csv="bookings" style="margin-left:auto">Export CSV</button></div>'+
      '<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["Ref","Member","Space","Date","Value","Status","Advance"],rows)+'</div>'+
      '<div class="os-actions" style="margin-top:30px"><span style="font-family:var(--f-mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Kickboxing class bookings ('+DB.classes.length+')</span><button class="os-btn" data-csv="classes" style="margin-left:auto">Export CSV</button></div>'+
      '<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["Ref","Name","Session","Date","Status"],clsRows)+'</div>');
  }

  function aEnquiries(){
    var opts=[["all","All"],["New","New"],["Replied","Replied"]];
    var list=fEnq==="all"?DB.enquiries:DB.enquiries.filter(function(e){return e.status===fEnq;});
    var cards=list.map(function(a){return '<div class="d-enq"><header><div><h4>'+esc(a.name)+'</h4><div class="meta">'+esc(a.email)+' · '+esc(a.id)+' · '+esc(a.received)+'</div></div>'+pill(a.status)+'</header><div class="tags"><span class="tag">'+esc(a.topic)+'</span></div><p class="msg">'+esc(a.message)+'</p><div class="acts"><button data-enq="'+esc(a.id)+'">'+(a.status==="New"?"Mark replied":"Reopen")+'</button><a href="mailto:'+esc(a.email)+'?subject=4orth%20Space%20—%20your%20enquiry">Reply by email</a></div></div>';}).join("");
    $("#dv-enquiries").innerHTML='<div class="os-actions">'+opts.map(function(o){return '<button class="d-chip'+(fEnq===o[0]?" on":"")+'" data-fen="'+o[0]+'">'+o[1]+'</button>';}).join("")+'<button class="os-btn" data-csv="enquiries" style="margin-left:auto">Export CSV</button></div>'+(cards||'<div class="d-empty">No enquiries in this view.</div>');
  }

  function aMembers(){
    var sub='<div class="os-actions"><button class="d-chip'+(membersSub==="members"?" on":"")+'" data-sub="members">Members (CRM)</button><button class="d-chip'+(membersSub==="founding"?" on":"")+'" data-sub="founding">Founding 40 <span style="color:var(--brass)">'+DB.applications.length+'</span></button>'+(membersSub==="members"?'<button class="os-btn" data-csv="clients" style="margin-left:auto">Export CSV</button>':'')+'</div>';
    if(membersSub==="members"){
      var rows=DB.clients.map(function(c){return '<tr><td class="d-ref">'+esc(c.id)+'</td><td><div>'+esc(c.name)+'</div><div style="font-family:var(--f-mono);font-size:.7rem;color:var(--muted)">'+esc(c.email)+'</div></td><td>'+pill(c.tier)+'</td><td>'+c.points.toLocaleString()+' <span style="color:var(--muted);font-family:var(--f-mono);font-size:.7rem">('+NGN(c.points*POINT_VALUE)+')</span></td><td style="color:var(--muted)">'+esc(staffName(c.repId))+'</td><td><button class="os-btn" data-redeem="'+esc(c.id)+'">Pay with points</button></td></tr>';});
      $("#dv-members").innerHTML=sub+'<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["ID","Member","Tier","Points","Relationship mgr","Loyalty"],rows)+'</div>';
    } else {
      var target=DB.meta.foundingTarget||40, filled=foundingClaimed(), apps=DB.applications;
      var nNew=apps.filter(function(a){return a.status==="New";}).length;
      var nRev=apps.filter(function(a){return a.status==="Reviewed";}).length;
      var withVisit=apps.filter(function(a){return a.visitDate;}).length;
      var byDays={}; apps.forEach(function(a){var k=a.days||"—";byDays[k]=(byDays[k]||0)+1;});
      var byStart={}; apps.forEach(function(a){var k=a.start||"—";byStart[k]=(byStart[k]||0)+1;});
      var daysOrder=["1–2 days","3–4 days","Most days","Not sure yet"];
      var startOrder=["As soon as you open","Within two weeks","Within a month","Just exploring"];
      var maxD=Math.max.apply(null,daysOrder.map(function(d){return byDays[d]||0;}))||1;
      var maxS=Math.max.apply(null,startOrder.map(function(d){return byStart[d]||0;}))||1;
      var kpis=[[apps.length,"Applications","total received"],["<span>"+filled+"</span> / "+target,"Charter seats",Math.max(target-filled,0)+" open"],[nNew,"Awaiting review",nRev+" reviewed"],[withVisit,"Visits booked","first-visit times"]];
      var kpiHtml='<div class="d-kpis">'+kpis.map(function(k){return '<div class="d-kpi"><b>'+k[0]+'</b><div class="lab">'+k[1]+'</div><em>'+k[2]+'</em></div>';}).join("")+'</div>';
      var bars='<div class="d-split"><div class="d-panel"><h3>Preferred days a week</h3><div class="ph">How often applicants plan to come</div><div class="d-bars">'+
        daysOrder.map(function(d){return '<div class="d-bar-row"><span>'+d+'</span><span class="d-track"><span class="d-fill" style="width:'+((byDays[d]||0)/maxD*100)+'%"></span></span><span class="val">'+(byDays[d]||0)+'</span></div>';}).join("")+'</div></div>'+
        '<div class="d-panel"><h3>When they want to start</h3><div class="ph">Start-timing preference</div><div class="d-bars">'+
        startOrder.map(function(d){return '<div class="d-bar-row"><span>'+d+'</span><span class="d-track"><span class="d-fill" style="width:'+((byStart[d]||0)/maxS*100)+'%"></span></span><span class="val">'+(byStart[d]||0)+'</span></div>';}).join("")+'</div></div></div>';
      var cards=apps.map(function(a){return '<div class="d-appcard"><header><div><h4>'+esc(a.name)+' <span style="font-family:var(--f-mono);font-size:.8rem;color:var(--brass)">· '+esc(a.memberId||("seat #"+(a.seat||"—")))+'</span></h4><div class="meta">'+esc(a.email)+' · '+esc(a.phone||"—")+' · seat #'+esc(a.seat||"—")+' · '+esc(a.received)+(a.picsPolicy?' · <span style="color:var(--d-ok)">photo policy ✓</span>':'')+'</div></div>'+pill(a.status)+'</header><div class="tags"><span class="tag">'+esc(a.work)+'</span><span class="tag">'+esc(a.days)+'</span><span class="tag">'+esc(a.start)+'</span>'+(a.visitDate?'<span class="tag" style="color:var(--brass)">visit '+esc(a.visitDate)+' '+esc(a.visitTime||"")+'</span>':'')+'</div><p class="msg">'+esc(a.why)+'</p><div class="acts"><button class="os-btn brass" data-appapprove="'+esc(a.id)+'">Approve visit</button><button class="os-btn" data-appreject="'+esc(a.id)+'">Reject</button><a href="mailto:'+esc(a.email)+'?subject=4orth%20Founding%2040">Reply by email</a></div></div>';}).join("");
      $("#dv-members").innerHTML=sub+kpiHtml+'<div class="d-appbar"><div><div class="lab">Charter seats filled</div><div class="big"><span>'+filled+'</span> / '+target+'</div></div><div class="track"><i style="width:'+(filled/target*100)+'%"></i></div><div><div class="lab">Open</div><div class="big">'+Math.max(target-filled,0)+'</div></div></div><div class="os-actions"><button class="os-btn" data-csv="applications">Export applicants CSV</button></div>'+bars+(cards||'<div class="d-empty">No applications yet.</div>');
    }
  }

  function aTasks(){
    var opts=[["all","All"],["overdue","Overdue"],["To do","To do"],["In progress","In progress"],["Done","Done"]];
    var list=DB.tasks.filter(function(t){return fTasks==="all"?true:fTasks==="overdue"?overdue(t):t.status===fTasks;});
    var rows=list.map(function(t){
      var nxt={ "To do":"In progress","In progress":"Done","Done":"To do"}[t.status];
      return '<tr><td>'+esc(t.title)+(overdue(t)?' <span style="color:#e0a06b;font-family:var(--f-mono);font-size:.64rem">OVERDUE</span>':'')+'</td><td style="color:var(--muted)">'+esc(staffName(t.owner))+'</td><td style="color:var(--muted);white-space:nowrap">'+esc(t.due)+'</td><td>'+esc(t.priority)+'</td><td>'+pill(t.status)+'</td><td style="white-space:nowrap"><button class="os-btn" data-tadv="'+t.id+'" data-next="'+nxt+'">→ '+nxt+'</button> <button class="os-btn" data-trem="'+t.id+'">Remind</button></td></tr>';
    });
    var addf='<form class="os-form" id="taskAdd"><div class="full" style="font-family:var(--f-mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Assign a task</div><div><label>Title</label><input id="tkTitle" required></div><div><label>Owner</label><select id="tkOwner">'+DB.staff.map(function(s){return '<option value="'+s.id+'">'+esc(s.name)+'</option>';}).join("")+'</select></div><div><label>Due date</label><input type="date" id="tkDue" value="'+todayISO+'"></div><div><label>Priority</label><select id="tkPri"><option>High</option><option selected>Medium</option><option>Low</option></select></div><div class="full"><button class="os-btn brass" type="submit">Add task</button></div></form>';
    return '<div class="os-actions">'+opts.map(function(o){return '<button class="d-chip'+(fTasks===o[0]?" on":"")+'" data-ftk="'+esc(o[0])+'">'+o[1]+'</button>';}).join("")+'<button class="os-btn" data-csv="tasks" style="margin-left:auto">Export CSV</button></div><div class="d-panel" style="padding:24px 24px 12px">'+tbl(["Task","Owner","Due","Priority","Status","Actions"],rows)+'</div><div class="d-panel">'+addf+'</div>';
  }

  /* ================= HR DEPARTMENT ================= */
  function payeMonthly(gm){
    var ann=(gm||0)*12, pension=0.08*ann, cra=Math.max(200000,0.01*ann)+0.20*ann, taxable=Math.max(0,ann-cra-pension);
    var bands=[[300000,.07],[300000,.11],[500000,.15],[500000,.19],[1600000,.21],[Infinity,.24]], tax=0, rem=taxable;
    for(var i=0;i<bands.length;i++){ var amt=Math.min(rem,bands[i][0]); if(amt<=0)break; tax+=amt*bands[i][1]; rem-=amt; }
    return {paye:Math.round(tax/12), pension:Math.round(pension/12)};
  }
  function hm(ts){ try{return new Date(ts).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});}catch(e){return "—";} }
  function orgTree(){
    var roots=DB.staff.filter(function(s){return !s.reportsTo||!DB.staff.some(function(x){return x.id===s.reportsTo;});});
    function node(s){ var reports=DB.staff.filter(function(x){return x.reportsTo===s.id;}); return '<li><div class="org-card"><b>'+esc(s.name)+'</b><span>'+esc(s.role)+'</span></div>'+(reports.length?'<ul>'+reports.map(node).join("")+'</ul>':'')+'</li>'; }
    return '<ul class="org-tree">'+roots.map(node).join("")+'</ul>';
  }
  function hrPeople(){
    var cards=DB.staff.map(function(s){
      var opts=DB.staff.filter(function(x){return x.id!==s.id;}).map(function(x){return '<option value="'+x.id+'"'+(s.reportsTo===x.id?" selected":"")+'>'+esc(x.name)+'</option>';}).join("");
      var train=(s.training||[]).map(function(t,i){return '<li><span>'+esc(t.name)+' <span style="color:var(--muted);font-family:var(--f-mono);font-size:.66rem">· '+esc(t.date)+' · '+esc(t.status)+'</span></span><button class="todo-del" data-trainrm="'+s.id+'|'+i+'" title="Remove">✕</button></li>';}).join("");
      return '<div class="d-panel"><h4 style="font-family:var(--f-disp);margin:0 0 6px">'+esc(s.name)+' <span style="font-family:var(--f-mono);font-size:.7rem;color:var(--muted)">· '+esc(s.id)+' · PIN '+esc(s.pin||"0000")+'</span></h4>'
        +'<form class="os-form" data-staffform="'+s.id+'">'
        +'<div><label>Name</label><input data-f="name" value="'+esc(s.name)+'"></div>'
        +'<div><label>Role</label><input data-f="role" value="'+esc(s.role)+'"></div>'
        +'<div><label>Department</label><input data-f="dept" value="'+esc(s.dept)+'"></div>'
        +'<div><label>Email</label><input data-f="email" value="'+esc(s.email||"")+'"></div>'
        +'<div><label>Monthly salary (₦)</label><input type="number" data-f="salary" value="'+(s.salary||0)+'"></div>'
        +'<div><label>Reports to</label><select data-reportsto="'+s.id+'"><option value="">— None —</option>'+opts+'</select></div>'
        +'<div class="full"><button class="os-btn brass" type="submit">Save profile</button></div></form>'
        +'<div class="hr-train"><div class="ph">Training records</div><ul class="todo-list">'+(train||'<li><span style="color:var(--muted)">None logged.</span></li>')+'</ul><form class="todo-add" data-trainadd="'+s.id+'"><input placeholder="Course / certification" data-tn maxlength="60" autocomplete="off"><input type="date" data-td style="flex:none;width:auto"><button class="os-btn" type="submit">Add</button></form></div></div>';
    }).join("");
    return '<div class="d-panel"><h3>Organogram</h3><div class="ph">Reporting lines, drawn from "Reports to"</div>'+orgTree()+'</div><div class="hr-cards">'+cards+'</div>';
  }
  function hrAttendance(){
    var since=iso(-30);
    var recent=DB.attendance.filter(function(a){return a.date>=since;}).slice().sort(function(a,b){return (b.inAt||0)-(a.inAt||0);});
    var totals=DB.staff.map(function(s){ var recs=DB.attendance.filter(function(a){return a.staffId===s.id&&a.date>=since;}); return {s:s,hrs:recs.reduce(function(x,a){return x+(a.hours||0);},0),days:recs.filter(function(a){return a.outAt;}).length,onNow:DB.attendance.some(function(a){return a.staffId===s.id&&!a.outAt;})}; });
    var trows=totals.map(function(t){return '<tr><td>'+esc(t.s.name)+'</td><td>'+(t.onNow?'<span class="d-status new"><i></i>On the clock</span>':'<span style="color:var(--muted)">Off</span>')+'</td><td>'+t.days+'</td><td>'+t.hrs.toFixed(1)+'h</td></tr>';});
    var hrows=recent.map(function(a){return '<tr><td style="color:var(--muted)">'+esc(a.date)+'</td><td>'+esc(staffName(a.staffId))+'</td><td>'+(a.inAt?hm(a.inAt):"—")+'</td><td>'+(a.outAt?hm(a.outAt):'<span style="color:var(--brass)">open</span>')+'</td><td>'+(a.hours?a.hours.toFixed(1)+'h':"—")+'</td></tr>';});
    return '<div class="d-panel" style="padding:24px 24px 12px"><h3>Last 30 days by person</h3>'+tbl(["Staff","Now","Days","Hours"],trows)+'</div><div class="d-panel" style="padding:24px 24px 12px"><h3>Attendance log</h3>'+tbl(["Date","Staff","In","Out","Hours"],hrows)+'</div>';
  }
  function hrReports(){
    var reps=DB.dailyReports.slice().sort(function(a,b){return b.at-a.at;});
    var cards=reps.map(function(r){
      var replies=(r.replies||[]).map(function(x){return '<li><time>'+esc(staffName(x.by))+'</time><span>'+esc(x.text)+'</span></li>';}).join("");
      return '<div class="d-panel"><h4 style="font-family:var(--f-disp);margin:0">'+esc(staffName(r.staffId))+' <span style="color:var(--muted);font-family:var(--f-mono);font-size:.72rem">· '+esc(r.date)+' · '+(r.hours||0)+'h</span></h4><div class="hr-rep"><b>Done today</b><p>'+esc(r.done||"—")+'</p><b>Tomorrow</b><p>'+esc(r.tomorrow||"—")+'</p><b>Blockers</b><p>'+esc(r.blockers||"—")+'</p></div>'+(replies?'<ul class="d-feed" style="margin-top:8px">'+replies+'</ul>':'')+'<form class="os-form" data-repreply="'+r.id+'"><div class="full"><textarea rows="2" placeholder="Reply to '+esc(staffName(r.staffId).split(" ")[0])+'…" required></textarea></div><div class="full"><button class="os-btn brass" type="submit">Send reply</button></div></form></div>';
    }).join("");
    return cards||'<div class="d-empty">No daily reports submitted yet.</div>';
  }
  function hrQueries(){
    var issue='<div class="d-panel"><h3>Issue a query</h3><form class="os-form" id="queryAdd"><div><label>To</label><select id="qStaff">'+DB.staff.map(function(s){return '<option value="'+s.id+'">'+esc(s.name)+'</option>';}).join("")+'</select></div><div><label>Deadline</label><input type="date" id="qDeadline" value="'+iso(3)+'"></div><div class="full"><label>Subject</label><input id="qSubject" required></div><div class="full"><label>Details</label><textarea id="qBody" rows="2" required></textarea></div><div class="full"><button class="os-btn brass" type="submit">Issue query</button></div></form></div>';
    var list=DB.queries.slice().sort(function(a,b){return b.at-a.at;}).map(function(q){
      var replies=(q.replies||[]).map(function(x){return '<li><time>'+esc(staffName(x.by))+'</time><span>'+esc(x.text)+'</span></li>';}).join("");
      return '<div class="d-panel"><header class="d-enq" style="border:0;padding:0"><div><h4>'+esc(q.subject)+'</h4><div class="meta">To '+esc(staffName(q.staffId))+' · due '+esc(fmt(q.deadline))+'</div></div>'+pill(q.status)+'</header><p style="color:var(--muted);font-weight:300;margin:8px 0">'+esc(q.body)+'</p>'+(replies?'<ul class="d-feed">'+replies+'</ul>':'')+'<div class="os-actions"><button class="os-btn" data-qclose="'+q.id+'">'+(q.status==="Closed"?"Reopen":"Close")+'</button><button class="os-btn" data-qremind="'+q.id+'">Send reminder</button></div></div>';
    }).join("");
    return issue+(list||'<div class="d-empty">No queries issued.</div>');
  }
  function newPayrollRun(period){
    var lines=DB.staff.map(function(s){ var g=s.salary||0, r=payeMonthly(g); return {staffId:s.id,gross:g,paye:r.paye,pension:r.pension,net:g-r.paye-r.pension}; });
    DB.payrollRuns.push({id:rid("PR-"),period:period,status:"Draft",lines:lines,createdAt:Date.now(),paidAt:null}); save();
  }
  function hrPayroll(){
    var cur=DB.payrollRuns.filter(function(r){return r.status!=="Paid";}).slice(-1)[0];
    var history=DB.payrollRuns.filter(function(r){return r.status==="Paid";}).slice().reverse();
    var head='<div class="d-panel"><h3>Payroll run</h3>';
    if(!cur){
      head+='<div class="ph">No open run. Create one to calculate PAYE, pension and net pay.</div><form class="os-form" id="payrollNew"><div><label>Period</label><input id="payPeriod" value="'+new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})+'"></div><div class="full"><button class="os-btn brass" type="submit">Create draft run</button></div></form>';
    } else {
      var rows=cur.lines.map(function(l){return '<tr><td>'+esc(staffName(l.staffId))+'</td><td>'+NGN(l.gross)+'</td><td style="color:var(--muted)">'+NGN(l.paye)+'</td><td style="color:var(--muted)">'+NGN(l.pension)+'</td><td><b>'+NGN(l.net)+'</b></td></tr>';});
      var tot=cur.lines.reduce(function(a,l){return {g:a.g+l.gross,p:a.p+l.paye,pe:a.pe+l.pension,n:a.n+l.net};},{g:0,p:0,pe:0,n:0});
      rows.push('<tr style="border-top:1px solid var(--brass)"><td><b>Total</b></td><td><b>'+NGN(tot.g)+'</b></td><td>'+NGN(tot.p)+'</td><td>'+NGN(tot.pe)+'</td><td><b>'+NGN(tot.n)+'</b></td></tr>');
      var actions='<div class="os-actions" style="margin-top:14px">';
      if(cur.status==="Draft") actions+='<button class="os-btn brass" data-payapprove="'+cur.id+'">Approve run</button>';
      if(cur.status==="Approved") actions+='<button class="os-btn brass" data-paypay="'+cur.id+'">Mark as paid (locks)</button>';
      actions+='<button class="os-btn" data-paydelete="'+cur.id+'">Discard draft</button></div>';
      head+='<div class="ph">'+esc(cur.period)+' · '+pill(cur.status)+' · PAYE and 8% pension applied</div>'+tbl(["Staff","Gross","PAYE","Pension","Net"],rows)+actions;
    }
    head+='</div>';
    var hist=history.map(function(r){ var tot=r.lines.reduce(function(a,l){return a+l.net;},0); return '<tr><td>'+esc(r.period)+'</td><td>'+pill(r.status)+'</td><td>'+r.lines.length+'</td><td>'+NGN(tot)+'</td><td style="color:var(--muted)">'+(r.paidAt?fmt(r.paidAt):"—")+'</td></tr>'; });
    return head+'<div class="d-panel" style="padding:24px 24px 12px"><h3>Payroll history</h3>'+tbl(["Period","Status","Staff","Net paid","Paid on"],hist)+'</div>';
  }
  function aHR(){
    var subs=[["people","People & org"],["attendance","Attendance"],["reports","Daily reports"],["queries","Queries"],["payroll","Payroll"]];
    var bar='<div class="os-actions">'+subs.map(function(s){return '<button class="d-chip'+(hrSub===s[0]?" on":"")+'" data-hrsub="'+s[0]+'">'+s[1]+'</button>';}).join("")+'</div>';
    $("#dv-hr").innerHTML=bar+({people:hrPeople,attendance:hrAttendance,reports:hrReports,queries:hrQueries,payroll:hrPayroll}[hrSub])();
  }
  /* HR events */
  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-hrsub],[data-reportsto],[data-trainrm],[data-qclose],[data-qremind],[data-payapprove],[data-paypay],[data-paydelete]");
    if(!el)return;
    if(el.dataset.hrsub){ hrSub=el.dataset.hrsub; aHR(); return; }
    if(el.dataset.trainrm){ var p=el.dataset.trainrm.split("|"), st=DB.staff.filter(function(x){return x.id===p[0];})[0]; if(st&&st.training){ st.training.splice(parseInt(p[1],10),1); save(); aHR(); } return; }
    if(el.dataset.qclose){ var q=DB.queries.filter(function(x){return x.id===el.dataset.qclose;})[0]; if(q){ q.status=q.status==="Closed"?"Open":"Closed"; save(); aHR(); } return; }
    if(el.dataset.qremind){ var q2=DB.queries.filter(function(x){return x.id===el.dataset.qremind;})[0]; if(q2){ DB.reminders.unshift({id:rid("RM-"),staffId:q2.staffId,message:"Reminder about your query: "+q2.subject,by:"S1",at:Date.now(),read:false}); mail(staffName(q2.staffId),"Reminder: "+q2.subject,"Please action your assigned query."); el.textContent="Reminded ✓"; el.disabled=true; save(); } return; }
    if(el.dataset.payapprove){ var r=DB.payrollRuns.filter(function(x){return x.id===el.dataset.payapprove;})[0]; if(r&&r.status==="Draft"){ r.status="Approved"; save(); aHR(); } return; }
    if(el.dataset.paypay){ var r2=DB.payrollRuns.filter(function(x){return x.id===el.dataset.paypay;})[0]; if(r2&&r2.status==="Approved"&&confirm("Mark this run as paid? It locks and cannot be edited.")){ r2.status="Paid"; r2.paidAt=Date.now(); audit("Payroll "+r2.period+" marked paid"); save(); aHR(); } return; }
    if(el.dataset.paydelete){ var id=el.dataset.paydelete; if(confirm("Discard this draft run?")){ DB.payrollRuns=DB.payrollRuns.filter(function(x){return x.id!==id;}); save(); aHR(); } return; }
  });
  $("#dashApp").addEventListener("change",function(e){
    var sel=e.target.closest("[data-reportsto]"); if(sel){ var s=DB.staff.filter(function(x){return x.id===sel.dataset.reportsto;})[0]; if(s){ s.reportsTo=sel.value; save(); aHR(); } }
  });
  $("#dashApp").addEventListener("submit",function(e){
    if(e.target.dataset && e.target.dataset.staffform){ e.preventDefault(); var s=DB.staff.filter(function(x){return x.id===e.target.dataset.staffform;})[0]; if(s){ ["name","role","dept","email"].forEach(function(f){var inp=e.target.querySelector('[data-f="'+f+'"]');if(inp)s[f]=inp.value.trim();}); var sal=e.target.querySelector('[data-f="salary"]'); if(sal)s.salary=parseInt(sal.value,10)||0; save(); aHR(); } return; }
    if(e.target.id==="queryAdd"){ e.preventDefault(); var subj=$("#qSubject").value.trim(), body=$("#qBody").value.trim(); if(subj&&body){ var sid=$("#qStaff").value; DB.queries.unshift({id:rid("Q-"),staffId:sid,subject:subj,body:body,deadline:$("#qDeadline").value,issuedBy:"S1",status:"Open",at:Date.now(),replies:[]}); DB.reminders.unshift({id:rid("RM-"),staffId:sid,message:"New query from your manager: "+subj,by:"S1",at:Date.now(),read:false}); save(); aHR(); } return; }
    if(e.target.id==="payrollNew"){ e.preventDefault(); newPayrollRun($("#payPeriod").value||"This month"); aHR(); return; }
    var rp=e.target.closest("[data-repreply]"); if(rp){ e.preventDefault(); var r=DB.dailyReports.filter(function(x){return x.id===rp.dataset.repreply;})[0]; var ta=rp.querySelector("textarea"); if(r&&ta&&ta.value.trim()){ r.replies=r.replies||[]; r.replies.push({by:"S1",text:ta.value.trim(),at:Date.now()}); save(); aHR(); } return; }
    var tr=e.target.closest("[data-trainadd]"); if(tr){ e.preventDefault(); var st=DB.staff.filter(function(x){return x.id===tr.dataset.trainadd;})[0]; var nm=tr.querySelector("[data-tn]"), dt=tr.querySelector("[data-td]"); if(st&&nm&&nm.value.trim()){ st.training=st.training||[]; st.training.push({name:nm.value.trim(),date:(dt&&dt.value)?dt.value:todayISO,status:"Complete"}); save(); aHR(); } return; }
  });

  /* ================= EXECUTIVE ================= */
  function weekToken(d){ d=new Date(d||Date.now()); var dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); var day=dt.getUTCDay()||7; dt.setUTCDate(dt.getUTCDate()+4-day); var ys=new Date(Date.UTC(dt.getUTCFullYear(),0,1)); var wk=Math.ceil((((dt-ys)/86400000)+1)/7); return dt.getUTCFullYear()+"-W"+("0"+wk).slice(-2); }
  function monthToken(d){ d=new Date(d||Date.now()); return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2); }
  function quarterToken(d){ d=new Date(d||Date.now()); return d.getFullYear()+"-Q"+(Math.floor(d.getMonth()/3)+1); }
  function periodToken(cad){ return cad==="daily"?todayISO:cad==="weekly"?weekToken():cad==="monthly"?monthToken():quarterToken(); }
  function checklistDefs(){
    return {
      daily:[
        {id:"d-enq",label:"Review new enquiries",fig:function(){return DB.enquiries.filter(function(x){return x.status==="New";}).length;},tab:"enquiries"},
        {id:"d-bk",label:"Check today's bookings",fig:function(){return DB.bookings.filter(function(b){return b.date===todayISO;}).length;},tab:"bookings"},
        {id:"d-rep",label:"Collect daily reports",fig:function(){return DB.dailyReports.filter(function(r){return r.date===todayISO;}).length+"/"+DB.staff.length;},tab:"hr"},
        {id:"d-task",label:"Clear overdue tasks",fig:function(){return DB.tasks.filter(overdue).length;},tab:"tasks"}
      ],
      weekly:[
        {id:"w-f40",label:"Review Founding 40 applicants",fig:function(){return DB.applications.filter(function(a){return a.status==="New";}).length;},tab:"members"},
        {id:"w-rev",label:"Reconcile week's bookings",fig:function(){return DB.bookings.length;},tab:"bookings"},
        {id:"w-q",label:"Clear open staff queries",fig:function(){return DB.queries.filter(function(q){return q.status!=="Closed";}).length;},tab:"hr"}
      ],
      monthly:[
        {id:"m-pay",label:"Run payroll",fig:function(){return DB.payrollRuns.some(function(r){return r.status==="Paid"&&r.paidAt&&monthToken(r.paidAt)===monthToken();})?"done":"due";},tab:"hr"},
        {id:"m-inv",label:"Chase due invoices",fig:function(){return DB.invoices.filter(function(i){return i.status==="Due";}).length;},tab:"members"},
        {id:"m-rep",label:"Publish monthly report",fig:function(){return DB.reports.filter(function(r){return r.type==="monthly"&&r.period===monthToken();}).length?"done":"due";},tab:"overview"}
      ],
      quarterly:[
        {id:"q-occ",label:"Occupancy & revenue review",fig:function(){return occupancy()+"%";},tab:"spaces"},
        {id:"q-strat",label:"Strategy & pricing review",fig:function(){return "";},tab:"overview"}
      ]
    };
  }
  function execChecklist(){
    var defs=checklistDefs(), cad=[["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"],["quarterly","Quarterly"]];
    return '<div class="d-panel"><h3>Operating checklist</h3><div class="ph">Each column resets on its own cycle · figures are live</div><div class="chk-cols">'+cad.map(function(c){
      var tok=periodToken(c[0]);
      var items=defs[c[0]].map(function(it){
        var done=DB.checklist[it.id]===tok, fig=it.fig();
        fig=(fig===""||fig==null)?"":'<span class="chk-fig">'+esc(String(fig))+'</span>';
        return '<li class="'+(done?"done":"")+'"><input type="checkbox" class="todo-chk" data-chk="'+it.id+'" data-cad="'+c[0]+'"'+(done?" checked":"")+'><span>'+esc(it.label)+'</span>'+fig+'<button class="chk-open" data-gotab="'+it.tab+'">Open →</button></li>';
      }).join("");
      return '<div class="chk-col"><h4>'+c[1]+'</h4><ul class="chk-list">'+items+'</ul></div>';
    }).join("")+'</div></div>';
  }
  function reportBanner(){
    if(new Date().getHours()<15) return "";
    var missing=DB.staff.filter(function(s){return !DB.dailyReports.some(function(r){return r.staffId===s.id&&r.date===todayISO;});});
    if(!missing.length) return "";
    return '<div class="os-alert amber"><div><b>'+missing.length+' daily report'+(missing.length>1?"s":"")+' not submitted</b> after 3pm — '+esc(missing.map(function(s){return s.name;}).join(", "))+'</div><button class="os-btn" data-remindreports="1">Remind all</button></div>';
  }
  function execNotesPanel(){
    var wk=weekToken(), val=(DB.execNotes&&DB.execNotes[wk])||"";
    return '<div class="d-panel"><h3>This week\'s notes</h3><div class="ph">Week '+wk+'</div><textarea id="execNotes" rows="6" style="width:100%;resize:vertical" placeholder="Priorities, decisions, things to carry forward…">'+esc(val)+'</textarea><div style="margin-top:8px"><button class="os-btn" id="execNotesSave">Save notes</button> <span id="execNotesSaved" style="color:var(--brass);font-family:var(--f-mono);font-size:.72rem;display:none">Saved ✓</span></div></div>';
  }
  function genReport(type){
    var period=type==="weekly"?weekToken():monthToken(), since=type==="weekly"?iso(-7):iso(-30);
    var bk=DB.bookings.filter(function(b){return b.date>=since;}).length;
    var rev=DB.invoices.filter(function(i){return i.status==="Paid";}).reduce(function(a,b){return a+b.amount;},0);
    var hrs=DB.attendance.filter(function(a){return a.date>=since;}).reduce(function(a,b){return a+(b.hours||0);},0);
    var body="4orth Space — "+type+" report ("+period+")\nGenerated "+new Date().toLocaleString("en-GB")+"\n\n"
      +"Bookings ("+(type==="weekly"?"7d":"30d")+"): "+bk+"\n"
      +"Revenue (paid invoices): "+NGN(rev)+"\n"
      +"Members on file: "+DB.clients.length+"\n"
      +"Open enquiries: "+DB.enquiries.filter(function(x){return x.status==="New";}).length+" of "+DB.enquiries.length+"\n"
      +"Founding 40 applications: "+DB.applications.length+"\n"
      +"Tasks completed: "+DB.tasks.filter(function(t){return t.status==="Done";}).length+" of "+DB.tasks.length+"\n"
      +"Staff hours logged: "+hrs.toFixed(1)+"\n"
      +"Occupancy: "+occupancy()+"%\n";
    var rec={id:rid("RPT-"),type:type,period:period,body:body,at:Date.now(),to:"leadership@4orthspace.com"};
    DB.reports.unshift(rec); mail(rec.to,"4orth "+type+" report — "+period,body); save();
  }
  function execReportsPanel(){
    var log=DB.reports.slice(0,8).map(function(r){return '<tr><td>'+esc(r.type)+'</td><td>'+esc(r.period)+'</td><td style="color:var(--muted)">'+esc(fmt(r.at))+'</td><td style="color:var(--muted)">'+esc(r.to)+'</td><td><button class="os-btn" data-rptview="'+r.id+'">Download</button></td></tr>';});
    return '<div class="d-panel"><h3>Reports</h3><div class="ph">Auto-compiled from live data, emailed to leadership, logged below</div><div class="os-actions"><button class="os-btn brass" data-genreport="weekly">Generate weekly</button><button class="os-btn brass" data-genreport="monthly">Generate monthly</button></div><div style="margin-top:14px">'+tbl(["Type","Period","Generated","Emailed to","File"],log)+'</div></div>';
  }
  /* Executive events */
  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-chk],[data-remindreports],[data-genreport],[data-rptview],#execNotesSave");
    if(!el)return;
    if(el.id==="execNotesSave"){ if(!DB.execNotes)DB.execNotes={}; DB.execNotes[weekToken()]=$("#execNotes").value; save(); var sv=$("#execNotesSaved"); if(sv){sv.style.display="inline";setTimeout(function(){sv.style.display="none";},1500);} return; }
    if(el.dataset.chk){ if(!DB.checklist)DB.checklist={}; var tok=periodToken(el.dataset.cad); if(DB.checklist[el.dataset.chk]===tok) delete DB.checklist[el.dataset.chk]; else DB.checklist[el.dataset.chk]=tok; save(); aOverview(); return; }
    if(el.dataset.remindreports){ DB.staff.filter(function(s){return !DB.dailyReports.some(function(r){return r.staffId===s.id&&r.date===todayISO;});}).forEach(function(s){ DB.reminders.unshift({id:rid("RM-"),staffId:s.id,message:"Please submit today's daily report before end of day.",by:"S1",at:Date.now(),read:false}); mail(s.email||s.name,"Daily report reminder","Please submit today's daily report."); }); save(); el.textContent="Reminders sent ✓"; el.disabled=true; return; }
    if(el.dataset.genreport){ genReport(el.dataset.genreport); aOverview(); return; }
    if(el.dataset.rptview){ var r=DB.reports.filter(function(x){return x.id===el.dataset.rptview;})[0]; if(r) download("4orth-"+r.type+"-"+r.period+".txt",r.body); return; }
  });

  /* ================= CLIENTS DEPARTMENT ================= */
  function aClients(){
    var subs=[["crm","Clients"],["founding","Founding 40"],["enquiries","Enquiries"],["relations","Relations"]];
    var bar='<div class="os-actions">'+subs.map(function(s){var cnt=s[0]==="enquiries"?DB.enquiries.filter(function(e){return e.status==="New";}).length:s[0]==="founding"?DB.applications.length:0;return '<button class="d-chip'+(clientsSub===s[0]?" on":"")+'" data-clsub="'+s[0]+'">'+s[1]+(cnt?' <span style="color:var(--brass)">'+cnt+'</span>':'')+'</button>';}).join("")+'</div>';
    $("#dv-clients").innerHTML=bar+({crm:clientsCRM,founding:clientsFounding,enquiries:clientsEnquiries,relations:clientsRelations}[clientsSub])();
  }
  function clientsCRM(){
    if(clientsSel){ var cc=DB.clients.filter(function(x){return x.id===clientsSel;})[0]; if(cc) return clientProfile(cc); clientsSel=null; }
    var rows=DB.clients.map(function(c){return '<tr><td class="d-ref">'+esc(c.id)+'</td><td><div>'+esc(c.name)+'</div><div style="font-family:var(--f-mono);font-size:.7rem;color:var(--muted)">'+esc(c.email)+'</div></td><td>'+pill(c.tier)+'</td><td>'+c.points.toLocaleString()+'</td><td style="color:var(--muted)">'+esc(staffName(c.repId))+'</td><td><button class="os-btn" data-cprofile="'+esc(c.id)+'">View profile</button></td></tr>';});
    return '<div class="os-actions"><button class="os-btn" data-csv="clients" style="margin-left:auto">Export CSV</button></div><div class="d-panel" style="padding:24px 24px 12px">'+tbl(["ID","Client","Tier","Points","Relationship mgr","Profile"],rows)+'</div>';
  }
  function clientProfile(c){
    var bk=DB.bookings.filter(function(b){return b.member===c.name||b.email===c.email;});
    var inv=DB.invoices.filter(function(i){return i.clientId===c.id;});
    var out=DB.outreach.filter(function(o){return o.clientId===c.id;});
    var hist=bk.map(function(b){return {t:b.date||fmt(b.at),w:"Booking — "+b.space+" ("+(b.status||"")+")"};})
      .concat(inv.map(function(i){return {t:i.date,w:"Invoice "+i.id+" — "+NGN(i.amount)+" ("+i.status+")"};}))
      .concat(out.map(function(o){return {t:fmt(o.at),w:"Outreach — "+o.type+(o.note?": "+o.note:"")};}));
    var histRows=hist.map(function(h){return '<li><time>'+esc(String(h.t))+'</time><span>'+esc(h.w)+'</span></li>';}).join("");
    var repOpts=DB.staff.map(function(s){return '<option value="'+s.id+'"'+(c.repId===s.id?" selected":"")+'>'+esc(s.name)+'</option>';}).join("");
    return '<button class="os-btn" data-cback="1" style="margin-bottom:14px">← Back to clients</button><div class="d-split"><div class="d-panel"><h3>'+esc(c.name)+' <span style="font-family:var(--f-mono);font-size:.74rem;color:var(--muted)">· '+esc(c.id)+'</span></h3><div class="hr-rep"><b>Contacts</b><p>'+esc(c.email)+' · '+esc(c.phone||"—")+'</p><b>Key dates</b><p>Member since '+esc(c.since)+' · Birthday '+esc((c.family&&c.family.birthday)||"—")+'</p><b>Preferences</b><p>'+esc(c.prefs||"—")+'</p><b>Membership</b><p>'+esc(c.tier)+' · '+c.points.toLocaleString()+' pts ('+NGN(c.points*POINT_VALUE)+')</p></div><div style="margin-top:12px"><span style="font-family:var(--f-mono);font-size:.64rem;color:var(--muted)">Relationship manager </span><select class="os-sel" data-crep="'+c.id+'">'+repOpts+'</select></div><form class="todo-add" data-outlog="'+c.id+'" style="margin-top:14px"><input placeholder="Log a call, email or note…" data-on maxlength="120" autocomplete="off"><button class="os-btn brass" type="submit">Log</button></form></div><div class="d-panel"><h3>History</h3><ul class="d-feed">'+(histRows||'<li><span style="color:var(--muted)">No history yet.</span></li>')+'</ul></div></div>';
  }
  function clientsEnquiries(){
    var opts=[["all","All"],["New","New"],["Replied","Replied"],["Converted","Converted"]];
    var list=fEnq==="all"?DB.enquiries:DB.enquiries.filter(function(e){return e.status===fEnq;});
    var sOpts=function(sel){return DB.staff.map(function(s){return '<option value="'+s.id+'"'+(sel===s.id?" selected":"")+'>'+esc(s.name)+'</option>';}).join("");};
    var cards=list.map(function(a){return '<div class="d-enq"><header><div><h4>'+esc(a.name)+'</h4><div class="meta">'+esc(a.email)+' · '+esc(a.id)+' · '+esc(a.received)+' · <span style="color:var(--brass)">'+esc(a.source||"Website")+'</span></div></div>'+pill(a.status)+'</header><div class="tags"><span class="tag">'+esc(a.topic)+'</span></div><p class="msg">'+esc(a.message)+'</p><div class="acts" style="flex-wrap:wrap;align-items:center;gap:10px"><label style="font-family:var(--f-mono);font-size:.62rem;color:var(--muted)">Owner <select class="os-sel" data-enqowner="'+esc(a.id)+'"><option value="">Unassigned</option>'+sOpts(a.owner)+'</select></label><button data-enq="'+esc(a.id)+'">'+(a.status==="New"?"Mark replied":"Reopen")+'</button>'+(a.status!=="Converted"?'<button data-convert="'+esc(a.id)+'">Convert to client →</button>':'<span style="color:var(--brass);font-family:var(--f-mono);font-size:.7rem">Converted ✓</span>')+'<a href="mailto:'+esc(a.email)+'?subject=4orth%20Space%20—%20your%20enquiry">Reply by email</a></div></div>';}).join("");
    return '<div class="os-actions">'+opts.map(function(o){return '<button class="d-chip'+(fEnq===o[0]?" on":"")+'" data-fen="'+o[0]+'">'+o[1]+'</button>';}).join("")+'<button class="os-btn" data-csv="enquiries" style="margin-left:auto">Export CSV</button></div>'+(cards||'<div class="d-empty">No enquiries in this view.</div>');
  }
  function clientsFounding(){
    var target=DB.meta.foundingTarget||40, filled=foundingClaimed(), apps=DB.applications;
    var nNew=apps.filter(function(a){return a.status==="New";}).length, nRev=apps.filter(function(a){return a.status==="Reviewed";}).length, withVisit=apps.filter(function(a){return a.visitDate;}).length;
    var byDays={}; apps.forEach(function(a){var k=a.days||"—";byDays[k]=(byDays[k]||0)+1;});
    var byStart={}; apps.forEach(function(a){var k=a.start||"—";byStart[k]=(byStart[k]||0)+1;});
    var daysOrder=["1–2 days","3–4 days","Most days","Not sure yet"], startOrder=["As soon as you open","Within two weeks","Within a month","Just exploring"];
    var maxD=Math.max.apply(null,daysOrder.map(function(d){return byDays[d]||0;}))||1, maxS=Math.max.apply(null,startOrder.map(function(d){return byStart[d]||0;}))||1;
    var kpis=[[apps.length,"Applications","total received"],["<span>"+filled+"</span> / "+target,"Charter seats",Math.max(target-filled,0)+" open"],[nNew,"Awaiting review",nRev+" reviewed"],[withVisit,"Visits booked","first-visit times"]];
    var kpiHtml='<div class="d-kpis">'+kpis.map(function(k){return '<div class="d-kpi"><b>'+k[0]+'</b><div class="lab">'+k[1]+'</div><em>'+k[2]+'</em></div>';}).join("")+'</div>';
    var bars='<div class="d-split"><div class="d-panel"><h3>Preferred days a week</h3><div class="ph">How often applicants plan to come</div><div class="d-bars">'+daysOrder.map(function(d){return '<div class="d-bar-row"><span>'+d+'</span><span class="d-track"><span class="d-fill" style="width:'+((byDays[d]||0)/maxD*100)+'%"></span></span><span class="val">'+(byDays[d]||0)+'</span></div>';}).join("")+'</div></div><div class="d-panel"><h3>When they want to start</h3><div class="ph">Start-timing preference</div><div class="d-bars">'+startOrder.map(function(d){return '<div class="d-bar-row"><span>'+d+'</span><span class="d-track"><span class="d-fill" style="width:'+((byStart[d]||0)/maxS*100)+'%"></span></span><span class="val">'+(byStart[d]||0)+'</span></div>';}).join("")+'</div></div></div>';
    var cards=apps.map(function(a){return '<div class="d-appcard"><header><div><h4>'+esc(a.name)+' <span style="font-family:var(--f-mono);font-size:.8rem;color:var(--brass)">· '+esc(a.memberId||("seat #"+(a.seat||"—")))+'</span></h4><div class="meta">'+esc(a.email)+' · '+esc(a.phone||"—")+' · seat #'+esc(a.seat||"—")+' · '+esc(a.received)+(a.picsPolicy?' · <span style="color:var(--d-ok)">photo policy ✓</span>':'')+'</div></div>'+pill(a.status)+'</header><div class="tags"><span class="tag">'+esc(a.work)+'</span><span class="tag">'+esc(a.days)+'</span><span class="tag">'+esc(a.start)+'</span>'+(a.visitDate?'<span class="tag" style="color:var(--brass)">visit '+esc(a.visitDate)+' '+esc(a.visitTime||"")+'</span>':'')+'</div><p class="msg">'+esc(a.why)+'</p><div class="acts"><button class="os-btn brass" data-appapprove="'+esc(a.id)+'">Approve visit</button><button class="os-btn" data-appreject="'+esc(a.id)+'">Reject</button><a href="mailto:'+esc(a.email)+'?subject=4orth%20Founding%2040">Reply by email</a></div></div>';}).join("");
    return kpiHtml+'<div class="d-appbar"><div><div class="lab">Charter seats filled</div><div class="big"><span>'+filled+'</span> / '+target+'</div></div><div class="track"><i style="width:'+(filled/target*100)+'%"></i></div><div><div class="lab">Open</div><div class="big">'+Math.max(target-filled,0)+'</div></div></div><div class="os-actions"><button class="os-btn" data-csv="applications">Export applicants CSV</button></div>'+bars+(cards||'<div class="d-empty">No applications yet.</div>');
  }
  function nextBirthday(bstr){
    if(!bstr||bstr==="—")return null;
    var m=/^(\d{1,2})\s+([A-Za-z]{3})/.exec(bstr); if(!m)return null;
    var months={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}, mo=months[m[2]]; if(mo==null)return null;
    var now=new Date(), today0=new Date(now.getFullYear(),now.getMonth(),now.getDate()), d=new Date(now.getFullYear(),mo,parseInt(m[1],10));
    if(d<today0) d=new Date(now.getFullYear()+1,mo,parseInt(m[1],10));
    return d;
  }
  function clientsRelations(){
    var soon=DB.clients.map(function(c){var d=nextBirthday(c.family&&c.family.birthday);return d?{c:c,d:d,days:Math.round((d-new Date())/DAY)}:null;}).filter(function(x){return x&&x.days<=30;}).sort(function(a,b){return a.days-b.days;});
    var bdays=soon.map(function(x){return '<li><time>'+esc(x.c.family.birthday)+'</time><span>'+esc(x.c.name)+' · in '+x.days+'d <button class="chk-open" data-outreach="'+x.c.id+'|Birthday wish">Log wish</button></span></li>';}).join("");
    var renew=DB.invoices.filter(function(i){return i.status==="Due";}).map(function(i){var c=DB.clients.filter(function(x){return x.id===i.clientId;})[0];return '<li><time>'+NGN(i.amount)+'</time><span>'+esc(c?c.name:i.clientId)+' · '+esc(i.desc)+' <button class="chk-open" data-outreach="'+i.clientId+'|Renewal reminder">Log</button></span></li>';}).join("");
    var stale=DB.clients.filter(function(c){ return !DB.outreach.some(function(o){return o.clientId===c.id&&o.at>Date.now()-30*DAY;}); }).slice(0,6);
    var sug=stale.map(function(c){return '<li><time>'+esc(staffName(c.repId))+'</time><span>'+esc(c.name)+' · no contact in 30d <button class="chk-open" data-outreach="'+c.id+'|Check-in">Log check-in</button></span></li>';}).join("");
    var log=DB.outreach.slice(0,10).map(function(o){var c=DB.clients.filter(function(x){return x.id===o.clientId;})[0];return '<li><time>'+esc(fmt(o.at))+'</time><span>'+esc(c?c.name:o.clientId)+' — '+esc(o.type)+(o.note?": "+esc(o.note):"")+'</span></li>';}).join("");
    return '<div class="d-split"><div class="d-panel"><h3>Upcoming birthdays</h3><ul class="d-feed">'+(bdays||'<li><span style="color:var(--muted)">None in the next 30 days.</span></li>')+'</ul></div><div class="d-panel"><h3>Renewals due</h3><ul class="d-feed">'+(renew||'<li><span style="color:var(--muted)">No renewals due.</span></li>')+'</ul></div></div><div class="d-split"><div class="d-panel"><h3>Suggested outreach</h3><ul class="d-feed">'+(sug||'<li><span style="color:var(--muted)">All clients recently contacted.</span></li>')+'</ul></div><div class="d-panel"><h3>Outreach log</h3><ul class="d-feed">'+(log||'<li><span style="color:var(--muted)">No outreach logged yet.</span></li>')+'</ul></div></div>';
  }
  function convertEnquiry(enqId){
    var en=DB.enquiries.filter(function(x){return x.id===enqId;})[0]; if(!en)return;
    var mx=0; DB.clients.forEach(function(c){var g=/(\d+)$/.exec(c.id||"");if(g)mx=Math.max(mx,parseInt(g[1],10));});
    var c={id:"4M-"+("000"+(mx+1)).slice(-4),name:en.name,email:en.email,phone:en.phone||"",tier:"Resident",points:0,repId:en.owner||"S3",since:todayISO.slice(0,7),pin:"0000",space:"Hot desk pool",family:{partner:"—",children:"—",birthday:"—"},prefs:en.topic?("Interested in "+en.topic):"New from enquiry"};
    DB.clients.unshift(c); en.status="Converted"; en.clientId=c.id;
    DB.outreach.unshift({id:rid("OR-"),clientId:c.id,type:"Converted from enquiry",note:en.id,at:Date.now(),by:"S3"});
    mail(c.email,"Welcome to 4orth","Thanks for your interest — we've set up your member profile."); audit("Converted enquiry "+en.id+" to client "+c.id); save();
  }
  /* Clients events */
  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-clsub],[data-cprofile],[data-cback],[data-convert],[data-outreach]");
    if(!el)return;
    if(el.dataset.clsub){ clientsSub=el.dataset.clsub; clientsSel=null; aClients(); return; }
    if(el.dataset.cprofile){ clientsSel=el.dataset.cprofile; clientsSub="crm"; aClients(); return; }
    if(el.dataset.cback){ clientsSel=null; aClients(); return; }
    if(el.dataset.convert){ convertEnquiry(el.dataset.convert); renderCounts(); aClients(); return; }
    if(el.dataset.outreach){ var pr=el.dataset.outreach.split("|"); DB.outreach.unshift({id:rid("OR-"),clientId:pr[0],type:pr[1],note:"",at:Date.now(),by:"S3"}); save(); aClients(); return; }
  });
  $("#dashApp").addEventListener("change",function(e){
    var o=e.target.closest("[data-enqowner]"); if(o){ var en=DB.enquiries.filter(function(x){return x.id===o.dataset.enqowner;})[0]; if(en){en.owner=o.value;save();} return; }
    var rp=e.target.closest("[data-crep]"); if(rp){ var c=DB.clients.filter(function(x){return x.id===rp.dataset.crep;})[0]; if(c){c.repId=rp.value;save();aClients();} return; }
  });
  $("#dashApp").addEventListener("submit",function(e){
    var ol=e.target.closest("[data-outlog]"); if(ol){ e.preventDefault(); var inp=ol.querySelector("[data-on]"), c=DB.clients.filter(function(x){return x.id===ol.dataset.outlog;})[0]; if(c&&inp&&inp.value.trim()){ DB.outreach.unshift({id:rid("OR-"),clientId:c.id,type:"Note",note:inp.value.trim(),at:Date.now(),by:"S3"}); save(); aClients(); } return; }
  });

  /* ================= OPERATIONS ================= */
  function aOps(){
    var subs=[["calendar","Calendar"],["bookings","Bookings"],["spaces","Spaces"],["tasks","Tasks"]];
    var bar='<div class="os-actions">'+subs.map(function(s){return '<button class="d-chip'+(opsSub===s[0]?" on":"")+'" data-opssub="'+s[0]+'">'+s[1]+'</button>';}).join("")+'</div>';
    $("#dv-operations").innerHTML=bar+({calendar:bizCalendar,bookings:aBookings,spaces:aSpaces,tasks:aTasks}[opsSub])();
  }
  function bizCalendar(){
    var now=new Date(); if(!opsCalYM)opsCalYM={y:now.getFullYear(),m:now.getMonth()};
    var y=opsCalYM.y,mo=opsCalYM.m, first=new Date(y,mo,1), start=first.getDay(), days=new Date(y,mo+1,0).getDate();
    var monthName=first.toLocaleDateString("en-GB",{month:"long",year:"numeric"}), todayStr=new Date().toISOString().slice(0,10);
    var typeColor={Meeting:"var(--brass)",Leave:"#d39a9a",Delivery:"#8fbfa8",Booking:"#9ec5e8",Visit:"#e8cf94"};
    var byDate={}; DB.calendar.forEach(function(ev){ (byDate[ev.date]=byDate[ev.date]||[]).push(ev); });
    DB.bookings.forEach(function(b){ if(b.date){ (byDate[b.date]=byDate[b.date]||[]).push({title:(b.member||"Guest")+" · "+(b.space||"booking")+(b.status==="Requested"?" (request)":""),type:"Booking"}); } });
    DB.applications.forEach(function(a){ if(a.visitDate){ (byDate[a.visitDate]=byDate[a.visitDate]||[]).push({title:"Visit · "+a.name,type:"Visit"}); } });
    var cells="";
    for(var i=0;i<start;i++)cells+='<div class="cal-cell empty"></div>';
    for(var d=1;d<=days;d++){
      var ds=y+"-"+("0"+(mo+1)).slice(-2)+"-"+("0"+d).slice(-2), its=byDate[ds]||[];
      var tags=its.map(function(ev){return '<div class="cal-note" style="color:'+(typeColor[ev.type]||"var(--muted)")+'">'+esc(ev.title)+'</div>';}).join("");
      cells+='<div class="cal-cell'+(ds===todayStr?" today":"")+'"><div class="cal-day">'+d+'</div>'+tags+'</div>';
    }
    var dow=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(function(x){return '<div class="cal-dow">'+x+'</div>';}).join("");
    var form='<div class="d-panel"><h3>Add to calendar</h3><form class="os-form" id="calEventAdd"><div class="full"><label>What</label><input id="ceTitle" required></div><div><label>Date</label><input type="date" id="ceDate" value="'+todayISO+'"></div><div><label>Type</label><select id="ceType"><option>Meeting</option><option>Leave</option><option>Delivery</option></select></div><div class="full"><label>Who</label><input id="ceWho" placeholder="Person or team"></div><div class="full"><button class="os-btn brass" type="submit">Add</button></div></form></div>';
    var upcoming=DB.calendar.filter(function(e){return e.date>=todayStr;}).sort(function(a,b){return a.date<b.date?-1:1;}).slice(0,8).map(function(e){return '<li><time>'+esc(fmt(e.date))+'</time><span>'+esc(e.title)+' <span style="color:var(--muted)">· '+esc(e.type)+(e.who?" · "+esc(e.who):"")+'</span> <button class="chk-open" data-caldel="'+e.id+'">Remove</button></span></li>';}).join("");
    return '<div class="d-panel"><div class="cal-head"><button class="os-btn" id="opsCalPrev">‹</button><h3 style="margin:0">'+monthName+'</h3><button class="os-btn" id="opsCalNext">›</button></div><div style="font-family:var(--f-mono);font-size:.64rem;color:var(--muted);margin-bottom:10px">Meeting <span style="color:var(--brass)">●</span> · Leave <span style="color:#d39a9a">●</span> · Delivery <span style="color:#8fbfa8">●</span> · Booking <span style="color:#9ec5e8">●</span> · Visit <span style="color:#e8cf94">●</span></div><div class="cal-grid">'+dow+cells+'</div></div><div class="d-split">'+form+'<div class="d-panel"><h3>Upcoming</h3><ul class="d-feed">'+(upcoming||'<li><span style="color:var(--muted)">Nothing scheduled.</span></li>')+'</ul></div></div>';
  }
  /* ================= MARKETING ================= */
  function aMarketing(){
    var subs=[["journal","Journal"],["newsletter","Newsletter"]];
    var bar='<div class="os-actions">'+subs.map(function(s){return '<button class="d-chip'+(mktSub===s[0]?" on":"")+'" data-mktsub="'+s[0]+'">'+s[1]+'</button>';}).join("")+'</div>';
    $("#dv-marketing").innerHTML=bar+({journal:mktJournal,newsletter:mktNewsletter}[mktSub])();
  }
  function mktJournal(){
    var composer='<div class="d-panel"><h3>New journal post</h3><div class="os-form"><div class="full"><label>Title</label><input id="postTitle"></div><div class="full"><label>Body</label><textarea id="postBody" rows="5"></textarea></div><div class="full os-actions"><button class="os-btn" data-postsave="Draft">Save draft</button><button class="os-btn brass" data-postsave="Published">Publish</button></div></div></div>';
    var list=DB.posts.slice().sort(function(a,b){return b.at-a.at;}).map(function(pst){return '<div class="d-panel"><header class="d-enq" style="border:0;padding:0"><div><h4>'+esc(pst.title)+'</h4><div class="meta">'+esc(pst.author||"")+' · '+esc(fmt(pst.at))+'</div></div>'+pill(pst.status)+'</header><p style="color:var(--muted);font-weight:300;margin:8px 0">'+esc((pst.body||"").slice(0,200))+((pst.body||"").length>200?"…":"")+'</p><div class="os-actions"><button class="os-btn" data-postpub="'+pst.id+'">'+(pst.status==="Published"?"Unpublish":"Publish")+'</button><button class="os-btn" data-postdel="'+pst.id+'">Delete</button></div></div>';}).join("");
    return composer+(list||'<div class="d-empty">No posts yet.</div>');
  }
  function mktNewsletter(){
    var compose='<div class="d-panel"><h3>Group newsletter</h3><div class="ph">Sends to all '+DB.clients.length+' members on file</div><form class="os-form" id="nlForm"><div class="full"><label>Subject</label><input id="nlSubject" required></div><div class="full"><label>Message</label><textarea id="nlBody" rows="5" required></textarea></div><div class="full"><button class="os-btn brass" type="submit">Send to members</button></div></form></div>';
    var log=DB.newsletters.slice().sort(function(a,b){return b.at-a.at;}).map(function(n){return '<tr><td>'+esc(n.subject)+'</td><td style="color:var(--muted)">'+esc(fmt(n.at))+'</td><td>'+(n.recipients||0)+'</td><td><button class="os-btn" data-nlview="'+n.id+'">View</button></td></tr>';});
    return compose+'<div class="d-panel" style="padding:24px 24px 12px"><h3>Sent newsletters</h3>'+tbl(["Subject","Sent","Recipients","View"],log)+'</div>';
  }
  /* Operations + Marketing events */
  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-opssub],[data-caldel],[data-mktsub],[data-postsave],[data-postpub],[data-postdel],[data-nlview],#opsCalPrev,#opsCalNext");
    if(!el)return;
    if(el.dataset.opssub){ opsSub=el.dataset.opssub; aOps(); return; }
    if(el.id==="opsCalPrev"){ opsCalYM.m--; if(opsCalYM.m<0){opsCalYM.m=11;opsCalYM.y--;} aOps(); return; }
    if(el.id==="opsCalNext"){ opsCalYM.m++; if(opsCalYM.m>11){opsCalYM.m=0;opsCalYM.y++;} aOps(); return; }
    if(el.dataset.caldel){ DB.calendar=DB.calendar.filter(function(x){return x.id!==el.dataset.caldel;}); save(); aOps(); return; }
    if(el.dataset.mktsub){ mktSub=el.dataset.mktsub; aMarketing(); return; }
    if(el.dataset.postsave){ var t=$("#postTitle").value.trim(), bd=$("#postBody").value.trim(); if(t&&bd){ DB.posts.unshift({id:rid("PST-"),title:t,body:bd,status:el.dataset.postsave,author:"Admin",at:Date.now()}); audit(el.dataset.postsave+" journal post: "+t); save(); aMarketing(); } else { alert("Add a title and body first."); } return; }
    if(el.dataset.postpub){ var pst=DB.posts.filter(function(x){return x.id===el.dataset.postpub;})[0]; if(pst){pst.status=pst.status==="Published"?"Draft":"Published";save();aMarketing();} return; }
    if(el.dataset.postdel){ if(confirm("Delete this post?")){ DB.posts=DB.posts.filter(function(x){return x.id!==el.dataset.postdel;}); save(); aMarketing(); } return; }
    if(el.dataset.nlview){ var n=DB.newsletters.filter(function(x){return x.id===el.dataset.nlview;})[0]; if(n) download("4orth-newsletter.txt","Subject: "+n.subject+"\n\n"+n.body); return; }
  });
  $("#dashApp").addEventListener("submit",function(e){
    if(e.target.id==="calEventAdd"){ e.preventDefault(); var t=$("#ceTitle").value.trim(); if(t){ DB.calendar.push({id:rid("CAL-"),title:t,date:$("#ceDate").value||todayISO,type:$("#ceType").value,who:$("#ceWho").value.trim()}); save(); aOps(); } return; }
    if(e.target.id==="nlForm"){ e.preventDefault(); var s=$("#nlSubject").value.trim(), bd=$("#nlBody").value.trim(); if(s&&bd){ DB.newsletters.unshift({id:rid("NL-"),subject:s,body:bd,at:Date.now(),recipients:DB.clients.length}); DB.clients.forEach(function(c){mail(c.email,s,bd);}); audit("Sent newsletter: "+s+" ("+DB.clients.length+" recipients)"); save(); aMarketing(); } return; }
  });

  /* ================= ACCOUNTING ================= */
  function periodRange(mode){
    var now=new Date();
    if(mode==="quarter"){ var q=Math.floor(now.getMonth()/3); return {from:new Date(now.getFullYear(),q*3,1), label:"Q"+(q+1)+" "+now.getFullYear()}; }
    if(mode==="year"){ return {from:new Date(now.getFullYear(),now.getMonth()-11,1), label:"Trailing 12 months"}; }
    return {from:new Date(now.getFullYear(),now.getMonth(),1), label:now.toLocaleDateString("en-GB",{month:"long",year:"numeric"})};
  }
  function aAccounting(){
    var modes=[["month","This month"],["quarter","This quarter"],["year","12 months"]];
    var bar='<div class="os-actions">'+modes.map(function(m){return '<button class="d-chip'+(accPeriod===m[0]?" on":"")+'" data-accp="'+m[0]+'">'+m[1]+'</button>';}).join("")+'</div>';
    var r=periodRange(accPeriod), fromISO=r.from.toISOString().slice(0,10);
    var rev=DB.invoices.filter(function(i){return i.status==="Paid"&&i.date>=fromISO;}).reduce(function(a,b){return a+b.amount;},0);
    var exps=DB.expenses.filter(function(x){return x.date>=fromISO;});
    var byCat={}; exps.forEach(function(x){byCat[x.category]=(byCat[x.category]||0)+x.amount;});
    var cats=Object.keys(byCat).sort(function(a,b){return byCat[b]-byCat[a];});
    var expTotal=exps.reduce(function(a,b){return a+b.amount;},0), net=rev-expTotal;
    var kpis=[["<span>"+shortN(rev)+"</span>","Revenue",r.label],["<span>"+shortN(expTotal)+"</span>","Expenses",cats.length+" categories"],["<span style=\"color:"+(net>=0?"var(--brass)":"#d39a9a")+"\">"+shortN(net)+"</span>","Net "+(net>=0?"profit":"loss"),r.label]];
    var kpiHtml='<div class="d-kpis">'+kpis.map(function(k){return '<div class="d-kpi"><b>'+k[0]+'</b><div class="lab">'+k[1]+'</div><em>'+k[2]+'</em></div>';}).join("")+'</div>';
    var pl='<div class="d-panel" style="padding:24px 24px 12px"><h3>Profit & loss</h3><div class="ph">'+r.label+'</div><table><tbody><tr><td>Revenue</td><td style="text-align:right">'+NGN(rev)+'</td></tr>'+cats.map(function(c){return '<tr><td style="color:var(--muted)">Less: '+esc(c)+'</td><td style="text-align:right;color:var(--muted)">('+NGN(byCat[c])+')</td></tr>';}).join("")+'<tr style="border-top:1px solid var(--brass)"><td><b>Net '+(net>=0?"profit":"loss")+'</b></td><td style="text-align:right"><b>'+NGN(net)+'</b></td></tr></tbody></table></div>';
    var maxC=Math.max.apply(null,cats.map(function(c){return byCat[c];}))||1;
    var sum='<div class="d-panel"><h3>Expenses by category</h3><div class="ph">'+r.label+'</div><div class="d-bars">'+(cats.length?cats.map(function(c){return '<div class="d-bar-row"><span>'+esc(c)+'</span><span class="d-track"><span class="d-fill" style="width:'+(byCat[c]/maxC*100)+'%"></span></span><span class="val">'+shortN(byCat[c])+'</span></div>';}).join(""):'<div class="d-empty">No expenses in this period.</div>')+'</div></div>';
    var addf='<div class="d-panel"><h3>Record expense</h3><form class="os-form" id="expAdd"><div><label>Category</label><select id="exCat"><option>Rent</option><option>Salaries</option><option>Utilities</option><option>Supplies</option><option>Marketing</option><option>Maintenance</option><option>Other</option></select></div><div><label>Amount (₦)</label><input type="number" id="exAmt" required></div><div><label>Date</label><input type="date" id="exDate" value="'+todayISO+'"></div><div class="full"><label>Note</label><input id="exNote"></div><div class="full"><button class="os-btn brass" type="submit">Add expense</button></div></form></div>';
    $("#dv-accounting").innerHTML=bar+kpiHtml+'<div class="d-split">'+pl+sum+'</div>'+addf;
  }
  /* ================= PLATFORM ================= */
  function audit(action){ DB.audit=DB.audit||[]; DB.audit.unshift({id:rid("AUD-"),at:Date.now(),who:"Admin",action:action}); }
  function aPlatform(){
    var outbox=DB.outbox.slice(0,12).map(function(m){return '<tr><td style="color:var(--muted);white-space:nowrap">'+esc(fmt(m.at))+'</td><td>'+esc(m.subject)+'</td><td style="color:var(--muted)">'+esc(m.to)+'</td></tr>';});
    var outPanel='<div class="d-panel" style="padding:24px 24px 12px"><h3>Notifications outbox</h3><div class="ph">'+DB.outbox.length+' sent</div>'+tbl(["When","Subject","To"],outbox)+'</div>';
    var biz=["4orth Space","Matcha Street","Soho Boulevard"], roles=["Admin","Manager","Staff"], levels=["None","View","Edit","Full"];
    var permRows=biz.map(function(bz){ return '<tr><td>'+esc(bz)+'</td>'+roles.map(function(ro){ var key=bz+"|"+ro, cur=(DB.permissions&&DB.permissions[key])||(ro==="Admin"?"Full":ro==="Manager"?"Edit":"View"); return '<td><select class="os-sel" data-perm="'+esc(key)+'">'+levels.map(function(l){return '<option'+(cur===l?" selected":"")+'>'+l+'</option>';}).join("")+'</select></td>'; }).join("")+'</tr>'; });
    var permPanel='<div class="d-panel" style="padding:24px 24px 12px"><h3>Role permissions per business</h3><div class="ph">Access level by role across the group</div>'+tbl(["Business","Admin","Manager","Staff"],permRows)+'</div>';
    var aud=(DB.audit||[]).slice(0,15).map(function(a){return '<li><time>'+esc(fmt(a.at))+'</time><span>'+esc(a.who)+' — '+esc(a.action)+'</span></li>';}).join("");
    var auditPanel='<div class="d-panel"><h3>Audit log</h3><div class="ph">Who changed what</div><ul class="d-feed">'+(aud||'<li><span style="color:var(--muted)">No changes logged yet.</span></li>')+'</ul></div>';
    var resetPanel='<div class="d-panel"><h3>Data</h3><div class="ph">Manage the dataset</div><div class="os-actions"><button class="os-btn brass" data-resetdemo="1">Reset to demo data</button><button class="os-btn" data-clearall="1">Clear all for launch</button></div><p style="color:var(--muted);font-weight:300;font-size:.84rem;margin-top:10px">Reset restores the sample members, bookings and records. Clear empties everything for going live.</p></div>';
    $("#dv-platform").innerHTML=outPanel+permPanel+'<div class="d-split">'+auditPanel+resetPanel+'</div>';
  }
  /* Accounting + Platform events */
  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-accp],[data-resetdemo],[data-clearall]");
    if(!el)return;
    if(el.dataset.accp){ accPeriod=el.dataset.accp; aAccounting(); return; }
    if(el.dataset.resetdemo){ if(confirm("Reset all data to the sample demo set?")){ DB=seed(); DB.audit=[{id:rid("AUD-"),at:Date.now(),who:"Admin",action:"Reset to demo data"}]; save(); renderAdmin(); renderCounts(); } return; }
    if(el.dataset.clearall){ if(confirm("Clear ALL data for launch? This empties members, bookings, enquiries and records.")){ DB=emptyState(); DB.audit=[{id:rid("AUD-"),at:Date.now(),who:"Admin",action:"Cleared all data for launch"}]; save(); renderAdmin(); renderCounts(); } return; }
  });
  $("#dashApp").addEventListener("change",function(e){
    var pm=e.target.closest("[data-perm]"); if(pm){ DB.permissions=DB.permissions||{}; DB.permissions[pm.dataset.perm]=pm.value; audit("Set permission "+pm.dataset.perm.replace("|"," ")+" to "+pm.value); save(); return; }
  });
  $("#dashApp").addEventListener("submit",function(e){
    if(e.target.id==="expAdd"){ e.preventDefault(); var amt=parseInt($("#exAmt").value,10)||0; if(amt>0){ DB.expenses.unshift({id:rid("EX-"),category:$("#exCat").value,amount:amt,date:$("#exDate").value||todayISO,note:$("#exNote").value.trim()}); audit("Recorded "+$("#exCat").value+" expense "+NGN(amt)); save(); aAccounting(); } return; }
  });

  /* booking + founding approve / reject (auto-confirmation email) */
  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-bkapprove],[data-bkreject],[data-appapprove],[data-appreject]");
    if(!el)return;
    if(el.dataset.bkapprove){ var b=DB.bookings.filter(function(x){return x.ref===el.dataset.bkapprove;})[0]; if(b){ b.status="Confirmed"; mail(b.email||b.member,"Booking confirmed — "+b.ref,"Hi "+b.member+", your booking for "+b.space+(b.date?" on "+b.date:"")+" is confirmed. We look forward to seeing you at 4orth."); audit("Approved booking "+b.ref); save(); aOps(); renderCounts(); } return; }
    if(el.dataset.bkreject){ var b2=DB.bookings.filter(function(x){return x.ref===el.dataset.bkreject;})[0]; if(b2){ b2.status="Cancelled"; mail(b2.email||b2.member,"Booking update — "+b2.ref,"Hi "+b2.member+", unfortunately we couldn't confirm your booking for "+b2.space+". Please reply to arrange another time."); audit("Rejected booking "+b2.ref); save(); aOps(); renderCounts(); } return; }
    if(el.dataset.appapprove){ var a=DB.applications.filter(function(x){return x.id===el.dataset.appapprove;})[0]; if(a){ a.status="Approved"; mail(a.email,"Your 4orth visit is confirmed","Hi "+a.name+", your Founding 40 visit"+(a.visitDate?" on "+a.visitDate+" at "+(a.visitTime||""):"")+" is confirmed. Your member ID is "+a.memberId+". Welcome to the fourth space."); audit("Approved Founding 40 "+(a.memberId||a.id)); save(); aClients(); } return; }
    if(el.dataset.appreject){ var a2=DB.applications.filter(function(x){return x.id===el.dataset.appreject;})[0]; if(a2){ a2.status="Declined"; mail(a2.email,"About your 4orth application","Hi "+a2.name+", thank you for applying to the Founding 40. We're unable to confirm a place at this time, but we'll keep your details on file."); audit("Declined Founding 40 "+(a2.memberId||a2.id)); save(); aClients(); } return; }
  });

  /* admin events */
  $("#dashGo").addEventListener("click",adminAuth);
  $("#dashPass").addEventListener("keydown",function(e){if(e.key==="Enter")adminAuth();});
  $("#dashUser").addEventListener("keydown",function(e){if(e.key==="Enter")$("#dashPass").focus();});
  [$("#dashUser"),$("#dashPass")].forEach(function(i){i.addEventListener("input",function(){dGate.classList.remove("bad");$("#dashErr").style.display="none";});});
  $("#dashClose").addEventListener("click",closeAdmin);
  $("#dashOut").addEventListener("click",signOutAdmin);
  $("#dashReset").addEventListener("click",function(){ if(confirm("Reset all dashboard data to a clean, empty state? This clears members, bookings, enquiries and every record in this browser, and signs you out. (Platform has a Restore demo data option.)")){ DB=emptyState(); save(); signOutAdmin(); } });
  $("#dashSync").addEventListener("click",function(){ var b=$("#dashSync"); b.textContent="Syncing…"; syncFromSheet(function(ok,why){ b.textContent=ok?"Synced ✓":("Sync failed"+(why?" ("+why+")":"")); if(ok)renderAdmin(); setTimeout(function(){b.textContent="Sync sheet";},4000); }); });
  $("#dashTabs").addEventListener("click",function(e){ var t=e.target.closest(".dash-tab"); if(!t)return; adminTab=t.dataset.tab; $$(".dash-tab",this).forEach(function(x){x.classList.remove("on");}); t.classList.add("on"); ["overview","clients","operations","marketing","hr","accounting","platform"].forEach(function(k){$("#dv-"+k).hidden=(k!==adminTab);}); $("#dashDeptTitle").textContent=TITLES[adminTab]; renderAdmin(); });

  $("#dashApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-fbk],[data-fen],[data-ftk],[data-fsp],[data-sub],[data-csv],[data-badv],[data-tadv],[data-trem],[data-enq],[data-app],[data-redeem],[data-floor],[data-gotab],[data-remindall]");
    if(!el)return;
    if(el.dataset.fbk!=null){fBookings=el.dataset.fbk;aOps();return;}
    if(el.dataset.fen!=null){fEnq=el.dataset.fen;aClients();return;}
    if(el.dataset.ftk!=null){fTasks=el.dataset.ftk;aOps();return;}
    if(el.dataset.fsp!=null){fSpaces=el.dataset.fsp;aOps();return;}
    if(el.dataset.sub!=null){membersSub=el.dataset.sub;aMembers();return;}
    if(el.dataset.gotab!=null){ $('.dash-tab[data-tab="'+el.dataset.gotab+'"]').click(); return; }
    if(el.dataset.csv){ var map={spaces:DB.spaces,bookings:DB.bookings,enquiries:DB.enquiries,tasks:DB.tasks,clients:DB.clients,applications:DB.applications,classes:DB.classes}; download("4orth-"+el.dataset.csv+".csv",toCSV(map[el.dataset.csv])); return; }
    if(el.dataset.badv){ var b=DB.bookings.filter(function(x){return x.ref===el.dataset.badv;})[0]; if(b){b.status=el.dataset.next;save();aOps();renderCounts();} return; }
    if(el.dataset.tadv){ var t=DB.tasks.filter(function(x){return x.id===el.dataset.tadv;})[0]; if(t){t.status=el.dataset.next;save();aOps();renderCounts();} return; }
    if(el.dataset.trem){ var t2=DB.tasks.filter(function(x){return x.id===el.dataset.trem;})[0]; if(t2){ mail(staffName(t2.owner),"Reminder: "+t2.title,"This task is due "+t2.due+"."); DB.reminders.unshift({id:rid("RM-"),staffId:t2.owner,message:"Reminder: \""+t2.title+"\" is due "+t2.due+".",by:"S1",at:Date.now(),read:false}); save(); el.textContent="Reminded ✓"; el.disabled=true; } return; }
    if(el.dataset.remindall){ DB.tasks.filter(overdue).forEach(function(t3){ mail(staffName(t3.owner),"Overdue: "+t3.title,"This task is overdue."); DB.reminders.unshift({id:rid("RM-"),staffId:t3.owner,message:"Overdue task: \""+t3.title+"\" needs attention.",by:"S1",at:Date.now(),read:false}); }); save(); el.textContent="Reminders sent ✓"; el.disabled=true; return; }
    if(el.dataset.enq){ var en=DB.enquiries.filter(function(x){return x.id===el.dataset.enq;})[0]; if(en){en.status=en.status==="New"?"Replied":"New";save();aClients();renderCounts();} return; }
    if(el.dataset.app){ var ap=DB.applications.filter(function(x){return x.id===el.dataset.app;})[0]; if(ap){ap.status=ap.status==="New"?"Reviewed":"New";save();aClients();} return; }
    if(el.dataset.redeem){ var c=DB.clients.filter(function(x){return x.id===el.dataset.redeem;})[0]; if(c){ var p=parseInt(prompt("Points to deduct from "+c.name+" (balance "+c.points+"):","500"),10); if(p>0&&p<=c.points){ c.points-=p; DB.loyaltyTx.unshift({id:rid("LX"),clientId:c.id,type:"spend",points:-p,note:"Paid with points",at:Date.now()}); mail(c.email,"Points redeemed","You redeemed "+p+" points at 4orth."); save(); aClients(); } } return; }
    if(el.dataset.floor){ var s=DB.spaces.filter(function(x){return x.id===el.dataset.floor;})[0]; if(s){var order=["Available","Reserved","Occupied"];s.status=order[(order.indexOf(s.status)+1)%3];save();aOps();} return; }
  });
  $("#dashApp").addEventListener("submit",function(e){
    if(e.target.id==="taskAdd"){ e.preventDefault(); var title=$("#tkTitle").value.trim(); if(!title)return; DB.tasks.unshift({id:rid("T"),title:title,owner:$("#tkOwner").value,due:$("#tkDue").value||todayISO,priority:$("#tkPri").value,status:"To do"}); save(); aOps(); renderCounts(); }
  });

  /* ================= MEMBER PORTAL ================= */
  var curMember=null, portalTab="overview";
  var portal=$("#portal"), pGate=$("#portalGate"), pApp=$("#portalApp");
  function openPortal(){ closeAdmin(); closeStaff(); portal.classList.add("open"); document.body.style.overflow="hidden"; (curMember?$("#portalOut"):$("#portalId")).focus(); }
  function closePortal(){ portal.classList.remove("open"); if(!dash.classList.contains("open")) document.body.style.overflow=""; }
  function enterPortal(m){
    curMember=m; pGate.hidden=true; pApp.hidden=false; portalTab="overview";
    $$(".dash-tab",$("#portalTabs")).forEach(function(x,i){x.classList.toggle("on",i===0);});
    ["overview","planner","calendar","workspace","bookings","invoices","rewards","events","documents","profile"].forEach(function(k,i){$("#pv-"+k).hidden=i!==0;});
    renderPortal();
  }
  function portalAuth(){
    var q=$("#portalId").value.trim().toLowerCase(); var pin=$("#portalPin").value;
    var m=DB.clients.filter(function(c){return c.name.toLowerCase()===q||c.id.toLowerCase()===q||(c.email||"").toLowerCase()===q;})[0];
    if(m && pin===(m.pin||CLIENT_PIN)){ enterPortal(m); }
    else { pGate.classList.add("bad"); $("#portalErr").style.display="block"; }
  }
  function portalSignUp(){
    var name=$("#suName").value.trim(), email=$("#suEmail").value.trim(), phone=$("#suPhone").value.trim(), pin=$("#suPin").value;
    if(name.length<2 || !/.+@.+\..+/.test(email) || pin.length<4){ $("#portalSignUp").classList.add("bad"); $("#suErr").textContent="Please fill in your name, a valid email and a password of at least 4 characters."; $("#suErr").style.display="block"; return; }
    if(DB.clients.filter(function(c){return (c.email||"").toLowerCase()===email.toLowerCase();})[0]){ $("#suErr").textContent="An account with that email already exists. Please sign in."; $("#suErr").style.display="block"; return; }
    enterPortal(window.OS.addMember({name:name,email:email,phone:phone,pin:pin}));
  }
  function showSignup(on){
    $("#portalSignIn").hidden=on; $("#portalSignUp").hidden=!on;
    $("#portalGateTitle").textContent=on?"Create your 4orth account":"Your 4orth";
    $("#portalGateSub").textContent=on?"Set up your member profile in a few seconds.":"Bookings, points, invoices and member events, all in one place.";
    pGate.classList.remove("bad"); $("#portalSignUp").classList.remove("bad"); $("#portalErr").style.display="none"; $("#suErr").style.display="none";
  }
  function signOutPortal(){ curMember=null; pApp.hidden=true; pGate.hidden=false; $("#portalId").value=""; $("#portalPin").value=""; ["suName","suEmail","suPhone","suPin"].forEach(function(id){var e=$("#"+id);if(e)e.value="";}); showSignup(false); }

  function tierProgress(m){
    var i=TIER_ORDER.indexOf(m.tier); var nextTier=TIER_ORDER[i+1];
    if(!nextTier) return {next:null,pct:100,need:0};
    var need=TIER_THRESH[nextTier]; var pct=Math.min(m.points/need*100,100);
    return {next:nextTier,pct:pct,need:Math.max(need-m.points,0)};
  }
  function renderPortalHeader(){
    var m=curMember, tp=tierProgress(m), rep=DB.staff.filter(function(s){return s.id===m.repId;})[0];
    $("#portalHeader").innerHTML='<div class="p-head"><div><div class="tier">'+esc(m.tier)+' member · '+esc(m.id)+'</div><h3>Welcome back, '+esc(m.name.split(" ")[0])+'</h3><div style="font-family:var(--f-mono);font-size:.72rem;color:var(--muted)">Relationship manager: '+esc(rep?rep.name:"—")+' <button class="os-btn" data-msgrep="1" style="margin-left:8px">Message</button></div></div><div class="p-pts"><div class="big">'+m.points.toLocaleString()+'</div><div class="sub">points · '+NGN(m.points*POINT_VALUE)+'</div><div class="p-prog"><i style="width:'+tp.pct+'%"></i></div><div class="sub" style="margin-top:6px">'+(tp.next?(tp.need.toLocaleString()+" pts to "+tp.next):"Top tier")+'</div></div></div>';
  }
  function renderPortal(){
    renderPortalHeader();
    ({overview:pOverview,planner:pPlanner,calendar:pCalendar,workspace:pWorkspace,bookings:pBookings,invoices:pInvoices,rewards:pRewards,events:pEvents,documents:pDocuments,profile:pProfile}[portalTab])();
  }
  function myBookings(){ return DB.bookings.filter(function(b){return b.member===curMember.name||b.email===curMember.email;}); }
  function myInvoices(){ return DB.invoices.filter(function(i){return i.clientId===curMember.id;}); }
  function myTx(){ return DB.loyaltyTx.filter(function(x){return x.clientId===curMember.id;}); }
  function myDocs(){ return DB.documents.filter(function(d){return d.clientId===curMember.id;}); }

  function pOverview(){
    var nextBk=myBookings().filter(function(b){return b.date>=todayISO&&b.status!=="Cancelled";}).sort(function(a,b){return a.date<b.date?-1:1;})[0];
    var ev=DB.events.filter(function(e){return e.date>=todayISO;})[0];
    var due=myInvoices().filter(function(i){return i.status==="Due";});
    $("#pv-overview").innerHTML='<div class="d-split"><div class="d-panel"><h3>Coming up</h3><ul class="d-feed">'+
      '<li><time>Booking</time><span>'+(nextBk?esc(nextBk.space)+' · '+esc(nextBk.date)+' '+pill(nextBk.status):"No upcoming bookings")+'</span></li>'+
      '<li><time>Event</time><span>'+(ev?esc(ev.title)+' · '+esc(fmt(ev.date)):"No upcoming events")+'</span></li>'+
      '<li><time>Billing</time><span>'+(due.length?due.length+" invoice(s) due — "+NGN(due.reduce(function(a,b){return a+b.amount;},0)):"All invoices settled")+'</span></li>'+
      '<li><time>To-do</time><span>'+(function(){memTools(curMember);var o=curMember.todos.filter(function(t){return !t.done;}).length;return o?(o+" open task"+(o>1?"s":"")+" in your planner"):"No open tasks";})()+'</span></li>'+
      '<li><time>Access</time><span>Access hours confirmed at opening, we\'re in pre-opening</span></li>'+
      '</ul></div><div class="d-panel"><h3>Your space</h3><div class="ph">Current allocation</div><div style="font-family:var(--f-disp);font-size:1.5rem;color:var(--brass)">'+esc(curMember.space)+'</div><p style="color:var(--muted);font-weight:300;margin-top:10px;font-size:.9rem">'+esc(curMember.prefs)+'</p><div class="os-actions" style="margin-top:16px"><button class="os-btn brass" data-ptabgo="bookings">Book a space</button><button class="os-btn" data-facil="1">Facilities request</button></div></div></div>';
  }
  function pWorkspace(){
    $("#pv-workspace").innerHTML='<div class="d-panel"><h3>My workspace</h3><div class="d-mgrid" style="margin-top:14px"><div class="d-mcard"><div class="tier">Membership</div><div class="cnt"><span>'+esc(curMember.tier)+'</span></div><div class="meta"><span>since '+esc(curMember.since)+'</span></div></div><div class="d-mcard"><div class="tier">Allocation</div><div style="font-family:var(--f-disp);font-size:1.3rem;margin-top:10px;color:var(--brass)">'+esc(curMember.space)+'</div></div><div class="d-mcard"><div class="tier">Access</div><div style="font-family:var(--f-disp);font-size:1.15rem;margin-top:10px">Hours set at opening</div><div class="meta"><span>pre-opening</span></div></div></div><p style="color:var(--muted);font-weight:300;margin-top:18px;font-size:.9rem">Preferences on file: '+esc(curMember.prefs)+'</p></div>';
  }
  function pBookings(){
    var rows=myBookings().map(function(b){return '<tr><td class="d-ref">'+esc(b.ref)+'</td><td>'+esc(b.space)+'</td><td style="color:var(--muted)">'+esc(b.date||"—")+'</td><td>'+esc(b.value)+'</td><td>'+pill(b.status)+'</td></tr>';});
    var form='<form class="os-form" id="pBook"><div class="full" style="font-family:var(--f-mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Book a space</div><div><label>What</label><select id="pbType"><option value="work|Hot desk · Day pass|₦8,000">Hot desk — day pass</option><option value="work|Dedicated desk · Day|₦12,000">Dedicated desk — day</option><option value="room|Meeting room · 2 hours|₦28,000">Meeting room — 2 hours</option><option value="room|Boardroom · Half day|₦70,000">Boardroom — half day</option><option value="tour|Private tour|Free">Private tour</option></select></div><div><label>Date</label><input type="date" id="pbDate" value="'+todayISO+'"></div><div class="full"><button class="os-btn brass" type="submit">Request booking</button></div></form>';
    $("#pv-bookings").innerHTML='<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["Ref","Space","Date","Value","Status"],rows)+'</div><div class="d-panel">'+form+'</div>';
  }
  function pInvoices(){
    var rows=myInvoices().map(function(i){return '<tr><td class="d-ref">'+esc(i.id)+'</td><td>'+esc(i.desc)+'</td><td style="color:var(--muted)">'+esc(i.date)+'</td><td>'+NGN(i.amount)+'</td><td>'+pill(i.status)+'</td><td><button class="os-btn" data-receipt="'+esc(i.id)+'">Receipt</button></td></tr>';});
    $("#pv-invoices").innerHTML='<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["Invoice","Description","Date","Amount","Status","Receipt"],rows)+'</div>';
  }
  function pRewards(){
    var tx=myTx().map(function(x){return '<li><time>'+(x.points>0?"+":"")+x.points+'</time><span>'+esc(x.note)+' <span style="color:var(--muted)">· '+esc(fmt(x.at))+'</span></span></li>';}).join("");
    var cat=DB.rewards.map(function(r){var ok=curMember.points>=r.cost;return '<div class="rwd-card"><h4>'+esc(r.name)+'</h4><div class="cost">'+r.cost.toLocaleString()+' pts</div><button class="os-btn'+(ok?" brass":"")+'" data-claim="'+r.id+'"'+(ok?"":" disabled")+'>'+(ok?"Redeem":"Not enough")+'</button></div>';}).join("");
    $("#pv-rewards").innerHTML='<div class="d-split"><div class="d-panel"><h3>Points history</h3><ul class="d-feed">'+(tx||'<li><span style="color:var(--muted)">No activity yet.</span></li>')+'</ul></div><div class="d-panel"><h3>Your 4orth card</h3><div class="ph">Spendable at the club and partners</div><div style="border:1px solid var(--brass);border-radius:14px;padding:22px;background:linear-gradient(135deg,rgba(201,164,92,.14),transparent)"><div style="font-family:var(--f-mono);letter-spacing:.2em;color:var(--brass)">4ORTH · '+esc(curMember.id)+'</div><div style="font-family:var(--f-disp);font-size:1.4rem;margin-top:18px">'+esc(curMember.name)+'</div><div style="font-family:var(--f-mono);font-size:.72rem;color:var(--muted);margin-top:4px">'+esc(curMember.tier)+' · '+curMember.points.toLocaleString()+' pts · '+NGN(curMember.points*POINT_VALUE)+'</div></div></div></div><div class="d-panel"><h3>Spend your points</h3><div class="rwd" style="margin-top:14px">'+cat+'</div></div>';
  }
  function pEvents(){
    var rows=DB.events.map(function(e){var going=e.rsvp.indexOf(curMember.id)>=0;return '<div class="d-enq"><header><div><h4>'+esc(e.title)+'</h4><div class="meta">'+esc(fmt(e.date))+' · '+e.rsvp.length+' attending</div></div>'+(going?pill("Confirmed"):"")+'</header><div class="acts"><button class="os-btn'+(going?"":" brass")+'" data-rsvp="'+e.id+'">'+(going?"Cancel RSVP":"RSVP")+'</button></div></div>';}).join("");
    $("#pv-events").innerHTML=rows||'<div class="d-empty">No member events scheduled.</div>';
  }
  function pDocuments(){
    var rows=myDocs().map(function(d){return '<tr><td>'+esc(d.name)+'</td><td style="color:var(--muted)">'+esc(d.kind)+'</td><td><button class="os-btn" data-doc="'+esc(d.id)+'">Download</button></td></tr>';});
    $("#pv-documents").innerHTML='<div class="d-panel" style="padding:24px 24px 12px">'+tbl(["Document","Type","Action"],rows)+'</div>';
  }
  function pProfile(){
    var m=curMember;
    $("#pv-profile").innerHTML='<div class="d-panel"><h3>Profile</h3><form class="os-form" id="pProf"><div><label>Name</label><input id="prName" value="'+esc(m.name)+'"></div><div><label>Email</label><input id="prEmail" value="'+esc(m.email)+'"></div><div><label>Phone</label><input id="prPhone" value="'+esc(m.phone)+'"></div><div><label>Birthday</label><input id="prBday" value="'+esc(m.family.birthday)+'"></div><div class="full"><label>Preferences (saved for the team)</label><textarea id="prPrefs" rows="2">'+esc(m.prefs)+'</textarea></div><div class="full"><button class="os-btn brass" type="submit">Save profile</button> <span id="prSaved" style="color:var(--brass);font-family:var(--f-mono);font-size:.72rem;display:none">Saved ✓</span></div></form></div>';
  }

  /* ---- member work tools: planner, timer, notes, calendar ---- */
  var pTimer={remain:1500,iv:null}, calYM=null;
  function memTools(m){ if(!m)return m; if(!m.todos)m.todos=[]; if(typeof m.notes!=="string")m.notes=""; if(!m.calNotes)m.calNotes={}; if(!m.calEvents)m.calEvents=[]; return m; }
  function tfmt(s){var mm=Math.floor(s/60),x=s%60;return (mm<10?"0":"")+mm+":"+(x<10?"0":"")+x;}
  function timerRender(){var f=$("#timerFace");if(f)f.textContent=pTimer.remain<=0?"Done":tfmt(pTimer.remain);}
  function timerStart(){ var b=$("#timerStart"); if(pTimer.iv){clearInterval(pTimer.iv);pTimer.iv=null;if(b)b.textContent="Start";return;} if(pTimer.remain<=0)pTimer.remain=1500; if(b)b.textContent="Pause"; pTimer.iv=setInterval(function(){pTimer.remain--;timerRender();if(pTimer.remain<=0){clearInterval(pTimer.iv);pTimer.iv=null;var bb=$("#timerStart");if(bb)bb.textContent="Start";}},1000); }
  function timerReset(){ if(pTimer.iv){clearInterval(pTimer.iv);pTimer.iv=null;} pTimer.remain=1500; var b=$("#timerStart");if(b)b.textContent="Start"; timerRender(); }
  function pPlanner(){
    memTools(curMember);
    var items=curMember.todos.map(function(t){return '<li class="'+(t.done?"done":"")+'"><input type="checkbox" class="todo-chk" data-todo="'+t.id+'"'+(t.done?" checked":"")+'><span>'+esc(t.text)+(t.due?' <em style="color:var(--muted);font-family:var(--f-mono);font-size:.66rem;font-style:normal">· due '+esc(fmt(t.due))+'</em>':'')+'</span><button class="todo-del" data-todel="'+t.id+'" title="Remove">✕</button></li>';}).join("");
    var open=curMember.todos.filter(function(t){return !t.done;}).length;
    $("#pv-planner").innerHTML='<div class="d-split"><div class="d-panel"><h3>To-do list</h3><div class="ph">'+open+' open · '+curMember.todos.length+' total</div><form class="todo-add" id="todoAdd"><input type="text" id="todoText" placeholder="Add a task…" maxlength="140" autocomplete="off"><input type="date" id="todoDue" title="Due date" style="flex:none;width:auto"><button class="os-btn brass" type="submit">Add</button></form><ul class="todo-list">'+(items||'<li><span style="color:var(--muted)">Nothing yet. Add your first task.</span></li>')+'</ul></div><div class="d-panel"><h3>Focus timer</h3><div class="ph">A 25-minute work sprint</div><div class="timer-face" id="timerFace">'+(pTimer.remain<=0?"Done":tfmt(pTimer.remain))+'</div><div class="os-actions" style="justify-content:center;margin-top:12px"><button class="os-btn brass" id="timerStart">'+(pTimer.iv?"Pause":"Start")+'</button><button class="os-btn" id="timerReset">Reset</button></div><h3 style="margin-top:26px">Quick notes</h3><textarea id="memNotes" rows="6" placeholder="Jot anything down…" style="width:100%;resize:vertical">'+esc(curMember.notes)+'</textarea><div style="margin-top:8px"><button class="os-btn" id="notesSave">Save notes</button> <span id="notesSaved" style="color:var(--brass);font-family:var(--f-mono);font-size:.72rem;display:none">Saved ✓</span></div></div></div>';
  }
  function pCalendar(){
    memTools(curMember);
    var now=new Date(); if(!calYM)calYM={y:now.getFullYear(),m:now.getMonth()};
    var y=calYM.y,mo=calYM.m, first=new Date(y,mo,1), start=first.getDay(), days=new Date(y,mo+1,0).getDate();
    var monthName=first.toLocaleDateString("en-GB",{month:"long",year:"numeric"}), todayStr=new Date().toISOString().slice(0,10);
    var byDate={}, mine={};
    myBookings().forEach(function(b){ if(b.date){(byDate[b.date]=byDate[b.date]||[]).push(b.space||"Booking");} });
    DB.events.forEach(function(e){ if(e.rsvp.indexOf(curMember.id)>=0){(byDate[e.date]=byDate[e.date]||[]).push(e.title);} });
    (curMember.calEvents||[]).forEach(function(ev){ (mine[ev.date]=mine[ev.date]||[]).push(ev.title); });
    var cells="";
    for(var i=0;i<start;i++)cells+='<div class="cal-cell empty"></div>';
    for(var d=1;d<=days;d++){
      var ds=y+"-"+("0"+(mo+1)).slice(-2)+"-"+("0"+d).slice(-2), its=byDate[ds]||[], mi=mine[ds]||[], note=curMember.calNotes[ds];
      var dots=its.concat(mi).map(function(){return '<span class="cal-dot"></span>';}).join("");
      cells+='<div class="cal-cell'+(ds===todayStr?" today":"")+'" data-calday="'+ds+'"><div class="cal-day">'+d+'</div>'+dots+(its.length?'<div class="cal-note">'+esc(its.join(", "))+'</div>':"")+(mi.length?'<div class="cal-note" style="color:var(--brass)">'+esc(mi.join(", "))+'</div>':"")+(note?'<div class="cal-note" style="color:var(--brass)">'+esc(note)+'</div>':"")+'</div>';
    }
    var dow=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(function(x){return '<div class="cal-dow">'+x+'</div>';}).join("");
    var addForm='<form class="todo-add" id="calAdd" style="margin-bottom:16px"><input type="text" id="calTitle" placeholder="Add something to your calendar…" maxlength="80" autocomplete="off"><input type="date" id="calDate" value="'+todayISO+'" style="flex:none;width:auto"><button class="os-btn brass" type="submit">Add</button></form>';
    $("#pv-calendar").innerHTML='<div class="d-panel"><div class="cal-head"><button class="os-btn" id="calPrev">‹</button><h3 style="margin:0">'+monthName+'</h3><button class="os-btn" id="calNext">›</button></div>'+addForm+'<div class="cal-grid">'+dow+cells+'</div><p style="color:var(--muted);font-weight:300;margin-top:14px;font-size:.84rem">Add items above, or click any day to jot a quick note. Bookings and RSVP\'d events show automatically.</p></div>';
  }

  /* portal events */
  $("#portalGo").addEventListener("click",portalAuth);
  $("#portalPin").addEventListener("keydown",function(e){if(e.key==="Enter")portalAuth();});
  $("#portalId").addEventListener("keydown",function(e){if(e.key==="Enter")$("#portalPin").focus();});
  [$("#portalId"),$("#portalPin")].forEach(function(i){i.addEventListener("input",function(){pGate.classList.remove("bad");$("#portalErr").style.display="none";});});
  $("#suGo").addEventListener("click",portalSignUp);
  $("#suPin").addEventListener("keydown",function(e){if(e.key==="Enter")portalSignUp();});
  if($("#toSignup"))$("#toSignup").addEventListener("click",function(e){e.preventDefault();showSignup(true);});
  if($("#toSignin"))$("#toSignin").addEventListener("click",function(e){e.preventDefault();showSignup(false);});
  ["suName","suEmail","suPhone","suPin"].forEach(function(id){var el=$("#"+id);if(el)el.addEventListener("input",function(){$("#portalSignUp").classList.remove("bad");$("#suErr").style.display="none";});});
  $("#portalClose").addEventListener("click",closePortal);
  $("#portalOut").addEventListener("click",signOutPortal);
  $("#portalTabs").addEventListener("click",function(e){var t=e.target.closest(".dash-tab");if(!t)return;portalTab=t.dataset.ptab;$$(".dash-tab",this).forEach(function(x){x.classList.remove("on");});t.classList.add("on");["overview","planner","calendar","workspace","bookings","invoices","rewards","events","documents","profile"].forEach(function(k){$("#pv-"+k).hidden=(k!==portalTab);});renderPortal();});
  $("#portalApp").addEventListener("click",function(e){
    var el=e.target.closest("[data-ptabgo],[data-facil],[data-msgrep],[data-claim],[data-rsvp],[data-receipt],[data-doc]");
    if(!el)return;
    if(el.dataset.ptabgo){ $('.dash-tab[data-ptab="'+el.dataset.ptabgo+'"]').click(); return; }
    if(el.dataset.facil){ var what=prompt("What do you need? (facilities request)","Spare monitor at my desk"); if(what){ DB.tasks.unshift({id:rid("T"),title:"Member request — "+curMember.name+": "+what,owner:"S4",due:todayISO,priority:"Medium",status:"To do"}); mail("facilities@4orthspace.com","Facilities request from "+curMember.name,what); save(); if(adminAuthed)refreshAdmin(); alert("Request logged. Facilities will follow up."); } return; }
    if(el.dataset.msgrep){ var msg=prompt("Message to your relationship manager:"); if(msg){ mail(staffName(curMember.repId),"Message from "+curMember.name,msg); alert("Message sent to your relationship manager."); } return; }
    if(el.dataset.claim){ var r=DB.rewards.filter(function(x){return x.id===el.dataset.claim;})[0]; if(r&&curMember.points>=r.cost){ curMember.points-=r.cost; DB.loyaltyTx.unshift({id:rid("LX"),clientId:curMember.id,type:"spend",points:-r.cost,note:"Redeemed: "+r.name,at:Date.now()}); mail(curMember.email,"Reward redeemed",r.name); save(); if(adminAuthed)refreshAdmin(); renderPortal(); } return; }
    if(el.dataset.rsvp){ var ev=DB.events.filter(function(x){return x.id===el.dataset.rsvp;})[0]; if(ev){var k=ev.rsvp.indexOf(curMember.id); if(k>=0)ev.rsvp.splice(k,1); else ev.rsvp.push(curMember.id); save(); pEvents();} return; }
    if(el.dataset.receipt){ var inv=DB.invoices.filter(function(x){return x.id===el.dataset.receipt;})[0]; if(inv){ download("4orth-"+inv.id+".txt","4orth Space — Receipt\n"+inv.id+"\n"+inv.desc+"\nDate: "+inv.date+"\nAmount: "+NGN(inv.amount)+"\nStatus: "+inv.status+"\nMember: "+curMember.name); } return; }
    if(el.dataset.doc){ var d=DB.documents.filter(function(x){return x.id===el.dataset.doc;})[0]; if(d){ download(d.name.replace(/\s+/g,"_")+".txt","4orth Space — "+d.name+"\nType: "+d.kind+"\nMember: "+curMember.name+"\n(Demo document.)"); } return; }
  });
  $("#portalApp").addEventListener("submit",function(e){
    e.preventDefault();
    if(e.target.id==="pBook"){ var v=$("#pbType").value.split("|"); var r=window.OS.addBooking({type:v[0],space:v[1],value:v[2],name:curMember.name,email:curMember.email,date:$("#pbDate").value}); pBookings(); alert("Booking "+r.ref+" requested. Front desk will confirm."); }
    if(e.target.id==="pProf"){ curMember.name=$("#prName").value.trim()||curMember.name; curMember.email=$("#prEmail").value.trim(); curMember.phone=$("#prPhone").value.trim(); curMember.family.birthday=$("#prBday").value.trim(); curMember.prefs=$("#prPrefs").value.trim(); save(); $("#prSaved").style.display="inline"; renderPortalHeader(); }
  });

  /* member work tools events */
  $("#portalApp").addEventListener("click",function(e){
    var t=e.target;
    if(t.id==="timerStart"){ timerStart(); return; }
    if(t.id==="timerReset"){ timerReset(); return; }
    if(t.id==="notesSave"){ memTools(curMember); curMember.notes=$("#memNotes").value; save(); var s=$("#notesSaved"); if(s){s.style.display="inline";setTimeout(function(){s.style.display="none";},1500);} return; }
    if(t.id==="calPrev"){ calYM.m--; if(calYM.m<0){calYM.m=11;calYM.y--;} pCalendar(); return; }
    if(t.id==="calNext"){ calYM.m++; if(calYM.m>11){calYM.m=0;calYM.y++;} pCalendar(); return; }
    var chk=t.closest("[data-todo]"); if(chk){ memTools(curMember); var it=curMember.todos.filter(function(x){return x.id===chk.dataset.todo;})[0]; if(it){it.done=!it.done;save();pPlanner();} return; }
    var del=t.closest("[data-todel]"); if(del){ memTools(curMember); curMember.todos=curMember.todos.filter(function(x){return x.id!==del.dataset.todel;}); save(); pPlanner(); return; }
    var cday=t.closest("[data-calday]"); if(cday){ memTools(curMember); var ds=cday.dataset.calday, cur=curMember.calNotes[ds]||""; var v=prompt("Note for "+ds+":",cur); if(v!==null){ if(v.trim())curMember.calNotes[ds]=v.trim(); else delete curMember.calNotes[ds]; save(); pCalendar(); } return; }
  });
  $("#portalApp").addEventListener("submit",function(e){
    if(e.target.id==="todoAdd"){ e.preventDefault(); memTools(curMember); var tx=$("#todoText").value.trim(); if(tx){ curMember.todos.unshift({id:rid("TD"),text:tx,done:false,due:($("#todoDue")?$("#todoDue").value:"")}); save(); pPlanner(); } }
    if(e.target.id==="calAdd"){ e.preventDefault(); memTools(curMember); var ct=$("#calTitle").value.trim(), cd=$("#calDate").value; if(ct&&cd){ curMember.calEvents.unshift({id:rid("CE"),title:ct,date:cd}); save(); pCalendar(); } }
  });

  /* ================= STAFF PORTAL ================= */
  var curStaff=null, staffTab="today";
  var staff=$("#staff"), sGate=$("#staffGate"), sApp=$("#staffApp");
  function openStaff(){ closeAdmin(); closePortal(); staff.classList.add("open"); document.body.style.overflow="hidden"; (curStaff?$("#staffOut"):$("#staffId")).focus(); }
  function closeStaff(){ staff.classList.remove("open"); if(!dash.classList.contains("open")&&!portal.classList.contains("open")) document.body.style.overflow=""; }
  function enterStaff(m){ curStaff=m; sGate.hidden=true; sApp.hidden=false; setStaffTab("today"); renderStaff(); }
  function signOutStaff(){ curStaff=null; sApp.hidden=true; sGate.hidden=false; $("#staffId").value=""; $("#staffPin").value=""; }
  function staffAuth(){
    var q=$("#staffId").value.trim().toLowerCase(), pin=$("#staffPin").value;
    var m=DB.staff.filter(function(s){return s.name.toLowerCase()===q||s.id.toLowerCase()===q||(s.email||"").toLowerCase()===q;})[0];
    if(m && pin===(m.pin||"0000")){ enterStaff(m); } else { sGate.classList.add("bad"); $("#staffErr").style.display="block"; }
  }
  function setStaffTab(t){ staffTab=t; $$(".dash-tab",$("#staffTabs")).forEach(function(x){x.classList.toggle("on",x.dataset.stab===t);}); ["today","tasks","queries","notices"].forEach(function(k){$("#sv-"+k).hidden=(k!==t);}); }
  function renderStaff(){ renderStaffHeader(); ({today:sToday,tasks:sTasks,queries:sQueries,notices:sNotices}[staffTab])(); updateStaffBadges(); }

  function sOpenShift(){ return DB.attendance.filter(function(a){return a.staffId===curStaff.id&&!a.outAt;})[0]; }
  function sDoneToday(){ return DB.attendance.filter(function(a){return a.staffId===curStaff.id&&a.date===todayISO&&a.outAt;}).slice(-1)[0]; }
  function sReportToday(){ return DB.dailyReports.filter(function(r){return r.staffId===curStaff.id&&r.date===todayISO;})[0]; }
  function sMyQueries(){ return DB.queries.filter(function(q){return q.staffId===curStaff.id;}); }
  function sMyTasks(){ return DB.tasks.filter(function(t){return t.owner===curStaff.id;}); }
  function sMyReminders(){ return DB.reminders.filter(function(r){return r.staffId===curStaff.id;}); }
  function sUnread(){ return sMyReminders().filter(function(r){return !r.read;}); }
  function hhmm(ts){ return new Date(ts).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); }
  function liveDur(ts){ var s=Math.floor((Date.now()-ts)/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h+"h "+m+"m"; }
  function updateStaffBadges(){ var nq=sMyQueries().filter(function(q){return q.status==="Open";}).length; $("#sQCnt").textContent=nq?("("+nq+")"):""; var nn=sUnread().length; $("#sNCnt").textContent=nn?("("+nn+")"):""; }

  function renderStaffHeader(){
    var sh=sOpenShift(), ur=sUnread();
    var status=sh?('On the clock since '+hhmm(sh.inAt)):'Not clocked in';
    $("#staffHeader").innerHTML='<div class="p-head"><div><div class="tier">'+esc(curStaff.role)+' · '+esc(curStaff.dept)+'</div><h3>Hi, '+esc(curStaff.name.split(" ")[0])+'</h3><div style="font-family:var(--f-mono);font-size:.72rem;color:var(--muted)">'+status+'</div></div><div class="p-pts"><div class="big" style="font-size:1.05rem">'+new Date().toLocaleDateString("en-GB",{weekday:"long"})+'</div><div class="sub">'+fmt(todayISO)+'</div></div></div>'+(ur.length?'<div class="os-alert amber" style="margin-top:14px"><div><b>'+ur.length+' new reminder'+(ur.length>1?"s":"")+'</b> from your manager</div><button class="os-btn" data-stabgo="notices">View</button></div>':"");
  }
  function sToday(){
    var sh=sOpenShift(), done=sDoneToday(), rep=sReportToday();
    var clock=sh
      ? '<div class="clock-face on">On the clock</div><div class="ph">Since '+hhmm(sh.inAt)+' · '+liveDur(sh.inAt)+' so far</div><button class="os-btn brass" id="clockOut">Clock out</button>'
      : '<div class="clock-face">Off the clock</div><div class="ph">'+(done?("You logged "+done.hours+"h today"):"Start your shift when you arrive")+'</div><button class="os-btn brass" id="clockIn">Clock in</button>';
    var r=rep||{done:"",tomorrow:"",blockers:"",hours:""};
    var form='<form class="os-form" id="reportForm">'
      +'<div class="full"><label>What did you get done today?</label><textarea id="rDone" rows="3" required>'+esc(r.done)+'</textarea></div>'
      +'<div class="full"><label>Plan for tomorrow</label><textarea id="rTomorrow" rows="2">'+esc(r.tomorrow)+'</textarea></div>'
      +'<div class="full"><label>Blockers</label><textarea id="rBlockers" rows="2" placeholder="Anything in your way? Write None if clear.">'+esc(r.blockers)+'</textarea></div>'
      +'<div><label>Hours worked</label><input type="number" id="rHours" min="0" max="24" step="0.5" value="'+esc(r.hours)+'" required></div>'
      +'<div class="full"><button class="os-btn brass" type="submit">'+(rep?"Update report":"Submit report")+'</button> <span id="reportSaved" style="color:var(--brass);font-family:var(--f-mono);font-size:.72rem;display:none">Saved ✓</span></div></form>';
    var replies=(rep&&rep.replies&&rep.replies.length)?'<div class="d-panel"><h3>Manager replies on today\'s report</h3><ul class="d-feed">'+rep.replies.map(function(x){return '<li><time>'+esc(staffName(x.by))+'</time><span>'+esc(x.text)+'</span></li>';}).join("")+'</ul></div>':'';
    $("#sv-today").innerHTML='<div class="d-split"><div class="d-panel"><h3>Time clock</h3>'+clock+'</div><div class="d-panel"><h3>Daily report</h3><div class="ph">'+(rep?("Submitted "+fmt(rep.at)):"Not submitted yet")+'</div>'+form+'</div></div>'+replies;
  }
  function sTasks(){
    var rows=sMyTasks().map(function(t){
      return '<div class="d-enq"><header><div><h4>'+esc(t.title)+'</h4><div class="meta">Due '+esc(fmt(t.due))+' · '+esc(t.priority)+(overdue(t)?' · <span style="color:var(--brass)">overdue</span>':'')+'</div></div>'+pill(t.status)+'</header><div class="acts"><select class="os-sel" data-tkstatus="'+t.id+'"><option'+(t.status==="To do"?" selected":"")+'>To do</option><option'+(t.status==="In progress"?" selected":"")+'>In progress</option><option'+(t.status==="Done"?" selected":"")+'>Done</option></select></div></div>';
    }).join("");
    $("#sv-tasks").innerHTML='<div class="d-panel" style="padding:18px 20px">'+(rows||'<div class="d-empty">No tasks assigned to you.</div>')+'</div>';
  }
  function sQueries(){
    var rows=sMyQueries().map(function(q){
      var replies=(q.replies||[]).map(function(x){return '<li><time>'+esc(staffName(x.by)||"You")+'</time><span>'+esc(x.text)+'</span></li>';}).join("");
      return '<div class="d-panel"><header class="d-enq" style="border:0;padding:0"><div><h4>'+esc(q.subject)+'</h4><div class="meta">From '+esc(staffName(q.issuedBy))+' · due '+esc(fmt(q.deadline))+'</div></div>'+pill(q.status)+'</header><p style="color:var(--muted);font-weight:300;margin:10px 0">'+esc(q.body)+'</p>'+(replies?'<ul class="d-feed" style="margin-bottom:10px">'+replies+'</ul>':'')+'<form class="os-form" data-qreply="'+q.id+'"><div class="full"><textarea rows="2" placeholder="Write your reply…" required></textarea></div><div class="full"><button class="os-btn brass" type="submit">Send reply</button></div></form></div>';
    }).join("");
    $("#sv-queries").innerHTML=rows||'<div class="d-empty">No queries. You\'re all clear.</div>';
  }
  function sNotices(){
    var rows=sMyReminders().slice().sort(function(a,b){return b.at-a.at;}).map(function(r){
      return '<li class="'+(r.read?"":"unread")+'"><time>'+esc(fmt(r.at))+'</time><span>'+esc(r.message)+' <span style="color:var(--muted)">· '+esc(staffName(r.by))+'</span></span></li>';
    }).join("");
    $("#sv-notices").innerHTML='<div class="d-panel"><h3>Notices from your manager</h3><ul class="d-feed">'+(rows||'<li><span style="color:var(--muted)">No notices right now.</span></li>')+'</ul></div>';
    sMyReminders().forEach(function(r){r.read=true;}); save(); updateStaffBadges();
  }

  /* staff events */
  $("#staffGo").addEventListener("click",staffAuth);
  $("#staffPin").addEventListener("keydown",function(e){if(e.key==="Enter")staffAuth();});
  $("#staffId").addEventListener("keydown",function(e){if(e.key==="Enter")$("#staffPin").focus();});
  [$("#staffId"),$("#staffPin")].forEach(function(i){i.addEventListener("input",function(){sGate.classList.remove("bad");$("#staffErr").style.display="none";});});
  $("#staffClose").addEventListener("click",closeStaff);
  $("#staffOut").addEventListener("click",signOutStaff);
  $("#staffTabs").addEventListener("click",function(e){var t=e.target.closest(".dash-tab");if(!t)return;setStaffTab(t.dataset.stab);renderStaff();});
  $("#staffApp").addEventListener("click",function(e){
    var t=e.target;
    if(t.id==="clockIn"){ DB.attendance.push({id:rid("ATT-"),staffId:curStaff.id,date:todayISO,inAt:Date.now(),outAt:null,hours:0}); save(); if(adminAuthed)refreshAdmin(); renderStaff(); return; }
    if(t.id==="clockOut"){ var sh=sOpenShift(); if(sh){ sh.outAt=Date.now(); sh.hours=Math.round((sh.outAt-sh.inAt)/36000)/100; save(); if(adminAuthed)refreshAdmin(); renderStaff(); } return; }
    var go=t.closest("[data-stabgo]"); if(go){ setStaffTab(go.dataset.stabgo); renderStaff(); return; }
  });
  $("#staffApp").addEventListener("change",function(e){
    var sel=e.target.closest("[data-tkstatus]"); if(sel){ var tk=DB.tasks.filter(function(x){return x.id===sel.dataset.tkstatus;})[0]; if(tk){ tk.status=sel.value; save(); if(adminAuthed)refreshAdmin(); sTasks(); } }
  });
  $("#staffApp").addEventListener("submit",function(e){
    e.preventDefault();
    if(e.target.id==="reportForm"){
      var rep=sReportToday(), d={done:$("#rDone").value.trim(),tomorrow:$("#rTomorrow").value.trim(),blockers:$("#rBlockers").value.trim(),hours:parseFloat($("#rHours").value)||0};
      if(rep){ rep.done=d.done; rep.tomorrow=d.tomorrow; rep.blockers=d.blockers; rep.hours=d.hours; rep.at=Date.now(); }
      else { DB.dailyReports.unshift({id:rid("DR-"),staffId:curStaff.id,date:todayISO,done:d.done,tomorrow:d.tomorrow,blockers:d.blockers,hours:d.hours,at:Date.now(),replies:[]}); }
      save(); if(adminAuthed)refreshAdmin(); var s=$("#reportSaved"); if(s){s.style.display="inline";setTimeout(function(){s.style.display="none";},1500);} sToday(); return;
    }
    var qf=e.target.closest("[data-qreply]"); if(qf){ var q=DB.queries.filter(function(x){return x.id===qf.dataset.qreply;})[0]; var ta=qf.querySelector("textarea"); if(q&&ta&&ta.value.trim()){ q.replies=q.replies||[]; q.replies.push({by:curStaff.id,text:ta.value.trim(),at:Date.now()}); q.status="Replied"; save(); if(adminAuthed)refreshAdmin(); sQueries(); } return; }
  });

  /* ---------------- open triggers ---------------- */
  $$("[data-dash-open]").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();openAdmin();});});
  $$("[data-portal-open]").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();openPortal();});});
  $$("[data-staff-open]").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();openStaff();});});
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ if(dash.classList.contains("open"))closeAdmin(); if(portal.classList.contains("open"))closePortal(); if(staff.classList.contains("open"))closeStaff(); } });
})();

/* Branded fallback: if a remote photo is blocked (in-chat preview) or 404s,
   swap in an inline SVG placeholder so nothing shows a broken-image icon. */
(function(){
  "use strict";
  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function ph(label){
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">'
      +'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F1810"/><stop offset="1" stop-color="#2A2117"/></linearGradient></defs>'
      +'<rect width="800" height="600" fill="url(#g)"/>'
      +'<rect x="1" y="1" width="798" height="598" fill="none" stroke="#2A2117"/>'
      +'<text x="400" y="278" fill="#C9A45C" font-family="Georgia, serif" font-size="54" text-anchor="middle"><tspan font-weight="500">4</tspan>orth</text>'
      +'<text x="400" y="330" fill="#EDE6D8" font-family="monospace" font-size="20" letter-spacing="3" text-anchor="middle" opacity="0.6">'+esc(label).toUpperCase()+'</text>'
      +'</svg>';
    return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
  }
  function wire(img){
    if(img.__fbwired) return; img.__fbwired=1;
    function fb(){ if(img.__fb) return; img.__fb=1; img.src=ph(img.getAttribute("alt")||"4orth Space"); }
    img.addEventListener("error",fb);
    if(img.complete && img.naturalWidth===0 && img.getAttribute("src")) fb();
  }
  function scan(){ var l=document.querySelectorAll("img"); for(var i=0;i<l.length;i++) wire(l[i]); }
  scan();
  setTimeout(scan,400);
  window.addEventListener("load",scan);
  // final safety net: any image still with no dimensions (blocked or stalled) gets the placeholder
  setTimeout(function(){
    document.querySelectorAll("img").forEach(function(img){
      if(!img.__fb && img.getAttribute("src") && img.naturalWidth===0 && img.src.indexOf("data:")!==0){ img.__fb=1; img.src=ph(img.getAttribute("alt")||"4orth Space"); }
    });
  },4000);
})();
