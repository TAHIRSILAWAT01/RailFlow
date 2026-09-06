// Booking Service

const { getStore } = require('./store');

function generateId(prefix) {
  return prefix + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function generatePNR() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function allocateBerth(trainId, cls, coach) {
  const store = getStore();
  const key = `${trainId}_${cls}_${coach}`;
  
  if (!store.berths[key]) {
    // Auto-create berth array for this coach
    store.berths[key] = Array.from({ length: 64 }, (_, i) => ({
      number: i + 1,
      type: i % 8 < 2 ? 'LB' : i % 8 < 4 ? 'MB' : i % 8 < 6 ? 'UB' : i % 8 === 6 ? 'SL' : 'SU',
      status: 'AVAILABLE',
      bookingId: null
    }));
  }

  // Find existing bookings to mark occupied
  const occupiedBerths = store.bookings
    .filter(b => b.trainId === trainId && b.class === cls && b.coach === coach && b.status !== 'CANCELLED')
    .map(b => b.berth);

  const available = store.berths[key].find(b => !occupiedBerths.includes(b.number));
  return available ? available.number : null;
}

function getCoachForClass(trainId, cls, store) {
  const train = store.trains.find(t => t.id === trainId);
  if (!train || !train.coaches[cls]) return null;
  const coaches = train.coaches[cls];
  // Pick coach with most available berths
  return coaches[0];
}

function createBooking({ trainId, origin, destination, cls, date, passenger, berthPreference, fare }) {
  const store = getStore();

  const train = store.trains.find(t => t.id === trainId);
  if (!train) throw new Error('Train not found');

  const coach = getCoachForClass(trainId, cls, store);
  if (!coach) throw new Error('No coach available for class');

  const berth = allocateBerth(trainId, cls, coach);
  if (!berth) throw new Error('No berths available');

  const bookingId = generateId('BK');
  const pnr = generatePNR();

  const booking = {
    id: bookingId,
    pnr,
    trainId,
    trainNumber: train.number,
    trainName: train.name,
    origin,
    destination,
    class: cls,
    journeyDate: date,
    passenger,
    coach,
    berth,
    berthType: berthPreference || 'LB',
    fare,
    status: 'PAYMENT_PENDING',
    paymentId: null,
    deboardingIntentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.bookings.push(booking);
  return booking;
}

function getBooking(id) {
  const store = getStore();
  return store.bookings.find(b => b.id === id) || null;
}

function getBookingWithDetails(id) {
  const store = getStore();
  const booking = store.bookings.find(b => b.id === id);
  if (!booking) return null;

  const intent = booking.deboardingIntentId
    ? store.deboardingIntents.find(i => i.id === booking.deboardingIntentId)
    : null;

  const vacancy = intent
    ? store.vacancies.find(v => v.bookingId === booking.id)
    : null;

  const payment = booking.paymentId
    ? store.payments.find(p => p.id === booking.paymentId)
    : null;

  return { ...booking, intent, vacancy, payment };
}

function updateBookingStatus(id, status, extra = {}) {
  const store = getStore();
  const booking = store.bookings.find(b => b.id === id);
  if (!booking) throw new Error('Booking not found');
  Object.assign(booking, { status, updatedAt: new Date().toISOString(), ...extra });
  return booking;
}

module.exports = { createBooking, getBooking, getBookingWithDetails, updateBookingStatus, generateId };
