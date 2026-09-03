/* Delhi Canteen demo store — swap the data helpers for REST calls when connecting a backend. */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const money = n => `Rs. ${Number(n).toFixed(0)}`;
const img = (q) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=600&q=80`;
const inlineProductId = id => `'${String(id).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
// Stock is always respected. The admin-configured max applies only when its checkbox is enabled.
const purchaseMax = p => Math.min(p?.stockQty || 0, p?.maxLimitEnabled === true ? (p?.maxBuy || p?.stockQty || 0) : (p?.stockQty || 0));

let categories = [
    ['Fresh Vegetables', 'carrot'],
    ['Fresh Fruits', 'apple'],
    ['Dairy & Eggs', 'milk'],
    ['Snacks & Munchies', 'chips'],
    ['Grocery Essentials', 'basket'],
    ['Beverages', 'tea'],
    ['Bakery', 'bread'],
    ['Personal Care', 'soap'],
    ['Meat & Seafood', 'fish'],
    ['Frozen Foods', 'ice-cream'],
    ['Home Care', 'cleaning'],
    ['Organic & Wellness', 'leaf']
];
const demoSeedProducts = {
    // 'Fresh Vegetables': [
    //     { name: 'Farm Fresh Tomato', unit: '500 g', image: 'photo-1546470427-e26264be0b0d', price: 45, mrp: 60 },
    //     { name: 'Green Capsicum', unit: '500 g', image: 'photo-1563565375-f3fdfdbefa83', price: 58, mrp: 75 },
    //     { name: 'Fresh Spinach', unit: '1 bunch', image: 'photo-1576045057995-568f588f82fb', price: 28, mrp: 35 },
    //     { name: 'Baby Potato', unit: '1 kg', image: 'photo-1518977676601-b53f82aba655', price: 52, mrp: 70 },
    //     { name: 'Carrot Crunch', unit: '500 g', image: 'photo-1509440159596-0249088772ff', price: 38, mrp: 48 },
    //     { name: 'Cucumber Fresh', unit: '500 g', image: 'photo-1464965911861-746a04bca7b2', price: 30, mrp: 40 },
    //     { name: 'Onion Premium', unit: '1 kg', image: 'photo-1502741338009-cac2772e18bc', price: 42, mrp: 55 },
    //     { name: 'Garlic Bulbs', unit: '250 g', image: 'photo-1512621776951-a57141f2eefd', price: 35, mrp: 45 },
    //     { name: 'Cauliflower', unit: '1 pc', image: 'photo-1490645935967-10de6ba17061', price: 58, mrp: 72 },
    //     { name: 'Lady Finger', unit: '500 g', image: 'photo-1514996937319-344454492b37', price: 40, mrp: 50 }
    // ],
    // 'Fresh Fruits': [
    //     { name: 'Banana Robusta', unit: '6 pcs', image: 'photo-1571771894821-ce9b6c11b08e', price: 42, mrp: 55 },
    //     { name: 'Kashmiri Apple', unit: '1 kg', image: 'photo-1560806887-1e4cd0b6cbd6', price: 148, mrp: 190 },
    //     { name: 'Sweet Orange', unit: '1 kg', image: 'photo-1547514701-42782101795e', price: 95, mrp: 125 },
    //     { name: 'Green Grapes', unit: '500 g', image: 'photo-1537640538966-79f369143f8f', price: 85, mrp: 110 },
    //     { name: 'Pomegranate', unit: '500 g', image: 'photo-1502744688674-c619d1586c9e', price: 132, mrp: 168 },
    //     { name: 'Mango Alphonso', unit: '1 kg', image: 'photo-1519996529931-28324d5a630e', price: 240, mrp: 295 },
    //     { name: 'Pear Green', unit: '500 g', image: 'photo-1579613832125-5d34a13ffe2a', price: 92, mrp: 118 },
    //     { name: 'Watermelon', unit: '1 pc', image: 'photo-1575829465337-e2624d6b6c8f', price: 70, mrp: 90 },
    //     { name: 'Kiwi Slice', unit: '4 pcs', image: 'photo-1502741338009-cac2772e18bc', price: 110, mrp: 140 },
    //     { name: 'Papaya', unit: '1 kg', image: 'photo-1464965911861-746a04bca7b2', price: 68, mrp: 88 }
    // ],
    // 'Dairy & Eggs': [
    //     { name: 'Amul Taaza Milk', unit: '1 L', image: 'photo-1550583724-b2692b85b150', price: 64, mrp: 70 },
    //     { name: 'Farm Fresh Eggs', unit: '6 pcs', image: 'photo-1582722872445-44dc5f7e3c8f', price: 72, mrp: 90 },
    //     { name: 'Amul Butter', unit: '100 g', image: 'photo-1589985270826-4b7bb135bc9d', price: 55, mrp: 60 },
    //     { name: 'Greek Yogurt', unit: '400 g', image: 'photo-1571212515416-fca325e01a94', price: 80, mrp: 100 },
    //     { name: 'Paneer Fresh', unit: '200 g', image: 'photo-1482049016688-2d3e1b311543', price: 108, mrp: 130 },
    //     { name: 'Cheese Slice', unit: '200 g', image: 'photo-1519869325930-281384150729', price: 122, mrp: 145 },
    //     { name: 'Flavored Yogurt', unit: '300 g', image: 'photo-1512621776951-a57141f2eefd', price: 70, mrp: 90 },
    //     { name: 'Cottage Cheese', unit: '250 g', image: 'photo-1516458130517-5e4a7c94f1d6', price: 92, mrp: 115 },
    //     { name: 'Egg White Box', unit: '250 g', image: 'photo-1547592180-85f173990554', price: 88, mrp: 110 },
    //     { name: 'Cream Cheese', unit: '150 g', image: 'photo-1578985545062-69928b1d9587', price: 96, mrp: 120 }
    // ],
    // 'Snacks & Munchies': [
    //     { name: 'Classic Salted Chips', unit: '100 g', image: 'photo-1566478989037-eec170784d0b', price: 35, mrp: 45 },
    //     { name: 'Masala Peanuts', unit: '200 g', image: 'photo-1599599810694-b5b37304c041', price: 62, mrp: 80 },
    //     { name: 'Roasted Makhana', unit: '100 g', image: 'photo-1621939514649-280e2ee25f60', price: 110, mrp: 145 },
    //     { name: 'Digestive Biscuits', unit: '400 g', image: 'photo-1582058091505-f87a2e55a40f', price: 65, mrp: 80 },
    //     { name: 'Cheese Crackers', unit: '150 g', image: 'photo-1542838132-92c53300491e', price: 48, mrp: 60 },
    //     { name: 'Trail Mix', unit: '250 g', image: 'photo-1517248135467-4c7edcad34c4', price: 90, mrp: 115 },
    //     { name: 'Popcorn Classic', unit: '120 g', image: 'photo-1504674900247-0877df9cc836', price: 44, mrp: 55 },
    //     { name: 'Pretzel Twist', unit: '200 g', image: 'photo-1499638673689-79a0b5115d87', price: 58, mrp: 72 },
    //     { name: 'Nutty Mix', unit: '250 g', image: 'photo-1514326640560-7d063ef2aed5', price: 102, mrp: 128 },
    //     { name: 'Baked Wafers', unit: '200 g', image: 'photo-1542838132-92c53300491e', price: 70, mrp: 90 }
    // ],
    // 'Grocery Essentials': [
    //     { name: 'India Gate Basmati Rice', unit: '1 kg', image: 'photo-1586208958839-06c17cacdf08', price: 115, mrp: 140 },
    //     { name: 'Fortune Chakki Atta', unit: '5 kg', image: 'photo-1599909533943-5b8b5d9af02e', price: 285, mrp: 340 },
    //     { name: 'Toor Dal Premium', unit: '1 kg', image: 'photo-1515543904379-3d757afe72e4', price: 165, mrp: 200 },
    //     { name: 'Sunflower Oil', unit: '1 L', image: 'photo-1474979266404-7eaacbcd87c5', price: 130, mrp: 155 },
    //     { name: 'Moong Dal', unit: '1 kg', image: 'photo-1473093295043-cdd812d0e601', price: 152, mrp: 180 },
    //     { name: 'Red Chilli Powder', unit: '250 g', image: 'photo-1498837167922-ddd27525d352', price: 70, mrp: 88 },
    //     { name: 'Turmeric Powder', unit: '250 g', image: 'photo-1509440159596-0249088772ff', price: 60, mrp: 75 },
    //     { name: 'Cumin Seeds', unit: '200 g', image: 'photo-1526318896980-cf78c088247c', price: 78, mrp: 95 },
    //     { name: 'Salt Crystal', unit: '1 kg', image: 'photo-1511690743698-d9d85f2fbf38', price: 28, mrp: 35 },
    //     { name: 'Besan Flour', unit: '500 g', image: 'photo-1496116218417-1a781b1c416c', price: 80, mrp: 100 }
    // ],
    // 'Beverages': [
    //     { name: 'Tata Tea Gold', unit: '250 g', image: 'photo-1594631252845-29fc4cc8cde9', price: 145, mrp: 175 },
    //     { name: 'Cold Coffee', unit: '250 ml', image: 'photo-1525385133512-5f058e93bd53', price: 95, mrp: 120 },
    //     { name: 'Fresh Lemon Soda', unit: '750 ml', image: 'photo-1513558161293-cdaf765ed2fd', price: 65, mrp: 80 },
    //     { name: 'Orange Juice', unit: '1 L', image: 'photo-1497534446932-c925b458314e', price: 108, mrp: 135 },
    //     { name: 'Masala Chai', unit: '200 g', image: 'photo-1495474472287-4d71bcdd2085', price: 98, mrp: 125 },
    //     { name: 'Green Tea', unit: '100 g', image: 'photo-1464226184884-fa280b87c399', price: 120, mrp: 150 },
    //     { name: 'Sparkling Water', unit: '1 L', image: 'photo-1509042239860-f550ce710b93', price: 45, mrp: 58 },
    //     { name: 'Smoothie Bottle', unit: '300 ml', image: 'photo-1547592180-85f173990554', price: 88, mrp: 112 },
    //     { name: 'Coconut Water', unit: '1 L', image: 'photo-1473093295043-cdd812d0e601', price: 78, mrp: 100 },
    //     { name: 'Iced Tea', unit: '500 ml', image: 'photo-1529042410759-befb1204b468', price: 72, mrp: 90 }
    // ],
    // 'Bakery': [
    //     { name: 'Soft Brown Bread', unit: '400 g', image: 'photo-1509440159596-0249088772ff', price: 54, mrp: 68 },
    //     { name: 'Butter Croissant', unit: '4 pcs', image: 'photo-1483695028939-c4047b6f8b7c', price: 88, mrp: 110 },
    //     { name: 'Whole Wheat Loaf', unit: '400 g', image: 'photo-1484723091739-30a097e8f929', price: 60, mrp: 76 },
    //     { name: 'Chocolate Muffin', unit: '6 pcs', image: 'photo-1517433670267-08bbd4be890f', price: 72, mrp: 90 },
    //     { name: 'Mini Donuts', unit: '200 g', image: 'photo-1509440159596-0249088772ff', price: 68, mrp: 84 },
    //     { name: 'Fruit Bun', unit: '300 g', image: 'photo-1576402187878-974f70c0d0e4', price: 58, mrp: 74 },
    //     { name: 'Sourdough Slice', unit: '300 g', image: 'photo-1509440159596-0249088772ff', price: 86, mrp: 104 },
    //     { name: 'Cookie Box', unit: '250 g', image: 'photo-1517433670267-08bbd4be890f', price: 92, mrp: 118 },
    //     { name: 'Pav Bun Pack', unit: '6 pcs', image: 'photo-1483695028939-c4047b6f8b7c', price: 46, mrp: 58 },
    //     { name: 'Baked Cake Slice', unit: '1 pc', image: 'photo-1519869325930-281384150729', price: 110, mrp: 138 }
    // ],
    // // 'Personal Care': [
    // //     { name: 'Neem Soap', unit: '125 g', image: 'photo-1571781926291-c477ebfd024b', price: 42, mrp: 52 },
    // //     { name: 'Shampoo Bottle', unit: '400 ml', image: 'photo-1608571424352-9261b2e6c4be', price: 188, mrp: 230 },
    // //     { name: 'Hand Wash', unit: '250 ml', image: 'photo-1556228720-195a672e8a03', price: 88, mrp: 110 },
    // //     { name: 'Toothpaste', unit: '100 g', image: 'photo-1556228578-8c89e6adf883', price: 78, mrp: 95 },
    // //     { name: 'Body Lotion', unit: '200 ml', image: 'photo-1571781926291-c477ebfd024b', price: 168, mrp: 205 },
    // //     { name: 'Face Wash', unit: '100 ml', image: 'photo-1543852786-1cf6624b9987', price: 132, mrp: 160 },
    // //     { name: 'Conditioner', unit: '300 ml', image: 'photo-1585386959984-a4155228a1ad', price: 156, mrp: 190 },
    // //     { name: 'Hair Oil', unit: '200 ml', image: 'photo-1515377905703-c4788e51af15', price: 114, mrp: 140 },
    // //     { name: 'Deodorant', unit: '150 ml', image: 'photo-1585386959984-a4155228a1ad', price: 148, mrp: 180 },
    // //     { name: 'Face Mask', unit: '1 pack', image: 'photo-1515377905703-c4788e51af15', price: 96, mrp: 120 }
    // // ],
    // 'Meat & Seafood': [
    //     { name: 'Chicken Breast', unit: '500 g', image: 'photo-1547592180-85f173990554', price: 220, mrp: 270 },
    //     { name: 'Fish Fillet', unit: '400 g', image: 'photo-1547592180-85f173990554', price: 260, mrp: 320 },
    //     { name: 'Prawn Jumbo', unit: '300 g', image: 'photo-1529042410759-befb1204b468', price: 310, mrp: 380 },
    //     { name: 'Mutton Curry Cut', unit: '500 g', image: 'photo-1529042410759-befb1204b468', price: 420, mrp: 500 },
    //     { name: 'Chicken Sausage', unit: '250 g', image: 'photo-1517248135467-4c7edcad34c4', price: 170, mrp: 205 },
    //     { name: 'Salmon Steak', unit: '300 g', image: 'photo-1529042410759-befb1204b468', price: 360, mrp: 440 },
    //     { name: 'Tuna Chunk', unit: '200 g', image: 'photo-1482049016688-2d3e1b311543', price: 240, mrp: 295 },
    //     { name: 'Meatballs', unit: '300 g', image: 'photo-1547592180-85f173990554', price: 190, mrp: 235 },
    //     { name: 'Pork Chop', unit: '400 g', image: 'photo-1547592180-85f173990554', price: 280, mrp: 340 },
    //     { name: 'Seafood Mix', unit: '400 g', image: 'photo-1529042410759-befb1204b468', price: 320, mrp: 390 }
    // ],
    // 'Frozen Foods': [
    //     { name: 'Frozen Peas', unit: '500 g', image: 'photo-1512621776951-a57141f2eefd', price: 95, mrp: 120 },
    //     { name: 'Chicken Nuggets', unit: '400 g', image: 'photo-1547592180-85f173990554', price: 180, mrp: 220 },
    //     { name: 'French Fries', unit: '750 g', image: 'photo-1504674900247-0877df9cc836', price: 120, mrp: 150 },
    //     { name: 'Veg Momos', unit: '400 g', image: 'photo-1498654896293-37aacf113fd9', price: 140, mrp: 175 },
    //     { name: 'Ice Cream Tub', unit: '500 ml', image: 'photo-1577303935002-0a4d2d67c4b9', price: 210, mrp: 260 },
    //     { name: 'Frozen Corn', unit: '400 g', image: 'photo-1482049016688-2d3e1b311543', price: 88, mrp: 112 },
    //     { name: 'Fish Fingers', unit: '300 g', image: 'photo-1547592180-85f173990554', price: 175, mrp: 215 },
    //     { name: 'Pizza Base', unit: '2 pcs', image: 'photo-1504674900247-0877df9cc836', price: 95, mrp: 120 },
    //     { name: 'Waffers Pack', unit: '300 g', image: 'photo-1577303935002-0a4d2d67c4b9', price: 115, mrp: 145 },
    //     { name: 'Frozen Berries', unit: '300 g', image: 'photo-1519996529931-28324d5a630e', price: 180, mrp: 220 }
    // ],
    // 'Home Care': [
    //     { name: 'Dish Wash Gel', unit: '500 ml', image: 'photo-1556228720-195a672e8a03', price: 110, mrp: 135 },
    //     { name: 'Floor Cleaner', unit: '1 L', image: 'photo-1556228578-8c89e6adf883', price: 145, mrp: 180 },
    //     { name: 'Laundry Detergent', unit: '1 kg', image: 'photo-1608571424352-9261b2e6c4be', price: 188, mrp: 230 },
    //     { name: 'Air Freshener', unit: '250 ml', image: 'photo-1571781926291-c477ebfd024b', price: 128, mrp: 160 },
    //     { name: 'Sponges Pack', unit: '4 pcs', image: 'photo-1515377905703-c4788e51af15', price: 62, mrp: 78 },
    //     { name: 'Mop Cloth', unit: '2 pcs', image: 'photo-1515377905703-c4788e51af15', price: 85, mrp: 105 },
    //     { name: 'Pine Cleaner', unit: '750 ml', image: 'photo-1556228578-8c89e6adf883', price: 158, mrp: 195 },
    //     { name: 'Toilet Cleaner', unit: '500 ml', image: 'photo-1556228720-195a672e8a03', price: 112, mrp: 140 },
    //     { name: 'Trash Bags', unit: '20 pcs', image: 'photo-1556228578-8c89e6adf883', price: 98, mrp: 120 },
    //     { name: 'Broom Set', unit: '1 set', image: 'photo-1515377905703-c4788e51af15', price: 210, mrp: 260 }
    // // ],
    // 'Organic & Wellness': [
    //     { name: 'Organic Honey', unit: '250 g', image: 'photo-1490645935967-10de6ba17061', price: 168, mrp: 205 },
    //     { name: 'Herbal Tea', unit: '100 g', image: 'photo-1495474472287-4d71bcdd2085', price: 148, mrp: 180 },
    //     { name: 'Protein Bar', unit: '6 pcs', image: 'photo-1519996529931-28324d5a630e', price: 130, mrp: 160 },
    //     { name: 'Cold Pressed Oil', unit: '500 ml', image: 'photo-1498837167922-ddd27525d352', price: 255, mrp: 310 },
    //     { name: 'Super Seeds', unit: '200 g', image: 'photo-1519869325930-281384150729', price: 148, mrp: 182 },
    //     { name: 'Oats Bowl', unit: '500 g', image: 'photo-1473093295043-cdd812d0e601', price: 122, mrp: 150 },
    //     { name: 'Turmeric Latte', unit: '200 g', image: 'photo-1495474472287-4d71bcdd2085', price: 110, mrp: 138 },
    //     { name: 'Green Smoothie', unit: '300 ml', image: 'photo-1509042239860-f550ce710b93', price: 98, mrp: 122 },
    //     { name: 'Vitamin C Pack', unit: '30 pcs', image: 'photo-1519996529931-28324d5a630e', price: 178, mrp: 220 },
    //     { name: 'Organic Mix Nuts', unit: '250 g', image: 'photo-1498837167922-ddd27525d352', price: 214, mrp: 260 }
    // ]
};
const seeds = [
    ['Fresh Vegetables', 'Farm Fresh Tomato', '500 g', 'photo-1546470427-e26264be0b0d', 45, 60], ['Fresh Vegetables', 'Green Capsicum', '500 g', 'photo-1563565375-f3fdfdbefa83', 58, 75], ['Fresh Vegetables', 'Fresh Spinach', '1 bunch', 'photo-1576045057995-568f588f82fb', 28, 35], ['Fresh Vegetables', 'Baby Potato', '1 kg', 'photo-1518977676601-b53f82aba655', 52, 70], ['Fresh Fruits', 'Banana Robusta', '6 pcs', 'photo-1571771894821-ce9b6c11b08e', 42, 55], ['Fresh Fruits', 'Kashmiri Apple', '1 kg', 'photo-1560806887-1e4cd0b6cbd6', 148, 190], ['Fresh Fruits', 'Sweet Orange', '1 kg', 'photo-1547514701-42782101795e', 95, 125], ['Fresh Fruits', 'Green Grapes', '500 g', 'photo-1537640538966-79f369143f8f', 85, 110], ['Dairy & Eggs', 'Amul Taaza Milk', '1 L', 'photo-1550583724-b2692b85b150', 64, 70], ['Dairy & Eggs', 'Farm Fresh Eggs', '6 pcs', 'photo-1582722872445-44dc5f7e3c8f', 72, 90], ['Dairy & Eggs', 'Amul Butter', '100 g', 'photo-1589985270826-4b7bb135bc9d', 55, 60], ['Dairy & Eggs', 'Greek Yogurt', '400 g', 'photo-1571212515416-fca325e01a94', 80, 100], ['Snacks & Munchies', 'Classic Salted Chips', '100 g', 'photo-1566478989037-eec170784d0b', 35, 45], ['Snacks & Munchies', 'Masala Peanuts', '200 g', 'photo-1599599810694-b5b37304c041', 62, 80], ['Snacks & Munchies', 'Roasted Makhana', '100 g', 'photo-1621939514649-280e2ee25f60', 110, 145], ['Snacks & Munchies', 'Digestive Biscuits', '400 g', 'photo-1582058091505-f87a2e55a40f', 65, 80], ['Grocery Essentials', 'India Gate Basmati Rice', '1 kg', 'photo-1586208958839-06c17cacdf08', 115, 140], ['Grocery Essentials', 'Fortune Chakki Atta', '5 kg', 'photo-1599909533943-5b8b5d9af02e', 285, 340], ['Grocery Essentials', 'Toor Dal Premium', '1 kg', 'photo-1515543904379-3d757afe72e4', 165, 200], ['Grocery Essentials', 'Sunflower Oil', '1 L', 'photo-1474979266404-7eaacbcd87c5', 130, 155], ['Beverages', 'Tata Tea Gold', '250 g', 'photo-1594631252845-29fc4cc8cde9', 145, 175], ['Beverages', 'Cold Coffee', '250 ml', 'photo-1525385133512-2f3bdd039054', 48, 60], ['Beverages', 'Mango Juice', '1 L', 'photo-1621506289937-a8e4df240d0b', 90, 110], ['Beverages', 'Sparkling Water', '750 ml', 'photo-1536939459926-301728717817', 35, 45], ['Bakery', 'Whole Wheat Bread', '400 g', 'photo-1509440159596-0249088772ff', 45, 55], ['Bakery', 'Butter Croissant', '2 pcs', 'photo-1555507036-ab1f4038808a', 68, 85], ['Bakery', 'Chocolate Muffin', '2 pcs', 'photo-1607958996333-41aef7caefaa', 75, 90], ['Bakery', 'Multigrain Buns', '4 pcs', 'photo-1509440159596-0249088772ff', 58, 70], ['Personal Care', 'Aloe Vera Soap', '125 g', 'photo-1607006483224-9f35df0dd5f3', 42, 55], ['Personal Care', 'Herbal Shampoo', '340 ml', 'photo-1556228720-195a672e8a03', 155, 190]
];
function buildDemoProducts() {
    const generated = [];
    let id = 1;
    categories.forEach(([category]) => {
        const templates = demoSeedProducts[category] || [];
        templates.forEach((template, index) => {
            [0, 1].forEach(batch => {
                const stockQty = batch === 0 ? 12 + (index % 5) * 8 : 8 + (index % 4) * 6;
                const price = template.price + batch * 8 + index * 3;
                const mrp = template.mrp + batch * 10 + index * 4;
                generated.push({
                    id: id++,
                    category,
                    name: batch ? `${template.name} ${batch + 1}` : template.name,
                    unit: template.unit,
                    image: img(template.image),
                    price,
                    mrp,
                    popular: id % 3 !== 0,
                    new: id > 120,
                    stock: stockQty > 0,
                    stockQty,
                    maxBuy: 5,
                    maxLimitEnabled: true,
                    minLimitEnabled: false
                });
            });
        });
    });
    return generated;
}
let products = buildDemoProducts();
const store = {
    get(k, f = []) { try { return JSON.parse(localStorage.getItem(k)) || f } catch { return f } }, set(k, v) { if (k === 'dc_orders' && Array.isArray(v)) v.forEach(order => { if (!order.placedAt) order.placedAt = new Date().toISOString(); if (!order.status || order.status === 'Confirmed') order.status = 'Pending' }); localStorage.setItem(k, JSON.stringify(v)) },
    cart() { return this.get('dc_cart') }, wish() { return this.get('dc_wishlist') }, user() { return this.get('dc_user', null) },
    add(id) { let p = products.find(p => String(p.id) === String(id)), c = this.cart(), x = c.find(x => String(x.id) === String(id)), limit = purchaseMax(p); if (!p || p.active === false || !p.stockQty) { toast('This product is temporarily unavailable'); return false } if ((x?.qty || 0) >= limit) { showLimitPopup(p, limit); return false } x ? x.qty++ : c.push({ id: p.id, qty: 1, product: { ...p } }); this.set('dc_cart', c); toast('Added to your cart'); updateBadge(); return true },
    qty(id, n) { const change = Number(n), cart = this.cart(); if (!Number.isFinite(change) || !change) return false; const item = cart.find(x => String(x.id) === String(id)); if (!item) return false; const product = products.find(p => String(p.id) === String(id)); let nextQty = Math.max(0, Number(item.qty) + change); if (change > 0) { if (!product || product.active === false || !product.stockQty) { toast('This product is temporarily unavailable'); return false } const limit = purchaseMax(product); if (nextQty > limit) { showLimitPopup(product, limit); return false } } const nextCart = cart.map(x => String(x.id) === String(id) ? { ...x, qty: nextQty } : x).filter(x => Number(x.qty) > 0); this.set('dc_cart', nextCart); renderCart(); updateBadge(); return true },
    toggleWish(id) { id = String(id); let w = [...new Set(this.wish().map(savedId => String(savedId)))], saved; if (w.includes(id)) { w = w.filter(savedId => savedId !== id); saved = false } else { w.push(id); saved = true } this.set('dc_wishlist', w); toast(saved ? 'Saved to wishlist' : 'Removed from wishlist'); return saved },
    logout() { localStorage.removeItem('dc_user'); location.href = 'index.html' }
};
// The admin panel writes this shared catalogue, but the demo seed should appear first so testing is populated immediately.
const demoCatalogue = buildDemoProducts();
const adminCatalogue = store.get('dc_products', null);
const shouldUseDemoCatalogue = !Array.isArray(adminCatalogue) || !adminCatalogue.length || adminCatalogue.length < 60;
if (shouldUseDemoCatalogue) {
    store.set('dc_products', demoCatalogue);
    products = demoCatalogue;
} else {
    products = adminCatalogue;
}
let catalogueSnapshot = localStorage.getItem('dc_products') || '';
function syncAdminCatalogue() { const snapshot = localStorage.getItem('dc_products') || ''; if (snapshot === catalogueSnapshot) return; catalogueSnapshot = snapshot; const catalogue = store.get('dc_products', []); if (!catalogue.length) return; products = catalogue; home(); renderProducts(); updateBadge(); }
window.addEventListener('storage', event => { if (event.key === 'dc_products') syncAdminCatalogue(); });
// Keeps mobile customer pages up to date even when browsers delay storage events between tabs.
setInterval(syncAdminCatalogue, 1200);
let categoryImagesSnapshot = localStorage.getItem('dc_category_images') || '';
function syncCategoryImages() { const snapshot = localStorage.getItem('dc_category_images') || ''; if (snapshot === categoryImagesSnapshot) return; categoryImagesSnapshot = snapshot; home(); }
window.addEventListener('storage', event => { if (event.key === 'dc_category_images') syncCategoryImages(); });
setInterval(syncCategoryImages, 1200);
function toast(msg, duration = 2200) { let e = $('.toast'); if (!e) { e = document.createElement('div'); e.className = 'toast'; document.body.append(e) } clearTimeout(e._timer); e.textContent = msg; e.classList.add('show'); e._timer = setTimeout(() => e.classList.remove('show'), duration) }
function showLimitPopup(product, limit) { toast(product?.maxLimitEnabled === true ? `Purchase limit reached — maximum ${limit} units per order.` : `Only ${limit} units are currently in stock.`, 3000) }
function showLoginRequiredPopup() { let modal = $('#login-required-popup'); if (!modal) { document.body.insertAdjacentHTML('beforeend', '<div class="login-required-modal" id="login-required-popup" role="alertdialog" aria-modal="true" aria-labelledby="login-required-title" onclick="if(event.target===this)this.remove()"><div class="login-required-card"><button class="login-required-close" type="button" aria-label="Close" onclick="this.closest(\'.login-required-modal\').remove()">×</button><div class="login-required-icon">!</div><p class="eyebrow">SIGN IN REQUIRED</p><h2 id="login-required-title">Please login to place your order</h2><p>Sign in or create an account to continue securely to checkout.</p><a class="primary wide" href="login.html?redirect=checkout.html">Login to continue</a><button class="text-btn" type="button" onclick="this.closest(\'.login-required-modal\').remove()">Continue shopping</button></div></div>'); modal = $('#login-required-popup') } modal.hidden = false }
function updateBadge() { const n = store.cart().reduce((s, x) => s + (Number(x.qty) || 0), 0); $$('.cart-count').forEach(e => e.textContent = n) }
function nav() { const user = store.user(), customerId = user?.customerId || user?.id, isCheckout = location.pathname.endsWith('checkout.html') || location.pathname.endsWith('booking_charge.html'), shoppingControls = isCheckout ? '' : `<div class="nav-search"><input id="global-product-search" name="productSearch" type="search" data-global-search placeholder="Search for atta, milk, fruits..." /><button class="nav-search-icon" aria-label="Search" onclick="showHomeSearchResults(this.previousElementSibling)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="m16 16 4 4"></path></svg></button></div><select id="global-category-filter" name="category" class="category-select"><option>All Categories</option>${categories.map(c => `<option>${c[0]}</option>`).join('')}</select>`; return `<header class="nav"><a class="brand" href="index.html"><span>दिल्ली</span> Canteen<small>daily essentials, delivered</small></a><button class="menu-toggle" aria-label="menu">☰</button>${shoppingControls}<nav class="nav-links">${customerId ? `<p class="customer-id-header">Customer ID: ${customerId}</p>` : ''}<a href="products.html">Products</a><a href="orders.html">Orders</a><a href="${user ? 'profile.html' : 'login.html'}">${user ? 'My Profile' : 'Login'}</a><a class="cart-link" href="cart.html" aria-label="Shopping cart"><svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.5L21 8H7"></path><circle cx="10" cy="20" r="1.2"></circle><circle cx="18" cy="20" r="1.2"></circle></svg><b class="cart-count">0</b></a></nav></header>` }
function mobileBottomNav() { const user = store.user(), path = location.pathname, icon = (name, paths) => `<svg class="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true" data-icon="${name}">${paths}</svg>`; let active = page => path.endsWith(page) ? 'active' : ''; return `<nav class="mobile-bottom-nav" aria-label="Mobile navigation"><a class="${active('index.html')}" href="index.html">${icon('home', '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>')}Home</a><a class="${active('products.html')}" href="products.html">${icon('products', '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')}Products</a><a class="${active('orders.html')}" href="orders.html"><span>◷</span>Orders</a><a class="${active('cart.html')}" href="cart.html">${icon('cart', '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>')}Cart <b class="cart-count">0</b></a><a class="${active(user ? 'profile.html' : 'login.html')}" href="${user ? 'profile.html' : 'login.html'}">${icon('profile', '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')}${user ? 'Profile' : 'Login'}</a></nav>` }
function footer() { return `<footer><div><a class="brand" href="index.html"><span>दिल्ली</span> Canteen</a><p>Your trusted neighborhood grocery store, now at your doorstep.</p><p class="social">◎ ◉ ◇</p></div><div><h4>Useful Links</h4><a>About us</a><a>Contact us</a><a>FAQs</a></div><div><h4>Customer Care</h4><a href="orders.html">Track order</a><a href="profile.html">My account</a><a>Returns</a></div><div><h4>We deliver happiness</h4><p>Fresh groceries every day, across Delhi.</p></div></footer>` }
function initLayout() { if (['orders.html', 'cart.html', 'profile.html', 'login.html'].some(page => location.pathname.endsWith(page))) document.body.classList.add('hide-nav-search'); if (!$('#products-page')) document.body.insertAdjacentHTML('afterbegin', nav()); document.body.insertAdjacentHTML('beforeend', footer()); if (!$('.mobile-bottom-nav')) document.body.insertAdjacentHTML('beforeend', mobileBottomNav()); updateBadge(); $('.menu-toggle')?.addEventListener('click', () => $('.nav-links').classList.toggle('open')); let globalSearch = $('[data-global-search]'); globalSearch?.addEventListener('keydown', e => { if (e.key === 'Enter') showHomeSearchResults(e.target) }); globalSearch?.addEventListener('search', e => { if (!e.target.value && location.pathname.endsWith('index.html')) showHomeSearchResults(e.target) }) }
function showHomeSearchResults(input) { if (!location.pathname.endsWith('index.html')) { location.href = `products.html?q=${encodeURIComponent(input.value)}`; return } let query = input.value.trim().toLowerCase(), section = $('#home-search-results'); if (!query) { section?.remove(); return } let matches = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)).slice(0, 10); if (!section) { section = document.createElement('section'); section.id = 'home-search-results'; section.className = 'section home-search-results'; $('.nav').insertAdjacentElement('afterend', section) } section.innerHTML = matches.length ? `<div class="section-head"><div><p class="eyebrow">SEARCH RESULTS</p><h2>Products matching “${input.value.trim()}”</h2></div><button class="text-btn" onclick="document.querySelector('#home-search-results').remove()">Clear</button></div><div class="product-grid">${matches.map(card).join('')}</div>` : `<div class="empty"><b>⌕</b><h2>No matching products found</h2><p>Try another product name.</p></div>`; section.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
function productCartControl(id) { let product = products.find(item => String(item.id) === String(id)), qty = store.cart().find(x => String(x.id) === String(id))?.qty || 0, safeId = inlineProductId(id); if (product?.active === false) return `<button class="add-btn unavailable" onclick="addProduct(${safeId})">Unavailable</button>`; return qty ? `<div class="product-qty"><button aria-label="Remove one item" onclick="changeProductQuantity(${safeId},-1)">−</button><b>${qty}</b><button aria-label="Add one item" onclick="changeProductQuantity(${safeId},1)">+</button></div>` : `<button class="add-btn" onclick="addProduct(${safeId})">Add +</button>` }
function syncProductControl(id) { document.querySelectorAll(`[data-product-control="${id}"]`).forEach(control => control.innerHTML = productCartControl(id)) }
function addProduct(id) { store.add(id); syncProductControl(id) }
function changeProductQuantity(id, amount) { store.qty(id, amount); syncProductControl(id) }
function toggleProductWish(id, button, event) { event?.preventDefault(); event?.stopPropagation(); const saved = store.toggleWish(id); button.classList.toggle('active', saved); button.setAttribute('aria-pressed', String(saved)); button.setAttribute('aria-label', `${saved ? 'Remove from' : 'Add to'} wishlist`); if ($('#wishlist-page')) renderWishlist() }
function openProductDetail(event, id) { if (event.target.closest('button')) return; location.href = `products.html?id=${id}` }
function card(p) { const id = String(p.id), safeId = inlineProductId(id), productUrl = `products.html?id=${encodeURIComponent(id)}`, w = store.wish().some(savedId => String(savedId) === id), inactive = p.active === false, limits = [p.minLimitEnabled ? `Min ${p.minBuy}` : '', p.maxLimitEnabled ? `Max ${p.maxBuy}` : ''].filter(Boolean).join(' · '), limitText = limits ? ` · ${limits}` : '', image = p.image ? `<a href="${productUrl}"><img src="${p.image}" alt="${p.name}"></a>` : `<div class="product-no-image" aria-label="No product image">No image</div>`; return `<article class="product-card ${inactive ? 'is-inactive' : ''}" role="link" tabindex="0" onclick="openProductDetail(event,${safeId})" onkeydown="if(event.key==='Enter')location.href='${productUrl}'">${inactive ? '<span class="product-inactive-badge">Inactive</span>' : ''}<button class="wish ${w ? 'active' : ''}" type="button" aria-label="${w ? 'Remove from' : 'Add to'} wishlist" aria-pressed="${w}" onclick="toggleProductWish(${safeId},this,event)">♡</button>${image}<small>${p.category}</small><h3>${p.name}</h3><p class="unit">${p.unit}</p><p class="card-stock ${p.stock ? '' : 'out'}">${inactive ? 'Temporarily unavailable' : `${p.stockQty} in stock${limitText}`}</p><div><strong>${money(p.price)}</strong> <del>${money(p.mrp)}</del></div><span class="discount">${Math.round((1 - p.price / p.mrp) * 100)}% OFF</span><div class="product-card-control" data-product-control="${id}">${productCartControl(id)}</div></article>` }
function renderProducts() { const root = $('#product-grid'); if (!root) return; let params = new URLSearchParams(location.search), detail = params.get('id'), q = (params.get('q') || '').toLowerCase(); if (detail) { const product = products.find(p => String(p.id) === detail); if (!product) { root.innerHTML = window.customerCatalogueReady ? '<div class="empty"><h2>Product not found</h2><p>This product may no longer be available.</p><a class="primary" href="products.html">Browse products</a></div>' : '<div class="empty"><h2>Loading product…</h2><p>Please wait while we load the latest product details.</p></div>'; return; } renderDetail(product); return } let filter = () => { let list = products.filter(p => (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && (!$('#category-filter').value || p.category === $('#category-filter').value)); let sort = $('#sort-filter').value; if (sort === 'low') list.sort((a, b) => a.price - b.price); if (sort === 'high') list.sort((a, b) => b.price - a.price); if (sort === 'popular') list.sort((a, b) => b.popular - a.popular); if (sort === 'new') list.sort((a, b) => b.new - a.new); root.innerHTML = list.length ? list.map(card).join('') : `<div class="empty"><b>⌕</b><h2>No products found</h2><p>Try changing your filters or search term.</p></div>` }; let search = () => { q = $('#product-search').value.toLowerCase(); filter(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }) }; let clearSearch = () => { if (!$('#product-search').value) { q = ''; filter() } }; $('#category-filter').innerHTML = '<option value="">All categories</option>' + categories.map(c => `<option>${c[0]}</option>`).join('');['#category-filter', '#sort-filter'].forEach(s => $(s).addEventListener('input', filter)); $('#product-search-button').addEventListener('click', search); $('#product-search').addEventListener('keydown', e => { if (e.key === 'Enter') search() }); $('#product-search').addEventListener('search', clearSearch); $('#product-search').value = q; filter() }
function startCustomerProductPagination(fetchPage) {
    const root = $('#product-grid'); if (!root) return;
    let search = $('#product-search'), category = $('#category-filter'), sort = $('#sort-filter');
    [search, category, sort].forEach(control => { const replacement = control.cloneNode(true); control.replaceWith(replacement); if (control === search) search = replacement; else if (control === category) category = replacement; else sort = replacement; });
    const urlParams = new URLSearchParams(location.search), initialQuery = urlParams.get('q') || '', initialCategoryId = urlParams.get('categoryId') || '';
    category.innerHTML = '<option value="">All categories</option>' + categories.map(c => { const id = Object.entries(categoryLabels).find(([, name]) => name === c[0])?.[0] || ''; return `<option value="${id}">${c[0]}</option>` }).join('');
    category.value = initialCategoryId; search.value = initialQuery;
    const state = { page: 0, loading: false, hasMore: true, observer: null, requestId: 0, pendingReset: false };
    let sentinel = document.createElement('div'); sentinel.className = 'product-pagination-status'; sentinel.setAttribute('aria-live', 'polite'); root.insertAdjacentElement('afterend', sentinel);
    const selectedCategoryId = () => category.value;
    const updateStatus = text => { sentinel.textContent = text; sentinel.hidden = false };
    const load = async (reset = false) => {
        if (reset) {
            state.requestId += 1;
            if (state.loading) { state.pendingReset = true; return; }
        }
        if (state.loading || (!reset && !state.hasMore)) return;
        if (reset) { state.page = 0; state.hasMore = true; products = []; root.innerHTML = ''; }
        state.loading = true; updateStatus('Loading more products…');
        const requestId = state.requestId;
        try {
            const response = await fetchPage({ page: state.page + 1, limit: 100, q: search.value.trim(), categoryId: selectedCategoryId(), sort: sort.value });
            if (requestId !== state.requestId) return;
            const incoming = response.items || [], known = new Set(products.map(product => String(product.id)));
            products = reset ? incoming : [...products, ...incoming.filter(product => !known.has(String(product.id)))];
            state.page = response.pagination?.page || state.page + 1; state.hasMore = Boolean(response.pagination?.hasMore);
            root.innerHTML = products.length ? products.map(card).join('') : '<div class="empty"><b>⌕</b><h2>No products found</h2><p>Try changing your filters or search term.</p></div>';
            updateStatus(state.hasMore ? '' : (products.length ? 'You have reached the end.' : ''));
        } catch (error) { updateStatus('Could not load more products. Please try again.'); console.warn('Product pagination failed:', error.message); }
        finally { state.loading = false; if (state.pendingReset) { state.pendingReset = false; load(true); } }
    };
    const reset = () => { load(true); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    window.refreshCustomerProductPagination = () => load(true);
    $('#product-search-button').onclick = reset; search.addEventListener('keydown', event => { if (event.key === 'Enter') reset(); }); search.addEventListener('search', reset); category.onchange = reset; sort.onchange = reset;
    state.observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) load(); }, { rootMargin: '500px 0px' }); state.observer.observe(sentinel); load(true);
}
function renderDetail(p) { detailQty = 1; let limit = purchaseMax(p), limitInfo = p.maxLimitEnabled ? `<span><b>Maximum ${p.maxBuy}</b> units per order</span>` : ''; $('#products-page').innerHTML = `<section class="detail"><div class="detail-image"><img src="${p.image}" alt="${p.name}"><div class="thumbs"><img src="${p.image}"><img src="${p.image}"><img src="${p.image}"></div></div><div><p class="eyebrow">${p.category}</p><h1>${p.name}</h1><p class="unit">${p.unit}</p><div class="detail-price">${money(p.price)} <del>${money(p.mrp)}</del><span>${Math.round((1 - p.price / p.mrp) * 100)}% OFF</span></div><p class="stock ${p.stock ? '' : 'out'}">${p.stock ? '● In stock, ready to deliver' : '● Currently unavailable'}</p><div class="purchase-limits"><span><b>${p.stockQty}</b> total in stock</span>${limitInfo}</div><p>Handpicked for freshness and packed with care. A dependable everyday essential for your home.</p><div class="buy-row"><div class="qty"><button onclick="changeDetail(-1,${limit})">−</button><b id="detail-qty">1</b><button onclick="changeDetail(1,${limit})">+</button></div><button class="primary" onclick="addDetail(${p.id})">Add to cart</button><button class="secondary" onclick="buyNow(${p.id})">Buy now</button></div></div></section><section class="section"><div class="section-head"><h2>You may also like</h2></div><div class="product-grid">${products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 5).map(card).join('')}</div></section>` }
let detailQty = 1; function changeDetail(x, maxBuy) { detailQty = Math.max(1, Math.min(maxBuy, detailQty + x)); $('#detail-qty').textContent = detailQty } function addDetail(id) { for (let i = 0; i < detailQty; i++)store.add(id) } function buyNow(id) { if (store.add(id)) location.href = 'checkout.html' }
function renderCart() { let root = $('#cart-page'); if (!root) return; let t = cartTotals(), couponBox = t.coupon ? `<div class="coupon coupon-applied"><div><b>🏷️ ${t.coupon.code} applied</b><small>${t.coupon.label}</small></div><button type="button" class="coupon-remove" data-remove-coupon>Remove</button></div>` : `<div class="coupon"><b>🏷️ Have a coupon?</b><input id="coupon-code" name="couponCode" placeholder="Enter coupon code"><button type="button" data-apply-coupon>Apply</button></div>`; root.innerHTML = t.items.length ? `<section class="page-heading"><p class="eyebrow">YOUR BASKET</p><h1>Shopping cart</h1></section><div class="cart-layout"><div><div class="cart-items">${t.items.map(x => `<article class="cart-item" data-cart-item-id="${encodeURIComponent(String(x.id))}"><img src="${x.p.image}"><div><h3>${x.p.name}</h3><p>${x.p.unit}</p><div class="cart-price"><strong>${money(x.p.price)}</strong><del>${money(x.p.mrp)}</del><span>${Math.round((1 - x.p.price / x.p.mrp) * 100)}% OFF</span></div></div><div class="qty"><button type="button" data-cart-quantity="-1" aria-label="Decrease quantity">−</button><b>${x.qty}</b><button type="button" data-cart-quantity="1" aria-label="Increase quantity">+</button></div><button type="button" class="remove" data-cart-remove>Remove</button></article>`).join('')}</div>${couponBox}</div><aside>${summary(t)}<a class="primary wide" href="checkout.html">Proceed to checkout →</a></aside></div>` : `<section class="empty cart-empty"><b>🛒</b><h1>Cart is Empty</h1><p>Add some groceries to proceed to checkout.</p><a class="primary" href="products.html">Start shopping</a></section>` }
function checkout() { let root = $('#checkout-page'); if (!root) return; if (!store.user()) { showLoginRequiredPopup(); return } let t = cartTotals(); if (!t.items.length) { location.href = 'cart.html'; return } root.innerHTML = `<section class="page-heading"><p class="eyebrow">ONE LAST STEP</p><h1>Checkout</h1></section><div class="checkout-layout"><form id="checkout-form" class="checkout-form"><h2>Delivery details</h2><label>Customer name<input required name="name" placeholder="Your full name" value="${store.user()?.name || ''}"></label><label>Phone number<input required name="phone" pattern="[0-9]{10}" placeholder="10-digit mobile number" value="${store.user()?.phone || ''}"></label><label>Payment mode<select name="mode" id="payment-mode"><option>Cash on Delivery</option><option>Online Payment</option><option>Self Take (Store Pickup)</option></select></label><div id="address-fields"><label>Complete address<textarea required name="address" placeholder="House no., street, locality, Delhi"></textarea></label></div><div class="pickup-box" hidden><b>Store Pickup Address</b><p>Delhi Canteen Grocery Store<br>24 Market Road, New Delhi — 110001</p></div><button class="primary wide">Place order →</button></form><aside><h2>Order summary</h2>${t.items.map(x => `<p class="mini-item">${x.p.name} × ${x.qty}<b>${money(x.p.price * x.qty)}</b></p>`).join('')}<div id="checkout-summary">${summary(t)}</div></aside></div>`; let mode = $('#payment-mode'); mode.onchange = () => { let pick = mode.value.includes('Self'); $('#address-fields').hidden = pick; $('.pickup-box').hidden = !pick; $('#checkout-summary').innerHTML = summary(t, pick) }; $('#checkout-form').onsubmit = e => { e.preventDefault(); let f = new FormData(e.target), pickup = f.get('mode').includes('Self'), order = { id: 'DC' + Date.now().toString().slice(-7), date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), items: t.items.map(x => ({ id: x.id, qty: x.qty })), total: t.total + t.handling + (pickup ? 0 : t.delivery), payment: f.get('mode'), address: pickup ? 'Store Pickup — 24 Market Road, New Delhi' : f.get('address'), status: 'Confirmed' }; let orders = store.get('dc_orders'); orders.unshift(order); store.set('dc_orders', orders); store.set('dc_cart', []); toast('Order placed successfully!'); setTimeout(() => location.href = 'orders.html', 600) } }
function renderOrders() { let root = $('#orders-page'); if (!root) return; let orders = store.get('dc_orders'); let cards = orders.map(o => `<article class="order-card"><div><p class="eyebrow">ORDER #${o.id}</p><h3>${o.date} · ${o.payment}</h3><p>${o.items.map(i => `${products.find(p => p.id === i.id)?.name || 'Product'} × ${i.qty}`).join(', ')}</p><p>${o.address}</p></div><div><strong>${money(o.total)}</strong><p class="status">● ${o.status}</p><button class="secondary" onclick="toast('Your order is confirmed and being prepared.')">View details</button></div></article>`).join(''); root.innerHTML = `<section class="page-heading"><p class="eyebrow">YOUR PURCHASES</p><h1>My orders</h1></section><div class="order-tabs"><button class="active">Active orders</button><button>Delivered</button><button>Cancelled</button></div>${cards || '<section class="empty"><b>📦</b><h2>No orders yet</h2><p>Your orders will appear here once you place one.</p><a class="primary" href="products.html">Browse groceries</a></section>'}` }
function renderWishlist() { let root = $('#wishlist-page'); if (!root) return; let savedIds = new Set(store.wish().map(id => String(id))), saved = products.filter(p => savedIds.has(String(p.id))); let content = saved.length ? `<section class="section product-grid">${saved.map(card).join('')}</section>` : `<section class="empty wishlist-empty"><b>♡</b><h2>Your wishlist is empty</h2><p>Save products you love to find them quickly later.</p><a class="primary" href="products.html">Browse products</a></section>`; root.innerHTML = `<section class="page-heading"><p class="eyebrow">SAVED FOR LATER</p><h1>My wishlist</h1></section>${content}` }
function toggleAuth(signup) { $('#login-view').hidden = signup; $('#signup-view').hidden = !signup }
function customerAccounts() { return store.get('dc_customers', []) }
function allocateCustomerId() { let assigned = new Set([...store.get('dc_customer_ids', []), ...customerAccounts().map(customer => customer.customerId).filter(Boolean)]), next = Math.max(0, Number(store.get('dc_customer_id_sequence', 0)) || 0), id; do { id = `DC-${String(next++).padStart(6, '0')}` } while (assigned.has(id)); store.set('dc_customer_ids', [...assigned, id]); store.set('dc_customer_id_sequence', next); return id }
function saveCustomerAccount(customer) { let accounts = customerAccounts(), index = accounts.findIndex(account => account.customerId === customer.customerId || String(account.email || '').toLowerCase() === String(customer.email || '').toLowerCase()); if (index >= 0) accounts[index] = { ...accounts[index], ...customer }; else accounts.push(customer); store.set('dc_customers', accounts) }
function auth() { $$('[data-password-toggle]').forEach(button => button.onclick = () => { const input = button.parentElement.querySelector('input'); input.type = input.type === 'password' ? 'text' : 'password'; button.textContent = input.type === 'password' ? 'Show' : 'Hide' }); }
function profile() { let root = $('#profile-page'); if (!root) return; let u = store.user(); if (!u) { location.href = 'login.html'; return } let initial = (u.name || 'U').trim().charAt(0).toUpperCase(); root.innerHTML = `<section class="profile-card"><div class="profile-avatar-wrap"><div class="avatar" id="profile-avatar">${u.photo ? `<img src="${u.photo}" alt="${u.name}'s profile photo">` : initial}</div><label class="photo-edit" for="profile-photo">Change photo</label><input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp" hidden></div><div><p class="eyebrow">MY ACCOUNT</p><h1 id="profile-title">${u.name}</h1><p id="profile-contact">${u.email} · ${u.phone}</p></div><button class="secondary" onclick="store.logout()">Logout</button></section><div class="profile-grid"><section class="profile-details"><div class="profile-section-head"><div><p class="eyebrow">PERSONAL DETAILS</p><h2>Your details</h2></div><button class="text-btn profile-edit-button" id="edit-profile" type="button">Edit</button></div><div class="profile-summary" id="profile-summary"><p><span>Email address</span><b id="summary-email">${u.email}</b></p><p><span>Phone number</span><b id="summary-phone">${u.phone}</b></p></div><form id="profile-form" hidden><label>Full name<input required name="name" value="${u.name}"></label><label>Email address<input required type="email" name="email" value="${u.email}"></label><label>Phone number<input required type="tel" name="phone" inputmode="numeric" pattern="[0-9]{10}" title="Enter a 10-digit mobile number" value="${u.phone}"></label><div class="profile-form-actions"><button class="primary" type="submit">Save changes</button><button class="text-btn" id="cancel-profile-edit" type="button">Cancel</button></div></form></section><section><h2>My orders</h2><p>View and track your recent grocery orders.</p><a class="primary" href="orders.html">View orders</a></section></div>`; let photo = $('#profile-photo'), avatar = $('#profile-avatar'), form = $('#profile-form'), summary = $('#profile-summary'), edit = $('#edit-profile'); let closeForm = () => { form.hidden = true; summary.hidden = false; edit.hidden = false; form.reset() }; edit.onclick = () => { form.hidden = false; summary.hidden = true; edit.hidden = true; form.querySelector('input').focus() }; $('#cancel-profile-edit').onclick = closeForm; photo.onchange = () => { let file = photo.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { toast('Please choose a JPG, PNG, or WebP image'); photo.value = ''; return } if (file.size > 2 * 1024 * 1024) { toast('Please choose an image smaller than 2 MB'); photo.value = ''; return } let reader = new FileReader(); reader.onload = () => { let updated = { ...store.user(), photo: reader.result }; store.set('dc_user', updated); avatar.innerHTML = `<img src="${reader.result}" alt="${updated.name}'s profile photo">`; toast('Profile photo updated') }; reader.readAsDataURL(file) }; form.onsubmit = e => { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return } let data = Object.fromEntries(new FormData(form)), updated = { ...store.user(), name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim() }; store.set('dc_user', updated); $('#profile-title').textContent = updated.name; $('#profile-contact').textContent = `${updated.email} · ${updated.phone}`; $('#summary-email').textContent = updated.email; $('#summary-phone').textContent = updated.phone; if (!updated.photo) avatar.textContent = (updated.name || 'U').charAt(0).toUpperCase(); closeForm(); toast('Profile details saved') } }
function initHeroSlider() { let slider = $('#hero-slider'); if (!slider) return; const defaults = [{ image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85' }, { image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85' }, { image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1600&q=85' }, { image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=1600&q=85' }], uploaded = store.get('dc_slider_images', []), slides = uploaded.length ? uploaded.map(image => ({ image })) : defaults, dotsWrap = $('.slider-dots', slider); const track = document.createElement('div'); track.className = 'hero-slider-track'; track.innerHTML = slides.map(slide => `<div class="hero-slider-slide" style="background-image:url('${String(slide.image).replace(/'/g, '%27')}')" aria-hidden="true"></div>`).join(''); slider.prepend(track); dotsWrap.innerHTML = slides.map((_, index) => `<button class="${index===0?'active':''}" type="button" aria-label="Show slide ${index+1}"></button>`).join(''); let dots = $$('.slider-dots button', slider), index = 0, touchStart = 0, timer; let show = n => { index = (n + slides.length) % slides.length; track.style.transform = `translateX(-${index * 100}%)`; dots.forEach((dot, i) => { dot.classList.toggle('active', i === index); dot.setAttribute('aria-current', i === index ? 'true' : 'false') }) }, next = () => show(index + 1), restart = () => { clearInterval(timer); timer = setInterval(next, 5000) }; dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart() })); slider.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { show(index - 1); restart() } if (e.key === 'ArrowRight') { next(); restart() } }); slider.tabIndex = 0; slider.addEventListener('touchstart', e => touchStart = e.changedTouches[0].screenX, { passive: true }); slider.addEventListener('touchend', e => { let distance = e.changedTouches[0].screenX - touchStart; if (Math.abs(distance) > 45) { show(index + (distance < 0 ? 1 : -1)); restart() } }, { passive: true }); slider.addEventListener('mouseenter', () => clearInterval(timer)); slider.addEventListener('mouseleave', restart); show(0); restart() }
function customerCategoryImage(name, uploadedImage) { if (uploadedImage) return uploadedImage; const value = String(name || '').toLowerCase(); if (/fruit/.test(value)) return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=200&q=80'; if (/vegetable|veg/.test(value)) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'; if (/dairy|egg/.test(value)) return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=200&q=80'; if (/drink|beverage/.test(value)) return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=80'; if (/bakery/.test(value)) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80'; if (/snack/.test(value)) return 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=200&q=80'; return 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=200&q=80'; }
function home() { let featured = $('#featured-products'); if (!featured) return; const homeCategories = [...new Set([...categories.map(c => c[0]), ...products.map(p => p.category)])], icons = ['🥬', '🍎', '🥛', '🍪', '🛒', '🫖', '🥖', '🧴'], categoryImages = store.get('dc_category_images', {}), categoryUrl = name => { const id = Object.entries(categoryLabels).find(([, label]) => label === name)?.[0]; return `products.html?${id ? `categoryId=${encodeURIComponent(id)}` : `q=${encodeURIComponent(name)}`}` }; $('#category-cards').innerHTML = homeCategories.map((name, i) => { const image = customerCategoryImage(name, categoryImages[name]); return `<a class="category-card" href="${categoryUrl(name)}"><span class="category-card-media"><img class="category-card-image" src="${image}" alt="${name}" onerror="this.style.display='none';this.parentElement.textContent='${icons[i % icons.length]}'"></span><b>${name}</b><small>Shop now →</small></a>` }).join(''); featured.innerHTML = products.slice(0, 10).map(card).join(''); $('#category-product-sections').innerHTML = homeCategories.map(name => { const items = products.filter(p => p.category === name); return items.length ? `<section class="section"><div class="section-head"><div><p class="eyebrow">SHOP ${name.toUpperCase()}</p><h2>${name}</h2></div><a href="${categoryUrl(name)}">See all →</a></div><div class="product-grid category-product-slider">${items.map(card).join('')}</div></section>` : ''; }).join('') }
document.addEventListener('DOMContentLoaded', () => { initLayout(); home(); initHeroSlider(); renderProducts(); renderCart(); checkout(); renderOrders(); renderWishlist(); auth(); profile() });
document.addEventListener('DOMContentLoaded', () => { let form = $('#profile-form'), summary = $('#profile-summary'); if (form) { let phoneField = form.querySelector('[name="phone"]'), emailField = form.querySelector('[name="email"]'); emailField.parentElement.before(phoneField.parentElement); let phoneSummary = $('#summary-phone'), emailSummary = $('#summary-email'); if (phoneSummary && emailSummary) emailSummary.parentElement.before(phoneSummary.parentElement) } });
document.addEventListener('DOMContentLoaded', () => { let form = $('#profile-form'); form?.addEventListener('submit', () => { let u = store.user();['name', 'phone', 'email'].forEach(field => { form.elements[field].defaultValue = u[field]; form.elements[field].value = u[field] }) }) });
document.addEventListener('DOMContentLoaded', () => { let edit = $('#edit-profile'), form = $('#profile-form'), cancel = $('#cancel-profile-edit'), wrap = $('.profile-avatar-wrap'), avatar = $('#profile-avatar'); if (!edit || !form || !wrap) return; let remove = document.createElement('button'); remove.className = 'photo-delete'; remove.type = 'button'; remove.textContent = 'Remove photo'; wrap.append(remove); let hidePhotoTools = () => wrap.classList.remove('editing'); edit.addEventListener('click', () => wrap.classList.add('editing')); cancel.addEventListener('click', hidePhotoTools); form.addEventListener('submit', hidePhotoTools); remove.onclick = () => { let updated = { ...store.user() }; delete updated.photo; store.set('dc_user', updated); avatar.textContent = (updated.name || 'U').trim().charAt(0).toUpperCase(); toast('Profile photo removed') } });
document.addEventListener('change', event => { let input = event.target; if (input.id !== 'profile-photo') return; event.stopImmediatePropagation(); let file = input.files?.[0]; if (!file) return; if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { toast(file.size > 2 * 1024 * 1024 ? 'Please choose an image smaller than 2 MB' : 'Please choose a JPG, PNG, or WebP image'); input.value = ''; return } let reader = new FileReader(); reader.onload = () => openPhotoCropper(reader.result, input); reader.readAsDataURL(file) }, { capture: true });
function openPhotoCropper(source, input) { let modal = document.createElement('div'); modal.className = 'photo-crop-modal'; modal.innerHTML = '<div class="photo-crop-card" role="dialog" aria-modal="true" aria-labelledby="crop-title"><h2 id="crop-title">Adjust profile photo</h2><p>Drag to position your photo, then use the slider to zoom.</p><canvas id="photo-crop-canvas" width="300" height="300"></canvas><input id="photo-crop-zoom" name="photoCropZoom" class="photo-crop-zoom" type="range" min="1" max="3" value="1" step=".01" aria-label="Photo zoom"><div class="photo-crop-actions"><button type="button" class="secondary" data-crop-cancel>Cancel</button><button type="button" class="primary" data-crop-apply>Apply photo</button></div></div>'; document.body.append(modal); let canvas = $('#photo-crop-canvas', modal), ctx = canvas.getContext('2d'), zoom = $('.photo-crop-zoom', modal), image = new Image(), scale = 1, x = 0, y = 0, dragging = false, start; let draw = () => { ctx.clearRect(0, 0, 300, 300); ctx.save(); ctx.beginPath(); ctx.arc(150, 150, 150, 0, Math.PI * 2); ctx.clip(); let size = Math.max(300 / image.width, 300 / image.height) * scale, w = image.width * size, h = image.height * size; ctx.drawImage(image, 150 - w / 2 + x, 150 - h / 2 + y, w, h); ctx.restore() }; image.onload = draw; image.src = source; zoom.oninput = () => { scale = +zoom.value; draw() }; canvas.addEventListener('pointerdown', e => { dragging = true; start = { x: e.clientX - x, y: e.clientY - y }; canvas.setPointerCapture(e.pointerId) }); canvas.addEventListener('pointermove', e => { if (!dragging) return; x = e.clientX - start.x; y = e.clientY - start.y; draw() }); canvas.addEventListener('pointerup', () => dragging = false); $('[data-crop-cancel]', modal).onclick = () => { input.value = ''; modal.remove() }; $('[data-crop-apply]', modal).onclick = () => { let data = canvas.toDataURL('image/png'), updated = { ...store.user(), photo: data }, avatar = $('#profile-avatar'); store.set('dc_user', updated); avatar.innerHTML = `<img src="${data}" alt="${updated.name}'s profile photo">`; input.value = ''; modal.remove(); toast('Profile photo updated') } }
document.addEventListener('DOMContentLoaded', () => { if ($('#profile-page')) document.body.classList.add('profile-page') });
function ensureCustomerId() { let user = store.user(); if (!user) return null; if (!user.customerId) { user = { ...user, customerId: allocateCustomerId() }; store.set('dc_user', user) } saveCustomerAccount(user); return user }
document.addEventListener('DOMContentLoaded', () => { let user = ensureCustomerId(); if (!user) return; let summary = $('#profile-summary'); if (summary && !$('#summary-customer-id')) { let row = document.createElement('p'), label = document.createElement('span'), value = document.createElement('b'); label.textContent = 'Customer ID'; value.id = 'summary-customer-id'; value.textContent = user.customerId; row.append(label, value); summary.prepend(row) } let heroCopy = $('.hero-copy'); if (heroCopy && !$('.customer-id-home')) { let badge = document.createElement('p'); badge.className = 'customer-id-home'; badge.textContent = `Customer ID: ${user.customerId}`; heroCopy.append(badge) } });
document.addEventListener('DOMContentLoaded', () => { let idRow = $('#summary-customer-id')?.parentElement, accountInfo = $('.profile-card>div:nth-child(2)'); if (!idRow || !accountInfo) return; let badge = document.createElement('p'); badge.className = 'customer-id-card'; badge.textContent = `Customer ID: ${idRow.querySelector('b').textContent}`; accountInfo.append(badge); idRow.remove() });
document.addEventListener('DOMContentLoaded', () => { $$('#auth-form,#signup-form').forEach(form => form.addEventListener('submit', ensureCustomerId)) });
document.addEventListener('DOMContentLoaded', () => { let edit = $('#edit-profile'), form = $('#profile-form'), cancel = $('#cancel-profile-edit'), address = $('.address'); if (!edit || !form || !address) return; let section = address.closest('section'), user = store.user(); if (user.deletedAddress) { address.remove(); section.querySelector('.text-btn').before(Object.assign(document.createElement('p'), { className: 'address-empty', textContent: 'No saved addresses.' })); return } let remove = document.createElement('button'); remove.className = 'delete-address'; remove.type = 'button'; remove.textContent = 'Delete address'; address.after(remove); let hideDelete = () => section.classList.remove('address-editing'); edit.addEventListener('click', () => section.classList.add('address-editing')); cancel.addEventListener('click', hideDelete); form.addEventListener('submit', hideDelete); remove.onclick = () => { let updated = { ...store.user(), deletedAddress: true }; store.set('dc_user', updated); address.remove(); remove.remove(); section.querySelector('.text-btn').before(Object.assign(document.createElement('p'), { className: 'address-empty', textContent: 'No saved addresses.' })); toast('Saved address deleted') } });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#profile-page .profile-grid > section:not(.profile-details)')?.remove();
});

