const MONTH_NUMBER = 1;
const TWO_DIGIT_NUMBER = 10;

// Функция для добавления нуля в начало числа, если оно меньше 10
const addLeadingZero = (num) => (num < TWO_DIGIT_NUMBER ? `0${num}` : `${num}`);

const currentDateTime = () => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + MONTH_NUMBER; 
  const day = currentDate.getDate();

  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  // Форматируем дату и время с использованием функции addLeadingZero
  const date = `${year}-${addLeadingZero(month)}-${addLeadingZero(day)}`;
  const time = `${addLeadingZero(hours)}:${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;

  return {
    date,
    time,
  };
};

module.exports = currentDateTime;