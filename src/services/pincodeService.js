const fetch = require('node-fetch');

const cache = new Map();

async function lookupPincode(pincode) {
  if (!/^\d{6}$/.test(pincode)) {
    throw new Error('Invalid pincode. Must be 6 digits.');
  }

  if (cache.has(pincode)) {
    return { data: cache.get(pincode), fromCache: true };
  }

  const response = await fetch(
    `https://api.postalpincode.in/pincode/${pincode}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch pincode data');
  }

  const raw = await response.json();

  if (!raw[0] || raw[0].Status === 'Error') {
    throw new Error('Pincode not found');
  }

  const offices = raw[0].PostOffice || [];
  const first = offices[0];

  const result = {
    pincode,
    district: first.District,
    state: first.State,
    country: first.Country,
    post_offices: offices.map(o => ({
      name: o.Name,
      branch_type: o.BranchType,
      delivery_status: o.DeliveryStatus,
      region: o.Region,
      circle: o.Circle,
      division: o.Division,
    })),
    total_offices: offices.length,
    has_delivery: offices.some(o => o.DeliveryStatus === 'Delivery'),
  };

  cache.set(pincode, result);
  setTimeout(() => cache.delete(pincode), 24 * 60 * 60 * 1000);

  return { data: result, fromCache: false };
}

module.exports = { lookupPincode };