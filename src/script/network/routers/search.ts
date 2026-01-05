import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";
import { encryptUuid, targetIdType } from "../../utils/convUUID";

export const router = new Router("searchRouter");

router.addRoute({
    actionType: "search-tokens",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        ModuleLogger.info(`Received request for roll data`);

        const tokenInfo: any[] = [];

        canvas.getLayerByEmbeddedName("Token")?.placeables.forEach((token) => {
            const tokenDoc: foundry.documents.TokenDocument = token.document;
            const actorId = tokenDoc._source.actorId;
            if (!actorId) return;

            const actor = game.actors.get(actorId);
            if (!actor) return;

            const ownerIds = Object.entries(actor._source.ownership ?? {})
                .filter(([, level]) => level === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
                .map(([userId]) => userId);

            const owners = ownerIds.map(id => {
                const user = game.users.get(id);
                return { id, name: user?._source.name };
            });

            type ActorSystemDetails = {
                system?: {
                    details?: {
                        biography?: {
                            campaignNotes?: string;
                        };
                    };
                };
            };
            type SystemDetails = { details?: { publicNotes?: string } };
            let publicNotes: string | undefined = '';

            if (tokenDoc._source.actorLink) {
                const actorSystem = actor as ActorSystemDetails;
                publicNotes = actorSystem.system?.details?.biography?.campaignNotes;
            } else {
                const deltaSystem = tokenDoc._source.delta?.system as SystemDetails | undefined;
                publicNotes = deltaSystem?.details?.publicNotes;
            }

            let tokenID: string = encryptUuid(tokenDoc._source._id ?? "", targetIdType.TOKEN);
            let actorID: string = encryptUuid(actor.id ?? "", targetIdType.ACTOR);

            tokenInfo.push({
                token: tokenID,//tokenDoc._source._id,
                name: tokenDoc._source.name,
                actorId: actorID,//actor.id
                x: tokenDoc._source.x,
                y: tokenDoc._source.y,
                type: actor._source.type,
                publicNotes,
                owners
            });
        });

        socketManager?.send({
            type: "search-tokens-result",
            requestId: data.requestId,
            data: tokenInfo
        });
    }
});
