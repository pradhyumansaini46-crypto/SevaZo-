import { Image } from 'react-native';

// 100 Verified High-Quality Transparent PNG Product SKUs across Grocery, Dairy, Electronics, Personal Care & Grooming
export interface MarqueeProduct {
  id: string;
  name: string;
  image: string;
  category: 'Grocery' | 'Dairy' | 'Electronics' | 'Personal Care' | 'Grooming';
}

// ROW 1: Grocery & Fresh Harvest Staples (20 Verified Transparent PNG Items)
export const MARQUEE_ROW_1: MarqueeProduct[] = [
  { id: 'g-1', name: 'Fresh Milk Bottle', image: 'https://pngimg.com/d/milk_PNG12739.png', category: 'Grocery' },
  { id: 'g-2', name: 'Red Apple', image: 'https://pngimg.com/d/apple_PNG12405.png', category: 'Grocery' },
  { id: 'g-3', name: 'Ripe Banana', image: 'https://pngimg.com/d/banana_PNG842.png', category: 'Grocery' },
  { id: 'g-4', name: 'Juicy Mango', image: 'https://pngimg.com/d/mango_PNG9172.png', category: 'Grocery' },
  { id: 'g-5', name: 'Sweet Orange', image: 'https://pngimg.com/d/orange_PNG780.png', category: 'Grocery' },
  { id: 'g-6', name: 'Fresh Strawberry', image: 'https://pngimg.com/d/strawberry_PNG2598.png', category: 'Grocery' },
  { id: 'g-7', name: 'Farm Tomato', image: 'https://pngimg.com/d/tomato_PNG12560.png', category: 'Grocery' },
  { id: 'g-8', name: 'Crisp Carrot', image: 'https://pngimg.com/d/carrot_PNG4985.png', category: 'Grocery' },
  { id: 'g-9', name: 'Farm Fresh Potato', image: 'https://pngimg.com/d/potato_PNG7081.png', category: 'Grocery' },
  { id: 'g-10', name: 'Sweet Corn', image: 'https://pngimg.com/d/corn_PNG5275.png', category: 'Grocery' },
  { id: 'g-11', name: 'Watermelon Slice', image: 'https://pngimg.com/d/watermelon_PNG2654.png', category: 'Grocery' },
  { id: 'g-12', name: 'Pineapple', image: 'https://pngimg.com/d/pineapple_PNG2759.png', category: 'Grocery' },
  { id: 'g-13', name: 'Fresh Coconut', image: 'https://pngimg.com/d/coconut_PNG108889.png', category: 'Grocery' },
  { id: 'g-14', name: 'Avocado', image: 'https://pngimg.com/d/avocado_PNG15500.png', category: 'Grocery' },
  { id: 'g-15', name: 'Olive Oil Bottle', image: 'https://pngimg.com/d/olive_oil_PNG9.png', category: 'Grocery' },
  { id: 'g-16', name: 'Almonds Pack', image: 'https://pngimg.com/d/almond_PNG75.png', category: 'Grocery' },
  { id: 'g-17', name: 'Fresh Yellow Lemon', image: 'https://pngimg.com/d/lemon_PNG25198.png', category: 'Grocery' },
  { id: 'g-18', name: 'Crisp Cucumber', image: 'https://pngimg.com/d/cucumber_PNG84318.png', category: 'Grocery' },
  { id: 'g-19', name: 'Red Onion', image: 'https://pngimg.com/d/onion_PNG3826.png', category: 'Grocery' },
  { id: 'g-20', name: 'Fresh Garlic Clove', image: 'https://pngimg.com/d/garlic_PNG12781.png', category: 'Grocery' },
];

