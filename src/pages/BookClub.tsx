import "./bookclub.css";

const BRAND = "Burrow Book Club";

type Book = {
  title: string;
  author: string;
  kicker: string;
  jacket: string;
  tags: { label: string; tone: string }[];
  desc: string;
};

const books: Book[] = [
  {
    title: "Long Way From Ordinary",
    author: "Gabriela Nunes",
    kicker: "A novel",
    jacket: "bbc-j-plum",
    tags: [
      { label: "Contemporary", tone: "bbc-tag-purple" },
      { label: "Coming of age", tone: "bbc-tag-pink" },
    ],
    desc: "A sharp, tender debut about the year everything changed.",
  },
  {
    title: "Fall For Me",
    author: "Shireen Oduya",
    kicker: "A novel",
    jacket: "bbc-j-pink",
    tags: [
      { label: "Romance", tone: "bbc-tag-pink" },
      { label: "Fantasy", tone: "bbc-tag-blue" },
      { label: "Has a dog", tone: "bbc-tag-orange" },
    ],
    desc: "A stay-up-all-night, spicy romance with a deadly secret.",
  },
  {
    title: "Every Second Version",
    author: "Nadia Messner",
    kicker: "A novel",
    jacket: "bbc-j-coral",
    tags: [
      { label: "Debut", tone: "bbc-tag-cyan" },
      { label: "Magical realism", tone: "bbc-tag-green" },
      { label: "Has a cat", tone: "bbc-tag-purple" },
    ],
    desc: "For fans of messy love stories and second chances.",
  },
  {
    title: "Dreaming of Electric Things",
    author: "Paul Trembley",
    kicker: "A novel",
    jacket: "bbc-j-green",
    tags: [
      { label: "Sci-fi", tone: "bbc-tag-green" },
      { label: "Horror", tone: "bbc-tag-purple" },
      { label: "Satire", tone: "bbc-tag-yellow" },
    ],
    desc: "A darkly funny trip to the edge of what's human.",
  },
  {
    title: "The Quiet House",
    author: "Nadia Barelo",
    kicker: "A novel",
    jacket: "bbc-j-pink",
    tags: [{ label: "Thriller", tone: "bbc-tag-blue" }],
    desc: "A bestselling indie thriller about the woman next door.",
  },
  {
    title: "Salt & the Sea Witch",
    author: "Isla March",
    kicker: "A novel",
    jacket: "bbc-j-teal",
    tags: [
      { label: "Fantasy", tone: "bbc-tag-blue" },
      { label: "Sapphic", tone: "bbc-tag-pink" },
    ],
    desc: "A windswept fantasy of magic, salt water, and revenge.",
  },
];

const steps = [
  {
    tag: "Step #1",
    emoji: "🗓️",
    title: "Explore our books",
    body: "On the first of every month we reveal 6–7 fresh releases. Follow along for hints before they drop.",
  },
  {
    tag: "Step #2",
    emoji: "📦",
    title: "Build your box",
    body: "Pick up to 3 books per box. At least one comes from this month's shortlist — the rest is yours to mix.",
  },
  {
    tag: "Step #3",
    emoji: "🚪",
    title: "Check your doorstep",
    body: "Your box ships free and lands on your doormat — the best excuse to cancel your Friday night plans.",
  },
  {
    tag: "Step #4",
    emoji: "💬",
    title: "Share your reads",
    body: "Tag your haul, swap hot takes, and jump into the in-app club discussions with other members.",
  },
];

const genresA = ["Romance", "Thriller", "Literary fiction", "Fantasy", "Gothic"];
const genresB = ["Historical", "Magical realism", "Sci-fi", "Horror", "And more!"];

const faqs = [
  {
    q: "How much does membership cost?",
    a: "One book a month with free shipping. Add up to two extra picks per box at a reduced member price — no surprise fees, ever.",
  },
  {
    q: "Which countries do you ship to?",
    a: "We currently ship to addresses across the USA and Canada, with free shipping baked into every membership.",
  },
  {
    q: "Can I skip or cancel?",
    a: "Yes. Skip any month for free from your account, and cancel in two clicks whenever you like — no phone call, no fine print.",
  },
  {
    q: "How do I join?",
    a: "Sign up, tell us the genres you love, then choose your first box from the current month's shortlist. That's it.",
  },
];

