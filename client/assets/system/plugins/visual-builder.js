/**
 * VisualBuilder Plugin
 * A lightweight block-based page builder (Elementor-style).
 */

class VisualBuilder {
    constructor() {
        this.core = null;
        this.blocks = [];
        this.container = null;
    }

    init(core) {
        this.core = core;
        window.VisualBuilder = this; // Expose API
    }

    /**
     * Open the Editor in a Modal
     * @param {String} currentHtml - Existing HTML content
     * @param {Function} onSave - Callback(newHtml)
     */
    open(currentHtml, onSave) {
        this.blocks = this.parseHtmlToBlocks(currentHtml);
        this.onSave = onSave;
        this.renderUI();
    }

    /**
     * Convert HTML string to Block JSON (Basic Parser)
     */
    parseHtmlToBlocks(html) {
        if (!html) return [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const nodes = Array.from(doc.body.children);

        return nodes.map(node => {
            if (node.tagName.match(/^H[1-6]$/)) {
                return { type: 'heading', tag: node.tagName.toLowerCase(), text: node.innerText, align: node.style.textAlign || 'left' };
            }
            if (node.tagName === 'P') {
                return { type: 'text', content: node.innerHTML };
            }
            if (node.tagName === 'IMG') {
                return { type: 'image', src: node.src, width: node.style.width || '100%' };
            }
            if (node.tagName === 'DIV' && node.className.includes('btn-wrapper')) {
                const a = node.querySelector('a');
                return { type: 'button', text: a.innerText, link: a.getAttribute('href'), variant: a.className.includes('btn-primary') ? 'primary' : 'secondary' };
            }
            // Fallback: Raw HTML
            return { type: 'html', content: node.outerHTML };
        });
    }

    renderUI() {
        // Create Fullscreen Modal
        let modal = document.getElementById('vb-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'vb-modal';
            Object.assign(modal.style, {
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: '#1a1a1a', zIndex: 10000, display: 'flex'
            });
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <!-- Sidebar -->
            <div style="width: 300px; background: #0a0a0a; border-right: 1px solid #333; display: flex; flex-direction: column;">
                <div style="padding: 20px; border-bottom: 1px solid #333; color: #fff; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                    <i class="ph-fill ph-layout"></i> Visual Builder
                </div>
                
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 10px; text-transform: uppercase;">Elements</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${this.renderWidgetBtn('Heading', 'ph-text-h-one', 'heading')}
                        ${this.renderWidgetBtn('Text Editor', 'ph-text-aa', 'text')}
                        ${this.renderWidgetBtn('Image', 'ph-image', 'image')}
                        ${this.renderWidgetBtn('Button', 'ph-hand-pointing', 'button')}
                        ${this.renderWidgetBtn('Spacer', 'ph-arrows-out-line-vertical', 'spacer')}
                        ${this.renderWidgetBtn('HTML', 'ph-code', 'html')}
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #333;">
                    <button class="btn-primary" style="width: 100%;" onclick="window.VisualBuilder.saveAndClose()">
                        <i class="ph ph-check"></i> Save & Exit
                    </button>
                    <button style="width: 100%; background: none; border: none; color: #666; margin-top: 10px; cursor: pointer;" onclick="window.VisualBuilder.close()">Cancel</button>
                </div>
            </div>

            <!-- Canvas -->
            <div style="flex: 1; padding: 40px; overflow-y: auto; background: #111;">
                <div id="vb-canvas" style="max-width: 800px; min-height: 80vh; background: #fff; margin: 0 auto; box-shadow: 0 0 50px rgba(0,0,0,0.5); padding: 40px; color: #000; font-family: sans-serif;">
                    <!-- Blocks Rendered Here -->
                </div>
            </div>
        `;

        this.renderCanvas();
    }

    renderWidgetBtn(label, icon, type) {
        return `
            <div onclick="window.VisualBuilder.addBlock('${type}')" 
                 style="background: #222; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center; transition: 0.2s; border: 1px solid transparent;"
                 onmouseover="this.style.borderColor='var(--primary-color)'"
                 onmouseout="this.style.borderColor='transparent'">
                <i class="ph ${icon}" style="font-size: 1.5rem; color: #ccc; margin-bottom: 5px;"></i>
                <div style="font-size: 0.8rem; color: #888;">${label}</div>
            </div>
        `;
    }

    renderCanvas() {
        const canvas = document.getElementById('vb-canvas');
        if (!canvas) return;

        canvas.innerHTML = this.blocks.map((block, index) => `
            <div class="vb-block-wrapper" style="position: relative; border: 1px dashed transparent; padding: 5px;" onmouseover="this.style.border='1px dashed #00f3ff'" onmouseout="this.style.border='1px dashed transparent'">
                <!-- Tools -->
                <div style="position: absolute; right: 0; top: -25px; background: #00f3ff; display: flex; gap: 5px; padding: 5px; border-radius: 4px; display: none;" class="vb-tools">
                    <i class="ph-bold ph-trash" style="color: #000; cursor: pointer;" onclick="window.VisualBuilder.deleteBlock(${index})"></i>
                    <i class="ph-bold ph-arrow-up" style="color: #000; cursor: pointer;" onclick="window.VisualBuilder.moveBlock(${index}, -1)"></i>
                    <i class="ph-bold ph-arrow-down" style="color: #000; cursor: pointer;" onclick="window.VisualBuilder.moveBlock(${index}, 1)"></i>
                </div>
                <!-- Content -->
                ${this.renderBlockContent(block, index)}
            </div>
        `).join('') + `
            <div style="padding: 40px; border: 2px dashed #eee; text-align: center; color: #ccc; margin-top: 20px;">
                Drag widgets here or click to add
            </div>
        `;

        // CSS for hover effect
        document.querySelectorAll('.vb-block-wrapper').forEach(el => {
            el.addEventListener('mouseenter', () => el.querySelector('.vb-tools').style.display = 'flex');
            el.addEventListener('mouseleave', () => el.querySelector('.vb-tools').style.display = 'none');
        });
    }

    renderBlockContent(block, index) {
        // Editable Inputs
        if (block.type === 'heading') {
            return `<input value="${block.text}" oninput="window.VisualBuilder.updateBlock(${index}, 'text', this.value)" style="width: 100%; font-size: 2rem; font-weight: bold; border: none; outline: none; text-align: ${block.align}; background: transparent;">`;
        }
        if (block.type === 'text') {
            return `<textarea oninput="window.VisualBuilder.updateBlock(${index}, 'content', this.value)" style="width: 100%; min-height: 100px; resize: vertical; border: none; outline: none; font-family: inherit; font-size: 1rem; color: #333; background: transparent;">${block.content}</textarea>`;
        }
        if (block.type === 'image') {
            return `
                <div style="text-align: center;">
                    <img src="${block.src}" style="max-width: 100%; width: ${block.width}; border-radius: 8px;">
                    <button class="btn-secondary" style="margin-top: 10px;" onclick="document.getElementById('vb-img-${index}').click()">Change Image</button>
                    <input type="file" id="vb-img-${index}" style="display:none" accept="image/*" onchange="window.VisualBuilder.handleImageUpload(${index}, this)">
                </div>
            `;
        }
        if (block.type === 'button') {
            return `
                <div style="text-align: center; padding: 20px;">
                    <input value="${block.text}" oninput="window.VisualBuilder.updateBlock(${index}, 'text', this.value)" style="display: inline-block; padding: 10px 20px; background: ${block.variant === 'primary' ? '#00f3ff' : '#eee'}; color: #000; border: none; border-radius: 5px; font-weight: bold; text-align: center;">
                </div>
            `;
        }
        return `[Unknown Block: ${block.type}]`;
    }

    // --- Actions ---

    addBlock(type) {
        const defaults = {
            heading: { type: 'heading', tag: 'h2', text: 'New Heading', align: 'left' },
            text: { type: 'text', content: 'Lorem ipsum dolor sit amet...' },
            image: { type: 'image', src: 'https://via.placeholder.com/800x400', width: '100%' },
            button: { type: 'button', text: 'Click Me', link: '#', variant: 'primary' },
            spacer: { type: 'spacer', height: '50px' }
        };
        this.blocks.push({ ...defaults[type], id: Date.now() });
        this.renderCanvas();
    }

    updateBlock(index, field, value) {
        this.blocks[index][field] = value;
    }

    deleteBlock(index) {
        this.blocks.splice(index, 1);
        this.renderCanvas();
    }

    moveBlock(index, dir) {
        if (index + dir < 0 || index + dir >= this.blocks.length) return;
        const temp = this.blocks[index];
        this.blocks[index] = this.blocks[index + dir];
        this.blocks[index + dir] = temp;
        this.renderCanvas();
    }

    async handleImageUpload(index, input) {
        if (input.files && input.files[0]) {
            try {
                // Use MediaOptimizer via core or dynamic import
                // Quick hack: assume global or re-import
                const { MediaOptimizer } = await import('../../media-optimizer.js');
                const data = await MediaOptimizer.processImage(input.files[0]);
                this.blocks[index].src = data;
                this.renderCanvas();
            } catch (e) {
                alert('Image upload failed: ' + e);
            }
        }
    }

    saveAndClose() {
        const html = this.generateHtml();
        if (this.onSave) this.onSave(html);
        this.close();
    }

    generateHtml() {
        return this.blocks.map(b => {
            if (b.type === 'heading') return `<${b.tag} style="text-align: ${b.align}">${b.text}</${b.tag}>`;
            if (b.type === 'text') return `<p>${b.content}</p>`;
            if (b.type === 'image') return `<img src="${b.src}" style="width: ${b.width}; border-radius: 8px; margin: 20px 0;">`;
            if (b.type === 'button') return `<div class="btn-wrapper" style="text-align: center; margin: 20px 0;"><a href="${b.link}" class="btn ${b.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}">${b.text}</a></div>`;
            return '';
        }).join('\n');
    }

    close() {
        document.getElementById('vb-modal')?.remove();
    }
}

// Register
if (window.MHMV) {
    window.MHMV.registerPlugin('VisualBuilder', new VisualBuilder());
} else {
    window.addEventListener('load', () => window.MHMV?.registerPlugin('VisualBuilder', new VisualBuilder()));
}