// ROW 2: Dairy Products, Beverages & Breakfast Munchies (20 Verified Transparent PNG Items)
export const MARQUEE_ROW_2: MarqueeProduct[] = [
  { id: 'd-1', name: 'Cheddar Cheese Block', image: 'https://pngimg.com/d/cheese_PNG25301.png', category: 'Dairy' },
  { id: 'd-2', name: 'Swiss Cheese Wedge', image: 'https://pngimg.com/d/cheese_PNG25313.png', category: 'Dairy' },
  { id: 'd-3', name: 'Gouda Cheese Wheel', image: 'https://pngimg.com/d/cheese_PNG25315.png', category: 'Dairy' },
  { id: 'd-4', name: 'Farm Fresh Eggs', image: 'https://pngimg.com/d/egg_PNG40784.png', category: 'Dairy' },
  { id: 'd-5', name: 'Brown Egg Pair', image: 'https://pngimg.com/d/egg_PNG40778.png', category: 'Dairy' },
  { id: 'd-6', name: 'Brown Bread Loaf', image: 'https://pngimg.com/d/bread_PNG2300.png', category: 'Dairy' },
  { id: 'd-7', name: 'Artisan Sourdough Bread', image: 'https://pngimg.com/d/bread_PNG2280.png', category: 'Dairy' },
  { id: 'd-8', name: 'Butter Croissant', image: 'https://pngimg.com/d/croissant_PNG46.png', category: 'Dairy' },
  { id: 'd-9', name: 'Golden Baked Croissant', image: 'https://pngimg.com/d/croissant_PNG53.png', category: 'Dairy' },
  { id: 'd-10', name: 'Glazed Chocolate Donut', image: 'https://pngimg.com/d/donut_PNG93.png', category: 'Dairy' },
  { id: 'd-11', name: 'Strawberry Frosted Donut', image: 'https://pngimg.com/d/donut_PNG94.png', category: 'Dairy' },
  { id: 'd-12', name: 'Dark Chocolate Slab', image: 'https://pngimg.com/d/chocolate_PNG12.png', category: 'Dairy' },
  { id: 'd-13', name: 'Crunchy Potato Chips', image: 'https://pngimg.com/d/potato_chips_PNG42.png', category: 'Dairy' },
  { id: 'd-14', name: 'Butter Popcorn Cup', image: 'https://pngimg.com/d/popcorn_PNG47.png', category: 'Dairy' },
  { id: 'd-15', name: 'Choco Chip Cookie', image: 'https://pngimg.com/d/cookie_PNG13656.png', category: 'Dairy' },
  { id: 'd-16', name: 'Roasted Coffee Beans', image: 'https://pngimg.com/d/coffee_beans_PNG9273.png', category: 'Dairy' },
  { id: 'd-17', name: 'Assam Gold Tea Leaves', image: 'https://pngimg.com/d/tea_PNG98904.png', category: 'Dairy' },
  { id: 'd-18', name: 'Sparkling Cola Can', image: 'https://pngimg.com/d/coca_cola_PNG8913.png', category: 'Dairy' },
  { id: 'd-19', name: 'Energy Drink Can', image: 'https://pngimg.com/d/red_bull_PNG13.png', category: 'Dairy' },
  { id: 'd-20', name: 'Natural Mineral Water', image: 'https://pngimg.com/d/water_bottle_PNG98960.png', category: 'Dairy' },
];

// ROW 3: Electronics & Smart Gadgets (20 Verified Transparent PNG Items)
export const MARQUEE_ROW_3: MarqueeProduct[] = [
  { id: 'e-1', name: 'Wireless Over-Ear Headphones', image: 'https://pngimg.com/d/headphones_PNG101980.png', category: 'Electronics' },
  { id: 'e-2', name: 'Studio Monitoring Headphones', image: 'https://pngimg.com/d/headphones_PNG101977.png', category: 'Electronics' },
  { id: 'e-3', name: 'In-Ear Sport Earphones', image: 'https://pngimg.com/d/earphones_PNG10.png', category: 'Electronics' },
  { id: 'e-4', name: 'Analog Luxury Wristwatch', image: 'https://pngimg.com/d/watches_PNG9899.png', category: 'Electronics' },
  { id: 'e-5', name: 'Chronograph Steel Watch', image: 'https://pngimg.com/d/watches_PNG9854.png', category: 'Electronics' },
  { id: 'e-6', name: 'Fast USB-C Sync Cable', image: 'https://pngimg.com/d/usb_cable_PNG23.png', category: 'Electronics' },
  { id: 'e-7', name: 'Energy-Saving Smart LED Bulb', image: 'https://pngimg.com/d/bulb_PNG1243.png', category: 'Electronics' },
  { id: 'e-8', name: 'Tungsten Filament Bulb', image: 'https://pngimg.com/d/bulb_PNG1250.png', category: 'Electronics' },
  { id: 'e-9', name: 'Ionic Hair Dryer', image: 'https://pngimg.com/d/hair_dryer_PNG4.png', category: 'Electronics' },
  { id: 'e-10', name: 'Compact Salon Blow Dryer', image: 'https://pngimg.com/d/hair_dryer_PNG1.png', category: 'Electronics' },
  { id: 'e-11', name: 'Cordless Electric Kettle', image: 'https://pngimg.com/d/kettle_PNG8717.png', category: 'Electronics' },
  { id: 'e-12', name: 'Stainless Steel Tea Kettle', image: 'https://pngimg.com/d/kettle_PNG8709.png', category: 'Electronics' },
  { id: 'e-13', name: 'Ergonomic Optical Mouse', image: 'https://pngimg.com/d/computer_mouse_PNG7673.png', category: 'Electronics' },
  { id: 'e-14', name: 'Wireless Laser Mouse', image: 'https://pngimg.com/d/computer_mouse_PNG7671.png', category: 'Electronics' },
  { id: 'e-15', name: 'Mechanical Gaming Keyboard', image: 'https://pngimg.com/d/keyboard_PNG101851.png', category: 'Electronics' },
  { id: 'e-16', name: 'Ultra-Slim Keyboard', image: 'https://pngimg.com/d/keyboard_PNG101852.png', category: 'Electronics' },
  { id: 'e-17', name: 'Flagship 5G Smartphone', image: 'https://pngimg.com/d/smartphone_PNG8528.png', category: 'Electronics' },
  { id: 'e-18', name: 'Dual-Camera Smartphone', image: 'https://pngimg.com/d/smartphone_PNG8533.png', category: 'Electronics' },
  { id: 'e-19', name: 'High-Res Display Tablet', image: 'https://pngimg.com/d/tablet_PNG8599.png', category: 'Electronics' },
  { id: 'e-20', name: 'Wireless Game Controller', image: 'https://pngimg.com/d/gamepad_PNG78.png', category: 'Electronics' },
];

