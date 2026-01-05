import { ModuleLogger } from "./logger";

export enum targetIdType {
    TOKEN = "tokenId",
    ACTOR = "actorId",
    JOURNAL = "journalId",
    PAGE = "pageId"
}

type mapUUID = [targetIdType, string, string];
const mapList: mapUUID[] = [];

export function encryptUuid(id: string, convType: targetIdType): string {
    const found = mapList.find((entry) => entry[0] === convType && entry[1] === id);
    if (found) {
        return found[2];
    }

    const indexZ = `${convType}${mapList.length}`;
    mapList.push([convType, id, indexZ]);
    return indexZ;
}

export function decryptUuid(id: string, convType: targetIdType): string {
    const found = mapList.find((entry) => entry[0] === convType && entry[2] === id);
    if (found) {
        return found[1];
    }
    ModuleLogger.warn("DecryptUuid id not found.");
    return "";
}
