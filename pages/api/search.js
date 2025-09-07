// pages/api/search.js
import { nanoid } from "nanoid";

// ====================== CONFIG ======================
const COMM = {
  bnb: 0.07, flight: 0.09, car: 0.07, transfer: 0.08,
  finance: 0.4, trading: 0.3, tickets: 0.15,
  connectivity: 0.2, insurance: 0.25, software: 0.35, energy: 0.2
};
const DEF_CUR = "EUR";
const IMG_FALLBACK = "https://picsum.photos/seed/vrabo/600/360";
const HOTELLOOK = "https://engine.hotellook.com/api/v2/cache.json";
const FLIGHTS_V2 = "https://api.travelpayouts.com/v2/prices/latest";
const FX = "https://api.exchangerate.host/latest";

// ====================== UTILS ======================
const cache = new Map();
const clamp = (n,a,b)=>Math.min(b,Math.max(a,n));
const safe = (s,d="")=>typeof s==="string"&&s.trim()?s.trim():d;
const num = v=>Number(String(v??"").replace(/[^\d.,-]/g,"").replace(",","."))||null;
const uniq = (arr,k)=>{const s=new Set();return arr.filter(x=>!s.has(k(x))&&s.add(k(x)))};

function cGet(k){const h=cache.get(k);if(!h||Date.now()>h.exp)return null;return h.val}
function cSet(k,v,t=6e4){cache.set(k,{val:v,exp:Date.now()+t})}

async function fetchR(u,o={},r=3,d=500,timeout=6000){
  const ctrl = new AbortController();
  const id = setTimeout(()=>ctrl.abort(), timeout);
  try{
    const res = await fetch(u,{...o,signal:ctrl.signal});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  }catch(e){
    if(r<=0) throw e;
    await new Promise(x=>setTimeout(x,d));
    return fetchR(u,o,r-1,d*2,timeout*1.5);
  }finally{ clearTimeout(id); }
}

async function fx(v,f="EUR",t=DEF_CUR){
  if(!v||f===t) return {val:v,cur:t};
  let rate=cGet(`fx:${f}->${t}`);
  if(!rate){
    try{
      const r=await fetchR(`${FX}?base=${f}&symbols=${t}`);
      rate=(await r.json()).rates?.[t]||1;
      cSet(`fx:${f}->${t}`,rate,36e5);
    }catch{rate=1}
  }
  return {val:Math.round(v*rate*100)/100,cur:t};
}

// 🔗 pesca il primo link valido tra NEXT_PUBLIC_AFF_ID_xxx*
function aff(type){
  const base=`NEXT_PUBLIC_AFF_ID_${type.toUpperCase()}`;
  const candidates = Object.keys(process.env)
    .filter(k => k.startsWith(base))
    .map(k => process.env[k])
    .filter(v => v && !v.toLowerCase().includes("placeholder"));
  return candidates.length > 0 ? candidates[0] : "#";
}

function norm({
  title,price,priceVal,location,image,url,tags=[],pop=0.6,
  desc="",rating=null,prov="generic",type="bnb"
}){
  let img=safe(image,IMG_FALLBACK);
  if(!/^https?:/i.test(img)) img=IMG_FALLBACK;
  let href=safe(url,"#");
  if(href!=="#"&&!/^https?:/i.test(href)) href="#";

  return {
    id: nanoid(8),
    title: safe(title,"Offerta"),
    description: desc,
    rating: typeof rating==="number"?rating:null,
    price: safe(price,"—"),
    _priceVal: typeof priceVal==="number"?priceVal:null,
    location: safe(location,"—"),
    image: img,
    url: href,
    provider: prov,
    tags: Array.isArray(tags)?tags:[],
    popularity: pop,
    commissionEst: priceVal?priceVal*(COMM[type]||.05):null
  };
}

function score(x,t,p,ctx={}) {
  let a=1;
  if(x.tags?.includes(p?.style)) a+=.25;
  if(t==="trading"&&x.tags?.includes(p?.risk)) a+=.25;
  if(x._priceVal>0){
    const rel=clamp((+p?.budget||150)/x._priceVal,.5,1.5);
    a*=rel;
  }
  if(ctx.hasDates) a*=1.05;
  if(x.rating) a*=.8+(x.rating/5)*.4;
  return (COMM[t]||.05)*100*a*((x.popularity||1)*.15+.925);
}

// ====================== MOCK ======================
function mock(t,q="Roma",n=6){
  return Array.from({length:n},(_,i)=>{
    const p=Math.round(40+Math.random()*200);
    return norm({
      type:t,title:`${t} ${q} #${i+1}`,
      price:`${p} EUR`,priceVal:p,location:q,
      image:`https://picsum.photos/seed/${t}${i}/600/360`,
      pop:.5+Math.random()*.5,
      tags:["mock","lastMinute"],
      prov:"MockVRABO",url:aff(t)
    });
  });
}

// ====================== PROVIDERS ======================
function formatDate(d){ return d.toISOString().split("T")[0]; }

