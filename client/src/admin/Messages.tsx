import { useState } from 'react';
import { useDeleteMessage, useMarkMessage, useMessages, type ContactMessage } from './api';
import { AdminHeader, ConfirmDialog, QueryBlock } from './shared';
import { errorMessage } from './utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { cn } from '../lib/cn';

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

export function Messages() {
  const messages = useMessages();
  const mark = useMarkMessage();
  const remove = useDeleteMessage();
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const unread = messages.data?.filter((m) => !m.isRead).length ?? 0;

  return (
    <>
      <AdminHeader title="Messages" subtitle={messages.data ? `${unread} unread` : undefined} />
      <QueryBlock query={messages} empty="No messages yet.">
        {(items) => (
          <ul className="flex flex-col gap-4">
            {items.map((m) => (
              <li key={m._id}>
                <Card className={cn('p-5', !m.isRead && 'border-forest-dark/40 bg-sage-soft')}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {m.name} {!m.isRead && <Tag className="ml-1">New</Tag>}
                      </p>
                      <a href={`mailto:${m.email}`} className="text-sm underline underline-offset-4">
                        {m.email}
                      </a>
                    </div>
                    <p className="text-sm text-forest">{when(m.createdAt)}</p>
                  </div>
                  <p className="mt-3 whitespace-pre-line">{m.message}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" className="px-4 py-1.5 text-sm" onClick={() => mark.mutate({ id: m._id, isRead: !m.isRead })}>
                      {m.isRead ? 'Mark as unread' : 'Mark as read'}
                    </Button>
                    <Button variant="ghost" className="px-4 py-1.5 text-sm text-error" onClick={() => setDeleting(m)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </QueryBlock>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this message?"
        body={<p>The message from {deleting?.name} will be removed for good.</p>}
        confirmLabel="Delete"
        busy={remove.isPending}
        error={errorMessage(remove.error)}
        onConfirm={() => deleting && remove.mutate(deleting._id, { onSuccess: () => setDeleting(null) })}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
      />
    </>
  );
}
