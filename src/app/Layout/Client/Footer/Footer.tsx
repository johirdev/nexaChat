import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="max-width site-footer-inner">
        <Link href="/" className="site-brand" aria-label="NexaChat home">
          <Image width={60} height={60} src="/nexaChat.png" alt="NexaChat" />{" "}
          <span>
            Nexa<span>Chat</span>
          </span>
        </Link>
        <p>Conversations that move with you.</p>
        <small>© 2025 NexaChat. Made for better conversations.</small>
      </div>
    </footer>
  );
};

export default Footer;
