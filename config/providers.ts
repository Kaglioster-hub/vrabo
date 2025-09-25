export type Provider = {
  key: string;               // es. AIRALO (usato per abbinarci i coupon)
  name: string;
  site: string;              // base URL partner
  logo: string;              // URL o /public/*
  desc?: string;
  referralParam?: string;    // es. "ref", "referral", "afid"...
  extraParams?: Record<string,string>;
};

export const TELCO_PROVIDERS: Provider[] = [
  { key:"AIRALO",  name:"Airalo eSIM",  site:"https://www.airalo.com/",   logo:"https://assets.airalo.com/images/favicon-96x96.png", desc:"eSIM globali low cost", referralParam:"ref" },
  { key:"HOLAFLY", name:"Holafly eSIM", site:"https://holafly.com/",      logo:"https://holafly.com/wp-content/uploads/fbrfg/favicon-32x32.png", desc:"eSIM illimitate", referralParam:"ref" },
  { key:"UBIGI",   name:"Ubigi eSIM",   site:"https://www.ubigi.com/",    logo:"https://www.ubigi.com/wp-content/uploads/2020/02/favicon-32x32.png", desc:"plan multi-paese" },
  { key:"NOMAD",   name:"Nomad eSIM",   site:"https://www.getnomad.app/", logo:"https://www.getnomad.app/favicon-32x32.png", desc:"app intuitiva" },
  { key:"MAYA",    name:"Maya Mobile",  site:"https://www.mayamobile.com/", logo:"https://www.mayamobile.com/favicon-32x32.png", desc:"roaming trasparente" }
];

export const FINANCE_PROVIDERS: Provider[] = [
  { key:"REVOLUT", name:"Revolut", site:"https://www.revolut.com/", logo:"https://www.revolut.com/favicon-32x32.png", desc:"conto globale", referralParam:"referral" },
  { key:"WISE",    name:"Wise",    site:"https://wise.com/",        logo:"https://wise.com/public-resources/assets/favicon.png", desc:"bonifici internazionali" },
  { key:"N26",     name:"N26",     site:"https://n26.com/",         logo:"https://n26.com/favicon-32x32.png", desc:"mobile banking" },
  { key:"MONESE",  name:"Monese",  site:"https://www.monese.com/",  logo:"https://www.monese.com/favicon-32x32.png", desc:"conto in minuti" },
  { key:"CURVE",   name:"Curve",   site:"https://www.curve.com/",   logo:"https://www.curve.com/favicon-32x32.png", desc:"tutte le carte in una" }
];
