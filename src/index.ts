/**
 * Точка входа: по очереди запускает примеры всех пяти принципов SOLID.
 * Запуск: npm install && npm start
 */
import * as srp from "./1-srp";
import * as ocp from "./2-ocp";
import * as lsp from "./3-lsp";
import * as isp from "./4-isp";
import * as dip from "./5-dip";

const examples: [string, () => void][] = [
    ["S — единственная ответственность", srp.run],
    ["O — открытость/закрытость", ocp.run],
    ["L — подстановка Лисков", lsp.run],
    ["I — разделение интерфейсов", isp.run],
    ["D — инверсия зависимостей", dip.run],
];

for (const [title, run] of examples) {
    console.log(`\n========== ${title} ==========`);
    run();
}
