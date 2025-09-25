export type Service = {
  id: string;
  name: string;
  category: "crypto" | "telefonia" | "finanza" | "assicurazioni";
  keywords: string[];
};

export const SERVICES: Service[] = [
  { id:"binance",  name:"Binance",    category:"crypto",       keywords:["binance","bnb","exchange","crypto"] },
  { id:"kucoin",   name:"KuCoin",     category:"crypto",       keywords:["kucoin","kcs","exchange","crypto"] },
  { id:"bybit",    name:"Bybit",      category:"crypto",       keywords:["bybit","derivatives","crypto"] },
  { id:"okx",      name:"OKX",        category:"crypto",       keywords:["okx","okb","exchange","crypto"] },
  { id:"coinbase", name:"Coinbase",   category:"crypto",       keywords:["coinbase","cb","exchange"] },

  { id:"etoro",    name:"eToro",      category:"finanza",      keywords:["etoro","broker","azioni","cfd"] },
  { id:"revolut",  name:"Revolut",    category:"finanza",      keywords:["revolut","conti","carta","fintech"] },
  { id:"wise",     name:"Wise",       category:"finanza",      keywords:["wise","transferwise","iban","multivaluta"] },
  { id:"n26",      name:"N26",        category:"finanza",      keywords:["n26","banca","carta","fintech"] },

  { id:"vodafone", name:"Vodafone eSIM", category:"telefonia", keywords:["vodafone","mobile","esim"] },
  { id:"airalo",   name:"Airalo eSIM",   category:"telefonia", keywords:["airalo","esim","travel"] },
  { id:"holafly",  name:"Holafly eSIM",  category:"telefonia", keywords:["holafly","esim","roaming"] },
  { id:"nomad",    name:"Nomad eSIM",    category:"telefonia", keywords:["nomad","esim","travel"] },

  { id:"assicurazione", name:"Assicurazione Viaggio", category:"assicurazioni", keywords:["assicurazione","viaggio","travel insurance"] },
];
