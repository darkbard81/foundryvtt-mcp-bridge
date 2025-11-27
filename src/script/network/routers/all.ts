import {Router} from "./baseRouter"
import {router as PingPongRouter} from "./pingPong"
import {router as SearchRouter} from "./search"
import {router as chatMsgRouter} from "./chatMsg"
import {router as journalRouter} from "./journal"


export const routers: Router[] = [
    PingPongRouter,
    SearchRouter,
    chatMsgRouter,
    journalRouter
]