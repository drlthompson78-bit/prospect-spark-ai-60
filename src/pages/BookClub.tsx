import "./bookclub.css";

type Pick = {
  title: string;
  author: string;
  genre: string;
  jacket: string;
};

const monthlyPicks: Pick[] = [
  { title: "The Glass Orchard", author: "June Calloway", genre: "Literary fiction", jacket: "avk-jacket-moss" },
  { title: "Do Not Wake the Bees", author: "R. M. Ostrander", genre: "Thriller", jacket: "avk-jacket-night" },
  { title: "An Honest Map of Us", author: "Priya Venn", genre: "Romance", jacket: "avk-jacket-clay" },
  { title: "Salt for the Sea Witch", author: "Ilsa Marchetti", genre: "Fantasy", jacket: "avk-jacket-plum" },
  { title: "The Last Light on Vessel Street", author: "Theo Abara", genre: "Historical", jacket: "avk-jacket-sea" },
];

const faqs = [
  {
    q: "How does the club work?",
    a: "On the first of every month we announce a fresh shelf of new releases. You pick the one that grabs you, and a hardcover edition ships straight to your door with free shipping.",
  },
  {
    q: "Can I skip a month?",
    a: "Yes — skip as many months as you like from your account, no questions asked. You're only charged for months you receive a book.",
  },
  {
    q: "Can I get more than one book?",
    a: "Absolutely. Your membership covers one hardcover per month, and you can add up to two extra picks at a reduced member price.",
  },
  {
    q: "What kind of books do you choose?",
    a: "Brand-new releases across literary fiction, thrillers, romance, fantasy, historical fiction and narrative nonfiction — chosen by readers, not algorithms.",
  },
  {
    q: "How do I cancel?",
    a: "Any time, in two clicks, from your account settings. Your last book still ships if it's already on its way.",
  },
];

function Book({ pick, tilt }: { pick: Pick; tilt?: number }) {
  return (
    <div
      className={`avk-book ${pick.jacket}`}
      style={tilt !== undefined ? ({ "--tilt": `${tilt}deg` } as React.CSSProperties) : undefined}
      aria-label={`${pick.title} by ${pick.author}`}
    >
      <div className="avk-book-inner">
        <span className="avk-book-title">{pick.title}</span>
        <span className="avk-book-mark" aria-hidden="true">
          ❦
        </span>
        <span className="avk-book-author">{pick.author}</span>
      </div>
    </div>
  );
}

