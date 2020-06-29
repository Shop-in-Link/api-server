import { UserInputError } from 'apollo-server-express';
import crypto from 'crypto';
import base64Url from 'urlsafe-base64';

import Link from '../../models/link';
import { ITokenPayload } from '../../utils/TokenPayload';

export default {
    Mutation: {
        /**
         * Create and save a new ShopInLink path.
         *
         * @param parent Parent of resolver chain.
         * @param marketLink A URL of the product to generate ShopInLink path.
         * @param tokenPayload A JWT payload injected from context handler.
         */
        createLink: async (parent: any, { marketLink }: { marketLink: IMarketLinkInput }, { tokenPayload }: { tokenPayload: ITokenPayload }) => {
            const url = new URL(marketLink.marketUrl);

            const isExists = await Link.exists({
                owner: tokenPayload.userId,
                marketFqdn: url.host,
                productPath: url.pathname,
                productParameter: url.search
            });

            if (isExists) {
                throw new UserInputError('Market URL already exists.');
            }

            // TODO: Change logic of expiresAfter.
            const expiresAfter = 1000 * 60 * 60 * 24 * 3;

            const link = new Link({
                marketFqdn: url.host,
                productPath: url.pathname,
                productParameter: url.search,
                shopInLinkPath: await generateShopInLinkPath(tokenPayload.userId, marketLink.marketUrl),
                owner: tokenPayload.userId,
                expiresAt: Date.now() + expiresAfter
            });

            const createdLink = await link.save();

            return { ...createdLink._doc, _id: createdLink._id.toString(), productUrl: createdLink.productUrl };
        }
    }
};

/**
 * Generate unique Shop in Link path.
 *
 * @param userId User id.
 * @param marketUrl Market URL.
 */
async function generateShopInLinkPath(userId: string, marketUrl: string) {
    const plainText = `${userId}${marketUrl}`;

    let hashedString: string
    do {
        hashedString = `/${getHashedString(plainText)}`;
    } while (await Link.exists({ shopInLinkPath: hashedString }))

    return hashedString;
}

/**
 * Return a string that URL-safe, base64 encoded, hashed with sha256.
 *
 * @param plainText Plain text to hash.
 */
function getHashedString(plainText: string): string {
    const salt = crypto.randomBytes(32);
    const hashed = crypto.pbkdf2Sync(
        plainText,
        salt.toString('base64'),
        512,
        13,
        'sha256'
    );

    return base64Url.encode(hashed);
}

interface IMarketLinkInput {
    marketUrl: string;
}
