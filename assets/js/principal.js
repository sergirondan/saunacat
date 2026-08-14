/* =========================================================================
   sauna.cat · comportament de la interfície
   ------------------------------------------------------------------------
   ENVIAMENT DELS FORMULARIS

   Un lloc estàtic no pot enviar correu per si sol: cal algú que el remeti.
   Ompliu UNA de les dues opcions de CORREU, aquí sota, i cada enviament
   arribarà a info@sauna.cat amb totes les dades del formulari.

   Opció A · Web3Forms (la més ràpida, sense servidor)
     1. Aneu a https://web3forms.com i demaneu una clau d'accés per a
        info@sauna.cat. Us l'envien per correu al moment.
     2. Enganxeu-la a `clauWeb3Forms`. Res més.

   Opció B · Qualsevol altre servei de formularis (Formspree, Basin...) o un
   endpoint propi que accepti un POST amb JSON: poseu-ne la URL a `endpoint`.

   Si les dues estan buides, el formulari continua validant les dades i obre
   el programa de correu del visitant amb el missatge ja escrit. Funciona,
   però depèn que la persona premi «enviar» al seu client de correu.
   ========================================================================= */

(function () {
  'use strict';

  var CORREU = {
    clauWeb3Forms: '',
    endpoint: ''
  };

  var API_WEB3FORMS = 'https://api.web3forms.com/submit';

  function hiHaEnviamentAutomatic() {
    return Boolean(CORREU.clauWeb3Forms || CORREU.endpoint);
  }

  // Dades de contacte i catàleg. Si canvieu un preu o un model, recordeu
  // d'actualitzar també els HTML corresponents.
  var dades = {
    correu: 'info@sauna.cat',
    telefon: '900 000 000',
    telefonEnllac: '+34900000000',
    productes: [
      { id: 'cub-de-cedre-2', nom: 'Cub de Cedre 2' },
      { id: 'cub-de-cedre-4', nom: 'Cub de Cedre 4' },
      { id: 'black-eco-4', nom: 'Black Eco 4' },
      { id: 'white-retreat-4', nom: 'White Retreat 4' }
    ]
  };

  function $(sel, arrel) {
    return (arrel || document).querySelector(sel);
  }

  function $$(sel, arrel) {
    return Array.prototype.slice.call((arrel || document).querySelectorAll(sel));
  }

  /* --- Capçalera compacta en desplaçar ---------------------------------- */

  var capcalera = $('.capcalera');

  if (capcalera) {
    var ajustaCapcalera = function () {
      capcalera.classList.toggle('es-compacta', window.scrollY > 40);
    };
    ajustaCapcalera();
    window.addEventListener('scroll', ajustaCapcalera, { passive: true });
  }

  /* --- Menú mòbil ------------------------------------------------------- */

  var hamburguesa = $('.hamburguesa');
  var menuMobil = $('#menu-mobil');

  if (hamburguesa && menuMobil) {
    hamburguesa.addEventListener('click', function () {
      var obert = hamburguesa.getAttribute('aria-expanded') === 'true';
      hamburguesa.setAttribute('aria-expanded', String(!obert));
      menuMobil.hidden = obert;
      hamburguesa.setAttribute('aria-label', obert ? 'Obre el menú' : 'Tanca el menú');
    });

    $$('a', menuMobil).forEach(function (a) {
      a.addEventListener('click', function () {
        hamburguesa.setAttribute('aria-expanded', 'false');
        menuMobil.hidden = true;
      });
    });
  }

  /* --- Desplegables de productes ---------------------------------------- */

  $$('[data-selector-producte]').forEach(function (select) {
    dades.productes.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nom;
      select.appendChild(opt);
    });
  });

  function nomProducte(id) {
    for (var i = 0; i < dades.productes.length; i++) {
      if (dades.productes[i].id === id) return dades.productes[i].nom;
    }
    return '';
  }

  // «el Cub de Cedre 2» però «l'Àrtic U»: apostrofa davant de vocal o hac.
  function ambArticle(nom) {
    var inicial = nom
      .charAt(0)
      .toLowerCase()
      .normalize('NFD')
      .charAt(0);
    return 'aeiouh'.indexOf(inicial) >= 0 ? 'l’' + nom : 'el ' + nom;
  }

  /* --- Galeria de la fitxa de producte ---------------------------------- */

  var galeria = $('.galeria');

  if (galeria) {
    var principal = $('[data-galeria-principal]', galeria);
    $$('.galeria__mini', galeria).forEach(function (mini) {
      mini.addEventListener('click', function () {
        if (!principal) return;
        principal.src = mini.getAttribute('data-imatge');
        principal.alt = mini.getAttribute('data-alt') || '';
        $$('.galeria__mini', galeria).forEach(function (m) {
          m.removeAttribute('aria-current');
        });
        mini.setAttribute('aria-current', 'true');
      });
    });
  }

  /* --- Modal ------------------------------------------------------------ */

  var modal = $('#modal-formulari');
  var ultimFocus = null;

  function obreModal(producteId) {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    ultimFocus = document.activeElement;

    var select = $('[data-selector-producte]', modal);
    if (select) select.value = producteId && nomProducte(producteId) ? producteId : '';

    var titol = $('#modal-titol', modal);
    if (titol) {
      titol.textContent = producteId && nomProducte(producteId)
        ? 'Et truquem sobre ' + ambArticle(nomProducte(producteId))
        : 'Et truquem nosaltres';
    }

    var primer = modal.querySelector('input, select, textarea, button');
    if (primer) primer.focus();
  }

  function tancaModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (ultimFocus && ultimFocus.focus) ultimFocus.focus();
  }

  $$('[data-obre-formulari]').forEach(function (boto) {
    boto.addEventListener('click', function () {
      obreModal(boto.getAttribute('data-producte') || '');
    });
  });

  $$('[data-tanca-modal]').forEach(function (el) {
    el.addEventListener('click', tancaModal);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tancaModal();
    if (e.key !== 'Tab' || !modal || modal.hidden) return;

    var focusables = $$(
      'a[href], button:not([disabled]), input, select, textarea',
      modal
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
    if (!focusables.length) return;

    var primer = focusables[0];
    var ultim = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === primer) {
      e.preventDefault();
      ultim.focus();
    } else if (!e.shiftKey && document.activeElement === ultim) {
      e.preventDefault();
      primer.focus();
    }
  });

  /* --- Validació i enviament -------------------------------------------- */

  var RE_CORREU = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var RE_TELEFON = /^[+()\d][\d\s().-]{7,}$/;

  function mostraError(form, missatge) {
    var caixa = $('[data-error-formulari]', form);
    if (!caixa) return;
    caixa.textContent = missatge;
    caixa.hidden = !missatge;
  }

  function valida(form) {
    var correu = form.correu.value.trim();
    var telefon = form.telefon.value.trim();
    var consent = form.consentiment;

    $$('.te-error', form).forEach(function (el) {
      el.classList.remove('te-error');
    });

    if (!correu && !telefon) {
      form.correu.classList.add('te-error');
      form.telefon.classList.add('te-error');
      return 'Deixa’ns com a mínim un correu electrònic o un telèfon perquè et puguem contestar.';
    }
    if (correu && !RE_CORREU.test(correu)) {
      form.correu.classList.add('te-error');
      return 'Aquesta adreça de correu no sembla correcta. Revisa-la, si us plau.';
    }
    if (telefon && !RE_TELEFON.test(telefon)) {
      form.telefon.classList.add('te-error');
      return 'Aquest número de telèfon no sembla correcte. Revisa’l, si us plau.';
    }
    if (consent && !consent.checked) {
      return 'Necessitem que acceptis el tractament de les dades per poder-te respondre.';
    }
    return '';
  }

  function recull(form) {
    var select = $('[data-selector-producte]', form);
    var id = select ? select.value : '';
    return {
      nom: form.nom.value.trim(),
      correu: form.correu.value.trim(),
      telefon: form.telefon.value.trim(),
      producte: id ? nomProducte(id) : 'Sense concretar',
      missatge: form.missatge.value.trim(),
      pagina: window.location.href,
    };
  }

  function cosCorreu(d) {
    return [
      'Nova sol·licitud d’informació des de sauna.cat',
      '',
      'Nom: ' + (d.nom || '—'),
      'Correu: ' + (d.correu || '—'),
      'Telèfon: ' + (d.telefon || '—'),
      'Producte d’interès: ' + d.producte,
      '',
      'Missatge:',
      d.missatge || '—',
      '',
      'Pàgina d’origen: ' + d.pagina,
    ].join('\n');
  }

  // Munta el cos del POST. Web3Forms envia per correu totes les claus que
  // rep, amb el nom que porten, així que aquí ja van en català.
  function carrega(d) {
    if (CORREU.clauWeb3Forms) {
      return {
        access_key: CORREU.clauWeb3Forms,
        subject: 'Sol·licitud de trucada · ' + d.producte,
        from_name: 'sauna.cat',
        replyto: d.correu || '',
        botcheck: '',
        Nom: d.nom || '—',
        Correu: d.correu || '—',
        'Telèfon': d.telefon || '—',
        'Producte d’interès': d.producte,
        Missatge: d.missatge || '—',
        'Pàgina d’origen': d.pagina,
        Moment: new Date().toLocaleString('ca-ES')
      };
    }
    return d;
  }

  function envia(cos) {
    return fetch(CORREU.clauWeb3Forms ? API_WEB3FORMS : CORREU.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cos)
    }).then(function (r) {
      if (!r.ok) throw new Error('resposta ' + r.status);
      return r.json().catch(function () {
        return { success: true };
      });
    }).then(function (dades) {
      // Web3Forms respon 200 amb success:false si la clau no és vàlida.
      if (dades && dades.success === false) {
        throw new Error(dades.message || 'enviament rebutjat');
      }
      return dades;
    });
  }

  function mostraExit(form, viaCorreu, d) {
    var contenidor = form.closest('[data-modal-contingut]') || form.parentNode;
    var bloc = document.createElement('div');
    bloc.className = 'formulari__exit';
    bloc.setAttribute('role', 'status');
    bloc.innerHTML =
      '<span class="marca-exit" aria-hidden="true">✓</span>' +
      '<h2>' +
      (viaCorreu ? 'Ja gairebé hi som' : 'Rebut, gràcies!') +
      '</h2>' +
      '<p>' +
      (viaCorreu
        ? 'Hem obert el teu programa de correu amb el missatge ja escrit. Només cal que l’enviïs i et responem el mateix dia laborable.'
        : 'Hem rebut les teves dades. Et responem el mateix dia laborable per parlar del que necessitis, sense compromís.') +
      '</p>' +
      '<p class="formulari__nota">Si tens pressa, truca’ns al <a href="tel:' +
      (dades.telefonEnllac || '') +
      '">' +
      (dades.telefon || '900 000 000') +
      '</a> o escriu a <a href="mailto:' +
      dades.correu +
      '">' +
      dades.correu +
      '</a>.</p>';

    contenidor.innerHTML = '';
    contenidor.appendChild(bloc);

    if (viaCorreu) {
      var assumpte = 'Informació sobre ' + d.producte + ' — sauna.cat';
      window.location.href =
        'mailto:' +
        dades.correu +
        '?subject=' +
        encodeURIComponent(assumpte) +
        '&body=' +
        encodeURIComponent(cosCorreu(d));
    }
  }

  $$('[data-formulari-contacte]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var error = valida(form);
      if (error) {
        mostraError(form, error);
        return;
      }
      mostraError(form, '');

      var d = recull(form);
      var boto = $('button[type="submit"]', form);
      var etiquetaBoto = boto ? boto.textContent : '';
      if (boto) {
        boto.disabled = true;
        boto.textContent = 'Enviant…';
      }

      if (!hiHaEnviamentAutomatic()) {
        mostraExit(form, true, d);
        return;
      }

      envia(carrega(d))
        .then(function () {
          mostraExit(form, false, d);
        })
        .catch(function () {
          if (boto) {
            boto.disabled = false;
            boto.textContent = etiquetaBoto;
          }
          mostraError(
            form,
            'No hem pogut enviar el formulari. Torna-ho a provar o truca’ns al ' +
              (dades.telefon || '900 000 000') +
              '.'
          );
        });
    });
  });

  /* --- Butlletí ---------------------------------------------------------- */

  $$('[data-formulari-butlleti]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var resposta = $('.butlleti__resposta', form);
      var correu = form.correu.value.trim();

      if (!RE_CORREU.test(correu)) {
        if (resposta) resposta.textContent = 'Revisa l’adreça de correu, si us plau.';
        return;
      }

      if (!hiHaEnviamentAutomatic()) {
        if (resposta) resposta.textContent = 'Apuntat! Gràcies.';
        form.reset();
        return;
      }

      var cos = CORREU.clauWeb3Forms
        ? {
            access_key: CORREU.clauWeb3Forms,
            subject: 'Alta al butlletí · sauna.cat',
            from_name: 'sauna.cat',
            replyto: correu,
            botcheck: '',
            Tipus: 'Alta al butlletí',
            Correu: correu,
            'Pàgina d’origen': window.location.href,
            Moment: new Date().toLocaleString('ca-ES')
          }
        : { tipus: 'butlleti', correu: correu };

      envia(cos)
        .then(function () {
          if (resposta) resposta.textContent = 'Apuntat! Gràcies.';
          form.reset();
        })
        .catch(function () {
          if (resposta) resposta.textContent = 'No ha funcionat. Torna-ho a provar més tard.';
        });
    });
  });
})();
