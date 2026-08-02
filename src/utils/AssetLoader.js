// Простой загрузчик картинок с кэшем и fallback на эмодзи, если файл не найден.
// Достаточно положить свою картинку по нужному пути (см. config.js -> ASSETS),
// и она подхватится автоматически. Если файла нет — рисуется эмодзи, как раньше.

const cache = new Map();

/**
 * Инициирует загрузку картинки (если ещё не загружалась) и возвращает запись из кэша.
 */
export function loadImage(path) {
    if (!path) return null;
    if (cache.has(path)) return cache.get(path);

    const entry = { img: new Image(), loaded: false, failed: false };
    entry.img.onload = () => { entry.loaded = true; };
    entry.img.onerror = () => { entry.failed = true; };
    entry.img.src = path;
    cache.set(path, entry);
    return entry;
}

/**
 * Возвращает готовый к отрисовке Image, если он успешно загрузился, иначе null
 * (значит нужно рисовать эмодзи-заглушку).
 */
export function getReadyImage(path) {
    if (!path) return null;
    const entry = loadImage(path);
    if (entry && entry.loaded && !entry.failed) return entry.img;
    return null;
}

/**
 * Хелпер для DOM: создаёт <img>, которая при ошибке загрузки сама подменяется на эмодзи.
 */
export function createImgOrEmoji(path, emoji, className = '') {
    if (!path) {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = emoji;
        return span;
    }

    const img = document.createElement('img');
    img.className = className;
    img.src = path;
    img.alt = emoji;
    img.onerror = () => {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = emoji;
        img.replaceWith(span);
    };
    return img;
}
