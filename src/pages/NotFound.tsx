import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="mx-auto flex min-h-[70dvh] max-w-[760px] flex-col items-start justify-center px-5 pt-20 md:px-8">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">404</p>
    <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
      Deze pagina is op
    </h1>
    <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-muted-foreground">
      Net als een goede taart aan het einde van het feest. De collectie staat gelukkig nog vol.
    </p>
    <Button asChild size="lg" className="mt-8">
      <Link to="/collectie">Bekijk de collectie</Link>
    </Button>
  </div>
);

export default NotFound;
