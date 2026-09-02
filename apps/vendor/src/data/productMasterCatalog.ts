export interface MasterProductItem {
  product_id: string;
  name_en: string;
  name_hi_native: string;
  search_aliases: string[];
  category: string;
  categoryId: string;
  subcategory: string;
  default_gst: number;
  default_hsn: string;
  default_unit_options: string[];
  default_unit: string;
  reference_images: [string, string, string];
  description_template: string;
  suggested_tags: string[];
  default_weight_grams?: number;
  shelf_life_days?: number;
  is_perishable?: boolean;
  is_cold_chain?: boolean;
  is_fragile?: boolean;
  is_vendor_submitted?: boolean;
}

export const PRODUCT_MASTER_CATALOG: MasterProductItem[] = [
  // ==========================================
  // 1. FRUITS & VEGETABLES (FRESH VEGETABLES)
  // ==========================================
  {
    product_id: 'PRD-0001',
    name_en: 'Red Onion (Pyaz)',
    name_hi_native: 'लाल प्याज',
    search_aliases: ['pyaz', 'pyaaz', 'onion', 'kanda', 'red onion', 'dungri', 'ullipaya', 'vengayam'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07031010',
    default_unit_options: ['500g', '1 kg', '2 kg', '5 kg Bag'],
    default_unit: '1 kg',
    reference_images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
      'https://images.unsplash.com/photo-1508747703725-719777637510?w=600',
    ],
    description_template: 'Freshly harvested, firm red onions with crisp outer skin and pungent aroma. Ideal for daily Indian curries, gravies, and fresh salads. Shelf life: 7-10 days.',
    suggested_tags: ['Daily Need', 'Fresh Harvest', 'Pantry Essential', 'Kitchen Staple'],
    default_weight_grams: 1000,
    shelf_life_days: 10,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0002',
    name_en: 'Hybrid Tomato (Tamatar)',
    name_hi_native: 'टमाटर',
    search_aliases: ['tamatar', 'tamater', 'tomato', 'tamata', 'thakkali', 'tamata pandu'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07020000',
    default_unit_options: ['500g', '1 kg', '2 kg Box'],
    default_unit: '1 kg',
    reference_images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
      'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600',
      'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=600',
    ],
    description_template: 'Farm-fresh plump and juicy hybrid tomatoes, naturally ripened with balanced acidity and sweetness. Essential for gravies, purees, soups, and salads. Store in cool place.',
    suggested_tags: ['Fresh Today', 'Farm Fresh', 'Salad Special', 'Juicy'],
    default_weight_grams: 1000,
    shelf_life_days: 5,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0003',
    name_en: 'Fresh Potato (Aloo)',
    name_hi_native: 'आलू',
    search_aliases: ['aloo', 'alu', 'potato', 'batata', 'urulaikizhangu', 'bangaladumpa'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07019000',
    default_unit_options: ['500g', '1 kg', '2 kg', '5 kg Bag'],
    default_unit: '1 kg',
    reference_images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
      'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600',
      'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=600',
    ],
    description_template: 'Grade-A fresh potatoes with smooth golden skin and earthy flavour. Low moisture content suitable for frying, boiling, mashing, and traditional curries.',
    suggested_tags: ['Kitchen Staple', 'Daily Essential', 'Fresh Crop'],
    default_weight_grams: 1000,
    shelf_life_days: 14,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0004',
    name_en: 'Fresh Garlic (Lahsun)',
    name_hi_native: 'लहसुन',
    search_aliases: ['lahsun', 'lehsun', 'garlic', 'bellulli', 'poondu', 'velluli'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07032000',
    default_unit_options: ['100g', '250g', '500g', '1 kg'],
    default_unit: '250g',
    reference_images: [
      'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600',
      'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600',
      'https://images.unsplash.com/photo-1588615419957-46294d13fb5d?w=600',
    ],
    description_template: 'Aromatic unpeeled garlic cloves with strong spicy flavour and medicinal antioxidants. Perfect for tadka, pastes, marinades, and seasoning.',
    suggested_tags: ['Immunity Booster', 'Aromatic', 'Tadka Essential'],
    default_weight_grams: 250,
    shelf_life_days: 30,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0005',
    name_en: 'Fresh Ginger (Adrak)',
    name_hi_native: 'अदरक',
    search_aliases: ['adrak', 'adrakh', 'ginger', 'inji', 'allam', 'shunti'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '09101110',
    default_unit_options: ['100g', '250g', '500g'],
    default_unit: '250g',
    reference_images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600',
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600',
      'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    ],
    description_template: 'Fiery and zesty fresh ginger rhizomes, thoroughly cleaned and soil-free. Great for morning chai, ginger-garlic paste, juices, and curries.',
    suggested_tags: ['Chai Special', 'Immunity', 'Fresh Harvest'],
    default_weight_grams: 250,
    shelf_life_days: 12,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0006',
    name_en: 'Green Chilli (Hari Mirch)',
    name_hi_native: 'हरी मिर्च',
    search_aliases: ['hari mirch', 'mirchi', 'green chilli', 'chilli', 'pacha milagai', 'pachi mirapa'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07096010',
    default_unit_options: ['100g', '250g', '500g'],
    default_unit: '250g',
    reference_images: [
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600',
      'https://images.unsplash.com/photo-1526344966-89049886b28d?w=600',
    ],
    description_template: 'Crisp and spicy dark green chillies with sharp heat level. Adds fiery zest to tadkas, chutneys, and daily sabzis.',
    suggested_tags: ['Spicy', 'Fresh Today', 'Tadka Must'],
    default_weight_grams: 250,
    shelf_life_days: 7,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0007',
    name_en: 'Fresh Green Capsicum (Shimla Mirch)',
    name_hi_native: 'शिमला मिर्च',
    search_aliases: ['shimla mirch', 'capsicum', 'green bell pepper', 'bell pepper', 'kuda milagai'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07096090',
    default_unit_options: ['250g', '500g', '1 kg'],
    default_unit: '500g',
    reference_images: [
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600',
      'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600',
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
    ],
    description_template: 'Crunchy and mildly sweet green bell peppers with thick glossy walls. Perfect for stir-fries, pizza toppings, salads, and stuffed capsicum curries.',
    suggested_tags: ['Crunchy', 'Salad Special', 'Continental'],
    default_weight_grams: 500,
    shelf_life_days: 6,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0008',
    name_en: 'Fresh Lady Finger (Bhindi / Okra)',
    name_hi_native: 'भिंडी',
    search_aliases: ['bhindi', 'bhendi', 'lady finger', 'okra', 'vendakkai', 'bendakaya'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07099910',
    default_unit_options: ['250g', '500g', '1 kg'],
    default_unit: '500g',
    reference_images: [
      'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
    ],
    description_template: 'Tender, bright green farm-fresh lady fingers with non-fibrous tips. Ideal for crispy kurkuri bhindi, stuffed masala bhindi, and sambar.',
    suggested_tags: ['Tender', 'Farm Fresh', 'High Fiber'],
    default_weight_grams: 500,
    shelf_life_days: 4,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0009',
    name_en: 'Fresh Spinach (Palak Leaves)',
    name_hi_native: 'पालक',
    search_aliases: ['palak', 'spinach', 'paalak', 'keerai', 'palakura', 'pasalai'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07097000',
    default_unit_options: ['250g Bunch', '500g (2 Bunches)', '1 kg'],
    default_unit: '250g Bunch',
    reference_images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600',
      'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    ],
    description_template: 'Crisp green, soil-free hydroponic/farm spinach leaves rich in natural dietary iron and vitamins. Great for palak paneer, green smoothies, and dal palak.',
    suggested_tags: ['Iron Rich', 'Green Leafy', 'Superfood', 'Fresh Today'],
    default_weight_grams: 250,
    shelf_life_days: 3,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0010',
    name_en: 'Fresh Coriander (Dhania Leaves)',
    name_hi_native: 'धनिया पत्ती',
    search_aliases: ['dhania', 'dhaniya', 'coriander', 'cilantro', 'kothmir', 'kothamalli', 'kothimeera'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Vegetables',
    default_gst: 0,
    default_hsn: '07099990',
    default_unit_options: ['100g Bunch', '250g Bunch', '500g'],
    default_unit: '100g Bunch',
    reference_images: [
      'https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=600',
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    ],
    description_template: 'Fragrant fresh green coriander sprigs with roots. Essential for garnishing Indian curries, making green chutney, and seasoning.',
    suggested_tags: ['Garnish Essential', 'Fresh Aroma', 'Chutney Special'],
    default_weight_grams: 100,
    shelf_life_days: 4,
    is_perishable: true,
  },

  // ==========================================
  // 1. FRUITS (FRESH FRUITS)
  // ==========================================
  {
    product_id: 'PRD-0011',
    name_en: 'Ratnagiri Alphonso Mango (Hapus Aam)',
    name_hi_native: 'अल्फांसो आम',
    search_aliases: ['aam', 'alphonso', 'hapus', 'mango', 'hafoos', 'amba', 'manga', 'mamidi pandu'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Fruits',
    default_gst: 0,
    default_hsn: '08045020',
    default_unit_options: ['500g (2 pcs)', '1 kg (3-4 pcs)', 'Box of 6 pcs', 'Box of 12 pcs'],
    default_unit: '1 kg (3-4 pcs)',
    reference_images: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600',
      'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600',
    ],
    description_template: 'Authentic GI-tagged Ratnagiri Alphonso mangoes, naturally tree-ripened without carbide chemicals. Saffron-golden pulp with rich aromatic sweetness. Best consumed within 3-4 days.',
    suggested_tags: ['King of Fruits', 'GI Tagged', 'Carbide Free', 'Sweet & Juicy', 'Seasonal'],
    default_weight_grams: 1000,
    shelf_life_days: 4,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0012',
    name_en: 'Fresh Robusta Banana (Kela)',
    name_hi_native: 'केला',
    search_aliases: ['kela', 'banana', 'kele', 'robusta banana', 'vazhaipazham', 'arati pandu'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Fruits',
    default_gst: 0,
    default_hsn: '08039010',
    default_unit_options: ['500g (3-4 pcs)', '1 kg (6-8 pcs)', 'Pack of 12 (Dozen)'],
    default_unit: '1 kg (6-8 pcs)',
    reference_images: [
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600',
      'https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=600',
    ],
    description_template: 'Premium naturally ripened Robusta bananas rich in dietary potassium and instant energy. Smooth creamy texture, perfect for breakfast, smoothies, and snacking.',
    suggested_tags: ['Energy Booster', 'Breakfast Essential', 'Potassium Rich'],
    default_weight_grams: 1000,
    shelf_life_days: 4,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0013',
    name_en: 'Shimla Royal Delicious Apple (Seb)',
    name_hi_native: 'सेब',
    search_aliases: ['seb', 'apple', 'shimla apple', 'kashmiri apple', 'kinnu seb', 'aapple'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Fruits',
    default_gst: 0,
    default_hsn: '08081000',
    default_unit_options: ['500g (3-4 pcs)', '1 kg (4-6 pcs)', '2 kg Box'],
    default_unit: '1 kg (4-6 pcs)',
    reference_images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
      'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?w=600',
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600',
    ],
    description_template: 'Crisp and juicy Indian Royal Delicious apples from Himachal orchards. Natural blush red skin with sweet floral notes and high dietary fiber.',
    suggested_tags: ['Orchard Fresh', 'Antioxidant Rich', 'Daily Healthy'],
    default_weight_grams: 1000,
    shelf_life_days: 10,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0014',
    name_en: 'Nagpur Sweet Orange (Santra / Mosambi)',
    name_hi_native: 'संतरा',
    search_aliases: ['santra', 'orange', 'mosambi', 'sweet lime', 'nagpur orange', 'kithalai'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Fruits',
    default_gst: 0,
    default_hsn: '08051000',
    default_unit_options: ['1 kg (5-6 pcs)', '2 kg Bag', 'Pack of 12'],
    default_unit: '1 kg (5-6 pcs)',
    reference_images: [
      'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600',
      'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600',
      'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
    ],
    description_template: 'Juice-filled sweet Nagpur oranges loaded with 100% natural Vitamin C. Perfect for fresh morning juice extractions and fruit platters.',
    suggested_tags: ['Vitamin C', 'Juicy', 'Immunity Booster'],
    default_weight_grams: 1000,
    shelf_life_days: 7,
    is_perishable: true,
  },
  {
    product_id: 'PRD-0015',
    name_en: 'Fresh Pomegranate (Anaar)',
    name_hi_native: 'अनार',
    search_aliases: ['anaar', 'anar', 'pomegranate', 'dalimb', 'madhulai', 'danimma'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Fresh Fruits',
    default_gst: 0,
    default_hsn: '08109010',
    default_unit_options: ['500g (2 pcs)', '1 kg (3-4 pcs)', 'Peeled Arils Box (200g)'],
    default_unit: '1 kg (3-4 pcs)',
    reference_images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600',
      'https://images.unsplash.com/photo-1541344999736-83eca872f241?w=600',
      'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600',
    ],
    description_template: 'Ruby-red Bhagwa variety pomegranates packed with sweet, soft seeds and powerful antioxidants. Boosts hemoglobin and daily vitality.',
    suggested_tags: ['Heart Healthy', 'Ruby Red', 'Hemoglobin Booster'],
    default_weight_grams: 1000,
    shelf_life_days: 8,
    is_perishable: true,
  },

  // ==========================================
  // 2. DAIRY, BREAD & EGGS
  // ==========================================
  {
    product_id: 'PRD-0016',
    name_en: 'Fresh Full Cream Milk (Doodh)',
    name_hi_native: 'दूध',
    search_aliases: ['doodh', 'milk', 'dudh', 'full cream milk', 'pasteurized milk', 'paal', 'paalu'],
    category: 'Dairy, Bread & Eggs',
    categoryId: 'cat-dairy',
    subcategory: 'Milk & Milk Products',
    default_gst: 5,
    default_hsn: '04012000',
    default_unit_options: ['500 ml Pouch', '1 Litre Pouch', '2 Litre Family Pack'],
    default_unit: '1 Litre Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
      'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=600',
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
    ],
    description_template: 'Fresh pasteurized homogenized full cream milk with 6.0% fat and 9.0% SNF. Rich, creamy, and wholesome for tea, coffee, curd setting, and sweets. Keep refrigerated at 4°C.',
    suggested_tags: ['Cold Chain', 'Daily Need', 'Calcium Rich', 'Morning Essential'],
    default_weight_grams: 1000,
    shelf_life_days: 2,
    is_perishable: true,
    is_cold_chain: true,
  },
  {
    product_id: 'PRD-0017',
    name_en: 'Fresh Malai Paneer (Cottage Cheese)',
    name_hi_native: 'पनीर',
    search_aliases: ['paneer', 'cottage cheese', 'malai paneer', 'panir', 'chenna'],
    category: 'Dairy, Bread & Eggs',
    categoryId: 'cat-dairy',
    subcategory: 'Milk & Milk Products',
    default_gst: 5,
    default_hsn: '04061000',
    default_unit_options: ['200g Pack', '500g Block', '1 kg Wholesale Block'],
    default_unit: '200g Pack',
    reference_images: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
    ],
    description_template: 'Ultra-soft, melt-in-mouth malai paneer crafted from pure cow and buffalo milk. High protein vegetarian source for paneer tikka, butter masala, and bhurji.',
    suggested_tags: ['High Protein', 'Cold Chain', 'Melt in Mouth', 'Pure Veg'],
    default_weight_grams: 200,
    shelf_life_days: 15,
    is_perishable: true,
    is_cold_chain: true,
  },
  {
    product_id: 'PRD-0018',
    name_en: 'Fresh Thick Curd / Dahi',
    name_hi_native: 'दही',
    search_aliases: ['dahi', 'curd', 'yogurt', 'thayir', 'perugu', 'mosaru'],
    category: 'Dairy, Bread & Eggs',
    categoryId: 'cat-dairy',
    subcategory: 'Milk & Milk Products',
    default_gst: 5,
    default_hsn: '04031000',
    default_unit_options: ['200g Cup', '400g Pouch', '1 kg Tub'],
    default_unit: '400g Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
    ],
    description_template: 'Traditional thick and creamy probiotic curd prepared from pasteurized milk. Natural live cultures aid digestion. Perfect for chaas, raita, and lassi.',
    suggested_tags: ['Probiotic', 'Cold Chain', 'Gut Health', 'Daily Refreshment'],
    default_weight_grams: 400,
    shelf_life_days: 7,
    is_perishable: true,
    is_cold_chain: true,
  },
  {
    product_id: 'PRD-0019',
    name_en: 'Pure Desi Cow Ghee',
    name_hi_native: 'देसी घी',
    search_aliases: ['ghee', 'desi ghee', 'cow ghee', 'clarified butter', 'neyyi', 'nei', 'tuppa'],
    category: 'Dairy, Bread & Eggs',
    categoryId: 'cat-dairy',
    subcategory: 'Milk & Milk Products',
    default_gst: 12,
    default_hsn: '04059020',
    default_unit_options: ['200 ml Jar', '500 ml Tin', '1 Litre Jar', '5 Litre Tin'],
    default_unit: '1 Litre Jar',
    reference_images: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600',
    ],
    description_template: 'Golden granulated aromatic pure desi cow ghee made using traditional slow-cooking bilona methods. Enhances taste of rotis, dal tadka, halwa, and festive sweets.',
    suggested_tags: ['100% Pure', 'Danedar', 'Traditional Taste', 'Ayurvedic Goodness'],
    default_weight_grams: 1000,
    shelf_life_days: 180,
  },
  {
    product_id: 'PRD-0020',
    name_en: 'Fresh Farm Brown & White Eggs (Ande)',
    name_hi_native: 'अंडे',
    search_aliases: ['ande', 'anda', 'eggs', 'egg', 'muttai', 'guddu', 'motte'],
    category: 'Dairy, Bread & Eggs',
    categoryId: 'cat-dairy',
    subcategory: 'Eggs',
    default_gst: 0,
    default_hsn: '04072100',
    default_unit_options: ['Pack of 6 pcs', 'Pack of 12 pcs', 'Egg Tray (30 pcs)'],
    default_unit: 'Pack of 6 pcs',
    reference_images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600',
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600',
    ],
    description_template: 'Farm-fresh, sanitized unfertilized table eggs rich in high-quality protein, choline, and essential amino acids. Safe and clean packaging.',
    suggested_tags: ['High Protein', 'Gym Essential', 'Farm Fresh', 'Breakfast Champion'],
    default_weight_grams: 350,
    shelf_life_days: 14,
    is_perishable: true,
    is_fragile: true,
  },

  // ==========================================
  // 3. STAPLES, GRAINS & ATTA
  // ==========================================
  {
    product_id: 'PRD-0021',
    name_en: 'Premium Sharbati Whole Wheat Atta',
    name_hi_native: 'गेहूं का आटा',
    search_aliases: ['atta', 'aata', 'wheat flour', 'gehu atta', 'godhumai', 'godhuma pindi'],
    category: 'Staples, Grains & Atta',
    categoryId: 'cat-staples',
    subcategory: 'Atta & Flour',
    default_gst: 5,
    default_hsn: '11010000',
    default_unit_options: ['1 kg Bag', '5 kg Bag', '10 kg Value Pack'],
    default_unit: '5 kg Bag',
    reference_images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
    ],
    description_template: '100% MP Sharbati whole wheat grains ground in traditional chakki process to retain bran and dietary fiber. Produces super-soft rotis that stay fluffy for hours.',
    suggested_tags: ['100% Chakki Fresh', 'Soft Rotis', 'High Fiber', 'Pantry Staple'],
    default_weight_grams: 5000,
    shelf_life_days: 90,
  },
  {
    product_id: 'PRD-0022',
    name_en: 'Royal Aged Basmati Rice (Chawal)',
    name_hi_native: 'बासमती चावल',
    search_aliases: ['chawal', 'rice', 'basmati rice', 'biryani rice', 'arisi', 'biyyam', 'akki'],
    category: 'Staples, Grains & Atta',
    categoryId: 'cat-staples',
    subcategory: 'Rice',
    default_gst: 5,
    default_hsn: '10063010',
    default_unit_options: ['1 kg Pouch', '5 kg Bag', '10 kg Royal Bag'],
    default_unit: '1 kg Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600',
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600',
    ],
    description_template: '2-year aged extra-long grain aromatic Basmati rice. Grains elongate up to 2.5x upon cooking with non-sticky, pearl-white finish. Ideal for royal Biryanis and Pulao.',
    suggested_tags: ['Aged 2 Years', 'Extra Long Grain', 'Biryani Special', 'Aromatic'],
    default_weight_grams: 1000,
    shelf_life_days: 365,
  },
  {
    product_id: 'PRD-0023',
    name_en: 'Unpolished Toor Dal (Arhar Dal)',
    name_hi_native: 'तुअर दाल',
    search_aliases: ['toor dal', 'arhar dal', 'tuvar dal', 'toovar', 'pigeon pea', 'thuvaram paruppu', 'kandi pappu'],
    category: 'Staples, Grains & Atta',
    categoryId: 'cat-staples',
    subcategory: 'Pulses & Dals',
    default_gst: 5,
    default_hsn: '07136000',
    default_unit_options: ['500g Pouch', '1 kg Pouch', '2 kg Bag'],
    default_unit: '1 kg Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1585996882200-a6a3b2b8064b?w=600',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    ],
    description_template: '100% natural unpolished Toor Dal without artificial water, oil or marble polishing. Rich in wholesome plant protein and dietary nutrients for daily dal tadka and sambar.',
    suggested_tags: ['Unpolished', 'High Protein', 'No Chemicals', 'Daily Comfort'],
    default_weight_grams: 1000,
    shelf_life_days: 180,
  },
  {
    product_id: 'PRD-0024',
    name_en: 'Cold-Pressed Kachi Ghani Mustard Oil (Sarson Tel)',
    name_hi_native: 'सरसों का तेल',
    search_aliases: ['sarson tel', 'mustard oil', 'kachi ghani', 'oil', 'kadugu ennai', 'aava nune'],
    category: 'Staples, Grains & Atta',
    categoryId: 'cat-staples',
    subcategory: 'Cooking Oil & Ghee',
    default_gst: 5,
    default_hsn: '15149110',
    default_unit_options: ['500 ml Bottle', '1 Litre Bottle', '5 Litre Jar'],
    default_unit: '1 Litre Bottle',
    reference_images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
    ],
    description_template: 'Traditional first-press Kachi Ghani mustard oil with natural pungency and strong mustard aroma. Loaded with natural Omega-3 and MUFA for authentic Indian pickles and curries.',
    suggested_tags: ['Cold Pressed', 'Kachi Ghani', 'Authentic Aroma', 'Healthy Heart'],
    default_weight_grams: 1000,
    shelf_life_days: 270,
  },

  // ==========================================
  // 4. MASALA, SPICES & SEASONING
  // ==========================================
  {
    product_id: 'PRD-0025',
    name_en: 'Agmark Pure Turmeric Powder (Haldi)',
    name_hi_native: 'हल्दी पाउडर',
    search_aliases: ['haldi', 'turmeric', 'haldi powder', 'turmeric powder', 'manjal', 'pasupu'],
    category: 'Staples, Grains & Atta',
    categoryId: 'cat-staples',
    subcategory: 'Spices & Masalas',
    default_gst: 5,
    default_hsn: '09103020',
    default_unit_options: ['100g Pouch', '200g Pouch', '500g Zipper Pack'],
    default_unit: '200g Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600',
    ],
    description_template: 'High-curcumin (3%+) pure ground Salem turmeric powder with vibrant golden hue and natural antiseptic properties. No artificial colors or fillers.',
    suggested_tags: ['High Curcumin', 'Antiseptic', '100% Pure', 'Tadka Essential'],
    default_weight_grams: 200,
    shelf_life_days: 365,
  },
  {
    product_id: 'PRD-0026',
    name_en: 'Kashmiri Red Chilli Powder (Lal Mirch)',
    name_hi_native: 'लाल मिर्च पाउडर',
    search_aliases: ['lal mirch', 'chilli powder', 'kashmiri mirch', 'red chilli powder', 'milagai thool', 'karam podi'],
    category: 'Staples, Grains & Atta',
    categoryId: 'cat-staples',
    subcategory: 'Spices & Masalas',
    default_gst: 5,
    default_hsn: '09042211',
    default_unit_options: ['100g Pouch', '200g Pouch', '500g Pack'],
    default_unit: '200g Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',
      'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600',
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600',
    ],
    description_template: 'Finest stemless Kashmiri red chillies ground to a fine texture. Imparts rich deep crimson color and mild pleasant heat to curries without excessive burning spice.',
    suggested_tags: ['Deep Red Color', 'Mild Heat', 'Curry Special'],
    default_weight_grams: 200,
    shelf_life_days: 365,
  },

  // ==========================================
  // 5. PACKAGED FOOD & SNACKS
  // ==========================================
  {
    product_id: 'PRD-0027',
    name_en: 'Instant 2-Minute Masala Noodles (Maggi)',
    name_hi_native: 'मैगी नूडल्स',
    search_aliases: ['maggi', 'maggie', 'instant noodles', 'noodles', '2 minute noodles', 'masala noodles'],
    category: 'Snacks & Beverages',
    categoryId: 'cat-snacks',
    subcategory: 'Chips & Namkeen',
    default_gst: 12,
    default_hsn: '19023010',
    default_unit_options: ['Single Pack (70g)', 'Pack of 4 (280g)', 'Mega Pack of 12 (840g)'],
    default_unit: 'Pack of 4 (280g)',
    reference_images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
      'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600',
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
    ],
    description_template: 'India’s favourite comfort food noodles with authentic signature blend of 10 roasted Indian spices. Fortified with iron and ready in just 2 minutes.',
    suggested_tags: ['Bestseller', 'Instant Snack', 'Kids Favorite', 'Quick Food'],
    default_weight_grams: 280,
    shelf_life_days: 270,
  },
  {
    product_id: 'PRD-0028',
    name_en: 'Crispy Bikaneri Bhujia Sev',
    name_hi_native: 'बीकानेरी भुजिया',
    search_aliases: ['bhujia', 'bikaneri bhujia', 'sev', 'namkeen', 'haldiram bhujia', 'snack'],
    category: 'Snacks & Beverages',
    categoryId: 'cat-snacks',
    subcategory: 'Chips & Namkeen',
    default_gst: 12,
    default_hsn: '19059040',
    default_unit_options: ['150g Pouch', '400g Pouch', '1 kg Family Pack'],
    default_unit: '400g Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600',
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281220?w=600',
    ],
    description_template: 'Crispy, spicy moth bean and gram flour noodle snacks infused with Rajasthani hing, black pepper, and secret spice blend. Perfect tea-time accompaniment.',
    suggested_tags: ['Tea Time Snack', 'Crispy', 'Spicy', 'Authentic Bikaneri'],
    default_weight_grams: 400,
    shelf_life_days: 180,
  },

  // ==========================================
  // 6. BEVERAGES
  // ==========================================
  {
    product_id: 'PRD-0029',
    name_en: 'Assam Strong CTC Leaf Tea (Chai Patti)',
    name_hi_native: 'चाय पत्ती',
    search_aliases: ['chai patti', 'tea', 'chai', 'assam tea', 'ctc tea', 'red label', 'tata tea', 'teh'],
    category: 'Snacks & Beverages',
    categoryId: 'cat-snacks',
    subcategory: 'Soft Drinks & Juices',
    default_gst: 5,
    default_hsn: '09023020',
    default_unit_options: ['250g Box', '500g Pouch', '1 kg Value Pack'],
    default_unit: '500g Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600',
    ],
    description_template: 'Selected high-elevation Assam CTC tea granules delivering intense kadak aroma, deep amber liquor, and full-bodied taste for perfect masala kadak chai.',
    suggested_tags: ['Kadak Chai', 'Morning Boost', 'Assam Blend', 'Bestseller'],
    default_weight_grams: 500,
    shelf_life_days: 365,
  },
  {
    product_id: 'PRD-0030',
    name_en: 'Packaged Mineral Drinking Water',
    name_hi_native: 'पानी की बोतल',
    search_aliases: ['paani', 'water bottle', 'bisleri', 'drinking water', 'mineral water', 'kinley', 'aquafina'],
    category: 'Snacks & Beverages',
    categoryId: 'cat-snacks',
    subcategory: 'Soft Drinks & Juices',
    default_gst: 18,
    default_hsn: '22011010',
    default_unit_options: ['500 ml Bottle', '1 Litre Bottle', '2 Litre Bottle', '20 Litre Can'],
    default_unit: '1 Litre Bottle',
    reference_images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600',
      'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600',
    ],
    description_template: '10-stage purified mineral drinking water enriched with vital minerals like Magnesium and Potassium for safe hydration on the go.',
    suggested_tags: ['Purified', 'Added Minerals', 'Instant Hydration'],
    default_weight_grams: 1000,
    shelf_life_days: 180,
  },

  // ==========================================
  // 7. PERSONAL CARE
  // ==========================================
  {
    product_id: 'PRD-0031',
    name_en: 'Herbal Anti-Cavity Toothpaste',
    name_hi_native: 'टूथपेस्ट',
    search_aliases: ['toothpaste', 'colgate', 'pepsodent', 'sensodyne', 'dant kanti', 'tooth paste', 'palpodi'],
    category: 'Personal Care & Beauty',
    categoryId: 'cat-personal-care',
    subcategory: 'Oral Hygiene',
    default_gst: 18,
    default_hsn: '33061020',
    default_unit_options: ['100g Tube', '150g + 50g Free Pack', '200g Double Pack'],
    default_unit: '150g + 50g Free Pack',
    reference_images: [
      'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
    ],
    description_template: 'Advanced enamel-shielding fluoride toothpaste enriched with neem, clove oil, and active calcium. Fights plaque, strengthens gums, and gives 12-hour fresh breath.',
    suggested_tags: ['Cavity Protection', 'Fresh Breath', 'Daily Hygiene', 'Clove Power'],
    default_weight_grams: 200,
    shelf_life_days: 730,
  },
  {
    product_id: 'PRD-0032',
    name_en: 'Germ Protection Bathing Soap',
    name_hi_native: 'नहाने का साबुन',
    search_aliases: ['soap', 'sabun', 'dettol', 'lifebuoy', 'dove', 'lux', 'bathing soap', 'hand soap'],
    category: 'Personal Care & Beauty',
    categoryId: 'cat-personal-care',
    subcategory: 'Soaps & Body Wash',
    default_gst: 18,
    default_hsn: '34011110',
    default_unit_options: ['75g Single Bar', 'Pack of 3 (3x100g)', 'Pack of 5 Mega Saver'],
    default_unit: 'Pack of 3 (3x100g)',
    reference_images: [
      'https://images.unsplash.com/photo-1607006483606-5b321a415a77?w=600',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
    ],
    description_template: 'Antibacterial bathing soap bar with moisturizing glycerin and trusted germ-defense formula. Removes 99.9% illness-causing germs while keeping skin hydrated.',
    suggested_tags: ['Germ Protection', 'Skin Friendly', 'Family Pack'],
    default_weight_grams: 300,
    shelf_life_days: 730,
  },

  // ==========================================
  // 8. HOME & CLEANING ESSENTIALS
  // ==========================================
  {
    product_id: 'PRD-0033',
    name_en: 'Advanced Washing Detergent Powder',
    name_hi_native: 'डिटर्जेंट पाउडर',
    search_aliases: ['surf', 'detergent', 'washing powder', 'surf excel', 'ariel', 'tide', 'ghari sabun'],
    category: 'Electronics & Home Needs',
    categoryId: 'cat-electronics',
    subcategory: 'Cleaning & Detergents',
    default_gst: 18,
    default_hsn: '34029020',
    default_unit_options: ['500g Pack', '1 kg Pouch', '2 kg Box', '4 kg Saver Bucket'],
    default_unit: '1 kg Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600',
    ],
    description_template: 'Powerful stain-removal enzyme detergent powder suitable for top-load, front-load and bucket wash. Removes tough stains like grease and mud with refreshing floral fragrance.',
    suggested_tags: ['Tough Stain Removal', 'Fabric Care', 'Floral Freshness'],
    default_weight_grams: 1000,
    shelf_life_days: 730,
  },
  {
    product_id: 'PRD-0034',
    name_en: 'Lemon Active Dishwash Liquid / Bar',
    name_hi_native: 'बर्तन धोने का साबुन',
    search_aliases: ['vim', 'dishwash', 'bartan sabun', 'dishwashing gel', 'prill', 'exo'],
    category: 'Electronics & Home Needs',
    categoryId: 'cat-electronics',
    subcategory: 'Cleaning & Detergents',
    default_gst: 18,
    default_hsn: '34022010',
    default_unit_options: ['250 ml Bottle', '500 ml Bottle', '750 ml Pouch', 'Bar 300g (Pack of 3)'],
    default_unit: '500 ml Bottle',
    reference_images: [
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600',
    ],
    description_template: 'Concentrated grease-cutting dishwash gel with real lemon extracts. One spoonful cleans a full sink of utensils without scratching delicate crockery.',
    suggested_tags: ['Grease Buster', 'Real Lemon', 'No Scratches'],
    default_weight_grams: 500,
    shelf_life_days: 730,
  },

  // ==========================================
  // 9. HEALTH & WELLNESS (OTC PHARMACY)
  // ==========================================
  {
    product_id: 'PRD-0035',
    name_en: 'Instant Acidity Relief Effervescent Powder (ENO)',
    name_hi_native: 'ईनो',
    search_aliases: ['eno', 'acidity', 'digene', 'antacid', 'gas relief', 'pudinhara', 'eno sachet'],
    category: 'Medicines & Wellness',
    categoryId: 'cat-pharmacy',
    subcategory: 'OTC & Pain Relief',
    default_gst: 12,
    default_hsn: '30049099',
    default_unit_options: ['Single Sachet (5g)', 'Pack of 6 Sachets (30g)', 'Bottle (100g)'],
    default_unit: 'Pack of 6 Sachets (30g)',
    reference_images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
    ],
    description_template: 'Fast-acting fruit salt effervescent powder that neutralizes stomach acid in just 6 seconds. Gentle on stomach and restores natural comfort.',
    suggested_tags: ['Relief in 6 Sec', 'Doctor Trusted', 'Fast Acting'],
    default_weight_grams: 30,
    shelf_life_days: 730,
  },
  {
    product_id: 'PRD-0036',
    name_en: 'ORS Electrolyte Energy Drink',
    name_hi_native: 'ओआरएस घोल',
    search_aliases: ['ors', 'electral', 'electrolyte', 'energy drink', 'dehydration', 'glucon d'],
    category: 'Medicines & Wellness',
    categoryId: 'cat-pharmacy',
    subcategory: 'OTC & Pain Relief',
    default_gst: 12,
    default_hsn: '30049099',
    default_unit_options: ['200 ml Ready to Drink Tetrapack', 'Pack of 4 (4x200ml)', 'Sachet 21.8g'],
    default_unit: '200 ml Ready to Drink Tetrapack',
    reference_images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
    ],
    description_template: 'WHO-recommended oral rehydration formulation containing optimal balance of Sodium, Potassium, Chloride and Dextrose for instant hydration.',
    suggested_tags: ['WHO Recommended', 'Instant Rehydration', 'Electrolyte Balance'],
    default_weight_grams: 200,
    shelf_life_days: 365,
  },

  // ==========================================
  // 10. DRY FRUITS & NUTS
  // ==========================================
  {
    product_id: 'PRD-0037',
    name_en: 'California Raw Almonds (Badam Giri)',
    name_hi_native: 'बादाम',
    search_aliases: ['badam', 'almond', 'badam giri', 'california badam', 'dry fruit', 'badham'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Organic & Hydroponic',
    default_gst: 5,
    default_hsn: '08021200',
    default_unit_options: ['200g Zipper Pouch', '500g Zipper Pouch', '1 kg Value Pack'],
    default_unit: '500g Zipper Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600',
      'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
    ],
    description_template: 'Crunchy premium California whole almonds packed with natural Vitamin E, magnesium, and healthy dietary fats. Ideal for brain health, soaking, and snacking.',
    suggested_tags: ['Brain Food', 'Vitamin E Rich', '100% Natural', 'Healthy Heart'],
    default_weight_grams: 500,
    shelf_life_days: 270,
  },
  {
    product_id: 'PRD-0038',
    name_en: 'Whole W240 King Cashews (Kaju)',
    name_hi_native: 'काजू',
    search_aliases: ['kaju', 'cashew', 'cashewnut', 'w240 kaju', 'jeedipappu', 'munthiri'],
    category: 'Fruits & Vegetables',
    categoryId: 'cat-groceries',
    subcategory: 'Organic & Hydroponic',
    default_gst: 5,
    default_hsn: '08013210',
    default_unit_options: ['200g Pouch', '500g Pouch', '1 kg Pack'],
    default_unit: '200g Pouch',
    reference_images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600',
      'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600',
      'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600',
    ],
    description_template: 'Jumbo W240 whole white cashew nuts with rich buttery sweetness. Perfect for garnishing kheer, biryani, or roasting with black pepper.',
    suggested_tags: ['Jumbo W240', 'Rich & Buttery', 'Premium Quality'],
    default_weight_grams: 200,
    shelf_life_days: 270,
  },
];

