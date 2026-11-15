/**
 * D — Dependency Inversion Principle (принцип инверсии зависимостей)
 *
 * Модули верхнего уровня не должны зависеть от модулей нижнего уровня —
 * оба должны зависеть от абстракций.
 * Пример: кнопка «Скопировать почту» в контактах сайта.
 */

// ─────────────────────────────────────────────────────────────
//  ПЛОХО: кнопка сама создаёт конкретные инструменты
// ─────────────────────────────────────────────────────────────
// «Низкий уровень» — конкретная реализация буфера обмена браузера.
class BrowserClipboard {
    write(text: string): boolean {
        // В браузере здесь был бы navigator.clipboard.writeText(text).
        // В Node.js браузера нет — поэтому реализация «падает».
        if (typeof (globalThis as { navigator?: { clipboard?: unknown } }).navigator?.clipboard === "undefined") {
            throw new Error("navigator.clipboard недоступен");
        }
        return true;
    }
}

// «Высокий уровень» — кнопка. Она жёстко привязана к BrowserClipboard
// и к console.log: заменить их нельзя, проверить кнопку без браузера — тоже.
class BadCopyButton {
    private clipboard = new BrowserClipboard(); // ← жёсткая зависимость
    constructor(private email: string) {}
    click(): void {
        this.clipboard.write(this.email);
        console.log("Почта скопирована");
    }
}

// ─────────────────────────────────────────────────────────────
// ХОРОШО: кнопка зависит от абстракций, а реализации ей передают снаружи
// ─────────────────────────────────────────────────────────────

// Абстракции, которые нужны кнопке
export interface Clipboard {
    write(text: string): boolean; // true — получилось, false — нет
}
export interface Notifier {
    say(message: string): void; // на сайте это всплывающее сообщение (toast)
}

// Высокий уровень: логика кнопки. Не знает, ГДЕ она работает.
export class CopyEmailButton {
    // Зависимости передаются через конструктор (внедрение зависимостей)
    constructor(
        private readonly email: string,
        private readonly clipboard: Clipboard,
        private readonly notifier: Notifier,
    ) {}

    click(): void {
        if (this.clipboard.write(this.email)) {
            this.notifier.say("Почта скопирована");
        } else {
            this.notifier.say("Почта выделена, нажми Ctrl+C");
        }
    }
}

// Низкий уровень: конкретные реализации абстракций.

// Для браузера (на сайте). В Node.js не используется, показана для примера.
export class NavigatorClipboard implements Clipboard {
    write(text: string): boolean {
        const nav = (globalThis as { navigator?: { clipboard?: { writeText(t: string): Promise<void> } } }).navigator;
        if (!nav?.clipboard) return false;
        void nav.clipboard.writeText(text);
        return true;
    }
}

// Для тестов: запоминает, что в неё записали.
export class FakeClipboard implements Clipboard {
    public content = "";
    constructor(private readonly works: boolean) {}
    write(text: string): boolean {
        if (!this.works) return false;
        this.content = text;
        return true;
    }
}

// Уведомление в консоль (вместо всплывающего сообщения на сайте)
export class ConsoleNotifier implements Notifier {
    say(message: string): void {
        console.log("  [toast]", message);
    }
}

// Уведомление для тестов: собирает сообщения в массив
export class CollectingNotifier implements Notifier {
    public messages: string[] = [];
    say(message: string): void {
        this.messages.push(message);
    }
}

// ─────────────────────────────────────────────────────────────
// Демонстрация
// ─────────────────────────────────────────────────────────────
export function run(): void {
    console.log("Плохо — кнопку нельзя запустить без браузера:");
    try {
        new BadCopyButton("mail@example.com").click();
    } catch (e) {
        console.log("  ОШИБКА:", (e as Error).message);
    }

    console.log("Хорошо — подставляем нужные реализации:");
    const notifier = new ConsoleNotifier();
    new CopyEmailButton("mail@example.com", new FakeClipboard(true), notifier).click();
    new CopyEmailButton("mail@example.com", new FakeClipboard(false), notifier).click();

    // Простой тест кнопки без браузера
    const clipboard = new FakeClipboard(true);
    const collected = new CollectingNotifier();
    new CopyEmailButton("mail@example.com", clipboard, collected).click();
    const ok = clipboard.content === "mail@example.com" && collected.messages[0] === "Почта скопирована";
    console.log("  тест кнопки:", ok ? "пройден ✔" : "не пройден ✘");
}