// Keep the admin customer directory in sync when a customer updates profile details.
document.addEventListener('DOMContentLoaded', () => {
    const form = $('#profile-form');
    if (!form) return;
    form.addEventListener('submit', () => {
        const updatedCustomer = store.user();
        if (updatedCustomer?.customerId) saveCustomerAccount(updatedCustomer);
    });
});
document.addEventListener('DOMContentLoaded', () => { let badge = $('.customer-id-home'), links = $('.nav-links'); if (!badge || !links) return; if (links.querySelector('.customer-id-header')) { badge.remove(); return } badge.className = 'customer-id-header'; links.prepend(badge) });
document.addEventListener('DOMContentLoaded', () => { if (!location.pathname.endsWith('orders.html') || $('.customer-id-header')) return; let user = ensureCustomerId(), links = $('.nav-links'); if (user && links) { let badge = document.createElement('p'); badge.className = 'customer-id-header'; badge.textContent = `Customer ID: ${user.customerId}`; links.prepend(badge) } });
document.addEventListener('DOMContentLoaded', () => { let mode = $('#payment-mode'), address = $('#address-fields textarea'); if (!mode || !address) return; let syncAddressRequirement = () => address.required = !mode.value.includes('Self'); mode.addEventListener('change', syncAddressRequirement); syncAddressRequirement() });

