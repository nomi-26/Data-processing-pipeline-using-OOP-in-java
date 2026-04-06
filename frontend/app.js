// app.js — pipeline builder and API communication

let csvData = { headers: [], rows: [] };
let pipeline = [];

// ── CSV Upload ──────────────────────────────────────────────
document.getElementById('csvFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        csvData = await readCSVFile(file);
        renderPreview();
        renderFieldOptions();
        document.getElementById('csvStatus').textContent = `✓ ${csvData.rows.length} rows loaded`;
        document.getElementById('csvStatus').className = 'status success';
    } catch (err) {
        document.getElementById('csvStatus').textContent = `✗ ${err.message}`;
        document.getElementById('csvStatus').className = 'status error';
    }
});

function renderPreview() {
    const table = document.getElementById('previewTable');
    const { headers, rows } = csvData;
    const preview = rows.slice(0, 5);

    table.innerHTML = `
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${preview.map(row =>
            `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
        ).join('')}</tbody>
    `;
    document.getElementById('previewSection').style.display = 'block';
}

function renderFieldOptions() {
    const selects = document.querySelectorAll('.field-select');
    selects.forEach(select => {
        const current = select.value;
        select.innerHTML = csvData.headers.map(h => `<option value="${h}">${h}</option>`).join('');
        if (current) select.value = current;
    });
}

// ── Node Type Change ────────────────────────────────────────
document.getElementById('nodeType').addEventListener('change', updateNodeConfig);

function updateNodeConfig() {
    const type = document.getElementById('nodeType').value;
    const config = document.getElementById('nodeConfig');

    const fieldSelect = `<select class="field-select" id="nodeField">
        ${csvData.headers.map(h => `<option value="${h}">${h}</option>`).join('')}
    </select>`;

    if (type === 'filter') {
        config.innerHTML = `
            <label>Field</label>${fieldSelect}
            <label>Operator</label>
            <select id="nodeOp">
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
                <option value="==">==</option>
                <option value="contains">contains</option>
                <option value="startsWith">startsWith</option>
                <option value="endsWith">endsWith</option>
            </select>
            <label>Value</label>
            <input type="text" id="nodeValue" placeholder="e.g. 60" />
        `;
    } else if (type === 'transform') {
        config.innerHTML = `
            <label>Field</label>${fieldSelect}
            <label>Operation</label>
            <select id="nodeOp">
                <option value="add">Add (+)</option>
                <option value="subtract">Subtract (-)</option>
                <option value="multiply">Multiply (×)</option>
                <option value="divide">Divide (÷)</option>
                <option value="remainder">Remainder (%)</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
                <option value="concat">Concat</option>
                <option value="substring">Substring (from index)</option>
            </select>
            <label>Value</label>
            <input type="text" id="nodeValue" placeholder="e.g. 10" />
        `;
    } else if (type === 'aggregate') {
        config.innerHTML = `
            <label>Field</label>${fieldSelect}
            <label>Operation</label>
            <select id="nodeOp">
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="max">Max</option>
                <option value="min">Min</option>
                <option value="count">Count</option>
            </select>
        `;
    } else if (type === 'output') {
        config.innerHTML = `<p class="hint">Output node displays final result.</p>`;
    }
}

// ── Add Node to Pipeline ────────────────────────────────────
document.getElementById('addNodeBtn').addEventListener('click', () => {
    const type = document.getElementById('nodeType').value;
    const field = document.getElementById('nodeField')?.value;
    const op = document.getElementById('nodeOp')?.value;
    const valueRaw = document.getElementById('nodeValue')?.value;
    const value = isNaN(Number(valueRaw)) || valueRaw === '' ? valueRaw : Number(valueRaw);

    const node = { node: type };
    if (field) node.field = field;
    if (op) node.op = op;
    if (valueRaw !== undefined && valueRaw !== '') node.value = value;

    pipeline.push(node);
    renderPipeline();
});

function renderPipeline() {
    const container = document.getElementById('pipelineSteps');
    if (pipeline.length === 0) {
        container.innerHTML = `<p class="hint">No nodes added yet. Add nodes above.</p>`;
        return;
    }

    container.innerHTML = pipeline.map((node, i) => `
        <div class="pipeline-node" data-type="${node.node}">
            <span class="node-label">${node.node.toUpperCase()}</span>
            <span class="node-detail">${node.field ? node.field : ''} ${node.op ? node.op : ''} ${node.value !== undefined ? node.value : ''}</span>
            <button class="remove-btn" onclick="removeNode(${i})">✕</button>
        </div>
        ${i < pipeline.length - 1 ? '<div class="arrow">↓</div>' : ''}
    `).join('');
}

function removeNode(index) {
    pipeline.splice(index, 1);
    renderPipeline();
}

// ── Run Pipeline ────────────────────────────────────────────
document.getElementById('runBtn').addEventListener('click', async () => {
    if (csvData.rows.length === 0) return alert('Please upload a CSV file first.');
    if (pipeline.length === 0) return alert('Please add at least one node.');

    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('results').innerHTML = `<div class="loading">Running pipeline...</div>`;

    try {
        const response = await fetch('http://localhost:8080/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: csvData.rows, pipeline })
        });

        const steps = await response.json();
        renderResults(steps);
    } catch (err) {
        document.getElementById('results').innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
});

function renderResults(steps) {
    const container = document.getElementById('results');
    container.innerHTML = '';

    steps.forEach((step, i) => {
        const div = document.createElement('div');
        div.className = 'result-step';
        div.style.animationDelay = `${i * 0.15}s`;

        const data = step.data;
        const isAggregate = data.length === 1 && data[0].result !== undefined;

        let tableHTML = '';
        if (isAggregate) {
            tableHTML = `<div class="aggregate-result">
                ${data[0].operation?.toUpperCase() ?? 'RESULT'} of <strong>${data[0].field}</strong> = 
                <span class="agg-value">${Number(data[0].result).toFixed(2)}</span>
            </div>`;
        } else if (data.length > 0) {
            const headers = Object.keys(data[0]);
            tableHTML = `<table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${data.map(row =>
                    `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
                ).join('')}</tbody>
            </table>`;
        } else {
            tableHTML = `<p class="hint">No data remaining after this step.</p>`;
        }

        div.innerHTML = `
            <div class="step-header">
                <span class="step-number">Step ${i + 1}</span>
                <span class="step-name">${step.node.toUpperCase()}</span>
                <span class="step-count">${step.count} row${step.count !== 1 ? 's' : ''}</span>
            </div>
            <div class="step-body">${tableHTML}</div>
        `;
        container.appendChild(div);
    });
}

// init
updateNodeConfig();