export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: string;
  cost: number;
  retailPrice: number;
  mrp: number;
  stock: number;
}

export const mockCategories: Category[] = [
  {
    "id": "fv",
    "name": "Fruits & Veggies",
    "icon": "🥬"
  },
  {
    "id": "dairy",
    "name": "Dairy, Bread & Eggs",
    "icon": "🥛"
  },
  {
    "id": "staples",
    "name": "Atta, Rice & Dal",
    "icon": "🌾"
  },
  {
    "id": "cooking",
    "name": "Oil, Ghee & Masala",
    "icon": "🛢️"
  },
  {
    "id": "snacks",
    "name": "Snacks & Namkeen",
    "icon": "🍿"
  },
  {
    "id": "drinks",
    "name": "Cold Drinks",
    "icon": "🥤"
  },
  {
    "id": "instant",
    "name": "Instant & Noodles",
    "icon": "🍜"
  },
  {
    "id": "bakery",
    "name": "Bakery & Biscuits",
    "icon": "🍪"
  },
  {
    "id": "house",
    "name": "Cleaning & Household",
    "icon": "🧼"
  },
  {
    "id": "personal",
    "name": "Personal Care",
    "icon": "🧴"
  }
];

const mockProducts: Product[] = [
  {
    "id": "1",
    "sku": "FV-1",
    "name": "Fresh Onion",
    "unit": "1 kg",
    "category": "fv",
    "cost": 125,
    "retailPrice": 145,
    "mrp": 166,
    "stock": 9
  },
  {
    "id": "2",
    "sku": "FV-2",
    "name": "Fresh Onion",
    "unit": "2 kg",
    "category": "fv",
    "cost": 72,
    "retailPrice": 82,
    "mrp": 92,
    "stock": 15
  },
  {
    "id": "3",
    "sku": "FV-3",
    "name": "Potato",
    "unit": "1 kg",
    "category": "fv",
    "cost": 121,
    "retailPrice": 139,
    "mrp": 157,
    "stock": 26
  },
  {
    "id": "4",
    "sku": "FV-4",
    "name": "Potato",
    "unit": "2 kg",
    "category": "fv",
    "cost": 34,
    "retailPrice": 43,
    "mrp": 53,
    "stock": 39
  },
  {
    "id": "5",
    "sku": "FV-5",
    "name": "Tomato - Local",
    "unit": "500 g",
    "category": "fv",
    "cost": 72,
    "retailPrice": 79,
    "mrp": 87,
    "stock": 34
  },
  {
    "id": "6",
    "sku": "FV-6",
    "name": "Tomato - Local",
    "unit": "1 kg",
    "category": "fv",
    "cost": 60,
    "retailPrice": 70,
    "mrp": 80,
    "stock": 4
  },
  {
    "id": "7",
    "sku": "FV-7",
    "name": "Green Chilli",
    "unit": "100 g",
    "category": "fv",
    "cost": 25,
    "retailPrice": 32,
    "mrp": 39,
    "stock": 19
  },
  {
    "id": "8",
    "sku": "FV-8",
    "name": "Green Chilli",
    "unit": "200 g",
    "category": "fv",
    "cost": 16,
    "retailPrice": 18,
    "mrp": 21,
    "stock": 12
  },
  {
    "id": "9",
    "sku": "FV-9",
    "name": "Coriander Leaves",
    "unit": "1 bunch",
    "category": "fv",
    "cost": 82,
    "retailPrice": 97,
    "mrp": 113,
    "stock": 38
  },
  {
    "id": "10",
    "sku": "FV-10",
    "name": "Kashmir Apples",
    "unit": "4 pcs",
    "category": "fv",
    "cost": 98,
    "retailPrice": 123,
    "mrp": 149,
    "stock": 38
  },
  {
    "id": "11",
    "sku": "FV-11",
    "name": "Kashmir Apples",
    "unit": "1 kg",
    "category": "fv",
    "cost": 32,
    "retailPrice": 38,
    "mrp": 45,
    "stock": 34
  },
  {
    "id": "12",
    "sku": "FV-12",
    "name": "Robusta Banana",
    "unit": "6 pcs",
    "category": "fv",
    "cost": 47,
    "retailPrice": 55,
    "mrp": 63,
    "stock": 44
  },
  {
    "id": "13",
    "sku": "FV-13",
    "name": "Robusta Banana",
    "unit": "12 pcs",
    "category": "fv",
    "cost": 45,
    "retailPrice": 55,
    "mrp": 66,
    "stock": 44
  },
  {
    "id": "14",
    "sku": "FV-14",
    "name": "Pomegranate",
    "unit": "500 g",
    "category": "fv",
    "cost": 18,
    "retailPrice": 20,
    "mrp": 23,
    "stock": 17
  },
  {
    "id": "15",
    "sku": "FV-15",
    "name": "Pomegranate",
    "unit": "1 kg",
    "category": "fv",
    "cost": 55,
    "retailPrice": 66,
    "mrp": 77,
    "stock": 44
  },
  {
    "id": "16",
    "sku": "FV-16",
    "name": "Cauliflower",
    "unit": "1 pc",
    "category": "fv",
    "cost": 107,
    "retailPrice": 136,
    "mrp": 165,
    "stock": 29
  },
  {
    "id": "17",
    "sku": "FV-17",
    "name": "Cabbage",
    "unit": "1 pc",
    "category": "fv",
    "cost": 26,
    "retailPrice": 28,
    "mrp": 31,
    "stock": 24
  },
  {
    "id": "18",
    "sku": "FV-18",
    "name": "Carrot - Orange",
    "unit": "500 g",
    "category": "fv",
    "cost": 85,
    "retailPrice": 99,
    "mrp": 114,
    "stock": 6
  },
  {
    "id": "19",
    "sku": "FV-19",
    "name": "Carrot - Orange",
    "unit": "1 kg",
    "category": "fv",
    "cost": 76,
    "retailPrice": 96,
    "mrp": 116,
    "stock": 12
  },
  {
    "id": "20",
    "sku": "FV-20",
    "name": "Capsicum - Green",
    "unit": "500 g",
    "category": "fv",
    "cost": 153,
    "retailPrice": 176,
    "mrp": 199,
    "stock": 39
  },
  {
    "id": "21",
    "sku": "FV-21",
    "name": "Lady Finger (Bhindi)",
    "unit": "500 g",
    "category": "fv",
    "cost": 44,
    "retailPrice": 51,
    "mrp": 59,
    "stock": 43
  },
  {
    "id": "22",
    "sku": "FV-22",
    "name": "Bottle Gourd",
    "unit": "1 pc",
    "category": "fv",
    "cost": 69,
    "retailPrice": 87,
    "mrp": 105,
    "stock": 39
  },
  {
    "id": "23",
    "sku": "DAIRY-23",
    "name": "Amul Taaza Toned Milk",
    "unit": "500 ml",
    "category": "dairy",
    "cost": 85,
    "retailPrice": 96,
    "mrp": 107,
    "stock": 18
  },
  {
    "id": "24",
    "sku": "DAIRY-24",
    "name": "Amul Taaza Toned Milk",
    "unit": "1 L",
    "category": "dairy",
    "cost": 26,
    "retailPrice": 33,
    "mrp": 41,
    "stock": 49
  },
  {
    "id": "25",
    "sku": "DAIRY-25",
    "name": "Nandini GoodLife Milk",
    "unit": "500 ml",
    "category": "dairy",
    "cost": 88,
    "retailPrice": 110,
    "mrp": 133,
    "stock": 47
  },
  {
    "id": "26",
    "sku": "DAIRY-26",
    "name": "Nandini GoodLife Milk",
    "unit": "1 L",
    "category": "dairy",
    "cost": 63,
    "retailPrice": 76,
    "mrp": 90,
    "stock": 40
  },
  {
    "id": "27",
    "sku": "DAIRY-27",
    "name": "Mother Dairy Toned Milk",
    "unit": "500 ml",
    "category": "dairy",
    "cost": 154,
    "retailPrice": 180,
    "mrp": 207,
    "stock": 1
  },
  {
    "id": "28",
    "sku": "DAIRY-28",
    "name": "Farm Fresh Eggs",
    "unit": "6 pcs",
    "category": "dairy",
    "cost": 17,
    "retailPrice": 20,
    "mrp": 24,
    "stock": 34
  },
  {
    "id": "29",
    "sku": "DAIRY-29",
    "name": "Farm Fresh Eggs",
    "unit": "12 pcs",
    "category": "dairy",
    "cost": 20,
    "retailPrice": 25,
    "mrp": 30,
    "stock": 12
  },
  {
    "id": "30",
    "sku": "DAIRY-30",
    "name": "Farm Fresh Eggs",
    "unit": "30 pcs",
    "category": "dairy",
    "cost": 136,
    "retailPrice": 155,
    "mrp": 175,
    "stock": 43
  },
  {
    "id": "31",
    "sku": "DAIRY-31",
    "name": "Amul Butter",
    "unit": "100 g",
    "category": "dairy",
    "cost": 91,
    "retailPrice": 114,
    "mrp": 138,
    "stock": 34
  },
  {
    "id": "32",
    "sku": "DAIRY-32",
    "name": "Amul Butter",
    "unit": "500 g",
    "category": "dairy",
    "cost": 108,
    "retailPrice": 118,
    "mrp": 129,
    "stock": 30
  },
  {
    "id": "33",
    "sku": "DAIRY-33",
    "name": "Amul Cheese Slices",
    "unit": "200 g",
    "category": "dairy",
    "cost": 28,
    "retailPrice": 31,
    "mrp": 35,
    "stock": 48
  },
  {
    "id": "34",
    "sku": "DAIRY-34",
    "name": "Milky Mist Paneer",
    "unit": "200 g",
    "category": "dairy",
    "cost": 50,
    "retailPrice": 64,
    "mrp": 78,
    "stock": 20
  },
  {
    "id": "35",
    "sku": "DAIRY-35",
    "name": "Milky Mist Paneer",
    "unit": "500 g",
    "category": "dairy",
    "cost": 101,
    "retailPrice": 128,
    "mrp": 155,
    "stock": 30
  },
  {
    "id": "36",
    "sku": "DAIRY-36",
    "name": "ID Idly Dosa Batter",
    "unit": "1 kg",
    "category": "dairy",
    "cost": 86,
    "retailPrice": 95,
    "mrp": 105,
    "stock": 34
  },
  {
    "id": "37",
    "sku": "DAIRY-37",
    "name": "Epigamia Greek Yogurt",
    "unit": "90 g",
    "category": "dairy",
    "cost": 111,
    "retailPrice": 133,
    "mrp": 155,
    "stock": 38
  },
  {
    "id": "38",
    "sku": "DAIRY-38",
    "name": "Britannia Cheese Cubes",
    "unit": "200 g",
    "category": "dairy",
    "cost": 135,
    "retailPrice": 171,
    "mrp": 207,
    "stock": 22
  },
  {
    "id": "39",
    "sku": "DAIRY-39",
    "name": "Nestle Everyday Dairy Whitener",
    "unit": "400 g",
    "category": "dairy",
    "cost": 125,
    "retailPrice": 145,
    "mrp": 165,
    "stock": 24
  },
  {
    "id": "40",
    "sku": "DAIRY-40",
    "name": "Amul Taaza Toned Milk",
    "unit": "500 ml",
    "category": "dairy",
    "cost": 122,
    "retailPrice": 151,
    "mrp": 180,
    "stock": 49
  },
  {
    "id": "41",
    "sku": "DAIRY-41",
    "name": "Amul Taaza Toned Milk",
    "unit": "1 L",
    "category": "dairy",
    "cost": 64,
    "retailPrice": 82,
    "mrp": 100,
    "stock": 11
  },
  {
    "id": "42",
    "sku": "DAIRY-42",
    "name": "Nandini GoodLife Milk",
    "unit": "500 ml",
    "category": "dairy",
    "cost": 26,
    "retailPrice": 33,
    "mrp": 40,
    "stock": 34
  },
  {
    "id": "43",
    "sku": "DAIRY-43",
    "name": "Nandini GoodLife Milk",
    "unit": "1 L",
    "category": "dairy",
    "cost": 163,
    "retailPrice": 206,
    "mrp": 249,
    "stock": 39
  },
  {
    "id": "44",
    "sku": "DAIRY-44",
    "name": "Mother Dairy Toned Milk",
    "unit": "500 ml",
    "category": "dairy",
    "cost": 162,
    "retailPrice": 201,
    "mrp": 240,
    "stock": 9
  },
  {
    "id": "45",
    "sku": "STAPLES-45",
    "name": "India Gate Basmati Rice",
    "unit": "1 kg",
    "category": "staples",
    "cost": 71,
    "retailPrice": 87,
    "mrp": 103,
    "stock": 47
  },
  {
    "id": "46",
    "sku": "STAPLES-46",
    "name": "India Gate Basmati Rice",
    "unit": "5 kg",
    "category": "staples",
    "cost": 137,
    "retailPrice": 159,
    "mrp": 182,
    "stock": 42
  },
  {
    "id": "47",
    "sku": "STAPLES-47",
    "name": "Aashirvaad Shudh Chakki Atta",
    "unit": "5 kg",
    "category": "staples",
    "cost": 154,
    "retailPrice": 187,
    "mrp": 220,
    "stock": 33
  },
  {
    "id": "48",
    "sku": "STAPLES-48",
    "name": "Aashirvaad Shudh Chakki Atta",
    "unit": "10 kg",
    "category": "staples",
    "cost": 40,
    "retailPrice": 47,
    "mrp": 54,
    "stock": 12
  },
  {
    "id": "49",
    "sku": "STAPLES-49",
    "name": "Pillsbury Chakki Fresh Atta",
    "unit": "5 kg",
    "category": "staples",
    "cost": 36,
    "retailPrice": 42,
    "mrp": 48,
    "stock": 21
  },
  {
    "id": "50",
    "sku": "STAPLES-50",
    "name": "Tata Sampann Toor Dal",
    "unit": "1 kg",
    "category": "staples",
    "cost": 121,
    "retailPrice": 152,
    "mrp": 184,
    "stock": 11
  },
  {
    "id": "51",
    "sku": "STAPLES-51",
    "name": "Rajdhani Chana Dal",
    "unit": "500 g",
    "category": "staples",
    "cost": 19,
    "retailPrice": 21,
    "mrp": 23,
    "stock": 6
  },
  {
    "id": "52",
    "sku": "STAPLES-52",
    "name": "Rajdhani Chana Dal",
    "unit": "1 kg",
    "category": "staples",
    "cost": 28,
    "retailPrice": 35,
    "mrp": 42,
    "stock": 5
  },
  {
    "id": "53",
    "sku": "STAPLES-53",
    "name": "Organic Tattva Moong Dal",
    "unit": "500 g",
    "category": "staples",
    "cost": 41,
    "retailPrice": 46,
    "mrp": 52,
    "stock": 12
  },
  {
    "id": "54",
    "sku": "STAPLES-54",
    "name": "Organic Tattva Moong Dal",
    "unit": "1 kg",
    "category": "staples",
    "cost": 21,
    "retailPrice": 24,
    "mrp": 28,
    "stock": 4
  },
  {
    "id": "55",
    "sku": "STAPLES-55",
    "name": "Fortune Soya Chunks",
    "unit": "200 g",
    "category": "staples",
    "cost": 99,
    "retailPrice": 123,
    "mrp": 147,
    "stock": 12
  },
  {
    "id": "56",
    "sku": "STAPLES-56",
    "name": "Kohinoor Super Silver Rice",
    "unit": "5 kg",
    "category": "staples",
    "cost": 79,
    "retailPrice": 90,
    "mrp": 102,
    "stock": 13
  },
  {
    "id": "57",
    "sku": "STAPLES-57",
    "name": "Daawat Rozana Rice",
    "unit": "5 kg",
    "category": "staples",
    "cost": 99,
    "retailPrice": 113,
    "mrp": 127,
    "stock": 20
  },
  {
    "id": "58",
    "sku": "STAPLES-58",
    "name": "Rajdhani Besan",
    "unit": "500 g",
    "category": "staples",
    "cost": 60,
    "retailPrice": 71,
    "mrp": 82,
    "stock": 1
  },
  {
    "id": "59",
    "sku": "STAPLES-59",
    "name": "Rajdhani Besan",
    "unit": "1 kg",
    "category": "staples",
    "cost": 95,
    "retailPrice": 104,
    "mrp": 114,
    "stock": 24
  },
  {
    "id": "60",
    "sku": "STAPLES-60",
    "name": "Tata Salt",
    "unit": "1 kg",
    "category": "staples",
    "cost": 78,
    "retailPrice": 93,
    "mrp": 109,
    "stock": 26
  },
  {
    "id": "61",
    "sku": "STAPLES-61",
    "name": "Madhur Sugar",
    "unit": "1 kg",
    "category": "staples",
    "cost": 135,
    "retailPrice": 151,
    "mrp": 168,
    "stock": 8
  },
  {
    "id": "62",
    "sku": "STAPLES-62",
    "name": "Madhur Sugar",
    "unit": "5 kg",
    "category": "staples",
    "cost": 81,
    "retailPrice": 98,
    "mrp": 115,
    "stock": 9
  },
  {
    "id": "63",
    "sku": "STAPLES-63",
    "name": "India Gate Basmati Rice",
    "unit": "1 kg",
    "category": "staples",
    "cost": 118,
    "retailPrice": 140,
    "mrp": 162,
    "stock": 15
  },
  {
    "id": "64",
    "sku": "STAPLES-64",
    "name": "India Gate Basmati Rice",
    "unit": "5 kg",
    "category": "staples",
    "cost": 20,
    "retailPrice": 22,
    "mrp": 24,
    "stock": 41
  },
  {
    "id": "65",
    "sku": "STAPLES-65",
    "name": "Aashirvaad Shudh Chakki Atta",
    "unit": "5 kg",
    "category": "staples",
    "cost": 39,
    "retailPrice": 46,
    "mrp": 54,
    "stock": 48
  },
  {
    "id": "66",
    "sku": "STAPLES-66",
    "name": "Aashirvaad Shudh Chakki Atta",
    "unit": "10 kg",
    "category": "staples",
    "cost": 128,
    "retailPrice": 143,
    "mrp": 159,
    "stock": 48
  },
  {
    "id": "67",
    "sku": "COOKING-67",
    "name": "Fortune Sunflower Oil",
    "unit": "1 L",
    "category": "cooking",
    "cost": 125,
    "retailPrice": 140,
    "mrp": 156,
    "stock": 26
  },
  {
    "id": "68",
    "sku": "COOKING-68",
    "name": "Fortune Sunflower Oil",
    "unit": "5 L",
    "category": "cooking",
    "cost": 87,
    "retailPrice": 97,
    "mrp": 108,
    "stock": 29
  },
  {
    "id": "69",
    "sku": "COOKING-69",
    "name": "Saffola Gold Oil",
    "unit": "1 L",
    "category": "cooking",
    "cost": 153,
    "retailPrice": 168,
    "mrp": 183,
    "stock": 10
  },
  {
    "id": "70",
    "sku": "COOKING-70",
    "name": "Saffola Gold Oil",
    "unit": "5 L",
    "category": "cooking",
    "cost": 42,
    "retailPrice": 54,
    "mrp": 66,
    "stock": 13
  },
  {
    "id": "71",
    "sku": "COOKING-71",
    "name": "Amul Pure Ghee",
    "unit": "500 ml",
    "category": "cooking",
    "cost": 31,
    "retailPrice": 36,
    "mrp": 41,
    "stock": 47
  },
  {
    "id": "72",
    "sku": "COOKING-72",
    "name": "Amul Pure Ghee",
    "unit": "1 L",
    "category": "cooking",
    "cost": 157,
    "retailPrice": 187,
    "mrp": 218,
    "stock": 5
  },
  {
    "id": "73",
    "sku": "COOKING-73",
    "name": "Mother Dairy Ghee",
    "unit": "1 L",
    "category": "cooking",
    "cost": 98,
    "retailPrice": 121,
    "mrp": 144,
    "stock": 12
  },
  {
    "id": "74",
    "sku": "COOKING-74",
    "name": "Everest Turmeric Powder",
    "unit": "100 g",
    "category": "cooking",
    "cost": 160,
    "retailPrice": 195,
    "mrp": 231,
    "stock": 47
  },
  {
    "id": "75",
    "sku": "COOKING-75",
    "name": "Everest Turmeric Powder",
    "unit": "200 g",
    "category": "cooking",
    "cost": 23,
    "retailPrice": 29,
    "mrp": 35,
    "stock": 41
  },
  {
    "id": "76",
    "sku": "COOKING-76",
    "name": "MDH Garam Masala",
    "unit": "100 g",
    "category": "cooking",
    "cost": 120,
    "retailPrice": 148,
    "mrp": 177,
    "stock": 7
  },
  {
    "id": "77",
    "sku": "COOKING-77",
    "name": "Everest Coriander Powder",
    "unit": "100 g",
    "category": "cooking",
    "cost": 56,
    "retailPrice": 62,
    "mrp": 68,
    "stock": 26
  },
  {
    "id": "78",
    "sku": "COOKING-78",
    "name": "Catch Red Chilli Powder",
    "unit": "100 g",
    "category": "cooking",
    "cost": 80,
    "retailPrice": 97,
    "mrp": 114,
    "stock": 40
  },
  {
    "id": "79",
    "sku": "COOKING-79",
    "name": "Maggi Masala-ae-Magic",
    "unit": "60 g",
    "category": "cooking",
    "cost": 124,
    "retailPrice": 141,
    "mrp": 159,
    "stock": 26
  },
  {
    "id": "80",
    "sku": "COOKING-80",
    "name": "Dhara Mustard Oil",
    "unit": "1 L",
    "category": "cooking",
    "cost": 159,
    "retailPrice": 191,
    "mrp": 224,
    "stock": 41
  },
  {
    "id": "81",
    "sku": "COOKING-81",
    "name": "Suhana Paneer Tikka Masala",
    "unit": "50 g",
    "category": "cooking",
    "cost": 160,
    "retailPrice": 194,
    "mrp": 229,
    "stock": 6
  },
  {
    "id": "82",
    "sku": "COOKING-82",
    "name": "Tata Sampann Haldi",
    "unit": "200 g",
    "category": "cooking",
    "cost": 134,
    "retailPrice": 173,
    "mrp": 213,
    "stock": 33
  },
  {
    "id": "83",
    "sku": "COOKING-83",
    "name": "Fortune Sunflower Oil",
    "unit": "1 L",
    "category": "cooking",
    "cost": 35,
    "retailPrice": 45,
    "mrp": 55,
    "stock": 41
  },
  {
    "id": "84",
    "sku": "COOKING-84",
    "name": "Fortune Sunflower Oil",
    "unit": "5 L",
    "category": "cooking",
    "cost": 67,
    "retailPrice": 82,
    "mrp": 97,
    "stock": 37
  },
  {
    "id": "85",
    "sku": "COOKING-85",
    "name": "Saffola Gold Oil",
    "unit": "1 L",
    "category": "cooking",
    "cost": 136,
    "retailPrice": 165,
    "mrp": 195,
    "stock": 7
  },
  {
    "id": "86",
    "sku": "COOKING-86",
    "name": "Saffola Gold Oil",
    "unit": "5 L",
    "category": "cooking",
    "cost": 120,
    "retailPrice": 132,
    "mrp": 144,
    "stock": 30
  },
  {
    "id": "87",
    "sku": "COOKING-87",
    "name": "Amul Pure Ghee",
    "unit": "500 ml",
    "category": "cooking",
    "cost": 118,
    "retailPrice": 148,
    "mrp": 178,
    "stock": 26
  },
  {
    "id": "88",
    "sku": "COOKING-88",
    "name": "Amul Pure Ghee",
    "unit": "1 L",
    "category": "cooking",
    "cost": 68,
    "retailPrice": 85,
    "mrp": 103,
    "stock": 1
  },
  {
    "id": "89",
    "sku": "SNACKS-89",
    "name": "Lays Magic Masala",
    "unit": "50 g",
    "category": "snacks",
    "cost": 59,
    "retailPrice": 72,
    "mrp": 86,
    "stock": 17
  },
  {
    "id": "90",
    "sku": "SNACKS-90",
    "name": "Lays Magic Masala",
    "unit": "90 g",
    "category": "snacks",
    "cost": 82,
    "retailPrice": 104,
    "mrp": 126,
    "stock": 27
  },
  {
    "id": "91",
    "sku": "SNACKS-91",
    "name": "Kurkure Masala Munch",
    "unit": "90 g",
    "category": "snacks",
    "cost": 60,
    "retailPrice": 70,
    "mrp": 80,
    "stock": 2
  },
  {
    "id": "92",
    "sku": "SNACKS-92",
    "name": "Kurkure Masala Munch",
    "unit": "130 g",
    "category": "snacks",
    "cost": 97,
    "retailPrice": 111,
    "mrp": 125,
    "stock": 32
  },
  {
    "id": "93",
    "sku": "SNACKS-93",
    "name": "Bingo Mad Angles",
    "unit": "70 g",
    "category": "snacks",
    "cost": 19,
    "retailPrice": 24,
    "mrp": 30,
    "stock": 15
  },
  {
    "id": "94",
    "sku": "SNACKS-94",
    "name": "Bingo Mad Angles",
    "unit": "130 g",
    "category": "snacks",
    "cost": 27,
    "retailPrice": 34,
    "mrp": 41,
    "stock": 39
  },
  {
    "id": "95",
    "sku": "SNACKS-95",
    "name": "Haldiram's Bhujia Sev",
    "unit": "200 g",
    "category": "snacks",
    "cost": 90,
    "retailPrice": 116,
    "mrp": 142,
    "stock": 26
  },
  {
    "id": "96",
    "sku": "SNACKS-96",
    "name": "Haldiram's Bhujia Sev",
    "unit": "400 g",
    "category": "snacks",
    "cost": 134,
    "retailPrice": 160,
    "mrp": 186,
    "stock": 24
  },
  {
    "id": "97",
    "sku": "SNACKS-97",
    "name": "Haldiram's Moong Dal",
    "unit": "200 g",
    "category": "snacks",
    "cost": 51,
    "retailPrice": 57,
    "mrp": 63,
    "stock": 11
  },
  {
    "id": "98",
    "sku": "SNACKS-98",
    "name": "Haldiram's Aloo Bhujia",
    "unit": "400 g",
    "category": "snacks",
    "cost": 39,
    "retailPrice": 47,
    "mrp": 56,
    "stock": 23
  },
  {
    "id": "99",
    "sku": "SNACKS-99",
    "name": "Doritos Nacho Cheese",
    "unit": "60 g",
    "category": "snacks",
    "cost": 161,
    "retailPrice": 202,
    "mrp": 243,
    "stock": 24
  },
  {
    "id": "100",
    "sku": "SNACKS-100",
    "name": "Doritos Nacho Cheese",
    "unit": "140 g",
    "category": "snacks",
    "cost": 144,
    "retailPrice": 170,
    "mrp": 197,
    "stock": 24
  },
  {
    "id": "101",
    "sku": "SNACKS-101",
    "name": "Balaji Wafers Cream & Onion",
    "unit": "65 g",
    "category": "snacks",
    "cost": 156,
    "retailPrice": 196,
    "mrp": 236,
    "stock": 25
  },
  {
    "id": "102",
    "sku": "SNACKS-102",
    "name": "Pringles Original",
    "unit": "110 g",
    "category": "snacks",
    "cost": 73,
    "retailPrice": 84,
    "mrp": 95,
    "stock": 21
  },
  {
    "id": "103",
    "sku": "SNACKS-103",
    "name": "Too Yumm! Multigrain Chips",
    "unit": "70 g",
    "category": "snacks",
    "cost": 122,
    "retailPrice": 151,
    "mrp": 180,
    "stock": 35
  },
  {
    "id": "104",
    "sku": "SNACKS-104",
    "name": "Makhanawala's Roasted Makhana",
    "unit": "100 g",
    "category": "snacks",
    "cost": 28,
    "retailPrice": 34,
    "mrp": 40,
    "stock": 21
  },
  {
    "id": "105",
    "sku": "SNACKS-105",
    "name": "ACT II Microwave Popcorn",
    "unit": "99 g",
    "category": "snacks",
    "cost": 86,
    "retailPrice": 108,
    "mrp": 131,
    "stock": 7
  },
  {
    "id": "106",
    "sku": "SNACKS-106",
    "name": "Lays Magic Masala",
    "unit": "50 g",
    "category": "snacks",
    "cost": 113,
    "retailPrice": 146,
    "mrp": 179,
    "stock": 31
  },
  {
    "id": "107",
    "sku": "SNACKS-107",
    "name": "Lays Magic Masala",
    "unit": "90 g",
    "category": "snacks",
    "cost": 161,
    "retailPrice": 182,
    "mrp": 203,
    "stock": 49
  },
  {
    "id": "108",
    "sku": "SNACKS-108",
    "name": "Kurkure Masala Munch",
    "unit": "90 g",
    "category": "snacks",
    "cost": 106,
    "retailPrice": 137,
    "mrp": 169,
    "stock": 37
  },
  {
    "id": "109",
    "sku": "SNACKS-109",
    "name": "Kurkure Masala Munch",
    "unit": "130 g",
    "category": "snacks",
    "cost": 158,
    "retailPrice": 199,
    "mrp": 241,
    "stock": 35
  },
  {
    "id": "110",
    "sku": "SNACKS-110",
    "name": "Bingo Mad Angles",
    "unit": "70 g",
    "category": "snacks",
    "cost": 87,
    "retailPrice": 96,
    "mrp": 106,
    "stock": 28
  },
  {
    "id": "111",
    "sku": "DRINKS-111",
    "name": "Coca Cola",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 63,
    "retailPrice": 80,
    "mrp": 97,
    "stock": 38
  },
  {
    "id": "112",
    "sku": "DRINKS-112",
    "name": "Coca Cola",
    "unit": "2 L",
    "category": "drinks",
    "cost": 130,
    "retailPrice": 156,
    "mrp": 183,
    "stock": 39
  },
  {
    "id": "113",
    "sku": "DRINKS-113",
    "name": "Pepsi",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 104,
    "retailPrice": 131,
    "mrp": 159,
    "stock": 47
  },
  {
    "id": "114",
    "sku": "DRINKS-114",
    "name": "Pepsi",
    "unit": "2.25 L",
    "category": "drinks",
    "cost": 16,
    "retailPrice": 18,
    "mrp": 21,
    "stock": 4
  },
  {
    "id": "115",
    "sku": "DRINKS-115",
    "name": "Thumbs Up",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 62,
    "retailPrice": 71,
    "mrp": 81,
    "stock": 34
  },
  {
    "id": "116",
    "sku": "DRINKS-116",
    "name": "Thumbs Up",
    "unit": "2 L",
    "category": "drinks",
    "cost": 59,
    "retailPrice": 71,
    "mrp": 83,
    "stock": 49
  },
  {
    "id": "117",
    "sku": "DRINKS-117",
    "name": "Sprite",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 62,
    "retailPrice": 69,
    "mrp": 76,
    "stock": 29
  },
  {
    "id": "118",
    "sku": "DRINKS-118",
    "name": "Sprite",
    "unit": "2 L",
    "category": "drinks",
    "cost": 87,
    "retailPrice": 97,
    "mrp": 107,
    "stock": 40
  },
  {
    "id": "119",
    "sku": "DRINKS-119",
    "name": "Fanta",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 152,
    "retailPrice": 174,
    "mrp": 197,
    "stock": 25
  },
  {
    "id": "120",
    "sku": "DRINKS-120",
    "name": "Maaza Mango Drink",
    "unit": "600 ml",
    "category": "drinks",
    "cost": 137,
    "retailPrice": 150,
    "mrp": 164,
    "stock": 0
  },
  {
    "id": "121",
    "sku": "DRINKS-121",
    "name": "Maaza Mango Drink",
    "unit": "1.2 L",
    "category": "drinks",
    "cost": 124,
    "retailPrice": 148,
    "mrp": 172,
    "stock": 23
  },
  {
    "id": "122",
    "sku": "DRINKS-122",
    "name": "Tropicana 100% Orange Juice",
    "unit": "1 L",
    "category": "drinks",
    "cost": 26,
    "retailPrice": 31,
    "mrp": 37,
    "stock": 29
  },
  {
    "id": "123",
    "sku": "DRINKS-123",
    "name": "Real Fruit Power Mixed Fruit",
    "unit": "1 L",
    "category": "drinks",
    "cost": 112,
    "retailPrice": 129,
    "mrp": 147,
    "stock": 23
  },
  {
    "id": "124",
    "sku": "DRINKS-124",
    "name": "Paper Boat Aamras",
    "unit": "250 ml",
    "category": "drinks",
    "cost": 63,
    "retailPrice": 78,
    "mrp": 94,
    "stock": 43
  },
  {
    "id": "125",
    "sku": "DRINKS-125",
    "name": "Red Bull Energy Drink",
    "unit": "250 ml",
    "category": "drinks",
    "cost": 50,
    "retailPrice": 63,
    "mrp": 76,
    "stock": 43
  },
  {
    "id": "126",
    "sku": "DRINKS-126",
    "name": "Sting Energy Drink",
    "unit": "250 ml",
    "category": "drinks",
    "cost": 100,
    "retailPrice": 125,
    "mrp": 150,
    "stock": 32
  },
  {
    "id": "127",
    "sku": "DRINKS-127",
    "name": "Kinley Mineral Water",
    "unit": "1 L",
    "category": "drinks",
    "cost": 73,
    "retailPrice": 83,
    "mrp": 93,
    "stock": 19
  },
  {
    "id": "128",
    "sku": "DRINKS-128",
    "name": "Coca Cola",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 160,
    "retailPrice": 180,
    "mrp": 201,
    "stock": 10
  },
  {
    "id": "129",
    "sku": "DRINKS-129",
    "name": "Coca Cola",
    "unit": "2 L",
    "category": "drinks",
    "cost": 81,
    "retailPrice": 90,
    "mrp": 100,
    "stock": 12
  },
  {
    "id": "130",
    "sku": "DRINKS-130",
    "name": "Pepsi",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 34,
    "retailPrice": 40,
    "mrp": 46,
    "stock": 49
  },
  {
    "id": "131",
    "sku": "DRINKS-131",
    "name": "Pepsi",
    "unit": "2.25 L",
    "category": "drinks",
    "cost": 19,
    "retailPrice": 21,
    "mrp": 24,
    "stock": 11
  },
  {
    "id": "132",
    "sku": "DRINKS-132",
    "name": "Thumbs Up",
    "unit": "750 ml",
    "category": "drinks",
    "cost": 150,
    "retailPrice": 183,
    "mrp": 217,
    "stock": 25
  },
  {
    "id": "133",
    "sku": "INSTANT-133",
    "name": "Maggi 2-Minute Noodles",
    "unit": "140 g",
    "category": "instant",
    "cost": 125,
    "retailPrice": 159,
    "mrp": 194,
    "stock": 23
  },
  {
    "id": "134",
    "sku": "INSTANT-134",
    "name": "Maggi 2-Minute Noodles",
    "unit": "420 g",
    "category": "instant",
    "cost": 155,
    "retailPrice": 183,
    "mrp": 211,
    "stock": 46
  },
  {
    "id": "135",
    "sku": "INSTANT-135",
    "name": "Yippee! Magic Masala Noodles",
    "unit": "240 g",
    "category": "instant",
    "cost": 70,
    "retailPrice": 89,
    "mrp": 109,
    "stock": 34
  },
  {
    "id": "136",
    "sku": "INSTANT-136",
    "name": "Ching's Secret Schezwan Chutney",
    "unit": "250 g",
    "category": "instant",
    "cost": 25,
    "retailPrice": 31,
    "mrp": 38,
    "stock": 33
  },
  {
    "id": "137",
    "sku": "INSTANT-137",
    "name": "Ching's Hakka Noodles",
    "unit": "150 g",
    "category": "instant",
    "cost": 58,
    "retailPrice": 71,
    "mrp": 84,
    "stock": 25
  },
  {
    "id": "138",
    "sku": "INSTANT-138",
    "name": "Knorr Classic Thick Tomato Soup",
    "unit": "53 g",
    "category": "instant",
    "cost": 88,
    "retailPrice": 98,
    "mrp": 109,
    "stock": 5
  },
  {
    "id": "139",
    "sku": "INSTANT-139",
    "name": "Kellogg's Corn Flakes",
    "unit": "475 g",
    "category": "instant",
    "cost": 151,
    "retailPrice": 176,
    "mrp": 201,
    "stock": 7
  },
  {
    "id": "140",
    "sku": "INSTANT-140",
    "name": "Kellogg's Chocos",
    "unit": "390 g",
    "category": "instant",
    "cost": 24,
    "retailPrice": 28,
    "mrp": 32,
    "stock": 28
  },
  {
    "id": "141",
    "sku": "INSTANT-141",
    "name": "Quaker Oats",
    "unit": "1 kg",
    "category": "instant",
    "cost": 104,
    "retailPrice": 133,
    "mrp": 162,
    "stock": 1
  },
  {
    "id": "142",
    "sku": "INSTANT-142",
    "name": "Saffola Masala Oats",
    "unit": "400 g",
    "category": "instant",
    "cost": 162,
    "retailPrice": 190,
    "mrp": 218,
    "stock": 19
  },
  {
    "id": "143",
    "sku": "INSTANT-143",
    "name": "MTR Poha",
    "unit": "160 g",
    "category": "instant",
    "cost": 112,
    "retailPrice": 145,
    "mrp": 178,
    "stock": 26
  },
  {
    "id": "144",
    "sku": "INSTANT-144",
    "name": "Bambino Roasted Vermicelli",
    "unit": "400 g",
    "category": "instant",
    "cost": 91,
    "retailPrice": 118,
    "mrp": 145,
    "stock": 37
  },
  {
    "id": "145",
    "sku": "INSTANT-145",
    "name": "McCain French Fries",
    "unit": "400 g",
    "category": "instant",
    "cost": 152,
    "retailPrice": 178,
    "mrp": 205,
    "stock": 47
  },
  {
    "id": "146",
    "sku": "INSTANT-146",
    "name": "Maggi 2-Minute Noodles",
    "unit": "140 g",
    "category": "instant",
    "cost": 85,
    "retailPrice": 102,
    "mrp": 120,
    "stock": 16
  },
  {
    "id": "147",
    "sku": "INSTANT-147",
    "name": "Maggi 2-Minute Noodles",
    "unit": "420 g",
    "category": "instant",
    "cost": 121,
    "retailPrice": 143,
    "mrp": 165,
    "stock": 16
  },
  {
    "id": "148",
    "sku": "INSTANT-148",
    "name": "Yippee! Magic Masala Noodles",
    "unit": "240 g",
    "category": "instant",
    "cost": 30,
    "retailPrice": 34,
    "mrp": 39,
    "stock": 33
  },
  {
    "id": "149",
    "sku": "INSTANT-149",
    "name": "Ching's Secret Schezwan Chutney",
    "unit": "250 g",
    "category": "instant",
    "cost": 111,
    "retailPrice": 129,
    "mrp": 147,
    "stock": 46
  },
  {
    "id": "150",
    "sku": "INSTANT-150",
    "name": "Ching's Hakka Noodles",
    "unit": "150 g",
    "category": "instant",
    "cost": 62,
    "retailPrice": 75,
    "mrp": 88,
    "stock": 17
  },
  {
    "id": "151",
    "sku": "INSTANT-151",
    "name": "Knorr Classic Thick Tomato Soup",
    "unit": "53 g",
    "category": "instant",
    "cost": 149,
    "retailPrice": 176,
    "mrp": 203,
    "stock": 19
  },
  {
    "id": "152",
    "sku": "INSTANT-152",
    "name": "Kellogg's Corn Flakes",
    "unit": "475 g",
    "category": "instant",
    "cost": 51,
    "retailPrice": 63,
    "mrp": 75,
    "stock": 43
  },
  {
    "id": "153",
    "sku": "INSTANT-153",
    "name": "Kellogg's Chocos",
    "unit": "390 g",
    "category": "instant",
    "cost": 39,
    "retailPrice": 44,
    "mrp": 50,
    "stock": 32
  },
  {
    "id": "154",
    "sku": "INSTANT-154",
    "name": "Quaker Oats",
    "unit": "1 kg",
    "category": "instant",
    "cost": 120,
    "retailPrice": 138,
    "mrp": 157,
    "stock": 24
  },
  {
    "id": "155",
    "sku": "BAKERY-155",
    "name": "Harvest Gold White Bread",
    "unit": "400 g",
    "category": "bakery",
    "cost": 79,
    "retailPrice": 90,
    "mrp": 101,
    "stock": 39
  },
  {
    "id": "156",
    "sku": "BAKERY-156",
    "name": "Britannia Whole Wheat Bread",
    "unit": "400 g",
    "category": "bakery",
    "cost": 31,
    "retailPrice": 35,
    "mrp": 39,
    "stock": 12
  },
  {
    "id": "157",
    "sku": "BAKERY-157",
    "name": "English Oven Brown Bread",
    "unit": "400 g",
    "category": "bakery",
    "cost": 135,
    "retailPrice": 154,
    "mrp": 174,
    "stock": 29
  },
  {
    "id": "158",
    "sku": "BAKERY-158",
    "name": "Britannia Good Day Cashew",
    "unit": "200 g",
    "category": "bakery",
    "cost": 43,
    "retailPrice": 55,
    "mrp": 67,
    "stock": 26
  },
  {
    "id": "159",
    "sku": "BAKERY-159",
    "name": "Parle-G Gold",
    "unit": "1 kg",
    "category": "bakery",
    "cost": 87,
    "retailPrice": 109,
    "mrp": 131,
    "stock": 35
  },
  {
    "id": "160",
    "sku": "BAKERY-160",
    "name": "Oreo Vanilla Creme",
    "unit": "120 g",
    "category": "bakery",
    "cost": 32,
    "retailPrice": 38,
    "mrp": 45,
    "stock": 43
  },
  {
    "id": "161",
    "sku": "BAKERY-161",
    "name": "Sunfeast Dark Fantasy",
    "unit": "300 g",
    "category": "bakery",
    "cost": 150,
    "retailPrice": 184,
    "mrp": 218,
    "stock": 16
  },
  {
    "id": "162",
    "sku": "BAKERY-162",
    "name": "Britannia Marie Gold",
    "unit": "250 g",
    "category": "bakery",
    "cost": 21,
    "retailPrice": 26,
    "mrp": 31,
    "stock": 45
  },
  {
    "id": "163",
    "sku": "BAKERY-163",
    "name": "Hide & Seek Choco Chips",
    "unit": "120 g",
    "category": "bakery",
    "cost": 24,
    "retailPrice": 27,
    "mrp": 31,
    "stock": 19
  },
  {
    "id": "164",
    "sku": "BAKERY-164",
    "name": "Winkies English Tea Cake",
    "unit": "200 g",
    "category": "bakery",
    "cost": 135,
    "retailPrice": 173,
    "mrp": 211,
    "stock": 25
  },
  {
    "id": "165",
    "sku": "BAKERY-165",
    "name": "Bonn Pav",
    "unit": "200 g",
    "category": "bakery",
    "cost": 125,
    "retailPrice": 155,
    "mrp": 186,
    "stock": 28
  },
  {
    "id": "166",
    "sku": "BAKERY-166",
    "name": "Muffins",
    "unit": "6 pcs",
    "category": "bakery",
    "cost": 82,
    "retailPrice": 102,
    "mrp": 123,
    "stock": 23
  },
  {
    "id": "167",
    "sku": "BAKERY-167",
    "name": "Harvest Gold White Bread",
    "unit": "400 g",
    "category": "bakery",
    "cost": 19,
    "retailPrice": 24,
    "mrp": 30,
    "stock": 25
  },
  {
    "id": "168",
    "sku": "BAKERY-168",
    "name": "Britannia Whole Wheat Bread",
    "unit": "400 g",
    "category": "bakery",
    "cost": 98,
    "retailPrice": 121,
    "mrp": 145,
    "stock": 3
  },
  {
    "id": "169",
    "sku": "BAKERY-169",
    "name": "English Oven Brown Bread",
    "unit": "400 g",
    "category": "bakery",
    "cost": 18,
    "retailPrice": 21,
    "mrp": 25,
    "stock": 29
  },
  {
    "id": "170",
    "sku": "BAKERY-170",
    "name": "Britannia Good Day Cashew",
    "unit": "200 g",
    "category": "bakery",
    "cost": 147,
    "retailPrice": 172,
    "mrp": 198,
    "stock": 37
  },
  {
    "id": "171",
    "sku": "BAKERY-171",
    "name": "Parle-G Gold",
    "unit": "1 kg",
    "category": "bakery",
    "cost": 19,
    "retailPrice": 21,
    "mrp": 24,
    "stock": 43
  },
  {
    "id": "172",
    "sku": "BAKERY-172",
    "name": "Oreo Vanilla Creme",
    "unit": "120 g",
    "category": "bakery",
    "cost": 79,
    "retailPrice": 90,
    "mrp": 101,
    "stock": 23
  },
  {
    "id": "173",
    "sku": "BAKERY-173",
    "name": "Sunfeast Dark Fantasy",
    "unit": "300 g",
    "category": "bakery",
    "cost": 54,
    "retailPrice": 61,
    "mrp": 68,
    "stock": 14
  },
  {
    "id": "174",
    "sku": "BAKERY-174",
    "name": "Britannia Marie Gold",
    "unit": "250 g",
    "category": "bakery",
    "cost": 65,
    "retailPrice": 82,
    "mrp": 100,
    "stock": 48
  },
  {
    "id": "175",
    "sku": "BAKERY-175",
    "name": "Hide & Seek Choco Chips",
    "unit": "120 g",
    "category": "bakery",
    "cost": 110,
    "retailPrice": 132,
    "mrp": 154,
    "stock": 6
  },
  {
    "id": "176",
    "sku": "BAKERY-176",
    "name": "Winkies English Tea Cake",
    "unit": "200 g",
    "category": "bakery",
    "cost": 132,
    "retailPrice": 149,
    "mrp": 166,
    "stock": 5
  },
  {
    "id": "177",
    "sku": "HOUSE-177",
    "name": "Surf Excel Matic Front Load",
    "unit": "1 kg",
    "category": "house",
    "cost": 49,
    "retailPrice": 55,
    "mrp": 61,
    "stock": 29
  },
  {
    "id": "178",
    "sku": "HOUSE-178",
    "name": "Surf Excel Matic Front Load",
    "unit": "2 kg",
    "category": "house",
    "cost": 57,
    "retailPrice": 72,
    "mrp": 88,
    "stock": 26
  },
  {
    "id": "179",
    "sku": "HOUSE-179",
    "name": "Ariel Matic Top Load",
    "unit": "1 kg",
    "category": "house",
    "cost": 45,
    "retailPrice": 56,
    "mrp": 67,
    "stock": 43
  },
  {
    "id": "180",
    "sku": "HOUSE-180",
    "name": "Ariel Matic Top Load",
    "unit": "2 kg",
    "category": "house",
    "cost": 84,
    "retailPrice": 95,
    "mrp": 106,
    "stock": 38
  },
  {
    "id": "181",
    "sku": "HOUSE-181",
    "name": "Tide Plus Double Power",
    "unit": "1 kg",
    "category": "house",
    "cost": 20,
    "retailPrice": 22,
    "mrp": 25,
    "stock": 9
  },
  {
    "id": "182",
    "sku": "HOUSE-182",
    "name": "Vim Dishwash Liquid",
    "unit": "500 ml",
    "category": "house",
    "cost": 67,
    "retailPrice": 84,
    "mrp": 101,
    "stock": 2
  },
  {
    "id": "183",
    "sku": "HOUSE-183",
    "name": "Vim Dishwash Liquid",
    "unit": "1 L",
    "category": "house",
    "cost": 16,
    "retailPrice": 18,
    "mrp": 20,
    "stock": 12
  },
  {
    "id": "184",
    "sku": "HOUSE-184",
    "name": "Lizol Floor Cleaner",
    "unit": "1 L",
    "category": "house",
    "cost": 143,
    "retailPrice": 178,
    "mrp": 213,
    "stock": 46
  },
  {
    "id": "185",
    "sku": "HOUSE-185",
    "name": "Harpic Power Plus",
    "unit": "1 L",
    "category": "house",
    "cost": 78,
    "retailPrice": 86,
    "mrp": 95,
    "stock": 13
  },
  {
    "id": "186",
    "sku": "HOUSE-186",
    "name": "Comfort Fabric Conditioner",
    "unit": "860 ml",
    "category": "house",
    "cost": 35,
    "retailPrice": 44,
    "mrp": 53,
    "stock": 25
  },
  {
    "id": "187",
    "sku": "HOUSE-187",
    "name": "Odonil Room Freshener",
    "unit": "50 g",
    "category": "house",
    "cost": 77,
    "retailPrice": 88,
    "mrp": 100,
    "stock": 12
  },
  {
    "id": "188",
    "sku": "HOUSE-188",
    "name": "Hit Mosquito Killer",
    "unit": "400 ml",
    "category": "house",
    "cost": 127,
    "retailPrice": 157,
    "mrp": 188,
    "stock": 37
  },
  {
    "id": "189",
    "sku": "HOUSE-189",
    "name": "Godrej Aer Pocket",
    "unit": "10 g",
    "category": "house",
    "cost": 74,
    "retailPrice": 83,
    "mrp": 93,
    "stock": 27
  },
  {
    "id": "190",
    "sku": "HOUSE-190",
    "name": "Scotch-Brite Scrub Pad",
    "unit": "3 pcs",
    "category": "house",
    "cost": 55,
    "retailPrice": 68,
    "mrp": 82,
    "stock": 34
  },
  {
    "id": "191",
    "sku": "HOUSE-191",
    "name": "Origami Tissue Paper",
    "unit": "100 pulls",
    "category": "house",
    "cost": 53,
    "retailPrice": 66,
    "mrp": 79,
    "stock": 32
  },
  {
    "id": "192",
    "sku": "HOUSE-192",
    "name": "Surf Excel Matic Front Load",
    "unit": "1 kg",
    "category": "house",
    "cost": 82,
    "retailPrice": 99,
    "mrp": 117,
    "stock": 11
  },
  {
    "id": "193",
    "sku": "HOUSE-193",
    "name": "Surf Excel Matic Front Load",
    "unit": "2 kg",
    "category": "house",
    "cost": 48,
    "retailPrice": 56,
    "mrp": 65,
    "stock": 20
  },
  {
    "id": "194",
    "sku": "HOUSE-194",
    "name": "Ariel Matic Top Load",
    "unit": "1 kg",
    "category": "house",
    "cost": 149,
    "retailPrice": 184,
    "mrp": 220,
    "stock": 5
  },
  {
    "id": "195",
    "sku": "HOUSE-195",
    "name": "Ariel Matic Top Load",
    "unit": "2 kg",
    "category": "house",
    "cost": 57,
    "retailPrice": 69,
    "mrp": 82,
    "stock": 5
  },
  {
    "id": "196",
    "sku": "HOUSE-196",
    "name": "Tide Plus Double Power",
    "unit": "1 kg",
    "category": "house",
    "cost": 132,
    "retailPrice": 166,
    "mrp": 201,
    "stock": 30
  },
  {
    "id": "197",
    "sku": "HOUSE-197",
    "name": "Vim Dishwash Liquid",
    "unit": "500 ml",
    "category": "house",
    "cost": 104,
    "retailPrice": 131,
    "mrp": 159,
    "stock": 47
  },
  {
    "id": "198",
    "sku": "HOUSE-198",
    "name": "Vim Dishwash Liquid",
    "unit": "1 L",
    "category": "house",
    "cost": 85,
    "retailPrice": 93,
    "mrp": 102,
    "stock": 0
  },
  {
    "id": "199",
    "sku": "PERSONAL-199",
    "name": "Dove Cream Beauty Bathing Bar",
    "unit": "100 g",
    "category": "personal",
    "cost": 50,
    "retailPrice": 64,
    "mrp": 78,
    "stock": 25
  },
  {
    "id": "200",
    "sku": "PERSONAL-200",
    "name": "Dove Cream Beauty Bathing Bar",
    "unit": "3x100 g",
    "category": "personal",
    "cost": 116,
    "retailPrice": 149,
    "mrp": 183,
    "stock": 19
  },
  {
    "id": "201",
    "sku": "PERSONAL-201",
    "name": "Pears Pure & Gentle",
    "unit": "3x125 g",
    "category": "personal",
    "cost": 65,
    "retailPrice": 71,
    "mrp": 78,
    "stock": 30
  },
  {
    "id": "202",
    "sku": "PERSONAL-202",
    "name": "Cinthol Original Soap",
    "unit": "100 g",
    "category": "personal",
    "cost": 141,
    "retailPrice": 157,
    "mrp": 173,
    "stock": 21
  },
  {
    "id": "203",
    "sku": "PERSONAL-203",
    "name": "Colgate MaxFresh",
    "unit": "150 g",
    "category": "personal",
    "cost": 122,
    "retailPrice": 143,
    "mrp": 165,
    "stock": 39
  },
  {
    "id": "204",
    "sku": "PERSONAL-204",
    "name": "Sensodyne Repair & Protect",
    "unit": "100 g",
    "category": "personal",
    "cost": 91,
    "retailPrice": 111,
    "mrp": 131,
    "stock": 45
  },
  {
    "id": "205",
    "sku": "PERSONAL-205",
    "name": "Sunsilk Black Shine Shampoo",
    "unit": "340 ml",
    "category": "personal",
    "cost": 104,
    "retailPrice": 124,
    "mrp": 144,
    "stock": 19
  },
  {
    "id": "206",
    "sku": "PERSONAL-206",
    "name": "Head & Shoulders Smooth",
    "unit": "340 ml",
    "category": "personal",
    "cost": 132,
    "retailPrice": 168,
    "mrp": 204,
    "stock": 19
  },
  {
    "id": "207",
    "sku": "PERSONAL-207",
    "name": "Parachute Coconut Oil",
    "unit": "200 ml",
    "category": "personal",
    "cost": 29,
    "retailPrice": 35,
    "mrp": 41,
    "stock": 14
  },
  {
    "id": "208",
    "sku": "PERSONAL-208",
    "name": "Parachute Coconut Oil",
    "unit": "500 ml",
    "category": "personal",
    "cost": 83,
    "retailPrice": 102,
    "mrp": 122,
    "stock": 32
  },
  {
    "id": "209",
    "sku": "PERSONAL-209",
    "name": "Nivea Body Milk Nourishing",
    "unit": "400 ml",
    "category": "personal",
    "cost": 57,
    "retailPrice": 65,
    "mrp": 74,
    "stock": 0
  },
  {
    "id": "210",
    "sku": "PERSONAL-210",
    "name": "Vaseline Intensive Care",
    "unit": "400 ml",
    "category": "personal",
    "cost": 99,
    "retailPrice": 127,
    "mrp": 156,
    "stock": 5
  },
  {
    "id": "211",
    "sku": "PERSONAL-211",
    "name": "Gillette Mach 3 Razor",
    "unit": "1 pc",
    "category": "personal",
    "cost": 85,
    "retailPrice": 97,
    "mrp": 109,
    "stock": 7
  },
  {
    "id": "212",
    "sku": "PERSONAL-212",
    "name": "Whisper Choice Ultra",
    "unit": "6 pads",
    "category": "personal",
    "cost": 125,
    "retailPrice": 148,
    "mrp": 171,
    "stock": 43
  },
  {
    "id": "213",
    "sku": "PERSONAL-213",
    "name": "Whisper Choice Ultra",
    "unit": "20 pads",
    "category": "personal",
    "cost": 136,
    "retailPrice": 156,
    "mrp": 176,
    "stock": 48
  },
  {
    "id": "214",
    "sku": "PERSONAL-214",
    "name": "Dove Cream Beauty Bathing Bar",
    "unit": "100 g",
    "category": "personal",
    "cost": 120,
    "retailPrice": 150,
    "mrp": 181,
    "stock": 42
  },
  {
    "id": "215",
    "sku": "PERSONAL-215",
    "name": "Dove Cream Beauty Bathing Bar",
    "unit": "3x100 g",
    "category": "personal",
    "cost": 99,
    "retailPrice": 125,
    "mrp": 151,
    "stock": 1
  },
  {
    "id": "216",
    "sku": "PERSONAL-216",
    "name": "Pears Pure & Gentle",
    "unit": "3x125 g",
    "category": "personal",
    "cost": 16,
    "retailPrice": 18,
    "mrp": 21,
    "stock": 23
  },
  {
    "id": "217",
    "sku": "PERSONAL-217",
    "name": "Cinthol Original Soap",
    "unit": "100 g",
    "category": "personal",
    "cost": 43,
    "retailPrice": 48,
    "mrp": 53,
    "stock": 7
  },
  {
    "id": "218",
    "sku": "PERSONAL-218",
    "name": "Colgate MaxFresh",
    "unit": "150 g",
    "category": "personal",
    "cost": 43,
    "retailPrice": 49,
    "mrp": 55,
    "stock": 46
  },
  {
    "id": "219",
    "sku": "PERSONAL-219",
    "name": "Sensodyne Repair & Protect",
    "unit": "100 g",
    "category": "personal",
    "cost": 42,
    "retailPrice": 46,
    "mrp": 51,
    "stock": 2
  },
  {
    "id": "220",
    "sku": "PERSONAL-220",
    "name": "Sunsilk Black Shine Shampoo",
    "unit": "340 ml",
    "category": "personal",
    "cost": 139,
    "retailPrice": 178,
    "mrp": 217,
    "stock": 38
  }
];