function assignOrderNumbers() {
    let orders = store.get('dc_orders'), next = Number(localStorage.getItem('dc_next_order_number')) || 123456, changed = false;
    const used = new Set(orders.map(order => order.id).filter(id => /^Order NO-\d{6}$/.test(id)));

    orders.forEach(order => {
        if (/^Order NO-\d{6}$/.test(order.id)) return;
        while (used.has(`Order NO-${String(next).padStart(6, '0')}`)) next++;
        order.id = `Order NO-${String(next).padStart(6, '0')}`;
        used.add(order.id);
        next++;
        changed = true;
    });

    if (changed) store.set('dc_orders', orders);
    localStorage.setItem('dc_next_order_number', String(next));
    return orders;
}

function seedTemporaryReceiptOrders() {
    const seedKey = 'dc_temporary_receipt_orders_seeded';
    if (sessionStorage.getItem(seedKey)) return;
    const orders = store.get('dc_orders');
    const demoOrders = [
        { id: 'Order NO-991001', items: [{ id: 2, qty: 2 }, { id: 9, qty: 1 }], total: 180, payment: 'Cash on Delivery', address: '12 Test Street, New Delhi - 110001', customer: { name: 'Test Customer', phone: '9876543210', customerId: 'DC-TEST001' }, status: 'Accepted', placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), temporaryTestOrder: true },
        { id: 'Order NO-991002', items: [{ id: 5, qty: 1 }, { id: 18, qty: 1 }], total: 327, payment: 'Online Payment', address: '45 Demo Lane, New Delhi - 110001', customer: { name: 'Test Customer', phone: '9876543210', customerId: 'DC-TEST001' }, status: 'Delivered', placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), temporaryTestOrder: true },
        { id: 'Order NO-991003', items: [{ id: 13, qty: 2 }], total: 70, payment: 'Cash on Delivery', address: '8 Sample Road, New Delhi - 110001', customer: { name: 'Test Customer', phone: '9876543210', customerId: 'DC-TEST001' }, status: 'Cancelled', placedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), temporaryTestOrder: true }
    ];
    const existing = new Set(orders.map(order => order.id));
    const added = demoOrders.filter(order => !existing.has(order.id));
    if (added.length) store.set('dc_orders', [...added, ...orders]);
    sessionStorage.setItem(seedKey, 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.endsWith('orders.html')) return;
    seedTemporaryReceiptOrders();
    const orders = assignOrderNumbers();
    $$('.order-card .eyebrow').forEach((label, index) => label.textContent = orders[index]?.id || 'Order');
});

