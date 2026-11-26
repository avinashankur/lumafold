import {
  Heading,
  Highlight,
  InlineCode,
  Muted,
  Subheading,
  Text,
} from '@/components/app/typography';
import { SHORTCUTS, SITE_CONFIG } from '@/config/site';
import { Link } from '@/lib/router';

export function LandingPage() {
  return (
    <div className="space-y-8">
      {/* Section 1: What it is */}
      <section className="space-y-3">
        <Heading>What it is</Heading>
        <Text>
          Most note extensions give you one cramped box. Lumafold puts{' '}
          <Highlight>folders in your top bar</Highlight> and up to{' '}
          <Highlight>3 resizable rich-text panels</Highlight> side by side. Hit{' '}
          <InlineCode>Alt+X</InlineCode> for the popup, or{' '}
          <InlineCode>Alt+Shift+X</InlineCode> for a full tab.
        </Text>
        <Text>
          No accounts, no cloud sync, no tracking. Everything stays in{' '}
          <InlineCode>chrome.storage.local</InlineCode>, so{' '}
          <Highlight>
            wipe your browser without a JSON backup and your notes are gone
          </Highlight>
          . Need AI to rewrite or summarize?{' '}
          <Highlight>Bring your own Gemini, OpenAI, or custom key</Highlight>.
          Requests leave straight from your browser.{' '}
          <Highlight>I never see a word you write.</Highlight>
        </Text>
        <div className="flex flex-wrap gap-4 pt-1 text-xs">
          {SITE_CONFIG.chromeWebStoreUrl ? (
            <a
              href={SITE_CONFIG.chromeWebStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              Chrome Web Store
            </a>
          ) : (
            <Muted>Chrome Web Store: pending</Muted>
          )}
          {SITE_CONFIG.firefoxAddonsUrl ? (
            <a
              href={SITE_CONFIG.firefoxAddonsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              Firefox Add-ons
            </a>
          ) : (
            <Muted>Firefox Add-ons: pending</Muted>
          )}
          <a
            href={SITE_CONFIG.releasesUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            GitHub releases
          </a>
        </div>
      </section>

      {/* Section 2: How to use */}
      <section className="space-y-3">
        <Subheading>How to use</Subheading>
        <Text>
          Use <InlineCode>Alt+X</InlineCode> for the{' '}
          <Highlight>toolbar popup</Highlight>,{' '}
          <InlineCode>Alt+Shift+X</InlineCode> for a full tab (both customizable
          in browser extension shortcuts), and Settings to export{' '}
          <Highlight>JSON backups</Highlight>.
        </Text>
        <ul className="text-muted-foreground space-y-1 text-xs">
          {SHORTCUTS.map((item) => (
            <li key={item.action}>
              <InlineCode>{item.keys.join('+')}</InlineCode>{' '}
              {item.action.toLowerCase()}
            </li>
          ))}
        </ul>
        <div className="space-y-1.5 pt-2">
          <Muted>Build unpacked from source:</Muted>
          <pre className="bg-muted text-muted-foreground overflow-x-auto rounded p-3 font-mono text-xs">
            <code>{`git clone ${SITE_CONFIG.repoUrl}.git
cd lumafold && npm install && npm run build:ext
# chrome://extensions -> Load unpacked -> apps/extension/dist`}</code>
          </pre>
        </div>
        <Muted>
          See{' '}
          <Link to="/privacy" className="text-foreground underline">
            privacy
          </Link>{' '}
          or{' '}
          <Link to="/support" className="text-foreground underline">
            support
          </Link>
          .
        </Muted>
      </section>
    </div>
  );
}
