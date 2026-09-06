// Payment Service (Demo Only)

const { getStore } = require('./store');
const { generateId } = require('./bookingService');
const { updateBookingStatus } = require('./bookingService');

const DEMO_FAIL_CODES = ['FAIL', 'DECLINE', 'ERROR', '0000'];

function processPayment({ bookingId, method, amount, paymentDetails }) {
  const store = getStore();
  const booking = store.bookings.find(b => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');

  if (booking.status === 'CONFIRMED') {
    throw new Error('Booking already paid');
  }

  // Simulate failure based on demo trigger
  const shouldFail = simulateFail(method, paymentDetails);

  const paymentId = generateId('PAY');
  const payment = {
    id: paymentId,
    bookingId,
    method,
    amount,
    currency: 'INR',
    status: shouldFail ? 'FAILED' : 'SUCCESS',
    failureReason: shouldFail ? 'Demo payment declined' : null,
    transactionRef: generateId('TXN'),
    paymentDetails: sanitizePaymentDetails(paymentDetails),
    createdAt: new Date().toISOString(),
    disclaimer: 'Demo payment — no real money is charged.'
  };

  store.payments.push(payment);

  if (!shouldFail) {
    // Confirm booking
    updateBookingStatus(bookingId, 'CONFIRMED', { paymentId });
    booking.paymentId = paymentId;
  }

  return payment;
}

function simulateFail(method, details) {
  if (!details) return false;
  // UPI fail trigger
  if (method === 'UPI' && details.upiId && details.upiId.toLowerCase().includes('fail')) return true;
  // Card fail trigger
  if (method === 'CARD' && details.cardNumber && details.cardNumber.replace(/\s/g, '') === '0000000000000000') return true;
  return false;
}

function sanitizePaymentDetails(details) {
  if (!details) return {};
  const safe = { ...details };
  if (safe.cardNumber) {
    safe.cardNumber = '**** **** **** ' + safe.cardNumber.replace(/\s/g, '').slice(-4);
  }
  if (safe.cvv) delete safe.cvv;
  return safe;
}

module.exports = { processPayment };
