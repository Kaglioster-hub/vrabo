// pages/api/search.js
const COMM = { bnb:0.07, flight:0.09, car:0.07, transfer:0.08, finance:0.4, trading:0.3, tickets:0.15, connectivity:0.2, insurance:0.25, software:0.35, energy:0.2 };
const DEF_CUR = "EUR", IMG_FALLBACK = "https://picsum.photos/seed/vrabo/600/360";
const HOTELLOOK = "https://engine.hotellook.com/api/v2/cache.json", FLIGHTS = "https://api.travelpayouts.com/v1/prices/cheap", FX = "https://api.exchangerate.host/latest";
const cache = new Map(), clamp = (n,a,b)=>Math.min(b,Math.max(a,n));
const safe = (s,d="")=>typeof s==="string"&&s.trim()?s.trim():d;
const num = v=>Number(String(v??"").replace(/[^\d.,-]/g,"").replace(",","."))||null;
const uniq = (arr,k)=>{const s=new Set();return arr.filter(x=>!s.has(k(x))&&s.add(k(x)))}; 
async function fetchR(u,o={},r=3,d=500){try{const res=await fetch(u,o);if(!res.ok)throw 0;return res}catch(e){if(r<=0)throw e;await new Promise(x=>setTimeout(x,d));return fetchR(u,o,r-1,d*2)}}
function cGet(k){const h=cache.get(k);if(!h||Date.now()>h.exp)return null;return h.val}
function cSet(k,v,t=6e4){cache.set(k,{val:v,exp:Date.now()+t})}
async function fx(v,f="EUR",t=DEF_CUR){if(!v||f===t)return{val:v,cur:t};let rate=cGet(`fx:${f}->${t}`);if(!rate){try{const r=await fetchR(`${FX}?base=${f}&symbols=${t}`);rate=(await r.json()).rates?.[t]||1;cSet(`fx:${f}->${t}`,rate,36e5)}catch{rate=1}}return{val:Math.round(v*rate*100)/100,cur:t}}
function aff(t){const b=`NEXT_PUBLIC_AFF_ID_${t.toUpperCase()}`;for(let i=0;i<6;i++){const k=i?`${b}${i+1}`:b;if(process.env[k]&&!process.env[k].includes("PLACEHOLDER"))return process.env[k]}return"#"}
function norm({title,price,priceVal,location,image,url,tags=[],pop=0.6,desc="",rating=null,prov="generic",type="bnb"}){let img=safe(image,IMG_FALLBACK);if(!/^https?:/i.test(img))img=IMG_FALLBACK;let href=safe(url,"#");if(href!=="#"&&!/^https?:/i.test(href))href="#";return{title:safe(title,"Offerta"),description:desc,rating:typeof rating==="number"?rating:null,price:safe(price,"—"),_priceVal:typeof priceVal==="number"?priceVal:null,location:safe(location,"—"),image:img,url:href,provider:prov,tags:Array.isArray(tags)?tags:[],popularity:pop,commissionEst:priceVal?priceVal*(COMM[type]||.05):null}}
function score(x,t,p,ctx={}){let a=1;if(x.tags?.includes(p?.style))a+=.25;if(t==="trading"&&x.tags?.includes(p?.risk))a+=.25;if(x._priceVal>0){const rel=clamp((+p?.budget||150)/x._priceVal,.5,1.5);a*=rel}if(ctx.hasDates)a*=1.05;if(x.rating)a*=.8+(x.rating/5)*.4;return (COMM[t]||.05)*100*a*((x.popularity||1)*.15+.925)}
function mock(t,q="Roma",n=6){return Array.from({length:n},(_,i)=>{const p=Math.round(40+Math.random()*200);return norm({type:t,title:`${t} ${q} #${i+1}`,price:`${p} EUR`,priceVal:p,location:q,image:`https://picsum.photos/seed/${t}${i}/600/360`,pop:.5+Math.random()*.5,tags:["smart"],prov:"MockVRABO",url:aff(t)})})}
async function hotels({query,s,e,c}){const out=[];try{const u=new URL(HOTELLOOK);u.searchParams.set("location",safe(query,"Rome"));u.searchParams.set("currency","EUR");u.searchParams.set("limit","20");if(s)u.searchParams.set("checkIn",s);if(e)u.searchParams.set("checkOut",e);if(process.env.TRAVELPAYOUTS_KEY)u.searchParams.set("token",process.env.TRAVELPAYOUTS_KEY);const r=await fetchR(u.toString());for(const [i,h] of (await r.json()).entries()){const p=num(h.priceFrom);const {val,cur}=await fx(p,"EUR",c);out.push(norm({type:"bnb",title:h.name||`Alloggio ${query}`,price:`${val} ${cur}`,priceVal:val,location:h.location?.name||query,image:h.photo||`https://picsum.photos/seed/h${i}/600/360`,pop:.65+Math.random()*.35,rating:h.stars||null,desc:h.address||"",prov:"Hotellook",url:aff("HOTEL")}))}}catch{out.push(...mock("bnb",query,6))}return out}
async function flights({query,c}){const out=[];try{const o=query.slice(0,3).toUpperCase();const u=new URL(FLIGHTS);u.searchParams.set("origin",o);u.searchParams.set("token",process.env.TRAVELPAYOUTS_KEY||"");u.searchParams.set("currency","EUR");const d=(await(await fetchR(u.toString())).json()).data||{};Object.keys(d).forEach(dest=>Object.values(d[dest]).forEach(f=>{const p=num(f.price);out.push(norm({type:"flight",title:`${o}→${dest}`,price:`${p} EUR`,priceVal:p,location:`${o}→${dest}`,image:`https://picsum.photos/seed/f${dest}/600/360`,pop:.7+Math.random()*.3,prov:"Travelpayouts",url:aff("FLIGHT")}))}));out.push(norm({type:"flight",title:`${o}→ANY Kiwi`,price:"—",location:query,image:`https://picsum.photos/seed/kiwi/600/360`,prov:"Kiwi",url:aff("FLIGHT2")}))}catch{out.push(...mock("flight",query,6))}return out}
const cars=({p,c})=>["Aeroporto","Centro","Stazione"].map((pl,i)=>{const pr=Math.max(12,Math.round((+p?.budget||25)*(0.85+i*0.22)));return norm({type:"car",title:`Auto ${pl}`,price:`${pr} ${c}/g`,priceVal:pr,location:pl,image:`https://picsum.photos/seed/car${i}/600/360`,prov:"RentalCars",url:aff("CAR")})});
const transfers=q=>[norm({type:"transfer",title:"Transfer Aeroporto",price:"15€",priceVal:15,location:q||"Aeroporto",image:"/transfer.png",prov:"Transfers",url:aff("TRANSFER")})];
const finance=_=>[norm({type:"finance",title:"N26 Standard",price:"0 €/mese",priceVal:0,location:"Online",image:"/n26.png",pop:.85,prov:"N26",url:aff("FINANCE")}),norm({type:"finance",title:"Revolut Premium",price:"7,99 €/mese",priceVal:7.99,location:"Globale",image:"/revolut.png",pop:.9,prov:"Revolut",url:aff("FINANCE")})];
const trading=_=>[norm({type:"trading",title:"eToro",price:"0% azioni",location:"Multi-asset",image:"/etoro.png",pop:.9,prov:"eToro",url:aff("TRADING")}),norm({type:"trading",title:"Binance",price:"Fee basse",location:"Exchange",image:"/binance.png",pop:.95,prov:"Binance",url:aff("TRADING")})];
const tickets=q=>[norm({type:"tickets",title:"Musei",price:"5€",priceVal:5,location:q||"Roma",image:"/tickets.png",prov:"Tiqets",url:aff("TICKETS")}),norm({type:"tickets",title:"Concerti",price:"20€",priceVal:20,location:q||"Milano",image:"/tickets2.png",prov:"TicketNetwork",url:aff("TICKETS2")})];
const connectivity=_=>[norm({type:"connectivity",title:"Yesim eSIM",location:"Globale",image:"/esim.png",prov:"Yesim",url:aff("CONNECTIVITY1")}),norm({type:"connectivity",title:"Airalo eSIM",location:"Globale",image:"/airalo.png",prov:"Airalo",url:aff("CONNECTIVITY2")})];
const insurance=_=>[norm({type:"insurance",title:"EKTA Insurance",price:"20€",priceVal:20,location:"Globale",image:"/insurance.png",prov:"EKTA",url:aff("INSURANCE")})];
const software=_=>[norm({type:"software",title:"NordVPN",price:"3€/mese",priceVal:3,location:"Globale",image:"/vpn.png",prov:"NordVPN",url:aff("SOFTWARE")})];
const energy=_=>[norm({type:"energy",title:"Energia Verde",price:"30€/mese",priceVal:30,location:"Italia",image:"/energy.png",prov:"EnergyCo",url:aff("ENERGY")})];

export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  const {type="bnb",query="",startDate="",endDate="",profile={},limit=12,currency=DEF_CUR}=req.body;
  let results=[]; 
  switch(type){
    case"bnb":results=await hotels({query,s:startDate,e:endDate,c:currency});break;
    case"flight":results=await flights({query,c:currency});break;
    case"car":results=cars({p:profile,c:currency});break;
    case"transfer":results=transfers(query);break;
    case"finance":results=finance();break;
    case"trading":results=trading();break;
    case"tickets":results=tickets(query);break;
    case"connectivity":results=connectivity();break;
    case"insurance":results=insurance();break;
    case"software":results=software();break;
    case"energy":results=energy();break;
    default:results=mock(type,query,8);break;
  }
  const dedup=uniq(results,x=>`${x.title}__${x.url}`);
  const enriched=dedup.map(x=>({...x,score:score(x,type,profile,{hasDates:!!(startDate&&endDate)})}));
  enriched.sort((a,b)=>(b.score||0)-(a.score||0));
  res.status(200).json({results:enriched.slice(0,clamp(limit,1,50))});
}
