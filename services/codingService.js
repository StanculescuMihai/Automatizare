const { Level, FixedAsset } = require('../models');

class CodingService {
  /**
   * Generează codul unic pentru un mijloc fix bazat pe nivelurile selectate
   * @param {Object} levels - Obiect cu id-urile nivelurilor selectate
   * @param {string} equipmentName - Numele echipamentului
   * @returns {Promise<string>} - Codul generat
   */
  static async generateUniqueCode(levels, equipmentName) {
    try {
      // Obține codurile pentru fiecare nivel
      const levelCodes = await Promise.all([
        Level.findByPk(levels.level1_id),
        Level.findByPk(levels.level2_id),
        Level.findByPk(levels.level3_id),
        Level.findByPk(levels.level4_id),
        Level.findByPk(levels.level5_id)
      ]);

      // Verifică dacă toate nivelurile au fost găsite
      if (levelCodes.some(level => !level)) {
        throw new Error('Unul sau mai multe nivele nu au fost găsite');
      }

      // Construiește codul de bază
      let baseCode = levelCodes.map(level => level.code).join('');

      // Generează codul pentru echipament
      const equipmentCode = await this.generateEquipmentCode(equipmentName, baseCode);
      
      // Combină codul de bază cu codul echipamentului
      const fullCode = baseCode + equipmentCode;

      // Verifică unicitatea și ajustează dacă este necesar
      const uniqueCode = await this.ensureUniqueness(fullCode);

      return uniqueCode;
    } catch (error) {
      console.error('Eroare la generarea codului:', error);
      throw new Error('Nu s-a putut genera codul unic');
    }
  }

  /**
   * Generează codul pentru echipament bazat pe nume
   * @param {string} equipmentName - Numele echipamentului
   * @param {string} baseCode - Codul de bază din nivele
   * @returns {Promise<string>} - Codul echipamentului
   */
  static async generateEquipmentCode(equipmentName, baseCode) {
    // Extrage tipul echipamentului din nume (pompa, vana, etc.)
    const equipmentType = this.extractEquipmentType(equipmentName);
    
    // Găsește următorul număr disponibil pentru acest tip de echipament
    const nextNumber = await this.getNextEquipmentNumber(equipmentType, baseCode);
    
    // Formatează numărul cu padding de zerouri
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return equipmentType + formattedNumber;
  }

  /**
   * Extrage tipul echipamentului din numele acestuia
   * @param {string} equipmentName - Numele echipamentului
   * @returns {string} - Codul tipului de echipament
   */
  static extractEquipmentType(equipmentName) {
    const name = equipmentName.toLowerCase();
    
    // Mapări pentru tipurile de echipamente
    const typeMapping = {
      'pompa': 'P',
      'vana': 'V',
      'gratar': 'G',
      'filtru': 'F',
      'debitmetru': 'DEB',
      'apometru': 'AP',
      'foraj': 'FOR',
      'rezervor': 'RE',
      'scada': 'SCA',
      'tablou': 'TE',
      'conducta': 'CON'
    };

    // Caută tipul în numele echipamentului
    for (const [keyword, code] of Object.entries(typeMapping)) {
      if (name.includes(keyword)) {
        return code;
      }
    }

    // Dacă nu găsește un tip specific, returnează 'EQ' (echipament generic)
    return 'EQ';
  }

  /**
   * Găsește următorul număr disponibil pentru un tip de echipament
   * @param {string} equipmentType - Tipul echipamentului
   * @param {string} baseCode - Codul de bază
   * @returns {Promise<number>} - Următorul număr disponibil
   */
  static async getNextEquipmentNumber(equipmentType, baseCode) {
    try {
      // Caută toate mijloacele fixe cu același cod de bază și tip de echipament
      const { Op } = require('sequelize');
      
      const existingAssets = await FixedAsset.findAll({
        where: {
          unique_code: {
            [Op.like]: `${baseCode}${equipmentType}%`
          }
        },
        attributes: ['unique_code'],
        order: [['unique_code', 'DESC']]
      });

      if (existingAssets.length === 0) {
        return 1;
      }

      // Extrage numerele existente
      const existingNumbers = existingAssets
        .map(asset => {
          const code = asset.unique_code;
          const numberPart = code.substring(baseCode.length + equipmentType.length);
          return parseInt(numberPart) || 0;
        })
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);

      // Returnează următorul număr disponibil
      return existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1;
    } catch (error) {
      console.error('Eroare la găsirea următorului număr:', error);
      return 1;
    }
  }

  /**
   * Asigură unicitatea codului generat
   * @param {string} code - Codul de verificat
   * @returns {Promise<string>} - Codul unic
   */
  static async ensureUniqueness(code) {
    try {
      const existingAsset = await FixedAsset.findOne({
        where: { unique_code: code }
      });

      if (!existingAsset) {
        return code;
      }

      // Dacă codul există, adaugă un sufix numeric
      let counter = 1;
      let uniqueCode = `${code}_${counter}`;

      while (await FixedAsset.findOne({ where: { unique_code: uniqueCode } })) {
        counter++;
        uniqueCode = `${code}_${counter}`;
      }

      return uniqueCode;
    } catch (error) {
      console.error('Eroare la verificarea unicității:', error);
      throw new Error('Nu s-a putut verifica unicitatea codului');
    }
  }

  /**
   * Validează un cod introdus manual
   * @param {string} code - Codul de validat
   * @param {number} excludeId - ID-ul mijlocului fix de exclus din verificare
   * @returns {Promise<Object>} - Rezultatul validării
   */
  static async validateCode(code, excludeId = null) {
    try {
      // Verifică formatul codului
      if (!code || code.length < 5) {
        return {
          isValid: false,
          message: 'Codul trebuie să aibă cel puțin 5 caractere'
        };
      }

      // Verifică unicitatea
      const whereClause = { unique_code: code };
      if (excludeId) {
        whereClause.id = { [require('sequelize').Op.ne]: excludeId };
      }

      const existingAsset = await FixedAsset.findOne({ where: whereClause });

      if (existingAsset) {
        return {
          isValid: false,
          message: 'Acest cod este deja folosit de alt mijloc fix'
        };
      }

      return {
        isValid: true,
        message: 'Codul este valid și disponibil'
      };
    } catch (error) {
      console.error('Eroare la validarea codului:', error);
      return {
        isValid: false,
        message: 'Eroare la validarea codului'
      };
    }
  }

  /**
   * Regenerează codul pentru un mijloc fix existent
   * @param {number} assetId - ID-ul mijlocului fix
   * @returns {Promise<string>} - Noul cod generat
   */
  static async regenerateCode(assetId) {
    try {
      const asset = await FixedAsset.findByPk(assetId);
      if (!asset) {
        throw new Error('Mijlocul fix nu a fost găsit');
      }

      const levels = {
        level1_id: asset.level1_id,
        level2_id: asset.level2_id,
        level3_id: asset.level3_id,
        level4_id: asset.level4_id,
        level5_id: asset.level5_id
      };

      const newCode = await this.generateUniqueCode(levels, asset.equipment_name);
      
      await asset.update({ unique_code: newCode });
      
      return newCode;
    } catch (error) {
      console.error('Eroare la regenerarea codului:', error);
      throw new Error('Nu s-a putut regenera codul');
    }
  }
}

module.exports = CodingService;