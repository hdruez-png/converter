const CURRENCIES = {
  AUD: "Dollar australien",
  BRL: "Real brésilien",
  CAD: "Dollar canadien",
  CHF: "Franc suisse",
  CNY: "Yuan chinois",
  CZK: "Couronne tchèque",
  DKK: "Couronne danoise",
  EUR: "Euro",
  GBP: "Livre sterling",
  HKD: "Dollar de Hong Kong",
  HUF: "Forint hongrois",
  IDR: "Roupie indonésienne",
  ILS: "Shekel israélien",
  INR: "Roupie indienne",
  ISK: "Couronne islandaise",
  JPY: "Yen japonais",
  KRW: "Won sud-coréen",
  MXN: "Peso mexicain",
  MYR: "Ringgit malaisien",
  NOK: "Couronne norvégienne",
  NZD: "Dollar néo-zélandais",
  PHP: "Peso philippin",
  PLN: "Zloty polonais",
  RON: "Leu roumain",
  SEK: "Couronne suédoise",
  SGD: "Dollar de Singapour",
  THB: "Baht thaïlandais",
  TRY: "Livre turque",
  USD: "Dollar américain",
  ZAR: "Rand sud-africain",
};

const DEFAULT_FROM = "USD";
const DEFAULT_TO = "EUR";

const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const swapButton = document.getElementById("swap");
const resultEl = document.getElementById("result");
const rateEl = document.getElementById("rate");
const metaEl = document.getElementById("meta");

function fillSelect(select, selected) {
  for (const [code, name] of Object.entries(CURRENCIES)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} — ${name}`;
    if (code === selected) option.selected = true;
    select.appendChild(option);
  }
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);
}

function formatRate(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumSignificantDigits: 6,
  }).format(value);
}

async function fetchRates(from) {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { rates: data.rates, date: data.date, source: "Banque centrale européenne (via Frankfurter)" };
  } catch (err) {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.result !== "success") throw new Error("API de secours indisponible");
    return {
      rates: data.rates,
      date: data.time_last_update_utc,
      source: "ExchangeRate-API (API de secours)",
    };
  }
}

async function convert() {
  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (Number.isNaN(amount) || amount < 0) {
    resultEl.textContent = "Veuillez saisir un montant valide.";
    resultEl.classList.add("error");
    rateEl.textContent = "";
    metaEl.textContent = "";
    return;
  }
  resultEl.classList.remove("error");

  if (from === to) {
    resultEl.textContent = formatMoney(amount, to);
    rateEl.textContent = `1 ${from} = 1 ${to}`;
    metaEl.textContent = "Même devise : aucune conversion nécessaire.";
    return;
  }

  resultEl.textContent = "Chargement des taux…";
  rateEl.textContent = "";
  metaEl.textContent = "";

  try {
    const { rates, date, source } = await fetchRates(from);
    const rate = rates[to];
    if (rate === undefined) throw new Error(`Taux ${to} indisponible`);
    const converted = amount * rate;
    resultEl.textContent = formatMoney(converted, to);
    rateEl.textContent = `1 ${from} = ${formatRate(rate)} ${to} (et 1 ${to} = ${formatRate(1 / rate)} ${from})`;
    metaEl.textContent = `Taux du ${date} — ${source}`;
  } catch (err) {
    resultEl.textContent = "Impossible de récupérer les taux en ligne. Vérifiez votre connexion.";
    resultEl.classList.add("error");
  }
}

fillSelect(fromSelect, DEFAULT_FROM);
fillSelect(toSelect, DEFAULT_TO);

amountInput.addEventListener("input", convert);
fromSelect.addEventListener("change", convert);
toSelect.addEventListener("change", convert);
swapButton.addEventListener("click", () => {
  const tmp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = tmp;
  convert();
});

convert();
