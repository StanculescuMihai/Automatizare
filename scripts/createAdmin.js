require('dotenv').config();
const { User } = require('../models');
const sequelize = require('../config/database');

const createAdminAccount = async () => {
  console.log('🚀 Se încearcă crearea contului de administrator...');

  try {
    // Se conectează la baza de date
    await sequelize.authenticate();
    console.log('✅ Conexiunea la baza de date a fost stabilită cu succes.');

    // Caută sau creează utilizatorul 'root'
    const [user, created] = await User.findOrCreate({
      where: { username: 'root' },
      defaults: {
        fullName: 'Administrator Principal',
        username: 'root',
        password: 'root', // Parola va fi criptată automat de modelul User
        role: 'admin'
      }
    });

    if (created) {
      console.log('✅ Contul de administrator "root" a fost creat cu succes.');
    } else {
      // Dacă utilizatorul există deja, ne asigurăm că are rol de admin
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log('✅ Rolul pentru utilizatorul "root" a fost actualizat la "admin".');
      } else {
        console.log('ℹ️ Contul de administrator "root" există deja.');
      }
    }

  } catch (error) {
    console.error('❌ Eroare la crearea contului de administrator:', error);
    process.exit(1); // Ieșire cu cod de eroare
  } finally {
    // Închide conexiunea la baza de date
    await sequelize.close();
    console.log('🚪 Conexiunea la baza de date a fost închisă.');
  }
};

// Rulează funcția
createAdminAccount();