import { AmplifyInstance } from './types';
/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Amplify Protocol addresses, the
 *     Amplify.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @hidden
 *
 * @param {Amplify} _amplify The instance of the Amplify.js SDK.
 *
 */
export declare function netId(_amplify: AmplifyInstance): Promise<void>;
