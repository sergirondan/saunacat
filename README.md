# sauna.cat

Lloc web estàtic en català per a sauna.cat, la divisió domèstica de **KUUMA**:
saunes de fusta massissa per a casa.

**HTML, CSS i JavaScript purs. Sense Node.js, sense npm, sense pas de compilació.**
Els fitxers que hi ha al repositori són exactament els que es publiquen.

## Estructura

```
index.html               Pàgina principal amb totes les seccions
privacitat.html          Privacitat, cookies i avís legal
productes/               Una fitxa per model (4)
  cub-de-cedre-2.html
  cub-de-cedre-4.html
  black-eco-4.html
  white-retreat-4.html
functions/api/contacte.js  Pages Function: envia els formularis per correu
assets/css/estils.css    Tot l'estil del lloc
assets/js/principal.js   Menú, galeria, finestra del formulari i validació
assets/img/                Fotografia de la capçalera i il·lustracions
robots.txt, sitemap.xml
```

Tot el que hi ha fora de `functions/` són fitxers estàtics que es publiquen tal
com són. La carpeta `functions/` la desplega Cloudflare Pages automàticament;
segueix sense caldre cap ordre de compilació.

## Veure'l en local

Obre `index.html` amb doble clic. Prou. Si vols un servidor local (perquè les
rutes es comportin com en producció), amb Python:

```bash
python -m http.server 8000
```

## Publicar a GitHub + Cloudflare Pages

```bash
git add .
git commit -m "Lloc web de sauna.cat"
git branch -M main
git remote add origin https://github.com/USUARI/saunacat.git
git push -u origin main
```

A Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, tria el
repositori i deixa la configuració de compilació buida:

| Camp | Valor |
| --- | --- |
| Framework preset | None |
| Build command | *(buit)* |
| Build output directory | `/` |

Després, a **Custom domains**, afegeix `sauna.cat`. Cada `git push` a `main`
torna a publicar el lloc automàticament.

## La fotografia de la capçalera

La portada fa servir `assets/img/capcalera-llac.jpg` com a fons, declarada a
`.heroi` dins del full d'estils. Si la vols canviar, substitueix el fitxer
conservant el nom i no cal tocar res més.

