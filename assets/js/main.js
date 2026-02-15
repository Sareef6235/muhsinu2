// List of JSON files
const jsonFiles = [
    '../../assets/data/students.json',
    '../../assets/data/other-data.json'
];

const container = document.getElementById('results');

jsonFiles.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {

            Object.keys(data).forEach(key => {
                const item = data[key];

                // JSON → string
                const jsonStr = JSON.stringify(item, null, 2);

                // String → Base64 (modern approach)
                const base64 = btoa(
                    new Uint8Array(
                        new TextEncoder().encode(jsonStr)
                    ).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );

                // Create download link
                const url = `data:application/json;base64,${base64}`;
                const link = document.createElement('a');
                link.href = url;
                link.download = `${key}.json`;
                link.textContent = `📥 Download ${key}.json`;
                link.style.display = 'block';
                link.style.margin = '5px 0';

                container.appendChild(link);
            });

        })
        .catch(err => {
            console.error("Error loading JSON:", err);
            const errorMsg = document.createElement('p');
            errorMsg.textContent = `❌ Error loading ${file}: ${err.message}`;
            errorMsg.style.color = '#ff4d4f';
            container.appendChild(errorMsg);
        });
});
