export const CONFIG = {
    COLS: 8,
    ROWS: 8,
    TILE_SIZE: 60,
    TILE_GAP: 6,
    OFFSET_X: 10,
    OFFSET_Y: 10,
    ANIM_SPEED: 0.2,
    
    LEVEL_GOALS: {
        1: { target: 4, name: 'Раскопать костей', moves: 20 },
        2: { target: 8, name: 'Разбить ящиков', moves: 18 },
        3: { target: 3, name: 'Спустить костей', moves: 15 }
    },

    COLORS: {
        0: { main: '#e74c3c', light: '#ff7675', dark: '#c0392b', emoji: '🦖', name: 'T-Rex' },
        1: { main: '#3498db', light: '#74b9ff', dark: '#2980b9', emoji: '🦕', name: 'Стегозавр' },
        2: { main: '#2ecc71', light: '#55efc4', dark: '#27ae60', emoji: '🦎', name: 'Брахиозавр' },
        3: { main: '#f1c40f', light: '#ffeaa7', dark: '#f39c12', emoji: '🦖', name: 'Велоцираптор' },
        4: { main: '#9b59b6', light: '#a29bfe', dark: '#8e44ad', emoji: '🦕', name: 'Трицератопс' },
        5: { main: '#e67e22', light: '#f5b041', dark: '#d35400', emoji: '🦇', name: 'Птеродактиль' }
    }
};

CONFIG.CANVAS_WIDTH = CONFIG.COLS * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) + CONFIG.OFFSET_X * 2;
CONFIG.CANVAS_HEIGHT = CONFIG.ROWS * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) + CONFIG.OFFSET_Y * 2;

export const CANVAS_WIDTH = CONFIG.CANVAS_WIDTH;
export const CANVAS_HEIGHT = CONFIG.CANVAS_HEIGHT;

export const COLOR_KEYS = Object.keys(CONFIG.COLORS);

// ── Кастомные ассеты (необязательно) ─────────────────────────────────
// Просто положи файл по указанному пути — он подхватится сам.
// Если файла нет, автоматически рисуется эмодзи-заглушка.
export const ASSETS = {
    // Спрайты баффов (тайлы-усиления, которые появляются после комбо)
    bonusSprites: {
        LINE_H: 'assets/bonus/line_h.png',
        LINE_V: 'assets/bonus/line_v.png',
        BOMB: 'assets/bonus/bomb.png',
        COLOR_BOMB: 'assets/bonus/color_bomb.png'
    },
    // Универсальный спрайт "кости" на игровом поле (раскопки/падение костей)
    fossilTileSprite: 'assets/bones/fossil.png',
    // Спрайт камушка по его цветовому ключу (см. CONFIG.COLORS, ключи '0'..'5')
    tileSprite: (colorKey) => `assets/tiles/${colorKey}.png`,
    // Иконка конкретного фрагмента кости в музее, по id кости (например '0-1')
    boneIcon: (boneId) => `assets/bones/${boneId}.png`,
    // Картинки динозавра в музее: собранный скелет / живой динозавр
    dinoSkeleton: (dinoId) => `assets/dinos/${dinoId}-skeleton.png`,
    dinoAlive: (dinoId) => `assets/dinos/${dinoId}-alive.png`
};

