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
assets/css/estils.css    Tot l'estil del lloc
assets/js/principal.js   Menú, finestra del formulari i validació
assets/img/*.svg         Il·lustracions dels productes
robots.txt, sitemap.xml
```

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

## Com arriben els formularis

Per defecte, el formulari valida les dades i obre el programa de correu del
visitant amb el missatge ja escrit cap a `info@sauna.cat`. Funciona sense cap
servidor, però depèn que la persona premi «enviar» al seu client de correu.

Per rebre'ls directament a una safata d'entrada, dona d'alta un servei de
formularis (Formspree, Basin, Web3Forms…) i posa la seva URL a la primera línia
útil de `assets/js/principal.js`:

```js
var ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

Amb això, l'enviament passa a fer-se per `fetch` en segon pla i el visitant veu
un missatge de confirmació sense sortir de la pàgina. No cal tocar res més.

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
