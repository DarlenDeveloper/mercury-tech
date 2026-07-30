import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/category.dart';

/// The focused departments, aligned with the web taxonomy. `slug` matches the
/// product `categoryId` in Firestore (laptops, desktops, printers-office,
/// networking-security, ups-power, software, other). Subcategories here are
/// sensible fallbacks; the live list is merged from Firestore `children`.
const List<Category> kShopCategories = [
  Category(
    name: 'Laptops',
    slug: 'laptops',
    color: Color(0xFF1F3E97),
    image: 'assets/images/computers-removebg-preview.png',
    photo: 'assets/images/cat-laptops.jpeg',
    imageScale: 1.8,
    imageScaleX: 2.15,
    imageRotationDeg: -90,
    subcategories: [
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/computers-removebg-preview.png',
      ),
      Subcategory(
        'HP Laptops',
        IconsaxPlusBold.monitor,
        image: 'assets/images/HP 250 G9 Laptop.jpeg',
      ),
      Subcategory('Lenovo Laptops', IconsaxPlusBold.monitor),
      Subcategory('Dell Laptops', IconsaxPlusBold.monitor),
      Subcategory('Gaming Laptops', IconsaxPlusBold.monitor),
      Subcategory('Business Laptops', IconsaxPlusBold.monitor),
    ],
  ),
  Category(
    name: 'Desktops',
    slug: 'desktops',
    color: Color(0xFF0F766E),
    image: 'assets/images/computers-removebg-preview.png',
    photo: 'assets/images/cat-desktops.jpeg',
    subcategories: [
      Subcategory(
        'Desktops',
        IconsaxPlusBold.devices,
        image: 'assets/images/Dell OptiPlex 7020 MT (desktop + monitor).jpeg',
      ),
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/computers-removebg-preview.png',
      ),
      Subcategory('Dell Desktops', IconsaxPlusBold.devices),
      Subcategory('HP Desktops', IconsaxPlusBold.devices),
      Subcategory(
        'Monitors',
        IconsaxPlusBold.monitor_mobbile,
        image: 'assets/images/Dell E2020H.jpeg',
      ),
    ],
  ),
  Category(
    name: 'Printers & Office',
    slug: 'printers-office',
    color: Color(0xFFD9620E),
    image: 'assets/images/printers___power-removebg-preview.png',
    photo: 'assets/images/cat-office.jpeg',
    imageScale: 1.3,
    subcategories: [
      Subcategory(
        'Printers',
        IconsaxPlusBold.printer,
        image: 'assets/images/HP DeskJet 2320.jpeg',
      ),
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/printers___power-removebg-preview.png',
      ),
      Subcategory('Ink & Toner', IconsaxPlusBold.colorfilter),
      Subcategory('Scanners', IconsaxPlusBold.scanner),
    ],
  ),
  Category(
    name: 'Networking & Security',
    slug: 'networking-security',
    color: Color(0xFF0E7490),
    image: 'assets/images/networking___security-removebg-preview.png',
    photo: 'assets/images/cat-networking.jpeg',
    imageScale: 1.45,
    subcategories: [
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/networking___security-removebg-preview.png',
      ),
      Subcategory('Routers', IconsaxPlusBold.routing),
      Subcategory('Switches', IconsaxPlusBold.routing),
      Subcategory('Wi-Fi', IconsaxPlusBold.wifi),
      Subcategory('CCTV', IconsaxPlusBold.camera),
    ],
  ),
  Category(
    name: 'UPS & Power',
    slug: 'ups-power',
    color: Color(0xFF1E293B),
    image: 'assets/images/components___power-removebg-preview.png',
    photo: 'assets/images/cat-components.jpeg',
    subcategories: [
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/components___power-removebg-preview.png',
      ),
      Subcategory('UPS', IconsaxPlusBold.battery_full),
      Subcategory('Power', IconsaxPlusBold.flash),
    ],
  ),
  Category(
    name: 'Software',
    slug: 'software',
    color: Color(0xFF5B21B6),
    image: 'assets/images/cat-software.png',
    photo: 'assets/images/cat-software.jpeg',
    imageScale: 1.3,
    subcategories: [
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/accessories-removebg-preview.png',
      ),
      Subcategory('Computer Software', IconsaxPlusBold.document_text),
      Subcategory('Microsoft 365 Family', IconsaxPlusBold.document_text),
    ],
  ),
  Category(
    name: 'Other Products',
    slug: 'other',
    color: Color(0xFF9F1239),
    image: 'assets/images/accessories-removebg-preview.png',
    photo: 'assets/images/cat-accessories.jpeg',
    imageScale: 1.45,
    subcategories: [
      Subcategory(
        'All',
        IconsaxPlusBold.category_2,
        image: 'assets/images/accessories-removebg-preview.png',
      ),
      Subcategory('Phones', IconsaxPlusBold.mobile),
      Subcategory('Tablets', IconsaxPlusBold.mobile),
      Subcategory('Audio', IconsaxPlusBold.headphone),
      Subcategory('Accessories', IconsaxPlusBold.mouse),
    ],
  ),
];
