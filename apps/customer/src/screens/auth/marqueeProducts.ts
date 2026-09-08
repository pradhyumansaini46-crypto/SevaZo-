// 100 Curated Transparent PNG Product SKUs across Grocery, Dairy, Electronics, Personal Care & Grooming
export interface MarqueeProduct {
  id: string;
  name: string;
  image: string;
  category: 'Grocery' | 'Dairy' | 'Electronics' | 'Personal Care' | 'Grooming';
}

// ROW 1: Grocery & Fresh Staples (20 Transparent PNG Items) - Moves Left to Right
export const MARQUEE_ROW_1: MarqueeProduct[] = [
  { id: 'g-1', name: 'Fresh Milk Bottle', image: 'https://pngimg.com/d/milk_PNG12739.png', category: 'Grocery' },
  { id: 'g-2', name: 'Red Apple', image: 'https://pngimg.com/d/apple_PNG12405.png', category: 'Grocery' },
  { id: 'g-3', name: 'Ripe Banana', image: 'https://pngimg.com/d/banana_PNG842.png', category: 'Grocery' },
  { id: 'g-4', name: 'Juicy Mango', image: 'https://pngimg.com/d/mango_PNG9172.png', category: 'Grocery' },
  { id: 'g-5', name: 'Sweet Orange', image: 'https://pngimg.com/d/orange_PNG780.png', category: 'Grocery' },
  { id: 'g-6', name: 'Fresh Strawberry', image: 'https://pngimg.com/d/strawberry_PNG2598.png', category: 'Grocery' },
  { id: 'g-7', name: 'Farm Tomato', image: 'https://pngimg.com/d/tomato_PNG12560.png', category: 'Grocery' },
  { id: 'g-8', name: 'Crisp Carrot', image: 'https://pngimg.com/d/carrot_PNG4985.png', category: 'Grocery' },
  { id: 'g-9', name: 'Green Broccoli', image: 'https://pngimg.com/d/broccoli_PNG7297.png', category: 'Grocery' },
  { id: 'g-10', name: 'Potato', image: 'https://pngimg.com/d/potato_PNG7081.png', category: 'Grocery' },
  { id: 'g-11', name: 'Sweet Corn', image: 'https://pngimg.com/d/corn_PNG5275.png', category: 'Grocery' },
  { id: 'g-12', name: 'Bell Pepper', image: 'https://pngimg.com/d/pepper_PNG3389.png', category: 'Grocery' },
  { id: 'g-13', name: 'Watermelon Slice', image: 'https://pngimg.com/d/watermelon_PNG2654.png', category: 'Grocery' },
  { id: 'g-14', name: 'Green Grapes', image: 'https://pngimg.com/d/grapes_PNG2984.png', category: 'Grocery' },
  { id: 'g-15', name: 'Pineapple', image: 'https://pngimg.com/d/pineapple_PNG2759.png', category: 'Grocery' },
  { id: 'g-16', name: 'Fresh Coconut', image: 'https://pngimg.com/d/coconut_PNG108889.png', category: 'Grocery' },
  { id: 'g-17', name: 'Avocado', image: 'https://pngimg.com/d/avocado_PNG15500.png', category: 'Grocery' },
  { id: 'g-18', name: 'Olive Oil Bottle', image: 'https://pngimg.com/d/olive_oil_PNG9.png', category: 'Grocery' },
  { id: 'g-19', name: 'Pure Honey Jar', image: 'https://pngimg.com/d/honey_PNG44.png', category: 'Grocery' },
  { id: 'g-20', name: 'Almonds Pack', image: 'https://pngimg.com/d/almond_PNG75.png', category: 'Grocery' },
];

