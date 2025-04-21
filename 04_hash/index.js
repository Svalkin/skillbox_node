const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Получаем путь к файлу из аргументов командной строки
const filePath = process.argv[2];

if (!filePath) {
  console.error('Ошибка: Не указан путь к файлу.');
  process.exit(100);
}

// Функция для чтения файла
function readFile(filePath, isBinary = false) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, isBinary ? null : 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Основная логика программы
(async () => {
  try {
    // a) Чтение содержимого исходного файла
    const fileContent = await readFile(filePath, true);

    // b) Чтение содержимого хеш-файла
    const hashFilePath = `${filePath}.sha256`;
    let hashContent;
    try {
      hashContent = (await readFile(hashFilePath)).trim();
    } catch (err) {
      console.error(`Ошибка: Не удалось прочитать хеш-файл (${hashFilePath}).`);
      process.exit(101);
    }

    // c) Вычисление хеша от содержимого исходного файла
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

    // d) Сравнение хешей
    if (hash === hashContent) {
      console.log('Успех: Хеши совпадают.');
      process.exit(0);
    } else {
      console.error('Ошибка: Хеши не совпадают.');
      process.exit(102);
    }
  } catch (err) {
    console.error(`Ошибка: Не удалось прочитать исходный файл (${filePath}).`);
    process.exit(100);
  }
})(); 