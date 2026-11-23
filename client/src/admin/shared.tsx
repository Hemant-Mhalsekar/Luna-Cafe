import { useState, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Tag } from '../components/ui/Tag';
import { formatDate } from '../lib/cafe';
import { cn } from '../lib/cn';
import { errorMessage, fieldErrors, td, th } from './utils';
import { useAdminDelete, useAdminList, useAdminSave, useCancelReservation, type AdminReservation, type Resource } from './api';

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-forest">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-forest-dark">{body}</div>
      {error && (
        <p role="alert" className="mt-4 font-medium text-error">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Keep it
        </Button>
      </div>
    </Modal>
  );
}

/** Simple loading / error / empty wrapper for admin lists. */
export function QueryBlock<T>({ query, empty, children }: { query: UseQueryResult<T[]>; empty: string; children: (items: T[]) => ReactNode }) {
  if (query.isPending && query.fetchStatus !== 'idle') return <Card className="text-forest">Loading…</Card>;
  if (query.isError)
    return (
      <Card role="alert" className="flex items-center justify-between gap-4">
        <span>{errorMessage(query.error)}</span>
        <Button variant="secondary" onClick={() => query.refetch()}>
          Try again
        </Button>
      </Card>
    );
  if (!query.data || query.data.length === 0) return <Card className="text-forest">{empty}</Card>;
  return <>{children(query.data)}</>;
}

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[40rem] border-collapse text-[15px]">{children}</table>
    </Card>
  );
}

