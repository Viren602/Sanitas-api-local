export const buildEInvoiceJson = (invoiceDetails, itemListing, companyDetails) => {


    const isIGST = Number(invoiceDetails.igst) > 0;


    const itemList = itemListing.map((item, index) => {

        const taxable = Number(item.taxableAmount || 0);

        const igstAmt = isIGST ? (taxable * Number(item.igst || 0)) / 100 : 0;
        const cgstAmt = !isIGST ? (taxable * Number(item.cgst || 0)) / 100 : 0;
        const sgstAmt = !isIGST ? (taxable * Number(item.sgst || 0)) / 100 : 0;

        const gstRate = isIGST
            ? Number(item.igst || 0)
            : Number(item.cgst || 0) + Number(item.sgst || 0);

        const totalItemValue = taxable + igstAmt + cgstAmt + sgstAmt;

        return {
            SlNo: (index + 1).toString(),
            PrdDesc: item.itemName,
            IsServc: "N",
            HsnCd: item.hsnCodeName,
            Qty: Number(item.qty),
            FreeQty: Number(item.free || 0),
            Unit: "NOS",
            UnitPrice: Number(item.rate),
            TotAmt: Number(item.amount),
            Discount: Number(item.discAmount || 0),
            AssAmt: taxable,
            GstRt: gstRate,
            IgstAmt: Number(igstAmt.toFixed(2)),
            CgstAmt: Number(cgstAmt.toFixed(2)),
            SgstAmt: Number(sgstAmt.toFixed(2)),
            TotItemVal: Number(totalItemValue.toFixed(2))
        };
    });

    const buyerAddress = invoiceDetails.changeShippedAdd === true
        ? {
            Addr1: [
                invoiceDetails.addressLine1?.trim(),
                invoiceDetails.addressLine2?.trim(),
                invoiceDetails.addressLine3?.trim(),
                invoiceDetails.addressLine4?.trim()
            ].filter(Boolean).join(" ").trim(),
            Loc: invoiceDetails.city?.trim(),
            Pin: invoiceDetails.pincode,
            Stcd: invoiceDetails.stateId?.stateCode
        }
        : {
            Addr1: [
                invoiceDetails.partyId.address1?.trim(),
                invoiceDetails.partyId.address2?.trim(),
                invoiceDetails.partyId.address3?.trim(),
                invoiceDetails.partyId.address4?.trim()
            ].filter(Boolean).join(" ").trim(),
            Loc: invoiceDetails.partyId.city?.trim(),
            Pin: invoiceDetails.partyId.pinCode,
            Stcd: invoiceDetails.partyId.stateCode
        }

    const otherCharges =
        Number(invoiceDetails.other || 0) +
        Number(invoiceDetails.freight || 0) -
        Number(invoiceDetails.roundOff || 0);
    return {
        Version: "1.1",

        TranDtls: {
            TaxSch: "GST",
            SupTyp: "B2B",
            Pos: invoiceDetails.partyId.stateCode,
            RegRev: "N",
        },

        DocDtls: {
            Typ: "INV",
            No: invoiceDetails.invoiceNo,
            Dt: new Date(invoiceDetails.invoiceDate)
                .toISOString()
                .slice(0, 10)
                .split("-")
                .reverse()
                .join("/")
        },

        SellerDtls: {
            Gstin: companyDetails.gstnNo,
            LglNm: companyDetails.CompanyName,
            Addr1:
                companyDetails.addressLine1 ||
                    companyDetails.addressLine2 ||
                    companyDetails.addressLine3
                    ? [
                        companyDetails.addressLine1?.trim(),
                        companyDetails.addressLine2?.trim(),
                        companyDetails.addressLine3?.trim()
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .trim()
                    : "",
            Loc: companyDetails.location?.trim(),
            Pin: companyDetails.pinCode,
            Stcd: companyDetails.stateCode
        },

        BuyerDtls: {
            Gstin: invoiceDetails.partyId.gstnNo?.trim(),
            LglNm: invoiceDetails.partyId.partyName?.trim(),
            Addr1: buyerAddress.Addr1,
            Loc: buyerAddress.Loc,
            Pin: buyerAddress.Pin,
            Stcd: String(buyerAddress.Stcd),
            Pos: String(buyerAddress.Stcd)
        },


        ItemList: itemList,

        ValDtls: {
            AssVal: Number(invoiceDetails.subTotal || 0) - Number(invoiceDetails.discount || 0),
            IgstVal: Number(invoiceDetails.igst || 0),
            CgstVal: Number(invoiceDetails.cgst || 0),
            SgstVal: Number(invoiceDetails.sgst || 0),
            OthChrg: Math.max(0, Number(otherCharges.toFixed(2))),
            TotInvVal: Number(invoiceDetails.grandTotal || 0)
        }
    };
};