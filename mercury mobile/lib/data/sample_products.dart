import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/product.dart';

/// Catalog categories shown as filter chips on the Home page.
const List<String> kCategories = [
  'All Products',
  'Laptops',
  'Printers',
  'Monitors',
  'Desktops',
  'Accessories',
];

/// Sample products modelled on Mercury Computers' real catalog.
/// Replace with API data once a backend is connected.
const List<Product> kSampleProducts = [
  Product(
    id: 'hp-250-g9',
    name: 'HP 250 G9 Laptop',
    description: '15.6" Intel Celeron N4500, 4GB RAM, 256GB SSD',
    price: 1323000,
    oldPrice: 1400000,
    category: 'Laptops',
    icon: IconsaxPlusBold.monitor,
    accent: Color(0xFFE8EEFF),
  ),
  Product(
    id: 'lenovo-ideapad-1',
    name: 'Lenovo IdeaPad 1',
    description: '14" Intel Celeron N4020, 8GB RAM, 256GB SSD',
    price: 1350000,
    oldPrice: 1500000,
    category: 'Laptops',
    icon: IconsaxPlusBold.monitor,
    accent: Color(0xFFFDEEE7),
  ),
  Product(
    id: 'hp-deskjet-2320',
    name: 'HP DeskJet 2320',
    description: 'All-in-One Printer — Print, Scan, Copy',
    price: 186000,
    oldPrice: 200000,
    category: 'Printers',
    icon: IconsaxPlusBold.printer,
    accent: Color(0xFFE7F6EF),
  ),
  Product(
    id: 'dell-e2020h',
    name: 'Dell E2020H Monitor',
    description: '20" HD+ 1600x900, TN Panel, 5ms',
    price: 437320,
    oldPrice: 481052,
    category: 'Monitors',
    icon: IconsaxPlusBold.monitor_mobbile,
    accent: Color(0xFFF1ECFB),
  ),
  Product(
    id: 'dell-optiplex-7020',
    name: 'Dell OptiPlex 7020 MT',
    description: 'Core i5, 8GB RAM, 512GB SSD + 19.5" Monitor',
    price: 2621600,
    oldPrice: 2695000,
    category: 'Desktops',
    icon: IconsaxPlusBold.devices,
    accent: Color(0xFFFFF3DC),
  ),
  Product(
    id: 'hp-smart-tank-581',
    name: 'HP Smart Tank 581',
    description: 'All-in-One Wi-Fi Printer, High Yield Ink',
    price: 560000,
    oldPrice: 620000,
    category: 'Printers',
    icon: IconsaxPlusBold.printer,
    accent: Color(0xFFE8EEFF),
  ),
];