export const DINO_DATA = {
    // ID динозавра соответствует типу тайла в игре (0-5)
    0: {
        id: 0,
        name: 'Тираннозавр Рекс',
        latinName: 'Tyrannosaurus Rex',
        emoji: '🦖',
        colorKey: 0,
        description: 'Один из крупнейших сухопутных хищников в истории Земли.',
        period: 'Поздний меловой (68-66 млн лет назад)',
        length: '12 м',
        weight: '8 тонн',
        bones: [
            { id: '0-1', name: 'Череп', icon: '💀', fact: 'Сила укуса T-Rex достигала 6 тонн — он мог с легкостью раздавить автомобиль!' },
            { id: '0-2', name: 'Шейный позвонок', icon: '🦴', fact: 'Шея тираннозавра была короткой и мускулистой, чтобы удерживать тяжелую голову.' },
            { id: '0-3', name: 'Грудная клетка', icon: '🫁', fact: 'Ребра защищали жизненно важные органы и поддерживали гигантскую массу тела.' },
            { id: '0-4', name: 'Позвоночник', icon: '🦴', fact: 'Позвоночник состоял из прочных позвонков с воздушными камерами для снижения веса.' },
            { id: '0-5', name: 'Тазовые кости', icon: '🦴', fact: 'Широкий таз служил креплением для мощных мышц задних лап.' },
            { id: '0-6', name: 'Левая передняя лапа', icon: '🦾', fact: 'Передние лапы были длиной всего около 1 метра, но могли поднимать вес до 200 кг!' },
            { id: '0-7', name: 'Правая передняя лапа', icon: '🦾', fact: 'Двупалые лапы использовались для удержания добычи или подъема с земли.' },
            { id: '0-8', name: 'Левая задняя лапа', icon: '🦵', fact: 'Бедренная кость была огромной, позволяя развивать скорость до 20-25 км/ч.' },
            { id: '0-9', name: 'Правая задняя лапа', icon: '🦵', fact: 'Стопа с тремя опорными пальцами отлично распределяла многотонный вес.' },
            { id: '0-10', name: 'Хвост', icon: '🐊', fact: 'Длинный и тяжелый хвост служил противовесом для массивной головы при ходьбе.' }
        ]
    },
    1: {
        id: 1,
        name: 'Стегозавр',
        latinName: 'Stegosaurus',
        emoji: '🦕',
        colorKey: 1,
        description: 'Знаменит своими костными пластинами и шипами на хвосте.',
        period: 'Поздний юрский (155-150 млн лет назад)',
        length: '9 м',
        weight: '3 тонны',
        bones: [
            { id: '1-1', name: 'Череп', icon: '💀', fact: 'Мозг стегозавра был размером с грецкий орех — один из самых маленьких среди динозавров!' },
            { id: '1-2', name: 'Шейные позвонки', icon: '🦴', fact: 'Шея была короткой и состояла из 10 позвонков.' },
            { id: '1-3', name: 'Спинные позвонки', icon: '🦴', fact: 'Кости позвоночника имели специальные выросты для крепления пластин.' },
            { id: '1-4', name: 'Костная пластина', icon: '🛡️', fact: 'Пластины на спине могли менять цвет для привлечения партнёров или отпугивания врагов!' },
            { id: '1-5', name: 'Хвостовые позвонки', icon: '🦴', fact: 'К хвосту крепились 4 острых шипа — грозное оружие против хищников.' },
            { id: '1-6', name: 'Шипы хвоста', icon: '⚔️', fact: 'Каждый шип достигал 60-90 см в длину!' },
            { id: '1-7', name: 'Тазовые кости', icon: '🦴', fact: 'Массивный таз помогал выдерживать вес тяжёлых пластин.' },
            { id: '1-8', name: 'Левая задняя нога', icon: '🦵', fact: 'Ноги были короткими, но мощными для поддержания огромного тела.' },
            { id: '1-9', name: 'Правая задняя нога', icon: '🦵', fact: 'Толщина бедренной кости достигала 30 см!' },
            { id: '1-10', name: 'Броневая спина', icon: '🛡️', fact: 'Пластины были пронизаны кровеносными сосудами для терморегуляции!' }
        ]
    },
    2: {
        id: 2,
        name: 'Брахиозавр',
        latinName: 'Brachiosaurus',
        emoji: '🦎',
        colorKey: 2,
        description: 'Один из самых высоких и тяжёлых динозавров, питался листьями на вершинах деревьев.',
        period: 'Поздний юрский (154-153 млн лет назад)',
        length: '22 м',
        weight: '56 тонн',
        bones: [
            { id: '2-1', name: 'Череп', icon: '💀', fact: 'Ноздри брахиозавра располагались на вершине головы, как у современных китов!' },
            { id: '2-2', name: 'Шея', icon: '🦴', fact: 'Шея достигала 9 метров — как трехэтажный дом! Она состояла из 15-17 позвонков.' },
            { id: '2-3', name: 'Позвоночник', icon: '🦴', fact: 'Позвонки были полыми с воздушными мешками, как у птиц — для снижения веса.' },
            { id: '2-4', name: 'Лёгкие', icon: '🫁', fact: 'Лёгкие брахиозавра были размером с небольшой автомобиль!' },
            { id: '2-5', name: 'Передние конечности', icon: '🦾', fact: 'Передние ноги были длиннее задних, из-за чего спина наклонялась вперёд.' },
            { id: '2-6', name: 'Задние конечности', icon: '🦵', fact: 'Бедренная кость длиной 2 метра — самая длинная из всех известных костей!' },
            { id: '2-7', name: 'Таз', icon: '🦴', fact: 'Тазовый пояс был невероятно мощным, чтобы выдерживать огромный вес.' },
            { id: '2-8', name: 'Рёбра', icon: '🦴', fact: 'Рёбра образовывали клетку длиной 3 метра для защиты органов.' },
            { id: '2-9', name: 'Хвост', icon: '🐊', fact: 'Хвост был относительно коротким и служил противовесом длинной шее.' },
            { id: '2-10', name: 'Плечевой пояс', icon: '🦴', fact: 'Мощные плечевые кости крепили массивные передние ноги к телу.' }
        ]
    },
    3: {
        id: 3,
        name: 'Велоцираптор',
        latinName: 'Velociraptor',
        emoji: '🦖',
        colorKey: 3,
        description: 'Быстрый и умный хищник, прославившийся благодаря фильму "Парк Юрского периода".',
        period: 'Поздний меловой (75-71 млн лет назад)',
        length: '2 м',
        weight: '15 кг',
        bones: [
            { id: '3-1', name: 'Череп', icon: '💀', fact: 'Череп был длиной около 25 см с 80 острыми зубами!' },
            { id: '3-2', name: 'Глазницы', icon: '👁️', fact: 'Глаза были направлены вперёд, обеспечивая бинокулярное зрение для охоты.' },
            { id: '3-3', name: 'Шейные позвонки', icon: '🦴', fact: 'Шея была гибкой и S-образной, как у птиц.' },
            { id: '3-4', name: 'Передние лапы', icon: '🦾', fact: 'Три пальца с острыми когтями на каждой руке — отличные хватательные органы!' },
            { id: '3-5', name: 'Грудная клетка', icon: '🫁', fact: 'Как у птиц, имела киль для крепления мощных летательных мышц.' },
            { id: '3-6', name: 'Позвоночник', icon: '🦴', fact: 'Гибкий хребет позволял совершать быстрые манёвры при охоте.' },
            { id: '3-7', name: 'Таз', icon: '🦴', fact: 'Таз был лёгким, как у птиц — облегчал передвижение на большие расстояния.' },
            { id: '3-8', name: 'Задние ноги', icon: '🦵', fact: 'Длинные ноги позволяли развивать скорость до 60 км/ч!' },
            { id: '3-9', name: 'Серповидный коготь', icon: '⚔️', fact: 'Знаменитый 6.5-сантиметровый коготь на задней ноге использовался для нанесения смертельных ран!' },
            { id: '3-10', name: 'Хвост', icon: '🐊', fact: 'Длинный хвост служил балансиром при беге и резких поворотах.' }
        ]
    },
    4: {
        id: 4,
        name: 'Трицератопс',
        latinName: 'Triceratops',
        emoji: '🦕',
        colorKey: 4,
        description: 'Травоядный динозавр с тремя рогами и большим костяным воротником.',
        period: 'Поздний меловой (68-66 млн лет назад)',
        length: '9 м',
        weight: '6 тонн',
        bones: [
            { id: '4-1', name: 'Череп с воротником', icon: '💀', fact: 'Череп трицератопса достигал 2 метров — почти треть длины всего тела!' },
            { id: '4-2', name: 'Носовой рог', icon: '🦄', fact: 'Носовой рог длиной около 30 см защищал морду от хищников.' },
            { id: '4-3', name: 'Глазные рога', icon: '🦄', fact: 'Два рога над глазами достигали 1 метра и служили грозным оружием!' },
            { id: '4-4', name: 'Костный воротник', icon: '🛡️', fact: 'Воротник защищал шею и служил для привлечения партнёров — мог быть ярким!' },
            { id: '4-5', name: 'Шейные позвонки', icon: '🦴', fact: 'Шея была мускулистой и короткой, чтобы выдерживать вес огромного воротника.' },
            { id: '4-6', name: 'Позвоночник', icon: '🦴', fact: 'Прочный позвоночник поддерживал тяжёлую голову с воротником.' },
            { id: '4-7', name: 'Передние ноги', icon: '🦵', fact: 'Передние ноги были короче задних, как у носорога.' },
            { id: '4-8', name: 'Задние ноги', icon: '🦵', fact: 'Мощные задние ноги позволяли быстро бегать от хищников!' },
            { id: '4-9', name: 'Таз', icon: '🦴', fact: 'Массивный таз крепил мощные ноги к телу.' },
            { id: '4-10', name: 'Костяк черепа', icon: '🦴', fact: 'Воротник был пронизан сосудами и мог менять цвет при кровообращении!' }
        ]
    },
    5: {
        id: 5,
        name: 'Птеродактиль',
        latinName: 'Pterodactylus',
        emoji: '🦇',
        colorKey: 5,
        description: 'Летающий ящер — один из первых открытых птерозавров.',
        period: 'Поздний юрский (150-148 млн лет назад)',
        length: '1 м (размах крыльев 1.5 м)',
        weight: '2.5 кг',
        bones: [
            { id: '5-1', name: 'Череп', icon: '💀', fact: 'Череп с длинным клювом и острыми зубами — идеален для ловли рыбы!' },
            { id: '5-2', name: 'Глазницы', icon: '👁️', fact: 'Большие глаза указывают на отличное зрение — важно для охоты в воздухе.' },
            { id: '5-3', name: 'Шейные позвонки', icon: '🦴', fact: 'Гибкая S-образная шея позволяла маневрировать при полёте.' },
            { id: '5-4', name: 'Крыловая кость', icon: '🦴', fact: 'Основная кость крыла — плечевая — была полой для снижения веса.' },
            { id: '5-5', name: 'Пальцы крыльев', icon: '🦴', fact: 'Четвёртый палец был невероятно длинным и поддерживал крыло!' },
            { id: '5-6', name: 'Крыловая перепонка', icon: '🦇', fact: 'Кожаная перепонка между телом и крыльями могла быть до 25 см!' },
            { id: '5-7', name: 'Грудина', icon: '🛡️', fact: 'Киль на грудине крепил мощные мышцы для машущего полёта.' },
            { id: '5-8', name: 'Позвоночник', icon: '🦴', fact: 'Лёгкий позвоночник с воздушными мешками — как у птиц!' },
            { id: '5-9', name: 'Тазовые кости', icon: '🦴', fact: 'Таз был маленьким — тело было адаптировано для полёта.' },
            { id: '5-10', name: 'Задние конечности', icon: '🦵', fact: 'Ноги были короткими, но помогали при взлёте и посадке.' }
        ]
    }
};

