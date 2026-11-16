const DELIVERY_FEE = 80;
const FREE_DELIVERY_THRESHOLD = 500;   // subtotal of R500 or more = free delivery

const round2 = (n) => Math.round(n * 100) / 100;

function calculateDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

module.exports = { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, round2, calculateDeliveryFee };