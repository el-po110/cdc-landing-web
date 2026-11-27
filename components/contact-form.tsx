"use client";

export function ContactForm() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center px-[20px] pt-[calc(var(--nav-height)+12px)] pb-[112px]">
      <form
        className="my-auto flex w-full max-w-[420px] flex-col gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <h1 className="text-center text-[28px] leading-[1.25] font-extrabold tracking-[-0.036em] text-pure-white">
          CONTACTO
        </h1>
        <label className="flex flex-col gap-2 text-[12px] font-extrabold tracking-[0.14em] text-pure-white">
          ASUNTO
          <input
            type="text"
            name="asunto"
            autoComplete="off"
            required
            className="border-b border-white/45 bg-transparent py-2 text-[16px] font-light tracking-normal text-pure-white outline-none placeholder:text-silver-mist focus:border-signal-red"
          />
        </label>
        <label className="flex flex-col gap-2 text-[12px] font-extrabold tracking-[0.14em] text-pure-white">
          CORREO
          <input
            type="email"
            name="correo"
            autoComplete="email"
            required
            className="border-b border-white/45 bg-transparent py-2 text-[16px] font-light tracking-normal text-pure-white outline-none placeholder:text-silver-mist focus:border-signal-red"
          />
        </label>
        <label className="flex flex-col gap-2 text-[12px] font-extrabold tracking-[0.14em] text-pure-white">
          MENSAJE
          <textarea
            name="mensaje"
            required
            rows={3}
            className="resize-none border-b border-white/45 bg-transparent py-2 text-[16px] font-light tracking-normal text-pure-white outline-none placeholder:text-silver-mist focus:border-signal-red"
          />
        </label>
        <button
          type="submit"
          className="mt-2 self-center rounded-full bg-black px-[28px] py-[11px] text-[14px] font-extrabold tracking-normal text-pure-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-opacity hover:opacity-70"
        >
          ENVIAR
        </button>
      </form>
    </main>
  );
}
