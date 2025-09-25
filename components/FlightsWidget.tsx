"use client";
import SearchHubUltra from "./SearchHubUltra";
export default function FlightsWidget({mode}:{mode:"flights"|"hotels"|"cars"|"experiences"}){ return <SearchHubUltra defaultMode={mode} />; }
