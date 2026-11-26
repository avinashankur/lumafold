import {
  DocumentLayout,
  DocumentSection,
} from '@/components/app/document-layout';
import { Highlight, Text } from '@/components/app/typography';
import { SITE_CONFIG } from '@/config/site';

export function TermsPage() {
  return (
    <DocumentLayout
      title="Terms"
      meta={`Updated ${SITE_CONFIG.privacyUpdatedAt}`}
    >
      <DocumentSection title="Your data">
        <Text>
          Everything lives in browser storage.{' '}
          <Highlight>Export JSON backups from Settings</Highlight> if you want a
          copy outside your browser.
        </Text>
      </DocumentSection>

      <DocumentSection title="Third-party AI keys">
        <Text>
          If you use your own Gemini, OpenAI, or custom API key,{' '}
          <Highlight>your provider&apos;s terms and billing apply</Highlight>.
        </Text>
      </DocumentSection>

      <DocumentSection title="Warranty">
        <Text>
          Provided as-is without warranty. Questions can be opened on{' '}
          <a
            href={SITE_CONFIG.issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            GitHub Issues
          </a>
          .
        </Text>
      </DocumentSection>
    </DocumentLayout>
  );
}
