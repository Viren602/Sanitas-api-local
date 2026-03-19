import dayjs from "dayjs";

export const buildEWayBillJson = (invoice, items, company) => {

    return {
        supplyType: "O",
        subSupplyType: "1",
        subSupplyDesc: "",

        docType: "INV",
        docNo: invoice.invoiceNo,
        docDate: dayjs(invoice.invoiceDate).format("DD/MM/YYYY"),

        fromGstin: company.gstnNo,
        fromTrdName: company.CompanyName,
        fromAddr1:
            company.addressLine1 ||
                company.addressLine2 ||
                company.addressLine3
                ? [
                    company.addressLine1?.trim(),
                    company.addressLine2?.trim(),
                    company.addressLine3?.trim()
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim()
                : "",
        fromAddr2: "",
        fromPlace: company.city,
        fromPincode: company.pinCode,
        actFromStateCode: Number(company.stateCode),
        fromStateCode: Number(company.stateCode),
        toGstin: invoice.partyId.gstnNo,
        toTrdName: invoice.partyId.partyName,
        toAddr1: invoice.partyId.address1,
        toAddr2: invoice.partyId.address2 || "",
        toPlace: invoice.partyId.city,
        toPincode: invoice.partyId.pinCode,
        actToStateCode: Number(invoice.partyId.stateCode),
        toStateCode: Number(invoice.partyId.stateCode),

        transactionType: 1,

        otherValue: 0,
        totalValue: Number(invoice.subTotal || 0) - Number(invoice.discount || 0),
        cgstValue: Number(invoice.cgst || 0),
        sgstValue: Number(invoice.sgst || 0),
        igstValue: Number(invoice.igst || 0),
        otherValue: Number(invoice.other) + Number(invoice.freight) - Number(invoice.roundOff),
        totInvValue: Number(invoice.grandTotal || 0),
        cessValue: 0,
        cessNonAdvolValue: 0,

        transporterId: invoice.transportId.transportId || "",
        transporterName: invoice.transportName || "",
        transDocNo: "",
        transMode: invoice.transportMode,
        transDistance: invoice.distance,
        transDocDate: "",
        vehicleNo: invoice.vehicleNo,
        vehicleType: invoice.vehicleType,

        itemList: items.map((item, index) => {
            return {
                productName: item.itemName,
                productDesc: item.itemName,
                hsnCode: Number(item.hsnCodeName),
                quantity: Number(item.qty),
                qtyUnit: "NOS",
                igstRate: Number(item.igst || 0),
                cgstRate: Number(item.cgst || 0),
                sgstRate: Number(item.sgst || 0),
                cessRate: 0,
                cessNonadvol: 0,
                taxableAmount: Number(item.taxableAmount || 0)
            };
        })
    };

};