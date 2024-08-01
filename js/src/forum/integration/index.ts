import app from "flarum/forum/app";
import { initNotification } from "./notification";
import { initPost } from "./post";
import { initDiscussionList } from "./discussionList";
import { initLike } from "./like";
import { initTypingTip } from "./typing";

export default function init() {
    initNotification();
    initPost();
    initDiscussionList();
    initLike();
    initTypingTip();
}