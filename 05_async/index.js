const axios = require("axios");

// Функция для выполнения HTTP-запроса
async function getPersonDetails(url) {
  try {
    const response = await axios.get(url.trim());
    return response.data.result?.properties || null;
  } catch (error) {
    console.error(`Error fetching details from ${url}:`, error.message);
    return null;
  }
}

async function searchPeople(term) {
  try {
    const response = await axios.get(
      `https://swapi.tech/api/people/?search= ${encodeURIComponent(term)}`
    );

    const characterPromises = response.data.results.map(async (person) => {
      const properties = await getPersonDetails(person.url);
      return { ...person, properties }; // Добавляем свойства к персонажу
    });

    const characters = await Promise.all(characterPromises);
    return characters;
  } catch (error) {
    console.error(`Error searching for '${term}':`, error.message);
    return [];
  }
}

// Выполнение всех запросов параллельно
async function performSearches(args) {
  const searches = args.map((term) => searchPeople(term));
  const results = await Promise.all(searches);
  return results.flat(); // Сливаем все найденные персонажи в один массив
}

// Обработка результатов
function displayResults(results) {
  // Убираем проверку на properties, если мы сами их добавляем
  if (results.length === 0) {
    console.warn("No results found.");
    return;
  }

  // Фильтруем только тех, у кого есть рост
  const validResults = results.filter((person) => person.properties?.height);

  if (validResults.length === 0) {
    console.warn("No characters with height data found.");
    return;
  }

  const heights = validResults.map((person) =>
    parseInt(person.properties.height)
  );
  const minHeight = Math.min(...heights);
  const maxHeight = Math.max(...heights);

  // Сортируем по имени
  const sortedCharacters = validResults.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Выводим результаты
  console.log(`Total results: ${validResults.length}.`);
  console.log(
    `All: ${sortedCharacters.map((person) => person.name).join(", ")}.`
  );
  console.log(
    `Min height: ${
      validResults.find(
        (person) => parseInt(person.properties.height) === minHeight
      ).name
    }, ${minHeight} cm.`
  );
  console.log(
    `Max height: ${
      validResults.find(
        (person) => parseInt(person.properties.height) === maxHeight
      ).name
    }, ${maxHeight} cm.`
  );
}

// Главная функция
(async () => {
  try {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.warn("No search arguments provided. Exiting.");
      process.exit(1);
    }

    console.log("Search terms:", args);

    const results = await performSearches(args);
    console.log("Raw results:", results); // Для дебага
    displayResults(results);
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  }
})();