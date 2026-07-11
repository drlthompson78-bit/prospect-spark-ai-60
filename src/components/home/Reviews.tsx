import Reveal from "@/components/shop/Reveal";

const reviews = [
  {
    quote:
      "De bruidstaart was mooier dan we durfden dromen. Gasten praten er nog steeds over.",
    name: "Sanne & Jort",
    role: "Bruidspaar, juni 2026",
  },
  {
    quote: "De 3D-dinotaart maakte het feest. En hij smaakte net zo goed als hij eruitzag.",
    name: "Marieke van Dijk",
    role: "Moeder van Daan (5)",
  },
  {
    quote: "Al jaren onze vaste bakker voor jubilea. Altijd op tijd, altijd indrukwekkend.",
    name: "R. Bakker",
    role: "Officemanager, Van Leeuwen Groep",
  },
];

const Reviews = () => (
  <section className="border-t border-border py-24 md:py-32">
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[6fr_5fr] md:gap-16 md:px-8">
      <Reveal className="flex flex-col justify-center">
        <blockquote>
          <p className="font-display text-2xl leading-relaxed text-foreground md:text-4xl">
            &ldquo;{reviews[0].quote}&rdquo;
          </p>
          <footer className="mt-6 text-sm text-muted-foreground">
            {reviews[0].name} &middot; {reviews[0].role}
          </footer>
        </blockquote>
      </Reveal>

      <div className="flex flex-col justify-center gap-10">
        {reviews.slice(1).map((review, i) => (
          <Reveal key={review.name} delay={0.1 + i * 0.08}>
            <blockquote className="border-l-2 border-border pl-6">
              <p className="text-base leading-relaxed text-foreground/90">
                &ldquo;{review.quote}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted-foreground">
                {review.name} &middot; {review.role}
              </footer>
            </blockquote>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Reviews;