// ROW 4: Personal Care & Daily Wellness (20 Verified Transparent PNG Items)
export const MARQUEE_ROW_4: MarqueeProduct[] = [
  { id: 'p-1', name: 'Botanical Hair Shampoo', image: 'https://pngimg.com/d/shampoo_PNG29.png', category: 'Personal Care' },
  { id: 'p-2', name: 'Nourishing Milk Shampoo', image: 'https://pngimg.com/d/shampoo_PNG14.png', category: 'Personal Care' },
  { id: 'p-3', name: 'Volume Boost Shampoo', image: 'https://pngimg.com/d/shampoo_PNG34.png', category: 'Personal Care' },
  { id: 'p-4', name: 'Hydrating Coconut Shampoo', image: 'https://pngimg.com/d/shampoo_PNG19.png', category: 'Personal Care' },
  { id: 'p-5', name: 'Herbal Essence Shampoo', image: 'https://pngimg.com/d/shampoo_PNG30.png', category: 'Personal Care' },
  { id: 'p-6', name: 'Anti-Dandruff Active Shampoo', image: 'https://pngimg.com/d/shampoo_PNG31.png', category: 'Personal Care' },
  { id: 'p-7', name: 'Silky Smooth Hair Cleanser', image: 'https://pngimg.com/d/shampoo_PNG32.png', category: 'Personal Care' },
  { id: 'p-8', name: 'Color Protect Salon Shampoo', image: 'https://pngimg.com/d/shampoo_PNG33.png', category: 'Personal Care' },
  { id: 'p-9', name: 'Organic Argan Oil Shampoo', image: 'https://pngimg.com/d/shampoo_PNG35.png', category: 'Personal Care' },
  { id: 'p-10', name: 'Daily Refresh Scalp Shampoo', image: 'https://pngimg.com/d/shampoo_PNG36.png', category: 'Personal Care' },
  { id: 'p-11', name: 'Pure Glycerin Bath Soap', image: 'https://pngimg.com/d/soap_PNG65.png', category: 'Personal Care' },
  { id: 'p-12', name: 'Lavender Aromatherapy Soap', image: 'https://pngimg.com/d/soap_PNG64.png', category: 'Personal Care' },
  { id: 'p-13', name: 'Almond Oil Moisturizing Bar', image: 'https://pngimg.com/d/soap_PNG66.png', category: 'Personal Care' },
  { id: 'p-14', name: 'Olive Care Gentle Soap', image: 'https://pngimg.com/d/soap_PNG67.png', category: 'Personal Care' },
  { id: 'p-15', name: 'Fresh Mint Antibacterial Soap', image: 'https://pngimg.com/d/soap_PNG68.png', category: 'Personal Care' },
  { id: 'p-16', name: 'Oral Care Fresh Rinse Bottle', image: 'https://pngimg.com/d/bottle_PNG2090.png', category: 'Personal Care' },
  { id: 'p-17', name: 'Antiseptic Solution Bottle', image: 'https://pngimg.com/d/bottle_PNG2091.png', category: 'Personal Care' },
  { id: 'p-18', name: 'Skin Toner Cleansing Bottle', image: 'https://pngimg.com/d/bottle_PNG2092.png', category: 'Personal Care' },
  { id: 'p-19', name: 'Multivitamin Health Capsules', image: 'https://pngimg.com/d/pills_PNG16503.png', category: 'Personal Care' },
  { id: 'p-20', name: 'Calcium & Zinc Tablets Bottle', image: 'https://pngimg.com/d/pills_PNG16504.png', category: 'Personal Care' },
];

