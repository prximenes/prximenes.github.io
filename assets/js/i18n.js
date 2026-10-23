/**
 * Internationalization (i18n) Engine
 * Default: English ('en')
 * Auto-detects Portuguese ('pt') if browser language starts with 'pt' and no manual choice saved
 * Supports localStorage persistence ('site-lang') and URL query param (?lang=pt | ?lang=en)
 */

(function () {
    const translations = {
        en: {
            // Navigation
            "nav.about": "About",
            "nav.courses": "Courses",
            "nav.news": "News",
            "nav.publications": "Publications",
            "nav.teaching_hub": "📚 Teaching Hub",
            "nav.back_home": "← Back to Home",
            "nav.back_courses": "← Back to Courses Hub",

            // Sidebar & Profile
            "sidebar.name": "Pedro Rafael",
            "sidebar.title": "Professor of Computer Science",
            "sidebar.affil": "<strong>Universidade Católica de Pernambuco (UNICAP)</strong><br>Ph.D. Candidate @ <strong>UFPE (CIn)</strong>",
            "sidebar.location": "Recife, PE — Brazil",
            "sidebar.courses_btn": "Courses & Materials",
            "sidebar.topics_title": "Research Topics",

            // Homepage - About
            "about.title": "About Me",
            "about.p1": "I am a <strong>Professor of Computer Science</strong> at the <strong>Universidade Católica de Pernambuco (UNICAP)</strong> and a <strong>Ph.D. Candidate in Computer Science</strong> at the Informatics Center of <strong>Universidade Federal de Pernambuco (CIn-UFPE)</strong>.",
            "about.p2": "I hold a B.Sc. in Computer Engineering and an M.Sc. in Computer Science with an emphasis on Networks and Distributed Systems. My research investigates <strong>Large Language Models (LLMs) for Automated Root Cause Analysis (RCA) in Network Virtualization</strong>, <strong>Computer Networks</strong>, <strong>Task Offloading</strong>, <strong>Digital Twin Networks</strong>, <strong>Optimization</strong>, <strong>Linux Kernel & Fast Packet Processing</strong>, and <strong>Cloud/Edge Virtualization</strong>, with extensive application in <strong>Machine Learning</strong> and <strong>Data Science</strong>.",

            // Homepage - Featured Courses
            "courses.section_title": "Featured Courses & Teaching",
            "courses.view_all": "View all courses →",
            "courses.badge_undergrad": "UNICAP • Undergraduate",
            "courses.cg_title": "🎨 Computer Graphics",
            "courses.cg_desc": "Vector spaces, 3x3 and 4x4 homogeneous matrices, 2D/3D geometric transformations, change of basis, projections, and real-time Canvas/WebGL pipelines with Three.js.",
            "courses.cg_cta": "View Course & Lectures →",
            "courses.aa_title": "⚡ Analysis of Algorithms",
            "courses.aa_desc": "Asymptotic complexity (Big-O, Ω, Θ), iterative analysis, Master Theorem for recursive algorithms, and computational tractability (P and NP classes).",
            "courses.aa_cta": "View Course & Lectures →",
            "courses.as_title": "🌐 Systems Architecture",
            "courses.as_desc": "Distributed systems architectural models, structured naming & DNS, microservices decomposition, and Docker container orchestration.",
            "courses.as_cta": "View Course & Lectures →",

            // Homepage - News
            "news.title": "News & Updates",
            "news.sbrc_2026": "🏆 Paper <a href=\"https://scholar.google.com.br/citations?view_op=view_citation&hl=en&user=CsC6auoAAAAJ&sortby=pubdate&citation_for_view=CsC6auoAAAAJ:YOwf2qJgpHMC\" target=\"_blank\" rel=\"noopener noreferrer\">On the Limits of Automated Root Cause Analysis in Network Virtualization Scenarios using Language Models</a> was <strong>nominated for the Best Paper Award</strong> at the <em>Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos (SBRC 2026)</em>!",
            "news.preprints_2026": "New preprints on <em>Digital Twin Synchronization: towards a data-centric architecture</em> and comparative TSN performance evaluations.",
            "news.bracis_2025": "Presented paper on <em>Deep Learning-Based Intrusion Detection for Automotive Ethernet</em> at the Brazilian Conference on Intelligent Systems (BRACIS).",
            "news.jnca_2024": "Comprehensive survey <em>Living on the edge: A survey of digital twin-assisted task offloading in safety-critical environments</em> published in <strong>Journal of Network and Computer Applications (JNCA)</strong>.",

            // Homepage - Publications
            "publications.title": "Selected Publications",
            "publications.scholar_link": "Full Google Scholar (240+ citations) →",
            "publications.best_paper": "🏆 Best Paper Nominee",
            "publications.cites": "Citations",

            // Hub Page (courses.html)
            "hub.title": "📚 Courses & Teaching Materials",
            "hub.subtitle": "Universidade Católica de Pernambuco (UNICAP)",
            "hub.intro": "Lecture notes, interactive slide decks, and academic resources prepared for undergraduate and graduate computer science courses.",
            "hub.pill_cg": "🎨 Computer Graphics",
            "hub.pill_aa": "⚡ Analysis of Algorithms",
            "hub.pill_as": "🌐 Systems Architecture",
            "hub.open_dedicated": "📂 Open Dedicated Course Page →",
            "hub.copy_link": "Copy Link",
            "hub.copied": "✓ Copied!",
            "hub.share_alert": "Course link copied to clipboard!",

            // Course Descriptions
            "desc.cg": "Fundamental principles of 2D and 3D computer graphics, vector representations, homogeneous transformation matrices, projections, rasterization, and real-time graphics pipelines.",
            "desc.aa": "Asymptotic time and space complexity analysis, Big-O / Big-Omega / Big-Theta notation, recurrence relations (Master Theorem), algorithmic design paradigms (divide-and-conquer, greedy methods, dynamic programming), and graph algorithms.",
            "desc.as": "Architectural models for distributed systems, structured and flat naming, Distributed Hash Tables (DHTs), Domain Name System (DNS), microservices architecture, and Docker container orchestration.",

            // Common Material Buttons & Badges
            "badge.interactive": "Interactive Lecture",
            "badge.slide_viewer": "Slide Presentation",
            "btn.open_interactive": "▶ Open Interactive Presentation",
            "btn.open_viewer": "▶ Open Slide Viewer",
            "btn.download_pdf": "📄 Download PDF",
            "btn.download_pdf_slides": "📄 Download PDF (Slides)",
            "btn.project_guidelines": "📋 Project Guidelines (PDF)",
            "btn.interactive_demo": "📊 Interactive Graph (Slide 16)",
            "btn.lab_practice": "🧪 Lab Practice (GitHub)",
            "btn.complement_np": "📚 NP-Completeness (Complement)",

            // Footer & Theme
            "footer.copyright": "© 2026 Pedro Rafael Ximenes. All rights reserved. • Hosted on GitHub Pages",
            "theme.dark": "🌙 Dark Mode",
            "theme.light": "☀️ Light Mode",
            "lang.toggle": "🌐 PT"
        },
        pt: {
            // Navigation
            "nav.about": "Sobre",
            "nav.courses": "Disciplinas",
            "nav.news": "Notícias",
            "nav.publications": "Publicações",
            "nav.teaching_hub": "📚 Central de Aulas",
            "nav.back_home": "← Voltar ao Início",
            "nav.back_courses": "← Voltar às Disciplinas",

            // Sidebar & Profile
            "sidebar.name": "Pedro Rafael",
            "sidebar.title": "Professor de Ciência da Computação",
            "sidebar.affil": "<strong>Universidade Católica de Pernambuco (UNICAP)</strong><br>Doutorando @ <strong>UFPE (CIn)</strong>",
            "sidebar.location": "Recife, PE — Brasil",
            "sidebar.courses_btn": "Disciplinas & Materiais",
            "sidebar.topics_title": "Tópicos de Pesquisa",

            // Homepage - About
            "about.title": "Sobre Mim",
            "about.p1": "Sou <strong>Professor de Ciência da Computação</strong> na <strong>Universidade Católica de Pernambuco (UNICAP)</strong> e <strong>Doutorando em Ciência da Computação</strong> no Centro de Informática da <strong>Universidade Federal de Pernambuco (CIn-UFPE)</strong>.",
            "about.p2": "Possuo graduação em Engenharia da Computação e mestrado em Ciência da Computação com ênfase em Redes e Sistemas Distribuídos. Minha pesquisa investiga <strong>Modelos de Linguagem de Grande Porte (LLMs) para Análise de Causa Raiz (RCA) Automatizada em Virtualização de Redes</strong>, <strong>Redes de Computadores</strong>, <strong>Task Offloading</strong>, <strong>Gêmeos Digitais em Redes</strong>, <strong>Otimização</strong>, <strong>Kernel Linux & Processamento Rápido de Pacotes</strong> e <strong>Virtualização em Nuvem e Borda</strong>, com ampla aplicação em <strong>Machine Learning</strong> e <strong>Ciência de Dados</strong>.",

            // Homepage - Featured Courses
            "courses.section_title": "Disciplinas & Ensino em Destaque",
            "courses.view_all": "Ver todas as disciplinas →",
            "courses.badge_undergrad": "UNICAP • Graduação",
            "courses.cg_title": "🎨 Computação Gráfica",
            "courses.cg_desc": "Espaços vetoriais, matrizes homogêneas 3x3 e 4x4, transformações geométricas 2D/3D, mudança de base, projeções e pipelines gráficos interativos com Canvas, WebGL e Three.js.",
            "courses.cg_cta": "Acessar Disciplina e Aulas →",
            "courses.aa_title": "⚡ Análise de Algoritmos",
            "courses.aa_desc": "Complexidade assintótica (Big-O, Ω, Θ), análise iterativa, Teorema Mestre para algoritmos recursivos, tratabilidade computacional e classes P vs NP.",
            "courses.aa_cta": "Acessar Disciplina e Aulas →",
            "courses.as_title": "🌐 Arquitetura de Sistemas",
            "courses.as_desc": "Modelos arquiteturais de sistemas distribuídos, nomeação estruturada e DNS, decomposição em microsserviços e orquestração de containers com Docker.",
            "courses.as_cta": "Acessar Disciplina e Aulas →",

            // Homepage - News
            "news.title": "Notícias & Atualizações",
            "news.sbrc_2026": "🏆 O artigo <a href=\"https://scholar.google.com.br/citations?view_op=view_citation&hl=pt-BR&user=CsC6auoAAAAJ&sortby=pubdate&citation_for_view=CsC6auoAAAAJ:YOwf2qJgpHMC\" target=\"_blank\" rel=\"noopener noreferrer\">On the Limits of Automated Root Cause Analysis in Network Virtualization Scenarios using Language Models</a> foi <strong>indicado ao Prêmio de Melhor Artigo</strong> no <em>Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos (SBRC 2026)</em>!",
            "news.preprints_2026": "Novos preprints sobre <em>Digital Twin Synchronization: towards a data-centric architecture</em> e avaliações de desempenho comparativo em TSN.",
            "news.bracis_2025": "Apresentação de artigo sobre <em>Detecção de Intrusão Baseada em Deep Learning para Ethernet Automotiva</em> na Brazilian Conference on Intelligent Systems (BRACIS).",
            "news.jnca_2024": "Survey abrangente <em>Living on the edge: A survey of digital twin-assisted task offloading in safety-critical environments</em> publicado no periódico <strong>Journal of Network and Computer Applications (JNCA)</strong>.",

            // Homepage - Publications
            "publications.title": "Publicações Selecionadas",
            "publications.scholar_link": "Google Scholar Completo (240+ citações) →",
            "publications.best_paper": "🏆 Indicado a Melhor Artigo",
            "publications.cites": "Citações",

            // Hub Page (courses.html)
            "hub.title": "📚 Disciplinas & Materiais Didáticos",
            "hub.subtitle": "Universidade Católica de Pernambuco (UNICAP)",
            "hub.intro": "Notas de aula, apresentações interativas de slides e recursos acadêmicos preparados para disciplinas de graduação em ciência da computação e engenharias.",
            "hub.pill_cg": "🎨 Computação Gráfica",
            "hub.pill_aa": "⚡ Análise de Algoritmos",
            "hub.pill_as": "🌐 Arquitetura de Sistemas",
            "hub.open_dedicated": "📂 Abrir Página da Disciplina →",
            "hub.copy_link": "Copiar Link",
            "hub.copied": "✓ Copiado!",
            "hub.share_alert": "Link da disciplina copiado para a área de transferência!",

            // Course Descriptions
            "desc.cg": "Princípios fundamentais de computação gráfica 2D e 3D, representações vetoriais, matrizes de transformação homogêneas, projeções, rasterização e pipelines gráficos em tempo real.",
            "desc.aa": "Análise de complexidade temporal e espacial assintótica, notações Big-O / Big-Omega / Big-Theta, relações de recorrência (Teorema Mestre), paradigmas de projeto de algoritmos e algoritmos em grafos.",
            "desc.as": "Modelos arquiteturais para sistemas distribuídos, nomeação estruturada e plana, Distributed Hash Tables (DHTs), Domain Name System (DNS), arquitetura de microsserviços e orquestração com Docker.",

            // Common Material Buttons & Badges
            "badge.interactive": "Aula Interativa",
            "badge.slide_viewer": "Apresentação de Slides",
            "btn.open_interactive": "▶ Abrir Apresentação Interativa",
            "btn.open_viewer": "▶ Abrir Visualizador de Slides",
            "btn.download_pdf": "📄 Baixar PDF",
            "btn.download_pdf_slides": "📄 Baixar PDF (Slides)",
            "btn.project_guidelines": "📋 Diretrizes do Projeto (PDF)",
            "btn.interactive_demo": "📊 Gráfico Interativo (Slide 16)",
            "btn.lab_practice": "🧪 Prática de Laboratório (GitHub)",
            "btn.complement_np": "📚 NP-Completude (Complemento)",

            // Footer & Theme
            "footer.copyright": "© 2026 Pedro Rafael Ximenes. Todos os direitos reservados. • Hospedado no GitHub Pages",
            "theme.dark": "🌙 Modo Escuro",
            "theme.light": "☀️ Modo Claro",
            "lang.toggle": "🌐 EN"
        }
    };

    function detectInitialLanguage() {
        // 1. Check URL query param ?lang=pt or ?lang=en
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && (urlLang === 'pt' || urlLang === 'en')) {
            localStorage.setItem('site-lang', urlLang);
            return urlLang;
        }

        // 2. Check saved user preference in localStorage
        const savedLang = localStorage.getItem('site-lang');
        if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
            return savedLang;
        }

        // 3. Check browser language (default to 'pt' if browser is pt, otherwise 'en')
        const browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        if (browserLang.toLowerCase().startsWith('pt')) {
            return 'pt';
        }

        return 'en';
    }

    let currentLang = detectInitialLanguage();

    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

        const dict = translations[lang] || translations.en;

        // Update all textContent elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Update all innerHTML elements with data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });

        // Update elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            if (dict[key]) {
                el.setAttribute('title', dict[key]);
            }
        });

        // Update segmented language switcher active state
        document.querySelectorAll('.lang-switcher .lang-btn').forEach((btn) => {
            const targetLang = btn.getAttribute('data-lang');
            if (targetLang === lang) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Update legacy single language toggle button if present
        const langToggleBtn = document.getElementById('lang-toggle-button');
        if (langToggleBtn) {
            langToggleBtn.innerHTML = dict["lang.toggle"];
            langToggleBtn.setAttribute('title', lang === 'pt' ? 'Switch to English' : 'Mudar para Português');
            langToggleBtn.setAttribute('aria-label', lang === 'pt' ? 'Switch to English' : 'Mudar para Português');
        }

        // Sync theme button text if theme script is loaded
        if (window.updateThemeButtonText) {
            window.updateThemeButtonText();
        }
    }

    // Expose helpers globally
    window.getCurrentLanguage = function () {
        return currentLang;
    };

    window.switchLanguage = function (lang) {
        if (lang !== 'pt' && lang !== 'en') return;
        localStorage.setItem('site-lang', lang);
        applyLanguage(lang);
    };

    window.toggleLanguage = function () {
        const nextLang = currentLang === 'en' ? 'pt' : 'en';
        window.switchLanguage(nextLang);
    };

    // Initialize when DOM is ready or immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyLanguage(currentLang);
            setupToggleListener();
        });
    } else {
        applyLanguage(currentLang);
        setupToggleListener();
    }

    function setupToggleListener() {
        document.querySelectorAll('.lang-switcher').forEach((switcher) => {
            switcher.addEventListener('click', (e) => {
                const btn = e.target.closest('.lang-btn');
                if (btn) {
                    const targetLang = btn.getAttribute('data-lang');
                    if (targetLang) {
                        window.switchLanguage(targetLang);
                    }
                } else {
                    window.toggleLanguage();
                }
            });
        });

        const langToggleBtn = document.getElementById('lang-toggle-button');
        if (langToggleBtn) {
            langToggleBtn.removeEventListener('click', window.toggleLanguage);
            langToggleBtn.addEventListener('click', window.toggleLanguage);
        }
    }
})();