// ── Локализация текстов динозавров ───────────────────────────────────
// DINO_DATA хранит "текущий язык" и мутируется на месте через setDinoLanguage(),
// поэтому все модули, однажды импортировавшие DINO_DATA, всегда видят актуальный текст.
function snapshotDinoText(source) {
    const snap = {};
    Object.keys(source).forEach(id => {
        const d = source[id];
        snap[id] = {
            name: d.name,
            description: d.description,
            period: d.period,
            length: d.length,
            weight: d.weight,
            bones: d.bones.map(b => ({ id: b.id, name: b.name, fact: b.fact }))
        };
    });
    return snap;
}

const DINO_TEXT_RU = snapshotDinoText(DINO_DATA);

const DINO_TEXT_EN = {
    0: {
        name: 'Tyrannosaurus Rex',
        description: 'One of the largest land predators in Earth\u2019s history.',
        period: 'Late Cretaceous (68\u201366 million years ago)',
        length: '12 m',
        weight: '8 tons',
        bones: [
            { id: '0-1', name: 'Skull', fact: 'T-Rex\u2019s bite force reached 6 tons \u2014 strong enough to crush a car!' },
            { id: '0-2', name: 'Neck vertebra', fact: 'Its neck was short and muscular, built to support its heavy head.' },
            { id: '0-3', name: 'Rib cage', fact: 'The ribs protected vital organs and supported its huge body mass.' },
            { id: '0-4', name: 'Spine', fact: 'The spine was made of sturdy vertebrae with air pockets to save weight.' },
            { id: '0-5', name: 'Pelvis', fact: 'The wide pelvis anchored the powerful muscles of its hind legs.' },
            { id: '0-6', name: 'Left forearm', fact: 'Its arms were only about 1 meter long, yet could lift up to 200 kg!' },
            { id: '0-7', name: 'Right forearm', fact: 'The two-fingered hands were used to grip prey or push off the ground.' },
            { id: '0-8', name: 'Left leg', fact: 'Its huge thigh bone let it reach speeds of 20\u201325 km/h.' },
            { id: '0-9', name: 'Right leg', fact: 'A three-toed foot spread its many-ton weight evenly on the ground.' },
            { id: '0-10', name: 'Tail', fact: 'The long, heavy tail balanced out its massive head while walking.' }
        ]
    },
    1: {
        name: 'Stegosaurus',
        description: 'Famous for the bony plates and spikes along its back and tail.',
        period: 'Late Jurassic (155\u2013150 million years ago)',
        length: '9 m',
        weight: '3 tons',
        bones: [
            { id: '1-1', name: 'Skull', fact: 'Its brain was about the size of a walnut \u2014 one of the smallest of any dinosaur!' },
            { id: '1-2', name: 'Neck vertebrae', fact: 'The neck was short, made up of 10 vertebrae.' },
            { id: '1-3', name: 'Back vertebrae', fact: 'The spine had special ridges that anchored the back plates.' },
            { id: '1-4', name: 'Bony plate', fact: 'The back plates may have changed color to attract mates or scare off enemies!' },
            { id: '1-5', name: 'Tail vertebrae', fact: 'Four sharp spikes were mounted on the tail \u2014 a fearsome weapon against predators.' },
            { id: '1-6', name: 'Tail spikes', fact: 'Each spike could grow 60\u201390 cm long!' },
            { id: '1-7', name: 'Pelvis', fact: 'A massive pelvis helped carry the weight of its heavy plates.' },
            { id: '1-8', name: 'Left hind leg', fact: 'Its legs were short but powerful enough to support its huge body.' },
            { id: '1-9', name: 'Right hind leg', fact: 'Its thigh bone was up to 30 cm thick!' },
            { id: '1-10', name: 'Armored back', fact: 'The plates were laced with blood vessels for temperature control!' }
        ]
    },
    2: {
        name: 'Brachiosaurus',
        description: 'One of the tallest and heaviest dinosaurs, feeding on leaves high in the trees.',
        period: 'Late Jurassic (154\u2013153 million years ago)',
        length: '22 m',
        weight: '56 tons',
        bones: [
            { id: '2-1', name: 'Skull', fact: 'Its nostrils sat on top of its head, much like modern whales!' },
            { id: '2-2', name: 'Neck', fact: 'Its neck was 9 meters long \u2014 like a three-story building! It had 15\u201317 vertebrae.' },
            { id: '2-3', name: 'Spine', fact: 'The vertebrae were hollow with air sacs, just like in birds, to cut down on weight.' },
            { id: '2-4', name: 'Lungs', fact: 'Its lungs were about the size of a small car!' },
            { id: '2-5', name: 'Forelimbs', fact: 'Its front legs were longer than its hind legs, tilting its back forward.' },
            { id: '2-6', name: 'Hind limbs', fact: 'Its 2-meter-long thigh bone is the longest bone ever found!' },
            { id: '2-7', name: 'Pelvis', fact: 'The pelvic girdle was incredibly strong to bear its enormous weight.' },
            { id: '2-8', name: 'Ribs', fact: 'Its ribs formed a cage 3 meters long, protecting its organs.' },
            { id: '2-9', name: 'Tail', fact: 'The tail was relatively short and balanced out its very long neck.' },
            { id: '2-10', name: 'Shoulder girdle', fact: 'Powerful shoulder bones anchored its massive front legs to its body.' }
        ]
    },
    3: {
        name: 'Velociraptor',
        description: 'A fast, intelligent predator made famous by the movie "Jurassic Park".',
        period: 'Late Cretaceous (75\u201371 million years ago)',
        length: '2 m',
        weight: '15 kg',
        bones: [
            { id: '3-1', name: 'Skull', fact: 'Its skull was about 25 cm long and held 80 sharp teeth!' },
            { id: '3-2', name: 'Eye sockets', fact: 'Its eyes faced forward, giving it binocular vision for hunting.' },
            { id: '3-3', name: 'Neck vertebrae', fact: 'The neck was flexible and S-shaped, just like in birds.' },
            { id: '3-4', name: 'Forearms', fact: 'Three sharp claws on each hand made excellent grasping tools!' },
            { id: '3-5', name: 'Rib cage', fact: 'Like a bird, it had a keel bone anchoring powerful flight-related muscles.' },
            { id: '3-6', name: 'Spine', fact: 'A flexible spine allowed for quick turns while hunting.' },
            { id: '3-7', name: 'Pelvis', fact: 'Its pelvis was lightweight, like a bird\u2019s \u2014 great for covering long distances.' },
            { id: '3-8', name: 'Hind legs', fact: 'Long legs let it reach speeds of up to 60 km/h!' },
            { id: '3-9', name: 'Sickle claw', fact: 'Its famous 6.5 cm curved claw on the hind foot was used to deliver deadly strikes!' },
            { id: '3-10', name: 'Tail', fact: 'A long tail acted as a counterbalance during sharp turns and running.' }
        ]
    },
    4: {
        name: 'Triceratops',
        description: 'A plant-eating dinosaur with three horns and a large bony frill.',
        period: 'Late Cretaceous (68\u201366 million years ago)',
        length: '9 m',
        weight: '6 tons',
        bones: [
            { id: '4-1', name: 'Frilled skull', fact: 'Its skull reached 2 meters long \u2014 almost a third of its whole body length!' },
            { id: '4-2', name: 'Nose horn', fact: 'A nose horn about 30 cm long protected its snout from predators.' },
            { id: '4-3', name: 'Brow horns', fact: 'Two horns above the eyes grew up to 1 meter \u2014 a fearsome weapon!' },
            { id: '4-4', name: 'Bony frill', fact: 'The frill protected the neck and may have flashed bright colors to attract mates!' },
            { id: '4-5', name: 'Neck vertebrae', fact: 'Its neck was short and muscular to support the weight of its huge frill.' },
            { id: '4-6', name: 'Spine', fact: 'A sturdy spine supported the heavy, frilled head.' },
            { id: '4-7', name: 'Front legs', fact: 'Its front legs were shorter than its hind legs, much like a rhino.' },
            { id: '4-8', name: 'Hind legs', fact: 'Powerful hind legs let it run quickly away from predators!' },
            { id: '4-9', name: 'Pelvis', fact: 'A massive pelvis anchored its powerful legs to its body.' },
            { id: '4-10', name: 'Skull framework', fact: 'The frill was full of blood vessels and could change color with blood flow!' }
        ]
    },
    5: {
        name: 'Pterodactylus',
        description: 'A flying reptile \u2014 one of the first pterosaurs ever discovered.',
        period: 'Late Jurassic (150\u2013148 million years ago)',
        length: '1 m (1.5 m wingspan)',
        weight: '2.5 kg',
        bones: [
            { id: '5-1', name: 'Skull', fact: 'A skull with a long beak and sharp teeth \u2014 perfect for catching fish!' },
            { id: '5-2', name: 'Eye sockets', fact: 'Large eyes suggest excellent vision \u2014 important for hunting in the air.' },
            { id: '5-3', name: 'Neck vertebrae', fact: 'A flexible S-shaped neck allowed it to maneuver during flight.' },
            { id: '5-4', name: 'Wing bone', fact: 'The main wing bone \u2014 the humerus \u2014 was hollow to reduce weight.' },
            { id: '5-5', name: 'Wing finger', fact: 'Its fourth finger was incredibly long and supported the wing membrane!' },
            { id: '5-6', name: 'Wing membrane', fact: 'The skin membrane between body and wings could stretch up to 25 cm!' },
            { id: '5-7', name: 'Breastbone', fact: 'A keel on the breastbone anchored powerful muscles for flapping flight.' },
            { id: '5-8', name: 'Spine', fact: 'A lightweight spine with air sacs \u2014 just like in birds!' },
            { id: '5-9', name: 'Pelvis', fact: 'Its pelvis was small \u2014 its whole body was built for flying.' },
            { id: '5-10', name: 'Hind limbs', fact: 'Short legs still helped during takeoff and landing.' }
        ]
    }
};

