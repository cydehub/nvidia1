import bcrypt from "bcryptjs";
import {
  db,
  pool,
  adminUsersTable,
  storeSettingsTable,
  categoriesTable,
  brandsTable,
  productsTable,
  productImagesTable,
  bannersTable,
  faqsTable,
  testimonialsTable,
} from "./src/index";

async function seed() {
  console.log("Seeding Cydestore database...");

  // Wipe existing data (id reset)
  await db.delete(productImagesTable);
  await db.delete(productsTable);
  await db.delete(brandsTable);
  await db.delete(categoriesTable);
  await db.delete(bannersTable);
  await db.delete(faqsTable);
  await db.delete(testimonialsTable);
  await db.delete(adminUsersTable);
  await db.delete(storeSettingsTable);

  // Admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(adminUsersTable).values({
    username: "admin",
    email: "admin@cydestore.co.ke",
    passwordHash,
  });

  // Settings
  await db.insert(storeSettingsTable).values({
    storeName: "Cydestore",
    storeTagline: "Premium electronics, friendly Nairobi service",
    logoUrl: null,
    whatsappNumber: "+254712345678",
    contactPhone: "+254 712 345 678",
    contactEmail: "cydeboost@gmail.com",
    address: "Tom Mboya Street, Rural Urban Building, Shop B4, Moi Avenue, Nairobi, Kenya",
    facebookUrl: "https://facebook.com/cydestore",
    instagramUrl: "https://instagram.com/cydestore",
    twitterUrl: "https://twitter.com/cydestore",
    footerText: "Cydestore — your trusted electronics partner in downtown Nairobi.",
    announcementText: "Free same-day CBD delivery on orders above KSh 5,000. Order on WhatsApp now.",
    heroTitle: "Genuine Electronics. Honest Prices.",
    heroSubtitle: "Laptops, smartphones, audio and accessories — handpicked and ready to ship across Kenya.",
  });

  // Categories
  const categories = await db.insert(categoriesTable).values([
    { name: "Laptops", slug: "laptops", description: "Productivity, gaming and business laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800" },
    { name: "Smartphones", slug: "smartphones", description: "Latest flagship and budget smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" },
    { name: "Tablets", slug: "tablets", description: "Tablets for work, study and play", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800" },
    { name: "Audio & Headphones", slug: "audio", description: "Headphones, earbuds and speakers", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
    { name: "Power & Charging", slug: "power", description: "Power banks, chargers and cables", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800" },
    { name: "Smart Devices", slug: "smart-devices", description: "Smartwatches and smart home gear", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800" },
    { name: "Computer Accessories", slug: "computer-accessories", description: "Mice, keyboards, hubs and more", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800" },
    { name: "Phone Accessories", slug: "phone-accessories", description: "Cases, screen protectors and stands", image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800" },
  ]).returning();
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!.id;

  // Brands
  const brands = await db.insert(brandsTable).values([
    { name: "Apple", slug: "apple", logo: null },
    { name: "Samsung", slug: "samsung", logo: null },
    { name: "Dell", slug: "dell", logo: null },
    { name: "HP", slug: "hp", logo: null },
    { name: "Lenovo", slug: "lenovo", logo: null },
    { name: "Sony", slug: "sony", logo: null },
    { name: "JBL", slug: "jbl", logo: null },
    { name: "Anker", slug: "anker", logo: null },
    { name: "Xiaomi", slug: "xiaomi", logo: null },
    { name: "Logitech", slug: "logitech", logo: null },
  ]).returning();
  const brand = (slug: string) => brands.find((b) => b.slug === slug)!.id;

  type SeedProduct = {
    name: string; slug: string; shortDescription: string; fullDescription: string;
    price: string; oldPrice?: string; sku: string; stockQuantity: number;
    stockStatus: "in_stock" | "low_stock" | "out_of_stock";
    featured?: boolean; bestSeller?: boolean; newArrival?: boolean;
    brandSlug: string; categorySlug: string;
    specs: Record<string, string>;
    images: string[];
  };

  const items: SeedProduct[] = [
    {
      name: "MacBook Air 13\" M3 (256GB)", slug: "macbook-air-13-m3-256gb",
      shortDescription: "Apple M3 chip, 8GB RAM, 256GB SSD — featherlight performance for daily work.",
      fullDescription: "The MacBook Air with M3 brings serious power in a 1.24kg fanless body. All-day battery, brilliant Liquid Retina display, and macOS that just works. Ideal for students, creators and professionals on the move.",
      price: "189000", oldPrice: "210000", sku: "CYD-MBA13-M3-256",
      stockQuantity: 8, stockStatus: "in_stock", featured: true, bestSeller: true,
      brandSlug: "apple", categorySlug: "laptops",
      specs: { Chip: "Apple M3", Memory: "8GB Unified", Storage: "256GB SSD", Display: "13.6\" Liquid Retina", Battery: "Up to 18 hours", Weight: "1.24 kg" },
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200"],
    },
    {
      name: "Dell XPS 15 (i7, 16GB, 1TB)", slug: "dell-xps-15-i7-16gb",
      shortDescription: "Premium 15.6\" workstation with InfinityEdge display and RTX graphics.",
      fullDescription: "Dell's flagship XPS 15 pairs Intel Core i7, 16GB RAM and a 1TB NVMe SSD with a stunning OLED-class display. Perfect for engineers, editors and power users.",
      price: "245000", sku: "CYD-XPS15-I7",
      stockQuantity: 3, stockStatus: "low_stock", featured: true,
      brandSlug: "dell", categorySlug: "laptops",
      specs: { Processor: "Intel Core i7-13700H", Memory: "16GB DDR5", Storage: "1TB NVMe SSD", Display: "15.6\" 3.5K OLED", Graphics: "NVIDIA RTX 4050" },
      images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200"],
    },
    {
      name: "HP Pavilion 14 (i5, 8GB, 512GB)", slug: "hp-pavilion-14-i5",
      shortDescription: "Reliable everyday laptop for school and small business.",
      fullDescription: "Slim HP Pavilion 14\" with Intel Core i5, 8GB RAM and 512GB SSD. Great battery life, fast Wi-Fi 6, and a comfortable backlit keyboard.",
      price: "92000", oldPrice: "105000", sku: "CYD-HPP14-I5",
      stockQuantity: 12, stockStatus: "in_stock", bestSeller: true,
      brandSlug: "hp", categorySlug: "laptops",
      specs: { Processor: "Intel Core i5-1235U", Memory: "8GB DDR4", Storage: "512GB SSD", Display: "14\" FHD", OS: "Windows 11" },
      images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200"],
    },
    {
      name: "Lenovo ThinkPad E14 Gen 5", slug: "lenovo-thinkpad-e14-gen5",
      shortDescription: "Business-grade durability with legendary ThinkPad keyboard.",
      fullDescription: "Built for professionals: spill-resistant keyboard, fingerprint reader, MIL-SPEC durability and Intel vPro support.",
      price: "118000", sku: "CYD-TPE14-G5",
      stockQuantity: 6, stockStatus: "in_stock", newArrival: true,
      brandSlug: "lenovo", categorySlug: "laptops",
      specs: { Processor: "Intel Core i5-1335U", Memory: "16GB DDR4", Storage: "512GB SSD", Display: "14\" WUXGA", Security: "Fingerprint + TPM 2.0" },
      images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200"],
    },
    {
      name: "iPhone 15 Pro 256GB", slug: "iphone-15-pro-256gb",
      shortDescription: "Titanium design, A17 Pro chip and a 48MP camera system.",
      fullDescription: "iPhone 15 Pro brings a lighter titanium frame, the powerful A17 Pro chip, USB-C, and a pro-grade triple camera. Action button included.",
      price: "175000", oldPrice: "195000", sku: "CYD-IP15P-256",
      stockQuantity: 5, stockStatus: "in_stock", featured: true, bestSeller: true, newArrival: true,
      brandSlug: "apple", categorySlug: "smartphones",
      specs: { Chip: "A17 Pro", Display: "6.1\" Super Retina XDR ProMotion", Storage: "256GB", Camera: "48MP + 12MP UW + 12MP Tele", Battery: "Up to 23h video" },
      images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200"],
    },
    {
      name: "Samsung Galaxy S24 Ultra 512GB", slug: "samsung-galaxy-s24-ultra",
      shortDescription: "Galaxy AI flagship with 200MP camera and built-in S Pen.",
      fullDescription: "Galaxy S24 Ultra packs Snapdragon 8 Gen 3 for Galaxy, a stunning 6.8\" QHD+ display, 200MP main camera and Galaxy AI features for translation, photo editing and search.",
      price: "189000", sku: "CYD-S24U-512",
      stockQuantity: 4, stockStatus: "low_stock", featured: true, newArrival: true,
      brandSlug: "samsung", categorySlug: "smartphones",
      specs: { Processor: "Snapdragon 8 Gen 3", Display: "6.8\" QHD+ Dynamic AMOLED", Storage: "512GB", Camera: "200MP + 50MP Tele + 12MP UW", Battery: "5000 mAh" },
      images: ["https://images.unsplash.com/photo-1610792516775-01de03eae630?w=1200"],
    },
    {
      name: "Xiaomi Redmi Note 13 Pro", slug: "xiaomi-redmi-note-13-pro",
      shortDescription: "Mid-range king with 200MP camera and 120Hz AMOLED.",
      fullDescription: "Redmi Note 13 Pro delivers flagship-tier specs at a friendly price: 200MP camera, 120Hz AMOLED, 67W fast charging.",
      price: "38500", oldPrice: "42000", sku: "CYD-RN13P",
      stockQuantity: 18, stockStatus: "in_stock", bestSeller: true,
      brandSlug: "xiaomi", categorySlug: "smartphones",
      specs: { Display: "6.67\" 120Hz AMOLED", Storage: "256GB", RAM: "8GB", Camera: "200MP main", Charging: "67W turbo" },
      images: ["https://images.unsplash.com/photo-1567581935884-3349723552ca?w=1200"],
    },
    {
      name: "iPad Air 11\" M2 (Wi-Fi, 128GB)", slug: "ipad-air-11-m2",
      shortDescription: "M2 power in a 11\" Liquid Retina canvas. Apple Pencil ready.",
      fullDescription: "iPad Air with M2 is a creator's dream — fast, light and built for note-taking, art and streaming.",
      price: "92000", sku: "CYD-IPAIR11-M2",
      stockQuantity: 7, stockStatus: "in_stock", newArrival: true,
      brandSlug: "apple", categorySlug: "tablets",
      specs: { Chip: "Apple M2", Display: "11\" Liquid Retina", Storage: "128GB", Connectivity: "Wi-Fi 6E", Pencil: "Apple Pencil Pro compatible" },
      images: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200"],
    },
    {
      name: "Samsung Galaxy Tab S9 FE", slug: "samsung-galaxy-tab-s9-fe",
      shortDescription: "10.9\" tablet with included S Pen — perfect for students.",
      fullDescription: "Galaxy Tab S9 FE brings a vivid 10.9\" display, water-resistant build and an included S Pen for note-taking and drawing.",
      price: "62000", sku: "CYD-TABS9FE",
      stockQuantity: 9, stockStatus: "in_stock",
      brandSlug: "samsung", categorySlug: "tablets",
      specs: { Display: "10.9\" 90Hz", Storage: "128GB", S_Pen: "Included", Rating: "IP68 water resistant" },
      images: ["https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=1200"],
    },
    {
      name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5",
      shortDescription: "Best-in-class noise cancelling over-ear headphones.",
      fullDescription: "Sony's flagship WH-1000XM5 delivers industry-leading noise cancellation, 30-hour battery and crystal-clear calls.",
      price: "48000", oldPrice: "55000", sku: "CYD-WH1000XM5",
      stockQuantity: 11, stockStatus: "in_stock", featured: true, bestSeller: true,
      brandSlug: "sony", categorySlug: "audio",
      specs: { Type: "Over-ear, ANC", Battery: "30 hours", Charging: "USB-C, 3 min = 3 hours", Driver: "30mm" },
      images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200"],
    },
    {
      name: "JBL Tune 770NC", slug: "jbl-tune-770nc",
      shortDescription: "Wireless ANC headphones with 70-hour battery.",
      fullDescription: "JBL Tune 770NC combines Adaptive Noise Cancellation with JBL Pure Bass sound and a massive 70-hour battery.",
      price: "14500", sku: "CYD-T770NC",
      stockQuantity: 22, stockStatus: "in_stock", newArrival: true,
      brandSlug: "jbl", categorySlug: "audio",
      specs: { Type: "Over-ear, ANC", Battery: "70 hours", Bluetooth: "5.3" },
      images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200"],
    },
    {
      name: "Apple AirPods Pro 2 (USB-C)", slug: "airpods-pro-2-usb-c",
      shortDescription: "Adaptive Audio earbuds with USB-C charging case.",
      fullDescription: "AirPods Pro 2 with USB-C bring Adaptive Audio, Conversation Awareness and improved Active Noise Cancellation.",
      price: "32500", sku: "CYD-APP2-USBC",
      stockQuantity: 0, stockStatus: "out_of_stock", featured: true,
      brandSlug: "apple", categorySlug: "audio",
      specs: { Type: "True wireless ANC", Charging: "USB-C MagSafe", Battery: "6h + 30h case" },
      images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1200"],
    },
    {
      name: "Anker PowerCore 26800mAh", slug: "anker-powercore-26800",
      shortDescription: "High-capacity power bank with 3 USB outputs.",
      fullDescription: "Anker PowerCore 26800mAh charges a phone 6+ times. Three USB-A ports with PowerIQ for fast simultaneous charging.",
      price: "7800", oldPrice: "9200", sku: "CYD-ANK-26800",
      stockQuantity: 30, stockStatus: "in_stock", bestSeller: true,
      brandSlug: "anker", categorySlug: "power",
      specs: { Capacity: "26800 mAh", Output: "3x USB-A", Recharge: "Micro-USB 6 hours" },
      images: ["https://images.unsplash.com/photo-1609592066806-2cb8b094db1c?w=1200"],
    },
    {
      name: "Anker 65W GaN Charger", slug: "anker-65w-gan-charger",
      shortDescription: "Compact 65W USB-C charger for laptops and phones.",
      fullDescription: "Powers a MacBook Air, iPad and iPhone simultaneously. Foldable plug, GaN II tech, 50% smaller than a stock 65W charger.",
      price: "5400", sku: "CYD-ANK65G",
      stockQuantity: 25, stockStatus: "in_stock",
      brandSlug: "anker", categorySlug: "power",
      specs: { Output: "65W max", Ports: "1x USB-C + 1x USB-A", Tech: "GaN II" },
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200"],
    },
    {
      name: "Apple Watch Series 9 (45mm GPS)", slug: "apple-watch-series-9-45mm",
      shortDescription: "Brighter display, double-tap gesture and S9 chip.",
      fullDescription: "Apple Watch Series 9 with the new S9 SiP, double tap, brighter 2000-nit display and on-device Siri.",
      price: "62000", sku: "CYD-AWS9-45",
      stockQuantity: 6, stockStatus: "in_stock", featured: true,
      brandSlug: "apple", categorySlug: "smart-devices",
      specs: { Size: "45mm", Connectivity: "GPS", Battery: "Up to 18 hours", Display: "Always-On Retina 2000 nits" },
      images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200"],
    },
    {
      name: "Logitech MX Master 3S", slug: "logitech-mx-master-3s",
      shortDescription: "Pro-grade wireless mouse with quiet clicks.",
      fullDescription: "MX Master 3S delivers ultra-fast scrolling, 8K DPI tracking and silent clicks. Works on glass and across 3 devices.",
      price: "13500", sku: "CYD-MXM3S",
      stockQuantity: 14, stockStatus: "in_stock", bestSeller: true,
      brandSlug: "logitech", categorySlug: "computer-accessories",
      specs: { Sensor: "8000 DPI Darkfield", Buttons: "7 customizable", Battery: "70 days", Connectivity: "Bluetooth + Logi Bolt" },
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200"],
    },
    {
      name: "Logitech K380 Multi-Device Keyboard", slug: "logitech-k380",
      shortDescription: "Compact Bluetooth keyboard for up to 3 devices.",
      fullDescription: "Type comfortably across phone, tablet and computer with the easy-switch K380. 2 years of battery life.",
      price: "5200", sku: "CYD-K380",
      stockQuantity: 20, stockStatus: "in_stock",
      brandSlug: "logitech", categorySlug: "computer-accessories",
      specs: { Layout: "Compact", Connectivity: "Bluetooth", Battery: "24 months", Devices: "Switch between 3" },
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200"],
    },
    {
      name: "Samsung 27\" 4K UHD Monitor", slug: "samsung-27-4k-monitor",
      shortDescription: "Sharp 4K IPS panel with HDR10 for work and play.",
      fullDescription: "27\" 4K UHD IPS monitor with HDR10, USB-C 90W power delivery and ergonomic stand.",
      price: "58000", sku: "CYD-SM27-4K",
      stockQuantity: 4, stockStatus: "low_stock", newArrival: true,
      brandSlug: "samsung", categorySlug: "computer-accessories",
      specs: { Size: "27 inch", Resolution: "3840x2160", Panel: "IPS", HDR: "HDR10", Ports: "USB-C 90W, HDMI, DP" },
      images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200"],
    },
    {
      name: "MagSafe Leather Case for iPhone 15 Pro", slug: "magsafe-leather-case-iphone-15-pro",
      shortDescription: "Premium MagSafe-compatible case in slate.",
      fullDescription: "Soft-touch leather case with built-in magnets for MagSafe accessories. Precise cutouts and tactile buttons.",
      price: "4500", sku: "CYD-MS-CASE-15P",
      stockQuantity: 35, stockStatus: "in_stock",
      brandSlug: "apple", categorySlug: "phone-accessories",
      specs: { Material: "Genuine leather", Compatibility: "iPhone 15 Pro", MagSafe: "Yes" },
      images: ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200"],
    },
    {
      name: "Tempered Glass Screen Protector (Pack of 2)", slug: "tempered-glass-2-pack",
      shortDescription: "9H hardness tempered glass for popular phone models.",
      fullDescription: "Two-pack of 9H tempered glass with oleophobic coating, easy-install kit included. Specify your phone model on WhatsApp.",
      price: "1200", oldPrice: "1800", sku: "CYD-TG2",
      stockQuantity: 80, stockStatus: "in_stock", bestSeller: true,
      brandSlug: "xiaomi", categorySlug: "phone-accessories",
      specs: { Hardness: "9H", Pack: "2 sheets", Coating: "Oleophobic, anti-fingerprint" },
      images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200"],
    },
  ];

  for (const it of items) {
    const [p] = await db.insert(productsTable).values({
      name: it.name, slug: it.slug,
      shortDescription: it.shortDescription, fullDescription: it.fullDescription,
      price: it.price, oldPrice: it.oldPrice ?? null,
      sku: it.sku, stockQuantity: it.stockQuantity, stockStatus: it.stockStatus,
      featured: it.featured ?? false, bestSeller: it.bestSeller ?? false,
      newArrival: it.newArrival ?? false, isPublished: true,
      seoTitle: `${it.name} | Cydestore Nairobi`,
      seoDescription: it.shortDescription,
      specifications: JSON.stringify(it.specs),
      brandId: brand(it.brandSlug),
      categoryId: cat(it.categorySlug),
    }).returning();

    await db.insert(productImagesTable).values(
      it.images.map((url, i) => ({ productId: p.id, imageUrl: url, isMain: i === 0 }))
    );
  }

  // Banners
  await db.insert(bannersTable).values([
    { title: "Order on WhatsApp. Same-day CBD delivery.", subtitle: "No card needed — chat us, confirm, and we deliver across Nairobi.", imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1600", linkUrl: "/shop", isActive: true, sortOrder: 1 },
    { title: "Apple Week — up to 12% off", subtitle: "MacBook, iPhone and iPad savings while stock lasts.", imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1600", linkUrl: "/shop?brand=apple", isActive: true, sortOrder: 2 },
    { title: "New audio drops", subtitle: "Sony, JBL and AirPods just landed.", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1600", linkUrl: "/categories/audio", isActive: true, sortOrder: 3 },
  ]);

  // FAQs
  await db.insert(faqsTable).values([
    { question: "How do I place an order?", answer: "Browse our shop, open any product, and tap the WhatsApp button. We'll confirm price, availability and delivery, then deliver to you across Kenya.", sortOrder: 1, isActive: true },
    { question: "Do you accept card payments?", answer: "We currently accept M-Pesa, bank transfer and cash on collection. Card payments are coming soon. Confirm payment options on WhatsApp before paying.", sortOrder: 2, isActive: true },
    { question: "Do you offer warranty?", answer: "Yes — all products come with the manufacturer's warranty. Cydestore also offers a 7-day shop warranty on every device.", sortOrder: 3, isActive: true },
    { question: "How long does delivery take?", answer: "Same-day delivery within Nairobi CBD for orders placed before 4pm. Countrywide delivery is 1-3 business days via G4S or Wells Fargo courier.", sortOrder: 4, isActive: true },
    { question: "Are your products genuine?", answer: "Absolutely. We source directly from authorised distributors. Every device ships sealed with original accessories.", sortOrder: 5, isActive: true },
    { question: "Can I visit the shop?", answer: "Yes — find us at Tom Mboya Street, Rural Urban Building, Shop B4, off Moi Avenue, Nairobi. Open Mon-Sat 9am-6pm.", sortOrder: 6, isActive: true },
    { question: "Do you offer bulk pricing?", answer: "Yes. Use the 'Request Bulk Price' button on any product page or message us on WhatsApp with your quantity.", sortOrder: 7, isActive: true },
  ]);

  // Testimonials
  await db.insert(testimonialsTable).values([
    { name: "Wanjiru Kamau", role: "Designer, Nairobi", avatar: null, rating: 5, comment: "Picked up my MacBook Air the same day I asked about it. Fair price and they even helped set up my Apple ID. Will buy again.", isActive: true },
    { name: "Brian Otieno", role: "Software Engineer", avatar: null, rating: 5, comment: "Honest pricing on a Galaxy S24 Ultra. The WhatsApp support is fast and the device was sealed. Recommended.", isActive: true },
    { name: "Aisha Mohammed", role: "University Student", avatar: null, rating: 4, comment: "Bought a Lenovo for school. Smooth experience and they delivered to Westlands within hours.", isActive: true },
    { name: "Mwangi & Co. Ltd", role: "Accounting Firm", avatar: null, rating: 5, comment: "Cydestore handled an order of 12 ThinkPads for our team and gave us a great bulk price. Professional service.", isActive: true },
    { name: "Faith Njeri", role: "Content Creator", avatar: null, rating: 5, comment: "The Sony WH-1000XM5s arrived in Mombasa in two days. Genuine product and the team followed up after delivery.", isActive: true },
  ]);

  console.log("Seeded admin (admin@cydestore.co.ke / admin123), settings, 8 categories, 10 brands, 20 products, banners, FAQs, testimonials.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
