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
        0: { main: '#e74c3c', light: '#ff7675', dark: '#c0392b' },
        1: { main: '#3498db', light: '#74b9ff', dark: '#2980b9' },
        2: { main: '#2ecc71', light: '#55efc4', dark: '#27ae60' },
        3: { main: '#f1c40f', light: '#ffeaa7', dark: '#f39c12' },
        4: { main: '#9b59b6', light: '#a29bfe', dark: '#8e44ad' }
    }
};

CONFIG.CANVAS_WIDTH = CONFIG.COLS * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) + CONFIG.OFFSET_X * 2;
CONFIG.CANVAS_HEIGHT = CONFIG.ROWS * (CONFIG.TILE_SIZE + CONFIG.TILE_GAP) + CONFIG.OFFSET_Y * 2;

export const CANVAS_WIDTH = CONFIG.CANVAS_WIDTH;
export const CANVAS_HEIGHT = CONFIG.CANVAS_HEIGHT;

export const COLOR_KEYS = Object.keys(CONFIG.COLORS);

export const MUSEUM_DATA = {
    dinoName: 'Тираннозавр Рекс (T-Rex)',
    totalBones: 10,
    bones: [
        { id: 1, name: 'Череп', icon: '💀', fact: 'Сила укуса T-Rex достигала 6 тонн — он мог с легкостью раздавить автомобиль!' },
        { id: 2, name: 'Шейный позвонок', icon: '🦴', fact: 'Шея тираннозавра была короткой и мускулистой, чтобы удерживать тяжелую голову.' },
        { id: 3, name: 'Грудная клетка', icon: '🫁', fact: 'Ребра защищали жизненно важные органы и поддерживали гигантскую массу тела.' },
        { id: 4, name: 'Позвоночник', icon: '🦴', fact: 'Позвоночник состоял из прочных позвонков с воздушными камерами для снижения веса.' },
        { id: 5, name: 'Тазовые кости', icon: '🦴', fact: 'Широкий таз служил креплением для мощных мышц задних лап.' },
        { id: 6, name: 'Левая передняя лапа', icon: '🦾', fact: 'Передние лапы были длиной всего около 1 метра, но могли поднимать вес до 200 кг!' },
        { id: 7, name: 'Правая передняя лапа', icon: '🦾', fact: 'Двупалые лапы использовались для удержания добычи или подъема с земли.' },
        { id: 8, name: 'Левая задняя лапа', icon: '🦵', fact: 'Бедренная кость была огромной, позволяя развивать скорость до 20-25 км/ч.' },
        { id: 9, name: 'Правая задняя лапа', icon: '🦵', fact: 'Стопа с тремя опорными пальцами отлично распределяла многотонный вес.' },
        { id: 10, name: 'Хвост', icon: '🐊', fact: 'Длинный и тяжелый хвост служил противовесом для массивной головы при ходьбе.' }
    ]
};