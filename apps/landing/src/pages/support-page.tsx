import {
  DocumentLayout,
  DocumentSection,
} from '@/components/app/document-layout';
import { Highlight, InlineCode, Text } from '@/components/app/typography';
import { SITE_CONFIG } from '@/config/site';

export function SupportPage() {
  return (
    <DocumentLayout title="Support">
      <DocumentSection title="Where to report bugs">
        <Text>
          Open an issue on{' '}
          <a
            href={SITE_CONFIG.issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            GitHub Issues
          </a>{' '}
          or email{' '}
          <a
            href={`mailto:${SITE_CONFIG.supportEmail}`}
            className="text-foreground underline underline-offset-2"
          >
            {SITE_CONFIG.supportEmail}
          </a>
          .
        </Text>
      </DocumentSection>

      <DocumentSection title="Common fixes">
        <Text>
          Edits not showing in Chrome? <Highlight>Rebuild</Highlight> with{' '}
          <InlineCode>npm run build:ext</InlineCode> and reload in{' '}
          <InlineCode>chrome://extensions</InlineCode>. Remap{' '}
          <InlineCode>Alt+X</InlineCode> or <InlineCode>Alt+Shift+X</InlineCode>{' '}
          at <InlineCode>chrome://extensions/shortcuts</InlineCode>. Imported
          JSON must include a valid <InlineCode>folders</InlineCode> array.
        </Text>
      </DocumentSection>
    </DocumentLayout>
  );
}
