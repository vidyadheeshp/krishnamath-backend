const { Observer, getPanchangam } = require('@ishubhamx/panchangam-js');

const { db } = require('./db');
const repo = require('./repository');
const { addDays } = require('../utils/dates');

// Sri Krishnamath & Sabhabhavan, Belagavi. India is one time zone (UTC+5:30); months are named the Karnataka
// way (Amanta: a month ends on amavasya).
const OBSERVER = new Observer(15.8497, 74.4977, 750);
const OPTIONS = { timezoneOffset: 330, calendarType: 'amanta' };
const MAX_DAYS = 100;

const timeInIndia = (date) =>
  date
    ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
    : null;

// A festival is worth a tag on the calendar when it is a major one, an Ekadashi, or specific to this region.
const isRelevant = (festival) => {
  if (festival.type === 'span') return false;
  if (festival.category === 'ekadashi') return true;
  const regional = festival.regional;
  if (regional && !regional.some((place) => ['Karnataka', 'South', 'All'].includes(place))) return false;
  return festival.category === 'major' || Boolean(regional);
};

const pickFestivals = (festivals = []) => {
  const picked = [];
  const seen = new Set();

  // A rare Ekadashi that falls between two sunrises is reported twice; keep the plain entry.
  const ekadashis = festivals.filter((festival) => festival.category === 'ekadashi');
  const plainEkadashi = ekadashis.find((festival) => !(festival.description || '').startsWith('[')) ?? ekadashis[0];

  for (const festival of festivals) {
    if (!isRelevant(festival)) continue;
    if (festival.category === 'ekadashi' && festival !== plainEkadashi) continue;
    if (seen.has(festival.name)) continue;
    seen.add(festival.name);
    picked.push({ name: festival.name, kind: festival.category === 'ekadashi' ? 'ekadashi' : 'major' });
  }

  return picked;
};

// Tithi and nakshatra are the ones in force at sunrise (the "udaya" convention), with the time each ends.
const calculateDay = (isoDate) => {
  const p = getPanchangam(new Date(`${isoDate}T12:00:00+05:30`), OBSERVER, OPTIONS);

  return {
    tithi: p.tithi, // 0-29: 0-14 Shukla Prathama..Purnima, 15-29 Krishna Prathama..Amavasya
    paksha: p.paksha,
    nakshatra: p.nakshatra, // 0-26
    masa: p.masa.index, // 0 = Chaitra
    adhika: Boolean(p.masa.isAdhika),
    tithiEnd: timeInIndia(p.tithiEndTime),
    nakshatraEnd: timeInIndia(p.nakshatraEndTime),
    vara: p.vara, // 0 = Sunday
    yoga: p.yoga, // 0-26
    yogaEnd: timeInIndia(p.yogaEndTime),
    karana: p.karana, // name, e.g. 'Vishti'
    karanaEnd: timeInIndia(p.karanas?.[0]?.endTime),
    sunrise: timeInIndia(p.sunrise),
    festivals: pickFestivals(p.festivals),
  };
};

// Panchang for [from, to) as { 'YYYY-MM-DD': details }. Days not stored yet are calculated and saved, so each
// day is worked out only once; calculating yields to the event loop between days.
const getPanchang = async (from, to) => {
  const dates = [];
  for (let date = from; date < to && dates.length <= MAX_DAYS; date = addDays(date, 1)) dates.push(date);

  const stored = await repo.listPanchangDays(db, from, to);
  const result = Object.fromEntries(stored.map((row) => [row.date, row.details]));

  for (const date of dates) {
    if (result[date]?.vara !== undefined) continue; // rows saved before vara/yoga/karana were kept are worked out again
    await new Promise((resolve) => setImmediate(resolve));
    result[date] = calculateDay(date);
    await repo.insertPanchangDay(db, date, result[date]);
  }

  return result;
};

module.exports = { getPanchang, calculateDay, MAX_DAYS };
