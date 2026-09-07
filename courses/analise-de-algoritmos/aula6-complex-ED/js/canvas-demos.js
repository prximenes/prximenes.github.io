/**
 * SIMULADORES E DEMONSTRAÇÕES INTERATIVAS CANVAS 2D / DOM
 * Análise de Algoritmos - Aula 6 (Estruturas de Dados e Complexidade)
 * Autor: Pedro Ximenes (UNICAP)
 */

window.CanvasDemos = (function () {
  // Utilitário para Canvas High-DPI nítido
  function setupFixedCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 420;
    const height = rect.height || canvas.height || 200;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function isDarkMode() {
    return document.body.classList.contains('dark-mode');
  }

  /* ============================================================
     1. ARRAYLIST VISUALIZER (Resize O(n) e Shifts O(n))
     ============================================================ */
  const ArrayListDemo = {
    canvas: null,
    capacity: 4,
    items: [42, 17, 8],
    highlightIndices: [],
    highlightType: 'default', // 'insert', 'active', 'resize'
    statusText: 'ArrayList pronta. Capacidade: 4, Elementos: 3.',
    resizeCopies: 0,
    lastCost: 'O(1)',
    isAnimating: false,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset() {
      this.capacity = 4;
      this.items = [42, 17, 8];
      this.highlightIndices = [];
      this.resizeCopies = 0;
      this.lastCost = 'O(1)';
      this.statusText = 'ArrayList reiniciada com 3 elementos e capacidade 4.';
      this.updateUI();
      this.draw();
    },

    addEnd(val) {
      if (this.isAnimating) return;
      const num = val !== undefined ? val : Math.floor(Math.random() * 90) + 10;

      if (this.items.length >= this.capacity) {
        // Precisa de resize!
        this.isAnimating = true;
        const oldCap = this.capacity;
        const copied = this.items.length;
        this.capacity *= 2;
        this.resizeCopies += copied;
        this.lastCost = `O(n) [${copied} cópias]`;
        this.statusText = `Capacidade esgotada (${oldCap})! Dobrando para ${this.capacity}. Copiando ${copied} elementos (Resize: O(n)).`;
        this.highlightType = 'resize';
        this.highlightIndices = this.items.map((_, idx) => idx);
        this.updateUI();
        this.draw();

        setTimeout(() => {
          this.items.push(num);
          this.highlightIndices = [this.items.length - 1];
          this.highlightType = 'insert';
          this.statusText = `Elemento ${num} inserido no fim após resize. Custo médio amortizado: O(1)!`;
          this.isAnimating = false;
          this.updateUI();
          this.draw();
        }, 700);
      } else {
        this.items.push(num);
        this.lastCost = 'O(1)';
        this.highlightIndices = [this.items.length - 1];
        this.highlightType = 'insert';
        this.statusText = `Elemento ${num} inserido no fim em O(1) direto (vaga livre, sem resize).`;
        this.updateUI();
        this.draw();
      }
    },

    updateUI() {
      const statusElem = document.getElementById('arraylist-status');
      if (statusElem) statusElem.textContent = this.statusText;
      const metricsElem = document.getElementById('arraylist-metrics');
      if (metricsElem) {
        metricsElem.innerHTML = `Tamanho: <span>${this.items.length}</span> | Capacidade: <span>${this.capacity}</span> | Custo da operação: <span style="color:#2563eb; font-weight:600;">${this.lastCost || 'O(1)'}</span>`;
      }
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const cellWidth = Math.min(48, (width - 40) / Math.max(8, this.capacity));
      const cellHeight = 44;
      const startX = 20;
      const startY = height / 2 - cellHeight / 2;

      // Desenha slots de capacidade
      for (let i = 0; i < this.capacity; i++) {
        const x = startX + i * cellWidth;
        const isOccupied = i < this.items.length;
        const isHighlighted = this.highlightIndices.includes(i);

        // Fundo da célula
        if (isHighlighted) {
          if (this.highlightType === 'insert') ctx.fillStyle = '#22c55e';
          else if (this.highlightType === 'resize') ctx.fillStyle = '#3b82f6';
          else ctx.fillStyle = '#a855f7';
        } else if (isOccupied) {
          ctx.fillStyle = dark ? '#1e3a8a' : '#dbeafe';
        } else {
          ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9';
        }

        ctx.fillRect(x, startY, cellWidth - 2, cellHeight);
        ctx.strokeStyle = dark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, startY, cellWidth - 2, cellHeight);

        // Texto do valor
        if (isOccupied) {
          ctx.fillStyle = isHighlighted ? '#ffffff' : (dark ? '#f8fafc' : '#0f172a');
          ctx.font = 'bold 15px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.items[i], x + (cellWidth - 2) / 2, startY + cellHeight / 2);
        }

        // Índice no rodapé da célula
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`[${i}]`, x + (cellWidth - 2) / 2, startY + cellHeight + 16);
      }

      // Marcadores de Tamanho e Capacidade
      ctx.fillStyle = dark ? '#38bdf8' : '#0284c7';
      ctx.font = 'bold 11.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Array físico interno (vetor contíguo de tamanho ${this.capacity})`, startX, startY - 14);
    }
  };

  /* ============================================================
     2. LINKED LIST VISUALIZER (Ponteiros head, tail, nós prev/next)
     ============================================================ */
  const LinkedListDemo = {
    canvas: null,
    nodes: [8, 11, 22, 43],
    highlightIndex: -1,
    statusText: 'LinkedList duplamente encadeada pronta.',
    isTraversing: false,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset() {
      this.nodes = [8, 11, 22, 43];
      this.highlightIndex = -1;
      this.statusText = 'Lista reiniciada com 4 nós.';
      this.updateUI();
      this.draw();
    },

    addFirst(val) {
      if (this.isTraversing) return;
      const num = val !== undefined ? val : Math.floor(Math.random() * 90) + 10;
      this.nodes.unshift(num);
      this.highlightIndex = 0;
      this.statusText = `addFirst(${num}): Novo nó ligado na cabeça (head). Custo: O(1) imediato!`;
      this.updateUI();
      this.draw();
    },

    addLast(val) {
      if (this.isTraversing) return;
      const num = val !== undefined ? val : Math.floor(Math.random() * 90) + 10;
      this.nodes.push(num);
      this.highlightIndex = this.nodes.length - 1;
      this.statusText = `addLast(${num}): Novo nó ligado na cauda (tail). Custo: O(1) imediato!`;
      this.updateUI();
      this.draw();
    },

    removeFirst() {
      if (this.isTraversing || this.nodes.length === 0) return;
      const removed = this.nodes.shift();
      this.highlightIndex = 0;
      this.statusText = `removeFirst(): Nó ${removed} removido atualizando head = head.next. Custo: O(1)!`;
      this.updateUI();
      this.draw();
    },

    removeLast() {
      if (this.isTraversing || this.nodes.length === 0) return;
      const removed = this.nodes.pop();
      this.highlightIndex = this.nodes.length - 1;
      this.statusText = `removeLast(): Nó ${removed} removido atualizando tail = tail.prev. Custo: O(1)!`;
      this.updateUI();
      this.draw();
    },

    traverseTo(index) {
      if (this.isTraversing || this.nodes.length === 0) return;
      const targetIdx = Math.max(0, Math.min(this.nodes.length - 1, parseInt(index, 10) || 0));
      this.isTraversing = true;
      let curr = 0;

      const step = () => {
        this.highlightIndex = curr;
        this.statusText = `Percorrendo ponteiros a partir de head... Nó atual no índice ${curr} (valor ${this.nodes[curr]}). Custo proporcional à distância: O(i).`;
        this.updateUI();
        this.draw();

        if (curr < targetIdx) {
          curr++;
          setTimeout(step, 450);
        } else {
          this.statusText = `Chegou ao índice ${targetIdx} (valor ${this.nodes[targetIdx]}) após ${targetIdx + 1} passos! Total: O(n).`;
          this.isTraversing = false;
          this.updateUI();
        }
      };
      step();
    },

    updateUI() {
      const statusElem = document.getElementById('linkedlist-status');
      if (statusElem) statusElem.textContent = this.statusText;
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const n = this.nodes.length;
      if (n === 0) {
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Lista vazia (head = null, tail = null)', width / 2, height / 2);
        return;
      }

      const nodeWidth = 48;
      const nodeHeight = 36;
      const gap = Math.min(36, (width - n * nodeWidth - 60) / Math.max(1, n - 1));
      const startX = Math.max(20, (width - (n * nodeWidth + (n - 1) * gap)) / 2);
      const centerY = height / 2 - nodeHeight / 2;

      for (let i = 0; i < n; i++) {
        const x = startX + i * (nodeWidth + gap);
        const isHighlight = i === this.highlightIndex;

        // Caixa do nó
        ctx.fillStyle = isHighlight ? '#eab308' : (i === 0 ? (dark ? '#065f46' : '#d1fae5') : (i === n - 1 ? (dark ? '#7f1d1d' : '#fee2e2') : (dark ? '#1e3a8a' : '#e0e7ff')));
        ctx.strokeStyle = dark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(x, centerY, nodeWidth, nodeHeight, 6);
        ctx.fill();
        ctx.stroke();

        // Texto do nó
        ctx.fillStyle = isHighlight ? '#000000' : (dark ? '#f8fafc' : '#0f172a');
        ctx.font = 'bold 15px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.nodes[i], x + nodeWidth / 2, centerY + nodeHeight / 2);

        // Tags head / tail
        ctx.font = 'bold 10px sans-serif';
        if (i === 0) {
          ctx.fillStyle = '#10b981';
          ctx.fillText('HEAD', x + nodeWidth / 2, centerY - 10);
        }
        if (i === n - 1) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('TAIL', x + nodeWidth / 2, centerY + nodeHeight + 14);
        }

        // Setas duplas de encadeamento
        if (i < n - 1) {
          const arrowStartX = x + nodeWidth + 2;
          const arrowEndX = x + nodeWidth + gap - 2;

          // Seta Next (topo)
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(arrowStartX, centerY + nodeHeight * 0.35);
          ctx.lineTo(arrowEndX, centerY + nodeHeight * 0.35);
          ctx.stroke();
          // ponta next
          ctx.beginPath();
          ctx.moveTo(arrowEndX - 4, centerY + nodeHeight * 0.35 - 3);
          ctx.lineTo(arrowEndX, centerY + nodeHeight * 0.35);
          ctx.lineTo(arrowEndX - 4, centerY + nodeHeight * 0.35 + 3);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();

          // Seta Prev (fundo)
          ctx.strokeStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(arrowEndX, centerY + nodeHeight * 0.68);
          ctx.lineTo(arrowStartX, centerY + nodeHeight * 0.68);
          ctx.stroke();
          // ponta prev
          ctx.beginPath();
          ctx.moveTo(arrowStartX + 4, centerY + nodeHeight * 0.68 - 3);
          ctx.lineTo(arrowStartX, centerY + nodeHeight * 0.68);
          ctx.lineTo(arrowStartX + 4, centerY + nodeHeight * 0.68 + 3);
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
        }
      }
    }
  };

  /* ============================================================
     3. PILHA (STACK - LIFO) VISUALIZER
     ============================================================ */
  const StackDemo = {
    canvas: null,
    items: ['"a"', '"b"', '"c"'],
    maxCapacity: 6,
    statusText: 'Pilha pronta. Topo aponta para o último elemento inserido.',

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.draw();
    },

    push(val) {
      if (this.items.length >= this.maxCapacity) {
        this.statusText = 'Erro: Overflow! A pilha atingiu a capacidade máxima.';
        this.updateUI();
        return;
      }
      const item = val || `"${String.fromCharCode(97 + this.items.length)}"`;
      this.items.push(item);
      this.statusText = `push(${item}): Inserido no topo em O(1) (atribuição direta e topo++).`;
      this.updateUI();
      this.draw();
    },

    pop() {
      if (this.items.length === 0) {
        this.statusText = 'Erro: Underflow! A pilha está vazia (topo = -1).';
        this.updateUI();
        return;
      }
      const removed = this.items.pop();
      this.statusText = `pop() -> ${removed}: Removido do topo em O(1) (retorna elemento e topo--).`;
      this.updateUI();
      this.draw();
    },

    peek() {
      if (this.items.length === 0) {
        this.statusText = 'Pilha vazia (peek = null).';
      } else {
        const topItem = this.items[this.items.length - 1];
        this.statusText = `peek() -> ${topItem}: Consulta direta a pilha[topo] em O(1) sem remoção.`;
      }
      this.updateUI();
      this.draw();
    },

    reset() {
      this.items = ['"a"', '"b"', '"c"'];
      this.statusText = 'Pilha reiniciada.';
      this.updateUI();
      this.draw();
    },

    updateUI() {
      const statusElem = document.getElementById('stack-status');
      if (statusElem) statusElem.textContent = this.statusText;
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const chamberWidth = 110;
      const chamberHeight = 150;
      const startX = width / 2 - chamberWidth / 2;
      const bottomY = height - 20;

      // Desenha contorno da câmara LIFO (fundo e laterais, aberto em cima)
      ctx.strokeStyle = dark ? '#475569' : '#003366';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, bottomY - chamberHeight);
      ctx.lineTo(startX, bottomY);
      ctx.lineTo(startX + chamberWidth, bottomY);
      ctx.lineTo(startX + chamberWidth, bottomY - chamberHeight);
      ctx.stroke();

      const blockHeight = 22;
      for (let i = 0; i < this.items.length; i++) {
        const y = bottomY - (i + 1) * (blockHeight + 3);
        const isTop = i === this.items.length - 1;

        ctx.fillStyle = isTop ? (dark ? '#1d4ed8' : '#3b82f6') : (dark ? '#1e293b' : '#dbeafe');
        ctx.fillRect(startX + 4, y, chamberWidth - 8, blockHeight);
        ctx.strokeStyle = dark ? '#60a5fa' : '#1e3a8a';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(startX + 4, y, chamberWidth - 8, blockHeight);

        ctx.fillStyle = isTop ? '#ffffff' : (dark ? '#e2e8f0' : '#0f172a');
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.items[i], startX + chamberWidth / 2, y + blockHeight / 2);

        if (isTop) {
          // Indicador de TOPO
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`← topo (índice ${i})`, startX + chamberWidth + 8, y + blockHeight / 2);
        }
      }

      if (this.items.length === 0) {
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
        ctx.font = 'italic 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pilha vazia (topo = -1)', startX + chamberWidth / 2, bottomY - chamberHeight / 2);
      }
    }
  };

  /* ============================================================
     4. FILA CIRCULAR (QUEUE - FIFO) VISUALIZER
     ============================================================ */
  const QueueDemo = {
    canvas: null,
    capacity: 6,
    buffer: ['a', 'b', 'c', null, null, null],
    head: 0,
    tail: 3,
    count: 3,
    statusText: 'Fila Circular pronta com aritmética modular: tail = (tail + 1) % C.',

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.draw();
    },

    enqueue(val) {
      if (this.count >= this.capacity) {
        this.statusText = 'Erro: Fila cheia! Não é possível enfileirar.';
        this.updateUI();
        return;
      }
      const item = val || String.fromCharCode(97 + Math.floor(Math.random() * 26));
      this.buffer[this.tail] = item;
      const oldTail = this.tail;
      this.tail = (this.tail + 1) % this.capacity;
      this.count++;
      this.statusText = `addLast("${item}"): colocado no índice ${oldTail}. Novo tail = (${oldTail}+1) % ${this.capacity} = ${this.tail}. Custo: O(1) sem shift!`;
      this.updateUI();
      this.draw();
    },

    dequeue() {
      if (this.count === 0) {
        this.statusText = 'Erro: Fila vazia! Nenhum elemento para remover.';
        this.updateUI();
        return;
      }
      const removed = this.buffer[this.head];
      this.buffer[this.head] = null;
      const oldHead = this.head;
      this.head = (this.head + 1) % this.capacity;
      this.count--;
      this.statusText = `removeFirst() -> "${removed}": removido do índice ${oldHead}. Novo head = (${oldHead}+1) % ${this.capacity} = ${this.head}. Custo: O(1) sem shift!`;
      this.updateUI();
      this.draw();
    },

    reset() {
      this.buffer = ['a', 'b', 'c', null, null, null];
      this.head = 0;
      this.tail = 3;
      this.count = 3;
      this.statusText = 'Fila circular reiniciada com head=0 e tail=3.';
      this.updateUI();
      this.draw();
    },

    updateUI() {
      const statusElem = document.getElementById('queue-status');
      if (statusElem) statusElem.textContent = this.statusText;
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const cellWidth = 52;
      const cellHeight = 44;
      const startX = (width - this.capacity * cellWidth) / 2;
      const startY = height / 2 - cellHeight / 2;

      for (let i = 0; i < this.capacity; i++) {
        const x = startX + i * cellWidth;
        const val = this.buffer[i];
        const isHead = i === this.head && this.count > 0;
        const isTail = i === this.tail;

        // Fundo da célula
        if (val !== null) {
          ctx.fillStyle = dark ? '#1e3a8a' : '#dbeafe';
        } else {
          ctx.fillStyle = dark ? '#111827' : '#f8fafc';
        }

        ctx.fillRect(x, startY, cellWidth - 2, cellHeight);
        ctx.strokeStyle = dark ? '#334155' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, startY, cellWidth - 2, cellHeight);

        // Valor
        if (val !== null) {
          ctx.fillStyle = dark ? '#f8fafc' : '#0f172a';
          ctx.font = 'bold 16px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`"${val}"`, x + (cellWidth - 2) / 2, startY + cellHeight / 2);
        } else {
          ctx.fillStyle = dark ? '#475569' : '#cbd5e1';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('—', x + (cellWidth - 2) / 2, startY + cellHeight / 2);
        }

        // Marcador HEAD (topo)
        if (isHead) {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('▼ H', x + (cellWidth - 2) / 2, startY - 8);
        }

        // Marcador TAIL (fundo)
        if (isTail) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('▲ T', x + (cellWidth - 2) / 2, startY + cellHeight + 16);
        }

        // Índice
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(`[${i}]`, x + (cellWidth - 2) / 2, startY + cellHeight + 28);
      }
    }
  };

  /* ============================================================
     5. BST (ÁRVORE BINÁRIA DE PESQUISA) VISUALIZER
     ============================================================ */
  const BSTDemo = {
    canvas: null,
    treeType: 'balanced', // 'balanced' ou 'degenerate'
    highlightNode: null,
    pathTaken: [],
    statusText: 'BST pronta para busca e inserção.',
    isSearching: false,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset() {
      this.treeType = 'balanced';
      this.highlightNode = null;
      this.pathTaken = [];
      this.statusText = 'Árvore balanceada com raiz 41 carregada (altura h = 2, O(log n)).';
      this.updateUI();
      this.draw();
    },

    setTreeType(type) {
      this.treeType = type;
      this.highlightNode = null;
      this.pathTaken = [];
      if (type === 'degenerate') {
        this.statusText = 'Árvore degenerada carregada (inserção ordenada: 5, 10, 15, 20, 25). Altura h = n-1 = 4, O(n).';
      } else {
        this.statusText = 'Árvore balanceada carregada (n = 7, h = 2 = O(log n)).';
      }
      this.updateUI();
      this.draw();
    },

    search(target) {
      if (this.isSearching) return;
      const val = parseInt(target, 10) || 29;
      this.isSearching = true;
      this.pathTaken = [];

      let current = this.treeType === 'balanced' ? 41 : 5;
      const steps = [];

      if (this.treeType === 'balanced') {
        // Árvore balanceada: 41 -> (20, 65) -> (11, 29, 50, 91)
        const bstLookup = {
          41: { left: 20, right: 65 },
          20: { left: 11, right: 29 },
          65: { left: 50, right: 91 },
          11: { left: null, right: null },
          29: { left: null, right: null },
          50: { left: null, right: null },
          91: { left: null, right: null }
        };

        let curr = 41;
        while (curr !== null) {
          steps.push(curr);
          if (val === curr) break;
          if (val < curr) curr = bstLookup[curr] ? bstLookup[curr].left : null;
          else curr = bstLookup[curr] ? bstLookup[curr].right : null;
        }
      } else {
        // Degenerada: 5 -> 10 -> 15 -> 20 -> 25
        const chain = [5, 10, 15, 20, 25];
        for (const num of chain) {
          steps.push(num);
          if (num === val) break;
        }
      }

      let stepIdx = 0;
      const runStep = () => {
        if (stepIdx < steps.length) {
          const node = steps[stepIdx];
          this.highlightNode = node;
          this.pathTaken.push(node);

          if (node === val) {
            this.statusText = `Comparando ${val} com nó ${node}: ${val} == ${node} -> ENCONTRADO em ${stepIdx + 1} comparações (Custo O(h))!`;
          } else if (val < node) {
            this.statusText = `Comparando ${val} com nó ${node}: ${val} < ${node} -> Desce para a ESQUERDA.`;
          } else {
            this.statusText = `Comparando ${val} com nó ${node}: ${val} > ${node} -> Desce para a DIREITA.`;
          }

          this.updateUI();
          this.draw();
          stepIdx++;
          setTimeout(runStep, 600);
        } else {
          if (!steps.includes(val)) {
            this.statusText = `Busca por ${val} finalizada: nó nulo atingido (elemento não encontrado no custo de h comparações).`;
          }
          this.isSearching = false;
          this.updateUI();
        }
      };
      runStep();
    },

    updateUI() {
      const statusElem = document.getElementById('bst-status');
      if (statusElem) statusElem.textContent = this.statusText;
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      if (this.treeType === 'balanced') {
        const nodes = {
          41: { x: width / 2, y: 35, left: 20, right: 65 },
          20: { x: width / 2 - 90, y: 85, left: 11, right: 29 },
          65: { x: width / 2 + 90, y: 85, left: 50, right: 91 },
          11: { x: width / 2 - 130, y: 140 },
          29: { x: width / 2 - 50, y: 140 },
          50: { x: width / 2 + 50, y: 140 },
          91: { x: width / 2 + 130, y: 140 }
        };

        // Arestas
        ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 2;
        for (const [key, n] of Object.entries(nodes)) {
          if (n.left && nodes[n.left]) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[n.left].x, nodes[n.left].y);
            ctx.stroke();
          }
          if (n.right && nodes[n.right]) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[n.right].x, nodes[n.right].y);
            ctx.stroke();
          }
        }

        // Nós
        for (const [key, n] of Object.entries(nodes)) {
          const val = parseInt(key, 10);
          const isCurr = this.highlightNode === val;
          const inPath = this.pathTaken.includes(val);

          ctx.fillStyle = isCurr ? '#ef4444' : (inPath ? '#eab308' : (dark ? '#1e3a8a' : '#dbeafe'));
          ctx.beginPath();
          ctx.arc(n.x, n.y, 16, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = isCurr ? '#b91c1c' : (dark ? '#60a5fa' : '#1e3a8a');
          ctx.lineWidth = isCurr ? 2.5 : 1.5;
          ctx.stroke();

          ctx.fillStyle = isCurr || inPath ? '#ffffff' : (dark ? '#f8fafc' : '#0f172a');
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, n.x, n.y);
        }
      } else {
        // Árvore Degenerada: 5 -> 10 -> 15 -> 20 -> 25
        const chain = [5, 10, 15, 20, 25];
        const startX = width / 2 - 80;
        let startY = 25;

        for (let i = 0; i < chain.length; i++) {
          const val = chain[i];
          const x = startX + i * 35;
          const y = startY + i * 32;

          if (i < chain.length - 1) {
            ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 35, y + 32);
            ctx.stroke();
          }

          const isCurr = this.highlightNode === val;
          const inPath = this.pathTaken.includes(val);

          ctx.fillStyle = isCurr ? '#ef4444' : (inPath ? '#eab308' : (dark ? '#7f1d1d' : '#fee2e2'));
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = dark ? '#f87171' : '#b91c1c';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = isCurr || inPath ? '#ffffff' : (dark ? '#f8fafc' : '#0f172a');
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x, y);
        }
      }
    }
  };

  /* ============================================================
     6. HEAP VISUALIZERS (Inserção e Remoção Passo a Passo)
     ============================================================ */
  function drawHeapOnCanvas(canvas, heap, activeIdx, swapPair) {
    const setup = setupFixedCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;
    const dark = isDarkMode();

    ctx.clearRect(0, 0, width, height);

    const n = heap.length;
    if (n === 0) return;

    // Coordenadas dos nós da árvore (suporta até 7 nós)
    const positions = [
      { x: width / 2, y: 26 },
      { x: width / 2 - 75, y: 68 },
      { x: width / 2 + 75, y: 68 },
      { x: width / 2 - 115, y: 110 },
      { x: width / 2 - 38, y: 110 },
      { x: width / 2 + 38, y: 110 },
      { x: width / 2 + 115, y: 110 }
    ];

    // Arestas da árvore
    ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < Math.min(n, 7); i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < Math.min(n, 7)) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[left].x, positions[left].y);
        ctx.stroke();
      }
      if (right < Math.min(n, 7)) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[right].x, positions[right].y);
        ctx.stroke();
      }
    }

    // Desenha nós da árvore
    for (let i = 0; i < Math.min(n, 7); i++) {
      const { x, y } = positions[i];
      const isActive = i === activeIdx;
      const isSwapped = swapPair && swapPair.includes(i);

      if (isActive) {
        ctx.fillStyle = '#22c55e';
      } else if (isSwapped) {
        ctx.fillStyle = '#eab308';
      } else if (i === 0) {
        ctx.fillStyle = dark ? '#7f1d1d' : '#fee2e2';
      } else if (i === 1 || i === 2) {
        ctx.fillStyle = dark ? '#7c2d12' : '#ffedd5';
      } else {
        ctx.fillStyle = dark ? '#713f12' : '#fef9c3';
      }

      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = isActive ? '#15803d' : (isSwapped ? '#ca8a04' : (dark ? '#64748b' : '#94a3b8'));
      ctx.lineWidth = isActive || isSwapped ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = isActive || isSwapped ? (isActive ? '#ffffff' : '#000000') : (dark ? '#f8fafc' : '#0f172a');
      ctx.font = 'bold 12.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(heap[i], x, y);
    }

    // Vista em Array 1D no rodapé
    const cellW = 34;
    const cellH = 24;
    const startArrX = (width - n * cellW) / 2;
    const arrY = height - 32;

    ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Array:', Math.max(6, startArrX - 38), arrY + 15);

    for (let i = 0; i < n; i++) {
      const x = startArrX + i * cellW;
      const isActive = i === activeIdx;
      const isSwapped = swapPair && swapPair.includes(i);

      if (isActive) {
        ctx.fillStyle = '#22c55e';
      } else if (isSwapped) {
        ctx.fillStyle = '#eab308';
      } else {
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9';
      }

      ctx.fillRect(x, arrY, cellW - 2, cellH);
      ctx.strokeStyle = isActive ? '#15803d' : (dark ? '#475569' : '#cbd5e1');
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, arrY, cellW - 2, cellH);

      ctx.fillStyle = isActive ? '#ffffff' : (isSwapped ? '#000000' : (dark ? '#f8fafc' : '#0f172a'));
      ctx.font = 'bold 11.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(heap[i], x + cellW / 2, arrY + cellH / 2 + 1);

      ctx.fillStyle = dark ? '#64748b' : '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(i, x + cellW / 2, arrY + cellH + 9);
    }
  }

  // Heap — Inserção (Sift-Up) Passo a Passo (Slide 37)
  const HeapDemo = {
    canvas: null,
    stepIndex: 0,
    steps: [
      {
        heap: [88, 87, 73, 47, 54],
        activeIdx: -1,
        swapPair: [],
        status: 'Heap inicial: [88, 87, 73, 47, 54]. Clique em "Próximo Passo" para inserir 100.'
      },
      {
        heap: [88, 87, 73, 47, 54, 100],
        activeIdx: 5,
        swapPair: [5],
        status: 'Passo 1: Colocar 100 na próxima posição livre (índice 5): [88, 87, 73, 47, 54, 100].'
      },
      {
        heap: [88, 87, 100, 47, 54, 73],
        activeIdx: 2,
        swapPair: [2, 5],
        status: 'Passo 2: 100 > pai(5)=73? Sim ⇒ troca com 73: [88, 87, 100, 47, 54, 73].'
      },
      {
        heap: [100, 87, 88, 47, 54, 73],
        activeIdx: 0,
        swapPair: [0, 2],
        status: 'Passo 3: 100 > pai(2)=88? Sim ⇒ troca com 88: [100, 87, 88, 47, 54, 73].'
      },
      {
        heap: [100, 87, 88, 47, 54, 73],
        activeIdx: 0,
        swapPair: [],
        status: 'Passo 4: 100 é raiz ⇒ parar! Inserção concluída em O(log n).'
      }
    ],
    autoTimer: null,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
    },

    step() {
      if (this.autoTimer) {
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
      }
      if (this.stepIndex < this.steps.length - 1) {
        this.stepIndex++;
      } else {
        this.stepIndex = 0;
      }
      this.updateUI();
      this.draw();
    },

    auto() {
      if (this.autoTimer) clearTimeout(this.autoTimer);
      this.reset();
      const runNext = () => {
        if (this.stepIndex < this.steps.length - 1) {
          this.stepIndex++;
          this.updateUI();
          this.draw();
          this.autoTimer = setTimeout(runNext, 750);
        }
      };
      this.autoTimer = setTimeout(runNext, 600);
    },

    reset() {
      if (this.autoTimer) {
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
      }
      this.stepIndex = 0;
      this.updateUI();
      this.draw();
    },

    updateUI() {
      const curr = this.steps[this.stepIndex];
      const statusElem = document.getElementById('heap-status');
      if (statusElem && curr) statusElem.textContent = curr.status;
    },

    draw() {
      const curr = this.steps[this.stepIndex];
      if (!curr) return;
      drawHeapOnCanvas(this.canvas, curr.heap, curr.activeIdx, curr.swapPair);
    }
  };

  // Heap — Remoção (Extract Max) e Heapify Passo a Passo (Slide 38)
  const HeapExtractDemo = {
    canvas: null,
    stepIndex: 0,
    steps: [
      {
        heap: [100, 87, 88, 47, 54, 73],
        activeIdx: 0,
        swapPair: [],
        status: 'Heap inicial: [100, 87, 88, 47, 54, 73]. Máximo (100) na raiz. Clique em "Próximo Passo".'
      },
      {
        heap: [73, 87, 88, 47, 54],
        activeIdx: 0,
        swapPair: [0],
        status: 'Passo 1: Trocar raiz 100 com última folha 73 e remover 100: [73, 87, 88, 47, 54].'
      },
      {
        heap: [88, 87, 73, 47, 54],
        activeIdx: 2,
        swapPair: [0, 2],
        status: 'Passo 2: Heapify(0): max(73, filhos 87, 88) = 88 ⇒ troca 73 com 88: [88, 87, 73, 47, 54].'
      },
      {
        heap: [88, 87, 73, 47, 54],
        activeIdx: -1,
        swapPair: [],
        status: 'Passo 3: 73 é folha ⇒ parar! Propriedade de heap restaurada em O(log n).'
      }
    ],
    autoTimer: null,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
    },

    step() {
      if (this.autoTimer) {
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
      }
      if (this.stepIndex < this.steps.length - 1) {
        this.stepIndex++;
      } else {
        this.stepIndex = 0;
      }
      this.updateUI();
      this.draw();
    },

    auto() {
      if (this.autoTimer) clearTimeout(this.autoTimer);
      this.reset();
      const runNext = () => {
        if (this.stepIndex < this.steps.length - 1) {
          this.stepIndex++;
          this.updateUI();
          this.draw();
          this.autoTimer = setTimeout(runNext, 750);
        }
      };
      this.autoTimer = setTimeout(runNext, 600);
    },

    reset() {
      if (this.autoTimer) {
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
      }
      this.stepIndex = 0;
      this.updateUI();
      this.draw();
    },

    updateUI() {
      const curr = this.steps[this.stepIndex];
      const statusElem = document.getElementById('heap-extract-status');
      if (statusElem && curr) statusElem.textContent = curr.status;
    },

    draw() {
      const curr = this.steps[this.stepIndex];
      if (!curr) return;
      drawHeapOnCanvas(this.canvas, curr.heap, curr.activeIdx, curr.swapPair);
    }
  };

  /* ============================================================
     7. TABELA HASH COM ENCADEAMENTO (HASHING & COLISÕES)
     ============================================================ */
  const HashTableDemo = {
    canvas: null,
    m: 7, // tamanho da tabela (m=7 como no slide 48/57)
    buckets: [[], [], [], [], [], [], []],
    statusText: 'Tabela Hash pronta. Função hash: k % 7.',

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset() {
      this.m = 7;
      this.buckets = [[], [], [], [], [], [], []];
      this.statusText = 'Tabela Hash reiniciada vazia (m = 7).';
      this.updateUI();
      this.draw();
    },

    insert(key) {
      const k = parseInt(key, 10) || Math.floor(Math.random() * 90) + 10;
      const idx = k % this.m;
      this.buckets[idx].push(k);
      const isCollision = this.buckets[idx].length > 1;
      this.statusText = `Inserindo ${k}: hash(${k}) = ${k} % ${this.m} = ${idx}. ${isCollision ? 'COLISÃO! Adicionado à lista encadeada.' : 'Posição livre ocupada.'}`;
      this.updateUI();
      this.draw();
    },

    loadExercisePreset() {
      // Chaves do Exercício 4 do slide: [14, 21, 28, 35, 10]
      this.reset();
      const keys = [14, 21, 28, 35, 10];
      keys.forEach(k => {
        const idx = k % this.m;
        this.buckets[idx].push(k);
      });
      this.statusText = 'Preset do Exercício Resolvido 4 carregado: 14, 21, 28, 35 colidem no bucket 0! Pior caso O(n).';
      this.updateUI();
      this.draw();
    },

    search(key) {
      const k = parseInt(key, 10) || 35;
      const idx = k % this.m;
      const chain = this.buckets[idx];
      const pos = chain.indexOf(k);

      if (pos !== -1) {
        this.statusText = `Buscar ${k}: hash(${k}) = ${idx}. Percorrendo lista do bucket ${idx}: encontrado após ${pos + 1} comparações!`;
      } else {
        this.statusText = `Buscar ${k}: hash(${k}) = ${idx}. Não encontrado após ${chain.length} comparações na lista do bucket ${idx}.`;
      }
      this.updateUI();
      this.draw();
    },

    updateUI() {
      const statusElem = document.getElementById('hash-status');
      if (statusElem) statusElem.textContent = this.statusText;
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const rowHeight = 22;
      const startX = 25;
      const startY = 12;

      for (let i = 0; i < this.m; i++) {
        const y = startY + i * (rowHeight + 4);

        // Caixa do Bucket do Array Principal
        ctx.fillStyle = dark ? '#1e293b' : '#f1f5f9';
        ctx.fillRect(startX, y, 42, rowHeight);
        ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(startX, y, 42, rowHeight);

        // Índice
        ctx.fillStyle = dark ? '#38bdf8' : '#0284c7';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`[${i}]`, startX + 21, y + rowHeight / 2);

        // Lista Encadeada de Nós Colididos
        const chain = this.buckets[i];
        let nodeX = startX + 54;

        for (let j = 0; j < chain.length; j++) {
          // Seta de encadeamento
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(nodeX - 8, y + rowHeight / 2);
          ctx.lineTo(nodeX, y + rowHeight / 2);
          ctx.stroke();

          // Caixa do nó da lista
          const isCollided = chain.length > 1;
          ctx.fillStyle = isCollided ? (dark ? '#7f1d1d' : '#fee2e2') : (dark ? '#065f46' : '#d1fae5');
          ctx.fillRect(nodeX, y, 36, rowHeight);
          ctx.strokeStyle = isCollided ? '#ef4444' : '#10b981';
          ctx.strokeRect(nodeX, y, 36, rowHeight);

          // Valor
          ctx.fillStyle = isCollided ? (dark ? '#fca5a5' : '#991b1b') : (dark ? '#a7f3d0' : '#065f46');
          ctx.font = 'bold 11.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(chain[j], nodeX + 18, y + rowHeight / 2);

          nodeX += 46;
        }

        if (chain.length === 0) {
          ctx.fillStyle = dark ? '#475569' : '#cbd5e1';
          ctx.font = 'italic 10.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('null', nodeX - 4, y + rowHeight / 2);
        }
      }
    }
  };

  /* ============================================================
     8. EXPLORADOR COMPARATIVO DE COMPLEXIDADES
     ============================================================ */
  const ComplexityChart = {
    canvas: null,
    n: 16,
    op: 'search', // 'search', 'index', 'priority'

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.draw();
      this.updateUI();
    },

    setOp(op) {
      this.op = op;
      ['search', 'index', 'priority'].forEach(k => {
        const btn = document.getElementById(`btn-op-${k}`);
        if (btn) {
          if (k === op) {
            btn.classList.add('active');
            btn.classList.remove('btn-secondary');
          } else {
            btn.classList.remove('active');
            btn.classList.add('btn-secondary');
          }
        }
      });
      this.draw();
      this.updateUI();
    },

    setN(val) {
      this.n = Math.max(2, Math.min(128, parseInt(val, 10) || 16));
      this.draw();
      this.updateUI();
    },

    updateUI() {
      const n = this.n;
      const logVal = Math.max(1, Math.ceil(Math.log2(n)));
      const statusElem = document.getElementById('complexity-status');
      if (!statusElem) return;

      if (this.op === 'search') {
        statusElem.innerHTML = `<strong>Comparativo para BUSCAR um valor entre $n = ${n}$ itens:</strong><br>` +
          `• <strong>Tabela Hash:</strong> <strong>1</strong> cálculo de hash e acesso direto ao bucket ($O(1)$).<br>` +
          `• <strong>BST Balanceada:</strong> <strong>${logVal}</strong> comparações descendo pelos nós ($O(\\log n)$).<br>` +
          `• <strong>Array e LinkedList:</strong> até <strong>${n}</strong> comparações varrendo item por item ($O(n)$).`;
      } else if (this.op === 'index') {
        statusElem.innerHTML = `<strong>Comparativo para ACESSAR a posição $v[i]$ entre $n = ${n}$ itens:</strong><br>` +
          `• <strong>Array / ArrayList:</strong> <strong>1</strong> instrução de cálculo aritmético direto ($O(1)$).<br>` +
          `• <strong>LinkedList:</strong> até <strong>${n}</strong> nós percorridos sequencialmente a partir do head ($O(n)$).<br>` +
          `• <strong>BST / Hash:</strong> Não suportam acesso numérico por índice posicional ($0 \\dots n-1$).`;
      } else if (this.op === 'priority') {
        statusElem.innerHTML = `<strong>Comparativo para OBTER O MÁXIMO entre $n = ${n}$ itens:</strong><br>` +
          `• <strong>Heap (Consulta):</strong> <strong>1</strong> leitura direta na raiz <code>heap[0]</code> ($O(1)$).<br>` +
          `• <strong>Heap (Extração):</strong> <strong>${logVal}</strong> comparações no sift-down ($O(\\log n)$).<br>` +
          `• <strong>Array Não Ordenado:</strong> <strong>${n}</strong> comparações varrendo tudo para achar o maior ($O(n)$).`;
      }

      if (window.renderMathInElement) {
        window.renderMathInElement(statusElem, { delimiters: [{ left: '$', right: '$', display: false }] });
      }
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const n = this.n;
      const logN = Math.max(1, Math.ceil(Math.log2(n)));

      let items = [];
      let opTitle = '';

      if (this.op === 'search') {
        opTitle = `Operação: BUSCA por Valor / Chave (n = ${n})`;
        items = [
          {
            name: 'Tabela Hash (Caso Médio)',
            complexity: 'O(1)',
            steps: 1,
            stepsText: '1 cálculo de hash e acesso direto ao bucket',
            color: '#10b981'
          },
          {
            name: 'BST Balanceada',
            complexity: 'O(log n)',
            steps: logN,
            stepsText: `${logN} comparações descendo na árvore (h = ⌈log₂ n⌉)`,
            color: '#0284c7'
          },
          {
            name: 'Array / ArrayList (Não ordenado)',
            complexity: 'O(n)',
            steps: n,
            stepsText: `até ${n} comparações varrendo elemento por elemento`,
            color: '#f59e0b'
          },
          {
            name: 'LinkedList (Busca Linear)',
            complexity: 'O(n)',
            steps: n,
            stepsText: `até ${n} nós visitados sequencialmente ponteiro a ponteiro`,
            color: '#ef4444'
          }
        ];
      } else if (this.op === 'index') {
        opTitle = `Operação: ACESSO por Índice Numérico v[i] (n = ${n})`;
        items = [
          {
            name: 'Array / ArrayList',
            complexity: 'O(1)',
            steps: 1,
            stepsText: '1 instrução: base + i * tamanho (memória contígua instantânea)',
            color: '#10b981'
          },
          {
            name: 'LinkedList (Lista Encadeada)',
            complexity: 'O(n)',
            steps: n,
            stepsText: `percorre até ${n} ponteiros a partir do head até o índice i`,
            color: '#ef4444'
          },
          {
            name: 'BST / Tabela Hash',
            complexity: 'N/A',
            steps: 0,
            stepsText: 'Estruturas baseadas em chave/árvore, sem índice numérico',
            color: '#64748b'
          }
        ];
      } else if (this.op === 'priority') {
        opTitle = `Operação: OBTER / EXTRAIR O MÁXIMO (n = ${n})`;
        items = [
          {
            name: 'Heap (Consulta peek)',
            complexity: 'O(1)',
            steps: 1,
            stepsText: '1 leitura direta: o maior elemento está sempre na raiz heap[0]',
            color: '#10b981'
          },
          {
            name: 'Heap (Remoção extractMax)',
            complexity: 'O(log n)',
            steps: logN,
            stepsText: `${logN} comparações descendo no heapify para restaurar o heap`,
            color: '#0284c7'
          },
          {
            name: 'Array / LinkedList Não Ordenada',
            complexity: 'O(n)',
            steps: n,
            stepsText: `varredura completa de todos os ${n} elementos para achar o maior`,
            color: '#ef4444'
          }
        ];
      }

      const maxSteps = Math.max(1, ...items.map(i => i.steps));
      const padX = 8;
      const trackW = Math.max(80, width - padX * 2);
      const rowH = items.length === 3 ? 58 : 46;
      const startY = 20;

      // Cabeçalho da operação no canvas
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(opTitle.toUpperCase(), padX, 12);

      items.forEach((item, idx) => {
        const y = startY + idx * rowH;

        // 1. Linha superior: Nome da estrutura + complexidade e passos
        ctx.textAlign = 'left';
        ctx.fillStyle = dark ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 11.5px sans-serif';
        ctx.fillText(item.name, padX, y + 12);

        // Badge / Valor à direita
        ctx.textAlign = 'right';
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = item.color;
        const badgeText = item.steps > 0 ? `${item.complexity} : ${item.steps} op.` : item.complexity;
        ctx.fillText(badgeText, width - padX, y + 12);

        // 2. Barra de Progresso com Trilho
        const barY = y + 17;
        const barH = 11;

        // Fundo do trilho
        ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(padX, barY, trackW, barH, 4);
        ctx.fill();

        // Barra preenchida proporcional (se > 0)
        if (item.steps > 0) {
          const barW = Math.max(6, Math.min(trackW, (item.steps / maxSteps) * trackW));
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.roundRect(padX, barY, barW, barH, 4);
          ctx.fill();
        }

        // 3. Legenda explicativa concreta do que representa o passo
        ctx.textAlign = 'left';
        ctx.fillStyle = dark ? '#94a3b8' : '#475569';
        ctx.font = '9.5px sans-serif';
        ctx.fillText(`↳ ${item.stepsText}`, padX, y + 38);
      });
    }
  };

  return {
    ArrayListDemo,
    LinkedListDemo,
    StackDemo,
    QueueDemo,
    BSTDemo,
    HeapDemo,
    HeapExtractDemo,
    HashTableDemo,
    ComplexityChart
  };
})();
