export default function Newsletter() {
  return (
    <section className="w-full px-4 py-8 lg:px-6">
      <div className="rounded-3xl bg-mercury px-8 py-9 lg:px-12 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Left: heading + email capture */}
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
              Ready to Get
              <br />
              Our Latest Tech?
            </h2>

            <form className="relative mt-5 max-w-sm">
              <input
                type="email"
                placeholder="Your Email"
                className="h-11 w-full rounded-full border border-white/25 bg-transparent pl-5 pr-24 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-mercury transition hover:bg-white/90"
              >
                Send
              </button>
            </form>
          </div>

          {/* Right: supporting copy */}
          <div className="max-w-sm">
            <h3 className="text-sm font-bold text-white">
              Mercury for Homes &amp; Businesses
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              We&apos;ll listen to your needs, recommend the right hardware, and
              set up a complete IT solution that&apos;s right for you — backed by
              free delivery across Uganda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
