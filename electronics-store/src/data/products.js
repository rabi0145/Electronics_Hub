
export function placeholderImage(label) {
  return `https://placehold.co/600x600/f1f5f9/334155.png?text=${encodeURIComponent(
    label,
  )}`;
}

export const PRODUCTS = [
  {
    id: "p01",
    name: "Samsung Galaxy S24",
    description:
      "Samsung Galaxy S24 smartphone with a vibrant display, powerful performance, and advanced camera features.",
    category: "smartphones",
    price: 99999,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.8,
    stock: 15,
    featured: true,
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "p02",
    name: "Redmi Note 13 Pro",
    description:
      "Redmi Note 13 Pro with a high-resolution camera, smooth display, and reliable everyday performance.",
    category: "smartphones",
    price: 39999,
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.5,
    stock: 20,
    featured: true,
    createdAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "p03",
    name: "iPhone 15",
    description:
      "Apple iPhone 15 featuring a premium design, advanced camera system, and smooth iOS experience.",
    category: "smartphones",
    price: 119999,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.9,
    stock: 8,
    featured: true,
    createdAt: "2026-01-03T10:00:00.000Z",
  },
  {
    id: "p04",
    name: "Lenovo IdeaPad Slim 3",
    description:
      "Lenovo IdeaPad Slim 3 laptop suitable for students, office work, browsing, and everyday computing.",
    category: "laptops",
    price: 74999,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.4,
    stock: 10,
    featured: true,
    createdAt: "2026-01-04T10:00:00.000Z",
  },
  {
    id: "p05",
    name: "ASUS TUF Gaming F15",
    description:
      "ASUS TUF Gaming F15 laptop designed for gaming, multitasking, and demanding applications.",
    category: "laptops",
    price: 149999,
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.7,
    stock: 6,
    featured: true,
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "p06",
    name: "Sony WH-1000XM5",
    description:
      "Sony wireless over-ear headphones with noise cancellation and immersive sound for everyday listening.",
    category: "audio",
    price: 49999,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.8,
    stock: 12,
    featured: true,
    createdAt: "2026-01-06T10:00:00.000Z",
  },
  {
    id: "p07",
    name: "boAt Airdopes",
    description:
      "Compact wireless earbuds for music, calls, commuting, and everyday entertainment.",
    category: "audio",
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.2,
    stock: 30,
    featured: false,
    createdAt: "2026-01-07T10:00:00.000Z",
  },
  {
    id: "p08",
    name: "Apple Watch SE",
    description:
      "Apple Watch SE smartwatch for activity tracking, notifications, workouts, and daily convenience.",
    category: "smartwatches",
    price: 39999,
    image:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.6,
    stock: 9,
    featured: true,
    createdAt: "2026-01-08T10:00:00.000Z",
  },
  {
    id: "p09",
    name: "Amazfit Bip 5",
    description:
      "Amazfit Bip 5 smartwatch with fitness tracking, health insights, and useful everyday notifications.",
    category: "smartwatches",
    price: 9999,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.3,
    stock: 18,
    featured: false,
    createdAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "p10",
    name: "Logitech MX Master 3S",
    description:
      "Premium wireless productivity mouse with precise tracking, customizable controls, and ergonomic design.",
    category: "keyboards-mice",
    price: 14999,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.8,
    stock: 14,
    featured: true,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "p11",
    name: "Redragon K552 Keyboard",
    description:
      "Mechanical gaming keyboard with tactile keys, durable construction, and a compact layout.",
    category: "keyboards-mice",
    price: 5999,
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.5,
    stock: 16,
    featured: false,
    createdAt: "2026-01-11T10:00:00.000Z",
  },
  {
    id: "p12",
    name: "LG Full HD Monitor",
    description:
      "LG Full HD monitor suitable for office productivity, study, browsing, and home entertainment.",
    category: "monitors",
    price: 22999,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.4,
    stock: 11,
    featured: false,
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "p13",
    name: "Samsung Odyssey Monitor",
    description:
      "Samsung Odyssey gaming monitor designed for immersive gameplay and smooth visual performance.",
    category: "monitors",
    price: 54999,
    image:
      "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.7,
    stock: 5,
    featured: true,
    createdAt: "2026-01-13T10:00:00.000Z",
  },
  {
    id: "p14",
    name: "JBL Flip 6",
    description:
      "Portable Bluetooth speaker for music at home, outdoors, and during travel.",
    category: "speakers",
    price: 14999,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.6,
    stock: 13,
    featured: true,
    createdAt: "2026-01-14T10:00:00.000Z",
  },
  {
    id: "p15",
    name: "Canon EOS 1500D",
    description:
      "Canon DSLR camera for photography learners, hobbyists, and capturing everyday moments.",
    category: "cameras",
    price: 59999,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.5,
    stock: 7,
    featured: false,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "p16",
    name: "GoPro HERO12",
    description:
      "Compact action camera for recording outdoor activities, travel, sports, and adventures.",
    category: "cameras",
    price: 64999,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.7,
    stock: 6,
    featured: false,
    createdAt: "2026-01-16T10:00:00.000Z",
  },
  {
    id: "p17",
    name: "Samsung SSD",
    description:
      "Solid-state storage drive for faster file access, backups, and additional computer storage.",
    category: "components",
    price: 12999,
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.6,
    stock: 20,
    featured: false,
    createdAt: "2026-01-17T10:00:00.000Z",
  },
  {
    id: "p18",
    name: "Anker Power Bank",
    description:
      "Portable power bank for charging compatible smartphones and other devices while travelling.",
    category: "accessories",
    price: 4999,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&h=600&q=80",
    rating: 4.4,
    stock: 25,
    featured: false,
    createdAt: "2026-01-18T10:00:00.000Z",
  },
];
