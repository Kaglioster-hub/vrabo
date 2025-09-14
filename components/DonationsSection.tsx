"use client";

import React from "react";
import Donations from "@/components/Donations";

export default function DonationsSection() {
  return (
    <section className="py-12 px-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sostieni VRABO</h2>
      <Donations />
    </section>
  );
}
