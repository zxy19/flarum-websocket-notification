import app from "flarum/forum/app";

let unreadCount = 0;

export function initUnreadTip() {
    window.addEventListener('focus', () => {
        unreadCount = 0;
        app.setTitleCount(0);
    });
}
export function addUnread() {
    if (!document.hasFocus()) {
        unreadCount++;
        console.log(`Update unread:${unreadCount}`);
        app.setTitleCount(unreadCount);
    }
}