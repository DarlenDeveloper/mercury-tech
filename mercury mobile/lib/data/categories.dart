import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/category.dart';

/// The six top-level shop categories with their card styling and subcategories.
const List<Category> kShopCategories = [
  Category(
    name: 'Computers',
    color: Color(0xFF1F3E97),
    image: 'assets/images/computers-removebg-preview.png',
    photo: 'assets/images/cat-computers.jpeg',
    imageScale: 1.8,
    imageScaleX: 2.15,
    imageRotationDeg: -90,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2,
          image: 'assets/images/computers-removebg-preview.png'),
      Subcategory('Laptops', IconsaxPlusBold.monitor,
          image: 'assets/images/HP 250 G9 Laptop.jpeg'),
      Subcategory('Desktops', IconsaxPlusBold.devices,
          image:
              'assets/images/Dell OptiPlex 7020 MT (desktop + monitor).jpeg'),
      Subcategory('Monitors', IconsaxPlusBold.monitor_mobbile,
          image: 'assets/images/Dell E2020H.jpeg'),
      Subcategory('Tablets', IconsaxPlusBold.mobile),
      Subcategory('Software', IconsaxPlusBold.document_text),
    ],
  ),
  Category(
    name: 'Printers & Office',
    color: Color(0xFFD9620E),
    image: 'assets/images/printers___power-removebg-preview.png',
    photo: 'assets/images/cat-office.jpeg',
    imageScale: 1.3,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2,
          image: 'assets/images/printers___power-removebg-preview.png'),
      Subcategory('Printers', IconsaxPlusBold.printer,
          image: 'assets/images/HP DeskJet 2320.jpeg'),
      Subcategory('Ink & Toner', IconsaxPlusBold.colorfilter),
      Subcategory('Scanners', IconsaxPlusBold.scanner),
      Subcategory('Projectors', IconsaxPlusBold.video),
    ],
  ),
  Category(
    name: 'Components & Power',
    color: Color(0xFF1E293B),
    image: 'assets/images/components___power-removebg-preview.png',
    photo: 'assets/images/cat-components.jpeg',
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2,
          image: 'assets/images/components___power-removebg-preview.png'),
      Subcategory('Graphics Cards', IconsaxPlusBold.component),
      Subcategory('Memory', IconsaxPlusBold.cpu),
      Subcategory('Storage', IconsaxPlusBold.drop),
      Subcategory('Power', IconsaxPlusBold.flash),
      Subcategory('UPS', IconsaxPlusBold.battery_full),
    ],
  ),
  Category(
    name: 'Networking & Security',
    color: Color(0xFF0E7490),
    image: 'assets/images/networking___security-removebg-preview.png',
    photo: 'assets/images/cat-networking.jpeg',
    imageScale: 1.45,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2,
          image: 'assets/images/networking___security-removebg-preview.png'),
      Subcategory('Routers', IconsaxPlusBold.routing),
      Subcategory('Wi-Fi', IconsaxPlusBold.wifi),
      Subcategory('CCTV', IconsaxPlusBold.camera),
      Subcategory('Security', IconsaxPlusBold.security),
    ],
  ),
  Category(
    name: 'Phones, TV & Audio',
    color: Color(0xFF5B21B6),
    image: 'assets/images/phones_tv___audio-removebg-preview.png',
    photo: 'assets/images/cat-phones.jpeg',
    imageScale: 1.3,
    imageScaleX: 1.5,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2,
          image: 'assets/images/phones_tv___audio-removebg-preview.png'),
      Subcategory('Phones', IconsaxPlusBold.mobile),
      Subcategory('TVs', IconsaxPlusBold.monitor),
      Subcategory('Audio', IconsaxPlusBold.headphone),
      Subcategory('Speakers', IconsaxPlusBold.speaker),
    ],
  ),
  Category(
    name: 'Accessories',
    color: Color(0xFF9F1239),
    image: 'assets/images/accessories-removebg-preview.png',
    photo: 'assets/images/cat-accessories.jpeg',
    imageScale: 1.45,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2,
          image: 'assets/images/accessories-removebg-preview.png'),
      Subcategory('Mice', IconsaxPlusBold.mouse),
      Subcategory('Keyboards', IconsaxPlusBold.keyboard),
      Subcategory('Headsets', IconsaxPlusBold.headphone),
      Subcategory('Webcams', IconsaxPlusBold.camera),
    ],
  ),
];
