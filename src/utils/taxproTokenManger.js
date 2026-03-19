

const taxProTokenCache = {};

export const getValidTaxProToken = async (gstnNo, type, authFunction) => {

    const cacheKey = `${type}_${gstnNo}`;

    const cachedToken = taxProTokenCache[cacheKey];

    if (cachedToken) {

        const expiryTime = new Date(cachedToken.expiry);
        const now = new Date();

        if (expiryTime > now) {
            console.log(`Using cached ${type} token for GSTIN:`, gstnNo);
            return cachedToken.token;
        }
    }

    console.log(`Generating new ${type} token for GSTIN:`, gstnNo);

    const authResponse = await authFunction(gstnNo);

    if (!authResponse || (authResponse.Status != 1 && authResponse.status != 1)) {
        throw new Error(`Failed to generate ${type} Auth Token`);
    }

    let token =
        authResponse?.Data?.AuthToken ||
        authResponse?.AuthToken ||
        authResponse?.authtoken;

    let expiry =
        authResponse?.Data?.TokenExpiry ||
        authResponse?.TokenExpiry ||
        authResponse?.expiry;

    if (!token) {
        throw new Error("AuthToken missing in response");
    }

    taxProTokenCache[cacheKey] = {
        token,
        expiry
    };

    return token;
};