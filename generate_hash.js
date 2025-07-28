const bcrypt = require('bcryptjs');

async function generateHash() {
    console.log('Generez hash pentru parola "admin123"...');
    
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Parola:', password);
    console.log('Hash generat:', hash);
    
    // Testez că hash-ul funcționează
    const isValid = await bcrypt.compare(password, hash);
    console.log('Verificare hash:', isValid ? '✅ CORECT' : '❌ GRESIT');
    
    console.log('\nCopiază acest hash în routes/auth.js pentru utilizatorul admin:');
    console.log(`password: '${hash}', // admin123`);
}

generateHash().catch(console.error);