// ROW 2: Dairy Products & Breakfast Munchies (20 Transparent PNG Items) - Moves Right to Left
export const MARQUEE_ROW_2: MarqueeProduct[] = [
  { id: 'd-1', name: 'Table Butter', image: 'https://pngimg.com/d/butter_PNG97720.png', category: 'Dairy' },
  { id: 'd-2', name: 'Cheddar Cheese Block', image: 'https://pngimg.com/d/cheese_PNG25301.png', category: 'Dairy' },
  { id: 'd-3', name: 'Swiss Cheese Slice', image: 'https://pngimg.com/d/cheese_PNG25313.png', category: 'Dairy' },
  { id: 'd-4', name: 'Fresh White Eggs', image: 'https://pngimg.com/d/egg_PNG40784.png', category: 'Dairy' },
  { id: 'd-5', name: 'Brown Bread Loaf', image: 'https://pngimg.com/d/bread_PNG2300.png', category: 'Dairy' },
  { id: 'd-6', name: 'Butter Croissant', image: 'https://pngimg.com/d/croissant_PNG46.png', category: 'Dairy' },
  { id: 'd-7', name: 'Glazed Chocolate Donut', image: 'https://pngimg.com/d/donut_PNG93.png', category: 'Dairy' },
  { id: 'd-8', name: 'Chocolate Bar', image: 'https://pngimg.com/d/chocolate_PNG93.png', category: 'Dairy' },
  { id: 'd-9', name: 'Dark Chocolate', image: 'https://pngimg.com/d/chocolate_PNG12.png', category: 'Dairy' },
  { id: 'd-10', name: 'Crunchy Potato Chips', image: 'https://pngimg.com/d/potato_chips_PNG42.png', category: 'Dairy' },
  { id: 'd-11', name: 'Butter Popcorn Cup', image: 'https://pngimg.com/d/popcorn_PNG47.png', category: 'Dairy' },
  { id: 'd-12', name: 'Choco Chip Cookie', image: 'https://pngimg.com/d/cookie_PNG13656.png', category: 'Dairy' },
  { id: 'd-13', name: 'Brewed Coffee Jar', image: 'https://pngimg.com/d/coffee_PNG96796.png', category: 'Dairy' },
  { id: 'd-14', name: 'Roasted Coffee Beans', image: 'https://pngimg.com/d/coffee_beans_PNG9273.png', category: 'Dairy' },
  { id: 'd-15', name: 'Assam Tea Pack', image: 'https://pngimg.com/d/tea_PNG98904.png', category: 'Dairy' },
  { id: 'd-16', name: 'Classic Cola Can', image: 'https://pngimg.com/d/coca_cola_PNG8913.png', category: 'Dairy' },
  { id: 'd-17', name: 'Energy Drink Can', image: 'https://pngimg.com/d/red_bull_PNG13.png', category: 'Dairy' },
  { id: 'd-18', name: 'Natural Fruit Juice', image: 'https://pngimg.com/d/juice_PNG7188.png', category: 'Dairy' },
  { id: 'd-19', name: 'Pure Water Bottle', image: 'https://pngimg.com/d/water_bottle_PNG98960.png', category: 'Dairy' },
  { id: 'd-20', name: 'Vanilla Ice Cream Cone', image: 'https://pngimg.com/d/ice_cream_PNG5103.png', category: 'Dairy' },
];

// ROW 3: Electronics & Tech Gadgets (20 Transparent PNG Items) - Moves Left to Right
export const MARQUEE_ROW_3: MarqueeProduct[] = [
  { id: 'e-1', name: 'Over-Ear Wireless Headphones', image: 'https://pngimg.com/d/headphones_PNG101980.png', category: 'Electronics' },
  { id: 'e-2', name: 'Bluetooth Earbuds Case', image: 'https://pngimg.com/d/earphones_PNG10.png', category: 'Electronics' },
  { id: 'e-3', name: 'Fitness Smartwatch', image: 'https://pngimg.com/d/smartwatch_PNG143.png', category: 'Electronics' },
  { id: 'e-4', name: 'Classic Wristwatch', image: 'https://pngimg.com/d/watches_PNG9899.png', category: 'Electronics' },
  { id: 'e-5', name: 'Fast Power Bank', image: 'https://pngimg.com/d/powerbank_PNG15.png', category: 'Electronics' },
  { id: 'e-6', name: 'Braided USB Cable', image: 'https://pngimg.com/d/usb_cable_PNG23.png', category: 'Electronics' },
  { id: 'e-7', name: 'Portable Bluetooth Speaker', image: 'https://pngimg.com/d/speaker_PNG98944.png', category: 'Electronics' },
  { id: 'e-8', name: 'Smart LED Bulb', image: 'https://pngimg.com/d/bulb_PNG1243.png', category: 'Electronics' },
  { id: 'e-9', name: 'Professional Hair Dryer', image: 'https://pngimg.com/d/hair_dryer_PNG4.png', category: 'Electronics' },
  { id: 'e-10', name: 'Electric Beard Trimmer', image: 'https://pngimg.com/d/electric_shaver_PNG18.png', category: 'Electronics' },
  { id: 'e-11', name: 'Electric Hot Kettle', image: 'https://pngimg.com/d/kettle_PNG8717.png', category: 'Electronics' },
  { id: 'e-12', name: 'Ergonomic Wireless Mouse', image: 'https://pngimg.com/d/computer_mouse_PNG7673.png', category: 'Electronics' },
  { id: 'e-13', name: 'Slim Wireless Keyboard', image: 'https://pngimg.com/d/keyboard_PNG101851.png', category: 'Electronics' },
  { id: 'e-14', name: 'High-Res Camera Lens', image: 'https://pngimg.com/d/camera_lens_PNG101340.png', category: 'Electronics' },
  { id: 'e-15', name: 'High-Speed USB Drive', image: 'https://pngimg.com/d/usb_flash_drive_PNG34.png', category: 'Electronics' },
  { id: 'e-16', name: 'Modern Smartphone', image: 'https://pngimg.com/d/smartphone_PNG8528.png', category: 'Electronics' },
  { id: 'e-17', name: 'Smart Tablet', image: 'https://pngimg.com/d/tablet_PNG8599.png', category: 'Electronics' },
  { id: 'e-18', name: 'Smart Fast Charger Plug', image: 'https://pngimg.com/d/plug_PNG55.png', category: 'Electronics' },
  { id: 'e-19', name: 'Studio USB Microphone', image: 'https://pngimg.com/d/microphone_PNG101569.png', category: 'Electronics' },
  { id: 'e-20', name: 'Wireless Game Controller', image: 'https://pngimg.com/d/gamepad_PNG78.png', category: 'Electronics' },
];

