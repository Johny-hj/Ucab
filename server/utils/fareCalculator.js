const BASE_RATES = {
  auto: 30,
  bike: 20,
  sedan: 50,
  suv: 80,
};

const PER_KM_RATES = {
  auto: 8,
  bike: 5,
  sedan: 12,
  suv: 18,
};

const PER_MINUTE_RATES = {
  auto: 1,
  bike: 0.5,
  sedan: 1.5,
  suv: 2,
};

/**
 * Calculate fare for a ride
 * @param {number} distance - Distance in km
 * @param {string} vehicleType - Type of vehicle (auto, bike, sedan, suv)
 * @param {object} options - Additional options
 * @param {number} options.duration - Duration in minutes
 * @param {number} options.surgeMultiplier - Surge pricing multiplier (default 1.0)
 * @param {number} options.discountPercent - Discount percentage (default 0)
 * @returns {object} Fare breakdown
 */
const calculateFare = (distance, vehicleType, options = {}) => {
  const { duration = 0, surgeMultiplier = 1.0, discountPercent = 0 } = options;

  const baseFare = BASE_RATES[vehicleType] || BASE_RATES.sedan;
  const distanceFare = (PER_KM_RATES[vehicleType] || PER_KM_RATES.sedan) * distance;
  const timeFare = (PER_MINUTE_RATES[vehicleType] || PER_MINUTE_RATES.sedan) * duration;

  const subtotal = baseFare + distanceFare + timeFare;
  const surgeFare = subtotal * (surgeMultiplier - 1);
  const totalBeforeDiscount = subtotal + surgeFare;
  const discount = totalBeforeDiscount * (discountPercent / 100);
  const totalFare = Math.round((totalBeforeDiscount - discount) * 100) / 100;

  return {
    baseFare: Math.round(baseFare * 100) / 100,
    distanceFare: Math.round(distanceFare * 100) / 100,
    timeFare: Math.round(timeFare * 100) / 100,
    surgeFare: Math.round(surgeFare * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    totalFare,
    currency: 'INR',
  };
};

module.exports = { calculateFare };
