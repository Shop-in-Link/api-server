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
        },

        /**
         * Return the URL of the actual shop bound to shopInLinkPath.
         *
         * @param parent Parent of resolver chain.
         * @param shopInLinkPath A ShopInLink path to visit.
         *
         * @return Shop URL to visit.
         */
        visitLink: async (parent: any, { shopInLinkPath }: { shopInLinkPath: IShopInLinkPathInput }) => {
            const link = await Link.findOne({ shopInLinkPath: shopInLinkPath.shopInLinkPath });

            if (!link) {
                throw new UserInputError('Link does not exist.');
            }

            // If the link has expiresAt and has expired.
            if (link.expiresAt && Date.now() > Date.parse(link.expiresAt)) {
                throw new UserInputError('Link has expired.');
            }

            // If the link has expiresView and has expired.
            if (link.expiresView && link.visitors >= link.expiresView) {
                throw new UserInputError('Link has expired.');
            }

            // TODO: Verify that access is legal or not.

            // To avoid race condition problem,
            // findOneAndUpdate() must be used instead of Model.save().
            await Link.findOneAndUpdate(
                { shopInLinkPath: shopInLinkPath.shopInLinkPath },
                { $inc: { visitors: 1 } }
            );

            return link.productUrl;
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

interface IShopInLinkPathInput {
    shopInLinkPath: string;
}
