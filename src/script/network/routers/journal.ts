import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";

export const router = new Router("journalRouter");

// Foundry aliases for brevity in this file
type JournalEntry = foundry.documents.JournalEntry;
type JournalEntryPage = foundry.documents.JournalEntryPage;
type JournalEntrySource = {
    _id: JournalEntry["_source"]["_id"];
    title: JournalEntry["_source"]["name"];
    sort: JournalEntry["_source"]["sort"];
};
type JournalEntryPageSource = JournalEntryPage["_source"];
type JournalPageDoc = JournalEntryPage & { _id?: string; name?: string; title?: string; _source?: { _id?: string; title?: string } };
type JournalWithSource = JournalEntry & { _source?: { pages?: { _id: string; title: string }[] } };

router.addRoute({
    actionType: "journal-list",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        ModuleLogger.info(`Received request for journal list`);

        const journalInfo: JournalEntrySource[] = [];
        game.journal.contents.forEach((j: JournalEntry) => {
            journalInfo.push(
                {
                    _id: j._source._id,
                    title: j._source.name,
                    sort: j._source.sort
                }
            );
        });
        ModuleLogger.info(`Sending journal list: ${journalInfo.length} entries`);

        socketManager?.send({
            type: "journal-list-result",
            requestId: data.requestId,
            data: journalInfo
        });
    }
});

router.addRoute({
    actionType: "journal-page-list",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        const payload = (data ?? {}) as { journalId?: string; requestId?: string };
        const { journalId } = payload;
        ModuleLogger.info(`Received request for journal page list (journalId: ${journalId ?? "unknown"})`);

        let journal: JournalEntry | null = null;
        let result:
            | { success: true; pages: { id: string; name: string }[] }
            | { success: false; error: string; pages?: { id: string; name: string }[] } = { success: false, error: "Unknown error" };

        try {
            journal = typeof journalId === "string" ? game.journal.get(journalId) : null;
            if (!journal) {
                throw new Error("Journal not found");
            }
            const collection = journal.getEmbeddedCollection?.("JournalEntryPage") as
                | foundry.utils.Collection<string, JournalEntryPage>
                | undefined;
            const pages = collection
                ? collection.map((page) => {
                    const safePage = page as JournalPageDoc;
                    return {
                        id: safePage.id ?? safePage._id ?? safePage._source?._id ?? "",
                        name: safePage.name ?? safePage.title ?? safePage._source?.title ?? ""
                    };
                })
                : Array.isArray((journal as JournalWithSource)._source?.pages)
                    ? ((journal as JournalWithSource)._source?.pages ?? []).map((page) => ({
                        id: page._id,
                        name: page.title
                    }))
                    : [];
            result = { success: true, pages };
            ModuleLogger.info(`Journal page list ready (journalId: ${journalId ?? "unknown"}, count: ${pages.length})`);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            ModuleLogger.error(`Journal page action failed: ${message}`);
            result = { success: false, error: message };
        }

        socketManager?.send({
            type: "journal-page-list-result",
            requestId: data.requestId,
            data: result
        });
    }
});

router.addRoute({
    actionType: "journal-page",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        const payload = (data ?? {}) as {
            action?: "create" | "update" | "delete" | "read";
            journalId?: string;
            pageId?: string;
            pageData?: Partial<JournalEntryPageSource>;
            requestId?: string;
        };
        const { action, journalId, pageId, pageData } = payload;
        let journal: JournalEntry | null = null;
        let result:
            | { success: true; page: JournalEntryPageSource | { _id: string; deleted: true } }
            | { success: false; error: string } = { success: false, error: "Unknown error" };

        try {
            ModuleLogger.info(`Journal page action request (action: ${action ?? "unknown"}, journalId: ${journalId ?? "unknown"}, pageId: ${pageId ?? "none"})`);
            journal = typeof journalId === "string" ? game.journal.get(journalId) : null;
            if (!journal) {
                throw new Error("Journal not found");
            }

            switch (action) {
                case "create": {
                    const created = await journal.createEmbeddedDocuments("JournalEntryPage", [pageData ?? {}]);
                    result = { success: true, page: created[0]?.toObject() as JournalEntryPageSource };
                    ModuleLogger.info(`Journal page created (journalId: ${journalId} new page)`);
                    break;
                }
                case "update": {
                    if (!pageId) throw new Error("pageId is required");
                    const updated = await journal.updateEmbeddedDocuments("JournalEntryPage", [{ _id: pageId, ...(pageData ?? {}) }]);
                    result = { success: true, page: updated[0]?.toObject() as JournalEntryPageSource };
                    ModuleLogger.info(`Journal page updated (journalId: ${journalId}, pageId: ${pageId})`);
                    break;
                }
                case "delete": {
                    if (!pageId) throw new Error("pageId is required");
                    await journal.deleteEmbeddedDocuments("JournalEntryPage", [pageId]);
                    result = { success: true, page: { _id: pageId, deleted: true } };
                    ModuleLogger.info(`Journal page deleted (journalId: ${journalId}, pageId: ${pageId})`);
                    break;
                }
                case "read": {
                    const page = pageId ? journal.getEmbeddedDocument("JournalEntryPage", pageId) : null;
                    if (!page) throw new Error("page not found");
                    result = { success: true, page: page.toObject() as JournalEntryPageSource };
                    ModuleLogger.info(`Journal page read (journalId: ${journalId}, pageId: ${pageId})`);
                    break;
                }
                default:
                    throw new Error("Unknown action");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            ModuleLogger.error(`Journal page action failed (action: ${action ?? "unknown"}, journalId: ${journalId ?? "unknown"}, pageId: ${pageId ?? "none"}): ${message}`);
            result = { success: false, error: message };
        }

        socketManager?.send({
            type: "journal-page-result",
            requestId: data?.requestId,
            data: result
        });
    }
});
