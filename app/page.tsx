"use client";
import TravelHero from "./_components/hero/TravelHero";
import StillsHero from "./_components/hero/StillsHero";
import PrintsHero from "./_components/hero/PrintsHero";
import AerialsHero from "./_components/hero/AerialsHero";
import SubscribeHero from "./_components/forms/SubscribeHero";
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
