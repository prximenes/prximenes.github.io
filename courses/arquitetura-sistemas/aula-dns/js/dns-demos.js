/**
 * dns-demos.js - Simuladores Interativos de DNS
 * 1. Simulador de Resolução Iterativa vs. Recursiva (com animação de pacotes e cache local)
 * 2. Visualizador da Árvore de Nomes DNS (destaque de camadas Global, Administrativa, Gerencial)
 */

window.DNSDemos = (function () {
  // =========================================================================
  // 1. SIMULADOR: RESOLUÇÃO ITERATIVA VS. RECURSIVA
  // =========================================================================
  const Sim = {
    canvas: null,
    ctx: null,
    mode: 'iterative', // 'iterative' ou 'recursive'
    cacheEnabled: false,
    currentStep: 0,
    isPlaying: false,
    animProgress: 0, // 0 a 1 entre nós
    animFrameId: null,
    lastTime: 0,
    width: 540,
    height: 290,

    nodes: [
      { id: 'client', label: 'Cliente / Resolver', ip: '192.168.1.10', x: 0.12, y: 0.65, color: '#2563eb', type: 'client' },
      { id: 'root', label: 'Root Server (.)', ip: '198.41.0.4', x: 0.31, y: 0.22, color: '#003366', type: 'root' },
      { id: 'tld', label: 'TLD Server (.nl)', ip: '193.0.0.198', x: 0.50, y: 0.22, color: '#1e3a8a', type: 'tld' },
      { id: 'domain', label: 'Domain (vu.nl)', ip: '130.37.1.1', x: 0.69, y: 0.22, color: '#4338ca', type: 'domain' },
      { id: 'authoritative', label: 'Auth (cs.vu.nl)', ip: '130.37.24.11', x: 0.88, y: 0.65, color: '#15803d', type: 'auth' }
    ],

    // Passos para cada modo
    getSteps() {
      if (this.mode === 'iterative') {
        if (this.cacheEnabled) {
          return [
            {
              from: 'client', to: 'domain',
              label: '1. Q: mail.cs.vu.nl? (Cache Hit: pula Root e TLD)',
              type: 'query',
              desc: 'CACHE HIT: O resolver já conhece o servidor de "vu.nl" por consultas anteriores! Pula a Raiz e o TLD.',
              highlight: 'cache-hit'
            },
            {
              from: 'domain', to: 'client',
              label: '2. Ref: NS cs.vu.nl (130.37.24.11)',
              type: 'referral',
              desc: 'vu.nl informa a autoridade de cs.vu.nl diretamente ao cliente.',
              highlight: 'highlight'
            },
            {
              from: 'client', to: 'authoritative',
              label: '3. Q: mail.cs.vu.nl?',
              type: 'query',
              desc: 'Cliente consulta o servidor autoritativo de cs.vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'authoritative', to: 'client',
              label: '4. Resp: IP = 130.37.24.18',
              type: 'answer',
              desc: 'Servidor autoritativo retorna o IP final! Resolução concluída em apenas 4 passos.',
              highlight: 'success'
            }
          ];
        } else {
          return [
            {
              from: 'client', to: 'root',
              label: '1. Q: ftp.cs.vu.nl?',
              type: 'query',
              desc: '1. Cliente pergunta ao Servidor Raiz (.) pelo host ftp.cs.vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'root', to: 'client',
              label: '2. Ref: NS para .nl',
              type: 'referral',
              desc: '2. Raiz não tem o IP final, mas devolve referência (referral) do servidor TLD (.nl).',
              highlight: 'highlight'
            },
            {
              from: 'client', to: 'tld',
              label: '3. Q: ftp.cs.vu.nl?',
              type: 'query',
              desc: '3. Cliente pergunta ao servidor TLD (.nl).',
              highlight: 'highlight'
            },
            {
              from: 'tld', to: 'client',
              label: '4. Ref: NS para vu.nl',
              type: 'referral',
              desc: '4. TLD (.nl) devolve referência para os servidores autoritativos de vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'client', to: 'domain',
              label: '5. Q: ftp.cs.vu.nl?',
              type: 'query',
              desc: '5. Cliente pergunta ao servidor de vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'domain', to: 'client',
              label: '6. Ref: NS para cs.vu.nl',
              type: 'referral',
              desc: '6. vu.nl delega e indica o servidor de departamento cs.vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'client', to: 'authoritative',
              label: '7. Q: ftp.cs.vu.nl?',
              type: 'query',
              desc: '7. Cliente consulta o servidor autoritativo final cs.vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'authoritative', to: 'client',
              label: '8. Resp: IP = 130.37.24.11',
              type: 'answer',
              desc: '8. Servidor autoritativo responde com o IP final! Resolução iterativa finalizada (8 mensagens).',
              highlight: 'success'
            }
          ];
        }
      } else {
        // Modo Recursivo
        if (this.cacheEnabled) {
          return [
            {
              from: 'client', to: 'root',
              label: '1. Q: mail.cs.vu.nl? (Recursiva)',
              type: 'query',
              desc: '1. Cliente envia consulta recursiva. A Raiz já tem o servidor de "vu.nl" em cache intermediário!',
              highlight: 'cache-hit'
            },
            {
              from: 'root', to: 'domain',
              label: '2. Q: mail.cs.vu.nl? (Cache Hit: pula TLD)',
              type: 'query',
              desc: 'CACHE HIT NOS SERVIDORES: A Raiz repassa direto para vu.nl, economizando consultas ao TLD (.nl)!',
              highlight: 'cache-hit'
            },
            {
              from: 'domain', to: 'authoritative',
              label: '3. Q: mail.cs.vu.nl? (Encaminhado)',
              type: 'query',
              desc: '3. Servidor vu.nl repassa para o autoritativo cs.vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'authoritative', to: 'domain',
              label: '4. Resp: 130.37.24.18',
              type: 'answer',
              desc: '4. Servidor autoritativo responde para vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'domain', to: 'root',
              label: '5. Resp: 130.37.24.18',
              type: 'answer',
              desc: '5. vu.nl devolve a resposta para a Raiz.',
              highlight: 'highlight'
            },
            {
              from: 'root', to: 'client',
              label: '6. Resp Final: IP = 130.37.24.18',
              type: 'answer',
              desc: '6. Raiz entrega o IP final ao Cliente. Cadeia recursiva reduzida de 8 para 6 saltos pelo cache intermediário!',
              highlight: 'success'
            }
          ];
        } else {
          return [
            {
              from: 'client', to: 'root',
              label: '1. Q: ftp.cs.vu.nl? (Recursiva)',
              type: 'query',
              desc: '1. Cliente transfere a responsabilidade para a cadeia recursiva a partir da Raiz.',
              highlight: 'highlight'
            },
            {
              from: 'root', to: 'tld',
              label: '2. Q: ftp.cs.vu.nl? (Encaminhado)',
              type: 'query',
              desc: '2. Servidor Raiz repassa diretamente a requisição para o servidor TLD (.nl).',
              highlight: 'highlight'
            },
            {
              from: 'tld', to: 'domain',
              label: '3. Q: ftp.cs.vu.nl? (Encaminhado)',
              type: 'query',
              desc: '3. Servidor TLD (.nl) encaminha a consulta para vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'domain', to: 'authoritative',
              label: '4. Q: ftp.cs.vu.nl? (Encaminhado)',
              type: 'query',
              desc: '4. Servidor vu.nl encaminha para cs.vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'authoritative', to: 'domain',
              label: '5. Resp: 130.37.24.11',
              type: 'answer',
              desc: '5. Servidor autoritativo entrega a resposta a vu.nl.',
              highlight: 'highlight'
            },
            {
              from: 'domain', to: 'tld',
              label: '6. Resp: 130.37.24.11',
              type: 'answer',
              desc: '6. vu.nl repassa a resposta ao TLD (.nl) e armazena em cache.',
              highlight: 'highlight'
            },
            {
              from: 'tld', to: 'root',
              label: '7. Resp: 130.37.24.11',
              type: 'answer',
              desc: '7. TLD repassa a resposta à Raiz.',
              highlight: 'highlight'
            },
            {
              from: 'root', to: 'client',
              label: '8. Resp Final: IP = 130.37.24.11',
              type: 'answer',
              desc: '8. Raiz entrega o IP final ao Cliente. O cliente esperou sem precisar controlar os saltos.',
              highlight: 'success'
            }
          ];
        }
      }
    },

    init() {
      this.canvas = document.getElementById('dnsSimCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.bindEvents();
      this.resize();
      this.reset();
    },

    bindEvents() {
      const btnIterative = document.getElementById('btnModeIterative');
      const btnRecursive = document.getElementById('btnModeRecursive');
      const btnPlay = document.getElementById('btnSimPlay');
      const btnStep = document.getElementById('btnSimStep');
      const btnReset = document.getElementById('btnSimReset');
      const chkCache = document.getElementById('chkSimCache');

      if (btnIterative) {
        btnIterative.addEventListener('click', () => {
          this.setMode('iterative');
          btnIterative.classList.add('active');
          if (btnRecursive) btnRecursive.classList.remove('active');
        });
      }

      if (btnRecursive) {
        btnRecursive.addEventListener('click', () => {
          this.setMode('recursive');
          btnRecursive.classList.add('active');
          if (btnIterative) btnIterative.classList.remove('active');
        });
      }

      if (btnPlay) {
        btnPlay.addEventListener('click', () => this.togglePlay());
      }

      if (btnStep) {
        btnStep.addEventListener('click', () => this.stepForward());
      }

      if (btnReset) {
        btnReset.addEventListener('click', () => this.reset());
      }

      if (chkCache) {
        chkCache.addEventListener('change', (e) => {
          this.cacheEnabled = e.target.checked;
          this.log(`Cache local ${this.cacheEnabled ? 'ATIVADO' : 'DESATIVADO'}.`);
          this.reset();
        });
      }

      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      if (!this.canvas) return;
      const wrapper = this.canvas.parentElement;
      const w = wrapper && wrapper.clientWidth > 50 ? wrapper.clientWidth : 540;
      const h = wrapper && wrapper.clientHeight > 50 ? wrapper.clientHeight : 290;
      this.width = w;
      this.height = h;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);

      if (this.ctx) {
        if (this.ctx.resetTransform) {
          this.ctx.resetTransform();
        } else {
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.scale(dpr, dpr);
      }
      this.draw();
    },

    setMode(mode) {
      this.mode = mode;
      this.reset();
      this.log(`Modo alterado para: <strong>${mode === 'iterative' ? 'Iterativo' : 'Recursivo'}</strong>`);
    },

    togglePlay() {
      const btn = document.getElementById('btnSimPlay');
      if (this.isPlaying) {
        this.pause();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Continuar';
      } else {
        this.play();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
      }
    },

    play() {
      const steps = this.getSteps();
      if (this.currentStep >= steps.length) {
        this.currentStep = 0;
      }
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    },

    pause() {
      this.isPlaying = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    },

    reset() {
      this.pause();
      this.currentStep = 0;
      this.animProgress = 0;
      const btnPlay = document.getElementById('btnSimPlay');
      if (btnPlay) btnPlay.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';

      const logBox = document.getElementById('simLogBox');
      if (logBox) {
        let cacheMsg = '';
        if (this.cacheEnabled) {
          cacheMsg = this.mode === 'iterative'
            ? '<div class="sim-log-entry cache-hit">[Cache no Resolver Ativo]: Pula servidores Raiz e TLD, consultando diretamente o domínio (4 passos)!</div>'
            : '<div class="sim-log-entry cache-hit">[Cache nos Servidores Ativo]: Servidores intermediários encurtam a cadeia recursiva (Figura 6-18 do livro, 6 passos)!</div>';
        }
        logBox.innerHTML = `
          <div class="sim-log-entry">Pronto para iniciar resolução ${this.mode === 'iterative' ? 'Iterativa' : 'Recursiva'}.</div>
          ${cacheMsg}
        `;
      }
      this.draw();
    },

    stepForward() {
      const steps = this.getSteps();
      if (this.currentStep < steps.length) {
        const step = steps[this.currentStep];
        this.log(step.desc, step.highlight);
        this.currentStep++;
        this.animProgress = 1;
        this.draw();
        if (this.currentStep === steps.length) {
          this.log("✓ Resolução DNS concluída com sucesso!", "success");
        }
      } else {
        this.reset();
      }
    },

    loop() {
      if (!this.isPlaying) return;

      const steps = this.getSteps();
      if (this.currentStep >= steps.length) {
        this.isPlaying = false;
        const btnPlay = document.getElementById('btnSimPlay');
        if (btnPlay) btnPlay.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Reiniciar';
        this.log("✓ Resolução DNS concluída com sucesso!", "success");
        this.draw();
        return;
      }

      const now = performance.now();
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      // Velocidade do pacote (~0.9s por salto)
      this.animProgress += dt * 1.1;

      if (this.animProgress >= 1) {
        const step = steps[this.currentStep];
        this.log(step.desc, step.highlight);
        this.currentStep++;
        this.animProgress = 0;
      }

      this.draw();
      this.animFrameId = requestAnimationFrame(() => this.loop());
    },

    log(msg, type = '') {
      const logBox = document.getElementById('simLogBox');
      if (!logBox) return;

      const entry = document.createElement('div');
      entry.className = `sim-log-entry ${type}`;
      entry.innerHTML = `› ${msg}`;
      logBox.appendChild(entry);
      logBox.scrollTop = logBox.scrollHeight;
    },

    getNode(id) {
      return this.nodes.find(n => n.id === id);
    },

    draw() {
      if (!this.ctx || !this.canvas) return;
      const w = this.width;
      const h = this.height;
      const isDark = document.body.classList.contains('dark-theme');

      this.ctx.clearRect(0, 0, w, h);

      // 1. Desenha conexões lógicas entre nós
      this.drawConnections(w, h, isDark);

      // 2. Desenha pacotes ativos
      this.drawPackets(w, h);

      // 3. Desenha nós (servidores e cliente)
      this.drawNodes(w, h, isDark);
    },

    drawConnections(w, h, isDark) {
      const lineColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 51, 102, 0.18)';
      this.ctx.strokeStyle = lineColor;
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);

      const client = this.getNode('client');
      const root = this.getNode('root');
      const tld = this.getNode('tld');
      const dom = this.getNode('domain');
      const auth = this.getNode('authoritative');

      if (this.mode === 'iterative') {
        // Conexões radiais do cliente para cada servidor
        [root, tld, dom, auth].forEach(target => {
          this.ctx.beginPath();
          this.ctx.moveTo(client.x * w, client.y * h);
          this.ctx.lineTo(target.x * w, target.y * h);
          this.ctx.stroke();
        });
      } else {
        // Conexões em cadeia recursiva
        const chain = [client, root, tld, dom, auth];
        for (let i = 0; i < chain.length - 1; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(chain[i].x * w, chain[i].y * h);
          this.ctx.lineTo(chain[i + 1].x * w, chain[i + 1].y * h);
          this.ctx.stroke();
        }
      }
      this.ctx.setLineDash([]);
    },

    drawNodes(w, h, isDark) {
      const steps = this.getSteps();
      const activeStep = this.currentStep < steps.length ? steps[this.currentStep] : null;

      this.nodes.forEach(node => {
        const nx = node.x * w;
        const ny = node.y * h;
        const isClient = node.type === 'client';
        const isActive = activeStep && (activeStep.from === node.id || activeStep.to === node.id);

        // Sombra de brilho para nó ativo
        if (isActive) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(nx, ny, 26, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(59, 130, 246, 0.28)';
          this.ctx.fill();
          this.ctx.restore();
        }

        // Círculo principal do nó
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, isClient ? 20 : 18, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color;
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = isDark ? '#ffffff' : '#f8fafc';
        this.ctx.stroke();

        // Ícone simples no nó (computador / servidor)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(isClient ? 'PC' : 'DNS', nx, ny);

        // Rótulos de Texto (Nome do Servidor e IP)
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
        this.ctx.fillText(node.label, nx, ny + (isClient ? 28 : 26));

        this.ctx.font = '9.5px monospace';
        this.ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        this.ctx.fillText(node.ip, nx, ny + (isClient ? 39 : 37));
      });
    },

    drawPackets(w, h) {
      const steps = this.getSteps();
      if (this.currentStep === 0 && !this.isPlaying) return;
      if (this.currentStep >= steps.length && !this.isPlaying) return;

      const stepIndex = this.isPlaying ? this.currentStep : Math.max(0, this.currentStep - 1);
      const step = steps[stepIndex];
      if (!step) return;

      const fromNode = this.getNode(step.from);
      const toNode = this.getNode(step.to);
      if (!fromNode || !toNode) return;

      const fx = fromNode.x * w;
      const fy = fromNode.y * h;
      const tx = toNode.x * w;
      const ty = toNode.y * h;

      const progress = this.isPlaying ? this.animProgress : 1;
      const px = fx + (tx - fx) * progress;
      const py = fy + (ty - fy) * progress;

      // Linha do trajeto ativo destacada
      this.ctx.beginPath();
      this.ctx.moveTo(fx, fy);
      this.ctx.lineTo(tx, ty);
      this.ctx.strokeStyle = step.type === 'answer' ? '#10b981' : (step.type === 'referral' ? '#f59e0b' : '#3b82f6');
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Pacote em movimento (bolinha brilhante)
      this.ctx.beginPath();
      this.ctx.arc(px, py, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = step.type === 'answer' ? '#10b981' : (step.type === 'referral' ? '#f59e0b' : '#3b82f6');
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.stroke();

      // Etiqueta do pacote flutuando
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';

      // Caixa de texto
      const text = step.label;
      const textWidth = this.ctx.measureText(text).width;
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(px - textWidth / 2 - 6, py - 22, textWidth + 12, 17);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(text, px, py - 8);
    }
  };

  // =========================================================================
  // 2. VISUALIZADOR DA ÁRVORE DE NOMES (HIERARQUIA DNS)
  // =========================================================================
  const Tree = {
    canvas: null,
    ctx: null,
    activeFilter: 'all', // 'all', 'global', 'adm', 'gerencial'
    selectedNode: null,
    width: 940,
    height: 330,

    // Hierarquia de nós para desenhar a árvore DNS
    nodes: [
      // Raiz (Global)
      { id: 'root', name: '.', label: 'Raiz (.)', layer: 'global', x: 0.50, y: 0.12, parent: null, desc: 'Raiz do espaço de nomes mundial. Administrada por 13 identidades de Root Servers.' },

      // Nível 1: TLDs (Global)
      { id: 'br', name: 'br', label: '.br', layer: 'global', x: 0.25, y: 0.34, parent: 'root', desc: 'ccTLD (Country Code) do Brasil. Gerenciado pelo Registro.br / CGI.br.' },
      { id: 'com', name: 'com', label: '.com', layer: 'global', x: 0.50, y: 0.34, parent: 'root', desc: 'gTLD (Genérico) Comercial mundial. Gerenciado pela Verisign.' },
      { id: 'nl', name: 'nl', label: '.nl', layer: 'global', x: 0.75, y: 0.34, parent: 'root', desc: 'ccTLD dos Países Baixos (Netherlands). Gerenciado pela SIDN.' },

      // Nível 2: Organizações (Administrativa)
      { id: 'unicap_br', name: 'unicap', label: 'unicap.br', layer: 'adm', x: 0.18, y: 0.58, parent: 'br', desc: 'Universidade Católica de Pernambuco. Zona administrativa própria da instituição.' },
      { id: 'uol_br', name: 'uol', label: 'uol.com.br', layer: 'adm', x: 0.32, y: 0.58, parent: 'br', desc: 'Provedor de serviços e portal corporativo privado.' },
      { id: 'google_com', name: 'google', label: 'google.com', layer: 'adm', x: 0.50, y: 0.58, parent: 'com', desc: 'Zona administrativa corporativa da Google LLC.' },
      { id: 'vu_nl', name: 'vu', label: 'vu.nl', layer: 'adm', x: 0.75, y: 0.58, parent: 'nl', desc: 'Vrije Universiteit Amsterdam. Zona administrativa da universidade.' },

      // Nível 3: Subdomínios e Serviços (Gerencial)
      { id: 'c3_unicap', name: 'c3', label: 'c3.unicap.br', layer: 'gerencial', x: 0.14, y: 0.82, parent: 'unicap_br', desc: 'Centro de Ciências / Departamento de Computação na Unicap.' },
      { id: 'www_unicap', name: 'www', label: 'www.c3.unicap.br', layer: 'gerencial', x: 0.24, y: 0.82, parent: 'unicap_br', desc: 'Serviço web institucional. Máquina/cluster ativo na camada gerencial.' },
      { id: 'mail_google', name: 'mail', label: 'mail.google.com', layer: 'gerencial', x: 0.50, y: 0.82, parent: 'google_com', desc: 'Serviço de webmail de alta demanda e trocas frequentes de IPs balanceados.' },
      { id: 'cs_vu', name: 'cs', label: 'cs.vu.nl', layer: 'gerencial', x: 0.68, y: 0.82, parent: 'vu_nl', desc: 'Departamento de Ciência da Computação da VU.' },
      { id: 'ftp_vu', name: 'ftp', label: 'ftp.cs.vu.nl', layer: 'gerencial', x: 0.82, y: 0.82, parent: 'vu_nl', desc: 'Servidor de arquivos FTP folha (exemplo clássico do livro do Tanenbaum).' }
    ],

    init() {
      this.canvas = document.getElementById('dnsTreeCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.selectedNode = this.nodes.find(n => n.id === 'unicap_br');
      this.bindEvents();
      this.resize();
      this.updatePanel();
    },

    bindEvents() {
      // Filtros de Camadas
      document.querySelectorAll('.tree-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tree-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeFilter = btn.getAttribute('data-filter');
          this.draw();
        });
      });

      // Clique em nós no canvas com raio fixo de 35px
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const clickX = ((e.clientX - rect.left) / rect.width) * this.width;
        const clickY = ((e.clientY - rect.top) / rect.height) * this.height;

        let closest = null;
        let minDist = 35; // 35 pixels de raio de clique

        this.nodes.forEach(node => {
          const nx = node.x * this.width;
          const ny = node.y * this.height;
          const dist = Math.hypot(nx - clickX, ny - clickY);
          if (dist < minDist) {
            minDist = dist;
            closest = node;
          }
        });

        if (closest) {
          this.selectedNode = closest;
          this.updatePanel();
          this.draw();
        }
      });

      // Cursor interativo ao passar o mouse sobre os nós
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const mx = ((e.clientX - rect.left) / rect.width) * this.width;
        const my = ((e.clientY - rect.top) / rect.height) * this.height;
        const isOver = this.nodes.some(node => Math.hypot(node.x * this.width - mx, node.y * this.height - my) < 25);
        this.canvas.style.cursor = isOver ? 'pointer' : 'default';
      });

      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      if (!this.canvas) return;
      const wrapper = this.canvas.parentElement;
      const w = wrapper && wrapper.clientWidth > 50 ? wrapper.clientWidth : 940;
      const h = wrapper && wrapper.clientHeight > 50 ? wrapper.clientHeight : 330;
      this.width = w;
      this.height = h;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);

      if (this.ctx) {
        if (this.ctx.resetTransform) {
          this.ctx.resetTransform();
        } else {
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.scale(dpr, dpr);
      }
      this.draw();
    },

    updatePanel() {
      const panel = document.getElementById('treeNodeDetails');
      if (!panel || !this.selectedNode) return;

      const n = this.selectedNode;
      const layerNames = {
        global: '<span class="layer-tag tag-global">Camada Global</span>',
        adm: '<span class="layer-tag tag-adm">Camada Administrativa</span>',
        gerencial: '<span class="layer-tag tag-gerencial">Camada Gerencial</span>'
      };

      panel.innerHTML = `
        <div>
          <strong>Nó Selecionado:</strong> <code>${n.label}</code> &nbsp; ${layerNames[n.layer] || ''}
          <div style="margin-top: 4px; color: var(--beamer-text-muted); font-size: 0.82rem;">${n.desc}</div>
        </div>
      `;
    },

    draw() {
      if (!this.ctx || !this.canvas) return;
      const w = this.width;
      const h = this.height;
      const isDark = document.body.classList.contains('dark-theme');

      this.ctx.clearRect(0, 0, w, h);

      // Faixas de fundo sutis indicando as 3 camadas
      this.drawLayerBands(w, h, isDark);

      // Linhas da árvore
      this.drawTreeLines(w, h, isDark);

      // Nós
      this.drawTreeNodes(w, h, isDark);
    },

    drawLayerBands(w, h, isDark) {
      // 3 faixas horizontais
      const layers = [
        { y1: 0, y2: 0.44, name: 'CAMADA GLOBAL', color: isDark ? 'rgba(30, 64, 175, 0.10)' : 'rgba(219, 234, 254, 0.45)' },
        { y1: 0.44, y2: 0.70, name: 'CAMADA ADMINISTRATIVA', color: isDark ? 'rgba(67, 56, 202, 0.10)' : 'rgba(224, 231, 255, 0.40)' },
        { y1: 0.70, y2: 1.0, name: 'CAMADA GERENCIAL', color: isDark ? 'rgba(21, 128, 61, 0.10)' : 'rgba(220, 252, 231, 0.40)' }
      ];

      layers.forEach(l => {
        this.ctx.fillStyle = l.color;
        this.ctx.fillRect(0, l.y1 * h, w, (l.y2 - l.y1) * h);

        this.ctx.font = 'bold 9.5px sans-serif';
        this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 51, 102, 0.45)';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(l.name, w - 16, l.y1 * h + 16);
      });
    },

    drawTreeLines(w, h, isDark) {
      this.ctx.lineWidth = 1.6;
      this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 51, 102, 0.30)';

      this.nodes.forEach(node => {
        if (!node.parent) return;
        const parent = this.nodes.find(n => n.id === node.parent);
        if (!parent) return;

        this.ctx.beginPath();
        this.ctx.moveTo(parent.x * w, parent.y * h);
        this.ctx.lineTo(node.x * w, node.y * h);
        this.ctx.stroke();
      });
    },

    drawTreeNodes(w, h, isDark) {
      const colors = {
        global: { bg: '#003366', border: '#60a5fa' },
        adm: { bg: '#312e81', border: '#818cf8' },
        gerencial: { bg: '#166534', border: '#4ade80' }
      };

      this.nodes.forEach(node => {
        const nx = node.x * w;
        const ny = node.y * h;
        const isSelected = this.selectedNode && this.selectedNode.id === node.id;
        const isMatchFilter = this.activeFilter === 'all' || this.activeFilter === node.layer;

        this.ctx.save();
        this.ctx.globalAlpha = isMatchFilter ? 1.0 : 0.20;

        // Efeito de seleção
        if (isSelected) {
          this.ctx.beginPath();
          this.ctx.arc(nx, ny, 24, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
          this.ctx.fill();
        }

        // Círculo do Nó
        const nodeColor = colors[node.layer];
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, 16, 0, Math.PI * 2);
        this.ctx.fillStyle = nodeColor.bg;
        this.ctx.fill();
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.strokeStyle = isSelected ? '#38bdf8' : nodeColor.border;
        this.ctx.stroke();

        // Nome dentro do nó
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 9.5px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.name, nx, ny);

        // Rótulo abaixo do nó
        this.ctx.font = isSelected ? 'bold 10.5px sans-serif' : '10px sans-serif';
        this.ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
        this.ctx.fillText(node.label, nx, ny + 25);

        this.ctx.restore();
      });
    }
  };

  return {
    initAll() {
      Sim.init();
      Tree.init();
    },
    resizeAndDrawSim() {
      Sim.resize();
    },
    resizeAndDrawTree() {
      Tree.resize();
    },
    redrawAll() {
      Sim.resize();
      Tree.resize();
    }
  };
})();
