/**
 * Displays notifications in the browser-action popup.
 */
class NotificationsPopup {
    /**
     * Initialize instance, load notifications from storage and watch future data updates.
     * @param remotePontoon
     */
    constructor(remotePontoon) {
        this._remotePontoon = remotePontoon;

        this._watchStorageChanges();
        this._loadNotificationsFromStorage();
    }

    /**
     * Update notifications popup when notification data change in storage.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToNotificationsChange(
            (change) => this._displayNotifications(change.newValue)
        );
    }

    /**
     * Load notifications data from storage and update the popup.
     * @private
     */
    _loadNotificationsFromStorage() {
        const dataKey = 'notificationsData';
        browser.storage.local.get(dataKey).then(
            (item) => this._displayNotifications(item[dataKey])
        );
    }

    /**
     * Create notification popup list item from data object.
     * @param notification data object
     * @returns {Element} notification list item
     * @private
     */
    _createNotificationListItem(notification) {
        const listItem = document.createElement('li');
        if (notification.unread) {
            listItem.classList.add('unread');
        } else {
            listItem.classList.add('read');
        }
        if (notification.actor) {
            const actorLink = document.createElement('a');
            actorLink.textContent = notification.actor.text;
            actorLink.setAttribute('href', this._remotePontoon.getTeamProjectUrl(notification.actor.link));
            listItem.appendChild(actorLink);
        }
        if (notification.verb) {
            const verb = document.createElement('span');
            verb.textContent = ` ${notification.verb}`;
            listItem.appendChild(verb);
        }
        if (notification.target) {
            const targetLink = document.createElement('a');
            targetLink.textContent = ` ${notification.target.text}`;
            targetLink.setAttribute('href', this._remotePontoon.getTeamProjectUrl(notification.target.link));
            listItem.appendChild(targetLink);
        }
        if (notification.timeago) {
            const timeago = document.createElement('div');
            timeago.textContent = notification.timeago;
            timeago.classList.add('timeago');
            listItem.appendChild(timeago);
        }
        if (notification.message) {
            const message = document.createElement('div');
            message.textContent = notification.message;
            message.classList.add('message');
            listItem.appendChild(message);
        }
        if (listItem.querySelectorAll('a').length === 1) {
            const linkUrl  = listItem.querySelector('a').href;
            listItem.querySelectorAll('*').forEach((child) => {
                child.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    browser.tabs.create({url: linkUrl});
                });
            });
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                browser.tabs.create({url: linkUrl});
            });
            listItem.classList.add('pointer');
        }
        return listItem;
    }

    /**
     * Display notifications from data from storage.
     * @param notificationsData from storage
     * @private
     */
    _displayNotifications(notificationsData) {
        const notificationsList = document.getElementById('notification-list');
        const markAllReadLink = document.querySelector('.notification-list .mark-all-as-read');
        const seeAllLink = document.querySelector('.notification-list .see-all');
        const error = document.getElementById('error');

        if (notificationsData !== undefined && Object.keys(notificationsData).length > 0) {
            while (notificationsList.lastChild) {
                notificationsList.removeChild(notificationsList.lastChild);
            }
            Object.keys(notificationsData).sort().reverse()
                .map((nKey) => notificationsData[nKey])
                .map((data) => this._createNotificationListItem(data))
                .forEach((listItem) => notificationsList.appendChild(listItem));
            notificationsList.classList.remove('hidden');
            if (Object.values(notificationsData).some(n => n.unread)) {
                markAllReadLink.classList.remove('hidden');
                seeAllLink.classList.add('hidden');
            } else {
                markAllReadLink.classList.add('hidden');
                seeAllLink.classList.remove('hidden');
            }
            error.classList.add('hidden');
        } else if (notificationsData !== undefined) {
            notificationsList.classList.add('hidden');
            markAllReadLink.classList.add('hidden');
            seeAllLink.classList.remove('hidden');
            error.classList.add('hidden');
        } else {
            notificationsList.classList.add('hidden');
            markAllReadLink.classList.add('hidden');
            seeAllLink.classList.add('hidden');
            error.classList.remove('hidden');
        }
    }
}
