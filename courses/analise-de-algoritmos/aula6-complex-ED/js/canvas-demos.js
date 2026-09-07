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
     6. HEAP (MAX-HEAP & ARRAY VIEW) VISUALIZER
     ============================================================ */
  const HeapDemo = {
    canvas: null,
    heap: [88, 87, 73, 47, 54, 6, 0],
    activeIdx: -1,
    statusText: 'Heap Máximo pronto. Maior valor sempre na raiz heap[0].',
    isBusy: false,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset() {
      this.heap = [88, 87, 73, 47, 54, 6, 0];
      this.activeIdx = -1;
      this.statusText = 'Heap restaurado para o estado inicial: [88, 87, 73, 47, 54, 6, 0].';
      this.updateUI();
      this.draw();
    },

    insert(val) {
      if (this.isBusy) return;
      if (this.heap.length >= 10) {
        this.statusText = 'Limite visual atingido (máx 10 nós). Remova o máximo antes.';
        this.updateUI();
        return;
      }
      const num = val !== undefined ? val : Math.floor(Math.random() * 50) + 50;
      this.isBusy = true;
      this.heap.push(num);
      let curr = this.heap.length - 1;
      this.activeIdx = curr;
      this.statusText = `Inserindo ${num} no final do array (índice ${curr}). Iniciando subida (sift-up: O(log n))...`;
      this.updateUI();
      this.draw();

      const siftUp = () => {
        if (curr > 0) {
          const parent = Math.floor((curr - 1) / 2);
          if (this.heap[curr] > this.heap[parent]) {
            this.statusText = `${this.heap[curr]} > pai ${this.heap[parent]} (índice ${parent}) -> Troca! Subindo...`;
            const temp = this.heap[curr];
            this.heap[curr] = this.heap[parent];
            this.heap[parent] = temp;
            curr = parent;
            this.activeIdx = curr;
            this.updateUI();
            this.draw();
            setTimeout(siftUp, 600);
            return;
          }
        }
        this.statusText = `Inserção de ${num} concluída com sucesso! Propriedade de heap restaurada em O(log n).`;
        this.activeIdx = -1;
        this.isBusy = false;
        this.updateUI();
        this.draw();
      };
      setTimeout(siftUp, 600);
    },

    extractMax() {
      if (this.isBusy || this.heap.length === 0) return;
      this.isBusy = true;
      const maxVal = this.heap[0];

      if (this.heap.length === 1) {
        this.heap.pop();
        this.statusText = `extractMax() -> ${maxVal}. Heap agora vazio.`;
        this.isBusy = false;
        this.updateUI();
        this.draw();
        return;
      }

      const lastVal = this.heap.pop();
      this.heap[0] = lastVal;
      let curr = 0;
      this.activeIdx = 0;
      this.statusText = `extractMax() -> ${maxVal}. Raiz substituída pela última folha (${lastVal}). Iniciando heapify (descida: O(log n))...`;
      this.updateUI();
      this.draw();

      const heapify = () => {
        const n = this.heap.length;
        let largest = curr;
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;

        if (left < n && this.heap[left] > this.heap[largest]) largest = left;
        if (right < n && this.heap[right] > this.heap[largest]) largest = right;

        if (largest !== curr) {
          this.statusText = `Descendo no heapify: Troca ${this.heap[curr]} com maior filho ${this.heap[largest]} (índice ${largest}).`;
          const temp = this.heap[curr];
          this.heap[curr] = this.heap[largest];
          this.heap[largest] = temp;
          curr = largest;
          this.activeIdx = curr;
          this.updateUI();
          this.draw();
          setTimeout(heapify, 600);
        } else {
          this.statusText = `Heapify concluído! Novo máximo na raiz: ${this.heap[0]}. Custo total: O(log n).`;
          this.activeIdx = -1;
          this.isBusy = false;
          this.updateUI();
          this.draw();
        }
      };
      setTimeout(heapify, 600);
    },

    updateUI() {
      const statusElem = document.getElementById('heap-status');
      if (statusElem) statusElem.textContent = this.statusText;
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const n = this.heap.length;
      if (n === 0) return;

      // Coordenadas dos nós da árvore (suporta até 7 nós facilmente)
      const positions = [
        { x: width / 2, y: 30 },
        { x: width / 2 - 80, y: 75 },
        { x: width / 2 + 80, y: 75 },
        { x: width / 2 - 120, y: 120 },
        { x: width / 2 - 40, y: 120 },
        { x: width / 2 + 40, y: 120 },
        { x: width / 2 + 120, y: 120 }
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

      // Desenha nós
      for (let i = 0; i < Math.min(n, 7); i++) {
        const { x, y } = positions[i];
        const isActive = i === this.activeIdx;

        ctx.fillStyle = isActive ? '#ef4444' : (i === 0 ? (dark ? '#7f1d1d' : '#fee2e2') : (dark ? '#1e3a8a' : '#dbeafe'));
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = isActive ? '#b91c1c' : (dark ? '#60a5fa' : '#1e3a8a');
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.fillStyle = isActive ? '#ffffff' : (dark ? '#f8fafc' : '#0f172a');
        ctx.font = 'bold 12.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.heap[i], x, y);
      }

      // Vista em Array 1D no rodapé
      const cellW = 34;
      const cellH = 26;
      const startArrX = (width - n * cellW) / 2;
      const arrY = height - 34;

      ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Array:', startArrX - 38, arrY + 16);

      for (let i = 0; i < n; i++) {
        const x = startArrX + i * cellW;
        const isActive = i === this.activeIdx;

        ctx.fillStyle = isActive ? '#ef4444' : (dark ? '#1e293b' : '#f1f5f9');
        ctx.fillRect(x, arrY, cellW - 2, cellH);
        ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
        ctx.strokeRect(x, arrY, cellW - 2, cellH);

        ctx.fillStyle = isActive ? '#ffffff' : (dark ? '#f8fafc' : '#0f172a');
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.heap[i], x + cellW / 2, arrY + cellH / 2 + 1);

        ctx.fillStyle = dark ? '#64748b' : '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(i, x + cellW / 2, arrY + cellH + 9);
      }
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

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.draw();
    },

    setN(val) {
      this.n = Math.max(1, Math.min(100, parseInt(val, 10) || 16));
      this.draw();
    },

    draw() {
      const setup = setupFixedCanvas(this.canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const n = this.n;
      const curves = [
        { label: 'O(1) - Pilha/Fila/Hash méd.', val: 1, color: '#10b981' },
        { label: 'O(log n) - BST bal./Heap', val: Math.log2(Math.max(1, n)), color: '#06b6d4' },
        { label: 'O(n) - Busca linear/Shift', val: n, color: '#f59e0b' },
        { label: 'O(n log n) - Ordenação ótima', val: n * Math.log2(Math.max(1, n)), color: '#8b5cf6' },
        { label: 'O(n²) - Loops aninhados/Pior caso', val: Math.min(120, n * n), color: '#ef4444' }
      ];

      const barHeight = 22;
      const startX = 180;
      const maxBarWidth = width - startX - 80;
      const maxVal = Math.max(...curves.map(c => c.val));

      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';

      curves.forEach((c, idx) => {
        const y = 20 + idx * 32;

        // Label
        ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b';
        ctx.fillText(c.label, 12, y + barHeight / 2 + 4);

        // Barra
        const bWidth = Math.max(4, (c.val / maxVal) * maxBarWidth);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.roundRect(startX, y, bWidth, barHeight, 4);
        ctx.fill();

        // Valor numérico
        ctx.fillStyle = dark ? '#94a3b8' : '#475569';
        ctx.font = '11.5px monospace';
        ctx.fillText(`~${Math.round(c.val)}`, startX + bWidth + 8, y + barHeight / 2 + 4);
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
    HashTableDemo,
    ComplexityChart
  };
})();
