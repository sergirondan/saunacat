/**
 * sauna.cat · recepció dels formularis
 * ---------------------------------------------------------------------------
 * Pages Function que rep el formulari i n'envia el contingut per correu.
 * Cloudflare la desplega automàticament a /api/contacte; no cal cap
 * dependència ni cap pas de compilació.
 *
 * Admet dos remitents. Es tria segons les variables que hi hagi definides, de
 * manera que canviar d'un a l'altre no demana tocar el codi:
 *
 *   A) Cloudflare Email Service — demana el pla Workers Paid (5 $/mes)
 *      CF_ACCOUNT_ID   Identificador del compte de Cloudflare. Text.
 *      CF_EMAIL_TOKEN  Token amb el permís Email Sending: Edit. SECRET.
 *
 *   B) Resend — gratuït fins a 3.000 correus el mes
 *      RESEND_TOKEN    Clau d'API de Resend (re_...). SECRET.
 *
 * Comunes a les dues, totes dues opcionals:
 *   CORREU_DESTI    Per defecte, info@sauna.cat.
 *   CORREU_ORIGEN   Per defecte, web@sauna.cat. Ha de pertànyer a un domini
 *                   verificat al servei que facis servir.
 *
 * Sense cap de les dues configuracions, la funció respon 503 i el navegador
 * torna al recanvi d'obrir el client de correu del visitant.
 */

const DESTI_PER_DEFECTE = 'info@sauna.cat';
const ORIGEN_PER_DEFECTE = 'web@sauna.cat';

const RE_CORREU = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function json(cos, estat) {
  return new Response(JSON.stringify(cos), {
    status: estat,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** Evita que ens colin capçaleres a través dels camps del formulari. */
function net(valor, max) {
  return String(valor == null ? '' : valor)
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, max || 500);
}

function escapaHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function construeixMissatge(d) {
  const esButlleti = d.tipus === 'butlleti';

  const files = esButlleti
    ? [['Correu', d.correu]]
    : [
        ['Nom', d.nom || '—'],
        ['Correu', d.correu || '—'],
        ['Telèfon', d.telefon || '—'],
        ['Producte d’interès', d.producte || 'Sense concretar'],
        ['Missatge', d.missatge || '—'],
      ];

  files.push(['Pàgina d’origen', d.pagina || '—']);
  files.push(['Moment', new Date().toLocaleString('ca-ES', { timeZone: 'Europe/Madrid' })]);

  const assumpte = esButlleti
    ? 'Alta al butlletí · sauna.cat'
    : 'Sol·licitud de trucada · ' + (d.producte || 'Sense concretar');

  const text = files.map(([k, v]) => k + ': ' + v).join('\n');

  const html =
    '<div style="font-family:system-ui,sans-serif;font-size:15px;color:#22262a">' +
    '<h2 style="font-weight:600">' +
    (esButlleti ? 'Nova alta al butlletí' : 'Nova sol·licitud de trucada') +
    '</h2><table cellpadding="6" style="border-collapse:collapse">' +
    files
      .map(
        ([k, v]) =>
          '<tr><td style="border-bottom:1px solid #e6e1d9;color:#6e7478">' +
          escapaHtml(k) +
          '</td><td style="border-bottom:1px solid #e6e1d9">' +
          escapaHtml(v).replace(/\n/g, '<br>') +
          '</td></tr>'
      )
      .join('') +
    '</table></div>';

  return { assumpte, text, html };
}

/** Envia amb Cloudflare Email Service. Cal el pla Workers Paid. */
async function enviaAmbCloudflare(env, missatge) {
  return fetch(
    'https://api.cloudflare.com/client/v4/accounts/' + env.CF_ACCOUNT_ID + '/email/sending/send',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.CF_EMAIL_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missatge),
    }
  );
}

/** Envia amb Resend. Gratuït fins a 3.000 correus el mes. */
async function enviaAmbResend(env, missatge) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: missatge.from,
      to: [missatge.to],
      subject: missatge.subject,
      text: missatge.text,
      html: missatge.html,
      reply_to: missatge.reply_to,
    }),
  });
}

export async function onRequestPost({ request, env }) {
  const ambCloudflare = Boolean(env.CF_ACCOUNT_ID && env.CF_EMAIL_TOKEN);
  const ambResend = Boolean(env.RESEND_TOKEN);

  if (!ambCloudflare && !ambResend) {
    return json(
      {
        success: false,
        motiu: 'no-configurat',
        message: 'Cal CF_ACCOUNT_ID i CF_EMAIL_TOKEN, o bé RESEND_TOKEN.',
      },
      503
    );
  }

  let cru;
  try {
    cru = await request.json();
  } catch {
    return json({ success: false, message: 'Cos de la petició no vàlid.' }, 400);
  }

  // Parany per a robots: si el camp ocult ve ple, fem veure que tot ha anat bé.
  if (net(cru.botcheck)) return json({ success: true }, 200);

  const d = {
    tipus: net(cru.tipus, 40),
    nom: net(cru.nom, 120),
    correu: net(cru.correu, 160),
    telefon: net(cru.telefon, 40),
    producte: net(cru.producte, 120),
    missatge: net(cru.missatge, 3000),
    pagina: net(cru.pagina, 300),
  };

  if (!d.correu && !d.telefon) {
    return json({ success: false, message: 'Cal un correu o un telèfon.' }, 400);
  }
  if (d.correu && !RE_CORREU.test(d.correu)) {
    return json({ success: false, message: 'Adreça de correu no vàlida.' }, 400);
  }

  const { assumpte, text, html } = construeixMissatge(d);

  const missatge = {
    to: env.CORREU_DESTI || DESTI_PER_DEFECTE,
    from: env.CORREU_ORIGEN || ORIGEN_PER_DEFECTE,
    subject: assumpte,
    text,
    html,
    // Contestar el correu escriu directament a qui ha omplert el formulari.
    reply_to: d.correu || undefined,
  };

  const remitent = ambCloudflare ? 'Cloudflare Email Service' : 'Resend';
  const resposta = ambCloudflare
    ? await enviaAmbCloudflare(env, missatge)
    : await enviaAmbResend(env, missatge);

  if (!resposta.ok) {
    const detall = await resposta.text();
    console.error(remitent + ' ha fallat', resposta.status, detall);
    return json({ success: false, message: 'No s’ha pogut enviar el correu.' }, 502);
  }

  return json({ success: true }, 200);
}