function formatOrderDateTime(value) {
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function toggleOrderProducts(button) {
    const section = button.closest('.active-order-card').querySelector('.order-products');
    section.hidden = !section.hidden;
    button.textContent = section.hidden ? 'View products' : 'Hide products';
}

function customerPaymentMethod(payment) {
    const value = String(payment || '').trim().toLowerCase();
    if (value === 'cod' || value === 'cash on delivery') return 'Cash on Delivery';
    if (value === 'online payment' || value === 'online') return 'Online Payment';
    if (value === 'self pickup' || value === 'self take (store pickup)' || value === 'store pickup') return 'Self Pickup from Store';
    return payment || '—';
}

function renderActiveOrders() {
    const root = $('#orders-page');
    if (!root) return;
    const orders = store.get('dc_orders');
    let changed = false;
    orders.forEach(order => {
        if (!order.placedAt) { order.placedAt = new Date().toISOString(); changed = true; }
        if (!order.status || order.status === 'Confirmed') { order.status = 'Pending'; changed = true; }
    });
    if (changed) store.set('dc_orders', orders);

    const cards = orders.map(order => {
        const itemCount = order.items.reduce((total, item) => total + item.qty, 0);
        const pickup = order.payment === 'Self Take (Store Pickup)' || order.address?.startsWith('Store Pickup');
        const tableTotals = order.items.reduce((totals, item) => {
            const product = products.find(entry => entry.id === item.id), price = product?.price || 0, mrp = product?.mrp || 0;
            totals.mrp += mrp * item.qty;
            totals.discount += (mrp - price) * item.qty;
            totals.price += price * item.qty;
            return totals;
        }, { mrp: 0, discount: 0, price: 0 });
        const rows = order.items.map((item, index) => {
            const product = products.find(entry => entry.id === item.id), price = product?.price || 0, mrp = product?.mrp || 0, discount = (mrp - price) * item.qty;
            return `<tr><td>${index + 1}</td><td><img src="${product?.image || ''}" alt="${product?.name || 'Product'}"></td><td>${product?.name || 'Product'}</td><td>${item.qty}</td><td>${money(mrp)}</td><td>${money(discount)}</td><td>${money(price)}</td><td>${money(price * item.qty)}</td></tr>`;
        }).join('');
        const paymentStatus = customerPaymentStatusLabel(order) || 'Pending', paymentMethod = customerPaymentMethod(order.payment);
        const canShowReceipt = String(order.status).toLowerCase() !== 'pending';
        return `<article class="order-card active-order-card" data-order-id="${order.id}"><div class="active-order-header"><div><p class="eyebrow">${order.id}</p><h3>Order placed ${formatOrderDateTime(order.placedAt)}</h3></div><p class="order-status ${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</p></div><div class="active-order-info"><p><span>Items</span><b>${itemCount}</b></p><p><span>Payable amount</span><b>${money(order.total)}</b></p><p><span>Payment method</span><b>${paymentMethod}</b></p><p><span>${pickup ? 'Collection' : 'Delivery address'}</span><b>${pickup ? 'Self Pickup' : order.address}</b></p><p class="customer-payment-status"><span>Payment status</span><b>${paymentStatus}</b></p></div><div class="order-card-footer"><div class="order-actions"><button class="secondary" type="button" onclick="toggleOrderProducts(this)">View products</button>${canShowReceipt ? '<button class="secondary" type="button" onclick="openReceipt(this)">Order receipt</button>' : ''}</div>${chargeSummaryHtml(order)}</div><div class="order-products" hidden><div class="order-table-scroll"><table><thead><tr><th>S.No</th><th>Product</th><th>Product name</th><th>Quantity</th><th>MRP</th><th>Discount</th><th>Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Total</td><td>${money(tableTotals.mrp)}</td><td>${money(tableTotals.discount)}</td><td>${money(tableTotals.price)}</td><td>${money(tableTotals.price)}</td></tr></tfoot></table></div></div></article>`;
    }).join('');
    root.innerHTML = `<section class="page-heading"><p class="eyebrow">YOUR PURCHASES</p><h1>Active Orders</h1></section>${cards || '<section class="empty"><b>📦</b><h2>No active orders</h2><p>Your orders will appear here once you place one.</p><a class="primary" href="products.html">Browse groceries</a></section>'}`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname.endsWith('orders.html')) renderActiveOrders();
});