function Cover({ book }: { book: Book }) {
  return (
    <div className={`bbc-book ${book.jacket}`} aria-label={`${book.title} by ${book.author}`}>
      <span className="bbc-book-kicker">{book.kicker}</span>
      <span className="bbc-book-title">{book.title}</span>
      <span className="bbc-book-author">{book.author}</span>
    </div>
  );
}

export default function BookClub() {
  return (
    <div className="bbc">
      <header className="bbc-header">
        <div className="bbc-header-in">
          <a href="#top" className="bbc-logo">
            <span className="bbc-logo-mark" aria-hidden="true">
              🌱
            </span>
            <span className="bbc-logo-name">Burrow</span>
            <span className="bbc-logo-sub">
              Book
              <br />
              Club
            </span>
          </a>
          <nav className="bbc-nav" aria-label="Main">
            <a className="bbc-navpill" href="#books">
              All Books
            </a>
            <a className="bbc-navpill" href="#app">
              Gifting
            </a>
            <a className="bbc-navpill" href="#faq">
              FAQ
            </a>
            <a className="bbc-btn bbc-btn-orange" href="#join">
              Log-in / Sign-up
              <span className="bbc-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </nav>
          <div className="bbc-social">
            <a href="#top" aria-label="Instagram">
              ⌾
            </a>
            <a href="#top" aria-label="TikTok">
              ♪
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="bbc-hero">
          <div className="bbc-blobs" aria-hidden="true">
            <span className="bbc-blob bbc-blob-1" />
            <span className="bbc-blob bbc-blob-2" />
          </div>
          <div className="bbc-wrap bbc-hero-in">
            <div>
              <h1>Unbox stories worth talking about</h1>
              <p className="bbc-hero-sub">
                Join the book club that's anything but traditional. Choose up to 3 new reads every
                month, delivered to your door — then dive into the stories and the conversations.
              </p>
              <div className="bbc-hero-cta">
                <a className="bbc-btn bbc-btn-pink" href="#join" id="join">
                  Log-in / Sign-up now
                  <span className="bbc-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
            <div className="bbc-hero-art">
              <div className="bbc-hero-book">
                <Cover book={books[0]} />
              </div>
              <div className="bbc-hero-book bbc-hero-book-2">
                <Cover book={books[5]} />
              </div>
              <p className="bbc-hand" style={{ position: "absolute", right: "-1rem", bottom: "1rem" }}>
                Shipping to the
                <br />
                USA &amp; Canada
              </p>
            </div>
          </div>
        </section>

        {/* July books */}
        <section id="books" className="bbc-section bbc-books">
          <div className="bbc-wrap">
            <div className="bbc-books-head">
              <div>
                <span className="bbc-eyebrow">fresh &amp; ready for you</span>
                <h2 className="bbc-h2">Our books this month</h2>
                <p>New releases drop on the 1st of every month. Call us creatures of habit.</p>
              </div>
              <a className="bbc-btn bbc-btn-dark" href="#join">
                See all books
                <span className="bbc-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
          <div className="bbc-wrap">
            <div className="bbc-rail">
              {books.map((book) => (
                <article className="bbc-card" key={book.title}>
                  <div className="bbc-card-cover">
                    <span className="bbc-card-sprout" aria-hidden="true">
                      🌱
                    </span>
                    <Cover book={book} />
                  </div>
                  <div className="bbc-card-tags">
                    {book.tags.map((t) => (
                      <span className={`bbc-tag ${t.tone}`} key={t.label}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <h3 className="bbc-card-title">{book.title}</h3>
                  <p className="bbc-card-desc">{book.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bbc-section bbc-how">
          <div className="bbc-blobs" aria-hidden="true">
            <span className="bbc-blob bbc-blob-1" />
          </div>
          <div className="bbc-wrap">
            <span className="bbc-eyebrow">easy as it sounds</span>
            <h2 className="bbc-h2">How it works</h2>
          </div>
          <div className="bbc-wrap">
            <div className="bbc-steps">
              {steps.map((s) => (
                <div className="bbc-step" key={s.tag}>
                  <span className="bbc-step-tag">{s.tag}</span>
                  <div className="bbc-step-emoji" aria-hidden="true">
                    {s.emoji}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Burrow */}
        <section className="bbc-section bbc-why">
          <div className="bbc-wrap">
            <div className="bbc-why-stage">
              <svg className="bbc-why-arc" viewBox="0 0 100 40" aria-hidden="true">
                <path id="bbc-arc-path" d="M 8,40 A 42,42 0 0 1 92,40" fill="none" />
                <text textAnchor="middle">
                  <textPath href="#bbc-arc-path" startOffset="50%">
                    Why Burrow?
                  </textPath>
                </text>
              </svg>
              <span className="bbc-why-mark" aria-hidden="true">
                🌱
              </span>
              <span className="bbc-why-pill p1">Range of genres</span>
              <span className="bbc-why-pill p2">Free shipping</span>
              <span className="bbc-why-pill p3">Affordable</span>
              <span className="bbc-why-pill p4">Quality hardcovers</span>
            </div>
          </div>
        </section>

        {/* App / gifting */}
        <section id="app" className="bbc-section bbc-app">
          <div className="bbc-blobs" aria-hidden="true">
            <span className="bbc-blob bbc-blob-1" />
          </div>
          <div className="bbc-wrap bbc-app-in">
            <div>
              <span className="bbc-eyebrow" style={{ color: "var(--yellow)" }}>
                the club in your pocket
              </span>
              <h2>
                Think <em>inside</em> the box
              </h2>
              <p>
                Pick your reads, track your shipments, and talk books with the club — all from the
                Burrow app. Gifting a membership? Do that here too.
              </p>
              <div className="bbc-stores">
                <a className="bbc-store" href="#top">
                  <span>
                    Download on the
                    <br />
                    <strong>App Store</strong>
                  </span>
                </a>
                <a className="bbc-store" href="#top">
                  <span>
                    Get it on
                    <br />
                    <strong>Google Play</strong>
                  </span>
                </a>
              </div>
            </div>
            <div className="bbc-phone">
              <div>
                <div className="bbc-phone-mark" aria-hidden="true">
                  🌱
                </div>
                <h3>This month's shelf, ready when you are.</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Genre marquee */}
        <section className="bbc-genres">
          <div className="bbc-wrap">
            <h2>Romance, thrillers, and everything in between</h2>
          </div>
          <div className="bbc-marquee-row">
            <div className="bbc-marquee">
              {[...genresA, ...genresA].map((g, i) => (
                <span key={`a${i}`}>{g}</span>
              ))}
            </div>
          </div>
          <div className="bbc-marquee-row">
            <div className="bbc-marquee rev">
              {[...genresB, ...genresB].map((g, i) => (
                <span key={`b${i}`}>{g}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Promo bar */}
        <div className="bbc-promo" aria-hidden="true">
          <div className="bbc-marquee">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>1st book only $4 with code SUMMER (US &amp; CA)</span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <section id="faq" className="bbc-section bbc-faq">
          <div className="bbc-wrap bbc-faq-in">
            <h2>Common questions</h2>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="bbc-section bbc-news">
          <div className="bbc-wrap">
            <h2>Join our mailing list</h2>
            <p>Monthly picks, member deals, and the occasional bookish confession.</p>
            <form className="bbc-news-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@email.com" aria-label="Email address" />
              <button className="bbc-btn bbc-btn-pink" type="submit">
                Subscribe
                <span className="bbc-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bbc-footer">
        <div className="bbc-wrap bbc-footer-in">
          <a href="#top" className="bbc-logo" style={{ color: "#fff" }}>
            <span className="bbc-logo-mark" aria-hidden="true">
              🌱
            </span>
            <span className="bbc-logo-name">Burrow</span>
          </a>
          <nav aria-label="Footer">
            <a href="#books">All Books</a>
            <a href="#app">Gifting</a>
            <a href="#faq">FAQ</a>
            <a href="#join">Sign up</a>
          </nav>
          <p className="bbc-footer-note">
            © {new Date().getFullYear()} {BRAND} — placeholder brand, demo clone for design study.
          </p>
        </div>
      </footer>
    </div>
  );
}
