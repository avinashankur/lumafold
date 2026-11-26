import {
  DocumentLayout,
  DocumentSection,
} from '@/components/app/document-layout';
import { Highlight, InlineCode, Text } from '@/components/app/typography';
import { SITE_CONFIG } from '@/config/site';

export function PrivacyPage() {
  return (
    <DocumentLayout
      title="Privacy Policy"
      meta={`Updated ${SITE_CONFIG.privacyUpdatedAt}`}
    >
      <DocumentSection title="Local storage only">
        <Text>
          Notes, folders, preferences, and optional API settings stay locally in{' '}
          <InlineCode>chrome.storage.local</InlineCode> (or{' '}
          <InlineCode>localStorage</InlineCode>).{' '}
          <Highlight>
            No accounts, no cloud servers, and no analytics.
          </Highlight>
        </Text>
      </DocumentSection>

      <DocumentSection title="BYOK AI">
        <Text>
          When you trigger an AI action with your own Gemini, OpenAI, or custom
          key, text goes{' '}
          <Highlight>directly from your browser to that provider</Highlight>.
          Nothing touches a Lumafold server.
        </Text>
      </DocumentSection>

      <DocumentSection title="Permissions">
        <Text>
          <InlineCode>storage</InlineCode> saves notes locally.{' '}
          <InlineCode>tabs</InlineCode> opens full-tab mode.{' '}
          <InlineCode>system.display</InlineCode> sizes floating windows.
          Firefox declares{' '}
          <InlineCode>data_collection_permissions: none</InlineCode>.
        </Text>
      </DocumentSection>

      <DocumentSection title="Contact">
        <Text>
          <a
            href={SITE_CONFIG.issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            GitHub Issues
          </a>{' '}
          or{' '}
          <a
            href={`mailto:${SITE_CONFIG.supportEmail}`}
            className="text-foreground underline underline-offset-2"
          >
            {SITE_CONFIG.supportEmail}
          </a>
          .
        </Text>
      </DocumentSection>
    </DocumentLayout>
  );
}
