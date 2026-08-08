import Image from "next/image";

const PARTNERS = [
  { name: "Cisco", image: "/partners/cisco.png" },
  { name: "Dell Technologies", image: "/partners/dell.png" },
  { name: "Hewlett Packard Enterprise", image: "/partners/hewlett-packard-enterprise.png" },
  { name: "Microsoft", image: "/partners/microsoft.png" },
  { name: "Fortinet", image: "/partners/fortinet.png" },
  { name: "Ubiquiti", image: "/partners/ubiquiti.png" },
] as const;

export default function TechnologyPartners() {
  return (
    <section className="mt-2 py-1 sm:mt-2">
      <div className="no-scrollbar flex items-center gap-6 overflow-x-auto sm:gap-10 lg:grid lg:grid-cols-6 lg:overflow-visible">
        {PARTNERS.map((partner) => (
          <div
            key={partner.name}
            className="relative h-24 min-w-[170px] flex-1 lg:min-w-0"
            title={partner.name}
          >
            <Image
              src={partner.image}
              alt={partner.name}
              fill
              sizes="(min-width: 1024px) 16vw, 170px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