export async function getProducts(params?: { category?: string; search?: string; location?: string }): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL;
  if (!baseUrl) {
    // Fallback to mocks if no API URL is provided
    let results = [...mockProducts];
    if (params?.category) results = results.filter(p => p.category === params.category);
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return results;
  }

  // Use real API
  const url = new URL(`${baseUrl}/api/products`);
  url.searchParams.set("location", params?.location || "SH1");
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProductByIdOrSlug(idOrSlug: string, location: string = "SH1"): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL;
  if (!baseUrl) {
    const slugified = (name: string) => name.replace(/[^a-zA-Z0-9- ]/g, '').replace(/\s+/g, '-').toLowerCase();
    return mockProducts.find(p => p.id === idOrSlug || p.sku === idOrSlug || slugified(p.name) === idOrSlug) || null;
  }

  const res = await fetch(`${baseUrl}/api/products/${idOrSlug}?location=${location}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function getCategories(location: string = "SH1"): Promise<Category[]> {
  const baseUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL;
  if (!baseUrl) return mockCategories;

  const res = await fetch(`${baseUrl}/api/categories?location=${location}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function reserveInventory(orderId: string, items: { sku: string; quantity: number }[], location: string = "SH1"): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL;
  if (!baseUrl) {
    console.log("[Mock] Reserving inventory for order:", orderId, items);
    return;
  }

  const res = await fetch(`${baseUrl}/api/inventory/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      location,
      items
    })
  });

  if (!res.ok) {
    throw new Error("Failed to reserve inventory. Items may be out of stock.");
  }
}
