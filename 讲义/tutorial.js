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
        return lines.map((line, index) => (
            `<div class="iv-code-line${index === activeIndex ? ' is-active' : ''}" data-line="${index + 1}">${line}</div>`
        )).join('');
    }

    function renderProgress(current, total) {
        const percent = total <= 1 ? 100 : (current / (total - 1)) * 100;
        return `<div class="iv-progress" style="--iv-progress:${percent}%"><span></span></div>`;
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
            }, 900);
        }

        function draw() {
            host.innerHTML = renderer(step, {
                progress: renderProgress(step, stepsLength),
            });

            const prevButton = host.querySelector('[data-action="prev"]');
            const nextButton = host.querySelector('[data-action="next"]');
            const playButton = host.querySelector('[data-action="play"]');
            const resetButton = host.querySelector('[data-action="reset"]');

            if (prevButton) prevButton.addEventListener('click', () => { stop(); setStep(step - 1); });
            if (nextButton) nextButton.addEventListener('click', () => { stop(); setStep(step + 1); });
            if (playButton) playButton.addEventListener('click', play);
            if (resetButton) resetButton.addEventListener('click', () => { stop(); setStep(0); });
        }

        draw();
    }

    function initPointerDeref(element) {
        const steps = [
            '先创建普通变量 a，值是 100。',
            '执行 int *p = &a，p 保存 a 的地址。',
            '读取 *p 时，程序沿着 p 保存的地址找到 a。',
            '执行 *p = 200，真正被修改的是 a 这块内存。',
            'p = NULL 后，p 不再指向有效内存，不能解引用。'
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
            { index: 0, output: 'H', text: '从 str[0] 开始读取，输出 H。' },
            { index: 1, output: 'He', text: '继续读取 str[1]，输出 e。' },
            { index: 2, output: 'Hel', text: '继续读取 str[2]，输出 l。' },
            { index: 3, output: 'Hell', text: '继续读取 str[3]，输出 l。' },
            { index: 4, output: 'Hello', text: '继续读取 str[4]，输出 o。' },
            { index: 5, output: 'Hello', text: '遇到 str[5] 的 \\0，字符串读取停止。' }
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
            }, 760);
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
                        <button class="iv-button" data-action="next"${step === steps.length - 1 ? ' disabled' : ''}>下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    <div class="iv-control-group">
                        ${datasets.map(dataset => `<button class="iv-tab${dataset.key === datasetKey ? ' is-active' : ''}" data-dataset="${dataset.key}">${dataset.label}</button>`).join('')}
                    </div>
                    ${renderProgress(step, steps.length)}
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
            host.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); setStep(0); });
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
            }, 820);
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
                        <button class="iv-button" data-action="next"${step === steps.length - 1 ? ' disabled' : ''}>下一步</button>
                        <button class="iv-button" data-action="reset">重置</button>
                    </div>
                    ${renderProgress(step, steps.length)}
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
            host.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); setStep(0); });
            host.querySelectorAll('[data-target]').forEach(button => {
                button.addEventListener('click', () => rebuild(button.getAttribute('data-target')));
            });
        }

        draw();
    }

    function initCallStack(element) {
        const steps = [
            { text: '程序进入 main，调用栈里只有 main 的栈帧。', activeLine: 0, frames: [{ name: 'main()', vars: ['a 尚未创建'], active: true }], console: ['程序开始'] },
            { text: '创建局部变量 a，值为 5。', activeLine: 1, frames: [{ name: 'main()', vars: ['a = 5', 'b 尚未创建'], active: true }], console: ['程序开始', '调用前: a = 5'] },
            { text: '调用 doubleIt(a)：main 暂停，x 得到 a 的副本。', activeLine: 2, frames: [{ name: 'main()', vars: ['a = 5', '等待返回值'], active: false }, { name: 'doubleIt(x)', vars: ['x = 5', 'result 尚未创建'], active: true }], console: ['程序开始', '调用前: a = 5', '进入函数: x = 5'] },
            { text: 'doubleIt 内部计算 result = x * 2，得到 10。', activeLine: 3, frames: [{ name: 'main()', vars: ['a = 5', '等待返回值'], active: false }, { name: 'doubleIt(x)', vars: ['x = 5', 'result = 10'], active: true }], console: ['程序开始', '调用前: a = 5', '进入函数: x = 5', '函数返回: 10'] },
            { text: '函数返回后 doubleIt 栈帧销毁，返回值赋给 b。', activeLine: 4, frames: [{ name: 'main()', vars: ['a = 5', 'b = 10'], active: true }], console: ['程序开始', '调用前: a = 5', '进入函数: x = 5', '函数返回: 10', '调用后: a = 5, b = 10', '程序结束'] }
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
            { text: '声明指针变量 p，此时还没有可用的堆空间。', line: 0, p: '未初始化', heap: 'none' },
            { text: 'malloc 在堆区申请 sizeof(int) 字节，并把起始地址返回给 p。', line: 1, p: '0x5000', heap: 'garbage' },
            { text: '检查 p 是否为 NULL，确认分配成功后才能继续使用。', line: 2, p: '0x5000', heap: 'garbage' },
            { text: '执行 *p = 42，沿着地址写入堆区那块内存。', line: 3, p: '0x5000', heap: 'value' },
            { text: 'free(p) 释放堆区空间；此时 p 仍保存旧地址，但旧地址已经不能再用。', line: 4, p: '0x5000', heap: 'freed' },
            { text: '把 p 置为 NULL，避免后续误用已经释放的地址。', line: 5, p: 'NULL', heap: 'freed' }
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
        let step = 7;
        let timer = null;

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
                    </div>
                </div>
                <div class="iv-panel">
                    <div class="iv-status"><strong>${title}</strong>：当前高亮第 ${activeUntil + 1} 列，结果位会随播放逐列显现。</div>
                    <div class="iv-bit-stage">
                        ${renderBits(String(a), aBits, activeUntil, false)}
                        ${mode === 'shift' ? renderBits('&lt;&lt; 后', toBits(result), activeUntil, true) : renderBits(`${op} ${b}`, bBits, activeUntil, false)}
                        ${mode === 'shift' ? '' : renderBits('结果', rBits, activeUntil, true)}
                    </div>
                </div>
                <p class="visual-note">可以修改数字和运算符，再播放观察每一列如何决定结果。输入按 8 位无符号数显示。</p>
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
                }, 420);
            });
        }

        draw();
    }

    document.querySelectorAll('[data-visual]').forEach(element => {
        const type = element.getAttribute('data-visual');
        if (type === 'pointer-deref') initPointerDeref(element);
        if (type === 'array-pointer') initArrayPointer(element);
        if (type === 'array-access') initArrayAccess(element);
        if (type === 'string-scan') initStringScan(element);
        if (type === 'call-stack') initCallStack(element);
        if (type === 'heap-lifecycle') initHeap(element);
        if (type === 'bitwise-playground') initBitwise(element, 'bitwise');
        if (type === 'shift-playground') initBitwise(element, 'shift');
        if (type === 'bubble-sort') initSortVisual(element, 'bubble');
        if (type === 'selection-sort') initSortVisual(element, 'selection');
        if (type === 'linear-search') initSearchVisual(element, 'linear');
        if (type === 'binary-search') initSearchVisual(element, 'binary');
    });

});
