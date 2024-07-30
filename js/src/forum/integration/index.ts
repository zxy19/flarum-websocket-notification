import app from "flarum/forum/app";
import { initNotification } from "./notification";
import { initPost } from "./post";
import { initDiscussionList } from "./discussionList";

export default function init() {
    initNotification();
    initPost();
    initDiscussionList();
}