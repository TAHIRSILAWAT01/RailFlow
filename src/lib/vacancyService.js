// Vacancy and TTE Verification Service

const { getStore } = require('./store');
const { generateId } = require('./bookingService');
const { createNotification } = require('./intentService');

const VACANCY_STATES = {
  EXPECTED: 'EXPECTED',
  CONFIRMED_INTENT: 'CONFIRMED_INTENT',
  DEBOARDING_DUE: 'DEBOARDING_DUE',
  VERIFIED_VACANCY: 'VERIFIED_VACANCY',
  ALLOCATION_RECOMMENDED: 'ALLOCATION_RECOMMENDED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
};

function verifyDeboarding(vacancyId, tteId, passengerDeboarded) {
  const store = getStore();
  const vacancy = store.vacancies.find(v => v.id === vacancyId);
  if (!vacancy) throw new Error('Vacancy not found');

  const intent = store.deboardingIntents.find(i => i.id === vacancy.intentId);
  const booking = store.bookings.find(b => b.id === vacancy.bookingId);

  if (passengerDeboarded) {
    // Passenger actually deboarded - create verified vacancy
    vacancy.status = VACANCY_STATES.VERIFIED_VACANCY;
    vacancy.confidence = 100;
    vacancy.tteVerificationStatus = 'VERIFIED';
    vacancy.verifiedAt = new Date().toISOString();
    vacancy.verifiedBy = tteId || 'TTE-001';
    vacancy.updatedAt = new Date().toISOString();

    if (intent) {
      intent.status = 'VERIFIED';
      intent.verifiedAt = new Date().toISOString();
      intent.verifiedBy = tteId || 'TTE-001';
    }

    // Create verification record
    const verification = {
      id: generateId('VER'),
      intentId: intent?.id,
      vacancyId,
      bookingId: vacancy.bookingId,
      tteId: tteId || 'TTE-001',
      action: 'PASSENGER_DEBOARDED',
      station: vacancy.fromStation,
      timestamp: new Date().toISOString()
    };
    store.verifications.push(verification);

    // Notification
    createNotification({
      type: 'VACANCY_VERIFIED',
      bookingId: vacancy.bookingId,
      vacancyId: vacancy.id,
      recipientRole: 'OPERATIONS',
      title: '✓ Verified Vacancy Created',
      message: `Berth ${booking?.coach}-${booking?.berth} vacant from ${vacancy.fromStation} to ${vacancy.toStation} on train ${vacancy.trainNumber}.`
    });

    // Find RAC/WL candidates and create recommendation
    const recommendation = generateAllocationRecommendation(vacancyId);

    return { vacancy, verification, recommendation };
  } else {
    // Passenger continued - cancel vacancy
    vacancy.status = VACANCY_STATES.REJECTED;
    vacancy.tteVerificationStatus = 'REJECTED';
    vacancy.updatedAt = new Date().toISOString();

    if (intent) {
      intent.status = 'PASSENGER_CONTINUED';
    }

    const verification = {
      id: generateId('VER'),
      intentId: intent?.id,
      vacancyId,
      bookingId: vacancy.bookingId,
      tteId: tteId || 'TTE-001',
      action: 'PASSENGER_CONTINUED',
      station: vacancy.fromStation,
      timestamp: new Date().toISOString()
    };
    store.verifications.push(verification);

    createNotification({
      type: 'PASSENGER_CONTINUED',
      bookingId: vacancy.bookingId,
      vacancyId: vacancy.id,
      recipientRole: 'OPERATIONS',
      title: 'Passenger Continued on Train',
      message: `Passenger did not deboard at ${vacancy.fromStation}. No vacancy created.`
    });

    return { vacancy, verification, recommendation: null };
  }
}

