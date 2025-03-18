import type { Fish, Dish, City } from './types';

export const mockCities: City[] = [
  {
    id: 'msk',
    name: 'Москва',
    stores: [
      {
        id: 'msk-1',
        name: 'Рыбный рай на Тверской',
        address: 'ул. Тверская, д. 15',
        phone: '+7 (495) 123-45-67',
        workingHours: 'Пн-Вс: 09:00-21:00',
      },
      {
        id: 'msk-2',
        name: 'Морской привоз',
        address: 'Ленинградский пр-т, д. 78',
        phone: '+7 (495) 987-65-43',
        workingHours: 'Пн-Вс: 10:00-22:00',
      },
    ],
  },
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    stores: [
      {
        id: 'spb-1',
        name: 'Невский улов',
        address: 'Невский пр-т, д. 100',
        phone: '+7 (812) 111-22-33',
        workingHours: 'Пн-Вс: 10:00-21:00',
      },
      {
        id: 'spb-2',
        name: 'Балтийский бриз',
        address: 'ул. Рубинштейна, д. 5',
        phone: '+7 (812) 444-55-66',
        workingHours: 'Пн-Вс: 09:00-20:00',
      },
    ],
  },
];

export const mockFishes: Fish[] = [
  {
    id: '1',
    name: 'Лосось',
    description: 'Свежий лосось высшего качества',
    media: [
      {
        id: '1',
        url: '/images/salmon.jpg',
        type: 'image',
      },
      {
        id: '2',
        url: '/images/salmon-2.jpg',
        type: 'image',
      },
    ],
    inStock: true,
    preOrderOnly: false,
    availableInCities: ['msk', 'spb'],
  },
  {
    id: '2',
    name: 'Форель',
    description: 'Радужная форель из горных рек',
    media: [
      {
        id: '3',
        url: '/images/trout.jpg',
        type: 'image',
      },
      {
        id: '4',
        url: '/images/trout-2.jpg',
        type: 'image',
      },
    ],
    inStock: true,
    preOrderOnly: false,
    availableInCities: ['msk'],
  },
  {
    id: '3',
    name: 'Осетр',
    description: 'Благородный осетр премиум качества',
    media: [
      {
        id: '5',
        url: '/images/sturgeon.jpg',
        type: 'image',
      },
      {
        id: '6',
        url: '/images/sturgeon-2.jpg',
        type: 'image',
      },
    ],
    inStock: false,
    preOrderOnly: true,
    availableInCities: ['spb'],
  },
];

export const mockDishes: Dish[] = [
  {
    id: '1',
    name: 'Копченый лосось',
    description: 'Нежный копченый лосось с ароматными специями',
    weight: 250,
    media: [
      {
        id: '7',
        url: '/images/smoked-salmon.jpg',
        type: 'image',
      },
      {
        id: '8',
        url: '/images/smoked-salmon-2.jpg',
        type: 'image',
      },
      {
        id: '9',
        url: '/images/smoked-salmon-video.mp4',
        type: 'video',
        thumbnailUrl: '/images/smoked-salmon-video-thumb.jpg',
      },
    ],
    fishId: '1',
    inStock: true,
    preOrderOnly: false,
    availableInStores: ['msk-1', 'msk-2', 'spb-1'],
  },
  {
    id: '2',
    name: 'Филе форели холодного копчения',
    description:
      'Деликатное филе форели, приготовленное по традиционному рецепту',
    weight: 200,
    media: [
      {
        id: '10',
        url: '/images/smoked-trout.jpg',
        type: 'image',
      },
      {
        id: '11',
        url: '/images/smoked-trout-2.jpg',
        type: 'image',
      },
    ],
    fishId: '2',
    inStock: true,
    preOrderOnly: false,
    availableInStores: ['msk-1'],
  },
  {
    id: '3',
    name: 'Балык из осетра',
    description:
      'Изысканный балык из осетра, приготовленный в дровяной коптильне',
    weight: 150,
    media: [
      {
        id: '12',
        url: '/images/sturgeon-fillet.jpg',
        type: 'image',
      },
      {
        id: '13',
        url: '/images/sturgeon-fillet-2.jpg',
        type: 'image',
      },
    ],
    fishId: '3',
    inStock: false,
    preOrderOnly: true,
    availableInStores: ['spb-1', 'spb-2'],
  },
];
