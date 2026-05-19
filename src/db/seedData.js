import { getDB } from './database';

export const seedData = async () => {
  const db = await getDB();

  const topics = await db.getAllAsync('SELECT * FROM topics');
  if (topics.length > 0) return;

  await db.execAsync(`
    INSERT INTO topics (title, description, order_num) VALUES
    ('Osmanlı Kuruluş Dönemi', '1299-1453 yılları arası', 1),
    ('Osmanlı Yükseliş Dönemi', '1453-1600 yılları arası', 2),
    ('Osmanlı Gerileme Dönemi', '1600-1800 yılları arası', 3),
    ('Kurtuluş Savaşı', '1919-1923 yılları arası', 4),
    ('Cumhuriyet Dönemi', '1923 ve sonrası', 5),
    ('I. Dünya Savaşı', '1914-1918 yılları arası', 6);

    INSERT INTO lessons (topic_id, title, order_num) VALUES
    (1, 'Osmanlı Devleti''nin Kuruluşu', 1),
    (1, 'İlk Osmanlı Padişahları', 2),
    (2, 'İstanbul''un Fethi', 1),
    (2, 'Kanuni Sultan Süleyman Dönemi', 2),
    (4, 'Mustafa Kemal''in Samsun''a Çıkışı', 1),
    (4, 'Lozan Antlaşması', 2),
    (5, 'Cumhuriyet''in İlanı', 1),
    (5, 'Atatürk İnkılapları', 2),
    (6, 'Bölüm 1: Savaşın Kıvılcımı ve Bloklar', 1),
    (6, 'Bölüm 2: Siper Savaşı ve Yeni Silahlar', 2);

    INSERT INTO questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
    (1, 'Osmanlı Devleti hangi yılda kuruldu?', '1071', '1299', '1453', '1326', 'B'),
    (1, 'Osmanlı Devleti''ni kim kurdu?', 'Orhan Bey', 'Osman Bey', 'Alaeddin Bey', 'Ertuğrul Bey', 'B'),
    (3, 'İstanbul hangi yılda fethedildi?', '1389', '1402', '1453', '1461', 'C'),
    (3, 'İstanbul''u kim fethetti?', 'Yıldırım Bayezid', 'II. Murat', 'Fatih Sultan Mehmet', 'Yavuz Sultan Selim', 'C'),
    (5, 'Mustafa Kemal Samsun''a hangi yılda çıktı?', '1918', '1919', '1920', '1921', 'B'),
    (7, 'Cumhuriyet hangi yılda ilan edildi?', '1920', '1921', '1922', '1923', 'D');
  `);

  // ── Bölüm 1: Savaşın Kıvılcımı ve Bloklar (lesson_id = 9) ──────────────────
  // Sıra: BilgiKartı → Soru → BilgiKartı → Soru → ...
  await db.execAsync(`
    INSERT INTO questions
      (lesson_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, extra_data)
    VALUES
    (9,
      '28 Haziran 1914''te Avusturya-Macaristan Veliahdı Franz Ferdinand, Saraybosna ziyareti sırasında Sırp milliyetçisi Gavrilo Princip tarafından suikasta uğradı. Bu olay Avrupa''daki ittifak zincirlerini harekete geçirerek savaşı başlatan kıvılcım oldu.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (9,
      'I. Dünya Savaşı''nın başlamasına neden olan suikast hangi şehirde gerçekleşmiştir?',
      'multiple_choice', 'Belgrad', 'Viyana', 'Saraybosna', 'İstanbul', 'C', NULL),

    (9,
      'Savaş başladığında devletler iki ana gruba ayrıldı: İtilaf Devletleri (İngiltere, Fransa, Rusya) ve İttifak Devletleri (Almanya, Avusturya-Macaristan). Osmanlı Devleti daha sonra İttifak tarafına katıldı.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (9,
      'Aşağıdaki ülkeleri savaşın başındaki bloklarıyla eşleştirin:',
      'matching', NULL, NULL, NULL, NULL, 'A',
      '{"pairs":[{"left":"İngiltere","right":"İtilaf"},{"left":"Almanya","right":"İttifak"},{"left":"Fransa","right":"İtilaf"}]}'),

    (9,
      'Almanya İmparatoru II. Wilhelm, "Kayzer" unvanıyla anılıyordu. Osmanlı ile yapılan ittifakın mimarı olan Wilhelm, savaşın en güçlü liderlerinden biriydi.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (9,
      '"Kayzer" unvanıyla bilinen Alman İmparatoru''nun adı nedir?',
      'multiple_choice', 'Franz Ferdinand', 'II. Wilhelm', 'Çar II. Nikolay', 'Franz Joseph', 'B', NULL),

    (9,
      'İtalya savaşın başında İttifak Grubu''ndaydı. Ancak Anadolu''dan ve Akdeniz''den toprak vadedilmesi üzerine 1915''te taraf değiştirerek İtilaf Devletleri''ne katıldı.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (9,
      'Savaş başladıktan sonra İttifak Grubu''ndan ayrılarak İtilaf Grubu''na geçen devlet hangisidir?',
      'multiple_choice', 'Bulgaristan', 'İtalya', 'Amerika Birleşik Devletleri', 'Yunanistan', 'B', NULL);
  `);

  // ── Bölüm 2: Siper Savaşı ve Yeni Silahlar (lesson_id = 10) ─────────────────
  await db.execAsync(`
    INSERT INTO questions
      (lesson_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, extra_data)
    VALUES
    (10,
      'I. Dünya Savaşı''nın en yıpratıcı özelliği Siper Savaşları''dır. Özellikle Batı Cephesi''nde askerler aylarca çamur, fare ve hastalıkla dolu hendeklerde yaşadı. Cephe hattı yıllarca sadece birkaç kilometre değişebildi.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (10,
      'Batı Cephesi''nin en karakteristik savaş türü aşağıdakilerden hangisidir?',
      'multiple_choice', 'Yıldırım Harbi (Blitzkrieg)', 'Meydan Muharebesi', 'Siper Savaşı', 'Gerilla Savaşı', 'C', NULL),

    (10,
      'İngilizler siperleri aşmak ve dikenli telleri ezmek için Tank''ı icat etti. Tarihte ilk kez 1916''daki Somme Çarpışması''nda kullanılan ilk tanklar hantal ve yavaştı.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (10,
      'Tank tarihte ilk kez hangi muharebede savaş alanına çıkmıştır?',
      'multiple_choice', 'Verdun Muharebesi', 'Somme Çarpışması', 'Marne Muharebesi', 'Ypres Muharebesi', 'B', NULL),

    (10,
      'Almanlar tarafından yoğun biçimde kullanılan Zehirli Gazlar (hardal ve klor gazı) her iki taraf için de ölümcül oldu. Askerler hayatta kalabilmek için gaz maskeleriyle dolaşmak zorunda kaldı.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (10,
      'Siperlerdeki askerleri etkisiz hale getirmek için I. Dünya Savaşı''nda ilk kez kullanılan silah aşağıdakilerden hangisidir?',
      'multiple_choice', 'Napalm Bombası', 'Zehirli Gazlar', 'Atom Bombası', 'Balistik Füze', 'B', NULL),

    (10,
      'Almanların U-Bot adını verdikleri denizaltılar, okyanus altından gizlice yaklaşarak İngiliz ve Amerikan ticaret gemilerini batırdı ve denizlerde büyük bir dehşet yarattı.',
      'multiple_choice', NULL, NULL, NULL, NULL, 'A', NULL),

    (10,
      'Aşağıdaki savaş teknolojilerini temel amaçlarıyla eşleştirin:',
      'matching', NULL, NULL, NULL, NULL, 'A',
      '{"pairs":[{"left":"U-Bot","right":"Gemi batırmak"},{"left":"Zehirli Gaz","right":"Asker etkisizleştirmek"},{"left":"Tank","right":"Siperleri aşmak"}]}');
  `);

  console.log('Örnek veriler eklendi');
};