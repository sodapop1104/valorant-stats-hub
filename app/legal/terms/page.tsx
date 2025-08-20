export default function Terms() {
  return (
    <main className="prose prose-invert max-w-none">
      <h2>Terms of Service</h2>
      <p>
        This site is an unofficial fan-made analytics tool and is not endorsed by Riot Games.
        Use of this site is at your own risk. We may change or discontinue features at any time.
      </p>

      <h3>Riot API Usage</h3>
      <ul>
        <li>We use Riot Games APIs according to their policies. Availability and data returned may vary by region and account status.</li>
        <li>Your API key is never embedded client-side; we access Riot APIs server-side only.</li>
        <li>Where required by Riot, player consent and/or RSO (Riot Sign-On) is necessary to access personal gameplay data.</li>
      </ul>

      <h3>Acceptable Use</h3>
      <ul>
        <li>No scraping, rate-limit abuse, or attempts to bypass access controls.</li>
        <li>No unlawful, infringing, or harmful content or behavior.</li>
      </ul>

      <h3>Disclaimers</h3>
      <ul>
        <li>All trademarks are property of their respective owners. VALORANT © Riot Games.</li>
        <li>We do not guarantee accuracy, availability, or fitness for a particular purpose.</li>
      </ul>

      <h3>Contact</h3>
      <p>
        For support or questions, email: <a href="mailto:support@yourdomain.example">support@yourdomain.example</a>
      </p>
    </main>
  );
}