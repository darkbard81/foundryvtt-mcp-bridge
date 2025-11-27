import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";

export const router = new Router(
    "chatMsgRouter"
)

function stripHtmlKeepTraitSpaces(html: string | null | undefined): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html ?? '';

    let result = '';
    let isInsideSpan = false;  // span 안에 있는지 추적

    // 모든 노드를 순회
    function traverse(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE) {
            // 텍스트 노드면 그대로 추가
            result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // span 태그 처리 (이미 span 안이 아닐 때만)
            if (element.tagName === 'SPAN' && !isInsideSpan) {
                result += '[';
                isInsideSpan = true;  // span 안으로 들어감

                // 자식 노드들 순회
                element.childNodes.forEach(child => traverse(child));

                result += '] ';
                isInsideSpan = false;  // span 밖으로 나옴
            } else {
                // span이 아니거나 이미 span 안이면 그냥 자식만 순회
                element.childNodes.forEach(child => traverse(child));
            }
        }
    }

    traverse(tmp);

    // 중복 스페이스 제거하고 trim
    return result.replace(/\s+/g, ' ').trim();
}

/**
 * 최근 채팅 로그를 반환하는 라우트.
 * - 기본 20개까지 최근 메시지를 스트립/정리 후 소켓으로 전송한다.
 */
router.addRoute({
    actionType: "chat-logs",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        ModuleLogger.info(`Received request for roll data`);

        const recentChat: any[] = [];
        game.messages.contents.slice(-20).forEach((message: foundry.documents.ChatMessage) => {
            const cleanText = stripHtmlKeepTraitSpaces(message._source.flavor || '');
            if (cleanText) {
                recentChat.push(`${message.export()}\n${cleanText}`);
            } else {
                recentChat.push(message.export());
            }
        });

        socketManager?.send({
            type: "chat-logs-result",
            requestId: data.requestId,
            data: recentChat.slice(0, data.limit || 20)
        });
    }
});

/**
 * 단일 채팅 메시지를 생성하는 라우트.
 * - audioPath가 있으면 효과음을 재생하고, tokenId가 있으면 해당 토큰을 화자로 지정한다.
 */
router.addRoute(
    {
        actionType: "chat-message",
        handler: (data) => {
            if (data.audioPath) {
                const audioPath = data.audioPath;
                foundry.audio.AudioHelper.play({ src: audioPath, volume: 0.8, loop: false });
            }
            //const audience = [...everyoneUserIds()];
            const tokenDoc = canvas.getLayerByEmbeddedName("Token")?.get(data.tokenId)?.document;
            const speakerToken = foundry.documents.ChatMessage.getSpeaker(tokenDoc) ?? foundry.documents.ChatMessage.getSpeaker();
            foundry.documents.ChatMessage.create({
                speaker: speakerToken,
                //whisper: audience,
                content: data.message,
            });
            ModuleLogger.info(`Received chat-message`);
        }
    }
)

/**
 * 버블 메시지를 뿌리는 라우트.
 * - 배열 입력 시 각 항목의 asyncDelay(ms) 후 동시에 broadcast한다.
 */
router.addRoute(
    {
        actionType: "chat-bubbles",
        handler: async (data) => {
            // 주어진 배열의 각 항목별 asyncDelay(ms) 만큼만 지연 후 동시에 버블을 뿌린다.
            // data.data 가 진짜 payload
            const rawPayload = data?.data ?? [];
            const payload = Array.isArray(rawPayload) ? rawPayload : [rawPayload];
            const bubbles: foundry.canvas.animation.ChatBubbles = game.canvas.hud.bubbles;
            if (!bubbles) {
                ModuleLogger.warn("ChatBubbles instance not found.");
                return;
            }

            const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

            await Promise.all(payload.map(async (entry) => {
                const delay = Math.max(0, Number(entry?.asyncDelay) || 0);
                if (delay > 0) {
                    await wait(delay);
                }

                const tokenDoc = canvas.getLayerByEmbeddedName("Token")?.get(entry.tokenId)?.document;
                if (tokenDoc instanceof foundry.documents.TokenDocument) {
                    bubbles.broadcast(tokenDoc, entry?.message);
                } else {
                    ModuleLogger.warn("TokenDocument instance not found.");
                }
            }));

            ModuleLogger.info(`Received chat-bubbles`);
        }
    }
)
// function gmUserIds() { return game.users.filter(u => u.isGM).map(u => u.id); }
// function everyoneUserIds() { return game.users.map(u => u.id); }