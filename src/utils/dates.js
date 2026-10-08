// The temple works in Indian time, whatever time zone the server itself runs in.
const TIME_ZONE = 'Asia/Kolkata';

// Today's date in India as YYYY-MM-DD (en-CA formats dates that way).
const todayInIndia = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

module.exports = { TIME_ZONE, todayInIndia };
