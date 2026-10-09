export function PageHeader({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emeraldBrand">{eyebrow}</p>}
      <h1 className="text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted md:text-base">{subtitle}</p>}
    </div>
  );
}
