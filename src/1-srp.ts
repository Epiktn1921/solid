/**
 * S — Single Responsibility Principle (принцип единственной ответственности)
 *
 * У класса должна быть только одна причина для изменения.
 * Пример: работа в портфолио (постер, логотип и т. д.).
 */

// ─────────────────────────────────────────────────────────────
// ❌ ПЛОХО: один класс делает всё сразу
// ─────────────────────────────────────────────────────────────
// Класс хранит данные о работе, сам рисует HTML-карточку
// и сам превращает себя в JSON для сохранения.
// Причин для изменения три:
//   1) поменялись поля работы (например, добавили год);
//   2) поменялся дизайн карточки на сайте;
//   3) поменялся формат хранения (JSON → база данных).
// Любая правка дизайна рискует сломать сохранение, и наоборот.
class BadWork {
    constructor(
        public title: string,
        public category: string,
        public image: string,
    ) {}

    // Ответственность №2 — отображение
    toHtml(): string {
        return `<figure class="work" data-cat="${this.category}"><img src="${this.image}"><strong>${this.title}</strong></figure>`;
    }

    // Ответственность №3 — хранение
    toJson(): string {
        return JSON.stringify({ title: this.title, category: this.category, image: this.image });
    }
}

// ─────────────────────────────────────────────────────────────
// ✅ ХОРОШО: у каждого класса одна задача
// ─────────────────────────────────────────────────────────────

// 1. Только данные о работе и проверка, что они корректны.
//    Меняется, только если меняется само понятие «работа».
export class Work {
    constructor(
        public readonly title: string,
        public readonly category: string,
        public readonly image: string,
    ) {
        if (!title.trim()) throw new Error("У работы должно быть название");
    }
}

// 2. Только отображение. Меняется, когда меняется дизайн сайта.
export class WorkCardRenderer {
    render(work: Work): string {
        return `<figure class="work" data-cat="${work.category}">` +
            `<img src="${work.image}" alt="${work.title}" loading="lazy">` +
            `<figcaption><strong>${work.title}</strong></figcaption></figure>`;
    }
}

// 3. Только хранение списка работ. Меняется, когда меняется способ хранения.
//    Сейчас — JSON-строка; завтра можно заменить на файл или базу,
//    и ни Work, ни WorkCardRenderer это не заденет.
export class WorkJsonStorage {
    save(works: Work[]): string {
        return JSON.stringify(works);
    }
    load(json: string): Work[] {
        const raw: { title: string; category: string; image: string }[] = JSON.parse(json);
        return raw.map(w => new Work(w.title, w.category, w.image));
    }
}

// ─────────────────────────────────────────────────────────────
// Демонстрация
// ─────────────────────────────────────────────────────────────
export function run(): void {
    const bad = new BadWork("Think Less", "poster", "think-less.jpg");
    console.log("Плохо — всё в одном классе:");
    console.log("  " + bad.toHtml());

    const works = [
        new Work("Think Less", "poster", "think-less.jpg"),
        new Work("EPIK", "logo", "epik.jpg"),
    ];
    const renderer = new WorkCardRenderer();
    const storage = new WorkJsonStorage();

    console.log("Хорошо — каждый класс отвечает за своё:");
    works.forEach(w => console.log("  " + renderer.render(w)));

    // Сохраняем и загружаем обратно — отображение при этом не трогаем
    const json = storage.save(works);
    console.log("  сохранено:", json);
    console.log("  загружено работ:", storage.load(json).length);
}