function customerPaymentStatusLabel(order) {
    const status = String(order.paymentStatus || order.bookingCharge?.status || 'pending').toLowerCase();
    return status === 'verified' ? 'Confirmed' : (status === 'failed' || status === 'rejected' ? 'Rejected' : 'Pending');
}
function showCustomerPaymentStatuses() {
    if (!location.pathname.endsWith('orders.html')) return;
    const orders = store.get('dc_orders');
    $$('.active-order-card').forEach(card => {
        const orderId = card.querySelector('.eyebrow')?.textContent.trim(), order = orders.find(item => String(item.id) === orderId), details = card.querySelector('.active-order-info');
        if (!order || !details || details.querySelector('.customer-payment-status')) return;
        const label = customerPaymentStatusLabel(order);
        if (label) details.insertAdjacentHTML('beforeend', `<p class="customer-payment-status"><span>Payment status</span><b>${label}</b></p>`);
    });
}
document.addEventListener('DOMContentLoaded', showCustomerPaymentStatuses);
window.addEventListener('storage', event => { if (event.key === 'dc_orders' && location.pathname.endsWith('orders.html')) { renderActiveOrders(); showCustomerPaymentStatuses(); } });

document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.endsWith('orders.html')) return;
    $$('.order-products tfoot tr').forEach(row => {
        const labels = ['Total', 'MRP', 'Discount', 'Price', 'Total Amount'];
        [...row.cells].forEach((cell, index) => {
            if (index === 0) return;
            cell.innerHTML = `<span>${labels[index]}</span>${cell.textContent}`;
        });
    });
});

