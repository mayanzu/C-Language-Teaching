/**
 * C语言教程讲义 - 公共脚本
 * 
 * 包含以下功能：
 * 1. 代码块复制按钮
 * 2. 导航栏滚动高亮
 * 3. 阅读进度条
 * 4. 交互式知识点可视化
 */

document.addEventListener('DOMContentLoaded', function () {
    function updateScrollProgress() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0
            ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
            : 0;

        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
    }

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    /* ============================================
       1. 代码块复制按钮
       - 自动为每个 .code-block 添加复制按钮
       ============================================ */
    const codeBlocks = document.querySelectorAll('.code-block');

    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            return document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        return fallbackCopy(text);
    }

    codeBlocks.forEach(function (block) {
        const title = block.querySelector('.code-block-title');
        if (title) {
            if (title.querySelector('.copy-button')) {
                return;
            }

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.type = 'button';
            copyButton.title = '复制代码';
            copyButton.setAttribute('aria-label', '复制代码');

            copyButton.addEventListener('click', async function () {
                const code = block.querySelector('code');
                if (code) {
                    const textToCopy = code.textContent.trimEnd();

                    try {
                        const successful = await copyText(textToCopy);
                        if (successful) {
                            copyButton.classList.add('copied');
                            setTimeout(function () {
                                copyButton.classList.remove('copied');
                            }, 2000);
                        }
                    } catch (err) {
                        // 复制失败时不设置 textContent，由 CSS ::before 控制
                    }
                }
            });

            title.appendChild(copyButton);
        }
    });


    /* ============================================
       2. 导航栏滚动高亮
       - 点击导航时更新高亮
       - 滚动时自动高亮对应章节
       ============================================ */
    const navLinks = document.querySelectorAll('.tutorial-nav a');
    const sections = document.querySelectorAll('.section');

    function setActiveSection(id) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });

        sections.forEach(section => {
            section.classList.toggle('is-current', section.getAttribute('id') === id);
        });
    }

    // 点击导航链接时更新高亮
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            const id = this.getAttribute('href').replace('#', '');
            setActiveSection(id);
        });
    });

    // 滚动时自动高亮对应章节
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                setActiveSection(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    if (sections.length > 0) {
        setActiveSection(sections[0].getAttribute('id'));
    }

    /* ============================================
       2.5 可视化首次出现引导
       - 首次滚动到可视化组件时添加高亮动画
       - 自动播放首轮，引导用户理解交互方式
       ============================================ */
    (function initFirstSeenGuidance() {
        const seenVisuals = new Set();
        const visualObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const visual = entry.target;
                if (seenVisuals.has(visual)) return;
                seenVisuals.add(visual);

                visual.classList.add('is-first-seen');
                setTimeout(() => visual.classList.remove('is-first-seen'), 800);

                const host = visual.querySelector('[data-visual-host]');
                if (!host || !host.children.length) return;

                const playButton = visual.querySelector('[data-action="play"]');
                if (playButton && !playButton.disabled) {
                    playButton.classList.add('is-pulse-guide');
                    setTimeout(() => playButton.classList.remove('is-pulse-guide'), 5000);
                    setTimeout(() => {
                        if (playButton.isConnected) playButton.click();
                    }, 600);
                }

                visualObserver.unobserve(visual);
            });
        }, { threshold: 0.25 });

        document.querySelectorAll('.interactive-visual').forEach(visual => {
            visualObserver.observe(visual);
        });
    })();

    /* ============================================
       3. 交互式知识点可视化
       - 通过 data-visual 自动渲染动画组件
       ============================================ */
    function toBits(value) {
        const normalized = Number(value) & 255;
        return normalized.toString(2).padStart(8, '0').split('').map(Number);
    }

    function formatBinary(value) {
        return (Number(value) & 255).toString(2).padStart(8, '0');
    }

    function createButton(label, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className || 'iv-button';
        button.textContent = label;
        return button;
    }

    function renderCode(lines, activeIndex) {
        return lines.map((line, index) => {
            let highlighted = line;
            // 1. 转义裸 &（如 &a）→ &amp;，但保留已是实体的 &lt; &gt; &amp; &#NN; 等
            highlighted = highlighted.replace(/&(?!(?:[a-z]{2,}|#\d+);)/g, '&amp;');
            // 2. 注释（// ...）
            highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="c-comment">$1</span>');
            // 3. 关键字
            highlighted = highlighted.replace(/\b(int|char|double|float|void|return|if|else|for|while|struct|sizeof|NULL)\b/g, '<span class="c-keyword">$1</span>');
            // 4. 函数名
            highlighted = highlighted.replace(/\b(printf|scanf|malloc|free|main)(?=\s*\()/g, '<span class="c-function">$1</span>');
            // 5. 字符字面量 'X'（支持转义字符）
            highlighted = highlighted.replace(/('(?:\\[\\'nt0]|[^'\\])')/g, '<span class="c-string">$1</span>');
            // 6. 独立数字
            highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="c-number">$1</span>');
            return `<div class="iv-code-line${index === activeIndex ? ' is-active' : ''}" data-line="${index + 1}"><span class="iv-code-text">${highlighted}</span></div>`;
        }).join('');
    }

    function renderProgress(current, total) {
        const percent = total <= 1 ? 100 : (current / (total - 1)) * 100;
        return `<div class="iv-progress" style="--iv-progress:${percent}%"><span></span></div>`;
    }

    const playbackSpeeds = [
        { key: 'slow', label: '慢速', factor: 1.45 },
        { key: 'normal', label: '标准', factor: 1 },
        { key: 'fast', label: '快速', factor: 0.68 }
    ];

    function getPlaybackDelay(baseDelay, speed) {
        const option = playbackSpeeds.find(item => item.key === speed) || playbackSpeeds[1];
        return Math.round(baseDelay * option.factor);
    }

    function renderStepBadge(current, total, label) {
        return `<div class="iv-step-badge" aria-label="当前演示进度">第 ${Math.min(current + 1, total)} / ${total} ${label || '步'}</div>`;
    }

    function renderTeachingNote(text) {
        return `<div class="iv-teaching-note">${text}</div>`;
    }

    function renderPlaybackSpeed(speed) {
        return `<div class="iv-control-group iv-speed-control" aria-label="播放速度">
            ${playbackSpeeds.map(item => `<button class="iv-tab${item.key === speed ? ' is-active' : ''}" data-speed="${item.key}">${item.label}</button>`).join('')}
        </div>`;
    }

    function bindPlaybackSpeed(host, onChange) {
        host.querySelectorAll('[data-speed]').forEach(button => {
            button.addEventListener('click', () => onChange(button.getAttribute('data-speed')));
        });
    }

    function renderMemoryCard(options) {
        const classes = ['iv-memory-card'];
        if (options.kind) classes.push(`is-${options.kind}`);
        if (options.active) classes.push('is-active');
        if (options.hot) classes.push('is-hot');
        if (options.invalid) classes.push('is-invalid');

        return `<div class="${classes.join(' ')}">
            <div class="iv-memory-title">${options.title}</div>
            <strong class="iv-memory-value">${options.value}</strong>
            <div class="iv-memory-meta">${options.meta}</div>
        </div>`;
    }

    function initTimelineVisual(element, renderer, stepsLength) {
        const host = element.querySelector('[data-visual-host]') || element;
        let step = 0;
        let timer = null;
        let speed = 'normal';

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function setStep(nextStep) {
            step = Math.max(0, Math.min(stepsLength - 1, nextStep));
            draw();
        }

        function play() {
            stop();
            timer = setInterval(() => {
                if (step >= stepsLength - 1) {
                    stop();
                    return;
                }
                setStep(step + 1);
            }, getPlaybackDelay(900, speed));
        }

        function draw() {
            host.innerHTML = renderer(step, {
                progress: `${renderProgress(step, stepsLength)}${renderStepBadge(step, stepsLength)}${renderPlaybackSpeed(speed)}`,
            });

            const prevButton = host.querySelector('[data-action="prev"]');
            const nextButton = host.querySelector('[data-action="next"]');
            const playButton = host.querySelector('[data-action="play"]');
            if (playButton && !host.querySelector('[data-action="pause"]')) {
                playButton.insertAdjacentHTML('afterend', '<button class="iv-button" data-action="pause">暂停</button>');
            }
            const pauseButton = host.querySelector('[data-action="pause"]');
            const resetButton = host.querySelector('[data-action="reset"]');

            if (prevButton) prevButton.addEventListener('click', () => { stop(); setStep(step - 1); });
            if (nextButton) nextButton.addEventListener('click', () => { stop(); setStep(step + 1); });
            if (playButton) playButton.addEventListener('click', play);
            if (pauseButton) pauseButton.addEventListener('click', stop);
            if (resetButton) resetButton.addEventListener('click', () => { stop(); setStep(0); });
            bindPlaybackSpeed(host, nextSpeed => {
                speed = nextSpeed;
                stop();
                draw();
            });
        }

        draw();
    }

    function initCompilePipeline(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const scenarios = {
            success: {
                label: '成功运行',
                tone: 'green',
                artifact: 'hello.exe',
                output: 'Hello, C!',
                steps: [
                    { phase: 'source', line: 0, title: '源代码', file: 'hello.c', state: 'ready', text: '第一步：编写人类能读懂的 C 代码，保存为 .c 源文件。此时还只是一段文本，CPU 不认识。' },
                    { phase: 'compile', line: 1, title: '编译', file: 'hello.obj', state: 'ready', text: '第二步：编译器检查语法，将 C 语句翻译成机器指令片段，生成 .obj 目标文件。如果语法有错，编译就此卡住。' },
                    { phase: 'link', line: 2, title: '链接', file: 'hello.exe', state: 'ready', text: '第三步：链接器把目标文件和 printf 所在的库文件拼接成完整的 .exe 可执行程序。' },
                    { phase: 'load', line: 3, title: '加载', file: '内存', state: 'ready', text: '第四步：操作系统把 .exe 加载到内存，准备好 CPU 运行所需的一切。' },
                    { phase: 'run', line: 4, title: '运行', file: '控制台', state: 'ready', text: '第五步：CPU 从入口开始逐条执行指令，最终在控制台输出 "Hello, C!"。' }
                ]
            },
            compileError: {
                label: '编译错误',
                tone: 'red',
                artifact: '未生成',
                output: 'error: expected ;',
                steps: [
                    { phase: 'source', line: 0, title: '源代码', file: 'hello.c', state: 'ready', text: '源文件写好了，但有一行末尾漏掉了分号——C 语言用分号来分隔语句，少一个都不行。' },
                    { phase: 'compile', line: 1, title: '编译', file: '错误信息', state: 'error', text: '编译器扫描到语法错误，无法生成目标文件。看错误提示里的行号，回到源代码那一行修正就好。' },
                    { phase: 'link', line: 2, title: '链接', file: '跳过', state: 'blocked', text: '没有 .obj 目标文件，链接无法进行。编译错误是第一步关卡，必须先修好才能继续。' },
                    { phase: 'load', line: 3, title: '加载', file: '跳过', state: 'blocked', text: '可执行文件根本没生成，操作系统没有程序可加载。修好编译错误是唯一的出路。' }
                ]
            },
            linkError: {
                label: '链接错误',
                tone: 'amber',
                artifact: '未生成',
                output: 'unresolved symbol',
                steps: [
                    { phase: 'source', line: 0, title: '源代码', file: 'main.c', state: 'ready', text: '代码语法正确，编译能通过。但比如你声明了一个函数却忘了写它的实现，链接时就找不到它了。' },
                    { phase: 'compile', line: 1, title: '编译', file: 'main.obj', state: 'ready', text: '单独编译通过，说明语法没问题。编译只检查单个文件内部，不关心外部函数在哪。' },
                    { phase: 'link', line: 2, title: '链接', file: '错误信息', state: 'error', text: '链接器在拼接时找不到某个函数的具体实现。常见原因：忘了写函数体、少加了源文件、库没配置对。' },
                    { phase: 'load', line: 3, title: '加载', file: '跳过', state: 'blocked', text: '链接失败 = 没有可执行文件，自然无法运行。解决办法是补上缺少的函数定义或源文件。' }
                ]
            },
            runtimeError: {
                label: '运行时错误',
                tone: 'red',
                artifact: 'app.exe',
                output: '除以零 / 越界',
                steps: [
                    { phase: 'source', line: 0, title: '源代码', file: 'app.c', state: 'ready', text: '代码语法和链接都没问题，程序可以跑起来——但这不代表逻辑一定正确。' },
                    { phase: 'compile', line: 1, title: '编译', file: 'app.obj', state: 'ready', text: '编译器只检查语法和类型配对，无法预知运行时会发生什么（比如用户输入了 0 做除数）。' },
                    { phase: 'link', line: 2, title: '链接', file: 'app.exe', state: 'ready', text: '链接顺利通过，.exe 文件已生成，双击就能运行。' },
                    { phase: 'run', line: 4, title: '运行', file: '中断', state: 'error', text: '程序跑到一半崩了——可能是除以零、数组越界、空指针。这类错误最难找，需要逐行排查变量值和执行路径。' }
                ]
            }
        };
        const lanes = [
            { key: 'source', label: '编写', detail: '.c 源文件' },
            { key: 'compile', label: '编译', detail: '.obj 目标文件' },
            { key: 'link', label: '链接', detail: '.exe 可执行文件' },
            { key: 'load', label: '加载', detail: '进入内存' },
            { key: 'run', label: '运行', detail: 'CPU 执行' }
        ];
        let key = element.getAttribute('data-scenario') || 'success';
        let visual;

        function createVisual() {
            const scenario = scenarios[key] || scenarios.success;
            visual = initSteppedVisual({
                host,
                playLabel: '播放流程',
                interval: 940,
                getLength: () => scenario.steps.length,
                render(step, helpers) {
                    const current = scenario.steps[step];
                    const currentIndex = lanes.findIndex(item => item.key === current.phase);
                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            ${helpers.controls}
                            <div class="iv-control-group">
                                ${Object.entries(scenarios).map(([scenarioKey, item]) => `<button class="iv-tab${scenarioKey === key ? ' is-active' : ''}" data-scenario="${scenarioKey}">${item.label}</button>`).join('')}
                            </div>
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage is-wide">
                            <div class="iv-panel">
                                <div class="iv-algo-head">
                                    <strong>程序构建流水线</strong>
                                    <span>${scenario.label} · 当前产物 ${scenario.artifact}</span>
                                </div>
                                <div class="iv-pipeline" aria-label="程序从源代码到运行的流程">
                                    ${lanes.map((lane, index) => {
                                        const isPast = index < currentIndex;
                                        const isActive = lane.key === current.phase;
                                        const state = isActive ? current.state : isPast ? 'done' : 'waiting';
                                        return `<div class="iv-pipeline-card is-${state}${isActive ? ' is-active' : ''}">
                                            <span>${lane.label}</span>
                                            <strong>${isActive ? current.file : lane.detail}</strong>
                                            <em>${isPast ? '已完成' : isActive ? current.title : '等待'}</em>
                                        </div>`;
                                    }).join('')}
                                </div>
                                ${renderVariableStrip([
                                    { label: '阶段', value: current.title, hot: true },
                                    { label: '文件/结果', value: current.file },
                                    { label: '最终输出', value: scenario.output }
                                ])}
                                ${renderTeachingNote('试试切换不同场景，观察错误分别卡在编译、链接还是运行阶段。学会判断"错误发生在哪一步"是调试的关键技能。')}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind() {
                    host.querySelectorAll('[data-scenario]').forEach(button => {
                        button.addEventListener('click', () => {
                            if (visual) visual.stop();
                            key = button.getAttribute('data-scenario');
                            createVisual();
                            visual.draw();
                        });
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function initBinaryWeights(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        let value = Math.max(0, Math.min(255, Number(element.getAttribute('data-value') || 13)));
        let step = 0;
        let timer = null;
        let speed = 'normal';
        const weights = [128, 64, 32, 16, 8, 4, 2, 1];

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function setStep(nextStep) {
            step = Math.max(0, Math.min(7, nextStep));
            draw();
        }

        function sumThrough(bits, activeUntil) {
            return bits.reduce((sum, bit, index) => index <= activeUntil && bit ? sum + weights[index] : sum, 0);
        }

        function draw() {
            const bits = toBits(value);
            const partial = sumThrough(bits, step);
            host.innerHTML = `<div class="iv-shell">
                <div class="iv-control-bar">
                    <label class="iv-field">十进制值
                        <input type="range" min="0" max="255" value="${value}" data-role="binary-value">
                        <input type="number" min="0" max="255" value="${value}" data-role="binary-number">
                    </label>
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev"${step === 0 ? ' disabled' : ''}>上一位</button>
                        <button class="iv-button is-primary" data-action="play">播放位权</button>
                        <button class="iv-button" data-action="pause">暂停</button>
                        <button class="iv-button" data-action="next"${step === 7 ? ' disabled' : ''}>下一位</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${renderPlaybackSpeed(speed)}
                    ${renderStepBadge(step, 8, '位')}
                </div>
                <div class="iv-stage is-wide">
                    <div class="iv-panel">
                        <div class="iv-algo-head">
                            <strong>${value} 的二进制表示</strong>
                            <span>${formatBinary(value)} · 当前累计 ${partial}</span>
                        </div>
                        <div class="iv-weight-board">
                            ${bits.map((bit, index) => {
                                const isActive = index === step;
                                const isDone = index < step;
                                return `<button class="iv-weight-cell${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}${bit ? ' is-one' : ''}" data-bit-index="${index}">
                                    <span>2<sup>${7 - index}</sup></span>
                                    <strong>${bit}</strong>
                                    <em>${bit ? `+${weights[index]}` : '+0'}</em>
                                </button>`;
                            }).join('')}
                        </div>
                        ${renderVariableStrip([
                            { label: '二进制', value: formatBinary(value), hot: true },
                            { label: '当前位权', value: weights[step] },
                            { label: '累计值', value: partial }
                        ])}
                        ${renderTeachingNote('点击每一位观察：该位是 1 就加上对应的位权值，是 0 就加 0。8 位全部处理完就得到了十进制结果。')}
                    </div>
                </div>
                <div class="iv-status" aria-live="polite">第 ${step + 1} 位（位权 ${weights[step]}）：这一位是 <strong>${bits[step]}</strong> → 贡献 ${bits[step] ? weights[step] : 0}。累计到当前位得到 ${partial}。${bits[step] ? `<span class="iv-teaching-note" style="display:inline;margin:0 0 0 8px;">位是 1，加上 ${weights[step]}</span>` : `<span class="iv-teaching-note" style="display:inline;margin:0 0 0 8px;">位是 0，不累加</span>`}</div>
            </div>`;

            const applyValue = nextValue => {
                value = Math.max(0, Math.min(255, Number(nextValue) || 0));
                stop();
                step = 0;
                draw();
            };
            host.querySelector('[data-role="binary-value"]').addEventListener('input', event => applyValue(event.target.value));
            host.querySelector('[data-role="binary-number"]').addEventListener('change', event => applyValue(event.target.value));
            host.querySelector('[data-action="prev"]').addEventListener('click', () => { stop(); setStep(step - 1); });
            host.querySelector('[data-action="next"]').addEventListener('click', () => { stop(); setStep(step + 1); });
            host.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); setStep(0); });
            host.querySelector('[data-action="play"]').addEventListener('click', () => {
                stop();
                timer = setInterval(() => {
                    if (step >= 7) {
                        stop();
                        return;
                    }
                    setStep(step + 1);
                }, getPlaybackDelay(620, speed));
            });
            host.querySelector('[data-action="pause"]').addEventListener('click', stop);
            bindPlaybackSpeed(host, nextSpeed => {
                speed = nextSpeed;
                stop();
                draw();
            });
            host.querySelectorAll('[data-bit-index]').forEach(button => {
                button.addEventListener('click', () => {
                    stop();
                    setStep(Number(button.getAttribute('data-bit-index')));
                });
            });
        }

        draw();
    }

    function initPointerDeref(element) {
        const steps = [
            '第一步：创建普通变量 a，存入值 100。',
            '第二步：执行 int *p = &a，p 拿到 a 的内存地址。',
            '第三步：用 *p 读取时，程序沿着 p 里的地址找到 a，取出 100。',
            '第四步：执行 *p = 200，表面在改 *p，实际修改的是 a 那块内存。',
            '第五步：p = NULL 后，p 不再指向任何有效位置，此时 *p 会导致程序崩溃。'
        ];
        const code = ['int a = 100;', 'int *p = &a;', 'printf("%d", *p);', '*p = 200;', 'p = NULL;'];

        initTimelineVisual(element, (step, helpers) => {
            const connected = step > 0 && step < 4;
            const aValue = step >= 3 ? '200' : '100';
            const pValue = step >= 4 ? 'NULL' : (step === 0 ? '未初始化' : '0x1000');

            return `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev">上一步</button>
                        <button class="iv-button is-primary" data-action="play">播放</button>
                        <button class="iv-button" data-action="next">下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${helpers.progress}
                </div>
                <div class="iv-stage">
                    <div class="iv-code-panel">${renderCode(code, step)}</div>
                    <div class="iv-panel">
                        <div class="iv-memory-scene">
                            ${renderMemoryCard({
                                title: 'p : int *',
                                value: pValue,
                                meta: step >= 4 ? '空指针，不能 *p' : '指针自己的地址 0x2000',
                                kind: 'pointer',
                                active: step === 1 || step === 2 || step === 4
                            })}
                            <div class="iv-arrow-lane">${connected ? '<div class="iv-arrow"></div>' : '<span class="iv-null-badge">未指向有效目标</span>'}</div>
                            ${renderMemoryCard({
                                title: 'a : int',
                                value: aValue,
                                meta: '地址 0x1000',
                                kind: 'target',
                                active: step === 2,
                                hot: step === 3
                            })}
                        </div>
                    </div>
                </div>
                <div class="iv-status">${steps[step]}</div>
            </div>`;
        }, steps.length);
    }

    function initArrayPointer(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const values = [10, 20, 30, 40, 50];
        let offset = 2;

        function draw() {
            const address = `0x${(0x3000 + offset * 4).toString(16).toUpperCase()}`;
            host.innerHTML = `<div class="iv-shell">
                <div class="iv-control-bar">
                    <label class="iv-field">偏移 i
                        <input type="range" min="0" max="4" value="${offset}" data-role="offset">
                    </label>
                    <div class="iv-control-group">
                        ${values.map((_, index) => `<button class="iv-tab${index === offset ? ' is-active' : ''}" data-offset="${index}">p + ${index}</button>`).join('')}
                    </div>
                </div>
                <div class="iv-panel">
                    <div class="iv-array-track">
                        ${values.map((value, index) => `<div class="iv-array-cell${index === offset ? ' is-selected' : ''}" data-index="arr[${index}]">
                            <strong>${value}</strong>
                            <span>0x${(0x3000 + index * 4).toString(16).toUpperCase()}</span>
                        </div>`).join('')}
                    </div>
                </div>
                <div class="iv-status">当前 <code>p + ${offset}</code> 指向 <code>arr[${offset}]</code>，地址是 <code>${address}</code>，所以 <code>*(p + ${offset}) = ${values[offset]}</code>。指针加 1 跳过的是一个 <code>int</code>，这里就是 4 字节。</div>
            </div>`;

            const input = host.querySelector('[data-role="offset"]');
            input.addEventListener('input', () => {
                offset = Number(input.value);
                draw();
            });
            host.querySelectorAll('[data-offset]').forEach(button => {
                button.addEventListener('click', () => {
                    offset = Number(button.getAttribute('data-offset'));
                    draw();
                });
            });
        }

        draw();
    }

    function initArrayAccess(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const values = [90, 86, 78, 95, 88];
        let index = 0;

        function draw() {
            const address = `0x${(0x2000 + index * 4).toString(16).toUpperCase()}`;
            host.innerHTML = `<div class="iv-shell">
                <div class="iv-control-bar">
                    <label class="iv-field">下标
                        <input type="range" min="0" max="4" value="${index}" data-role="index">
                    </label>
                    <div class="iv-control-group">
                        ${values.map((_, itemIndex) => `<button class="iv-tab${itemIndex === index ? ' is-active' : ''}" data-index="${itemIndex}">scores[${itemIndex}]</button>`).join('')}
                    </div>
                </div>
                <div class="iv-panel">
                    <div class="iv-array-track">
                        ${values.map((value, itemIndex) => `<div class="iv-array-cell${itemIndex === index ? ' is-selected' : ''}" data-index="scores[${itemIndex}]">
                            <strong>${value}</strong>
                            <span>0x${(0x2000 + itemIndex * 4).toString(16).toUpperCase()}</span>
                        </div>`).join('')}
                    </div>
                </div>
                <div class="iv-status">当前访问 <code>scores[${index}]</code>：起始地址 <code>0x2000</code> + <code>${index} * sizeof(int)</code> = <code>${address}</code>，读到的值是 <code>${values[index]}</code>。</div>
            </div>`;

            host.querySelector('[data-role="index"]').addEventListener('input', event => {
                index = Number(event.target.value);
                draw();
            });
            host.querySelectorAll('[data-index]').forEach(button => {
                button.addEventListener('click', () => {
                    index = Number(button.getAttribute('data-index'));
                    draw();
                });
            });
        }

        draw();
    }

    function initStringScan(element) {
        const steps = [
            { index: 0, output: 'H', text: '从 str[0] 开始逐字符输出，首先打印 H。' },
            { index: 1, output: 'He', text: '继续下一个字符 str[1]，打印 e。每次只前进一格。' },
            { index: 2, output: 'Hel', text: 'str[2] 是 l，打印后屏幕显示 Hel。' },
            { index: 3, output: 'Hell', text: 'str[3] 也是 l，字符串还没结束，继续前进。' },
            { index: 4, output: 'Hello', text: 'str[4] 是 o，此时屏幕显示完整的 Hello。' },
            { index: 5, output: 'Hello', text: '读到 str[5] 的 \\0（空字符）——这是字符串的"终点标记"。printf 识别到它后停止输出，不会再往后读。' }
        ];
        const chars = ['H', 'e', 'l', 'l', 'o', '\\0'];

        initTimelineVisual(element, (step, helpers) => {
            const current = steps[step];
            return `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev">上一步</button>
                        <button class="iv-button is-primary" data-action="play">扫描字符串</button>
                        <button class="iv-button" data-action="next">下一字符</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${helpers.progress}
                </div>
                <div class="iv-panel">
                    <div class="iv-array-track">
                        ${chars.map((char, index) => `<div class="iv-array-cell${index === current.index ? ' is-selected' : ''}" data-index="str[${index}]">
                            <strong>${char === '\\0' ? "'\\0'" : `'${char}'`}</strong>
                            <span>${index === 5 ? '结束标记' : '字符'}</span>
                        </div>`).join('')}
                    </div>
                </div>
                <div class="iv-status">${current.text} 当前 <code>printf("%s", str)</code> 已输出：<code>${current.output || '(空)'}</code></div>
            </div>`;
        }, steps.length);
    }

    function renderVariableStrip(items) {
        return `<div class="iv-var-strip">
            ${items.map(item => `<div class="iv-var-chip${item.hot ? ' is-hot' : ''}${item.muted ? ' is-muted' : ''}">
                <span>${item.label}</span>
                <strong>${item.value}</strong>
            </div>`).join('')}
        </div>`;
    }

    function renderPlaybackControls(step, total, playLabel, speed) {
        return `<div class="iv-control-group">
            <button class="iv-button" data-action="prev"${step === 0 ? ' disabled' : ''}>上一步</button>
            <button class="iv-button is-primary" data-action="play">${playLabel || '播放'}</button>
            <button class="iv-button" data-action="pause">暂停</button>
            <button class="iv-button" data-action="next"${step === total - 1 ? ' disabled' : ''}>下一步</button>
            <button class="iv-button" data-action="reset">重置</button>
        </div>${renderPlaybackSpeed(speed || 'normal')}${renderStepBadge(step, total)}`;
    }

    function initSteppedVisual(options) {
        const host = options.host;
        let step = 0;
        let timer = null;
        let speed = options.speed || 'normal';

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function setStep(nextStep) {
            step = Math.max(0, Math.min(options.getLength() - 1, nextStep));
            draw();
        }

        function play() {
            stop();
            timer = setInterval(() => {
                if (step >= options.getLength() - 1) {
                    stop();
                    return;
                }
                setStep(step + 1);
            }, getPlaybackDelay(options.interval || 820, speed));
        }

        function bindCommonControls() {
            const prevButton = host.querySelector('[data-action="prev"]');
            const nextButton = host.querySelector('[data-action="next"]');
            const playButton = host.querySelector('[data-action="play"]');
            const pauseButton = host.querySelector('[data-action="pause"]');
            const resetButton = host.querySelector('[data-action="reset"]');

            if (prevButton) prevButton.addEventListener('click', () => { stop(); setStep(step - 1); });
            if (nextButton) nextButton.addEventListener('click', () => { stop(); setStep(step + 1); });
            if (playButton) playButton.addEventListener('click', play);
            if (pauseButton) pauseButton.addEventListener('click', stop);
            if (resetButton) resetButton.addEventListener('click', () => { stop(); setStep(0); });
            bindPlaybackSpeed(host, nextSpeed => {
                speed = nextSpeed;
                stop();
                draw();
            });
        }

        function draw() {
            host.innerHTML = options.render(step, {
                controls: renderPlaybackControls(step, options.getLength(), options.playLabel, speed),
                progress: renderProgress(step, options.getLength()),
                setStep,
                stop
            });
            bindCommonControls();
            if (options.bind) options.bind({ step, setStep, stop, draw });
        }

        return {
            draw,
            stop,
            reset() {
                stop();
                step = 0;
                draw();
            },
            getStep() {
                return step;
            }
        };
    }

    function initVariableLifecycle(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const configs = {
            int: {
                label: 'int age',
                name: 'age',
                type: 'int',
                size: 4,
                address: '0x1000',
                code: ['int age;', 'age = 18;', 'age = age + 1;', 'printf("%d", age);'],
                states: [
                    { line: 0, value: '未定义', bytes: ['??', '??', '??', '??'], active: [0, 1, 2, 3], text: '声明变量 age 后，系统分配了 4 字节空间，但里面是随机残留数据，不能直接使用——就像拿到一个空白笔记本，翻开可能是别人写过的东西。' },
                    { line: 1, value: '18', bytes: ['12', '00', '00', '00'], active: [0, 1, 2, 3], text: '赋值 age = 18 后，4 个字节按小端序存入了 18 的二进制表示（0x12 = 18）。' },
                    { line: 2, value: '19', bytes: ['13', '00', '00', '00'], active: [0], text: '执行 age = age + 1：先读出旧值 18，加 1 得到 19，再把新值写回去。只有第一个字节从 0x12 变成了 0x13。' },
                    { line: 3, value: '19', bytes: ['13', '00', '00', '00'], active: [0, 1, 2, 3], text: 'printf 只是"看一眼"变量的值并打印出来，不会修改内存里的内容。' }
                ]
            },
            double: {
                label: 'double height',
                name: 'height',
                type: 'double',
                size: 8,
                address: '0x1008',
                code: ['double height;', 'height = 1.5;', 'height = height + 1.0;', 'printf("%.1f", height);'],
                states: [
                    { line: 0, value: '未定义', bytes: ['??', '??', '??', '??', '??', '??', '??', '??'], active: [0, 1, 2, 3, 4, 5, 6, 7], text: 'double 占 8 个字节，比 int 大一倍。未初始化时同样充满随机数据，不能读取。' },
                    { line: 1, value: '1.5', bytes: ['00', '00', '00', '00', '00', '00', 'F8', '3F'], active: [0, 1, 2, 3, 4, 5, 6, 7], text: '注意：1.5 不是存成"1"和"5"两个字符，而是按 IEEE 754 浮点标准编码成一串二进制。这就是浮点数的存储方式。' },
                    { line: 2, value: '2.5', bytes: ['00', '00', '00', '00', '00', '00', '04', '40'], active: [6, 7], text: '加 1.0 后，CPU 按浮点规则算出新值 2.5，编码变化主要体现在最后两个字节。' },
                    { line: 3, value: '2.5', bytes: ['00', '00', '00', '00', '00', '00', '04', '40'], active: [0, 1, 2, 3, 4, 5, 6, 7], text: '"%.1f" 只是控制显示格式（保留一位小数），变量在内存里的 double 编码不受影响。' }
                ]
            },
            char: {
                label: 'char grade',
                name: 'grade',
                type: 'char',
                size: 1,
                address: '0x1010',
                code: ['char grade;', "grade = 'A';", "grade = grade + 1;", 'printf("%c", grade);'],
                states: [
                    { line: 0, value: '未定义', bytes: ['??'], active: [0], text: 'char 只占 1 个字节，刚好存一个字符的编码。' },
                    { line: 1, value: "'A'", bytes: ['41'], active: [0], text: "字符 'A' 存的是 ASCII 编码 65，十六进制就是 0x41——电脑不认识字母，只认识数字。" },
                    { line: 2, value: "'B'", bytes: ['42'], active: [0], text: "grade + 1 让编码 65 变成 66，对应字符 'B'。这就是为什么字符也能做加减运算。" },
                    { line: 3, value: "'B'", bytes: ['42'], active: [0], text: 'printf 用 "%c" 格式时，把编码 66（0x42）转回字符显示，屏幕就出现了 B。' }
                ]
            }
        };
        let kind = element.getAttribute('data-kind') || 'int';
        let visual;

        function drawByteGrid(config, current) {
            return `<div class="iv-byte-grid" style="--byte-count:${config.size}">
                ${current.bytes.map((byte, index) => `<div class="iv-byte-cell${current.active.includes(index) ? ' is-active' : ''}${byte === '??' ? ' is-unknown' : ''}">
                    <strong>${byte}</strong>
                    <span>+${index}</span>
                </div>`).join('')}
            </div>`;
        }

        function createVisual() {
            const config = configs[kind] || configs.int;
            visual = initSteppedVisual({
                host,
                playLabel: '播放生命周期',
                interval: 940,
                getLength: () => config.states.length,
                render(step, helpers) {
                    const current = config.states[step];
                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            ${helpers.controls}
                            <div class="iv-control-group">
                                ${Object.entries(configs).map(([key, item]) => `<button class="iv-tab${key === kind ? ' is-active' : ''}" data-kind="${key}">${item.label}</button>`).join('')}
                            </div>
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage">
                            <div class="iv-code-panel">${renderCode(config.code, current.line)}</div>
                            <div class="iv-panel">
                                <div class="iv-algo-head">
                                    <strong>${config.label} 的内存状态</strong>
                                    <span>${config.size} 字节 · 起始地址 ${config.address}</span>
                                </div>
                                ${renderVariableStrip([
                                    { label: '变量名', value: config.name },
                                    { label: '类型', value: config.type },
                                    { label: '当前值', value: current.value, hot: true },
                                    { label: 'sizeof', value: `${config.size}B` }
                                ])}
                                ${drawByteGrid(config, current)}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind() {
                    host.querySelectorAll('[data-kind]').forEach(button => {
                        button.addEventListener('click', () => {
                            if (visual) visual.stop();
                            kind = button.getAttribute('data-kind');
                            createVisual();
                            visual.draw();
                        });
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function initExpressionTrace(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const examples = {
            arithmetic: {
                label: '算术优先级',
                expression: 'a + b * c',
                tokens: ['a', '+', 'b', '*', 'c'],
                vars: { a: 1, b: 2, c: 3 },
                steps: [
                    { active: [2, 3, 4], result: 'b * c = 6', text: '乘法优先级高于加法，所以先计算 b * c，得到 6。', values: { a: 1, b: 2, c: 3, result: '-' } },
                    { active: [0, 1, 2, 3, 4], result: 'a + 6 = 7', text: '再把 a 的值 1 与刚才的结果 6 相加，整个表达式的值是 7。', values: { a: 1, b: 2, c: 3, result: 7 } }
                ]
            },
            logic: {
                label: '关系与逻辑',
                expression: 'a + b > c && c != 0',
                tokens: ['a', '+', 'b', '>', 'c', '&&', 'c', '!=', '0'],
                vars: { a: 1, b: 2, c: 3 },
                steps: [
                    { active: [0, 1, 2], result: 'a + b = 3', text: '先按算术优先级计算 a + b，得到 3。', values: { a: 1, b: 2, c: 3, left: '-', right: '-', result: '-' } },
                    { active: [0, 1, 2, 3, 4], result: '3 > 3 = 0', text: '关系运算得到真假值，3 > 3 为假，所以结果是 0。', values: { a: 1, b: 2, c: 3, left: 0, right: '-', result: '-' } },
                    { active: [6, 7, 8], result: 'c != 0 = 1', text: '右侧关系表达式 c != 0 为真，结果是 1。', values: { a: 1, b: 2, c: 3, left: 0, right: 1, result: '-' } },
                    { active: [0, 1, 2, 3, 4, 5, 6, 7, 8], result: '0 && 1 = 0', text: '逻辑与要求两边都为真。左边已经是 0，所以整个表达式为 0。', values: { a: 1, b: 2, c: 3, left: 0, right: 1, result: 0 } }
                ]
            },
            assignment: {
                label: '右结合赋值',
                expression: 'a = b = c = 5',
                tokens: ['a', '=', 'b', '=', 'c', '=', '5'],
                vars: { a: '?', b: '?', c: '?' },
                steps: [
                    { active: [4, 5, 6], result: 'c = 5', text: '赋值运算符右结合，先执行最右侧的 c = 5。', values: { a: '?', b: '?', c: 5, result: 5 } },
                    { active: [2, 3, 4, 5, 6], result: 'b = 5', text: '表达式 c = 5 的值也是 5，所以 b 接着得到 5。', values: { a: '?', b: 5, c: 5, result: 5 } },
                    { active: [0, 1, 2, 3, 4, 5, 6], result: 'a = 5', text: '最后 a 得到 5，整个赋值表达式的值仍然是 5。', values: { a: 5, b: 5, c: 5, result: 5 } }
                ]
            }
        };
        let key = element.getAttribute('data-example') || 'arithmetic';
        let visual;

        function createVisual() {
            const example = examples[key] || examples.arithmetic;
            visual = initSteppedVisual({
                host,
                playLabel: '播放求值',
                interval: 980,
                getLength: () => example.steps.length,
                render(step, helpers) {
                    const current = example.steps[step];
                    const activeSet = new Set(current.active);
                    const varItems = Object.entries(current.values).map(([label, value]) => ({
                        label,
                        value,
                        hot: label === 'result'
                    }));

                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            ${helpers.controls}
                            <div class="iv-control-group">
                                ${Object.entries(examples).map(([exampleKey, item]) => `<button class="iv-tab${exampleKey === key ? ' is-active' : ''}" data-example="${exampleKey}">${item.label}</button>`).join('')}
                            </div>
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage is-wide">
                            <div class="iv-panel">
                                <div class="iv-algo-head">
                                    <strong>${example.expression}</strong>
                                    <span>第 ${step + 1} / ${example.steps.length} 步</span>
                                </div>
                                <div class="iv-token-row" aria-label="表达式 token">
                                    ${example.tokens.map((token, index) => `<span class="iv-token${activeSet.has(index) ? ' is-active' : ''}">${token}</span>`).join('')}
                                </div>
                                <div class="iv-eval-board">
                                    ${example.steps.map((item, index) => `<div class="iv-eval-step${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}">
                                        <span>步骤 ${index + 1}</span>
                                        <strong>${item.result}</strong>
                                    </div>`).join('')}
                                </div>
                                ${renderVariableStrip(varItems)}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind() {
                    host.querySelectorAll('[data-example]').forEach(button => {
                        button.addEventListener('click', () => {
                            if (visual) visual.stop();
                            key = button.getAttribute('data-example');
                            createVisual();
                            visual.draw();
                        });
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function buildBranchSteps(score) {
        const branches = [
            { label: 'score >= 90', pass: score >= 90, output: '优秀' },
            { label: 'score >= 80', pass: score >= 80, output: '良好' },
            { label: 'score >= 60', pass: score >= 60, output: '及格' }
        ];
        const steps = [{
            active: -1,
            selected: -1,
            done: [],
            output: '等待判断',
            text: `输入 score = ${score}，程序将从上到下检查 if / else if 条件。`
        }];

        for (let index = 0; index < branches.length; index += 1) {
            const branch = branches[index];
            steps.push({
                active: index,
                selected: branch.pass ? index : -1,
                done: rangeIndexes(0, index - 1),
                output: branch.pass ? branch.output : '继续向下',
                text: `检查 ${branch.label}：${branch.pass ? `成立，执行“${branch.output}”分支，然后跳过后面所有 else if。` : '不成立，继续检查下一条分支。'}`
            });

            if (branch.pass) {
                steps.push({
                    active: -1,
                    selected: index,
                    done: rangeIndexes(0, index),
                    output: branch.output,
                    text: `分支选择结束，最终输出：${branch.output}。`
                });
                return { branches, steps };
            }
        }

        steps.push({
            active: 3,
            selected: 3,
            done: rangeIndexes(0, branches.length - 1),
            output: '不及格',
            text: '所有条件都不成立，进入最后的 else 分支。'
        });
        steps.push({
            active: -1,
            selected: 3,
            done: rangeIndexes(0, branches.length - 1),
            output: '不及格',
            text: '分支选择结束，最终输出：不及格。'
        });

        return { branches, steps };
    }

    function initBranchFlow(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        let score = Number(element.getAttribute('data-score') || 76);
        let model = buildBranchSteps(score);
        let visual;

        function createVisual() {
            visual = initSteppedVisual({
                host,
                playLabel: '播放判断',
                interval: 900,
                getLength: () => model.steps.length,
                render(step, helpers) {
                    const current = model.steps[step];
                    const rows = model.branches.concat([{ label: 'else', pass: true, output: '不及格' }]);

                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            <label class="iv-field">score
                                <input type="range" min="0" max="100" value="${score}" data-role="score-range">
                                <input type="number" min="0" max="100" value="${score}" data-role="score-number">
                            </label>
                            ${helpers.controls}
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage">
                            <div class="iv-code-panel">${renderCode([
                                'if (score &gt;= 90) printf("优秀");',
                                'else if (score &gt;= 80) printf("良好");',
                                'else if (score &gt;= 60) printf("及格");',
                                'else printf("不及格");'
                            ], current.active < 0 ? current.selected : current.active)}</div>
                            <div class="iv-panel">
                                <div class="iv-branch-board">
                                    ${rows.map((row, index) => {
                                        const isSelected = current.selected === index;
                                        const isActive = current.active === index;
                                        const isDone = current.done.includes(index);
                                        return `<div class="iv-branch-row${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}">
                                            <span>${row.label}</span>
                                            <strong>${row.output}</strong>
                                            <em>${index === 3 ? '兜底' : (row.pass ? '真' : '假')}</em>
                                        </div>`;
                                    }).join('')}
                                </div>
                                ${renderVariableStrip([
                                    { label: 'score', value: score, hot: true },
                                    { label: '输出', value: current.output }
                                ])}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind({ stop }) {
                    const rangeInput = host.querySelector('[data-role="score-range"]');
                    const numberInput = host.querySelector('[data-role="score-number"]');
                    const applyScore = value => {
                        if (visual) visual.stop();
                        score = Math.max(0, Math.min(100, Number(value) || 0));
                        model = buildBranchSteps(score);
                        stop();
                        createVisual();
                        visual.draw();
                    };
                    rangeInput.addEventListener('input', event => applyScore(event.target.value));
                    numberInput.addEventListener('change', event => applyScore(event.target.value));
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function buildLoopSteps(limit) {
        const steps = [{
            phase: 'init',
            line: 0,
            i: 1,
            output: [],
            text: '先执行初始化表达式 int i = 1，只执行这一次。'
        }];
        const output = [];

        for (let i = 1; i <= limit; i += 1) {
            steps.push({
                phase: 'condition',
                line: 0,
                i,
                output: output.slice(),
                text: `判断 i <= ${limit}：${i} <= ${limit} 为真，进入循环体。`
            });
            output.push(i);
            steps.push({
                phase: 'body',
                line: 1,
                i,
                output: output.slice(),
                text: `执行循环体，printf 输出当前 i 的值 ${i}。`
            });
            steps.push({
                phase: 'update',
                line: 2,
                i: i + 1,
                output: output.slice(),
                text: `执行更新表达式 i++，下一次判断时 i 变为 ${i + 1}。`
            });
        }

        steps.push({
            phase: 'condition',
            line: 0,
            i: limit + 1,
            output: output.slice(),
            text: `再次判断 i <= ${limit}：${limit + 1} <= ${limit} 为假，循环结束。`
        });
        steps.push({
            phase: 'done',
            line: 3,
            i: limit + 1,
            output: output.slice(),
            text: `循环退出，最终输出序列为：${output.join(' ')}。`
        });

        return steps;
    }

    function initLoopFlow(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        let limit = Number(element.getAttribute('data-limit') || 5);
        let steps = buildLoopSteps(limit);
        let visual;
        const phases = [
            { key: 'init', label: '初始化', detail: '只执行一次' },
            { key: 'condition', label: '条件判断', detail: '每轮开始前' },
            { key: 'body', label: '循环体', detail: '条件为真执行' },
            { key: 'update', label: '更新', detail: '循环体之后' }
        ];

        function createVisual() {
            visual = initSteppedVisual({
                host,
                playLabel: '播放循环',
                interval: 760,
                getLength: () => steps.length,
                render(step, helpers) {
                    const current = steps[step];
                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            <label class="iv-field">上限 n
                                <input type="number" min="0" max="8" value="${limit}" data-role="limit">
                            </label>
                            ${helpers.controls}
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage">
                            <div class="iv-code-panel">${renderCode([
                                `for (int i = 1; i &lt;= ${limit}; i++) {`,
                                'printf("%d ", i);',
                                '}',
                                '继续执行循环后的代码'
                            ], current.line)}</div>
                            <div class="iv-panel">
                                <div class="iv-loop-track">
                                    ${phases.map(phase => `<div class="iv-phase-card${current.phase === phase.key ? ' is-active' : ''}${current.phase === 'done' ? ' is-muted' : ''}">
                                        <span>${phase.label}</span>
                                        <strong>${phase.detail}</strong>
                                    </div>`).join('')}
                                </div>
                                ${renderVariableStrip([
                                    { label: 'i', value: current.i, hot: current.phase === 'condition' || current.phase === 'update' },
                                    { label: 'n', value: limit },
                                    { label: '已输出个数', value: current.output.length }
                                ])}
                                <div class="iv-output-strip">
                                    ${current.output.length ? current.output.map(value => `<span>${value}</span>`).join('') : '<em>尚未输出</em>'}
                                </div>
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind({ stop }) {
                    const applyLimit = value => {
                        if (visual) visual.stop();
                        limit = Math.max(0, Math.min(8, Number(value) || 0));
                        steps = buildLoopSteps(limit);
                        stop();
                        createVisual();
                        visual.draw();
                    };
                    host.querySelector('[data-role="limit"]').addEventListener('change', event => {
                        applyLimit(event.target.value);
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function initScopeLookup(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const queries = {
            block: {
                label: '块内 value',
                title: '在内层块读取 value',
                layers: [
                    { name: '内层块', vars: ['value = 300', 'temp = 1'], result: 'value = 300' },
                    { name: 'test 函数', vars: ['value = 200'], result: '被隐藏' },
                    { name: '全局区', vars: ['value = 100'], result: '被隐藏' }
                ],
                steps: [
                    { active: 0, found: 0, text: '查找从当前所在的最内层作用域开始。这里已经找到 value = 300。' },
                    { active: 1, found: 0, text: '外层函数里也有 value，但已经被内层块的同名变量隐藏。' },
                    { active: 2, found: 0, text: '全局 value 同样存在，但在这个位置不会被使用。' }
                ]
            },
            function: {
                label: '函数内 value',
                title: '离开内层块后读取 value',
                layers: [
                    { name: '内层块', vars: ['已销毁'], result: '不可见' },
                    { name: 'test 函数', vars: ['value = 200'], result: 'value = 200' },
                    { name: '全局区', vars: ['value = 100'], result: '被隐藏' }
                ],
                steps: [
                    { active: 0, found: -1, text: '离开大括号后，块级变量生命周期结束，不能再访问。' },
                    { active: 1, found: 1, text: '继续向外查找，在函数作用域找到 value = 200。' },
                    { active: 2, found: 1, text: '全局 value 仍被函数内的同名局部变量隐藏。' }
                ]
            },
            missing: {
                label: '块外 b',
                title: '在块外读取 b',
                layers: [
                    { name: '内层块', vars: ['b 已销毁'], result: '不可见' },
                    { name: 'main 函数', vars: ['a = 10'], result: '没有 b' },
                    { name: '全局区', vars: ['无 b'], result: '没有 b' }
                ],
                steps: [
                    { active: 0, found: -1, text: 'b 只在内层块里定义，离开块后已经不可见。' },
                    { active: 1, found: -1, text: 'main 函数作用域中没有 b 这个名字。' },
                    { active: 2, found: -1, text: '全局区也没有 b，编译器会报“未声明的标识符”。' }
                ]
            }
        };
        let key = 'block';
        let visual;

        function createVisual() {
            const query = queries[key] || queries.block;
            visual = initSteppedVisual({
                host,
                playLabel: '播放查找',
                interval: 920,
                getLength: () => query.steps.length,
                render(step, helpers) {
                    const current = query.steps[step];
                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            ${helpers.controls}
                            <div class="iv-control-group">
                                ${Object.entries(queries).map(([queryKey, item]) => `<button class="iv-tab${queryKey === key ? ' is-active' : ''}" data-query="${queryKey}">${item.label}</button>`).join('')}
                            </div>
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage">
                            <div class="iv-code-panel">${renderCode([
                                'int value = 100;',
                                'void test() { int value = 200;',
                                '    { int value = 300; int temp = 1; }',
                                '    printf("%d", value);',
                                '}'
                            ], key === 'block' ? 2 : key === 'function' ? 3 : 4)}</div>
                            <div class="iv-panel">
                                <div class="iv-algo-head">
                                    <strong>${query.title}</strong>
                                    <span>从内向外查找名字</span>
                                </div>
                                <div class="iv-scope-map">
                                    ${query.layers.map((layer, index) => `<div class="iv-scope-layer${current.active === index ? ' is-active' : ''}${current.found === index ? ' is-found' : ''}${current.found >= 0 && index > current.found ? ' is-shadowed' : ''}">
                                        <strong>${layer.name}</strong>
                                        ${layer.vars.map(variable => `<span>${variable}</span>`).join('')}
                                        <em>${layer.result}</em>
                                    </div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind() {
                    host.querySelectorAll('[data-query]').forEach(button => {
                        button.addEventListener('click', () => {
                            if (visual) visual.stop();
                            key = button.getAttribute('data-query');
                            createVisual();
                            visual.draw();
                        });
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function initMacroExpansion(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        let mode = 'bad';
        let a = Number(element.getAttribute('data-a') || 2);
        let visual;

        function buildSteps() {
            const badResult = a + 1 * a + 1;
            const goodResult = (a + 1) * (a + 1);
            if (mode === 'good') {
                return [
                    { title: '宏定义', code: '#define SQR(x) ((x) * (x))', text: '给参数和整体都加括号，宏展开后能保持原本的运算边界。', result: '-' },
                    { title: '调用位置', code: 'SQR(a + 1)', text: `令 a = ${a}，调用 SQR(a + 1)。`, result: '-' },
                    { title: '预处理展开', code: '((a + 1) * (a + 1))', text: '预处理器只是做文本替换，但括号保护了 a + 1 这个整体。', result: '-' },
                    { title: '最终求值', code: `(${a} + 1) * (${a} + 1) = ${goodResult}`, text: `最终结果是 ${goodResult}，这才符合“平方”的含义。`, result: goodResult }
                ];
            }
            return [
                { title: '宏定义', code: '#define SQR(x) x * x', text: '没有括号的宏看起来像函数，实际上只是文本替换。', result: '-' },
                { title: '调用位置', code: 'SQR(a + 1)', text: `令 a = ${a}，我们期望得到 (a + 1) 的平方。`, result: '-' },
                { title: '预处理展开', code: 'a + 1 * a + 1', text: '预处理后不是 (a + 1) * (a + 1)，而是 a + 1 * a + 1。', result: '-' },
                { title: '最终求值', code: `${a} + 1 * ${a} + 1 = ${badResult}`, text: `乘法优先，最终结果是 ${badResult}，与真正平方 ${(a + 1) * (a + 1)} 不同。`, result: badResult }
            ];
        }

        let steps = buildSteps();

        function createVisual() {
            visual = initSteppedVisual({
                host,
                playLabel: '播放展开',
                interval: 980,
                getLength: () => steps.length,
                render(step, helpers) {
                    const current = steps[step];
                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            <label class="iv-field">a
                                <input type="number" min="1" max="9" value="${a}" data-role="macro-a">
                            </label>
                            ${helpers.controls}
                            <div class="iv-control-group">
                                <button class="iv-tab${mode === 'bad' ? ' is-active' : ''}" data-macro-mode="bad">无括号宏</button>
                                <button class="iv-tab${mode === 'good' ? ' is-active' : ''}" data-macro-mode="good">安全写法</button>
                            </div>
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage is-wide">
                            <div class="iv-panel">
                                <div class="iv-macro-pipeline">
                                    ${steps.map((item, index) => `<div class="iv-macro-step${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}">
                                        <span>${item.title}</span>
                                        <strong>${item.code}</strong>
                                    </div>`).join('')}
                                </div>
                                ${renderVariableStrip([
                                    { label: 'a', value: a, hot: true },
                                    { label: '当前结果', value: current.result }
                                ])}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind({ stop }) {
                    host.querySelector('[data-role="macro-a"]').addEventListener('change', event => {
                        if (visual) visual.stop();
                        a = Math.max(1, Math.min(9, Number(event.target.value) || 1));
                        steps = buildSteps();
                        stop();
                        createVisual();
                        visual.draw();
                    });
                    host.querySelectorAll('[data-macro-mode]').forEach(button => {
                        button.addEventListener('click', () => {
                            if (visual) visual.stop();
                            mode = button.getAttribute('data-macro-mode');
                            steps = buildSteps();
                            stop();
                            createVisual();
                            visual.draw();
                        });
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function calculateStructLayout(members) {
        let offset = 0;
        const maxAlign = Math.max(...members.map(member => member.align));
        const segments = [];

        members.forEach(member => {
            const padding = (member.align - (offset % member.align)) % member.align;
            if (padding > 0) {
                segments.push({ kind: 'padding', name: '填充', size: padding, start: offset });
                offset += padding;
            }
            segments.push({ kind: 'member', name: member.name, type: member.type, size: member.size, start: offset });
            offset += member.size;
        });

        const tailPadding = (maxAlign - (offset % maxAlign)) % maxAlign;
        if (tailPadding > 0) {
            segments.push({ kind: 'padding', name: '尾部填充', size: tailPadding, start: offset });
            offset += tailPadding;
        }

        return { segments, size: offset, align: maxAlign, padding: segments.filter(item => item.kind === 'padding').reduce((sum, item) => sum + item.size, 0) };
    }

    function initStructLayout(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        const layouts = {
            a: {
                label: 'struct A',
                members: [
                    { name: 'c', type: 'char', size: 1, align: 1 },
                    { name: 'i', type: 'int', size: 4, align: 4 }
                ]
            },
            bad: {
                label: 'Bad',
                members: [
                    { name: 'a', type: 'char', size: 1, align: 1 },
                    { name: 'b', type: 'int', size: 4, align: 4 },
                    { name: 'c', type: 'char', size: 1, align: 1 }
                ]
            },
            good: {
                label: 'Good',
                members: [
                    { name: 'b', type: 'int', size: 4, align: 4 },
                    { name: 'a', type: 'char', size: 1, align: 1 },
                    { name: 'c', type: 'char', size: 1, align: 1 }
                ]
            },
            test: {
                label: 'Test',
                members: [
                    { name: 'a', type: 'char', size: 1, align: 1 },
                    { name: 'b', type: 'double', size: 8, align: 8 },
                    { name: 'c', type: 'int', size: 4, align: 4 }
                ]
            }
        };
        let key = element.getAttribute('data-layout') || 'bad';
        let visual;

        function createVisual() {
            const layout = layouts[key] || layouts.bad;
            const result = calculateStructLayout(layout.members);
            visual = initSteppedVisual({
                host,
                playLabel: '播放布局',
                interval: 860,
                getLength: () => result.segments.length,
                render(step, helpers) {
                    const activeSegment = result.segments[step];
                    const cells = [];
                    result.segments.forEach((segment, segmentIndex) => {
                        for (let byte = 0; byte < segment.size; byte += 1) {
                            cells.push({
                                segmentIndex,
                                label: segment.kind === 'padding' ? 'pad' : segment.name,
                                offset: segment.start + byte,
                                kind: segment.kind
                            });
                        }
                    });

                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            ${helpers.controls}
                            <div class="iv-control-group">
                                ${Object.entries(layouts).map(([layoutKey, item]) => `<button class="iv-tab${layoutKey === key ? ' is-active' : ''}" data-layout="${layoutKey}">${item.label}</button>`).join('')}
                            </div>
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage">
                            <div class="iv-code-panel">${renderCode([
                                `struct ${layout.label} {`,
                                ...layout.members.map(member => `${member.type} ${member.name};`),
                                '};'
                            ], Math.min(step + 1, layout.members.length))}</div>
                            <div class="iv-panel">
                                <div class="iv-algo-head">
                                    <strong>${layout.label} 内存布局</strong>
                                    <span>总大小 ${result.size}B，对齐单位 ${result.align}B</span>
                                </div>
                                <div class="iv-byte-grid is-struct" style="--byte-count:${Math.min(result.size, 12)}">
                                    ${cells.map(cell => `<div class="iv-byte-cell${cell.kind === 'padding' ? ' is-padding' : ''}${cell.segmentIndex === step ? ' is-active' : ''}${cell.segmentIndex > step ? ' is-muted' : ''}">
                                        <strong>${cell.label}</strong>
                                        <span>+${cell.offset}</span>
                                    </div>`).join('')}
                                </div>
                                ${renderVariableStrip([
                                    { label: '当前片段', value: `${activeSegment.name} ${activeSegment.size}B`, hot: true },
                                    { label: '填充字节', value: `${result.padding}B` },
                                    { label: '成员字节', value: `${layout.members.reduce((sum, member) => sum + member.size, 0)}B` }
                                ])}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${activeSegment.kind === 'padding'
                            ? `填充字节：偏移 ${activeSegment.start} 处，编译器插入 ${activeSegment.size} 个字节的"空洞"，让下一个成员满足对齐要求。这些字节被浪费了——这就是为什么成员排列顺序会影响结构体总大小。`
                            : `成员 ${activeSegment.type} ${activeSegment.name}：从偏移 ${activeSegment.start} 开始存放，占用 ${activeSegment.size} 个字节。`}</div>
                    </div>`;
                },
                bind() {
                    host.querySelectorAll('[data-layout]').forEach(button => {
                        button.addEventListener('click', () => {
                            if (visual) visual.stop();
                            key = button.getAttribute('data-layout');
                            createVisual();
                            visual.draw();
                        });
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function rangeIndexes(start, end) {
        const result = [];
        for (let index = start; index <= end; index += 1) {
            result.push(index);
        }
        return result;
    }

    function renderAlgorithmBars(values, options) {
        const maxValue = Math.max(...values, 1);
        const sortedSet = new Set(options.sortedIndices || []);
        const eliminatedSet = new Set(options.eliminatedIndices || []);
        const compareSet = new Set(options.compareIndices || []);
        const swapSet = new Set(options.swapIndices || []);
        const pointers = options.pointers || [];
        const prefix = options.prefix || 'arr';

        return `<div class="iv-algo-scroll">
            <div class="iv-algo-bars" style="--bar-count:${values.length}">
                ${values.map((value, index) => {
                    const classes = ['iv-algo-bar'];
                    const inSortedTail = typeof options.sortedFrom === 'number' && index >= options.sortedFrom;
                    const inSortedHead = typeof options.sortedCount === 'number' && index < options.sortedCount;
                    const outOfRange = options.range && (index < options.range[0] || index > options.range[1]);
                    const barHeight = Math.round(34 + (value / maxValue) * 126);
                    const ownPointers = pointers.filter(pointer => pointer.index === index);

                    if (compareSet.has(index)) classes.push('is-compare');
                    if (swapSet.has(index)) classes.push('is-swap');
                    if (sortedSet.has(index) || inSortedTail || inSortedHead) classes.push('is-sorted');
                    if (eliminatedSet.has(index) || outOfRange) classes.push('is-eliminated');
                    if (index === options.currentIndex) classes.push('is-current');
                    if (index === options.minIndex) classes.push('is-min');
                    if (index === options.midIndex) classes.push('is-mid');
                    if (index === options.foundIndex) classes.push('is-found');

                    return `<div class="${classes.join(' ')}" style="--bar-height:${barHeight}px" data-index="${prefix}[${index}]">
                        <div class="iv-bar-pointers">
                            ${ownPointers.map(pointer => `<span class="iv-pointer-tag is-${pointer.tone || 'blue'}">${pointer.label}</span>`).join('')}
                        </div>
                        <div class="iv-bar-column"><span class="iv-bar-fill"></span></div>
                        <strong class="iv-bar-value">${value}</strong>
                        <span class="iv-bar-index">${prefix}[${index}]</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    function buildBubbleSortSteps(values) {
        const arr = values.slice();
        const steps = [{
            values: arr.slice(),
            line: 0,
            i: '-',
            j: '-',
            comparisons: 0,
            swaps: 0,
            sortedFrom: arr.length,
            text: '初始数组尚未进入循环。观察每一轮如何把当前最大值推到右侧有序区。'
        }];
        let comparisons = 0;
        let swaps = 0;

        for (let i = 0; i < arr.length - 1; i += 1) {
            steps.push({
                values: arr.slice(),
                line: 0,
                i,
                j: '-',
                comparisons,
                swaps,
                sortedFrom: arr.length - i,
                text: `第 ${i + 1} 轮开始，右侧已有 ${i} 个元素处于最终位置。`
            });

            for (let j = 0; j < arr.length - 1 - i; j += 1) {
                comparisons += 1;
                const shouldSwap = arr[j] > arr[j + 1];
                steps.push({
                    values: arr.slice(),
                    line: 2,
                    i,
                    j,
                    comparisons,
                    swaps,
                    compareIndices: [j, j + 1],
                    sortedFrom: arr.length - i,
                    text: `比较 arr[${j}] = ${arr[j]} 和 arr[${j + 1}] = ${arr[j + 1]}，${shouldSwap ? '左边更大，需要交换。' : '顺序正确，不需要交换。'}`
                });

                if (shouldSwap) {
                    const left = arr[j];
                    const right = arr[j + 1];
                    arr[j] = right;
                    arr[j + 1] = left;
                    swaps += 1;
                    steps.push({
                        values: arr.slice(),
                        line: 5,
                        i,
                        j,
                        comparisons,
                        swaps,
                        swapIndices: [j, j + 1],
                        sortedFrom: arr.length - i,
                        text: `${left} 和 ${right} 完成交换，较大的 ${left} 继续向右移动。`
                    });
                }
            }

            steps.push({
                values: arr.slice(),
                line: 1,
                i,
                j: '-',
                comparisons,
                swaps,
                sortedFrom: arr.length - 1 - i,
                text: `第 ${i + 1} 轮结束，arr[${arr.length - 1 - i}] 已经锁定到最终位置。`
            });
        }

        steps.push({
            values: arr.slice(),
            line: 7,
            i: '-',
            j: '-',
            comparisons,
            swaps,
            sortedFrom: 0,
            text: `排序完成，最终数组为 [${arr.join(', ')}]。`
        });

        return steps;
    }

    function buildSelectionSortSteps(values) {
        const arr = values.slice();
        const steps = [{
            values: arr.slice(),
            line: 0,
            i: '-',
            j: '-',
            minIndex: '-',
            comparisons: 0,
            swaps: 0,
            sortedCount: 0,
            text: '初始数组尚未进入循环。选择排序每轮先找最小值，再把它放到左侧有序区末尾。'
        }];
        let comparisons = 0;
        let swaps = 0;

        for (let i = 0; i < arr.length - 1; i += 1) {
            let minIndex = i;
            steps.push({
                values: arr.slice(),
                line: 1,
                i,
                j: '-',
                minIndex,
                comparisons,
                swaps,
                sortedCount: i,
                currentIndex: i,
                text: `第 ${i + 1} 轮开始，先假设 arr[${i}] = ${arr[i]} 是未排序区最小值。`
            });

            for (let j = i + 1; j < arr.length; j += 1) {
                comparisons += 1;
                const foundSmaller = arr[j] < arr[minIndex];
                steps.push({
                    values: arr.slice(),
                    line: 3,
                    i,
                    j,
                    minIndex,
                    comparisons,
                    swaps,
                    sortedCount: i,
                    currentIndex: j,
                    compareIndices: [j, minIndex],
                    text: `比较 arr[${j}] = ${arr[j]} 和当前最小值 arr[${minIndex}] = ${arr[minIndex]}，${foundSmaller ? '发现新的最小值。' : '当前最小值不变。'}`
                });

                if (foundSmaller) {
                    minIndex = j;
                    steps.push({
                        values: arr.slice(),
                        line: 4,
                        i,
                        j,
                        minIndex,
                        comparisons,
                        swaps,
                        sortedCount: i,
                        currentIndex: j,
                        text: `更新 min_idx = ${minIndex}，新的最小值是 ${arr[minIndex]}。`
                    });
                }
            }

            if (minIndex !== i) {
                const left = arr[i];
                const minValue = arr[minIndex];
                arr[i] = minValue;
                arr[minIndex] = left;
                swaps += 1;
                steps.push({
                    values: arr.slice(),
                    line: 8,
                    i,
                    j: '-',
                    minIndex,
                    comparisons,
                    swaps,
                    sortedCount: i + 1,
                    swapIndices: [i, minIndex],
                    text: `把最小值 ${minValue} 交换到 arr[${i}]，左侧有序区扩大一格。`
                });
            } else {
                steps.push({
                    values: arr.slice(),
                    line: 6,
                    i,
                    j: '-',
                    minIndex,
                    comparisons,
                    swaps,
                    sortedCount: i + 1,
                    currentIndex: i,
                    text: `min_idx 仍然是 ${i}，这一轮无需交换，arr[${i}] 已经就位。`
                });
            }
        }

        steps.push({
            values: arr.slice(),
            line: 9,
            i: '-',
            j: '-',
            minIndex: '-',
            comparisons,
            swaps,
            sortedCount: arr.length,
            text: `排序完成，最终数组为 [${arr.join(', ')}]。`
        });

        return steps;
    }

    function initSortVisual(element, mode) {
        const host = element.querySelector('[data-visual-host]') || element;
        const datasets = [
            { key: 'default', label: '教材数组', values: [64, 25, 12, 22, 11] },
            { key: 'reverse', label: '逆序数组', values: [50, 40, 30, 20, 10] },
            { key: 'nearly', label: '接近有序', values: [11, 12, 25, 22, 64] }
        ];
        const config = mode === 'selection'
            ? {
                title: '选择排序',
                playLabel: '播放选择',
                build: buildSelectionSortSteps,
                code: [
                    'for (int i = 0; i &lt; n - 1; i++)',
                    'int min_idx = i;',
                    'for (int j = i + 1; j &lt; n; j++)',
                    'if (arr[j] &lt; arr[min_idx])',
                    'min_idx = j;',
                    'if (min_idx != i)',
                    '不交换，当前位置已就位',
                    'int temp = arr[i];',
                    'arr[i] 与 arr[min_idx] 交换',
                    '输出排序结果'
                ]
            }
            : {
                title: '冒泡排序',
                playLabel: '播放冒泡',
                build: buildBubbleSortSteps,
                code: [
                    'for (int i = 0; i &lt; n - 1; i++)',
                    'for (int j = 0; j &lt; n - 1 - i; j++)',
                    'if (arr[j] &gt; arr[j + 1])',
                    'int temp = arr[j];',
                    'arr[j] = arr[j + 1];',
                    'arr[j + 1] = temp;',
                    '本轮最大值锁定到右侧',
                    '输出排序结果'
                ]
            };

        let datasetKey = 'default';
        let step = 0;
        let timer = null;
        let steps = config.build(datasets[0].values);
        let speed = 'normal';

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function rebuild(nextKey) {
            const dataset = datasets.find(item => item.key === nextKey) || datasets[0];
            datasetKey = dataset.key;
            steps = config.build(dataset.values);
            step = 0;
            stop();
            draw();
        }

        function setStep(nextStep) {
            step = Math.max(0, Math.min(steps.length - 1, nextStep));
            draw();
        }

        function play() {
            stop();
            timer = setInterval(() => {
                if (step >= steps.length - 1) {
                    stop();
                    return;
                }
                setStep(step + 1);
            }, getPlaybackDelay(760, speed));
        }

        function draw() {
            const current = steps[step];
            const pointers = mode === 'selection'
                ? [
                    { index: current.i, label: 'i', tone: 'green' },
                    { index: current.j, label: 'j', tone: 'blue' },
                    { index: current.minIndex, label: 'min', tone: 'amber' }
                ].filter(pointer => Number.isInteger(pointer.index))
                : [
                    { index: current.j, label: 'j', tone: 'blue' },
                    { index: Number.isInteger(current.j) ? current.j + 1 : null, label: 'j+1', tone: 'blue' }
                ].filter(pointer => Number.isInteger(pointer.index));

            host.innerHTML = `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev"${step === 0 ? ' disabled' : ''}>上一步</button>
                        <button class="iv-button is-primary" data-action="play">${config.playLabel}</button>
                        <button class="iv-button" data-action="pause">暂停</button>
                        <button class="iv-button" data-action="next"${step === steps.length - 1 ? ' disabled' : ''}>下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    <div class="iv-control-group">
                        ${datasets.map(dataset => `<button class="iv-tab${dataset.key === datasetKey ? ' is-active' : ''}" data-dataset="${dataset.key}">${dataset.label}</button>`).join('')}
                    </div>
                    ${renderPlaybackSpeed(speed)}
                    ${renderProgress(step, steps.length)}
                    ${renderStepBadge(step, steps.length, '帧')}
                </div>
                <div class="iv-stage is-algorithm">
                    <div class="iv-code-panel">${renderCode(config.code, current.line)}</div>
                    <div class="iv-panel">
                        <div class="iv-algo-head">
                            <strong>${config.title}</strong>
                            <span>第 ${step + 1} / ${steps.length} 帧</span>
                        </div>
                        ${renderVariableStrip([
                            { label: 'i', value: current.i },
                            { label: 'j', value: current.j },
                            ...(mode === 'selection' ? [{ label: 'min_idx', value: current.minIndex, hot: Number.isInteger(current.minIndex) }] : []),
                            { label: '比较', value: current.comparisons },
                            { label: '交换', value: current.swaps }
                        ])}
                        ${renderAlgorithmBars(current.values, {
                            compareIndices: current.compareIndices,
                            swapIndices: current.swapIndices,
                            sortedFrom: current.sortedFrom,
                            sortedCount: current.sortedCount,
                            currentIndex: current.currentIndex,
                            minIndex: Number.isInteger(current.minIndex) ? current.minIndex : null,
                            pointers
                        })}
                    </div>
                </div>
                <div class="iv-status">${current.text}</div>
            </div>`;

            const prevButton = host.querySelector('[data-action="prev"]');
            const nextButton = host.querySelector('[data-action="next"]');
            if (prevButton) prevButton.addEventListener('click', () => { stop(); setStep(step - 1); });
            if (nextButton) nextButton.addEventListener('click', () => { stop(); setStep(step + 1); });
            host.querySelector('[data-action="play"]').addEventListener('click', play);
            host.querySelector('[data-action="pause"]').addEventListener('click', stop);
            host.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); setStep(0); });
            bindPlaybackSpeed(host, nextSpeed => {
                speed = nextSpeed;
                stop();
                draw();
            });
            host.querySelectorAll('[data-dataset]').forEach(button => {
                button.addEventListener('click', () => rebuild(button.getAttribute('data-dataset')));
            });
        }

        draw();
    }

    function buildLinearSearchSteps(values, target) {
        const steps = [{
            values,
            line: 0,
            index: '-',
            comparisons: 0,
            target,
            scannedIndices: [],
            text: `准备在线性数组中查找 ${target}，从 arr[0] 开始逐个比较。`
        }];
        let comparisons = 0;

        for (let index = 0; index < values.length; index += 1) {
            comparisons += 1;
            const found = values[index] === target;
            steps.push({
                values,
                line: 1,
                index,
                comparisons,
                target,
                compareIndices: [index],
                scannedIndices: rangeIndexes(0, index - 1),
                foundIndex: found ? index : null,
                text: `比较 arr[${index}] = ${values[index]} 和 target = ${target}，${found ? '命中目标。' : '不相等，继续向后找。'}`
            });

            if (found) {
                steps.push({
                    values,
                    line: 2,
                    index,
                    comparisons,
                    target,
                    scannedIndices: rangeIndexes(0, index),
                    foundIndex: index,
                    text: `找到目标 ${target}，函数返回下标 ${index}。`
                });
                return steps;
            }
        }

        steps.push({
            values,
            line: 3,
            index: '-',
            comparisons,
            target,
            scannedIndices: rangeIndexes(0, values.length - 1),
            text: `所有元素都比较过，数组中没有 ${target}，函数返回 -1。`
        });

        return steps;
    }

    function buildBinarySearchSteps(values, target) {
        const steps = [{
            values,
            line: 0,
            left: 0,
            right: values.length - 1,
            mid: '-',
            comparisons: 0,
            target,
            text: `准备在已排序数组中查找 ${target}，有效区间从 left = 0 到 right = ${values.length - 1}。`
        }];
        let left = 0;
        let right = values.length - 1;
        let comparisons = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            comparisons += 1;
            steps.push({
                values,
                line: 1,
                left,
                right,
                mid,
                comparisons,
                target,
                compareIndices: [mid],
                midIndex: mid,
                text: `计算 mid = (${left} + ${right}) / 2 = ${mid}，检查 arr[${mid}] = ${values[mid]}。`
            });

            if (values[mid] === target) {
                steps.push({
                    values,
                    line: 2,
                    left,
                    right,
                    mid,
                    comparisons,
                    target,
                    foundIndex: mid,
                    midIndex: mid,
                    text: `arr[${mid}] 正好等于 ${target}，函数返回下标 ${mid}。`
                });
                return steps;
            }

            if (values[mid] < target) {
                steps.push({
                    values,
                    line: 3,
                    left,
                    right,
                    mid,
                    comparisons,
                    target,
                    midIndex: mid,
                    eliminatedIndices: rangeIndexes(left, mid),
                    text: `arr[${mid}] = ${values[mid]} 小于 ${target}，排除 left 到 mid，下一轮 left = ${mid + 1}。`
                });
                left = mid + 1;
            } else {
                steps.push({
                    values,
                    line: 4,
                    left,
                    right,
                    mid,
                    comparisons,
                    target,
                    midIndex: mid,
                    eliminatedIndices: rangeIndexes(mid, right),
                    text: `arr[${mid}] = ${values[mid]} 大于 ${target}，排除 mid 到 right，下一轮 right = ${mid - 1}。`
                });
                right = mid - 1;
            }
        }

        steps.push({
            values,
            line: 5,
            left,
            right,
            mid: '-',
            comparisons,
            target,
            eliminatedIndices: rangeIndexes(0, values.length - 1),
            text: `left = ${left} 已经超过 right = ${right}，有效区间为空，函数返回 -1。`
        });

        return steps;
    }

    function initSearchVisual(element, mode) {
        const host = element.querySelector('[data-visual-host]') || element;
        const values = mode === 'binary'
            ? [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
            : [37, 12, 25, 9, 42, 18, 30];
        const presets = mode === 'binary' ? [23, 72, 7, 91] : [42, 25, 13, 37];
        const code = mode === 'binary'
            ? [
                'int left = 0, right = n - 1;',
                'int mid = (left + right) / 2;',
                'if (arr[mid] == target) return mid;',
                'else if (arr[mid] &lt; target) left = mid + 1;',
                'else right = mid - 1;',
                'return -1;'
            ]
            : [
                'for (int i = 0; i &lt; n; i++)',
                'if (arr[i] == target)',
                'return i;',
                'return -1;'
            ];
        let target = Number(element.getAttribute('data-target') || (mode === 'binary' ? 23 : 42));
        let step = 0;
        let timer = null;
        let steps = mode === 'binary' ? buildBinarySearchSteps(values, target) : buildLinearSearchSteps(values, target);
        let speed = 'normal';

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function rebuild(nextTarget) {
            target = Number(nextTarget) || 0;
            steps = mode === 'binary' ? buildBinarySearchSteps(values, target) : buildLinearSearchSteps(values, target);
            step = 0;
            stop();
            draw();
        }

        function setStep(nextStep) {
            step = Math.max(0, Math.min(steps.length - 1, nextStep));
            draw();
        }

        function play() {
            stop();
            timer = setInterval(() => {
                if (step >= steps.length - 1) {
                    stop();
                    return;
                }
                setStep(step + 1);
            }, getPlaybackDelay(820, speed));
        }

        function draw() {
            const current = steps[step];
            const range = mode === 'binary' && Number.isInteger(current.left) && Number.isInteger(current.right)
                ? [current.left, current.right]
                : null;
            const pointers = mode === 'binary'
                ? [
                    { index: current.left, label: 'L', tone: 'green' },
                    { index: current.mid, label: 'M', tone: 'amber' },
                    { index: current.right, label: 'R', tone: 'red' }
                ].filter(pointer => Number.isInteger(pointer.index) && pointer.index >= 0 && pointer.index < values.length)
                : [
                    { index: current.index, label: 'i', tone: 'blue' }
                ].filter(pointer => Number.isInteger(pointer.index));

            host.innerHTML = `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <label class="iv-field">目标值
                            <input type="number" value="${target}" data-role="target">
                        </label>
                        <button class="iv-button" data-action="apply">应用</button>
                        ${presets.map(value => `<button class="iv-tab${value === target ? ' is-active' : ''}" data-target="${value}">${value}</button>`).join('')}
                    </div>
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev"${step === 0 ? ' disabled' : ''}>上一步</button>
                        <button class="iv-button is-primary" data-action="play">${mode === 'binary' ? '播放二分' : '播放线性'}</button>
                        <button class="iv-button" data-action="pause">暂停</button>
                        <button class="iv-button" data-action="next"${step === steps.length - 1 ? ' disabled' : ''}>下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${renderPlaybackSpeed(speed)}
                    ${renderProgress(step, steps.length)}
                    ${renderStepBadge(step, steps.length)}
                </div>
                <div class="iv-stage is-algorithm">
                    <div class="iv-code-panel">${renderCode(code, current.line)}</div>
                    <div class="iv-panel">
                        <div class="iv-algo-head">
                            <strong>${mode === 'binary' ? '二分查找' : '线性查找'}</strong>
                            <span>${mode === 'binary' ? '折半排除' : '逐项扫描'}</span>
                        </div>
                        ${renderVariableStrip(mode === 'binary'
                            ? [
                                { label: 'target', value: target, hot: true },
                                { label: 'left', value: current.left },
                                { label: 'mid', value: current.mid, hot: Number.isInteger(current.mid) },
                                { label: 'right', value: current.right },
                                { label: '比较', value: current.comparisons }
                            ]
                            : [
                                { label: 'target', value: target, hot: true },
                                { label: 'i', value: current.index },
                                { label: '比较', value: current.comparisons },
                                { label: '结果', value: Number.isInteger(current.foundIndex) ? current.foundIndex : '-' }
                            ])}
                        ${renderAlgorithmBars(values, {
                            prefix: 'arr',
                            compareIndices: current.compareIndices,
                            currentIndex: Number.isInteger(current.index) ? current.index : null,
                            foundIndex: current.foundIndex,
                            eliminatedIndices: current.scannedIndices || current.eliminatedIndices,
                            range,
                            midIndex: current.midIndex,
                            pointers
                        })}
                    </div>
                </div>
                <div class="iv-status">${current.text}</div>
            </div>`;

            const targetInput = host.querySelector('[data-role="target"]');
            const applyTarget = () => rebuild(targetInput.value);
            targetInput.addEventListener('keydown', event => {
                if (event.key === 'Enter') applyTarget();
            });
            host.querySelector('[data-action="apply"]').addEventListener('click', applyTarget);
            const prevButton = host.querySelector('[data-action="prev"]');
            const nextButton = host.querySelector('[data-action="next"]');
            if (prevButton) prevButton.addEventListener('click', () => { stop(); setStep(step - 1); });
            if (nextButton) nextButton.addEventListener('click', () => { stop(); setStep(step + 1); });
            host.querySelector('[data-action="play"]').addEventListener('click', play);
            host.querySelector('[data-action="pause"]').addEventListener('click', stop);
            host.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); setStep(0); });
            bindPlaybackSpeed(host, nextSpeed => {
                speed = nextSpeed;
                stop();
                draw();
            });
            host.querySelectorAll('[data-target]').forEach(button => {
                button.addEventListener('click', () => rebuild(button.getAttribute('data-target')));
            });
        }

        draw();
    }

    function buildRecursionSteps(n) {
        const steps = [{
            phase: 'start',
            line: 0,
            stack: [],
            results: [],
            text: `准备计算 factorial(${n})。递归会先不断调用更小的 factorial，直到遇到 n <= 1。`
        }];
        const stack = [];

        for (let current = n; current >= 1; current -= 1) {
            stack.push({ n: current, waiting: current > 1 ? `${current} * factorial(${current - 1})` : 'return 1' });
            steps.push({
                phase: current > 1 ? 'call' : 'base',
                line: current > 1 ? 3 : 1,
                stack: stack.map(item => ({ ...item })),
                results: [],
                activeN: current,
                text: current > 1
                    ? `进入 factorial(${current})：还不能得到结果，需要先计算 factorial(${current - 1})。`
                    : '进入 factorial(1)：满足终止条件，直接返回 1，递归开始回溯。'
            });
        }

        let returned = 1;
        const results = [{ n: 1, value: 1 }];
        for (let current = 2; current <= n; current += 1) {
            returned *= current;
            stack.pop();
            results.push({ n: current, value: returned });
            steps.push({
                phase: 'return',
                line: 3,
                stack: stack.map(item => ({ ...item })),
                results: results.map(item => ({ ...item })),
                activeN: current,
                text: `回到 factorial(${current})：已知 factorial(${current - 1}) = ${Math.floor(returned / current)}，所以返回 ${current} * ${Math.floor(returned / current)} = ${returned}。`
            });
        }

        steps.push({
            phase: 'done',
            line: 4,
            stack: [],
            results: results.map(item => ({ ...item })),
            text: `递归全部返回，factorial(${n}) = ${returned}。`
        });

        return steps;
    }

    function initRecursionTree(element) {
        const host = element.querySelector('[data-visual-host]') || element;
        let n = Math.max(1, Math.min(7, Number(element.getAttribute('data-n') || 5)));
        let steps = buildRecursionSteps(n);
        let visual;
        const code = [
            'int factorial(int n) {',
            'if (n &lt;= 1) return 1;',
            '/* 递归出口以上会停止继续调用 */',
            'return n * factorial(n - 1);',
            '}'
        ];

        function createVisual() {
            visual = initSteppedVisual({
                host,
                playLabel: '播放递归',
                interval: 880,
                getLength: () => steps.length,
                render(step, helpers) {
                    const current = steps[step];
                    const stackItems = current.stack.length ? current.stack : [];
                    return `<div class="iv-shell">
                        <div class="iv-control-bar">
                            <label class="iv-field">n
                                <input type="number" min="1" max="7" value="${n}" data-role="recursion-n">
                            </label>
                            ${helpers.controls}
                            ${helpers.progress}
                        </div>
                        <div class="iv-stage">
                            <div class="iv-code-panel">${renderCode(code, current.line)}</div>
                            <div class="iv-panel">
                                <div class="iv-algo-head">
                                    <strong>factorial(${n}) 调用栈</strong>
                                    <span>${current.phase === 'return' ? '返回回溯' : current.phase === 'done' ? '完成' : '调用展开'}</span>
                                </div>
                                <div class="iv-recursion-scene">
                                    <div class="iv-recursion-stack">
                                        ${stackItems.length ? stackItems.map((frame, index) => `<div class="iv-recursion-frame${frame.n === current.activeN ? ' is-active' : ''}">
                                            <span>第 ${index + 1} 层</span>
                                            <strong>factorial(${frame.n})</strong>
                                            <em>${frame.waiting}</em>
                                        </div>`).join('') : '<div class="iv-recursion-empty">调用栈已清空</div>'}
                                    </div>
                                    <div class="iv-return-ladder">
                                        ${current.results.length ? current.results.map(item => `<div class="iv-return-step${item.n === current.activeN ? ' is-active' : ''}">
                                            <span>factorial(${item.n})</span>
                                            <strong>${item.value}</strong>
                                        </div>`).join('') : '<div class="iv-recursion-empty">等待第一个返回值</div>'}
                                    </div>
                                </div>
                                ${renderVariableStrip([
                                    { label: '当前 n', value: current.activeN || '-' },
                                    { label: '栈帧数', value: current.stack.length, hot: current.phase === 'call' || current.phase === 'base' },
                                    { label: '已返回层数', value: current.results.length }
                                ])}
                                ${renderTeachingNote('递归的关键理解：函数不断调用自己，每次调用都”暂停”等下一层的结果。到达终止条件后，答案从最底层逐层传回来。就像传话游戏——最后一棒往回传，第一棒才能说出最终答案。')}
                            </div>
                        </div>
                        <div class="iv-status" aria-live="polite">${current.text}</div>
                    </div>`;
                },
                bind({ stop }) {
                    host.querySelector('[data-role="recursion-n"]').addEventListener('change', event => {
                        if (visual) visual.stop();
                        n = Math.max(1, Math.min(7, Number(event.target.value) || 1));
                        steps = buildRecursionSteps(n);
                        stop();
                        createVisual();
                        visual.draw();
                    });
                }
            });
        }

        createVisual();
        visual.draw();
    }

    function initCallStack(element) {
        const steps = [
            { text: '程序从 main 开始执行，栈上压入 main 的栈帧——就像打开一本书的第一页。', activeLine: 0, frames: [{ name: 'main()', vars: ['a 尚未创建'], active: true }], console: ['程序开始'] },
            { text: '在 main 中创建变量 a，赋值为 5。', activeLine: 1, frames: [{ name: 'main()', vars: ['a = 5', 'b 尚未创建'], active: true }], console: ['程序开始', '调用前: a = 5'] },
            { text: '调用 doubleIt(a)：main 暂停，系统在栈顶为 doubleIt 创建新栈帧，参数 x 得到 a 的副本 5。这就是"传值调用"。', activeLine: 2, frames: [{ name: 'main()', vars: ['a = 5', '等待返回值'], active: false }, { name: 'doubleIt(x)', vars: ['x = 5', 'result 尚未创建'], active: true }], console: ['程序开始', '调用前: a = 5', '进入函数: x = 5'] },
            { text: 'doubleIt 计算 result = x * 2 = 10。变量 result 只在 doubleIt 的栈帧里存在。', activeLine: 3, frames: [{ name: 'main()', vars: ['a = 5', '等待返回值'], active: false }, { name: 'doubleIt(x)', vars: ['x = 5', 'result = 10'], active: true }], console: ['程序开始', '调用前: a = 5', '进入函数: x = 5', '函数返回: 10'] },
            { text: 'doubleIt 返回 10，它的栈帧被销毁。返回值赋给 main 中的 b。栈又只剩 main 一帧——就像合上了子函数这一页。', activeLine: 4, frames: [{ name: 'main()', vars: ['a = 5', 'b = 10'], active: true }], console: ['程序开始', '调用前: a = 5', '进入函数: x = 5', '函数返回: 10', '调用后: a = 5, b = 10', '程序结束'] }
        ];
        const code = ['int a = 5;', 'printf("调用前: a = %d", a);', 'int b = doubleIt(a);', 'return x * 2;', 'printf("调用后: a = %d, b = %d", a, b);'];

        initTimelineVisual(element, (step, helpers) => {
            const current = steps[step];
            return `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev">上一步</button>
                        <button class="iv-button is-primary" data-action="play">播放</button>
                        <button class="iv-button" data-action="next">下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${helpers.progress}
                </div>
                <div class="iv-stage">
                    <div class="iv-code-panel">${renderCode(code, current.activeLine)}</div>
                    <div class="iv-stack-scene">
                        <div class="iv-stack">
                            ${current.frames.map(frame => `<div class="iv-stack-frame${frame.active ? ' is-active' : ''}">
                                <strong>${frame.name}</strong>
                                ${frame.vars.map(item => `<span>${item}</span>`).join('')}
                            </div>`).join('')}
                        </div>
                        <div class="iv-console">
                            ${steps[steps.length - 1].console.map(item => `<div class="iv-console-line${current.console.includes(item) ? ' is-visible' : ''}">${item}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="iv-status">${current.text}</div>
            </div>`;
        }, steps.length);
    }

    function initHeap(element) {
        const steps = [
            { text: '声明指针 p，它现在还是"野指针"——没有指向任何合法位置，不能解引用。', line: 0, p: '未初始化', heap: 'none' },
            { text: 'malloc 在堆区申请了 4 字节空间，返回这块空间的起始地址 0x5000 存进 p。此时堆里的内容是随机垃圾值。', line: 1, p: '0x5000', heap: 'garbage' },
            { text: '用 if (p == NULL) 检查分配是否成功——如果内存不够，malloc 会返回 NULL。', line: 2, p: '0x5000', heap: 'garbage' },
            { text: '*p = 42：通过 p 里的地址找到堆区空间，写入 42，垃圾值被覆盖。', line: 3, p: '0x5000', heap: 'value' },
            { text: 'free(p) 把堆空间还给系统。p 仍然存着 0x5000，但这块内存已经不属于你了——再用就是"悬空指针"。', line: 4, p: '0x5000', heap: 'freed' },
            { text: 'p = NULL：主动把指针清空，避免之后不小心使用已释放的地址。这是好习惯。', line: 5, p: 'NULL', heap: 'freed' }
        ];
        const code = ['int *p;', 'p = malloc(sizeof(int));', 'if (p == NULL) return 1;', '*p = 42;', 'free(p);', 'p = NULL;'];

        initTimelineVisual(element, (step, helpers) => {
            const current = steps[step];
            const heapClass = current.heap === 'value' ? 'is-allocated' : current.heap === 'freed' ? 'is-freed' : current.heap === 'garbage' ? 'is-allocated' : '';
            const heapValueClass = current.heap === 'garbage' ? 'is-garbage' : current.heap === 'freed' ? 'is-freed' : '';
            const heapValue = current.heap === 'none' ? '未分配' : current.heap === 'garbage' ? '随机值' : current.heap === 'value' ? '42' : '已释放';
            const connected = current.p !== '未初始化' && current.p !== 'NULL';

            return `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="prev">上一步</button>
                        <button class="iv-button is-primary" data-action="play">播放</button>
                        <button class="iv-button" data-action="next">下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${helpers.progress}
                </div>
                <div class="iv-stage">
                    <div class="iv-code-panel">${renderCode(code, current.line)}</div>
                    <div class="iv-panel">
                        <div class="iv-heap-scene">
                            ${renderMemoryCard({
                                title: '栈上指针 p',
                                value: current.p,
                                meta: current.p === 'NULL' ? '安全空指针' : '保存堆区地址',
                                kind: 'pointer',
                                active: step === 1 || step === 5
                            })}
                            <div class="iv-arrow-lane">${connected ? '<div class="iv-arrow"></div>' : '<span class="iv-null-badge">无有效连接</span>'}</div>
                            <div class="iv-heap-block ${heapClass}">
                                <div class="iv-heap-label">堆区 0x5000</div>
                                <div class="iv-heap-value ${heapValueClass}">${heapValue}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="iv-status">${current.text}</div>
            </div>`;
        }, steps.length);
    }

    function initBitwise(element, mode) {
        const host = element.querySelector('[data-visual-host]') || element;
        let a = Number(element.getAttribute('data-a') || 12);
        let b = Number(element.getAttribute('data-b') || 10);
        let op = element.getAttribute('data-op') || '&';
        let step = 0;
        let timer = null;
        let speed = 'normal';

        function calculate() {
            if (mode === 'shift') {
                const direction = element.getAttribute('data-direction') || 'left';
                const shift = Number(element.getAttribute('data-shift') || b);
                return direction === 'right' ? (a >> shift) & 255 : (a << shift) & 255;
            }
            if (op === '|') return (a | b) & 255;
            if (op === '^') return (a ^ b) & 255;
            return (a & b) & 255;
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function renderBits(label, bits, activeUntil, resultMode) {
            return `<div class="iv-bit-row">
                <span class="iv-bit-label">${label}</span>
                ${bits.map((bit, index) => `<span class="iv-bit-cell${bit ? ' is-one' : ''}${index <= activeUntil ? ' is-active' : ''}${resultMode && index > activeUntil ? ' is-muted' : ''}">${bit}</span>`).join('')}
                <span class="iv-bit-out">${bits.join('')}</span>
            </div>`;
        }

        function draw() {
            const result = calculate();
            const aBits = toBits(a);
            const bBits = toBits(b);
            const rBits = toBits(result);
            const title = mode === 'shift'
                ? `${a} &lt;&lt; ${b} = ${result}`
                : `${a} ${op} ${b} = ${result}`;
            const activeUntil = Math.max(0, step);

            host.innerHTML = `<div class="iv-shell">
                <div class="iv-control-bar">
                    <div class="iv-control-group">
                        <label class="iv-field">左值 <input type="number" min="0" max="255" value="${a}" data-role="a"></label>
                        ${mode === 'shift'
                            ? `<label class="iv-field">位数 <input type="number" min="0" max="7" value="${b}" data-role="b"></label>`
                            : `<label class="iv-field">右值 <input type="number" min="0" max="255" value="${b}" data-role="b"></label>
                               <label class="iv-field">运算 <select data-role="op">
                                   <option value="&"${op === '&' ? ' selected' : ''}>&amp;</option>
                                   <option value="|"${op === '|' ? ' selected' : ''}>|</option>
                                   <option value="^"${op === '^' ? ' selected' : ''}>^</option>
                               </select></label>`}
                    </div>
                    <div class="iv-control-group">
                        <button class="iv-button" data-action="reset">重置</button>
                        <button class="iv-button" data-action="next">下一列</button>
                        <button class="iv-button is-primary" data-action="play">逐位播放</button>
                        <button class="iv-button" data-action="pause">暂停</button>
                    </div>
                    ${renderPlaybackSpeed(speed)}
                    ${renderStepBadge(activeUntil, 8, '列')}
                </div>
                <div class="iv-panel">
                    <div class="iv-status"><strong>${title}</strong>：当前高亮第 ${activeUntil + 1} 列，结果位会随播放逐列显现。</div>
                    <div class="iv-bit-stage">
                        ${renderBits(String(a), aBits, activeUntil, false)}
                        ${mode === 'shift' ? renderBits('&lt;&lt; 后', toBits(result), activeUntil, true) : renderBits(`${op} ${b}`, bBits, activeUntil, false)}
                        ${mode === 'shift' ? '' : renderBits('结果', rBits, activeUntil, true)}
                    </div>
                </div>
                <p class="visual-note">修改数字或运算符，观察每一位如何决定最终结果。输入数字按 8 位无符号数处理（0~255）。</p>
            </div>`;

            host.querySelector('[data-role="a"]').addEventListener('input', event => {
                a = Math.max(0, Math.min(255, Number(event.target.value) || 0));
                stop();
                draw();
            });
            host.querySelector('[data-role="b"]').addEventListener('input', event => {
                const max = mode === 'shift' ? 7 : 255;
                b = Math.max(0, Math.min(max, Number(event.target.value) || 0));
                stop();
                draw();
            });
            const opSelect = host.querySelector('[data-role="op"]');
            if (opSelect) {
                opSelect.addEventListener('change', event => {
                    op = event.target.value;
                    stop();
                    draw();
                });
            }
            host.querySelector('[data-action="reset"]').addEventListener('click', () => {
                stop();
                step = 0;
                draw();
            });
            host.querySelector('[data-action="next"]').addEventListener('click', () => {
                stop();
                step = Math.min(7, step + 1);
                draw();
            });
            host.querySelector('[data-action="play"]').addEventListener('click', () => {
                stop();
                step = 0;
                draw();
                timer = setInterval(() => {
                    if (step >= 7) {
                        stop();
                        return;
                    }
                    step += 1;
                    draw();
                }, getPlaybackDelay(420, speed));
            });
            host.querySelector('[data-action="pause"]').addEventListener('click', stop);
            bindPlaybackSpeed(host, nextSpeed => {
                speed = nextSpeed;
                stop();
                draw();
            });
        }

        draw();
    }

    document.querySelectorAll('[data-visual]').forEach(element => {
        const type = element.getAttribute('data-visual');
        if (type === 'compile-pipeline') initCompilePipeline(element);
        if (type === 'binary-weights') initBinaryWeights(element);
        if (type === 'pointer-deref') initPointerDeref(element);
        if (type === 'array-pointer') initArrayPointer(element);
        if (type === 'array-access') initArrayAccess(element);
        if (type === 'string-scan') initStringScan(element);
        if (type === 'call-stack') initCallStack(element);
        if (type === 'recursion-tree') initRecursionTree(element);
        if (type === 'heap-lifecycle') initHeap(element);
        if (type === 'bitwise-playground') initBitwise(element, 'bitwise');
        if (type === 'shift-playground') initBitwise(element, 'shift');
        if (type === 'bubble-sort') initSortVisual(element, 'bubble');
        if (type === 'selection-sort') initSortVisual(element, 'selection');
        if (type === 'linear-search') initSearchVisual(element, 'linear');
        if (type === 'binary-search') initSearchVisual(element, 'binary');
        if (type === 'variable-lifecycle') initVariableLifecycle(element);
        if (type === 'expression-trace') initExpressionTrace(element);
        if (type === 'branch-flow') initBranchFlow(element);
        if (type === 'loop-flow') initLoopFlow(element);
        if (type === 'scope-lookup') initScopeLookup(element);
        if (type === 'macro-expansion') initMacroExpansion(element);
        if (type === 'struct-layout') initStructLayout(element);
    });

});
