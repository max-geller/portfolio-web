"use client";
import TravelHero from "./_components/TravelHero";
import StillsHero from "./_components/StillsHero";
import PrintsHero from "./_components/PrintsHero";
import AerialsHero from "./_components/AerialsHero";

export default function Home() {
  return (
    <main>
      <TravelHero />
      <StillsHero />
      <PrintsHero />
      <AerialsHero />
    </main>
  );
}
