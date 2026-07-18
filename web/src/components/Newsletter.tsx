import Image from "next/image";

export default function Newsletter() {
  return (
    <section className="relative w-full px-4 pt-24 pb-8 lg:px-6">
      <div className="relative rounded-3xl bg-mercury px-8 py-9 lg:px-12 lg:py-10">
        {/* Floating product that pops out of the top edge, far right */}
        <div className="absolute right-[2%] top-0 hidden -translate-y-[26%] lg:block">
          <div className="relative h-[340px] w-[250px]">
            <Image
              src="/float-product.png"
              alt="Featured Mercury product"
              fill
              sizes="250px"
              className="object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

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

          {/* Right: supporting copy (shifted left of the floating product) */}
          <div className="max-w-sm lg:mr-64">
            <h3 className="text-sm font-bold text-white">
              Mercury for Homes &amp; Businesses
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              We&apos;ll listen to your needs, recommend the right hardware, and
              set up a complete IT solution that&apos;s right for you — backed by
              free delivery across Kampala Central.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
