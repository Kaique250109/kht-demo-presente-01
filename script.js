/* ============================================================
   KHT DIGITAL — PARA VOCÊ · DEMONSTRAÇÃO 01
   Interações sem bibliotecas externas
   ============================================================ */
(() => {
  'use strict';

  document.documentElement.classList.add('js-enabled');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 1. Tela de entrada — não bloqueia quem prefere reduzir movimento.
  const loader = $('#loadScreen');
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 600);
  };
  if (reducedMotion.matches) hideLoader();
  else window.setTimeout(hideLoader, 750);
  // Mesmo em conexões lentas, a página não fica presa na abertura.
  window.addEventListener('pageshow', hideLoader, { once: true });

  // 2. Menu responsivo, com fechamento por clique, Escape e resize.
  const menuToggle = $('#menuToggle');
  const navigation = $('#mainNavigation');
  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(opening));
      menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
      navigation.classList.toggle('is-open', opening);
      document.body.classList.toggle('menu-open', opening);
    });
    $$('a', navigation).forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 780) closeMenu();
    });
    document.addEventListener('click', event => {
      if (navigation.classList.contains('is-open') &&
          !navigation.contains(event.target) &&
          !menuToggle.contains(event.target)) closeMenu();
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  // 3. Cabeçalho e barra de progresso (com requestAnimationFrame).
  const header = $('.site-header');
  const scrollProgress = $('#scrollProgress');
  let isScrollQueued = false;
  const updateScrollUI = () => {
    const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.max(0, window.scrollY / scrollableHeight * 100));
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 30);
    if (scrollProgress) scrollProgress.style.width = `${percent}%`;
    isScrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!isScrollQueued) {
      isScrollQueued = true;
      window.requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });
  updateScrollUI();

  // 4. Revelação leve de conteúdo. Fallback caso IntersectionObserver falhe.
  const revealElements = $$('[data-reveal]');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 45px 0px' });
    revealElements.forEach(el => observer.observe(el));
  }

  // 5. Luz do cursor apenas em dispositivos com mouse fino.
  const glow = $('#siteGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches && !reducedMotion.matches) {
    window.addEventListener('pointermove', event => {
      document.body.classList.add('has-pointer');
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.addEventListener('mouseleave', () => document.body.classList.remove('has-pointer'));
  }

  // 6. Mensagens dos quatro cartões.
  $$('[data-detail]').forEach(card => {
    card.addEventListener('click', () => {
      const opening = card.getAttribute('aria-expanded') !== 'true';
      card.setAttribute('aria-expanded', String(opening));
      card.classList.toggle('is-open', opening);
      const back = $('.detail-card__back', card);
      if (back) back.hidden = !opening;
    });
  });

  // 7. Caixa de memórias com modal nativo, acessível por teclado.
  const memories = [
    {
      title: 'O primeiro momento', symbol: '✳',
      text: 'Todo começo traz uma possibilidade. Mesmo quando parece algo pequeno, ele pode se tornar o primeiro capítulo de uma história importante. Este cartão é um lembrete para valorizar os momentos que iniciam novas descobertas.'
    },
    {
      title: 'Um sorriso inesperado', symbol: '☺',
      text: 'Tem dias que ficam mais bonitos por causa de um detalhe simples. Um sorriso, uma mensagem, uma conversa. Pequenos gestos podem mudar o jeito como guardamos uma lembrança.'
    },
    {
      title: 'Um desejo para o futuro', symbol: '☾',
      text: 'Há sempre algo novo esperando por nós: uma ideia, um lugar, uma experiência ou um sonho. Que as próximas páginas sejam escritas com curiosidade, coragem e muitos bons momentos.'
    }
  ];
  const memoryDialog = $('#memoryDialog');
  const closeMemoryButton = $('#closeMemory');
  const openMemory = index => {
    const item = memories[index];
    if (!item || !memoryDialog) return;
    $('#memoryDialogTitle').textContent = item.title;
    $('#memoryDialogSymbol').textContent = item.symbol;
    $('#memoryDialogText').textContent = item.text;
    if (typeof memoryDialog.showModal === 'function') memoryDialog.showModal();
    else memoryDialog.setAttribute('open', '');
    document.body.classList.add('modal-open');
    closeMemoryButton?.focus();
  };
  $$('[data-memory]').forEach(button => {
    button.addEventListener('click', () => openMemory(Number(button.dataset.memory)));
  });
  const closeMemory = () => {
    if (!memoryDialog) return;
    if (typeof memoryDialog.close === 'function' && memoryDialog.open) memoryDialog.close();
    else memoryDialog.removeAttribute('open');
    document.body.classList.remove('modal-open');
  };
  closeMemoryButton?.addEventListener('click', closeMemory);
  memoryDialog?.addEventListener('close', () => document.body.classList.remove('modal-open'));
  memoryDialog?.addEventListener('click', event => {
    if (event.target === memoryDialog) closeMemory();
  });

  // 8. Envelope e carta.
  const letterScene = $('#letterScene');
  const letterToggle = $('#letterToggle');
  const letterContent = $('#letterContent');
  letterToggle?.addEventListener('click', () => {
    if (!letterScene || !letterContent) return;
    const opening = letterToggle.getAttribute('aria-expanded') !== 'true';
    letterToggle.setAttribute('aria-expanded', String(opening));
    letterScene.classList.toggle('is-open', opening);
    letterContent.hidden = !opening;
    letterToggle.innerHTML = opening
      ? 'Fechar a carta <span aria-hidden="true">↑</span>'
      : 'Abrir minha carta <span aria-hidden="true">↗</span>';
    if (opening) window.setTimeout(() => {
      if (letterToggle.getAttribute('aria-expanded') === 'true') {
        letterContent.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
      }
    }, reducedMotion.matches ? 0 : 400);
  });

  // 9. Segredos — contabiliza apenas estrelas distintas descobertas.
  const secrets = [
    '“Algumas lembranças são presentes que o tempo não apaga.”',
    '“Os momentos mais bonitos podem nascer de coisas muito simples.”',
    '“Todo cuidado colocado em um detalhe conta uma parte da história.”'
  ];
  const discovered = new Set();
  const secretMessage = $('#secretMessage');
  const secretCounter = $('#secretCounter');
  $$('[data-secret]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.secret);
      discovered.add(index);
      $$('[data-secret]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      button.classList.add('is-found');
      if (secretMessage) secretMessage.textContent = secrets[index];
      if (secretCounter) secretCounter.textContent = discovered.size === 3
        ? 'Você descobriu os 3 segredos! ✦'
        : `${discovered.size} de 3 segredos encontrados`;
    });
  });

  // 10. Frases em carrossel manual (sem movimento automático).
  const quotes = [
    '“O extraordinário pode morar nas coisas mais simples.”',
    '“Algumas histórias não precisam de grandes acontecimentos para marcar a gente.”',
    '“Um presente especial começa com a intenção de fazer alguém sorrir.”'
  ];
  let quoteIndex = 0;
  const quoteText = $('#momentQuote');
  const quotePosition = $('#quotePosition');
  const setQuote = index => {
    quoteIndex = (index + quotes.length) % quotes.length;
    if (quoteText) quoteText.textContent = quotes[quoteIndex];
    if (quotePosition) quotePosition.textContent = `${String(quoteIndex + 1).padStart(2, '0')} / ${String(quotes.length).padStart(2, '0')}`;
  };
  $('#quotePrev')?.addEventListener('click', () => setQuote(quoteIndex - 1));
  $('#quoteNext')?.addEventListener('click', () => setQuote(quoteIndex + 1));

  // 11. Prévia de personalização: os dados não são enviados nem salvos.
  let toastTimer;
  const toast = $('#toast');
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3300);
  };
  const nameForm = $('#nameForm');
  const recipientName = $('#recipientName');
  const recipientPreview = $('#recipientPreview');
  nameForm?.addEventListener('submit', event => {
    event.preventDefault();
    const name = (recipientName?.value || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 26);
    if (!name) {
      recipientName?.focus();
      showToast('Digite um nome ou apelido para experimentar.');
      return;
    }
    // textContent evita interpretar nomes como código HTML.
    if (recipientPreview) recipientPreview.textContent = name;
    showToast('Prévia personalizada! ✦');
  });

  // 12. Compartilhamento da demo com fallback para cópia de URL.
  $('#shareButton')?.addEventListener('click', async () => {
    const url = location.href.split('#')[0];
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Para Você · KHT Digital', text: 'Conheça esta demonstração de presente digital.', url });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link da demonstração copiado!');
        return;
      } catch (_) { /* Oferece orientação abaixo. */ }
    }
    showToast('Copie o endereço do site na barra do navegador.');
  });

  // 13. Rodapé automático.
  const currentYear = $('#currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
