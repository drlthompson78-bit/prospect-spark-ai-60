import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import SignatureRail from "@/components/home/SignatureRail";
import CollectionGrid from "@/components/home/CollectionGrid";
import Galerij from "@/components/home/Galerij";
import AtelierStory from "@/components/home/AtelierStory";
import Werkwijze from "@/components/home/Werkwijze";
import Smaakbelofte from "@/components/home/Smaakbelofte";
import CtaBand from "@/components/home/CtaBand";

const HomePage = () => (
  <>
    <Hero />
    <Marquee />
    <SignatureRail />
    <CollectionGrid />
    <Galerij />
    <AtelierStory />
    <Werkwijze />
    <Smaakbelofte />
    <Marquee angle={2} reverse />
    <CtaBand />
  </>
);

export default HomePage;
