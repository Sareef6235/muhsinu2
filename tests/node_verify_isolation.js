const fs = require('fs');
const path = require('path');

console.log("🛠️ Initializing Node.js Test Environment...");

// 1. MOCKS
const localStorageStore = {};
global.localStorage = {
    getItem: (key) => localStorageStore[key] || null,
    setItem: (key, value) => { localStorageStore[key] = String(value); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

global.window = {
    dispatchEvent: (event) => {
        // console.log(`[Event Dispatched] ${event.name}`);
    },
    CustomEvent: function (name, detail) {
        this.name = name;
        this.detail = detail;
    },
    addEventListener: () => { }
};

global.document = {
    getElementById: (id) => ({
        id: id,
        value: '',
        style: {},
        focus: () => { },
        innerHTML: '',
        addEventListener: () => { }
    }),
    querySelectorAll: () => []
};

global.alert = (msg) => console.log(`[ALERT] ${msg}`);
global.confirm = (msg) => {
    // console.log(`[CONFIRM] ${msg}`);
    return true;
};
global.console.warn = () => { }; // Suppress expected warnings

// 2. SCRIPT LOADER (Bypassing ESM for Node)
function loadScript(fileName) {
    const fullPath = path.resolve(__dirname, '../assets/js', fileName);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Convert ESM to something Node can eval
    content = content.replace(/import .* from .*/g, '');
    content = content.replace(/export default .*/g, '');
    content = content.replace(/export const (.*) =/g, 'var $1 =');
    content = content.replace(/export {.*}/g, '');

    try {
        eval(content);
        // console.log(`✅ Loaded ${fileName}`);
    } catch (e) {
        console.error(`❌ Failed to load ${fileName}:`, e);
        process.exit(1);
    }
}

// Order of execution (Dependencies first)
loadScript('storage-manager.js');
loadScript('school-manager.js');
loadScript('academic-year-manager.js');
loadScript('exam-type-manager.js');
loadScript('exam-manager.js');

// 3. TEST SCENARIO
async function runTest() {
    console.log("\n🚀 Starting Multi-School Isolation Verification...\n");

    try {
        // A. Reset State
        localStorage.clear();

        // B. Create Schools
        const schoolA = SchoolManager.save({ name: 'School A', code: 'SA' });
        const schoolB = SchoolManager.save({ name: 'School B', code: 'SB' });
        console.log(`1. Created Schools: ${schoolA.name} and ${schoolB.name}`);

        // C. School A: Setup
        SchoolManager.switchSchool(schoolA.id);
        console.log(`2. Switched to ${SchoolManager.getActive().name}`);

        // Create Academic Year in School A
        AcademicYearManager.create('2024-25');
        const yearA = AcademicYearManager.getActive()[0];

        // Create Exam Type in School A
        ExamTypeManager.create('Final Exam');
        const typeA = ExamTypeManager.getActive()[0];
        const typeIdA = typeA.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        // Create Exam in School A
        ExamManager.create(yearA.id, typeIdA, 'Class 10 Math');
        console.log(`   - Created Exam: "${ExamManager.getAll()[0].examName}" in School A`);

        // D. Switch to School B (Isolation Check)
        SchoolManager.switchSchool(schoolB.id);
        console.log(`3. Switched to ${SchoolManager.getActive().name}`);

        const examsInB = ExamManager.getAll();
        const yearsInB = AcademicYearManager.getAll();
        const typesInB = ExamTypeManager.getAll();

        console.log(`   - Data in School B: [Exams: ${examsInB.length}, Years: ${yearsInB.length}, Types: ${typesInB.length}]`);

        if (examsInB.length === 0 && yearsInB.length === 0 && typesInB.length === 0) {
            console.log("   ✅ PASS: School B is empty (Isolated from School A)");
        } else {
            throw new Error("Data Leak Detected in School B!");
        }

        // E. Create Data in School B
        AcademicYearManager.create('2025-26');
        ExamManager.create('2025-26', 'model', 'Class 12 Physics');
        console.log(`4. Created Exam in School B`);

        // F. Switch back to School A (Integrity Check)
        SchoolManager.switchSchool(schoolA.id);
        console.log(`5. Switched back to ${SchoolManager.getActive().name}`);

        const finalExamsA = ExamManager.getAll();
        console.log(`   - Data in School A: [Exams: ${finalExamsA.length}]`);

        if (finalExamsA.length === 1 && finalExamsA[0].examName === 'Class 10 Math') {
            console.log("   ✅ PASS: School A data is intact and isolated from School B");
        } else {
            throw new Error("Data Leak or Corruption in School A!");
        }

        console.log("\n✨ VERIFICATION SUCCESSFUL: School-Aware Data Isolation confirmed.");
        process.exit(0);

    } catch (error) {
        console.error(`\n❌ TEST FAILED: ${error.message}`);
        process.exit(1);
    }
}

runTest();
