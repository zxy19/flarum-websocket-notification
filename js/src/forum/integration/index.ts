import app from "flarum/forum/app";
import { initNotification } from "./notification";
import { initPost } from "./post";
import { initDiscussionList } from "./discussionList";
import { initLike } from "./like";
import { initTypingTip } from "./typing";
import { initReaction } from "./reaction";
import { initOnline } from "./online";
import { initPoll } from "./poll";

export default function init() {
    initNotification();
    initPost();
    initDiscussionList();
    initLike();
    initTypingTip();
    initReaction();
    initOnline();
    initPoll();
}