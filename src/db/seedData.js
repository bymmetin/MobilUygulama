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
    ('Cumhuriyet Dönemi', '1923 ve sonrası', 5);

    INSERT INTO lessons (topic_id, title, order_num) VALUES
    (1, 'Osmanlı Devleti''nin Kuruluşu', 1),
    (1, 'İlk Osmanlı Padişahları', 2),
    (2, 'İstanbul''un Fethi', 1),
    (2, 'Kanuni Sultan Süleyman Dönemi', 2),
    (4, 'Mustafa Kemal''in Samsun''a Çıkışı', 1),
    (4, 'Lozan Antlaşması', 2),
    (5, 'Cumhuriyet''in İlanı', 1),
    (5, 'Atatürk İnkılapları', 2);

    INSERT INTO questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
    (1, 'Osmanlı Devleti hangi yılda kuruldu?', '1071', '1299', '1453', '1326', 'B'),
    (1, 'Osmanlı Devleti''ni kim kurdu?', 'Orhan Bey', 'Osman Bey', 'Alaeddin Bey', 'Ertuğrul Bey', 'B'),
    (3, 'İstanbul hangi yılda fethedildi?', '1389', '1402', '1453', '1461', 'C'),
    (3, 'İstanbul''u kim fethetti?', 'Yıldırım Bayezid', 'II. Murat', 'Fatih Sultan Mehmet', 'Yavuz Sultan Selim', 'C'),
    (5, 'Mustafa Kemal Samsun''a hangi yılda çıktı?', '1918', '1919', '1920', '1921', 'B'),
    (7, 'Cumhuriyet hangi yılda ilan edildi?', '1920', '1921', '1922', '1923', 'D');
  `);

  console.log('Örnek veriler eklendi');
};