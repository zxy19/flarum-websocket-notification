import app from "flarum/forum/app";
import { initNotification } from "./notification";
import { initPost } from "./post";

export default function init() {
    initNotification();
    initPost();
}