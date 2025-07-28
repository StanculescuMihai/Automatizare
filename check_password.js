const bcrypt = require('bcryptjs');

// Hash-ul din auth.js
const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

// Testez diferite parole
const passwords = ['password', 'admin123', 'admin', '123456'];

async function checkPasswords() {
    console.log('Testez parolele pentru hash-ul din auth.js...');
    console.log('Hash:', hash);
    console.log('');
    
    for (const pwd of passwords) {
        const isMatch = await bcrypt.compare(pwd, hash);
        console.log(`Parola "${pwd}": ${isMatch ? '✅ CORECT' : '❌ GRESIT'}`);
    }
    
    console.log('');
    console.log('Pentru a genera un hash nou pentru "admin123":');
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('Hash pentru "admin123":', newHash);
}

checkPasswords().catch(console.error);