async function hotels({query,s,e,c}){
  const out=[];
  try{
    const u=new URL(HOTELLOOK);
    u.searchParams.set("location",safe(query,"Rome"));
    u.searchParams.set("currency","EUR");
    u.searchParams.set("limit","20");

    // Date obbligatorie: fallback +2/+5 giorni
    const today=new Date();
    const checkIn=s||formatDate(new Date(today.getTime()+2*86400000));
    const checkOut=e||formatDate(new Date(today.getTime()+5*86400000));
    u.searchParams.set("checkIn",checkIn);
    u.searchParams.set("checkOut",checkOut);

    if(process.env.TRAVELPAYOUTS_KEY)
      u.searchParams.set("token",process.env.TRAVELPAYOUTS_KEY);

    const r=await fetchR(u.toString());
    const data=await r.json();
    if(!Array.isArray(data)) throw new Error("No hotel data");

    for(const [i,h] of data.entries()){
      const p=num(h.priceFrom);
      const {val,cur}=await fx(p,"EUR",c);
      out.push(norm({
        type:"bnb",
        title:h.name||`Alloggio ${query}`,
        price: val ? `${val} ${cur}` : "—",
        priceVal: val,
        location:h.location?.name||query,
        image:h.photo||`https://picsum.photos/seed/h${i}/600/360`,
        pop:.65+Math.random()*.35,
        rating:h.stars||null,
        desc:h.address||"",
        prov:"Hotellook",
        url: aff("HOTEL")
      }));
    }
    console.info(`🏨 Hotellook: ${out.length} risultati reali`);
  }catch(e){
    console.warn("⚠️ Hotel fallback:",e.message);
    out.push(...mock("bnb",query,6));
  }
  return out;
}

async function flights({query,c}){
  const out=[];
  try{
    if (!process.env.TRAVELPAYOUTS_KEY) throw new Error("Missing Travelpayouts key");
    const o=query.slice(0,3).toUpperCase();

    const u=new URL(FLIGHTS_V2);
    u.searchParams.set("currency","EUR");
    u.searchParams.set("origin",o);
    u.searchParams.set("page","1");
    u.searchParams.set("limit","10");
    u.searchParams.set("token",process.env.TRAVELPAYOUTS_KEY);

    const r=await fetchR(u.toString());
    const raw=await r.json();
    const data=raw?.data||{};

    Object.keys(data).forEach(dest=>{
      data[dest].forEach(f=>{
        const p=num(f.value);
        const {val,cur}={val:p,cur:"EUR"};
        out.push(norm({
          type:"flight",
          title:`${f.origin}→${f.destination}`,
          price: val ? `${val} ${cur}` : "—",
          priceVal: val,
          location:`${f.origin}→${f.destination}`,
          image:`https://picsum.photos/seed/f${dest}/600/360`,
          pop:.7+Math.random()*.3,
          prov:"Aviasales",
          url: aff("FLIGHT")
        }));
      });
    });

    // extra provider backup
    out.push(norm({
      type:"flight",title:`${o}→ANY Kiwi`,
      price:"—",location:query,
      image:`https://picsum.photos/seed/kiwi/600/360`,
      prov:"Kiwi",url:aff("FLIGHT2")
    }));

    console.info(`✈️ Flights: ${out.length} risultati reali`);
  }catch(e){
    console.warn("⚠️ Flights fallback:",e.message);
    out.push(...mock("flight",query,6));
  }
  return out;
}

// altri provider invariati…
const cars=({p,c})=>["Aeroporto","Centro","Stazione"].map((pl,i)=>{
  const pr=Math.max(12,Math.round((+p?.budget||25)*(0.85+i*0.22)));
  return norm({
    type:"car",title:`Auto ${pl}`,
    price:`${pr} ${c}/g`,priceVal:pr,
    location:pl,image:`https://picsum.photos/seed/car${i}/600/360`,
    prov:"RentalCars",url:aff("CAR")
  });
});
const transfers=q=>[norm({
  type:"transfer",title:"Transfer Aeroporto",price:"15€",priceVal:15,
  location:q||"Aeroporto",image:"/transfer.png",
  prov:"Transfers",url:aff("TRANSFER")
})];

// ====================== HANDLER ======================
export default async function handler(req,res){
  const t0=Date.now();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const {type="bnb",query="",startDate="",endDate="",profile={},limit=12,currency=DEF_CUR}=req.body;
  let results=[];

  try{
    switch(type){
      case"bnb":results=await hotels({query,s:startDate,e:endDate,c:currency});break;
      case"flight":results=await flights({query,c:currency});break;
      case"car":results=cars({p:profile,c:currency});break;
      case"transfer":results=transfers(query);break;
      default:results=mock(type,query,8);break;
    }

    const dedup=uniq(results,x=>`${x.title}__${x.url}`);
    const enriched=dedup.map(x=>({...x,score:score(x,type,profile,{hasDates:!!(startDate&&endDate)})}));
    enriched.sort((a,b)=>(b.score||0)-(a.score||0));

    const out=enriched.slice(0,clamp(limit,1,50));

    res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate");
    console.info(`✅ [API/search] ${type} "${query}" → ${out.length} risultati in ${Date.now()-t0}ms`);
    return res.status(200).json({results:out});
  }catch(err){
    console.error("❌ API/search error",err);
    return res.status(500).json({error:"Internal server error"});
  }
}
