export function InteriorPage({
  title,
  slot,
}: {
  title: string;
  slot: string;
}) {
  return (
    <main className="bg-carbon-black px-[20px] pt-[calc(var(--nav-height)+var(--spacing-30))] text-center">
      <h1 className="text-[28px] leading-[1.25] font-extrabold tracking-[-0.036em] text-pure-white">
        {title}
      </h1>
      <p className="mt-[30px] text-[18px] leading-[1.25] font-bold tracking-[-0.016em] text-pure-white">
        {slot}
      </p>
    </main>
  );
}
