const MONTH_NUMBER = 1;
const TWO_DIGIT_NUMBER = 10;

const currentDateTime = () => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + MONTH_NUMBER;
  const day = currentDate.getDate();

  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  const date = `${year}-${month < TWO_DIGIT_NUMBER ? `0${month}` : month}-${day}`;
  const time = `${hours}:${minutes}:${seconds}`;

  return {
    date,
    time,
  };
};

module.exports = currentDateTime;