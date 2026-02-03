/**
 * Results Management Module
 * Handles Exam Results Data
 */

import { db } from '../../assets/js/system/store.js';
import { Utils } from '../../assets/js/system/utils.js';

export const ResultsView = {
    render(container) {
        container.innerHTML = `
            <div class="module-header" style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                <h2>Exam Results Management</h2>
                <div>
                     <input type="text" id="params-search" placeholder="Search Reg No..." style="padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
                     <button class="btn" id="btn-add-result">+ Add Result</button>
                </div>
            </div>
            <div id="results-list" class="grid-list">Loading...</div>
            
            <!-- Result Modal -->
            <div id="result-modal" class="modal hidden" style="position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:100; display:none;">
                <div class="modal-content" style="background:white; padding:2rem; width:500px; max-width:90%; border-radius:0.5rem; max-height:90vh; overflow-y:auto;">
                    <h3 id="res-modal-title">Add Result</h3>
                    <form id="result-form" style="display:flex; flex-direction:column; gap:1rem;">
                        <input type="hidden" id="res-id">
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                            <div>
                                <label>Reg Number (Unique)</label>
                                <input type="text" id="res-regno" required style="width:100%; padding:0.5rem;">
                            </div>
                            <div>
                                <label>Exam Section</label>
                                <select id="res-section" style="width:100%; padding:0.5rem;">
                                    <option value="Public Exam">Public Exam</option>
                                    <option value="Entrance">Entrance</option>
                                    <option value="Internal">Internal</option>
                                    <option value="Scholarship">Scholarship</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label>Student Name</label>
                            <input type="text" id="res-name" required style="width:100%; padding:0.5rem;">
                        </div>

                        <div>
                            <label>Status</label>
                            <select id="res-status" style="width:100%; padding:0.5rem;">
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                                <option value="Withheld">Withheld</option>
                            </select>
                        </div>

                        <div>
                            <label>Details / Marks (JSON or Text)</label>
                            <textarea id="res-details" rows="5" placeholder="Enter marks or details..." style="width:100%; padding:0.5rem; font-family:monospace;"></textarea>
                            <small style="color:gray;">You can enter simple text or JSON for complex tables.</small>
                        </div>

                        <div style="display:flex; gap:1rem; margin-top:1rem;">
                            <button type="submit" class="btn">Save Result</button>
                            <button type="button" class="btn" style="background:#64748b;" id="btn-res-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.attachEvents(container);
        this.renderList();
    },

    attachEvents(container) {
        // Modal Logic
        const modal = container.querySelector('#result-modal');
        const form = container.querySelector('#result-form');

        container.querySelector('#btn-add-result').onclick = () => {
            form.reset();
            document.getElementById('res-id').value = '';
            document.getElementById('res-modal-title').textContent = 'Add Result';
            modal.style.display = 'flex';
        };

        container.querySelector('#btn-res-cancel').onclick = () => {
            modal.style.display = 'none';
        };

        container.querySelector('#params-search').oninput = Utils.debounce((e) => {
            this.renderList(e.target.value);
        }, 300);

        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveResult();
            modal.style.display = 'none';
        };
    },

    renderList(query = '') {
        const list = document.getElementById('results-list');
        let results = db.get('results');

        if (query) {
            const q = query.toLowerCase();
            results = results.filter(r =>
                r.regno.toLowerCase().includes(q) ||
                r.name.toLowerCase().includes(q)
            );
        }

        if (results.length === 0) {
            list.innerHTML = '<p>No results found.</p>';
            return;
        }

        list.innerHTML = results.map(r => `
            <div class="result-card" style="background:white; padding:1rem; margin-bottom:0.5rem; border-radius:0.5rem; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${r.name}</strong> <span style="font-family:monospace; background:#e2e8f0; padding:2px 4px; border-radius:4px;">${r.regno}</span>
                    <br>
                    <span style="font-size:0.85rem; color:#64748b;">${r.section} - ${r.status}</span>
                </div>
                <div>
                     <button onclick="window.editResult('${r.id}')" class="btn" style="padding:0.25rem 0.5rem; font-size:0.8rem;">Edit</button>
                     <button onclick="window.deleteResult('${r.id}')" class="btn" style="padding:0.25rem 0.5rem; font-size:0.8rem; background:#fee2e2; color:#ef4444;">Del</button>
                </div>
            </div>
        `).join('');

        window.deleteResult = (id) => {
            if (confirm('Delete result?')) {
                db.delete('results', id);
                this.renderList(document.getElementById('params-search').value);
            }
        };

        window.editResult = (id) => {
            const r = db.getById('results', id);
            if (!r) return;

            document.getElementById('res-id').value = r.id;
            document.getElementById('res-regno').value = r.regno;
            document.getElementById('res-name').value = r.name;
            document.getElementById('res-section').value = r.section;
            document.getElementById('res-status').value = r.status;
            document.getElementById('res-details').value = r.details || '';

            document.getElementById('res-modal-title').textContent = 'Edit Result';
            document.getElementById('result-modal').style.display = 'flex';
        };
    },

    saveResult() {
        const id = document.getElementById('res-id').value;
        const data = {
            regno: document.getElementById('res-regno').value,
            name: document.getElementById('res-name').value,
            section: document.getElementById('res-section').value,
            status: document.getElementById('res-status').value,
            details: document.getElementById('res-details').value
        };

        if (id) {
            db.update('results', id, data);
        } else {
            data.id = Utils.generateId('res');
            data.date = new Date().toISOString();
            db.add('results', data);
        }

        this.renderList();
    }
};
