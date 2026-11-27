import catalog from "@/data/dates.json";

type ShowDate = {
  id: string;
  day: string;
  month: string;
  city: string;
  venue: string;
  mapUrl: string;
};

const dates = catalog.dates as ShowDate[];

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.4a4.3 4.3 0 0 0-4.3 4.3c0 3.3 4.3 8.9 4.3 8.9s4.3-5.6 4.3-8.9A4.3 4.3 0 0 0 8 1.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="5.6" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function ShowDates() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-[20px] pt-[var(--nav-height)] pb-[96px]">
      <div className="inline-grid grid-cols-[5.5rem_1px_1.25rem_auto] items-center gap-x-4 gap-y-10 text-pure-white">
        {dates.map((show) => (
          <article key={show.id} className="col-span-4 grid grid-cols-subgrid items-center">
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-[68px] font-extrabold tracking-[-0.05em]">{show.day}</span>
              <span className="-mt-1 text-[22px] font-extrabold tracking-[0.14em]">{show.month}</span>
            </div>
            <div aria-hidden className="h-16 w-px justify-self-center bg-pure-white" />
            <div className="col-span-2 grid grid-cols-subgrid grid-rows-2 items-center gap-y-1.5">
              <span aria-hidden className="justify-self-center text-[15px] leading-none">
                🇲🇽
              </span>
              <p className="text-[15px] leading-none font-medium">{show.city}</p>
              <span />
              <p className="col-start-2 flex items-center gap-2 text-[15px] leading-none font-bold tracking-[0.14em] uppercase">
                {show.venue}
                <a
                  href={show.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${show.venue} en el mapa`}
                  className="text-pure-white transition-opacity hover:opacity-70"
                >
                  <PinIcon />
                </a>
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