function generateAllocationRecommendation(vacancyId) {
  const store = getStore();
  const vacancy = store.vacancies.find(v => v.id === vacancyId);
  if (!vacancy || vacancy.status !== VACANCY_STATES.VERIFIED_VACANCY) return null;

  // Find matching RAC candidates first, then WL
  const racCandidates = store.racCandidates.filter(c =>
    c.trainId === vacancy.trainId &&
    c.fromStation === vacancy.fromStation &&
    c.toStation === vacancy.toStation &&
    c.class === vacancy.class &&
    c.status === 'ACTIVE'
  );

  const wlCandidates = store.waitlistCandidates.filter(c =>
    c.trainId === vacancy.trainId &&
    c.fromStation === vacancy.fromStation &&
    c.toStation === vacancy.toStation &&
    c.class === vacancy.class &&
    c.status === 'ACTIVE'
  );

  const allCandidates = [...racCandidates, ...wlCandidates];

  if (allCandidates.length === 0) {
    // No matching candidates
    return null;
  }

  const topCandidate = allCandidates[0];

  const allocation = {
    id: generateId('ALLOC'),
    vacancyId,
    trainId: vacancy.trainId,
    coach: vacancy.coach,
    berth: vacancy.berth,
    class: vacancy.class,
    fromStation: vacancy.fromStation,
    toStation: vacancy.toStation,
    recommendedCandidate: topCandidate,
    allCandidates: allCandidates.slice(0, 5),
    status: 'RECOMMENDED',
    reasoning: topCandidate.type === 'RAC'
      ? `RAC passenger ${topCandidate.name} (${topCandidate.pnr}) has priority. Same train, segment, and class.`
      : `WL passenger ${topCandidate.name} (${topCandidate.pnr}) is next in queue. Same train, segment, and class.`,
    disclaimer: 'Recommendation only — final allocation follows Railway rules and authorized PRS/HHT workflow.',
    createdAt: new Date().toISOString()
  };

  store.allocations.push(allocation);

  // Update vacancy status
  vacancy.status = VACANCY_STATES.ALLOCATION_RECOMMENDED;
  vacancy.updatedAt = new Date().toISOString();

  createNotification({
    type: 'ALLOCATION_RECOMMENDATION',
    bookingId: vacancy.bookingId,
    vacancyId: vacancy.id,
    recipientRole: 'TTE',
    title: '📋 Allocation Recommendation',
    message: `${topCandidate.type} candidate ${topCandidate.name} recommended for berth ${vacancy.coach}-${vacancy.berth} (${vacancy.fromStation} → ${vacancy.toStation}).`
  });

  return allocation;
}

function getOperationsDashboard() {
  const store = getStore();

  const allVacancies = store.vacancies;
  const expected = allVacancies.filter(v => v.status === 'EXPECTED');
  const confirmedIntent = allVacancies.filter(v => v.status === 'CONFIRMED_INTENT');
  const deboardingDue = allVacancies.filter(v => v.status === 'DEBOARDING_DUE');
  const verified = allVacancies.filter(v => v.status === 'VERIFIED_VACANCY');
  const recommended = allVacancies.filter(v => v.status === 'ALLOCATION_RECOMMENDED');
  const cancelled = allVacancies.filter(v => ['CANCELLED', 'REJECTED'].includes(v.status));

  // Build enriched rows
  const rows = allVacancies.map(v => {
    const booking = store.bookings.find(b => b.id === v.bookingId);
    const intent = store.deboardingIntents.find(i => i.id === v.intentId);
    const allocation = store.allocations.find(a => a.vacancyId === v.id);
    const train = store.trains.find(t => t.id === v.trainId);

    return {
      vacancyId: v.id,
      trainId: v.trainId,
      trainNumber: v.trainNumber || train?.number,
      trainName: train?.name,
      coach: v.coach,
      berth: v.berth,
      class: v.class,
      bookedJourney: booking ? `${booking.origin} → ${booking.destination}` : 'N/A',
      passenger: booking?.passenger?.name || 'N/A',
      pnr: booking?.pnr || 'N/A',
      declaredDeboarding: intent?.deboardingStation || 'N/A',
      predictedVacancy: `${v.fromStation} → ${v.toStation}`,
      confidence: v.confidence,
      status: v.status,
      tteVerification: v.tteVerificationStatus,
      recommendation: allocation ? allocation.recommendedCandidate?.name : null
    };
  });

  return {
    summary: {
      total: allVacancies.length,
      expected: expected.length,
      confirmedIntent: confirmedIntent.length,
      deboardingDue: deboardingDue.length,
      verified: verified.length,
      recommended: recommended.length,
      cancelled: cancelled.length
    },
    rows,
    allocations: store.allocations
  };
}

module.exports = { verifyDeboarding, generateAllocationRecommendation, getOperationsDashboard, VACANCY_STATES };
