import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/category.dart';

/// The six top-level shop categories with their card styling and subcategories.
const List<Category> kShopCategories = [
  Category(
    name: 'Computers',
    color: Color(0xFF1F3E97),
    image: 'assets/images/computers-removebg-preview.png',
    imageScale: 1.8,
    imageScaleX: 2.15,
    imageRotationDeg: -90,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2),
      Subcategory('Laptops', IconsaxPlusBold.monitor),
      Subcategory('Desktops', IconsaxPlusBold.devices),
      Subcategory('Monitors', IconsaxPlusBold.monitor_mobbile),
      Subcategory('Tablets', IconsaxPlusBold.mobile),
      Subcategory('Software', IconsaxPlusBold.document_text),
    ],
  ),
  Category(
    name: 'Printers & Office',
    color: Color(0xFFD9620E),
    image: 'assets/images/printers___power-removebg-preview.png',
    imageScale: 1.3,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2),
      Subcategory('Printers', IconsaxPlusBold.printer),
      Subcategory('Ink & Toner', IconsaxPlusBold.colorfilter),
      Subcategory('Scanners', IconsaxPlusBold.scanner),
      Subcategory('Projectors', IconsaxPlusBold.video),
    ],
  ),
  Category(
    name: 'Components & Power',
    color: Color(0xFF1E293B),
    image: 'assets/images/components___power-removebg-preview.png',
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2),
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
    imageScale: 1.45,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2),
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
    imageScale: 1.3,
    imageScaleX: 1.5,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2),
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
    imageScale: 1.45,
    subcategories: [
      Subcategory('All', IconsaxPlusBold.category_2),
      Subcategory('Mice', IconsaxPlusBold.mouse),
      Subcategory('Keyboards', IconsaxPlusBold.keyboard),
      Subcategory('Headsets', IconsaxPlusBold.headphone),
      Subcategory('Webcams', IconsaxPlusBold.camera),
    ],
  ),
];
