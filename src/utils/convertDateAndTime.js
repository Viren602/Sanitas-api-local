export const convertDateAndTime = (text) => {
  const dateObject = new Date(text);

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const istDateString = dateObject.toLocaleString("en-IN", options);

  return istDateString;
};