function cartTotals() {
    const items = store.cart().map(item => ({ ...item, p: products.find(product => product.id === item.id) }));
    const total = items.reduce((sum, item) => sum + item.p.price * item.qty, 0), mrp = items.reduce((sum, item) => sum + item.p.mrp * item.qty, 0), disc = mrp - total, delivery = total >= 499 || !total ? 0 : 35, handling = total ? 5 : 0, coupon = appliedCoupon(), discount = couponDiscount(coupon, total + delivery + handling);
    return { items, total, disc, delivery, handling, coupon, couponDiscount: discount, final: total + delivery + handling - discount };
}
function summary(t, pickup = false) {
    const delivery = pickup ? 0 : t.delivery, couponDiscountAmount = couponDiscount(t.coupon, t.total + delivery + t.handling), final = t.total + delivery + t.handling - couponDiscountAmount;
    return `<div class="summary"><h3>Bill details</h3><p><span>Item total</span><b>${money(t.total)}</b></p><p><span>Product discount</span><b class="green">− ${money(t.disc)}</b></p>${pickup ? '' : `<p><span>Delivery charge</span><b>${delivery ? money(delivery) : 'FREE'}</b></p>`}<p><span>Handling fee</span><b>${money(t.handling)}</b></p>${couponDiscountAmount ? `<p><span>Coupon (${t.coupon.code} - ${t.coupon.label})</span><b class="green">− ${money(couponDiscountAmount)}</b></p>` : ''}<hr><p class="grand"><span>Grand Total</span><b>${money(final)}</b></p></div>`;
}
document.addEventListener('click', event => {
    const cartButton = event.target.closest('[data-cart-quantity], [data-cart-remove]');
    if (cartButton) {
        const item = cartButton.closest('[data-cart-item-id]');
        if (!item) return;
        const id = decodeURIComponent(item.dataset.cartItemId);
        const change = cartButton.hasAttribute('data-cart-remove') ? -Number.MAX_SAFE_INTEGER : Number(cartButton.dataset.cartQuantity);
        store.qty(id, change);
        return;
    }
    const removeButton = event.target.closest('[data-remove-coupon]');
    if (removeButton) {
        localStorage.removeItem('dc_coupon');
        toast('Coupon removed');
        renderCart();
        return;
    }
    const applyButton = event.target.closest('[data-apply-coupon]');
    if (!applyButton) return;
    const input = applyButton.closest('.coupon').querySelector('input'), coupon = couponFromCode(input.value);
    if (!coupon) { toast(window.couponValidationMessage || 'This coupon is invalid or expired'); return; }
    store.set('dc_coupon', coupon); toast(`${coupon.code} applied: ${coupon.label}`); renderCart();
});
document.addEventListener('submit', event => {
    if (event.target.id !== 'checkout-form') return;
    // The checkout handler stores the coupon and final totals on the order itself.
    // Only clear this temporary cart-level value after a successful submission.
    localStorage.removeItem('dc_coupon');
});

function shopSettings() { return store.get('dc_shop_settings', { name: 'Delhi Canteen', phone: '+91 99999 99999', address: '24 Market Road, New Delhi — 110001' }); }

function openReceipt(button) {
    const card = button.closest('.active-order-card'), orderId = card.querySelector('.eyebrow').textContent, order = store.get('dc_orders').find(entry => entry.id === orderId), shop = shopSettings(), customer = store.user() || {};
    const receipt = document.createElement('div');
    receipt.className = 'receipt-modal';
    receipt.innerHTML = `<section class="receipt-card" data-order-id="${orderId}" role="dialog" aria-modal="true" aria-labelledby="receipt-title"><button class="receipt-close" type="button" aria-label="Close receipt">×</button><header class="receipt-shop"><div class="receipt-logo">दिल्ली</div><div><h2 id="receipt-title">${shop.name}</h2><p>${shop.address}</p></div><p><b>Phone</b><br>${shop.phone}</p></header><p class="receipt-order-id">${orderId}</p><div class="receipt-customer"><p><span>Customer name</span><b>${customer.name || 'Customer'}</b></p><p><span>Customer phone no.</span><b>${customer.phone || '—'}</b></p><p><span>Items</span><b>${order.items.reduce((total, item) => total + item.qty, 0)}</b></p><p><span>Total amount</span><b>${money(order.total)}</b></p><p><span>Payment method</span><b>${order.payment}</b></p><p><span>Delivery address</span><b>${order.address?.startsWith('Store Pickup') ? 'Self Pickup' : order.address}</b></p></div><div class="receipt-table">${card.querySelector('.order-products table').outerHTML}</div><button class="primary receipt-download" type="button" onclick="downloadReceiptPdf(this)">Download PDF</button></section>`;
    document.body.append(receipt);
    receipt.querySelector('.receipt-close').onclick = () => receipt.remove();
    receipt.onclick = event => { if (event.target === receipt) receipt.remove(); };
}

