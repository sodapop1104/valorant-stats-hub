export default function Privacy() {
  return (
    <main className="prose prose-invert max-w-none">
      <h2>Privacy Policy</h2>
      <p id="summary">
        We collect and process gameplay statistics retrieved from Riot Games APIs to provide analytics you request.
        We minimize data, keep processing server-side, and never expose your API token.
      </p>

      <h3>What We Collect</h3>
      <ul>
        <li>Riot ID and publicly available gameplay stats we fetch via Riot APIs.</li>
        <li>Anonymous analytics (page views, basic performance metrics).</li>
        <li>Optional user submissions (e.g., friend lists, comparisons) if you provide them.</li>
      </ul>

      <h3>What We Do Not Collect</h3>
      <ul>
        <li>No passwords, payment info, or sensitive categories (health, race, etc.).</li>
        <li>No client-side storage of your API token; server holds it only via environment variable.</li>
      </ul>

      <h3>Use of Data</h3>
      <ul>
        <li>Show your individual performance metrics and charts.</li>
        <li>Enable optional comparisons you request.</li>
        <li>Improve site reliability and UX via anonymous analytics.</li>
      </ul>

      <h3 id="cookies">Cookies</h3>
      <p>
        We use necessary cookies for core functionality. If you consent, we also use analytics cookies to improve the site.
        You can change your cookie choice at any time by clearing the “cookie-consent” setting in your browser’s local storage.
      </p>

      <h3>Data Retention</h3>
      <p>
        Minimal operational data is retained only as long as needed to provide features you use. 
        You may request deletion at any time.
      </p>

      <h3>Data Sharing</h3>
      <p>
        We do not sell your personal data. We share data only with infrastructure providers (e.g., hosting) necessary to run this site.
      </p>

      <h3 id="ccpa">Your Rights (CA / CPRA)</h3>
      <ul>
        <li>Right to know/access what categories of personal information we process.</li>
        <li>Right to deletion of personal information, subject to legal exceptions.</li>
        <li>Right to correct inaccurate personal information.</li>
        <li>Right to opt out of “sale” or “sharing” of personal information. We do not sell or share personal information for cross-context behavioral advertising.</li>
      </ul>

      <h3>GDPR (EEA/UK) Basics</h3>
      <p>
        If applicable, our lawful bases include consent (analytics) and legitimate interests (site operation). 
        You have rights to access, rectify, erase, restrict or object, and data portability.
      </p>

      <h3 id="contact">Contact</h3>
      <p>
        Questions or deletion requests? Email: <a href="mailto:privacy@yourdomain.example">privacy@yourdomain.example</a>
      </p>
    </main>
  );
}