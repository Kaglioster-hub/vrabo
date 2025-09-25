"use client";
import {useState} from "react";

export default function Brand({size=28}:{size?:number}){
  const [src,setSrc] = useState("/logo.png");
  return (
    <img
      src={src}
      alt="VRABO"
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      onError={()=>setSrc("/brand.svg")}
      style={{display:"block"}}
    />
  );
}