La composició demana una foto apaïsada i ampla (l'actual fa 2360 × 1327 px) amb
la zona inferior esquerra relativament neta, que és on cauen el títol i els
botons. El degradat fosc de la part de baix és el que en manté la llegibilitat.

## Què cal canviar abans de publicar de debò

Aquests valors són de mostra i surten repetits a tots els HTML. Fes una cerca i
substitució global:

| Cerca | Substitueix per |
| --- | --- |
| `900 000 000` | el telèfon real |
| `+34900000000` | el telèfon real en format enllaç |
| `info@sauna.cat` | l'adreça de correu real |
| `Polígon industrial · Vallès Occidental · Barcelona` | l'adreça real |
| `[Raó social]`, `[NIF]` a `privacitat.html` | les dades fiscals reals |

A més:

- **Ressenyes**: les de `index.html` i les de les fitxes són d'exemple.
  Substitueix-les per opinions reals abans de publicar.
- **Preus i especificacions**: revisa'ls model per model.
- **Fotografies dels productes**: totes les fotos dels quatre models (targetes de
  la portada, galeries i seccions de detall) apunten al CDN de `swellsport.com.au`
  mitjançant enllaç directe; no n'hi ha cap còpia al repositori. Dues advertències:
  són fotografies d'una altra empresa, de manera que caldria tenir-ne la llicència
  d'ús abans de publicar el lloc; i els URL porten un paràmetre `?v=` que canvia
  quan ells reprocessen la imatge, així que un dia deixaran de carregar.
  Substituir-les per fitxers propis a `assets/img/` és el camí estable.
- **Il·lustracions SVG**: les de `assets/img/producte-*.svg` han quedat sense fer
  servir, però es conserven com a recanvi per si cal tornar enrere.
- **Privacitat**: el text és una plantilla; ha de passar per un assessor legal.

## Com arriben els formularis a info@sauna.cat

El navegador envia el formulari a `/api/contacte`, que és la Pages Function de
`functions/api/contacte.js`. Cloudflare la desplega automàticament: no cal
canviar la configuració de compilació ni instal·lar res.

La funció sap enviar per dues vies i tria la que tingui configurada, així que
canviar d'una a l'altra és qüestió de variables, no de codi.

| | Cloudflare Email Service | Resend |
| --- | --- | --- |
| Preu | Requereix el pla **Workers Paid**, 5 $/mes | Gratuït fins a 3.000 correus/mes |
| Serveis externs | Cap | Un compte a resend.com |
| Variables | `CF_ACCOUNT_ID` + `CF_EMAIL_TOKEN` | `RESEND_TOKEN` |

Si hi ha les dues, mana Cloudflare.

### Opció A · Cloudflare Email Service (pla Workers Paid)

El tauler és en anglès; els noms de menús i botons van tal com hi surten.

1. **Activar el pla.** `Workers & Pages` → `Plans` → **Workers Paid**. Sense
   això, `Email Sending` surt bloquejat.
2. **Donar d'alta el domini.** `Compute` → `Email Service` → `Email Sending` →
   **Onboard Domain** → tria `sauna.cat` → revisa els registres DNS → **Done**.
3. **Verificar la destinació.** `Compute` → `Email Service` → `Email Routing` →
   `Destination Addresses`. Escriu-hi `info@sauna.cat`, envia, obre el correu de
   verificació i prem **Verify email address**.
4. **Crear el token.** `My Profile` → `API Tokens` → **Create Token** →
   **Create Custom Token**, amb el permís `Account` · `Email Sending` · `Edit`.
   Copia'l: no es torna a mostrar.
5. **Account ID.** És el codi de l'URL del tauler,
   `dash.cloudflare.com/<account-id>/...`, i també surt a la barra lateral dreta
   de la pàgina `Overview` del domini.

### Opció B · Resend (gratuïta)

1. Crea un compte a [resend.com](https://resend.com).
2. `Domains` → **Add Domain** → `sauna.cat`. Et donarà uns registres DNS; posa'ls
   al teu DNS de Cloudflare i espera que quedi `Verified`.
3. `API Keys` → **Create API Key**, amb permís d'enviament. Comença per `re_`.

### Les variables, en tots dos casos

`Workers & Pages` → el projecte → `Settings` → `Variables and secrets` (en
taulers més antics, `Environment variables`) → **Add**:

| Variable | Tipus | Quan |
| --- | --- | --- |
| `CF_ACCOUNT_ID` | `Text` | Opció A |
| `CF_EMAIL_TOKEN` | **`Secret`** | Opció A |
| `RESEND_TOKEN` | **`Secret`** | Opció B |
| `CORREU_DESTI` | `Text` (opcional) | Per defecte, `info@sauna.cat` |
| `CORREU_ORIGEN` | `Text` (opcional) | Per defecte, `web@sauna.cat` |

Els tokens han d'anar com a **Secret**, mai com a `Text`. L'adreça de
`CORREU_ORIGEN` ha de pertànyer a un domini verificat al servei que facis servir.

Finalment, **torna a desplegar**: les variables només s'apliquen als
desplegaments posteriors. `Deployments` → al darrer, menú `⋯` → **Retry
deployment**, o un `git push`.

Si alguna cosa falla, els errors surten a `Deployments` → el desplegament →
`Functions` (registres en temps real).

A partir d'aquí, **cada enviament del formulari de contacte, del de la finestra
emergent i de l'alta al butlletí arriba a `info@sauna.cat`** amb el nom, el
correu, el telèfon, el producte d'interès, el missatge, la pàgina d'origen i
l'hora. Contestar el correu escriu directament a qui ha omplert el formulari.

### Mentre no estigui configurat

Si falten les variables, la funció respon un 503 i el navegador torna al recanvi:
obre el programa de correu del visitant amb el missatge ja escrit. El mateix
passa en local, on la funció no s'executa. No es perd cap enviament per un error
visible, però sí que depèn que la persona premi «enviar» al seu client de correu:
no ho deixis així en producció.

### Si prefereixes un servei extern

A `assets/js/principal.js`, l'objecte `CORREU` admet una clau de
[Web3Forms](https://web3forms.com) a `clauWeb3Forms` o la URL de qualsevol servei
que accepti un `POST` amb JSON a `endpoint`, en lloc de `/api/contacte`.

## Tipografia

Els titulars fan servir **Source Serif 4** i el text corregut, **Inter**, servides
per Google Fonts amb un `<link>` a cada pàgina. És l'única petició externa de tot
el lloc. Si vols que sigui totalment autònom (o evitar Google per privacitat),
baixa els fitxers `.woff2`, desa'ls a `assets/fonts/` i declara'ls amb `@font-face`
a `assets/css/estils.css`; les variables `--tipo-titol` i `--tipo` ja centralitzen
la resta.

## Nota sobre el contingut

L'estructura i el to estan inspirats en swellsport.com.au, però tots els textos
són originals i en català. No s'hi ha copiat cap imatge ni cap testimoni de
tercers.
