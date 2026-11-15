/**
 * L — Liskov Substitution Principle (принцип подстановки Барбары Лисков)
 *
 * Объект наследника должен работать везде, где ожидается объект родителя,
 * и при этом программа не должна ломаться или вести себя неожиданно.
 * Пример: просмотрщик работ (lightbox), который открывает работы по очереди.
 */

// ─────────────────────────────────────────────────────────────
// ❌ ПЛОХО: наследник нарушает обещание родителя
// ─────────────────────────────────────────────────────────────
// Родитель обещает: «у любой работы можно получить картинку для просмотрщика».
class BadWorkItem {
    constructor(public title: string, protected image: string) {}
    getImage(): string {
        return this.image;
    }
}

// Рилс — тоже работа, но картинки для просмотрщика у него нет
// (видео лежит в Telegram). Наследник бросает ошибку там,
// где родитель всегда возвращал результат. Это нарушение LSP:
// подставили рилс вместо обычной работы — и просмотрщик упал.
class BadReel extends BadWorkItem {
    constructor(title: string, private link: string) {
        super(title, "");
    }
    getImage(): string {
        throw new Error(`У рилса «${this.title}» нет картинки, он в Telegram`);
    }
}

function badLightbox(items: BadWorkItem[]): void {
    items.forEach(i => console.log("  показываю", i.getImage()));
}

// ─────────────────────────────────────────────────────────────
// ✅ ХОРОШО: контракт, который выполняют все наследники
// ─────────────────────────────────────────────────────────────
// Родитель обещает не «картинку», а «способ открыть работу».
// Результат описан типом: либо показать картинку, либо открыть ссылку.
export type OpenAction =
    | { kind: "image"; src: string }
    | { kind: "link"; url: string };

export abstract class PortfolioItem {
    constructor(public readonly title: string) {}
    // Контракт: метод ВСЕГДА возвращает OpenAction и никогда не бросает ошибку.
    abstract open(): OpenAction;
}

export class Poster extends PortfolioItem {
    constructor(title: string, private readonly image: string) {
        super(title);
    }
    open(): OpenAction {
        return { kind: "image", src: this.image };
    }
}

export class Reel extends PortfolioItem {
    constructor(title: string, private readonly link: string) {
        super(title);
    }
    // Рилс выполняет тот же контракт, просто возвращает ссылку.
    open(): OpenAction {
        return { kind: "link", url: this.link };
    }
}

// Просмотрщику всё равно, какой именно наследник пришёл:
// любой PortfolioItem можно подставить, и всё работает.
export function lightbox(items: PortfolioItem[]): string[] {
    return items.map(item => {
        const action = item.open();
        return action.kind === "image"
            ? `показываю картинку ${action.src} — «${item.title}»`
            : `открываю ${action.url} в новой вкладке — «${item.title}»`;
    });
}

// ─────────────────────────────────────────────────────────────
// Демонстрация
// ─────────────────────────────────────────────────────────────
export function run(): void {
    console.log("Плохо — наследник ломает просмотрщик:");
    try {
        badLightbox([new BadWorkItem("Think Less", "think-less.jpg"), new BadReel("Кутята", "t.me/confogon/632")]);
    } catch (e) {
        console.log("  ОШИБКА:", (e as Error).message);
    }

    console.log("Хорошо — любой наследник можно подставить:");
    lightbox([
        new Poster("Think Less", "think-less.jpg"),
        new Reel("Кутята", "https://t.me/confogon/632"),
        new Poster("Go Way", "go-way.jpg"),
    ]).forEach(line => console.log("  " + line));
}
