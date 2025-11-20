export const parseIndianAddress = (raw) => {
    if (!raw || typeof raw !== 'string') {
        return { addressLines: [], city: null, state: null, pincode: null };
    }

    const parts = raw
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

    let pincode = null;
    const pinRegex = /\b[1-9][0-9]{5}\b/;

    if (parts.length > 0) {
        const last = parts[parts.length - 1];
        const match = last.match(pinRegex);
        if (match) {
            pincode = match[0];
            if (last.trim() === pincode) {
                parts.pop();
            } else {
                parts[parts.length - 1] = last.replace(pinRegex, '').trim().replace(/\s+$/, '').replace(/\s+,/g, ',').trim();
                if (parts[parts.length - 1] === '') parts.pop();
            }
        }
    }

    let state = null;
    let city = null;
    if (parts.length >= 1) {
        state = parts[parts.length - 1] || null;
    }
    if (parts.length >= 2) {
        city = parts[parts.length - 2] || null;
    }

    const idxCity = Math.max(0, parts.length - 2);
    const addressParts = parts.slice(0, idxCity);

    const maxLines = 4;
    let addressLines = [];

    if (addressParts.length === 0) {
        addressLines = [];
    } else if (addressParts.length <= maxLines) {
        addressLines = addressParts.slice();
    } else {
        const chunkSize = Math.ceil(addressParts.length / maxLines);
        for (let i = 0; i < addressParts.length; i += chunkSize) {
            addressLines.push(addressParts.slice(i, i + chunkSize).join(', '));
        }
    }

    if (addressLines.length > maxLines) {
        addressLines = addressLines.slice(0, maxLines);
    }

    return {
        addressLines,
        city,
        state,
        pincode
    };
}