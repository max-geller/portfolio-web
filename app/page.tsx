"use client";
import TravelHero from "./_components/TravelHero";
import StillsHero from "./_components/StillsHero";
import PrintsHero from "./_components/PrintsHero";
import AerialsHero from "./_components/AerialsHero";
import SubscribeHero from "./_components/SubscribeHero";
export default function Home() {
  return (
    <main>
      <StillsHero />
      <TravelHero />
      <PrintsHero />
      <AerialsHero />
      <SubscribeHero />
    </main>
  );
}
