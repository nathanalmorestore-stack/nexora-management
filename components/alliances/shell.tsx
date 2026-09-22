import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

type AllianceIcon = ElementType<{ className?: string; stroke?: string | number }>;

export const alliancesPanelShadow =
  "shadow-[0_1px_3px_0_rgb(0,0,0,0.06),0_1px_2px_-1px_rgb(0,0,0,0.04)] dark:shadow-zinc-950/30";

export function AlliancesPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="pagePadding pb-10 pt-8 sm:pt-12">
      <div className={clsx("mx-auto w-full max-w-6xl", className)}>{children}</div>
    </div>
  );
}

export function AlliancesPageHeader({
  title,
  subtitle,
  workspaceLabel,
  dateLabel,
  action,
}: {
  title: string;
  subtitle?: string;
  workspaceLabel?: string;
  dateLabel?: string;
  action?: ReactNode;
}) {
  const label =
    dateLabel ??
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-5 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">{label}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-zinc-950 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          ) : null}
          {workspaceLabel ? (
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{workspaceLabel}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
      </div>
    </header>
  );
}

export function AlliancesPanel({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-2xl border border-zinc-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-900/70",
        alliancesPanelShadow,
        className
      )}
    >
      {children}
    </div>
  );
}

export function AlliancesEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: AllianceIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <AlliancesPanel className="mx-auto max-w-md px-8 py-12 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" stroke={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-400 dark:text-zinc-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </AlliancesPanel>
  );
}

export function AlliancesSectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: AllianceIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" stroke={1.75} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
    </div>
  );
}

export const alliancePrimaryButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50";

export const allianceSecondaryButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700";

export const allianceFormInputOverride =
  "!rounded-xl !border-0 !bg-zinc-100 !px-3 !py-2 !text-sm !text-zinc-900 focus:!outline-none focus:!ring-2 focus:!ring-primary/40 dark:!bg-zinc-800 dark:!text-white !shadow-none";

export const allianceFormLabelClass =
  "mb-1 block text-[11px] font-medium text-zinc-400 dark:text-zinc-500";

export const allianceFormInputClass =
  "w-full rounded-xl border-0 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-zinc-800 dark:text-white";

export function AlliancesFormInset({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-900/50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AlliancesSectionBar({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: AllianceIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <AlliancesSectionHeader icon={Icon} title={title} subtitle={subtitle} />
      {action ? <div className="shrink-0 self-start sm:mt-0.5">{action}</div> : null}
    </div>
  );
}

export const allianceDangerOutlineButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/35 dark:text-red-200 dark:hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-40";

export const allianceWarningButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700";

export const allianceDangerButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700";