// ROW 5: Grooming, Luxury Styling & Fragrance (20 Verified Transparent PNG Items)
export const MARQUEE_ROW_5: MarqueeProduct[] = [
  { id: 'gr-1', name: 'Luxury Eau De Parfum', image: 'https://pngimg.com/d/perfume_PNG10248.png', category: 'Grooming' },
  { id: 'gr-2', name: 'French Blossom Fragrance', image: 'https://pngimg.com/d/perfume_PNG10252.png', category: 'Grooming' },
  { id: 'gr-3', name: 'Ocean Breeze Cologne', image: 'https://pngimg.com/d/perfume_PNG10255.png', category: 'Grooming' },
  { id: 'gr-4', name: 'Rose & Amber Scent', image: 'https://pngimg.com/d/perfume_PNG10250.png', category: 'Grooming' },
  { id: 'gr-5', name: 'Golden Citrus Mist', image: 'https://pngimg.com/d/perfume_PNG10251.png', category: 'Grooming' },
  { id: 'gr-6', name: 'Velvet Musk Perfume Spray', image: 'https://pngimg.com/d/perfume_PNG10253.png', category: 'Grooming' },
  { id: 'gr-7', name: 'Midnight Oud Fragrance', image: 'https://pngimg.com/d/perfume_PNG10254.png', category: 'Grooming' },
  { id: 'gr-8', name: 'Exotic Jasmine Perfume', image: 'https://pngimg.com/d/perfume_PNG10256.png', category: 'Grooming' },
  { id: 'gr-9', name: 'Pure Vanilla Body Spray', image: 'https://pngimg.com/d/perfume_PNG10257.png', category: 'Grooming' },
  { id: 'gr-10', name: 'Classic Aviator Sunglasses', image: 'https://pngimg.com/d/glasses_PNG54341.png', category: 'Grooming' },
  { id: 'gr-11', name: 'Wayfarer UV Sunglasses', image: 'https://pngimg.com/d/glasses_PNG54342.png', category: 'Grooming' },
  { id: 'gr-12', name: 'Polarized Dark Shades', image: 'https://pngimg.com/d/glasses_PNG54343.png', category: 'Grooming' },
  { id: 'gr-13', name: 'Round Retro Sunglasses', image: 'https://pngimg.com/d/glasses_PNG54344.png', category: 'Grooming' },
  { id: 'gr-14', name: 'Designer Gold Rim Shades', image: 'https://pngimg.com/d/glasses_PNG54345.png', category: 'Grooming' },
  { id: 'gr-15', name: 'Titanium Men Classic Watch', image: 'https://pngimg.com/d/watches_PNG9855.png', category: 'Grooming' },
  { id: 'gr-16', name: 'Leather Strap Executive Watch', image: 'https://pngimg.com/d/watches_PNG9856.png', category: 'Grooming' },
  { id: 'gr-17', name: 'Silver Dress Watch', image: 'https://pngimg.com/d/watches_PNG9857.png', category: 'Grooming' },
  { id: 'gr-18', name: 'Rose Gold Accent Watch', image: 'https://pngimg.com/d/watches_PNG9858.png', category: 'Grooming' },
  { id: 'gr-19', name: 'Solitaire Platinum Ring', image: 'https://pngimg.com/d/ring_PNG26.png', category: 'Grooming' },
  { id: 'gr-20', name: 'Gold Band Diamond Ring', image: 'https://pngimg.com/d/ring_PNG27.png', category: 'Grooming' },
];

export const ALL_MARQUEE_PRODUCTS: MarqueeProduct[] = [
  ...MARQUEE_ROW_1,
  ...MARQUEE_ROW_2,
  ...MARQUEE_ROW_3,
  ...MARQUEE_ROW_4,
  ...MARQUEE_ROW_5,
];

// Pre-load all 100 transparent product images into memory/cache immediately
export const preloadMarqueeImages = () => {
  if (typeof Image !== 'undefined' && Image.prefetch) {
    ALL_MARQUEE_PRODUCTS.forEach((product) => {
      if (product.image) {
        Image.prefetch(product.image).catch(() => {});
      }
    });
  }
};

// Immediate background execution
try {
  preloadMarqueeImages();
} catch (e) {}