/**
 * Переключить язык текстов динозавров (мутирует DINO_DATA на месте).
 * @param {'ru'|'en'} lang
 */
export function setDinoLanguage(lang) {
    const table = lang === 'en' ? DINO_TEXT_EN : DINO_TEXT_RU;
    Object.keys(DINO_DATA).forEach(id => {
        const src = table[id];
        if (!src) return;
        const target = DINO_DATA[id];
        target.name = src.name;
        target.description = src.description;
        target.period = src.period;
        target.length = src.length;
        target.weight = src.weight;
        target.bones.forEach((bone, i) => {
            const srcBone = src.bones[i];
            if (srcBone) {
                bone.name = srcBone.name;
                bone.fact = srcBone.fact;
            }
        });
    });
}

// Получить все ID костей для определённого динозавра
export function getDinoBoneIds(dinoId) {
    const dino = DINO_DATA[dinoId];
    return dino ? dino.bones.map(b => b.id) : [];
}

// Получить кость по ID
export function getBoneById(boneId) {
    for (const dinoId in DINO_DATA) {
        const bone = DINO_DATA[dinoId].bones.find(b => b.id === boneId);
        if (bone) return { ...bone, dinoId: parseInt(dinoId) };
    }
    return null;
}

// Общее количество костей
export const TOTAL_BONES = Object.values(DINO_DATA).reduce((sum, dino) => sum + dino.bones.length, 0);

// MUSEUM_DATA для совместимости со старым кодом
export const MUSEUM_DATA = {
    dinoName: 'Тираннозавр Рекс (T-Rex)',
    totalBones: DINO_DATA[0].bones.length,
    bones: DINO_DATA[0].bones
};
