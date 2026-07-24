export type Department = {
  label: string;
  href: string;
  children: { name: string; href: string }[];
};

/**
 * The client's focused 6 departments. Links point at existing category routes
 * so nothing is dead while the taxonomy remap is pending.
 */
export const DEPARTMENTS: Department[] = [
  {
    label: "Laptops",
    href: "/category/computers",
    children: [
      { name: "Lenovo Laptops", href: "/category/computers/lenovo-laptops" },
      { name: "HP Laptops", href: "/category/computers/hp-laptops" },
      { name: "Dell Laptops", href: "/category/computers/dell-laptops" },
      { name: "Business Laptops", href: "/category/computers/business-laptops" },
      { name: "Gaming Laptops", href: "/category/computers/gaming-laptops" },
    ],
  },
  {
    label: "Desktops",
    href: "/category/computers",
    children: [
      { name: "Desktops", href: "/category/computers/desktops" },
      { name: "Dell Desktops", href: "/category/computers/dell-desktops" },
      { name: "HP Desktops", href: "/category/computers/hp-desktops" },
      { name: "Monitors", href: "/category/computers/monitors" },
    ],
  },
  {
    label: "Printers & Office",
    href: "/category/printers-office",
    children: [
      { name: "Ink Tank Printers", href: "/category/printers-office/ink-tank-printers" },
      { name: "Laser Printers", href: "/category/printers-office/a4-black-white-laser-printers" },
      { name: "HP Toner Cartridges", href: "/category/printers-office/hp-toner-cartridges" },
      { name: "Scanners", href: "/category/printers-office/scanners" },
    ],
  },
  {
    label: "Networking & Security",
    href: "/category/networking-security",
    children: [
      { name: "Routers", href: "/category/networking-security/routers" },
      { name: "Switches", href: "/category/networking-security/switches" },
      { name: "Hikvision Cameras", href: "/category/networking-security/hikvision-cameras" },
      { name: "Wi-Fi Adapters", href: "/category/networking-security/wi-fi-adapters" },
    ],
  },
  {
    label: "UPS & Power",
    href: "/category/components-power",
    children: [
      { name: "APC UPS", href: "/category/components-power/apc-ups" },
      { name: "APC Smart UPS", href: "/category/components-power/apc-smart-ups" },
      { name: "Giganet UPS", href: "/category/components-power/giganet-ups" },
      { name: "UPS Battery", href: "/category/components-power/ups-battery" },
    ],
  },
  {
    label: "Software",
    href: "/category/accessories",
    children: [
      { name: "Microsoft 365 Family", href: "/category/accessories/microsoft-365-family" },
      { name: "Computer Software", href: "/category/accessories/computer-software" },
      { name: "Software", href: "/category/accessories/software" },
    ],
  },
];
