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

export const ASSETS = {

    bonusSprites: {
        LINE_H: 'assets/bonus/line_h.png',
        LINE_V: 'assets/bonus/line_v.png',
        BOMB: 'assets/bonus/bomb.png',
        COLOR_BOMB: 'assets/bonus/color_bomb.png'
    },

    fossilTileSprite: 'assets/bones/fossil.png',

    tileSprite: (colorKey) => `assets/tiles/${colorKey}.png`,

    boneIcon: (boneId) => `assets/bones/${boneId}.png`,

    dinoSkeleton: (dinoId) => `assets/dinos/${dinoId}-skeleton.png`,
    dinoAlive: (dinoId) => `assets/dinos/${dinoId}-alive.png`,

    uiIcons: {
        pause: 'assets/ui/pause.png',
        settings: 'assets/ui/settings.png',
        map: 'assets/ui/map.png',
        museum: 'assets/ui/museum.png',
        resume: 'assets/ui/resume.png',
        restart: 'assets/ui/restart.png',
        giveUp: 'assets/ui/give_up.png',
        confirm: 'assets/ui/confirm.png',
        confirmOk: 'assets/ui/confirm_ok.png',
        confirmCancel: 'assets/ui/confirm_cancel.png',
        modalNext: 'assets/ui/modal_next.png',
        modalRetry: 'assets/ui/modal_retry.png',
        modalMuseum: 'assets/ui/modal_museum.png',
        modalHome: 'assets/ui/modal_home.png',
        addMoves: 'assets/ui/add_moves.png',
        addTools: 'assets/ui/add_tools.png',
        watchAd: 'assets/ui/watch_ad.png'
    },

    levelTypeIcon: (type) => `assets/ui/level_type_${type}.png`,

    background: 'assets/ui/background.jpg'
};

const BONE_NAME_TEMPLATE = {
    ru: ['Череп', 'Глазницы', 'Шейные позвонки', 'Передние лапы', 'Грудная клетка', 'Позвоночник', 'Таз', 'Задние лапы', 'Коготь', 'Хвост'],
    en: ['Skull', 'Eye sockets', 'Neck vertebrae', 'Forelimbs', 'Rib cage', 'Spine', 'Pelvis', 'Hind legs', 'Claw', 'Tail']
};
const BONE_ICON_TEMPLATE = ['💀', '👁️', '🦴', '🦾', '🫁', '🦴', '🦴', '🦵', '⚔️', '🐊'];

function buildBones(dinoId, facts) {
    return facts.map((fact, i) => ({
        id: `${dinoId}-${i + 1}`,
        name: BONE_NAME_TEMPLATE.ru[i],
        icon: BONE_ICON_TEMPLATE[i],
        fact
    }));
}

