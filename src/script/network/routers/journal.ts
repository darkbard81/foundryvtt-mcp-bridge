import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";

export const router = new Router("journalRouter");

router.addRoute({
    actionType: "journal-list",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        ModuleLogger.info(`Received request for roll data`);

        const journalInfo: any[] = [];
        game.journal.contents.forEach((j: foundry.documents.JournalEntry) => {
            journalInfo.push(j.toObject());
        });

        socketManager?.send({
            type: "journal-list-result",
            requestId: data.requestId,
            data: journalInfo
        });
    }
});

//To-do: add route for journal page CRUD