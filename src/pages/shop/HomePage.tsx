import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import SignatureRail from "@/components/home/SignatureRail";
import CollectionGrid from "@/components/home/CollectionGrid";
import AtelierStory from "@/components/home/AtelierStory";
import Werkwijze from "@/components/home/Werkwijze";
import Reviews from "@/components/home/Reviews";
import CtaBand from "@/components/home/CtaBand";

const HomePage = () => (
  <>
    <Hero />
    <Marquee />
    <SignatureRail />
    <CollectionGrid />
    <AtelierStory />
    <Werkwijze />
    <Reviews />
    <Marquee angle={2} reverse />
    <CtaBand />
  </>
);

export default HomePage;
