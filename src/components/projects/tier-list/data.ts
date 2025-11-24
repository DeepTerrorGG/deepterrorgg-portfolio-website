
import type { Item } from './tier-list-item';

export const allLists = {
    'MCU Movies': {
        name: 'MCU Movies (Phase 1-3)',
        items: [
            // Phase 1
            { id: 'mcu-1', name: 'Iron Man', imageUrl: 'https://picsum.photos/seed/mcu1/96/96' },
            { id: 'mcu-2', name: 'The Incredible Hulk', imageUrl: 'https://picsum.photos/seed/mcu2/96/96' },
            { id: 'mcu-3', name: 'Iron Man 2', imageUrl: 'https://picsum.photos/seed/mcu3/96/96' },
            { id: 'mcu-4', name: 'Thor', imageUrl: 'https://picsum.photos/seed/mcu4/96/96' },
            { id: 'mcu-5', name: 'Captain America: The First Avenger', imageUrl: 'https://picsum.photos/seed/mcu5/96/96' },
            { id: 'mcu-6', name: 'The Avengers', imageUrl: 'https://picsum.photos/seed/mcu6/96/96' },
            // Phase 2
            { id: 'mcu-7', name: 'Iron Man 3', imageUrl: 'https://picsum.photos/seed/mcu7/96/96' },
            { id: 'mcu-8', name: 'Thor: The Dark World', imageUrl: 'https://picsum.photos/seed/mcu8/96/96' },
            { id: 'mcu-9', name: 'Captain America: The Winter Soldier', imageUrl: 'https://picsum.photos/seed/mcu9/96/96' },
            { id: 'mcu-10', name: 'Guardians of the Galaxy', imageUrl: 'https://picsum.photos/seed/mcu10/96/96' },
            { id: 'mcu-11', name: 'Avengers: Age of Ultron', imageUrl: 'https://picsum.photos/seed/mcu11/96/96' },
            { id: 'mcu-12', name: 'Ant-Man', imageUrl: 'https://picsum.photos/seed/mcu12/96/96' },
            // Phase 3
            { id: 'mcu-13', name: 'Captain America: Civil War', imageUrl: 'https://picsum.photos/seed/mcu13/96/96' },
            { id: 'mcu-14', name: 'Doctor Strange', imageUrl: 'https://picsum.photos/seed/mcu14/96/96' },
            { id: 'mcu-15', name: 'Guardians of the Galaxy Vol. 2', imageUrl: 'https://picsum.photos/seed/mcu15/96/96' },
            { id: 'mcu-16', name: 'Spider-Man: Homecoming', imageUrl: 'https://picsum.photos/seed/mcu16/96/96' },
            { id: 'mcu-17', name: 'Thor: Ragnarok', imageUrl: 'https://picsum.photos/seed/mcu17/96/96' },
            { id: 'mcu-18', name: 'Black Panther', imageUrl: 'https://picsum.photos/seed/mcu18/96/96' },
            { id: 'mcu-19', name: 'Avengers: Infinity War', imageUrl: 'https://picsum.photos/seed/mcu19/96/96' },
            { id: 'mcu-20', name: 'Ant-Man and the Wasp', imageUrl: 'https://picsum.photos/seed/mcu20/96/96' },
            { id: 'mcu-21', name: 'Captain Marvel', imageUrl: 'https://picsum.photos/seed/mcu21/96/96' },
            { id: 'mcu-22', name: 'Avengers: Endgame', imageUrl: 'https://picsum.photos/seed/mcu22/96/96' },
            { id: 'mcu-23', name: 'Spider-Man: Far From Home', imageUrl: 'https://picsum.photos/seed/mcu23/96/96' },
        ],
    },
    'Fast Food': {
        name: 'Fast Food Chains',
        items: [
            { id: 'food-1', name: 'McDonald\'s', imageUrl: 'https://picsum.photos/seed/food1/96/96' },
            { id: 'food-2', name: 'Burger King', imageUrl: 'https://picsum.photos/seed/food2/96/96' },
            { id: 'food-3', name: 'Taco Bell', imageUrl: 'https://picsum.photos/seed/food3/96/96' },
            { id: 'food-4', name: 'KFC', imageUrl: 'https://picsum.photos/seed/food4/96/96' },
            { id: 'food-5', name: 'Subway', imageUrl: 'https://picsum.photos/seed/food5/96/96' },
            { id: 'food-6', name: 'Pizza Hut', imageUrl: 'https://picsum.photos/seed/food6/96/96' },
            { id: 'food-7', name: 'Wendy\'s', imageUrl: 'https://picsum.photos/seed/food7/96/96' },
            { id: 'food-8', name: 'Chick-fil-A', imageUrl: 'https://picsum.photos/seed/food8/96/96' },
            { id: 'food-9', name: 'In-N-Out', imageUrl: 'https://picsum.photos/seed/food9/96/96' },
        ]
    },
    'Programming Languages': {
        name: 'Programming Languages',
        items: [
            { id: 'lang-1', name: 'JavaScript', imageUrl: 'https://picsum.photos/seed/lang1/96/96' },
            { id: 'lang-2', name: 'Python', imageUrl: 'https://picsum.photos/seed/lang2/96/96' },
            { id: 'lang-3', name: 'Java', imageUrl: 'https://picsum.photos/seed/lang3/96/96' },
            { id: 'lang-4', name: 'C#', imageUrl: 'https://picsum.photos/seed/lang4/96/96' },
            { id: 'lang-5', name: 'TypeScript', imageUrl: 'https://picsum.photos/seed/lang5/96/96' },
            { id: 'lang-6', name: 'Rust', imageUrl: 'https://picsum.photos/seed/lang6/96/96' },
            { id: 'lang-7', name: 'Go', imageUrl: 'https://picsum.photos/seed/lang7/96/96' },
            { id: 'lang-8', name: 'C++', imageUrl: 'https://picsum.photos/seed/lang8/96/96' },
            { id: 'lang-9', name: 'PHP', imageUrl: 'https://picsum.photos/seed/lang9/96/96' },
        ]
    },
    'Video Games': {
        name: 'Video Games',
        items: [
            { id: 'game-1', name: 'Minecraft', imageUrl: 'https://picsum.photos/seed/game1/96/96' },
            { id: 'game-2', name: 'Grand Theft Auto V', imageUrl: 'https://picsum.photos/seed/game2/96/96' },
            { id: 'game-3', name: 'The Witcher 3', imageUrl: 'https://picsum.photos/seed/game3/96/96' },
            { id: 'game-4', name: 'Breath of the Wild', imageUrl: 'https://picsum.photos/seed/game4/96/96' },
            { id: 'game-5', name: 'Red Dead Redemption 2', imageUrl: 'https://picsum.photos/seed/game5/96/96' },
            { id: 'game-6', name: 'Elden Ring', imageUrl: 'https://picsum.photos/seed/game6/96/96' },
            { id: 'game-7', name: 'Baldur\'s Gate 3', imageUrl: 'https://picsum.photos/seed/game7/96/96' },
            { id: 'game-8', name: 'Stardew Valley', imageUrl: 'https://picsum.photos/seed/game8/96/96' },
        ],
    },
    'Sodas & Drinks': {
        name: 'Sodas & Drinks',
        items: [
            { id: 'drink-1', name: 'Coca-Cola', imageUrl: 'https://picsum.photos/seed/drink1/96/96' },
            { id: 'drink-2', name: 'Pepsi', imageUrl: 'https://picsum.photos/seed/drink2/96/96' },
            { id: 'drink-3', name: 'Dr Pepper', imageUrl: 'https://picsum.photos/seed/drink3/96/96' },
            { id: 'drink-4', name: 'Sprite', imageUrl: 'https://picsum.photos/seed/drink4/96/96' },
            { id: 'drink-5', name: 'Mountain Dew', imageUrl: 'https://picsum.photos/seed/drink5/96/96' },
            { id: 'drink-6', name: 'Water', imageUrl: 'https://picsum.photos/seed/drink6/96/96' },
            { id: 'drink-7', name: 'Coffee', imageUrl: 'https://picsum.photos/seed/drink7/96/96' },
            { id: 'drink-8', name: 'Tea', imageUrl: 'https://picsum.photos/seed/drink8/96/96' },
        ],
    },
    'Alcoholic Drinks': {
        name: 'Alcoholic Drinks',
        items: [
            { id: 'alcohol-1', name: 'Beer', imageUrl: 'https://picsum.photos/seed/alcohol1/96/96' },
            { id: 'alcohol-2', name: 'Wine', imageUrl: 'https://picsum.photos/seed/alcohol2/96/96' },
            { id: 'alcohol-3', name: 'Vodka', imageUrl: 'https://picsum.photos/seed/alcohol3/96/96' },
            { id: 'alcohol-4', name: 'Whiskey', imageUrl: 'https://picsum.photos/seed/alcohol4/96/96' },
            { id: 'alcohol-5', name: 'Rum', imageUrl: 'https://picsum.photos/seed/alcohol5/96/96' },
            { id: 'alcohol-6', name: 'Tequila', imageUrl: 'https://picsum.photos/seed/alcohol6/96/96' },
            { id: 'alcohol-7', name: 'Gin', imageUrl: 'https://picsum.photos/seed/alcohol7/96/96' },
            { id: 'alcohol-8', name: 'Sake', imageUrl: 'https://picsum.photos/seed/alcohol8/96/96' },
        ],
    },
};

export type ListKey = keyof typeof allLists;