// ROW 4: Personal Care & Daily Hygiene (20 Transparent PNG Items) - Moves Right to Left
export const MARQUEE_ROW_4: MarqueeProduct[] = [
  { id: 'p-1', name: 'Daily Nourish Shampoo', image: 'https://pngimg.com/d/shampoo_PNG29.png', category: 'Personal Care' },
  { id: 'p-2', name: 'Herbal Hair Conditioner', image: 'https://pngimg.com/d/shampoo_PNG14.png', category: 'Personal Care' },
  { id: 'p-3', name: 'Moisturizing Bath Soap', image: 'https://pngimg.com/d/soap_PNG65.png', category: 'Personal Care' },
  { id: 'p-4', name: 'Cavity Protection Toothpaste', image: 'https://pngimg.com/d/toothpaste_PNG10.png', category: 'Personal Care' },
  { id: 'p-5', name: 'Soft Bristle Toothbrush', image: 'https://pngimg.com/d/toothbrush_PNG101962.png', category: 'Personal Care' },
  { id: 'p-6', name: 'Hydrating Face Cream Tub', image: 'https://pngimg.com/d/cream_PNG99025.png', category: 'Personal Care' },
  { id: 'p-7', name: 'Sun Defense SPF50 Tube', image: 'https://pngimg.com/d/cream_PNG99028.png', category: 'Personal Care' },
  { id: 'p-8', name: 'Neem Clarifying Face Wash', image: 'https://pngimg.com/d/cream_PNG99032.png', category: 'Personal Care' },
  { id: 'p-9', name: 'Instant Hand Sanitizer Spray', image: 'https://pngimg.com/d/sanitizer_PNG10.png', category: 'Personal Care' },
  { id: 'p-10', name: 'Refreshing Wet Wipes Pack', image: 'https://pngimg.com/d/tissue_paper_PNG102008.png', category: 'Personal Care' },
  { id: 'p-11', name: 'First Aid Adhesive Bandage', image: 'https://pngimg.com/d/band_aid_PNG21.png', category: 'Personal Care' },
  { id: 'p-12', name: 'Soft Facial Cotton Pads', image: 'https://pngimg.com/d/cotton_PNG102377.png', category: 'Personal Care' },
  { id: 'p-13', name: 'Herbal Hair Growth Oil', image: 'https://pngimg.com/d/oil_bottle_PNG24.png', category: 'Personal Care' },
  { id: 'p-14', name: 'Deep Cleanse Body Wash', image: 'https://pngimg.com/d/shampoo_PNG34.png', category: 'Personal Care' },
  { id: 'p-15', name: 'Glow Facial Sheet Mask', image: 'https://pngimg.com/d/mask_PNG47.png', category: 'Personal Care' },
  { id: 'p-16', name: 'Fresh Body Mist Spray', image: 'https://pngimg.com/d/spray_bottle_PNG102035.png', category: 'Personal Care' },
  { id: 'p-17', name: 'Shea Butter Hand Cream', image: 'https://pngimg.com/d/cream_PNG99040.png', category: 'Personal Care' },
  { id: 'p-18', name: 'Brightening Under Eye Cream', image: 'https://pngimg.com/d/cream_PNG99042.png', category: 'Personal Care' },
  { id: 'p-19', name: 'Cool Mint Mouthwash Bottle', image: 'https://pngimg.com/d/bottle_PNG2090.png', category: 'Personal Care' },
  { id: 'p-20', name: 'Vitamin C Health Pills Bottle', image: 'https://pngimg.com/d/pills_PNG16503.png', category: 'Personal Care' },
];

