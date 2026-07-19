type PlaceholderPageProps = {
  title: string
  description: string
}

export const PlaceholderPage = ({
  title,
  description,
}: PlaceholderPageProps) => {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
        {title}
      </h1>
      <p className="text-base leading-relaxed text-[var(--app-muted)]">
        {description}
      </p>
      <div className="app-surface mt-2 rounded-xl p-5 text-sm text-[var(--app-muted)]">
        This section is scaffolded for the next feature commits.
      </div>
    </div>
  )
}