export default function BookClub() {
  return (
    <div className="avk">
      <header className="avk-header">
        <div className="avk-header-in">
          <a href="#top" className="avk-wordmark">
            <span className="avk-wordmark-badge" aria-hidden="true">
              ❦
            </span>
            Aardvark Book Club
          </a>
          <nav className="avk-nav" aria-label="Main">
            <a href="#how">How it works</a>
            <a href="#picks">This month</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="#pricing" className="avk-btn avk-btn-primary">
            Join the club
          </a>
        </div>
      </header>

      <main id="top">
        <section className="avk-hero">
          <div className="avk-wrap avk-hero-in">
            <div>
              <p className="avk-eyebrow">A monthly hardcover club</p>
              <h1>
                New books worth <em>staying up for</em>
              </h1>
              <p className="avk-hero-sub">
                Every month, pick a brand-new hardcover from our shortlist of the season's best releases —
                delivered to your door before the hype gets there.
              </p>
              <div className="avk-hero-cta">
                <a href="#pricing" className="avk-btn avk-btn-primary">
                  Start reading
                </a>
                <a href="#how" className="avk-btn avk-btn-ghost">
                  How it works
                </a>
              </div>
              <p className="avk-hero-note">Free shipping · Skip any month · Cancel anytime</p>
            </div>
            <div className="avk-shelf" aria-hidden="true">
              <Book pick={monthlyPicks[3]} tilt={-8} />
              <Book pick={monthlyPicks[1]} tilt={-3} />
              <Book pick={monthlyPicks[0]} tilt={2} />
              <Book pick={monthlyPicks[2]} tilt={7} />
            </div>
          </div>
        </section>

        <div className="avk-ticker" aria-hidden="true">
          <div className="avk-ticker-track">
            {[0, 1].map((n) => (
              <span key={n}>
                <span>Literary fiction</span>
                <span>Thriller</span>
                <span>Romance</span>
                <span>Fantasy</span>
                <span>Historical</span>
                <span>Narrative nonfiction</span>
                <span>Mystery</span>
                <span>Sci-fi</span>
              </span>
            ))}
          </div>
        </div>

        <section id="how" className="avk-section">
          <div className="avk-wrap">
            <div className="avk-section-head">
              <p className="avk-eyebrow">How it works</p>
              <h2>Three steps between you and your next favorite book</h2>
            </div>
            <ol className="avk-steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li className="avk-step">
                <span className="avk-step-num" aria-hidden="true">
                  No. 1
                </span>
                <h3>Browse the monthly shelf</h3>
                <p>
                  On the first of the month we reveal a shortlist of five just-published books, hand-picked
                  across genres.
                </p>
              </li>
              <li className="avk-step">
                <span className="avk-step-num" aria-hidden="true">
                  No. 2
                </span>
                <h3>Pick your hardcover</h3>
                <p>
                  Choose the one calling your name — or add up to two extra picks at member pricing. Nothing
                  tempting? Skip the month for free.
                </p>
              </li>
              <li className="avk-step">
                <span className="avk-step-num" aria-hidden="true">
                  No. 3
                </span>
                <h3>Read it first</h3>
                <p>
                  Your book ships free and lands on your doormat while it's still the new release everyone
                  will be talking about.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section id="picks" className="avk-picks avk-section">
          <div className="avk-wrap">
            <div className="avk-section-head">
              <p className="avk-eyebrow" style={{ color: "var(--avk-foil-soft)" }}>
                This month's shelf
              </p>
              <h2>Five new releases. One is yours.</h2>
              <p>A taste of the kind of shortlist members choose from every month.</p>
            </div>
            <div className="avk-picks-grid">
              {monthlyPicks.map((pick) => (
                <div className="avk-pick" key={pick.title}>
                  <Book pick={pick} />
                  <span className="avk-pick-genre">{pick.genre}</span>
                  <p className="avk-pick-name">{pick.title}</p>
                  <p className="avk-pick-author">{pick.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="avk-section">
          <div className="avk-wrap avk-anatomy">
            <Book pick={monthlyPicks[0]} />
            <div>
              <div className="avk-section-head" style={{ marginBottom: "2rem" }}>
                <p className="avk-eyebrow">The editions</p>
                <h2>Hardcovers made to be kept</h2>
              </div>
              <ul className="avk-features">
                <li className="avk-feature">
                  <span className="avk-feature-icon" aria-hidden="true">
                    ✦
                  </span>
                  <div>
                    <h3>Foil-stamped spines</h3>
                    <p>Under every dust jacket hides a stamped spine that turns your shelf into a collection.</p>
                  </div>
                </li>
                <li className="avk-feature">
                  <span className="avk-feature-icon" aria-hidden="true">
                    ❦
                  </span>
                  <div>
                    <h3>Matte dust jackets</h3>
                    <p>Soft-touch jackets over sturdy boards — books that feel as good as they read.</p>
                  </div>
                </li>
                <li className="avk-feature">
                  <span className="avk-feature-icon" aria-hidden="true">
                    ✉
                  </span>
                  <div>
                    <h3>Shipped with care</h3>
                    <p>Snug, recyclable packaging so every edition arrives shelf-ready, corners intact.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing" className="avk-section" style={{ background: "var(--avk-paper-soft)" }}>
          <div className="avk-wrap">
            <div className="avk-section-head" style={{ textAlign: "center", margin: "0 auto 3rem" }}>
              <p className="avk-eyebrow">Membership</p>
              <h2>One plan. Zero fine print.</h2>
            </div>
            <div className="avk-price-card">
              <p className="avk-price">
                <sup>$</sup>17.99
              </p>
              <p className="avk-price-per">per month, pause or cancel anytime</p>
              <ul className="avk-price-list">
                <li>One new-release hardcover every month</li>
                <li>Free shipping, always</li>
                <li>Add up to 2 extra picks for $9.99 each</li>
                <li>Skip any month at no cost</li>
                <li>Exclusive member editions</li>
              </ul>
              <a href="#faq" className="avk-btn avk-btn-primary">
                Become a member
              </a>
            </div>
          </div>
        </section>

        <section className="avk-section">
          <div className="avk-wrap">
            <div className="avk-section-head">
              <p className="avk-eyebrow">From the club</p>
              <h2>Readers first, always</h2>
            </div>
            <div className="avk-quotes">
              <figure className="avk-quote">
                <span className="avk-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </span>
                <blockquote>
                  "The first of the month is now my favorite day. Choosing my book has become a small ritual."
                </blockquote>
                <figcaption>Maren — member since 2024</figcaption>
              </figure>
              <figure className="avk-quote">
                <span className="avk-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </span>
                <blockquote>
                  "I've discovered three authors I'd never have picked up in a store. The editions are gorgeous."
                </blockquote>
                <figcaption>Devon — member since 2023</figcaption>
              </figure>
              <figure className="avk-quote">
                <span className="avk-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </span>
                <blockquote>
                  "Skipping is genuinely one click, so I never feel locked in. That's why I've stayed."
                </blockquote>
                <figcaption>Sofia — member since 2025</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="faq" className="avk-section">
          <div className="avk-wrap">
            <div className="avk-section-head" style={{ textAlign: "center", margin: "0 auto 3rem" }}>
              <p className="avk-eyebrow">Common questions</p>
              <h2>Everything else you'd like to know</h2>
            </div>
            <div className="avk-faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="avk-cta avk-section">
          <div className="avk-wrap">
            <h2>
              Your next favorite book is <em>already printed</em>
            </h2>
            <p>Join before the first of the month and pick from the newest shelf of releases.</p>
            <a href="#pricing" className="avk-btn">
              Join the club
            </a>
          </div>
        </section>
      </main>

      <footer className="avk-footer">
        <div className="avk-footer-in">
          <span>© {new Date().getFullYear()} Aardvark Book Club — demo clone for design study</span>
          <nav aria-label="Footer">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
