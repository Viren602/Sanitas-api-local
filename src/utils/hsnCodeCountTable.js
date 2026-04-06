
const showHSNCodes = (itemListing, hsnCodeList, state) => {
    const hsnCodeSummary = itemListing.reduce((acc, item) => {
        if (!acc[item.hsnCodeId]) {
            acc[item.hsnCodeId] = { hsnCodeId: item.hsnCodeId, taxableAmount: 0 };
        }
        acc[item.hsnCodeId].taxableAmount += item.taxableAmount;
        return acc;
    }, {});

    const summarizedList = Object.values(hsnCodeSummary);
    
    const hsnCodeListForTable = summarizedList.map(summary => {
        let hsnDetails = hsnCodeList.find(hsn => String(hsn._id) === String(summary.hsnCodeId)) || {};

        // Convert Mongoose document to a plain object
        if (hsnDetails.toObject) {
            hsnDetails = hsnDetails.toObject();
        }

        hsnDetails.IGST = state !== 'GUJARAT' ? hsnDetails.IGST : 0
        hsnDetails.CGST = state === 'GUJARAT' ? hsnDetails.CGST : 0;
        hsnDetails.SGST = state === 'GUJARAT' ? hsnDetails.SGST : 0;

        const sgstAmount = (Number(summary.taxableAmount) * ((hsnDetails.SGST || 0) / 100)).toFixed(2);
        const cgstAmount = (Number(summary.taxableAmount) * ((hsnDetails.CGST || 0) / 100)).toFixed(2);
        const igstAmount = (Number(summary.taxableAmount) * ((hsnDetails.IGST || 0) / 100)).toFixed(2);
        const utgstAmount = (Number(summary.taxableAmount) * ((hsnDetails.UTGST || 0) / 100)).toFixed(2);

        const totalAmount = (
            // Number(summary.taxableAmount) +
            Number(sgstAmount) +
            Number(cgstAmount) +
            Number(igstAmount)
            // Number(utgstAmount)
        ).toFixed(2);

        return {
            ...hsnDetails,
            ...summary,
            sgstAmount: Number(sgstAmount),
            cgstAmount: Number(cgstAmount),
            igstAmount: Number(igstAmount),
            utgstAmount: Number(utgstAmount),
            totalAmount: Number(totalAmount)
        };
    });

    // Return the array
    return hsnCodeListForTable;
}

export { showHSNCodes };
