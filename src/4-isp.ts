/**
 * I — Interface Segregation Principle (принцип разделения интерфейсов)
 *
 * Класс не должен зависеть от методов, которые ему не нужны.
 * Лучше несколько маленьких интерфейсов, чем один большой «на всё».
 * Пример: в портфолио есть слайды презентации, постеры и рилсы.
 */

// ─────────────────────────────────────────────────────────────
//  ПЛОХО: один толстый интерфейс
// ─────────────────────────────────────────────────────────────
// Каждый элемент портфолио обязан уметь всё: показываться,
// фильтроваться по категории, воспроизводиться и скачиваться.
interface BadPortfolioEntry {
    preview(): string;
    category(): string;
    play(): string;
    download(): string;
}

// Слайду не нужны ни category(), ни play(), ни download(),
// но реализовать их приходится — с заглушками и ошибками.
class BadSlide implements BadPortfolioEntry {
    constructor(private n: number) {}
    preview(): string {
        return `слайд ${this.n}`;
    }
    category(): string {
        return ""; // заглушка: слайды не участвуют в фильтре
    }
    play(): string {
        throw new Error("Слайд нельзя воспроизвести"); // заглушка с ошибкой
    }
    download(): string {
        throw new Error("Слайд нельзя скачать"); // ещё одна заглушка
    }
}

// ─────────────────────────────────────────────────────────────
// ХОРОШО: маленькие интерфейсы под конкретные возможности
// ─────────────────────────────────────────────────────────────
export interface Viewable {
    preview(): string; // можно показать в просмотрщике
}
export interface Filterable {
    readonly category: string; // участвует в фильтре галереи
}
export interface Playable {
    play(): string; // можно воспроизвести
}

// Каждый класс реализует только то, что умеет на самом деле.
export class Slide implements Viewable {
    constructor(private readonly n: number, private readonly caption: string) {}
    preview(): string {
        return `слайд ${this.n}: ${this.caption}`;
    }
}

export class PosterWork implements Viewable, Filterable {
    readonly category = "Постеры";
    constructor(private readonly title: string) {}
    preview(): string {
        return `постер «${this.title}»`;
    }
}

export class ReelWork implements Filterable, Playable {
    readonly category = "Монтаж";
    constructor(private readonly title: string) {}
    play(): string {
        return `воспроизвожу «${this.title}»`;
    }
}

// Каждая часть сайта просит только тот интерфейс, который ей нужен.
export function showInLightbox(items: Viewable[]): string[] {
    return items.map(i => i.preview());
}
export function countByCategory(items: Filterable[]): Record<string, number> {
    const result: Record<string, number> = {};
    items.forEach(i => (result[i.category] = (result[i.category] ?? 0) + 1));
    return result;
}

// ─────────────────────────────────────────────────────────────
// Демонстрация
// ─────────────────────────────────────────────────────────────
export function run(): void {
    console.log("Плохо — слайд вынужден реализовать лишние методы:");
    const badSlide = new BadSlide(1);
    console.log("  " + badSlide.preview());
    try {
        badSlide.play();
    } catch (e) {
        console.log("  ОШИБКА:", (e as Error).message);
    }

    console.log("Хорошо — у каждого класса только нужные интерфейсы:");
    const slide = new Slide(1, "Кто владеет результатом?");
    const poster = new PosterWork("Think Less");
    const reel = new ReelWork("Кутята");

    console.log("  просмотрщик:", showInLightbox([slide, poster]).join(" | "));
    console.log("  фильтр:", JSON.stringify(countByCategory([poster, reel])));
    console.log("  " + reel.play());
}
