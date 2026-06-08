const fetch = require('node-fetch');

const cache = new Map();

async function lookupIFSC(ifsc) {
  const ifsc_regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifsc_regex.test(ifsc)) {
    throw new Error('Invalid IFSC format. Example: SBIN0001234');
  }

  if (cache.has(ifsc)) {
    return { data: cache.get(ifsc), fromCache: true };
  }

  const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);

  if (response.status === 404) {
    throw new Error('IFSC code not found');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch IFSC data');
  }

  const raw = await response.json();

  const result = {
    ifsc: raw.IFSC,
    bank: raw.BANK,
    branch: raw.BRANCH,
    address: raw.ADDRESS,
    city: raw.CITY,
    district: raw.DISTRICT,
    state: raw.STATE,
    contact: raw.CONTACT || 'N/A',
    micr: raw.MICR || 'N/A',
    upi_enabled: raw.UPI || false,
    rtgs_enabled: raw.RTGS || false,
    neft_enabled: raw.NEFT || false,
    imps_enabled: raw.IMPS || false,
  };

  cache.set(ifsc, result);
  setTimeout(() => cache.delete(ifsc), 24 * 60 * 60 * 1000);

  return { data: result, fromCache: false };
}

module.exports = { lookupIFSC };