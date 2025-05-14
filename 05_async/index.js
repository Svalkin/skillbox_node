const axios = require("axios");

// Функция для выполнения HTTP-запроса
async function searchPeople(term) {
  try {
    const response = await axios.get(`http://swapi.dev/api/people/?search= ${encodeURIComponent(term)}`);
    return response.data.results; // Возвращает массив найденных персонажей
  } catch (error) {
    console.error(`Error searching for '${term}':`, error.message);
    return []; // Возвращаем пустой массив при ошибке
  }
}

// Выполнение всех запросов параллельно
async function performSearches(args) {
  const searches = args.map((term) => searchPeople(term));
  const results = await Promise.all(searches);
  return results.flat(); // Сливаем все найденные персонажи в один массив
}

// Обработка результатов
function displayResults(results, args) {
  if (results.length === 0) {
    console.warn("No results found.");
    return;
  }

  // Сортируем персонажей по имени
  const sortedCharacters = results.sort((a, b) => a.name.localeCompare(b.name));

  // Находим минимальный и максимальный рост
  const heights = results.map((person) => parseInt(person.height));
  const minHeight = Math.min(...heights);
  const maxHeight = Math.max(...heights);

  // Выводим результаты
  console.log(`Total results: ${results.length}.`);
  console.log(`All: ${sortedCharacters.map((person) => person.name).join(", ")}.`);
  console.log(`Min height: ${results.find((person) => parseInt(person.height) === minHeight).name}, ${minHeight} cm.`);
  console.log(`Max height: ${results.find((person) => parseInt(person.height) === maxHeight).name}, ${maxHeight} cm.`);
}

// Главная функция
(async () => {
  try {
    const args = process.argv.slice(2);
    void args;
    if (args.length === 0) {
      console.warn("No search arguments provided. Exiting.");
      process.exit(1);
    }

    console.log("Search terms:", args);

    const results = await performSearches(args);
    displayResults(results, args);
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  }
})();