export function ReservationTable({ query, emptyText, showDate = true }: { query: UseQueryResult<AdminReservation[]>; emptyText: string; showDate?: boolean }) {
  const cancel = useCancelReservation();
  const [target, setTarget] = useState<AdminReservation | null>(null);

  return (
    <>
      <QueryBlock query={query} empty={emptyText}>
        {(items) => (
          <TableCard>
            <thead className="border-b border-outline/60">
              <tr>
                {showDate && <th className={th}>Date</th>}
                <th className={th}>Time</th>
                <th className={th}>Guest</th>
                <th className={th}>Party</th>
                <th className={th}>Table</th>
                <th className={th}>Game</th>
                <th className={th}>Code</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const cancelled = r.status === 'cancelled';
                return (
                  <tr key={r._id} className={cn('border-b border-outline/40 last:border-0', cancelled && 'text-muted')}>
                    {showDate && <td className={td}>{formatDate(r.date).split(' ').slice(0, 3).join(' ')}</td>}
                    <td className={cn(td, 'font-mono')}>{`${r.slotId.slice(0, 2)}:${r.slotId.slice(2)}`}</td>
                    <td className={td}>
                      <span className={cn('block font-semibold', cancelled && 'line-through')}>{r.name}</span>
                      <a href={`mailto:${r.email}`} className="block text-sm underline-offset-4 hover:underline">
                        {r.email}
                      </a>
                      <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="block text-sm underline-offset-4 hover:underline">
                        {r.phone}
                      </a>
                    </td>
                    <td className={td}>{r.partySize}</td>
                    <td className={td}>{r.tableId ? `No. ${r.tableId.number}` : '–'}</td>
                    <td className={td}>{r.gameId?.name ?? '–'}</td>
                    <td className={cn(td, 'font-mono text-sm')}>{r.referenceCode}</td>
                    <td className={cn(td, 'text-right')}>
                      {cancelled ? (
                        <Tag className="bg-cream-deep text-muted">Cancelled</Tag>
                      ) : (
                        <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => setTarget(r)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableCard>
        )}
      </QueryBlock>
      <ConfirmDialog
        open={target !== null}
        title="Cancel this booking?"
        body={
          target && (
            <p>
              {target.name}, {formatDate(target.date)} at {target.slotId.slice(0, 2)}:{target.slotId.slice(2)} for {target.partySize}. The table becomes
              free for others straight away.
            </p>
          )
        }
        confirmLabel="Cancel booking"
        busy={cancel.isPending}
        error={errorMessage(cancel.error)}
        onConfirm={() => target && cancel.mutate(target._id, { onSuccess: () => setTarget(null) })}
        onClose={() => {
          setTarget(null);
          cancel.reset();
        }}
      />
    </>
  );
}

// ---- generic manager for games, menu items and events ----

interface Column<T> {
  label: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface ResourceManagerProps<T extends { _id: string }, F> {
  resource: Resource;
  title: string;
  singular: string;
  columns: Column<T>[];
  /** Blank form for "Add". */
  empty: F;
  /** Turn a saved item into form values for "Edit". */
  toForm: (item: T) => F;
  /** Turn form values into the request body. */
  toBody: (form: F) => Record<string, unknown>;
  renderForm: (form: F, set: (patch: Partial<F>) => void, errors: Record<string, string>) => ReactNode;
  itemName: (item: T) => string;
}

export function ResourceManager<T extends { _id: string }, F>({ resource, title, singular, columns, empty, toForm, toBody, renderForm, itemName }: ResourceManagerProps<T, F>) {
  const list = useAdminList<T>(resource);
  const save = useAdminSave<{ _id?: string }>(resource);
  const remove = useAdminDelete(resource);
  const [editing, setEditing] = useState<{ id?: string; form: F } | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const close = () => {
    setEditing(null);
    save.reset();
  };

  return (
    <>
      <AdminHeader
        title={title}
        subtitle={list.data ? `${list.data.length} in total` : undefined}
        action={<Button onClick={() => setEditing({ form: empty })}>Add {singular}</Button>}
      />
      <QueryBlock query={list} empty={`No ${title.toLowerCase()} yet.`}>
        {(items) => (
          <TableCard>
            <thead className="border-b border-outline/60">
              <tr>
                {columns.map((c) => (
                  <th key={c.label} className={th}>
                    {c.label}
                  </th>
                ))}
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-outline/40 last:border-0">
                  {columns.map((c) => (
                    <td key={c.label} className={cn(td, c.className)}>
                      {c.render(item)}
                    </td>
                  ))}
                  <td className={cn(td, 'whitespace-nowrap text-right')}>
                    <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => setEditing({ id: item._id, form: toForm(item) })} aria-label={`Edit ${itemName(item)}`}>
                      Edit
                    </Button>
                    <Button variant="ghost" className="px-3 py-1.5 text-sm text-error" onClick={() => setDeleting(item)} aria-label={`Delete ${itemName(item)}`}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        )}
      </QueryBlock>

      <Modal open={editing !== null} onClose={close} title={editing?.id ? `Edit ${singular}` : `Add ${singular}`} className="w-[min(94vw,44rem)]">
        {editing && (
          <form
            noValidate
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate({ _id: editing.id, ...toBody(editing.form) }, { onSuccess: close });
            }}
          >
            {renderForm(editing.form, (patch) => setEditing((cur) => (cur ? { ...cur, form: { ...cur.form, ...patch } } : cur)), fieldErrors(save.error))}
            {save.error && (
              <p role="alert" className="font-medium text-error">
                {errorMessage(save.error)}
              </p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete this ${singular}?`}
        body={<p>“{deleting && itemName(deleting)}” will be removed for good. To hide it for a while instead, edit it and untick “Available”.</p>}
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

// ---- small form controls ----

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 rounded accent-forest-dark" />
      {label}
    </label>
  );
}

export function CheckboxGroup<V extends string>({ legend, options, value, onChange, error }: { legend: string; options: readonly V[]; value: V[]; onChange: (v: V[]) => void; error?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => (
          <Checkbox key={o} label={o.replace('-', ' ')} checked={value.includes(o)} onChange={(on) => onChange(on ? [...value, o] : value.filter((x) => x !== o))} />
        ))}
      </div>
      {error && <p className="mt-1 text-sm font-medium text-error">{error}</p>}
    </fieldset>
  );
}

export function Availability({ on }: { on: boolean }) {
  return on ? <Tag>Available</Tag> : <Tag className="bg-cream-deep text-muted">Hidden</Tag>;
}
