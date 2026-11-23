import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { LinkButton } from '../components/ui/Button';

/** Placeholder used until each page is built in phase 2. */
export function ComingSoon({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title}>
        <p>{intro}</p>
      </PageHeader>
      <div className="container-page pb-20">
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-forest">This page is being set up. Pull up a chair, it won't be long.</p>
          <LinkButton to="/" variant="secondary">
            Back to the café
          </LinkButton>
        </Card>
      </div>
    </>
  );
}
