// Off The Grid — site public
// Menu mobile et demande de devis. Aucune donnée ne part vers un service tiers :
// le formulaire prépare un e-mail dans la messagerie du visiteur.

const QUOTE_TO = "hichem.boudaya@goldshard.fr";
const QUOTE_CC = "yassmine.tlili@goldshard.fr";

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const form = document.querySelector("form.quote");

if (form) {
  const wanted = new URLSearchParams(location.search).get("sujet");
  if (wanted) {
    const match = form.querySelector(`input[name="sujet"][data-key="${CSS.escape(wanted)}"]`);
    if (match) match.checked = true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const value = (name) => String(data.get(name) ?? "").trim();

    const subject = `Demande de devis — ${value("sujet")} — ${value("organisation")}`;
    const phone = value("telephone");
    const lines = [
      `Nom : ${value("nom")}`,
      `Organisation : ${value("organisation")}`,
      `E-mail : ${value("email")}`,
      ...(phone ? [`Téléphone : ${phone}`] : []),
      `Sujet : ${value("sujet")}`,
      `GED en place : ${value("ged")}`,
      `Hébergement : ${value("hebergement")}`,
      "",
      "Contexte :",
      value("contexte"),
    ];

    const href =
      `mailto:${QUOTE_TO}?cc=${encodeURIComponent(QUOTE_CC)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(lines.join("\n"))}`;

    window.open(href, "_self");

    const msg = form.querySelector(".form-msg");
    if (msg) msg.hidden = false;
  });
}
