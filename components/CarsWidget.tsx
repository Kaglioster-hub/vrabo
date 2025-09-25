"use client";
import SearchHubUltra from "./SearchHubUltra";
export default function CarsWidget({mode}:{mode:"flights"|"hotels"|"cars"|"experiences"}){ return <SearchHubUltra defaultMode={mode} />; }
