/* =========================================================
   MB Voyages · interactions de la landing page
   ========================================================= */

// Polices embarquées dans le build (aucune dépendance externe)
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './style.css';

// ---- À PERSONNALISER ------------------------------------
// Coordonnées de l'agence : remplacez par les vraies valeurs.
const CONFIG = {
  whatsapp: '33600000000',            // numéro au format international, sans + ni espaces
  email: 'contact@mb-voyages.fr',
  phoneDisplay: '06 00 00 00 00',
  price: null,                        // ex. 1590 pour afficher « 1 590 € » ; null = « Tarif sur demande »
};
// ---------------------------------------------------------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---- Contacts & prix ----
const waLink = (text = '') =>
  `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

$$('[data-contact="whatsapp"]').forEach((a) => {
  a.href = waLink('Bonjour MB Voyages, je souhaite des informations sur la Omra.');
  a.target = '_blank';
  a.rel = 'noopener';
});
$$('[data-contact="email"]').forEach((a) => {
  a.href = `mailto:${CONFIG.email}`;
  a.textContent = CONFIG.email;
});
$$('[data-contact="phone"]').forEach((a) => {
  a.href = `tel:+${CONFIG.whatsapp}`;
  a.textContent = CONFIG.phoneDisplay;
});
if (CONFIG.price) {
  $$('[data-price]').forEach((el) => {
    el.textContent = `${CONFIG.price.toLocaleString('fr-FR')} €`;
  });
}
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// ---- Navigation ----
const nav = $('.nav');
const toggle = $('.nav__toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
});
$$('.nav__links a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- Apparition au défilement ----
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
$$('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

// ---- Compteurs +/- ----
$$('.stepper').forEach((stepper) => {
  const input = $('input', stepper);
  $$('button', stepper).forEach((btn) =>
    btn.addEventListener('click', () => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 99);
      const next = Math.min(max, Math.max(min, Number(input.value || 0) + Number(btn.dataset.step)));
      input.value = next;
    })
  );
});

// ---- Formulaire de réservation ----
const form = $('#booking-form');
const okBox = $('.form__ok', form);

const rules = {
  prenom: (v) => (v.trim().length >= 2 ? '' : 'Indiquez votre prénom.'),
  nom: (v) => (v.trim().length >= 2 ? '' : 'Indiquez votre nom.'),
  telephone: (v) =>
    /^(\+|00)?[0-9 .-]{9,18}$/.test(v.trim()) ? '' : 'Numéro de téléphone invalide.',
  email: (v) =>
    !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Adresse e-mail invalide.',
  adultes: (v) => (Number(v) >= 1 ? '' : 'Au moins 1 adulte.'),
};

function setError(name, message) {
  const input = form.elements[name];
  const field = input.closest('.field');
  if (field) {
    field.classList.toggle('has-error', Boolean(message));
    const err = $('.field__err', field);
    if (err) err.textContent = message;
  }
}

function validate() {
  let firstInvalid = null;
  for (const [name, check] of Object.entries(rules)) {
    const msg = check(form.elements[name].value);
    setError(name, msg);
    if (msg && !firstInvalid) firstInvalid = form.elements[name];
  }
  const consentErr = $('[data-err="consent"]', form);
  const consentOk = form.elements.consent.checked;
  consentErr.textContent = consentOk ? '' : 'Merci de cocher cette case pour être recontacté(e).';
  if (!consentOk && !firstInvalid) firstInvalid = form.elements.consent;
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

// validation en direct après la première saisie
Object.keys(rules).forEach((name) =>
  form.elements[name].addEventListener('blur', (e) => setError(name, rules[name](e.target.value)))
);

function buildMessage(data) {
  const enfants = Number(data.enfants) || 0;
  return [
    'Bonjour MB Voyages, je souhaite réserver :',
    '',
    `• Départ : ${data.depart}`,
    `• Voyageurs : ${data.adultes} adulte(s)${enfants ? `, ${enfants} enfant(s)` : ''}`,
    `• Chambre : ${data.chambre}`,
    `• Ville : ${data.ville}`,
    '',
    `Nom : ${data.prenom} ${data.nom}`,
    `Téléphone : ${data.telephone}`,
    data.email ? `E-mail : ${data.email}` : null,
    data.message ? `\nMessage : ${data.message}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  okBox.hidden = true;
  if (!validate()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const text = buildMessage(data);
  const channel = e.submitter?.dataset.channel || 'whatsapp';

  if (channel === 'email') {
    const subject = `Réservation Omra · ${data.prenom} ${data.nom}`;
    window.location.href =
      `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  } else {
    window.open(waLink(text), '_blank', 'noopener');
  }

  okBox.textContent =
    `Merci ${data.prenom} ! Votre demande est prête à être envoyée. ` +
    'Validez l’envoi dans ' + (channel === 'email' ? 'votre messagerie' : 'WhatsApp') +
    ' : un conseiller vous recontacte rapidement.';
  okBox.hidden = false;
});
