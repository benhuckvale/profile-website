export default function Footer() {
  return (
    <footer className="mt-16 border-t border-primary-accent/30 bg-background-page/50 py-6">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-sm text-text-secondary text-center">
          This site uses Cloudflare Web Analytics to understand visitor traffic.{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-accent hover:text-primary-accent/80 underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
}
