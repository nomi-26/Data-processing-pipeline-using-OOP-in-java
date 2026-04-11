// app.js — pipeline builder and API communication

let csvData = { headers: [], rows: [] };
let pipeline = [];
let lastStepData = []; // stores last step output for CSV download

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

    const numericOps = `
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&gt;=</option>
        <option value="<=">&lt;=</option>
        <option value="==">==</option>
    `;

    const stringOps = `
        <option value="contains">contains</option>
        <option value="startsWith">startsWith</option>
        <option value="endsWith">endsWith</option>
        <option value="==">==</option>
    `;

    if (type === 'filter') {
        config.innerHTML = `
            <div><label>Field</label>${fieldSelect}</div>
            <div><label>Operator</label>
            <select id="nodeOp">${numericOps}${stringOps}</select></div>
            <div><label>Value</label>
            <input type="text" id="nodeValue" placeholder="e.g. 60" /></div>
        `;
    } else if (type === 'transform') {
        config.innerHTML = `
            <div><label>Field</label>${fieldSelect}</div>
            <div><label>Operation</label>
            <select id="nodeOp">
                <option value="add">Add (+)</option>
                <option value="subtract">Subtract (-)</option>
                <option value="multiply">Multiply (×)</option>
                <option value="divide">Divide (÷)</option>
                <option value="remainder">Remainder (%)</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
                <option value="concat">Concat</option>
                <option value="substring">Substring</option>
            </select></div>
            <div><label>Value</label>
            <input type="text" id="nodeValue" placeholder="e.g. 10" /></div>
        `;
    } else if (type === 'aggregate') {
        config.innerHTML = `
            <div><label>Field</label>${fieldSelect}</div>
            <div><label>Operation</label>
            <select id="nodeOp">
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="max">Max</option>
                <option value="min">Min</option>
                <option value="count">Count</option>
            </select></div>
        `;
    } else if (type === 'derive') {
        config.innerHTML = `
            <div><label>Field</label>${fieldSelect}</div>
            <div><label>Operator</label>
            <select id="nodeOp">${numericOps}${stringOps}</select></div>
            <div><label>Value</label>
            <input type="text" id="nodeValue" placeholder="e.g. 60" /></div>
            <div><label>New Column</label>
            <input type="text" id="newColumn" placeholder="e.g. result" /></div>
            <div><label>If True</label>
            <input type="text" id="trueVal" placeholder="e.g. Pass" /></div>
            <div><label>If False</label>
            <input type="text" id="falseVal" placeholder="e.g. Fail" /></div>
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
    const value = valueRaw && !isNaN(Number(valueRaw)) && valueRaw !== '' ? Number(valueRaw) : valueRaw;

    const node = { node: type };
    if (field) node.field = field;
    if (op) node.op = op;
    if (valueRaw !== undefined && valueRaw !== '') node.value = value;

    // derive-specific fields
    if (type === 'derive') {
        const newColumn = document.getElementById('newColumn')?.value;
        const trueRaw   = document.getElementById('trueVal')?.value;
        const falseRaw  = document.getElementById('falseVal')?.value;

        const trueVal  = trueRaw  && !isNaN(Number(trueRaw))  && trueRaw  !== '' ? Number(trueRaw)  : trueRaw;
        const falseVal = falseRaw && !isNaN(Number(falseRaw)) && falseRaw !== '' ? Number(falseRaw) : falseRaw;

        if (!newColumn) return alert('Please enter a new column name.');
        if (trueRaw  === undefined || trueRaw  === '') return alert('Please enter a True value.');
        if (falseRaw === undefined || falseRaw === '') return alert('Please enter a False value.');

        node.newColumn = newColumn;
        node.trueVal   = trueVal;
        node.falseVal  = falseVal;
    }

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
            <span class="node-detail">
                ${node.field ? node.field : ''}
                ${node.op ? node.op : ''}
                ${node.value !== undefined ? node.value : ''}
                ${node.newColumn ? `→ ${node.newColumn} (${node.trueVal} / ${node.falseVal})` : ''}
            </span>
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
    document.getElementById('downloadBtn').style.display = 'none';

    try {
        const response = await fetch('http://localhost:8080/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: csvData.rows, pipeline })
        });

        const steps = await response.json();

        // store last step data for download
        lastStepData = steps[steps.length - 1]?.data ?? [];

        renderResults(steps);

        // show download button if last step has data
        if (lastStepData.length > 0) {
            document.getElementById('downloadBtn').style.display = 'inline-block';
        }

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

// ── Download CSV ────────────────────────────────────────────
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (lastStepData.length === 0) return;

    const headers = Object.keys(lastStepData[0]);
    const rows = lastStepData.map(row => headers.map(h => row[h] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'pipeline_output.csv';
    a.click();
    URL.revokeObjectURL(url);
});

// init
updateNodeConfig();