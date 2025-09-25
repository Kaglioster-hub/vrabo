"use client";
import SearchHubUltra from "./SearchHubUltra";
export default function HotelsWidget({mode}:{mode:"flights"|"hotels"|"cars"|"experiences"}){ return <SearchHubUltra defaultMode={mode} />; }
