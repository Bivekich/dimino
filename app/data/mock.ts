import { City, Dish, Store } from '@/app/types';

export interface Fish {
  id: string;
  name: string;
}

export const mockFishes: Fish[] = [
  {
    id: 'fish1',
    name: 'Лосось',
  },
  {
    id: 'fish2',
    name: 'Форель',
  },
  {
    id: 'fish3',
    name: 'Осетр',
  },
];

export const mockStores: Store[] = [
  {
    id: 'store1',
    name: 'Деликатесы на Невском',
    address: 'Невский проспект, 28',
    phone: '+7 (812) 123-45-67',
  },
  {
    id: 'store2',
    name: 'Гастроном Центральный',
    address: 'ул. Рубинштейна, 5',
    phone: '+7 (812) 765-43-21',
  },
  {
    id: 'store3',
    name: 'Деликатесы на Арбате',
    address: 'ул. Арбат, 15',
    phone: '+7 (495) 123-45-67',
  },
  {
    id: 'store4',
    name: 'Центральный Гастроном',
    address: 'Тверская ул., 5',
    phone: '+7 (495) 765-43-21',
  },
];

export const mockCities: City[] = [
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    stores: [mockStores[0], mockStores[1]],
  },
  {
    id: 'msk',
    name: 'Москва',
    stores: [mockStores[2], mockStores[3]],
  },
];

export const mockDishes: Dish[] = [
  {
    id: 'dish1',
    name: 'Копченый лосось премиум',
    description:
      'Нежное филе лосося холодного копчения с ароматными специями и цедрой лимона. Готовится по старинным рецептам.',
    weight: 100,
    media: [
      {
        url: '/images/smoked-salmon.jpg',
        type: 'image',
      },
      {
        url: '/images/smoked-trout.jpg',
        type: 'image',
      },
      {
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video',
      },
    ],
    fishId: 'fish1',
    inStock: true,
    availability: {
      inStock: true,
      stores: ['store1', 'store2'],
    },
  },
  {
    id: 'dish2',
    name: 'Копченая форель классическая',
    description:
      'Ароматная форель холодного копчения, идеальна для закусок и праздничного стола. Нежный вкус с легкой дымностью.',
    weight: 250,
    media: [
      {
        url: '/images/smoked-trout.jpg',
        type: 'image',
      },
      {
        url: '/images/sturgeon-fillet.jpg',
        type: 'image',
      },
    ],
    fishId: 'fish2',
    inStock: true,
    availability: {
      inStock: true,
      stores: ['store3', 'store4'],
    },
  },
  {
    id: 'dish3',
    name: 'Филе осетра слабой соли',
    description:
      'Изысканное филе осетра для приготовления деликатесных блюд. Минимум соли, натуральный вкус благородной рыбы.',
    weight: 200,
    media: [
      {
        url: '/images/sturgeon-fillet.jpg',
        type: 'image',
      },
      {
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video',
      },
      {
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        type: 'video',
      },
    ],
    fishId: 'fish3',
    inStock: true,
    availability: {
      inStock: true,
      stores: ['store1'],
    },
  },
  {
    id: 'dish4',
    name: 'Копченый лосось слабосоленый',
    description:
      'Нежное филе лосося слабой соли с ноткой копчения. Идеальный баланс соли, сладости и аромата дыма.',
    weight: 150,
    media: [
      {
        url: '/images/smoked-salmon.jpg',
        type: 'image',
      },
      {
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        type: 'video',
      },
    ],
    fishId: 'fish1',
    inStock: true,
    availability: {
      inStock: true,
      stores: ['store4'],
    },
  },
  {
    id: 'dish5',
    name: 'Филе радужной форели особого посола',
    description:
      'Деликатесное филе радужной форели с добавлением ароматных трав и специй. Строго ограниченная партия.',
    weight: 180,
    media: [],
    fishId: 'fish2',
    inStock: false,
    availability: {
      inStock: false,
      stores: [],
    },
  },
  {
    id: 'dish6',
    name: 'Балык из осетра холодного копчения',
    description:
      'Премиальный балык из филе осетра холодного копчения. Продукт высочайшего качества для настоящих ценителей.',
    weight: 220,
    media: [],
    fishId: 'fish3',
    inStock: false,
    availability: {
      inStock: false,
      stores: [],
    },
  },
];