/**
 * Intelligent Multilingual & Hinglish Fuzzy Ranking Search
 * Matches query against English name, Hindi native name, and search aliases
 * Ranking: Exact alias match (100) > Starts-with (75) > Substring contains (50)
 */
export function searchProductMaster(query: string, categoryFilterId?: string): MasterProductItem[] {
  const clean = query.trim().toLowerCase();
  let baseList = PRODUCT_MASTER_CATALOG;

  if (categoryFilterId && categoryFilterId !== 'all') {
    baseList = baseList.filter((item) => item.categoryId === categoryFilterId);
  }

  if (!clean) {
    return baseList.slice(0, 30);
  }

  const scored: { item: MasterProductItem; score: number }[] = [];

  for (const item of baseList) {
    let score = 0;
    const nameEnLower = item.name_en.toLowerCase();
    const nameHi = item.name_hi_native;

    // Check aliases
    for (const alias of item.search_aliases) {
      const aliasLower = alias.toLowerCase();
      if (aliasLower === clean) {
        score = Math.max(score, 100);
      } else if (aliasLower.startsWith(clean)) {
        score = Math.max(score, 75);
      } else if (aliasLower.includes(clean)) {
        score = Math.max(score, 50);
      }
    }

    // Check English name
    if (nameEnLower === clean) {
      score = Math.max(score, 90);
    } else if (nameEnLower.startsWith(clean)) {
      score = Math.max(score, 70);
    } else if (nameEnLower.includes(clean)) {
      score = Math.max(score, 40);
    }

    // Check Hindi native name
    if (nameHi.includes(clean)) {
      score = Math.max(score, 60);
    }

    // Check subcategory / tags
    if (item.subcategory.toLowerCase().includes(clean)) {
      score = Math.max(score, 30);
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}
