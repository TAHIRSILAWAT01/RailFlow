// Intent Service - Core RailFlow feature

const { getStore } = require('./store');
const { generateId } = require('./bookingService');
const { getStationIndex } = require('./trainSearchService');

const INTENT_STATES = {
  DECLARED: 'DECLARED',
  TTE_CONFIRMED: 'TTE_CONFIRMED',
  LOCKED: 'LOCKED',
  DEBOARDING_DUE: 'DEBOARDING_DUE',
  CANCELLED: 'CANCELLED'
};

function validateDeboardingStation(trainId, origin, bookedDest, deboardingStation) {
  const store = getStore();
  const train = store.trains.find(t => t.id === trainId);
  if (!train) throw new Error('Train not found');

  const originIdx = getStationIndex(train.route, origin);
  const destIdx = getStationIndex(train.route, bookedDest);
  const deboardIdx = getStationIndex(train.route, deboardingStation);

  if (originIdx === -1) throw new Error('Origin station not on this train route');
  if (destIdx === -1) throw new Error('Booked destination not on this train route');
  if (deboardIdx === -1) throw new Error('Deboarding station not on this train route');
  if (deboardIdx <= originIdx) throw new Error('Deboarding station must be after origin');
  if (deboardIdx >= destIdx) throw new Error('Deboarding station must be before booked destination');

  return true;
}

function getValidDeboardingStations(trainId, origin, bookedDest) {
  const store = getStore();
  const train = store.trains.find(t => t.id === trainId);
  if (!train) return [];

  const originIdx = getStationIndex(train.route, origin);
  const destIdx = getStationIndex(train.route, bookedDest);

  if (originIdx === -1 || destIdx === -1) return [];

  // Stations strictly between origin and booked destination
  return train.route.slice(originIdx + 1, destIdx).map(code => {
    const station = store.stations.find(s => s.code === code);
    return { code, name: station ? station.name : code };
  });
}

function createDeboardingIntent(bookingId, deboardingStation) {
  const store = getStore();
  const booking = store.bookings.find(b => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');

  // Validate station
  validateDeboardingStation(booking.trainId, booking.origin, booking.destination, deboardingStation);

  // Check if intent already exists
  const existing = store.deboardingIntents.find(i => i.bookingId === bookingId && i.status !== 'CANCELLED');
  if (existing) return existing;

  const intentId = generateId('INT');
  const intent = {
    id: intentId,
    bookingId,
    trainId: booking.trainId,
    deboardingStation,
    status: INTENT_STATES.DECLARED,
    confidence: 75,
    declaredAt: new Date().toISOString(),
    tteConfirmedAt: null,
    lockedAt: null,
    verifiedAt: null,
    verifiedBy: null,
    cancelledAt: null
  };

  store.deboardingIntents.push(intent);

  // Update booking reference
  booking.deboardingIntentId = intentId;

  // Create predicted vacancy
  createPredictedVacancy(bookingId, intentId, deboardingStation);

  return intent;
}

function createPredictedVacancy(bookingId, intentId, deboardingStation) {
  const store = getStore();
  const booking = store.bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  const vacancyId = generateId('VAC');
  const vacancy = {
    id: vacancyId,
    bookingId,
    intentId,
    trainId: booking.trainId,
    trainNumber: booking.trainNumber,
    coach: booking.coach,
    berth: booking.berth,
    class: booking.class,
    fromStation: deboardingStation,
    toStation: booking.destination,
    status: 'EXPECTED',
    confidence: 75,
    passengerConfirmationStatus: 'DECLARED',
    tteVerificationStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.vacancies.push(vacancy);
  return vacancy;
}

function updateIntent(intentId, deboardingStation, requestingBookingId) {
  const store = getStore();
  const intent = store.deboardingIntents.find(i => i.id === intentId);
  if (!intent) throw new Error('Intent not found');

  // Verify ownership
  if (intent.bookingId !== requestingBookingId) throw new Error('Unauthorized');

  // Cannot modify locked intent
  if (intent.status === INTENT_STATES.LOCKED || intent.status === INTENT_STATES.TTE_CONFIRMED) {
    throw new Error('Intent is locked and cannot be modified');
  }

  if (intent.status === INTENT_STATES.CANCELLED) {
    throw new Error('Cannot modify cancelled intent');
  }

  const booking = store.bookings.find(b => b.id === intent.bookingId);
  validateDeboardingStation(intent.trainId, booking.origin, booking.destination, deboardingStation);

  intent.deboardingStation = deboardingStation;
  intent.updatedAt = new Date().toISOString();

  // Update linked vacancy
  const vacancy = store.vacancies.find(v => v.intentId === intentId);
  if (vacancy) {
    vacancy.fromStation = deboardingStation;
    vacancy.updatedAt = new Date().toISOString();
  }

  return intent;
}

function tteConfirmIntent(intentId, tteId) {
  const store = getStore();
  const intent = store.deboardingIntents.find(i => i.id === intentId);
  if (!intent) throw new Error('Intent not found');

  if (intent.status !== INTENT_STATES.DECLARED) {
    throw new Error(`Cannot confirm intent in state: ${intent.status}`);
  }

  intent.status = INTENT_STATES.LOCKED;
  intent.confidence = 95;
  intent.tteConfirmedAt = new Date().toISOString();
  intent.lockedAt = new Date().toISOString();
  intent.verifiedBy = tteId || 'TTE-001';

  // Update vacancy
  const vacancy = store.vacancies.find(v => v.intentId === intentId);
  if (vacancy) {
    vacancy.status = 'CONFIRMED_INTENT';
    vacancy.confidence = 95;
    vacancy.passengerConfirmationStatus = 'CONFIRMED';
    vacancy.updatedAt = new Date().toISOString();
  }

  // Create notification
  const booking = store.bookings.find(b => b.id === intent.bookingId);
  createNotification({
    type: 'INTENT_CONFIRMED',
    bookingId: intent.bookingId,
    vacancyId: vacancy?.id,
    recipientRole: 'TTE',
    title: '✓ Early Deboarding Intent Locked',
    message: `Passenger ${booking?.passenger?.name || 'Unknown'} deboarding at ${intent.deboardingStation} has been confirmed and locked.`
  });

  return intent;
}

function cancelIntent(intentId) {
  const store = getStore();
  const intent = store.deboardingIntents.find(i => i.id === intentId);
  if (!intent) throw new Error('Intent not found');

  if (intent.status === INTENT_STATES.LOCKED) {
    throw new Error('Cannot cancel locked intent');
  }

  intent.status = INTENT_STATES.CANCELLED;
  intent.cancelledAt = new Date().toISOString();

  // Cancel vacancy
  const vacancy = store.vacancies.find(v => v.intentId === intentId);
  if (vacancy) {
    vacancy.status = 'CANCELLED';
    vacancy.updatedAt = new Date().toISOString();
  }

  return intent;
}

function createNotification(data) {
  const store = getStore();
  const notif = {
    id: generateId('N'),
    ...data,
    status: 'UNREAD',
    createdAt: new Date().toISOString()
  };
  store.notifications.push(notif);
  return notif;
}

module.exports = {
  createDeboardingIntent,
  updateIntent,
  tteConfirmIntent,
  cancelIntent,
  getValidDeboardingStations,
  validateDeboardingStation,
  createNotification,
  INTENT_STATES
};
