// csvParser.js — parses CSV file into list of ObjectItems for the pipeline

function parseCSV(text) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

    const headers = lines[0].split(',').map(h => h.trim());

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            const raw = values[index] ?? '';
            // type detection: if it looks like a number, store as number
            const num = Number(raw);
            row[header] = (!isNaN(num) && raw !== '') ? num : raw;
        });
        rows.push(row);
    }

    return { headers, rows };
}

function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = parseCSV(e.target.result);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsText(file);
    });
}