export const DINO_DATA = {

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
        bones: buildBones(0, [
            'Сила укуса T-Rex достигала 6 тонн — он мог с легкостью раздавить автомобиль!',
            'Шея тираннозавра была короткой и мускулистой, чтобы удерживать тяжелую голову.',
            'Ребра защищали жизненно важные органы и поддерживали гигантскую массу тела.',
            'Передние лапы были длиной всего около 1 метра, но могли поднимать вес до 200 кг!',
            'Позвоночник состоял из прочных позвонков с воздушными камерами для снижения веса.',
            'Двупалые лапы использовались для удержания добычи или подъема с земли.',
            'Широкий таз служил креплением для мощных мышц задних лап.',
            'Бедренная кость была огромной, позволяя развивать скорость до 20-25 км/ч.',
            'Стопа с тремя опорными пальцами отлично распределяла многотонный вес.',
            'Длинный и тяжелый хвост служил противовесом для массивной головы при ходьбе.'
        ])
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
        bones: buildBones(1, [
            'Мозг стегозавра был размером с грецкий орех — один из самых маленьких среди динозавров!',
            'Шея была короткой и состояла из 10 позвонков.',
            'Кости позвоночника имели специальные выросты для крепления пластин.',
            'Пластины на спине могли менять цвет для привлечения партнёров или отпугивания врагов!',
            'К хвосту крепились 4 острых шипа — грозное оружие против хищников.',
            'Каждый шип достигал 60-90 см в длину!',
            'Массивный таз помогал выдерживать вес тяжёлых пластин.',
            'Ноги были короткими, но мощными для поддержания огромного тела.',
            'Толщина бедренной кости достигала 30 см!',
            'Пластины были пронизаны кровеносными сосудами для терморегуляции!'
        ])
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
        bones: buildBones(2, [
            'Ноздри брахиозавра располагались на вершине головы, как у современных китов!',
            'Шея достигала 9 метров — как трехэтажный дом! Она состояла из 15-17 позвонков.',
            'Позвонки были полыми с воздушными мешками, как у птиц — для снижения веса.',
            'Передние ноги были длиннее задних, из-за чего спина наклонялась вперёд.',
            'Рёбра образовывали клетку длиной 3 метра для защиты органов.',
            'Бедренная кость длиной 2 метра — самая длинная из всех известных костей!',
            'Тазовый пояс был невероятно мощным, чтобы выдерживать огромный вес.',
            'Лёгкие брахиозавра были размером с небольшой автомобиль!',
            'Мощные плечевые кости крепили массивные передние ноги к телу.',
            'Хвост был относительно коротким и служил противовесом длинной шее.'
        ])
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
        bones: buildBones(3, [
            'Череп был длиной около 25 см с 80 острыми зубами!',
            'Глаза были направлены вперёд, обеспечивая бинокулярное зрение для охоты.',
            'Шея была гибкой и S-образной, как у птиц.',
            'Три пальца с острыми когтями на каждой руке — отличные хватательные органы!',
            'Как у птиц, имела киль для крепления мощных летательных мышц.',
            'Гибкий хребет позволял совершать быстрые манёвры при охоте.',
            'Таз был лёгким, как у птиц — облегчал передвижение на большие расстояния.',
            'Длинные ноги позволяли развивать скорость до 60 км/ч!',
            'Знаменитый 6.5-сантиметровый коготь на задней ноге использовался для нанесения смертельных ран!',
            'Длинный хвост служил балансиром при беге и резких поворотах.'
        ])
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
        bones: buildBones(4, [
            'Череп трицератопса достигал 2 метров — почти треть длины всего тела!',
            'Два рога над глазами достигали 1 метра и служили грозным оружием!',
            'Шея была мускулистой и короткой, чтобы выдерживать вес огромного воротника.',
            'Передние ноги были короче задних, как у носорога.',
            'Костный воротник защищал шею и служил для привлечения партнёров — мог быть ярким!',
            'Прочный позвоночник поддерживал тяжёлую голову с воротником.',
            'Массивный таз крепил мощные ноги к телу.',
            'Мощные задние ноги позволяли быстро бегать от хищников!',
            'Носовой рог длиной около 30 см защищал морду от хищников.',
            'Воротник был пронизан сосудами и мог менять цвет при кровообращении!'
        ])
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
        bones: buildBones(5, [
            'Череп с длинным клювом и острыми зубами — идеален для ловли рыбы!',
            'Большие глаза указывают на отличное зрение — важно для охоты в воздухе.',
            'Гибкая S-образная шея позволяла маневрировать при полёте.',
            'Основная кость крыла — плечевая — была полой для снижения веса.',
            'Киль на грудине крепил мощные мышцы для машущего полёта.',
            'Лёгкий позвоночник с воздушными мешками — как у птиц!',
            'Таз был маленьким — тело было адаптировано для полёта.',
            'Ноги были короткими, но помогали при взлёте и посадке.',
            'Четвёртый палец был невероятно длинным и поддерживал крыло!',
            'Кожаная перепонка между телом и крыльями могла быть до 25 см!'
        ])
    }
};

function snapshotDinoFacts(source) {
    const snap = {};
    Object.keys(source).forEach(id => {
        const d = source[id];
        snap[id] = {
            name: d.name,
            description: d.description,
            period: d.period,
            length: d.length,
            weight: d.weight,
            bones: d.bones.map(b => ({ id: b.id, fact: b.fact }))
        };
    });
    return snap;
}

const DINO_TEXT_RU = snapshotDinoFacts(DINO_DATA);

