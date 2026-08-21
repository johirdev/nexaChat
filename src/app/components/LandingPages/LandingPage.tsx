import {
  ArrowUpRight,
  Bell,
  Check,
  LockKeyhole,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    number: "01",
    title: "Move at the speed of thought",
    text: "Send ideas, files and reactions in one fluid space. No friction between the thought and the message.",
  },
  {
    icon: Users,
    number: "02",
    title: "Feel close, from anywhere",
    text: "Keep every important person and project within reach with rooms that feel personal, not noisy.",
  },
  {
    icon: LockKeyhole,
    number: "03",
    title: "Your conversations, yours",
    text: "Thoughtful privacy controls keep your messages for the people they were meant for.",
  },
];

export default function HomeLandingPage() {
  return (
    <div id="top" className="site-home">
      <section className="site-hero">
        <div className="site-grid-bg site-hero-grid" />
        <div className="max-width site-hero-inner">
          <div className="site-hero-copy">
            <div className="site-eyebrow">
              <span className="site-live-dot" /> your people, in sync
            </div>
            <h1>
              Make room for <span className="site-gradient-text">better</span>{" "}
              conversations.
            </h1>
            <p className="site-hero-lead">
              NexaChat brings your people, ideas and everyday moments into one
              beautifully simple place.
            </p>
            <div className="site-hero-actions">
              <a
                className="site-btn site-btn-primary site-large-btn"
                href="#start"
              >
                Open your space <ArrowUpRight size={18} />
              </a>
              <a className="site-text-link" href="#preview">
                See how it feels <span>↓</span>
              </a>
            </div>
            <div className="site-trust">
              <div className="site-avatars">
                <i>J</i>
                <i>M</i>
                <i>S</i>
                <i>+</i>
              </div>
              <span>
                <strong>12k+</strong> people are already talking better
              </span>
            </div>
          </div>
          <div className="site-hero-visual" id="preview">
            <div className="site-orbit site-float">
              <span className="site-orbit-ring ring-one" />
              <span className="site-orbit-ring ring-two" />
              <div className="site-orbit-core">
                <Sparkles size={28} />
              </div>
            </div>
            <div className="site-chat-card">
              <div className="site-chat-top">
                <div>
                  <span className="site-status" />{" "}
                  <strong>Design circle</strong>
                  <small> 4 people online</small>
                </div>
                <Bell size={17} />
              </div>
              <div className="site-message">
                <span className="site-avatar avatar-cyan">A</span>
                <div>
                  <small>Amelia · 9:41</small>
                  <p>That new direction feels so right ✦</p>
                </div>
              </div>
              <div className="site-message is-you">
                <div>
                  <small>You · 9:42</small>
                  <p>Yes. Let&apos;s make it happen.</p>
                </div>
                <span className="site-avatar avatar-violet">Y</span>
              </div>
              <div className="site-compose">
                <span>Write a message...</span>
                <button aria-label="Send message">
                  <Send size={16} />
                </button>
              </div>
            </div>
            <div className="site-floating-note">
              <span className="site-pulse">
                <Check size={13} />
              </span>{" "}
              Everything is in sync
            </div>
          </div>
        </div>
      </section>
      <section className="site-marquee">
        <div>
          NexaChat <span>✦</span> Talk freely <span>✦</span> Build together{" "}
          <span>✦</span> Stay close <span>✦</span> NexaChat <span>✦</span>
        </div>
      </section>
      <section className="site-section" id="features">
        <div className="max-width">
          <div className="site-section-heading">
            <div>
              <span className="site-kicker">Why it clicks</span>
              <h2>
                Less noise.
                <br />
                <em>More signal.</em>
              </h2>
            </div>
            <p>
              Chat should make life feel lighter. NexaChat is designed around
              the moments that matter, with just enough magic to keep you
              moving.
            </p>
          </div>
          <div className="site-feature-grid">
            {features.map(({ icon: Icon, number, title, text }) => (
              <article className="site-feature" key={number}>
                <div className="site-feature-icon">
                  <Icon size={22} />
                </div>
                <span className="site-feature-number">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href="#start" aria-label={`Explore ${title}`}>
                  Explore <ArrowUpRight size={15} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="site-why" id="why">
        <div className="max-width site-why-inner">
          <div className="site-why-art">
            <div className="site-radar">
              <span />
              <span />
              <span />
              <div>✦</div>
            </div>
            <div className="site-art-label">
              designed for
              <br />
              <strong>real life</strong>
            </div>
          </div>
          <div className="site-why-copy">
            <span className="site-kicker">A little more human</span>
            <h2>
              Your day has a rhythm.
              <br />
              <span>Chat should too.</span>
            </h2>
            <p>
              From the first “good morning” to the final big idea, NexaChat
              keeps your conversations feeling natural, focused and wonderfully
              yours.
            </p>
            <ul>
              <li>
                <Check size={17} /> Fast enough to keep up
              </li>
              <li>
                <Check size={17} /> Calm enough to think in
              </li>
              <li>
                <Check size={17} /> Open enough to bring everyone in
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="site-start" id="start">
        <div className="max-width site-start-inner">
          <span className="site-kicker">Your next conversation</span>
          <h2>
            Good things start
            <br />
            <span>with a message.</span>
          </h2>
          <p>Bring your people together in a space that feels like yours.</p>
          <a className="site-btn site-btn-primary site-large-btn" href="#top">
            Start chatting <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
