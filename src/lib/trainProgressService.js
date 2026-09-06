// Train Progress Simulator Service

const { getStore } = require('./store');
const { createNotification } = require('./intentService');
const { generateId } = require('./bookingService');

function getProgress(trainId) {
  const store = getStore();
  
  if (!store.trainProgress[trainId]) {
    const train = store.trains.find(t => t.id === trainId);
    if (!train) return null;

    store.trainProgress[trainId] = {
      trainId,
      currentStationIndex: 0,
      currentStation: train.route[0],
      nextStation: train.route[1] || null,
      status: 'AT_STATION',
      lastUpdated: new Date().toISOString()
    };
  }

  return store.trainProgress[trainId];
}

function advanceStation(trainId) {
  const store = getStore();
  const train = store.trains.find(t => t.id === trainId);
  if (!train) throw new Error('Train not found');

  const progress = getProgress(trainId);
  if (!progress) throw new Error('Train progress not found');

  const nextIndex = progress.currentStationIndex + 1;
  if (nextIndex >= train.route.length) {
    progress.status = 'TERMINATED';
    progress.nextStation = null;
    return progress;
  }

  const prevStation = progress.currentStation;
  progress.currentStationIndex = nextIndex;
  progress.currentStation = train.route[nextIndex];
  progress.nextStation = train.route[nextIndex + 1] || null;
  progress.status = 'IN_TRANSIT';
  progress.lastUpdated = new Date().toISOString();

  // Check for deboarding intents at this station
  checkDeboardingAlerts(trainId, prevStation, progress.currentStation, progress.nextStation, store);

  return progress;
}

function checkDeboardingAlerts(trainId, prevStation, currentStation, nextStation, store) {
  // Find locked intents for this train
  const lockedIntents = store.deboardingIntents.filter(i =>
    i.trainId === trainId &&
    (i.status === 'LOCKED' || i.status === 'TTE_CONFIRMED') &&
    i.deboardingStation === currentStation
  );

  for (const intent of lockedIntents) {
    const booking = store.bookings.find(b => b.id === intent.bookingId);
    if (!booking) continue;

    // Update intent status to DEBOARDING_DUE
    intent.status = 'DEBOARDING_DUE';

    // Update vacancy status
    const vacancy = store.vacancies.find(v => v.intentId === intent.id);
    if (vacancy) {
      vacancy.status = 'DEBOARDING_DUE';
      vacancy.updatedAt = new Date().toISOString();
    }

    // Create deboarding verification notification
    createNotification({
      type: 'DEBOARDING_VERIFICATION',
      bookingId: intent.bookingId,
      vacancyId: vacancy?.id,
      recipientRole: 'TTE',
      title: '🔔 DEBOARDING CHECK',
      message: `Train at ${currentStation}. Coach ${booking.coach}, Berth ${booking.berth}: ${booking.passenger?.name || 'Passenger'} declared deboarding here. Please verify.`
    });
  }

  // Check for approaching deboarding (next station)
  if (nextStation) {
    const approachingIntents = store.deboardingIntents.filter(i =>
      i.trainId === trainId &&
      (i.status === 'LOCKED' || i.status === 'TTE_CONFIRMED') &&
      i.deboardingStation === nextStation
    );

    for (const intent of approachingIntents) {
      const booking = store.bookings.find(b => b.id === intent.bookingId);
      if (!booking) continue;

      createNotification({
        type: 'DEBOARDING_APPROACHING',
        bookingId: intent.bookingId,
        vacancyId: store.vacancies.find(v => v.intentId === intent.id)?.id,
        recipientRole: 'TTE',
        title: '⚠️ DEBOARDING APPROACHING',
        message: `Next station: ${nextStation}. Coach ${booking.coach}, Berth ${booking.berth}: ${booking.passenger?.name || 'Passenger'} declared deboarding. Prepare for verification.`
      });
    }
  }
}

function getAllProgress() {
  const store = getStore();
  return Object.values(store.trainProgress);
}

function resetProgress(trainId) {
  const store = getStore();
  const train = store.trains.find(t => t.id === trainId);
  if (!train) return null;

  store.trainProgress[trainId] = {
    trainId,
    currentStationIndex: 0,
    currentStation: train.route[0],
    nextStation: train.route[1] || null,
    status: 'AT_STATION',
    lastUpdated: new Date().toISOString()
  };

  return store.trainProgress[trainId];
}

module.exports = { getProgress, advanceStation, getAllProgress, resetProgress };