function downloadReceiptPdf(button) {
    const receipt = button.closest('.receipt-card'), order = store.get('dc_orders').find(entry => entry.id === receipt.dataset.orderId), shop = shopSettings(), customer = store.user() || {};
    const rows = order.items.map((item, index) => { const product = products.find(entry => entry.id === item.id), price = product?.price || 0, mrp = product?.mrp || 0; return `${index + 1}. ${product?.name || 'Product'} | Qty ${item.qty} | MRP Rs. ${mrp} | Discount Rs. ${(mrp - price) * item.qty} | Amount Rs. ${price * item.qty}`; });
    const lines = [shop.name, `Phone: ${shop.phone}`, shop.address, '', `Order No: ${order.id}`, `Customer: ${customer.name || 'Customer'}`, `Phone: ${customer.phone || '—'}`, `Items: ${order.items.reduce((total, item) => total + item.qty, 0)}`, `Total amount: ${money(order.total)}`, `Payment method: ${order.payment}`, `Delivery address: ${order.address?.startsWith('Store Pickup') ? 'Self Pickup' : order.address}`, '', 'ITEM DETAILS', ...rows, '', `Payable Amount: ${money(order.total)}`].map(line => String(line).replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '?'));
    const stream = `BT\n/F1 10 Tf\n50 790 Td\n13 TL\n${lines.map(line => `(${line}) Tj\nT*`).join('\n')}\nET`;
    const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
    let pdf = '%PDF-1.4\n', offsets = [0];
    objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' })), link = document.createElement('a');
    link.href = url;
    link.download = `${order.id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-receipt.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.endsWith('orders.html')) return;
    const heading = $('#orders-page .page-heading');
    if (heading) heading.innerHTML = '<h1>Orders</h1>';
});

document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.endsWith('orders.html')) return;
    $$('.order-actions').forEach(actions => actions.insertAdjacentHTML('beforeend', '<button class="secondary" type="button" onclick="openReceipt(this)">View receipt</button>'));
});

/* Receipt upgrade: keeps shop information in sync with admin settings and creates a structured bill download. */
function receiptShop() {
    return { name: 'Delhi Canteen', phone: '+91 99999 99999', address: '24 Market Road, New Delhi - 110001', ...store.get('dc_shop_settings', {}) };
}
function receiptData(order) {
    const totals = order.items.reduce((value, item) => {
        const product = products.find(entry => entry.id === item.id), price = product?.price || 0, mrp = product?.mrp || 0;
        value.mrp += mrp * item.qty; value.discount += (mrp - price) * item.qty; value.price += price * item.qty;
        return value;
    }, { mrp: 0, discount: 0, price: 0 });
    const customer = { ...(store.user() || {}), ...(order.customer || {}) };
    return { totals, customer, address: order.address?.startsWith('Store Pickup') ? 'Self Pickup' : (order.address || '—') };
}
function orderCharges(order) {
    const selfTake = order.payment === 'Self Take (Store Pickup)' || order.address?.startsWith('Store Pickup');
    return { delivery: selfTake ? 0 : 35, handling: 5, selfTake };
}
function payableAmount(order) {
    const charges = orderCharges(order);
    const base = receiptData(order).totals.price + charges.delivery + charges.handling;
    return Math.max(0, base - couponDiscount(order.coupon, base));
}
function couponFromCode(code) {
    const normalized = String(code || '').trim().toUpperCase();
    const managed = store.get('dc_coupons', []).find(coupon => String(coupon.code || '').toUpperCase() === normalized);
    if (managed) {
        const user = store.user?.() || store.get('dc_user', {}), customerId = user.customerId || user.id || 'guest', usages = store.get('dc_coupon_usage', []).filter(item => item.couponId === managed.id), usedByCustomer = usages.some(item => item.customerId === customerId), customerCount = new Set(usages.map(item => item.customerId)).size;
        window.couponValidationMessage = '';
        if (!managed.active || Date.now() < new Date(managed.startAt).getTime() || Date.now() > new Date(managed.endAt).getTime()) { window.couponValidationMessage = 'This coupon is invalid or expired'; return null; }
        if (usedByCustomer) { window.couponValidationMessage = 'You have already used this coupon'; return null; }
        if (customerCount >= Number(managed.limit || 1)) { window.couponValidationMessage = 'This coupon has reached its maximum customer limit'; return null; }
        return { ...managed, label: managed.type === 'percent' ? `${managed.value}% off` : `Rs. ${managed.value} off` };
    }
    return null;
}
function couponDiscount(coupon, base) {
    if (!coupon) return 0;
    const discount = coupon.type === 'percent' ? base * Number(coupon.value) / 100 : Number(coupon.value);
    return Math.min(Math.round(discount), base);
}
function appliedCoupon() { const coupon=store.get('dc_coupon',null); return coupon&&couponFromCode(coupon.code)?coupon:null; }
function recordCouponUse(coupon){if(!coupon?.id)return;const user=store.user?.()||store.get('dc_user',{}),customerId=user.customerId||user.id||'guest';set('dc_coupon_usage',[...store.get('dc_coupon_usage',[]),{couponId:coupon.id,customerId,usedAt:new Date().toISOString()}]);}
function chargeSummaryHtml(order) {
    const charges = orderCharges(order);
    const base = receiptData(order).totals.price + charges.delivery + charges.handling, discount = couponDiscount(order.coupon, base);
    return `<div class="order-charge-summary"><p><span>Item total</span><b>${money(receiptData(order).totals.price)}</b></p>${charges.selfTake ? '' : `<p><span>Delivery charges</span><b>${money(charges.delivery)}</b></p>`}<p><span>Handling fee</span><b>${money(charges.handling)}</b></p>${discount ? `<p class="coupon-discount"><span>Coupon (${order.coupon.code} - ${order.coupon.label})</span><b>− ${money(discount)}</b></p>` : ''}<p class="order-payable"><span>Payable amount</span><b>${money(payableAmount(order))}</b></p></div>`;
}
function openReceipt(button) {
    const card = button.closest('.active-order-card'), orderId = card.dataset.orderId || card.querySelector('.eyebrow').textContent;
    const order = store.get('dc_orders').find(entry => entry.id === orderId);
    if (!order) { toast('Receipt is not available for this order'); return; }
    const shop = receiptShop(), data = receiptData(order), logo = shop.logo || shop.logoUrl || shop.logo_url;
    const rows = order.items.map((item, index) => { const product = products.find(entry => entry.id === item.id), price = product?.price || 0, mrp = product?.mrp || 0; return `<tr><td>${index + 1}</td><td><img src="${product?.image || ''}" alt="${product?.name || 'Product'}"></td><td>${product?.name || 'Product'}</td><td>${item.qty}</td><td>${money(mrp)}</td><td>${money((mrp - price) * item.qty)}</td><td>${money(price)}</td><td>${money(price * item.qty)}</td></tr>`; }).join('');
    const modal = document.createElement('div');
    modal.className = 'receipt-modal';
    modal.innerHTML = `<section class="receipt-card" data-order-id="${orderId}" role="dialog" aria-modal="true" aria-labelledby="receipt-title"><button class="receipt-close" type="button" aria-label="Close receipt">×</button><header class="receipt-shop">${logo ? `<img class="receipt-logo-image" src="${logo}" alt="${shop.name} logo">` : `<div class="receipt-logo-mark">${shop.name.slice(0, 1).toUpperCase()}</div>`}<div><h2 id="receipt-title">${shop.name}</h2><p>${shop.address}</p></div><p class="receipt-phone"><span>Phone no.</span><b>${shop.phone}</b></p></header><p class="receipt-order-id">Order no. ${orderId}</p><div class="receipt-customer"><p><span>Customer name</span><b>${data.customer.name || 'Customer'}</b></p><p><span>Customer phone no.</span><b>${data.customer.phone || '—'}</b></p><p><span>Customer ID</span><b>${data.customer.customerId || '—'}</b></p><p><span>Items</span><b>${order.items.reduce((sum, item) => sum + item.qty, 0)}</b></p><p><span>Total amount</span><b>${money(order.total)}</b></p><p><span>Payment method</span><b>${order.payment}</b></p><p class="receipt-address"><span>Delivery address</span><b>${data.address}</b></p></div><div class="receipt-table"><table><thead><tr><th>S.No</th><th>Product</th><th>Product name</th><th>Quantity</th><th>MRP</th><th>Discount</th><th>Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Total</td><td><span>MRP</span>${money(data.totals.mrp)}</td><td><span>Discount</span>${money(data.totals.discount)}</td><td><span>Price</span>${money(data.totals.price)}</td><td><span>Payable Amt</span>${money(order.total)}</td></tr></tfoot></table></div><button class="primary receipt-download" type="button" onclick="downloadReceiptPdf(this)">Download PDF</button></section>`;
    const receiptDetails = modal.querySelector('.receipt-customer');
    receiptDetails.querySelector('p:nth-child(4) span').textContent = 'Payable amount';
    receiptDetails.querySelector('p:nth-child(4) b').textContent = money(payableAmount(order));
    receiptDetails.closest('.receipt-card').querySelector('.receipt-table tfoot td:last-child').lastChild.textContent = money(data.totals.price);
    receiptDetails.closest('.receipt-card').querySelector('.receipt-table tfoot td:last-child span').textContent = 'Total Amount';
    receiptDetails.insertAdjacentHTML('afterend', chargeSummaryHtml(order));
    if (String(order.status).toLowerCase() !== 'delivered') modal.querySelector('.receipt-download').remove();
    document.body.append(modal); modal.querySelector('.receipt-close').onclick = () => modal.remove(); modal.onclick = event => { if (event.target === modal) modal.remove(); };
}
function pdfSafe(value) { return String(value).replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '-'); }
function downloadReceiptPdf(button) {
    const order = store.get('dc_orders').find(entry => entry.id === button.closest('.receipt-card').dataset.orderId);
    if (!order) { toast('Receipt is not available for this order'); return; }
    const shop = receiptShop(), data = receiptData(order), charges = orderCharges(order), couponAmount = couponDiscount(order.coupon, data.totals.price + charges.delivery + charges.handling), bookingAmount = orderBookingCharge(order), commands = [], add = (text, x, y, size = 9, bold = false) => commands.push(`BT /F${bold ? 2 : 1} ${size} Tf ${x} ${y} Td (${pdfSafe(text)}) Tj ET`), rule = y => commands.push(`0.82 0.82 0.82 RG 40 ${y} m 555 ${y} l S`);
    commands.push('0 g 0 G 40 785 30 30 re f'); commands.push('1 g'); add(shop.name.slice(0, 1).toUpperCase(), 50, 795, 13, true); commands.push('0 g 0 G'); add(shop.name, 80, 804, 16, true); add(shop.address, 80, 790, 8); add(`Phone no.: ${shop.phone}`, 425, 804, 9, true); rule(774);
    add(`Order no.: ${order.id}`, 40, 758, 10, true); add(`Customer name: ${data.customer.name || 'Customer'}`, 40, 742); add(`Customer phone no.: ${data.customer.phone || '-'}`, 40, 728); add(`Customer ID: ${data.customer.customerId || '-'}`, 40, 714); add(`Delivery address: ${data.address}`, 40, 700); add(`Items: ${order.items.reduce((sum, item) => sum + item.qty, 0)}`, 290, 742); add(`Payment method: ${order.payment}`, 290, 728); rule(674);
    commands.push('0.94 g 40 648 515 18 re f 0 g'); const headers = ['S.No', 'Product name', 'Qty', 'MRP', 'Discount', 'Price', 'Amount'], x = [42, 72, 265, 300, 354, 424, 478]; headers.forEach((title, i) => add(title, x[i], 660, 7, true)); rule(648);
    let y = 638; order.items.forEach((item, index) => { const product = products.find(entry => entry.id === item.id), price = product?.price || 0, mrp = product?.mrp || 0; add(index + 1, x[0], y, 8); add((product?.name || 'Product').slice(0, 35), x[1], y, 8); add(item.qty, x[2], y, 8); add(`Rs. ${mrp}`, x[3], y, 8); add(`Rs. ${(mrp - price) * item.qty}`, x[4], y, 8); add(`Rs. ${price}`, x[5], y, 8); add(`Rs. ${price * item.qty}`, x[6], y, 8); y -= 16; });
    rule(y + 5); y -= 12; const summaryLines = (couponAmount ? 1 : 0) + (bookingAmount ? 3 : 0); commands.push(`0.94 g 40 ${y - (67 + summaryLines * 16)} 515 ${78 + summaryLines * 16} re f 0 g`); add('Total', 42, y, 9, true); add(`MRP Rs. ${data.totals.mrp}`, 170, y, 9, true); add(`Discount Rs. ${data.totals.discount}`, 280, y, 9, true); add(`Price Rs. ${data.totals.price}`, 402, y, 9, true); add(`Item Total Rs. ${Number(data.totals.price).toFixed(0)}`, 402, y - 16, 9, true); if (!charges.selfTake) add(`+ Delivery Rs. ${Number(charges.delivery).toFixed(0)}`, 402, y - 30, 9); const handlingY = y - (charges.selfTake ? 30 : 44); add(`+ Handling Rs. ${Number(charges.handling).toFixed(0)}`, 402, handlingY, 9); let payableY = handlingY - 16; if (couponAmount) { add(`Coupon ${order.coupon.code} (${order.coupon.label}) - Rs. ${couponAmount}`, 402, payableY, 9); payableY -= 16; } if (bookingAmount) { add(`Total Order Value Rs. ${Number(orderTotalValue(order)).toFixed(0)}`, 402, payableY, 9); payableY -= 16; add(`Booking Charge Paid - Rs. ${bookingAmount}`, 402, payableY, 9); payableY -= 16; add(`Booking Payment: ${bookingStatusLabel(order.bookingCharge.status)}`, 402, payableY, 9); payableY -= 16; } add(`${bookingAmount ? 'Remaining Cash on Delivery' : 'Payable Amount'} Rs. ${Number(payableAmount(order)).toFixed(0)}`, 402, payableY, 10, true);
    const stream = commands.join('\n'), objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
    let pdf = '%PDF-1.4\n', offsets = [0]; objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const start = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' })), link = document.createElement('a'); link.href = url; link.download = `${order.id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-receipt.pdf`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Receipt PDF downloaded');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.endsWith('orders.html')) return;
    $$('.active-order-card').forEach(card => {
        card.querySelectorAll('button[onclick="openReceipt(this)"]').forEach(button => button.remove());
        const status = card.querySelector('.order-status')?.textContent.trim().toLowerCase();
        if ((status === 'accepted' || status === 'delivered') && !card.querySelector('.order-actions button[onclick="openReceipt(this)"]')) card.querySelector('.order-actions').insertAdjacentHTML('beforeend', '<button class="secondary" type="button" onclick="openReceipt(this)">Order receipt</button>');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.endsWith('orders.html')) return;
    $$('.active-order-card').forEach(card => {
        const orderId = card.querySelector('.eyebrow')?.textContent;
        const order = store.get('dc_orders').find(entry => entry.id === orderId);
        if (!order) return;
        const amountLabel = card.querySelector('.active-order-info p:nth-child(2) span');
        if (amountLabel) amountLabel.textContent = 'Payable amount';
        const payableValue = card.querySelector('.active-order-info p:nth-child(2) b');
        if (payableValue) payableValue.textContent = money(payableAmount(order));
        const payableCell = card.querySelector('.order-products tfoot td:last-child');
        if (payableCell) { payableCell.lastChild.textContent = money(receiptData(order).totals.price); payableCell.querySelector('span').textContent = 'Total Amount'; }
        if (!card.querySelector('.order-card-footer .order-charge-summary')) card.querySelector('.active-order-info')?.insertAdjacentHTML('afterend', chargeSummaryHtml(order));
    });
});

/* Manual UPI booking charge -------------------------------------------------
   Admin UI can later read/write `dc_booking_charge_settings` using this shape:
   { enabled, amount, upiId, qrCodeUrl }.  Orders keep a snapshot so historical
   amounts and UPI references cannot change when the settings are edited later. */
const BOOKING_CHARGE_DEFAULTS = { enabled: false, amount: 50, upiId: 'jai9560@', qrCodeUrl: '' };
function bookingChargeSettings() {
    const saved = store.get('dc_booking_charge_settings', {});
    return { ...BOOKING_CHARGE_DEFAULTS, ...saved, enabled: typeof saved.enabled === 'boolean' ? saved.enabled : BOOKING_CHARGE_DEFAULTS.enabled, amount: Math.max(0, Number(saved.amount ?? BOOKING_CHARGE_DEFAULTS.amount) || 0) };
}
function onlinePaymentSettings(){const saved=store.get('dc_online_payment_settings',{});return {upiId:String(saved.upiId||''),qrCodeUrl:String(saved.qrCodeUrl||'')};}
function onlinePaymentCheckoutContent(settings=onlinePaymentSettings()){if(!settings.qrCodeUrl)return '<p class="booking-checkout-note">Online payment is available. Please contact the store if you need payment details.</p>';return `<section class="booking-payment-panel online-payment-panel"><div><p class="eyebrow">ONLINE PAYMENT</p><h3>Scan to pay</h3><p>Use any UPI app to scan the QR code and complete your payment.</p>${settings.upiId?`<p class="upi-id"><span>UPI ID</span><b>${settings.upiId}</b></p>`:''}</div><img class="booking-qr" src="${settings.qrCodeUrl}" alt="Online payment QR code"></section>`;}
function bookingChargeApplies(payment, settings = bookingChargeSettings()) {
    return payment === 'Cash on Delivery' && settings.enabled && settings.amount > 0;
}
function orderBookingCharge(order) {
    return order.bookingCharge?.type === 'onlinePayment' ? 0 : Number(order.bookingCharge?.amount || 0);
}
function orderTotalValue(order) {
    const charges = orderCharges(order), base = receiptData(order).totals.price + charges.delivery + charges.handling;
    return Math.max(0, base - couponDiscount(order.coupon, base));
}
function remainingCodAmount(order) {
    return Math.max(0, orderTotalValue(order) - orderBookingCharge(order));
}
function bookingStatusLabel(status) {
    return ({ pending: 'Verification Pending', verified: 'Payment Verified', failed: 'Payment Failed', rejected: 'Payment Failed' })[status] || 'Verification Pending';
}
function bookingChargeContent(settings) {
    const upiLink = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent('Delhi Canteen')}&am=${encodeURIComponent(settings.amount)}&cu=INR`;
    const qrUrl = settings.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
    const qr = `<img class="booking-qr" src="${qrUrl}" alt="UPI QR code for ${settings.upiId}">`;
    return `<section class="booking-payment-panel"><div><p class="eyebrow">BOOKING CHARGE</p><h3>Pay ${money(settings.amount)} by UPI</h3><p>Pay the booking charge using any UPI app, then enter its transaction/reference number below. Your order will be verified before it is accepted.</p><p class="upi-id"><span>UPI ID</span><b>${settings.upiId}</b><button class="upi-copy" type="button" onclick="copyBookingUpi(this)" data-upi="${settings.upiId}">Copy</button></p></div>${qr}<label>Name shown on payment <small>(Optional)</small><input name="paymentPayerName" autocomplete="name" placeholder="Enter payer name"></label><label>UPI Transaction / Reference Number<input name="upiTransactionNumber" required autocomplete="off" placeholder="Enter UPI reference number"></label><label>Payment screenshot <small>(Optional)</small><input name="upiScreenshot" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="booking-pending-note">Verification Pending — please keep your UPI payment receipt until verification is complete.</p></section>`;
}
function copyBookingUpi(button) {
    const value = button.dataset.upi, copied = () => { button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy', 1400); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(copied).catch(() => toast('Copy the UPI ID: ' + value));
    else { const input = document.createElement('input'); input.value = value; document.body.append(input); input.select(); document.execCommand('copy'); input.remove(); copied(); }
}
function checkoutSummary(t, pickup, payment, settings) {
    const delivery = pickup ? 0 : t.delivery, base = t.total + delivery + t.handling, discount = couponDiscount(t.coupon, base), totalValue = base - discount, booking = bookingChargeApplies(payment, settings) ? settings.amount : 0;
    return `<div class="summary"><h3>Bill details</h3><p><span>Item total</span><b>${money(t.total)}</b></p><p><span>Product discount</span><b class="green">− ${money(t.disc)}</b></p>${pickup ? '' : `<p><span>Delivery charge</span><b>${delivery ? money(delivery) : 'FREE'}</b></p>`}<p><span>Handling fee</span><b>${money(t.handling)}</b></p>${discount ? `<p><span>Coupon (${t.coupon.code} - ${t.coupon.label})</span><b class="green">− ${money(discount)}</b></p>` : ''}<hr>${booking ? `<p><span>Total Order Value</span><b>${money(totalValue)}</b></p><p class="booking-charge-row"><span>Booking Charge Paid</span><b>− ${money(booking)}</b></p><p class="grand"><span>Remaining Cash on Delivery</span><b>${money(Math.max(0, totalValue - booking))}</b></p>` : `<p class="grand"><span>Grand Total</span><b>${money(totalValue)}</b></p>`}</div>`;
}
function checkout() {
    const root = $('#checkout-page');
    if (!root) return;
    const user = ensureCustomerId() || store.user();
    if (!user || !localStorage.getItem('dc_customer_token')) { showLoginRequiredPopup(); return; }
    if (!window.customerCatalogueReady) {
        root.innerHTML = '<section class="empty"><h2>Preparing your checkout…</h2><p>Loading the latest product and price details.</p></section>';
        return;
    }
    const totals = cartTotals();
    if (!totals.items.length) { location.href = 'cart.html'; return; }
    const settings = bookingChargeSettings(), onlineSettings = onlinePaymentSettings(), pickupShop = shopSettings(), pickupAddress = `${pickupShop.name || 'Delhi Canteen'} — ${pickupShop.address || ''}`;
    root.innerHTML = `<section class="page-heading"><p class="eyebrow">ONE LAST STEP</p><h1>Checkout</h1></section><div class="checkout-layout"><form id="checkout-form" class="checkout-form"><h2>Delivery details</h2><label>Customer name<input required name="name" autocomplete="name" placeholder="Your full name" value="${user.name || ''}"></label><label>Phone number<input required name="phone" type="tel" inputmode="numeric" autocomplete="tel" pattern="[0-9]{10}" title="Enter a 10-digit mobile number" placeholder="10-digit mobile number" value="${user.phone || ''}"></label><label>Payment mode<select name="mode" id="payment-mode"><option>Cash on Delivery</option><option>Online Payment</option><option>Self Take (Store Pickup)</option></select></label><div id="address-fields"><label>Complete address<textarea required name="address" autocomplete="street-address" placeholder="House no., street, locality, Delhi">${user.address || ''}</textarea></label></div><div class="pickup-box" hidden><b>Store Pickup Address</b><p>${pickupShop.name || 'Delhi Canteen'}<br>${pickupShop.address || 'Address not available'}<br><b>Mobile:</b> ${pickupShop.phone || 'Not available'}</p></div><div id="booking-charge-area"></div><button class="primary wide" type="submit">Place order →</button></form><aside><h2>Order summary</h2>${totals.items.map(item => `<p class="mini-item">${item.p.name} × ${item.qty}<b>${money(item.p.price * item.qty)}</b></p>`).join('')}<div id="checkout-summary"></div></aside></div>`;
    const form = $('#checkout-form'), mode = $('#payment-mode'), addressFields = $('#address-fields'), pickupBox = $('.pickup-box'), bookingArea = $('#booking-charge-area'), summaryArea = $('#checkout-summary');
    const addressInput = addressFields.querySelector('textarea');
    addressFields.insertAdjacentHTML('beforeend', '<button id="use-current-location" class="current-location-button" type="button">Use current location</button><p id="location-status" class="location-status" aria-live="polite"></p>');
    const locationButton = $('#use-current-location'), locationStatus = $('#location-status');
    locationButton.addEventListener('click', () => {
        if (!navigator.geolocation) { locationStatus.textContent = 'Current location is not supported by this browser.'; return; }
        locationButton.disabled = true; locationButton.textContent = 'Finding your location...'; locationStatus.textContent = 'Please allow location access when prompted.';
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`, { headers: { Accept: 'application/json' } });
                if (!response.ok) throw new Error('Address lookup failed');
                const place = await response.json(), address = String(place.display_name || '').trim();
                if (!address) throw new Error('Address not found');
                addressInput.value = address; addressInput.dispatchEvent(new Event('input', { bubbles: true }));
                locationStatus.textContent = 'Current address added. You can edit it if needed.';
            } catch (error) {
                locationStatus.textContent = 'Location found, but its address could not be retrieved. Please enter the address manually.';
            } finally { locationButton.disabled = false; locationButton.textContent = 'Use current location'; }
        }, error => {
            locationStatus.textContent = error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Please allow it or enter the address manually.' : 'Unable to get your current location. Please try again or enter the address manually.';
            locationButton.disabled = false; locationButton.textContent = 'Use current location';
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
    });
    const refresh = () => {
        const pickup = mode.value.includes('Self'), bookingRequired = bookingChargeApplies(mode.value, settings);
        addressFields.hidden = pickup; addressFields.querySelector('textarea').required = !pickup; pickupBox.hidden = !pickup;
        bookingArea.innerHTML = bookingRequired ? `<p class="booking-checkout-note">A ${money(settings.amount)} booking charge will be collected on the next step. Submit the payment reference before placing the order.</p>` : '';
        summaryArea.innerHTML = checkoutSummary(totals, pickup, mode.value, settings);
    };
    mode.addEventListener('change', refresh); refresh();
    form.onsubmit = event => {
        event.preventDefault();
        const belowMinimum = totals.items.find(item => item.p.minLimitEnabled && item.qty < Number(item.p.minBuy || 1));
        if (belowMinimum) { toast(`Minimum purchase for ${belowMinimum.p.name} is ${belowMinimum.p.minBuy} units.`); return; }
        const submittedData = new FormData(form), submittedPayment = submittedData.get('mode'), bookingRequired = bookingChargeApplies(submittedPayment, settings);
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const data = submittedData, payment = submittedPayment, pickup = payment.includes('Self'), requiresBooking = bookingRequired, requiresPaymentPage = requiresBooking || payment === 'Online Payment';
        const delivery = pickup ? 0 : totals.delivery, base = totals.total + delivery + totals.handling, discount = couponDiscount(totals.coupon, base), totalValue = Math.max(0, base - discount), bookingAmount = requiresBooking ? settings.amount : 0;
        // Preserve the backend ID for the independent final-payment page.
        const order = { id: 'DC' + Date.now().toString().slice(-7), date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), placedAt: new Date().toISOString(), items: totals.items.map(item => ({ id: item.id, apiId: item.p.apiId || item.id, qty: item.qty, product: { name: item.p.name, unit: item.p.unit, image: item.p.image, price: item.p.price } })), total: totalValue, payment, address: pickup ? pickupAddress : data.get('address'), customer: { name: data.get('name').trim(), phone: data.get('phone').trim(), customerId: user.customerId }, coupon: totals.coupon || undefined, status: 'Pending' };
        if (requiresPaymentPage) { const paymentDetails = onlinePaymentSettings(), onlinePayment = payment === 'Online Payment'; sessionStorage.setItem('dc_booking_checkout', JSON.stringify({ order, settings: { amount: onlinePayment ? totalValue : bookingAmount, paymentType: onlinePayment ? 'onlinePayment' : 'bookingCharge', upiId: paymentDetails.upiId || settings.upiId, qrCodeUrl: paymentDetails.qrCodeUrl || settings.qrCodeUrl || '' } })); location.href = onlinePayment ? 'checkout/online_payment.html' : 'checkout/booking_charge.html'; return; }
        const orders = store.get('dc_orders'); orders.unshift(order); store.set('dc_orders', orders); recordCouponUse(totals.coupon); store.set('dc_cart', []); localStorage.removeItem('dc_coupon'); toast(requiresBooking ? 'Booking payment submitted for verification' : 'Order placed successfully!'); setTimeout(() => location.href = 'orders.html', 600);
    };
}
function orderCharges(order) {
    const selfTake = order.payment === 'Self Take (Store Pickup)' || order.address?.startsWith('Store Pickup');
    return { delivery: selfTake ? 0 : 35, handling: 5, selfTake };
}
function payableAmount(order) { return order.bookingCharge ? remainingCodAmount(order) : orderTotalValue(order); }
function chargeSummaryHtml(order) {
    const charges = orderCharges(order), base = receiptData(order).totals.price + charges.delivery + charges.handling, discount = couponDiscount(order.coupon, base), booking = orderBookingCharge(order), total = Math.max(0, base - discount);
    return `<div class="order-charge-summary"><p><span>Item total</span><b>${money(receiptData(order).totals.price)}</b></p>${charges.selfTake ? '' : `<p><span>Delivery charges</span><b>${money(charges.delivery)}</b></p>`}<p><span>Handling fee</span><b>${money(charges.handling)}</b></p>${discount ? `<p class="coupon-discount"><span>Coupon (${order.coupon.code} - ${order.coupon.label})</span><b>− ${money(discount)}</b></p>` : ''}${booking ? `<p><span>Total Order Value</span><b>${money(total)}</b></p><p class="booking-charge-row"><span>Booking Charge Paid</span><b>− ${money(booking)}</b></p><p><span>Booking Payment</span><b class="booking-status ${order.bookingCharge.status}">${bookingStatusLabel(order.bookingCharge.status)}</b></p>` : ''}<p class="order-payable"><span>${booking ? 'Remaining Cash on Delivery' : 'Payable amount'}</span><b>${money(booking ? Math.max(0, total - booking) : total)}</b></p></div>`;
}
function verifyBookingPayment(orderId, approved) {
    const orders = store.get('dc_orders'), order = orders.find(entry => entry.id === orderId);
    if (!order?.bookingCharge) return false;
    order.bookingCharge.status = approved ? 'verified' : 'rejected'; order.bookingCharge.verifiedAt = new Date().toISOString(); order.status = approved ? 'Accepted' : 'Payment Rejected'; store.set('dc_orders', orders); return true;
}
function bookingChargeCheckout() {
    const root = $('#booking-charge-page') || $('#online-payment-page');
    if (!root) return;
    const draft = sessionStorage.getItem('dc_booking_checkout');
    if (!draft) { location.href = '/customer/checkout.html'; return; }
    const { order, settings } = JSON.parse(draft);
    root.innerHTML = `<section class="page-heading"><p class="eyebrow">FINAL PAYMENT STEP</p><h1>Booking charge</h1></section><main class="booking-charge-layout"><button class="booking-page-back" type="button" aria-label="Back to checkout">×</button><form id="booking-charge-form" class="checkout-form"><h2>Pay booking charge</h2>${bookingChargeContent(settings)}<button class="primary wide" type="submit">Done & place order →</button></form><aside><h2>Order summary</h2><div class="summary"><p><span>Total Order Value</span><b>${money(order.total)}</b></p><p class="booking-charge-row"><span>Booking Charge Paid</span><b>− ${money(settings.amount)}</b></p><hr><p class="grand"><span>Remaining Cash on Delivery</span><b>${money(Math.max(0, order.total - settings.amount))}</b></p></div></aside></main>`;
    if (settings.paymentType === 'onlinePayment') root.querySelector('.page-heading').remove();
    else root.querySelector('.page-heading h1').textContent = 'Confirm payment details';
    if (settings.paymentType === 'onlinePayment') {
        root.querySelector('.booking-payment-panel .eyebrow').textContent = 'ONLINE PAYMENT';
        root.querySelector('#booking-charge-form h2').textContent = 'Pay full order amount';
        root.querySelector('.booking-payment-panel h3').textContent = `Pay ${money(settings.amount)} by UPI`;
        root.querySelector('.booking-payment-panel h3').nextElementSibling.textContent = 'Pay the complete order amount using any UPI app, then enter its transaction/reference number below.';
    }
    root.querySelector('aside h2').textContent = 'Final order details';
    const finalSummary = root.querySelector('aside .summary');
    finalSummary.insertAdjacentHTML('afterbegin', `<p><span>Payment method</span><b>${order.payment}</b></p><p><span>Booking charge payable now</span><b>${money(settings.amount)}</b></p>`);
    if (settings.paymentType === 'onlinePayment') {
        finalSummary.querySelectorAll('p')[1].querySelector('span').textContent = 'Online payment payable now';
        finalSummary.querySelectorAll('.booking-charge-row, .grand').forEach(row => row.remove());
        [...finalSummary.querySelectorAll('p')].find(row => row.querySelector('span')?.textContent.trim() === 'Total Order Value')?.classList.add('online-order-total');
    }
    finalSummary.insertAdjacentHTML('beforeend', '<p class="booking-pending-note">Payment status stays Pending until the admin confirms or rejects it.</p>');
    if (settings.paymentType !== 'onlinePayment') root.querySelector('#booking-charge-form h2').textContent = 'Pay booking charge';
    root.querySelector('#booking-charge-form [type="submit"]').textContent = 'Place order →';
    $('.booking-page-back', root).onclick = () => history.length > 1 ? history.back() : location.href = '/customer/checkout.html';
    $('#booking-charge-form').onsubmit = event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) { form.reportValidity(); toast('Enter the required UPI transaction/reference number'); return; }
        const data = new FormData(form), reference = String(data.get('upiTransactionNumber') || '').trim();
        if (!reference) { form.querySelector('[name="upiTransactionNumber"]').focus(); toast('Enter the required UPI transaction/reference number'); return; }
        order.bookingCharge = { amount: Number(settings.amount), upiId: settings.upiId, payerName: String(data.get('paymentPayerName') || '').trim(), transactionNumber: reference, screenshotName: data.get('upiScreenshot')?.name || '', status: 'pending', submittedAt: new Date().toISOString() };
        const orders = store.get('dc_orders'); orders.unshift(order); store.set('dc_orders', orders); store.set('dc_cart', []); localStorage.removeItem('dc_coupon'); sessionStorage.removeItem('dc_booking_checkout'); toast('Booking payment submitted for verification'); setTimeout(() => location.href = '/customer/orders.html', 500);
    };
}
document.addEventListener('DOMContentLoaded', bookingChargeCheckout);

// The admin's COD setting is shared through the same store as products/orders.
// Remove only the COD choice; online payment and store pickup remain available.
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{const mode=$('#payment-mode'),settings=store.get('dc_cod_settings',{enabled:true});if(!mode||settings.enabled!==false)return;[...mode.options].filter(option=>option.textContent.trim().toLowerCase()==='cash on delivery').forEach(option=>option.remove());if(!mode.value&&mode.options.length)mode.selectedIndex=0;mode.dispatchEvent(new Event('change'));},0));

// Delivery and handling amounts are controlled by the Admin > Delivery Boys page.
const customerChargeConfig=()=>({deliveryEnabled:true,deliveryAmount:35,handlingEnabled:true,handlingAmount:5,...store.get('dc_customer_charge_settings',{})});
cartTotals=function(){const cart=store.cart(),items=cart.map(item=>{const p=products.find(product=>String(product.id)===String(item.id))||item.product;return p&&Number(item.qty)>0?{...item,qty:Number(item.qty),p}:null}).filter(Boolean);const total=items.reduce((sum,item)=>sum+(Number(item.p.price)||0)*item.qty,0),mrp=items.reduce((sum,item)=>sum+(Number(item.p.mrp)||0)*item.qty,0),disc=mrp-total,config=customerChargeConfig(),delivery=config.deliveryEnabled&&total?Math.max(0,Number(config.deliveryAmount)||0):0,handling=config.handlingEnabled&&total?Math.max(0,Number(config.handlingAmount)||0):0,coupon=appliedCoupon(),discount=couponDiscount(coupon,total+delivery+handling);return {items,total,disc,delivery,handling,coupon,couponDiscount:discount,final:total+delivery+handling-discount};};
summary=function(t,pickup=false){const config=customerChargeConfig(),delivery=pickup?0:t.delivery,couponDiscountAmount=couponDiscount(t.coupon,t.total+delivery+t.handling),final=t.total+delivery+t.handling-couponDiscountAmount;return `<div class="summary"><h3>Bill details</h3><p><span>Item total</span><b>${money(t.total)}</b></p><p><span>Product discount</span><b class="green">− ${money(t.disc)}</b></p>${!pickup&&config.deliveryEnabled?`<p><span>Delivery charge</span><b>${money(delivery)}</b></p>`:''}${config.handlingEnabled?`<p><span>Handling fee</span><b>${money(t.handling)}</b></p>`:''}${couponDiscountAmount?`<p><span>Coupon (${t.coupon.code} - ${t.coupon.label})</span><b class="green">− ${money(couponDiscountAmount)}</b></p>`:''}<hr><p class="grand"><span>Grand Total</span><b>${money(final)}</b></p></div>`;};
checkoutSummary=function(t,pickup,payment,settings){const config=customerChargeConfig(),delivery=pickup?0:t.delivery,base=t.total+delivery+t.handling,discount=couponDiscount(t.coupon,base),totalValue=base-discount,booking=bookingChargeApplies(payment,settings)?settings.amount:0;return `<div class="summary"><h3>Bill details</h3><p><span>Item total</span><b>${money(t.total)}</b></p><p><span>Product discount</span><b class="green">− ${money(t.disc)}</b></p>${!pickup&&config.deliveryEnabled?`<p><span>Delivery charge</span><b>${money(delivery)}</b></p>`:''}${config.handlingEnabled?`<p><span>Handling fee</span><b>${money(t.handling)}</b></p>`:''}${discount?`<p><span>Coupon (${t.coupon.code} - ${t.coupon.label})</span><b class="green">− ${money(discount)}</b></p>`:''}<hr>${booking?`<p><span>Total Order Value</span><b>${money(totalValue)}</b></p><p class="booking-charge-row"><span>Booking Charge Paid</span><b>− ${money(booking)}</b></p><p class="grand"><span>Remaining Cash on Delivery</span><b>${money(Math.max(0,totalValue-booking))}</b></p>`:`<p class="grand"><span>Grand Total</span><b>${money(totalValue)}</b></p>`}</div>`;};
orderCharges=function(order){const selfTake=order.payment==='Self Take (Store Pickup)'||order.address?.startsWith('Store Pickup'),config=customerChargeConfig();return {delivery:selfTake||!config.deliveryEnabled?0:Math.max(0,Number(config.deliveryAmount)||0),handling:config.handlingEnabled?Math.max(0,Number(config.handlingAmount)||0):0,selfTake};};

// Keep the payment choices in sync whenever checkout is rendered or an admin
// changes the COD setting in another open tab.
function syncCustomerCodOption(){const mode=$('#payment-mode'),codEnabled=store.get('dc_cod_settings',{enabled:true}).enabled!==false;if(!mode)return;if(!codEnabled){[...mode.options].filter(option=>option.value==='Cash on Delivery'||option.textContent.trim().toLowerCase()==='cash on delivery').forEach(option=>option.remove());if(!mode.value&&mode.options.length)mode.selectedIndex=0;mode.dispatchEvent(new Event('change'));}}
const renderCustomerCheckout=checkout;checkout=function(){renderCustomerCheckout();setTimeout(syncCustomerCodOption,0);};
window.addEventListener('storage',event=>{if(['dc_cod_settings','dc_booking_charge_settings','dc_online_payment_settings'].includes(event.key)&&$('#checkout-page'))checkout();});