// ROW 5: Grooming, Styling & Beauty Essentials (20 Transparent PNG Items) - Rendered on Login
export const MARQUEE_ROW_5: MarqueeProduct[] = [
  { id: 'gr-1', name: 'Triple Blade Precision Razor', image: 'https://pngimg.com/d/razor_PNG101905.png', category: 'Grooming' },
  { id: 'gr-2', name: 'Classic Chrome Safety Razor', image: 'https://pngimg.com/d/razor_PNG101907.png', category: 'Grooming' },
  { id: 'gr-3', name: 'Sensitive Shaving Foam Can', image: 'https://pngimg.com/d/shaving_cream_PNG12.png', category: 'Grooming' },
  { id: 'gr-4', name: 'Luxury Eau De Parfum Bottle', image: 'https://pngimg.com/d/perfume_PNG10248.png', category: 'Grooming' },
  { id: 'gr-5', name: 'Floral Essence Fragrance', image: 'https://pngimg.com/d/perfume_PNG10252.png', category: 'Grooming' },
  { id: 'gr-6', name: 'Velvet Matte Red Lipstick', image: 'https://pngimg.com/d/lipstick_PNG10260.png', category: 'Grooming' },
  { id: 'gr-7', name: 'Nude Satin Finish Lipstick', image: 'https://pngimg.com/d/lipstick_PNG10264.png', category: 'Grooming' },
  { id: 'gr-8', name: 'Glossy Quick-Dry Nail Polish', image: 'https://pngimg.com/d/nail_polish_PNG10275.png', category: 'Grooming' },
  { id: 'gr-9', name: 'Professional Makeup Brush', image: 'https://pngimg.com/d/makeup_brush_PNG10243.png', category: 'Grooming' },
  { id: 'gr-10', name: 'Wide Tooth Styling Comb', image: 'https://pngimg.com/d/comb_PNG102283.png', category: 'Grooming' },
  { id: 'gr-11', name: 'Stainless Grooming Scissors', image: 'https://pngimg.com/d/scissors_PNG102142.png', category: 'Grooming' },
  { id: 'gr-12', name: 'Matte Face Compact Powder', image: 'https://pngimg.com/d/powder_PNG10240.png', category: 'Grooming' },
  { id: 'gr-13', name: 'Volumizing Waterproof Mascara', image: 'https://pngimg.com/d/mascara_PNG10268.png', category: 'Grooming' },
  { id: 'gr-14', name: 'Precision Black Liquid Eyeliner', image: 'https://pngimg.com/d/eyeliner_PNG10271.png', category: 'Grooming' },
  { id: 'gr-15', name: 'Strong Hold Matte Hair Wax', image: 'https://pngimg.com/d/cream_PNG99026.png', category: 'Grooming' },
  { id: 'gr-16', name: 'High Shine Hydrating Lip Gloss', image: 'https://pngimg.com/d/lipstick_PNG10266.png', category: 'Grooming' },
  { id: 'gr-17', name: 'Pocket Wooden Beard Comb', image: 'https://pngimg.com/d/comb_PNG102285.png', category: 'Grooming' },
  { id: 'gr-18', name: 'Lavender Spa Scented Candle', image: 'https://pngimg.com/d/candle_PNG102244.png', category: 'Grooming' },
  { id: 'gr-19', name: 'Soothing Aftershave Splash', image: 'https://pngimg.com/d/perfume_PNG10255.png', category: 'Grooming' },
  { id: 'gr-20', name: 'Cordless Beard & Hair Clipper', image: 'https://pngimg.com/d/electric_shaver_PNG12.png', category: 'Grooming' },
];


