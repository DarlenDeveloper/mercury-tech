export default function Newsletter() {
  return (
    <section className="w-full px-4 py-8 lg:px-6">
      <div className="flex flex-col gap-5 rounded-2xl bg-mercury px-6 py-6 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-10">
        <h2 className="shrink-0 text-xl font-bold leading-tight text-white lg:text-2xl">
          Ready to Get Our Latest Tech?
        </h2>

        <form className="relative w-full md:max-w-md">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Your Email"
            className="h-11 w-full rounded-full border border-white/25 bg-transparent pl-5 pr-24 text-sm text-white outline-none transition placeholder:text-white/60 focus:border-white/70"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-mercury transition hover:bg-white/90"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
