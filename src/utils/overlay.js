export function openOverlay(el) {
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(() => el.classList.add('open'));
}

export function closeOverlay(el, delay = 220) {
    if (!el) return;
    el.classList.remove('open');
    setTimeout(() => el.classList.add('hidden'), delay);
}
