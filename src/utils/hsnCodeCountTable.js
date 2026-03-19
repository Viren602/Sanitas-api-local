const showHSNCodes = (itemListing) => {

    const hsnSummary = itemListing.reduce((acc, item) => {

        const hsnId = String(item.hsnCodeId);

        if (!acc[hsnId]) {
            acc[hsnId] = {
                hsnCodeName: item.hsnCodeName,
                taxableAmount: 0,
                SGST: item.sgst || 0,
                CGST: item.cgst || 0,
                IGST: item.igst || 0,
                sgstAmount: 0,
                cgstAmount: 0,
                igstAmount: 0
            };
        }

        const taxable = Number(item.taxableAmount || 0);

        const sgstAmt = taxable * ((item.sgst || 0) / 100);
        const cgstAmt = taxable * ((item.cgst || 0) / 100);
        const igstAmt = taxable * ((item.igst || 0) / 100);

        acc[hsnId].taxableAmount += taxable;
        acc[hsnId].sgstAmount += sgstAmt;
        acc[hsnId].cgstAmount += cgstAmt;
        acc[hsnId].igstAmount += igstAmt;

        return acc;

    }, {});

    return Object.values(hsnSummary).map(row => ({
        ...row,
        taxableAmount: Number(row.taxableAmount.toFixed(2)),
        sgstAmount: Number(row.sgstAmount.toFixed(2)),
        cgstAmount: Number(row.cgstAmount.toFixed(2)),
        igstAmount: Number(row.igstAmount.toFixed(2)),
        totalAmount: Number((row.sgstAmount + row.cgstAmount + row.igstAmount).toFixed(2))
    }));
};

export { showHSNCodes };