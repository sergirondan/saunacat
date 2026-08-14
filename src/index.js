/**
 * sauna.cat · punt d'entrada del Worker
 * ---------------------------------------------------------------------------
 * El lloc és estàtic: tot el que hi ha a public/ el serveix directament la
 * plataforma, sense passar per aquí. Aquest Worker només s'executa quan la
 * petició no coincideix amb cap fitxer, que és el cas de /api/contacte.
 *
 * El binding ASSETS i el directori public/ es declaren a wrangler.jsonc.
 */

import { gestionaContacte } from './contacte.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contacte') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, message: 'Cal fer un POST.' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
        });
      }
      return gestionaContacte(request, env);
    }

    // Qualsevol altra cosa: que la resolgui el servidor de fitxers estàtics.
    return env.ASSETS.fetch(request);
  },
};
