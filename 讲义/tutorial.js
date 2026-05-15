/**
 * C语言教程讲义 - 公共脚本
 * 
 * 包含以下功能：
 * 1. 代码块复制按钮
 * 2. 导航栏滚动高亮
 * 3. 阅读进度条
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

});
