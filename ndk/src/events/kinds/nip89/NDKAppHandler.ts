import NDK, { NDKUserProfile } from "../../../index.js";
import NDKEvent, { NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * This is a NIP-89 app handler wrapper.
 *
 * @summary NIP-89 App Handler
 * @implements kind:31990
 */
export class NDKAppHandlerEvent extends NDKEvent {
    private profile: NDKUserProfile | null | undefined;

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.AppHandler;
    }

    static from(ndkEvent: NDKEvent) {
        return new NDKAppHandlerEvent(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    /**
     * Fetches app handler information
     * If no app information is available on the kind:31990,
     * we fetch the event's author's profile and return that instead.
     */
    async fetchProfile(): Promise<NDKUserProfile | undefined> {
        if (this.profile === undefined && this.content.length > 0) {
            try {
                const profile = JSON.parse(this.content);

                // make sure there is something
                if (profile && profile.name) {
                    return profile as NDKUserProfile;
                } else {
                    this.profile = null;
                }
            } catch (e) {
                this.profile = null;
            }
        }

        return new Promise((resolve, reject) => {
            const author = this.author;
            author
                .fetchProfile()
                .then(() => {
                    resolve(author.profile);
                })
                .catch(reject);
        });
    }
}