const DINO_TEXT_EN = {
    0: {
        name: 'Tyrannosaurus Rex',
        description: 'One of the largest land predators in Earth\u2019s history.',
        period: 'Late Cretaceous (68\u201366 million years ago)',
        length: '12 m',
        weight: '8 tons',
        bones: [
            { id: '0-1', fact: 'T-Rex\u2019s bite force reached 6 tons \u2014 strong enough to crush a car!' },
            { id: '0-2', fact: 'Its neck was short and muscular, built to support its heavy head.' },
            { id: '0-3', fact: 'The ribs protected vital organs and supported its huge body mass.' },
            { id: '0-4', fact: 'Its arms were only about 1 meter long, yet could lift up to 200 kg!' },
            { id: '0-5', fact: 'The spine was made of sturdy vertebrae with air pockets to save weight.' },
            { id: '0-6', fact: 'The two-fingered hands were used to grip prey or push off the ground.' },
            { id: '0-7', fact: 'The wide pelvis anchored the powerful muscles of its hind legs.' },
            { id: '0-8', fact: 'Its huge thigh bone let it reach speeds of 20\u201325 km/h.' },
            { id: '0-9', fact: 'A three-toed foot spread its many-ton weight evenly on the ground.' },
            { id: '0-10', fact: 'The long, heavy tail balanced out its massive head while walking.' }
        ]
    },
    1: {
        name: 'Stegosaurus',
        description: 'Famous for the bony plates and spikes along its back and tail.',
        period: 'Late Jurassic (155\u2013150 million years ago)',
        length: '9 m',
        weight: '3 tons',
        bones: [
            { id: '1-1', fact: 'Its brain was about the size of a walnut \u2014 one of the smallest of any dinosaur!' },
            { id: '1-2', fact: 'The neck was short, made up of 10 vertebrae.' },
            { id: '1-3', fact: 'The spine had special ridges that anchored the back plates.' },
            { id: '1-4', fact: 'The back plates may have changed color to attract mates or scare off enemies!' },
            { id: '1-5', fact: 'Four sharp spikes were mounted on the tail \u2014 a fearsome weapon against predators.' },
            { id: '1-6', fact: 'Each spike could grow 60\u201390 cm long!' },
            { id: '1-7', fact: 'A massive pelvis helped carry the weight of its heavy plates.' },
            { id: '1-8', fact: 'Its legs were short but powerful enough to support its huge body.' },
            { id: '1-9', fact: 'Its thigh bone was up to 30 cm thick!' },
            { id: '1-10', fact: 'The plates were laced with blood vessels for temperature control!' }
        ]
    },
    2: {
        name: 'Brachiosaurus',
        description: 'One of the tallest and heaviest dinosaurs, feeding on leaves high in the trees.',
        period: 'Late Jurassic (154\u2013153 million years ago)',
        length: '22 m',
        weight: '56 tons',
        bones: [
            { id: '2-1', fact: 'Its nostrils sat on top of its head, much like modern whales!' },
            { id: '2-2', fact: 'Its neck was 9 meters long \u2014 like a three-story building! It had 15\u201317 vertebrae.' },
            { id: '2-3', fact: 'The vertebrae were hollow with air sacs, just like in birds, to cut down on weight.' },
            { id: '2-4', fact: 'Its front legs were longer than its hind legs, tilting its back forward.' },
            { id: '2-5', fact: 'Its ribs formed a cage 3 meters long, protecting its organs.' },
            { id: '2-6', fact: 'Its 2-meter-long thigh bone is the longest bone ever found!' },
            { id: '2-7', fact: 'The pelvic girdle was incredibly strong to bear its enormous weight.' },
            { id: '2-8', fact: 'Its lungs were about the size of a small car!' },
            { id: '2-9', fact: 'Powerful shoulder bones anchored its massive front legs to its body.' },
            { id: '2-10', fact: 'The tail was relatively short and balanced out its very long neck.' }
        ]
    },
    3: {
        name: 'Velociraptor',
        description: 'A fast, intelligent predator made famous by the movie "Jurassic Park".',
        period: 'Late Cretaceous (75\u201371 million years ago)',
        length: '2 m',
        weight: '15 kg',
        bones: [
            { id: '3-1', fact: 'Its skull was about 25 cm long and held 80 sharp teeth!' },
            { id: '3-2', fact: 'Its eyes faced forward, giving it binocular vision for hunting.' },
            { id: '3-3', fact: 'The neck was flexible and S-shaped, just like in birds.' },
            { id: '3-4', fact: 'Three sharp claws on each hand made excellent grasping tools!' },
            { id: '3-5', fact: 'Like a bird, it had a keel bone anchoring powerful flight-related muscles.' },
            { id: '3-6', fact: 'A flexible spine allowed for quick turns while hunting.' },
            { id: '3-7', fact: 'Its pelvis was lightweight, like a bird\u2019s \u2014 great for covering long distances.' },
            { id: '3-8', fact: 'Long legs let it reach speeds of up to 60 km/h!' },
            { id: '3-9', fact: 'Its famous 6.5 cm curved claw on the hind foot was used to deliver deadly strikes!' },
            { id: '3-10', fact: 'A long tail acted as a counterbalance during sharp turns and running.' }
        ]
    },
    4: {
        name: 'Triceratops',
        description: 'A plant-eating dinosaur with three horns and a large bony frill.',
        period: 'Late Cretaceous (68\u201366 million years ago)',
        length: '9 m',
        weight: '6 tons',
        bones: [
            { id: '4-1', fact: 'Its skull reached 2 meters long \u2014 almost a third of its whole body length!' },
            { id: '4-2', fact: 'Two horns above the eyes grew up to 1 meter \u2014 a fearsome weapon!' },
            { id: '4-3', fact: 'Its neck was short and muscular to support the weight of its huge frill.' },
            { id: '4-4', fact: 'Its front legs were shorter than its hind legs, much like a rhino.' },
            { id: '4-5', fact: 'The frill protected the neck and may have flashed bright colors to attract mates!' },
            { id: '4-6', fact: 'A sturdy spine supported the heavy, frilled head.' },
            { id: '4-7', fact: 'A massive pelvis anchored its powerful legs to its body.' },
            { id: '4-8', fact: 'Powerful hind legs let it run quickly away from predators!' },
            { id: '4-9', fact: 'A nose horn about 30 cm long protected its snout from predators.' },
            { id: '4-10', fact: 'The frill was full of blood vessels and could change color with blood flow!' }
        ]
    },
    5: {
        name: 'Pterodactylus',
        description: 'A flying reptile \u2014 one of the first pterosaurs ever discovered.',
        period: 'Late Jurassic (150\u2013148 million years ago)',
        length: '1 m (1.5 m wingspan)',
        weight: '2.5 kg',
        bones: [
            { id: '5-1', fact: 'A skull with a long beak and sharp teeth \u2014 perfect for catching fish!' },
            { id: '5-2', fact: 'Large eyes suggest excellent vision \u2014 important for hunting in the air.' },
            { id: '5-3', fact: 'A flexible S-shaped neck allowed it to maneuver during flight.' },
            { id: '5-4', fact: 'The main wing bone \u2014 the humerus \u2014 was hollow to reduce weight.' },
            { id: '5-5', fact: 'A keel on the breastbone anchored powerful muscles for flapping flight.' },
            { id: '5-6', fact: 'A lightweight spine with air sacs \u2014 just like in birds!' },
            { id: '5-7', fact: 'Its pelvis was small \u2014 its whole body was built for flying.' },
            { id: '5-8', fact: 'Short legs still helped during takeoff and landing.' },
            { id: '5-9', fact: 'Its fourth finger was incredibly long and supported the wing membrane!' },
            { id: '5-10', fact: 'The skin membrane between body and wings could stretch up to 25 cm!' }
        ]
    }
};

export function setDinoLanguage(lang) {
    const table = lang === 'en' ? DINO_TEXT_EN : DINO_TEXT_RU;
    const names = BONE_NAME_TEMPLATE[lang] || BONE_NAME_TEMPLATE.ru;
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
            if (srcBone) bone.fact = srcBone.fact;
            bone.name = names[i];
        });
    });
}

export function getDinoBoneIds(dinoId) {
    const dino = DINO_DATA[dinoId];
    return dino ? dino.bones.map(b => b.id) : [];
}

export function getBoneById(boneId) {
    for (const dinoId in DINO_DATA) {
        const bone = DINO_DATA[dinoId].bones.find(b => b.id === boneId);
        if (bone) return { ...bone, dinoId: parseInt(dinoId) };
    }
    return null;
}

export const TOTAL_BONES = Object.values(DINO_DATA).reduce((sum, dino) => sum + dino.bones.length, 0);

export const MUSEUM_DATA = {
    dinoName: 'Тираннозавр Рекс (T-Rex)',
    totalBones: DINO_DATA[0].bones.length,
    bones: DINO_DATA[0].bones
};
