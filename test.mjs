const elements = {};
function makeEl(id) {
  return {
    id,
    value: "",
    textContent: "",
    classList: { add() {}, remove() {} },
    listeners: {},
    addEventListener(ev, fn) { this.listeners[ev] = fn; },
    appendChild(child) { if (child.selected) this.value = child.value; },
  };
}
for (const id of ["amount", "from", "to", "swap", "result", "rate", "meta"]) {
  elements[id] = makeEl(id);
}
elements.amount.value = "100";

globalThis.document = {
  getElementById: (id) => elements[id],
  createElement: () => ({ value: "", textContent: "", selected: false }),
};

const FRANKFURTER = {
  amount: 1,
  base: "USD",
  date: "2026-11-05",
  rates: { EUR: 0.8909, GBP: 0.7429, JPY: 157.8 },
};

let failFrankfurter = false;
globalThis.fetch = async (url) => {
  if (url.includes("frankfurter") && !failFrankfurter) {
    return { ok: true, json: async () => FRANKFURTER };
  }
  if (url.includes("er-api")) {
    return {
      ok: true,
      json: async () => ({
        result: "success",
        base_code: "USD",
        time_last_update_utc: "Fri, 06 Nov 2026 00:02:31 +0000",
        rates: { EUR: 0.89048, GBP: 0.742915, JPY: 157.835475 },
      }),
    };
  }
  return { ok: false, status: 500 };
};

await import("./app.js");
await new Promise((r) => setTimeout(r, 10));

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

assert(elements.from.value === "USD", "devise source par défaut = USD");
assert(elements.to.value === "EUR", "devise cible par défaut = EUR");
assert(elements.result.textContent.includes("89,09"), `100 USD -> 89,09 EUR (reçu: ${elements.result.textContent})`);
assert(elements.rate.textContent.includes("1 USD = 0,8909 EUR"), `taux affiché (reçu: ${elements.rate.textContent})`);
assert(elements.meta.textContent.includes("2026-11-05"), "date du taux affichée");

elements.amount.value = "50";
elements.from.value = "EUR";
elements.to.value = "JPY";
await elements.from.listeners.change();
await new Promise((r) => setTimeout(r, 10));
elements.from.value = "USD";
elements.to.value = "EUR";
await elements.swap.listeners.click();
await new Promise((r) => setTimeout(r, 10));
assert(elements.from.value === "EUR" && elements.to.value === "USD", "swap inverse les deux devises");

elements.from.value = "EUR";
elements.to.value = "EUR";
await elements.to.listeners.change();
await new Promise((r) => setTimeout(r, 10));
assert(elements.rate.textContent.includes("1 EUR = 1 EUR"), "même devise gérée sans appel réseau");

failFrankfurter = true;
elements.amount.value = "100";
elements.from.value = "USD";
elements.to.value = "GBP";
await elements.from.listeners.change();
await new Promise((r) => setTimeout(r, 10));
assert(elements.result.textContent.includes("74,29") || elements.result.textContent.includes("74,3"), `API de secours utilisée (reçu: ${elements.result.textContent})`);
assert(elements.meta.textContent.includes("secours"), "source de secours indiquée");

elements.amount.value = "abc";
await elements.amount.listeners.input();
await new Promise((r) => setTimeout(r, 10));
assert(elements.result.textContent.includes("montant valide"), "montant invalide signalé");
