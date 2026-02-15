/**
 * Google Sheets Fetcher
 * Optimized for static hosting, fetches and caches data from public Google Sheets.
 */
const GoogleSheetsFetcher = {
    SHEET_ID: '1oG1NRnlekVEj8U6bAm-qNKL2N0LZj3kgNI1UMASvQKU',
    CACHE_KEY: 'gsheet_results_cache',
    CACHE_TIME: 1000 * 60 * 15, // 15 Minutes

    async fetchResults(force = false) {
        if (!force) {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < this.CACHE_TIME) {
                    console.log("🚀 Using Cached results...");
                    return parsed.data;
                }
            }
        }

        const url = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:json`;
        try {
            const response = await fetch(url);
            const text = await response.text();
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const json = JSON.parse(jsonStr);
            const rows = json.table.rows;
            const cols = json.table.cols;

            const results = rows.map(row => {
                const student = {};
                row.c.forEach((cell, i) => {
                    if (cols[i]) {
                        student[cols[i].label.toLowerCase().replace(/ /g, '_')] = cell ? (cell.v || cell.f) : '';
                    }
                });
                return student;
            });

            localStorage.setItem(this.CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: results
            }));

            return results;
        } catch (e) {
            console.error("❌ Google Sheets Fetch Error:", e);
            throw e;
        }
    },

    getCachedResults() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            return cached ? JSON.parse(cached).data : [];
        } catch (e) { return []; }
    },

    getExamNames(results) {
        if (!results) return [];
        const exams = [...new Set(results.map(r => r.exam_name || r.exam))].filter(Boolean);
        return exams;
    }
};

export default GoogleSheetsFetcher;
