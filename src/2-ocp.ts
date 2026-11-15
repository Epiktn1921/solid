/**
 * O — Open/Closed Principle (принцип открытости/закрытости)
 *
 * Код должен быть открыт для расширения, но закрыт для изменения:
 * новую возможность добавляем новым кодом, а не правкой старого.
 * Пример: ссылки на контакты в подвале сайта (Telegram, почта, Instagram).
 */

// ─────────────────────────────────────────────────────────────
// ❌ ПЛОХО: всё через switch
// ─────────────────────────────────────────────────────────────
// Чтобы добавить новый способ связи (например, VK),
// придётся лезть внутрь этой функции и дописывать ещё один case.
// Каждая такая правка может сломать то, что уже работало.
function badContactLink(type: string, value: string): string {
    switch (type) {
        case "telegram":
            return `<a href="https://t.me/${value}">Telegram</a>`;
        case "email":
            return `<a href="mailto:${value}">${value}</a>`;
        case "instagram":
            return `<a href="https://instagram.com/${value}">Instagram</a>`;
        default:
            throw new Error(`Неизвестный тип контакта: ${type}`);
    }
}

// ─────────────────────────────────────────────────────────────
// ✅ ХОРОШО: общий интерфейс + отдельный класс на каждый способ связи
// ─────────────────────────────────────────────────────────────

// Абстракция: любой способ связи умеет превратиться в ссылку.
export interface ContactChannel {
    readonly label: string;
    href(): string;
}

export class TelegramChannel implements ContactChannel {
    readonly label = "Telegram";
    constructor(private readonly username: string) {}
    href(): string {
        return `https://t.me/${this.username}`;
    }
}

export class EmailChannel implements ContactChannel {
    constructor(private readonly address: string) {}
    get label(): string {
        return this.address;
    }
    href(): string {
        return `mailto:${this.address}`;
    }
}

export class InstagramChannel implements ContactChannel {
    readonly label = "Instagram";
    constructor(private readonly username: string) {}
    href(): string {
        return `https://instagram.com/${this.username}`;
    }
}

// Этот класс ЗАКРЫТ для изменений: он работает с любым ContactChannel
// и ничего не знает о конкретных соцсетях.
export class ContactsBlock {
    constructor(private readonly channels: ContactChannel[]) {}
    render(): string[] {
        return this.channels.map(c => `<a href="${c.href()}">${c.label}</a>`);
    }
}

// Расширение: добавили VK — написали НОВЫЙ класс,
// ни ContactsBlock, ни другие каналы не трогали.
export class VkChannel implements ContactChannel {
    readonly label = "VK";
    constructor(private readonly id: string) {}
    href(): string {
        return `https://vk.com/${this.id}`;
    }
}

// ─────────────────────────────────────────────────────────────
// Демонстрация
// ─────────────────────────────────────────────────────────────
export function run(): void {
    console.log("Плохо — switch:");
    console.log("  " + badContactLink("telegram", "TanyaEpik"));
    try {
        badContactLink("vk", "tanya");
    } catch (e) {
        console.log("  " + (e as Error).message + " → придётся править функцию");
    }

    console.log("Хорошо — новый канал добавлен отдельным классом:");
    const contacts = new ContactsBlock([
        new TelegramChannel("TanyaEpik"),
        new EmailChannel("mail@example.com"),
        new InstagramChannel("tanya.epova"),
        new VkChannel("tanya"), // ← расширение без изменения старого кода
    ]);
    contacts.render().forEach(link => console.log("  " + link));
}
