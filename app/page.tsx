"use client";
import TravelHero from "./_components/hero/TravelHero";
import StillsHero from "./_components/hero/StillsHero";
import PrintsHero from "./_components/hero/PrintsHero";
import AerialsHero from "./_components/hero/AerialsHero";
import SubscribeHero from "./_components/forms/SubscribeHero";
import ClientLayout from "./_layout/ClientLayout";

export default function Home() {
  return (
    <ClientLayout>
      <main>
        <StillsHero />
        <TravelHero />
        <PrintsHero />
        <AerialsHero />
        <SubscribeHero />
      </main>
    </ClientLayout>
  );
}
