/**
 * C语言教程讲义 - 公共脚本
 * 
 * 包含以下功能：
 * 1. 代码块复制按钮
 * 2. 导航栏滚动高亮
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ============================================
       1. 代码块复制按钮
       - 自动为每个 .code-block 添加复制按钮
       ============================================ */
    const codeBlocks = document.querySelectorAll('.code-block');

    codeBlocks.forEach(function (block) {
        const title = block.querySelector('.code-block-title');
        if (title) {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';

            copyButton.addEventListener('click', function () {
                const code = block.querySelector('code');
                if (code) {
                    const textToCopy = code.textContent;
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();

                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            copyButton.classList.add('copied');
                            setTimeout(function () {
                                copyButton.classList.remove('copied');
                            }, 2000);
                        }
                    } catch (err) {
                        // 复制失败时不设置 textContent，由 CSS ::before 控制
                    }

                    document.body.removeChild(textArea);
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

    // 点击导航链接时更新高亮
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
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
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

});
