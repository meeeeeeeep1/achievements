
namespace SpriteKind {
    //% iskind
    export const Achievement = SpriteKind.create()
}

//% color="#e6ac00" icon="\uf091"
namespace achievements {
    const padding = 3

    let notification: Sprite = null

    //% block="show achievement $title || speed $speed  header $header  icon $icon"
    //% icon.shadow="screen_image_picker"
    //% expandableArgumentMode="enabeled"
    //% inlineInputMode="inline"
    export function create(title: string, speed?: number, header?: string, icon?: Image): void {
        const achievement = new Achievement(title, header, icon)
        notification = sprites.create(achievement.getImage(), SpriteKind.Achievement)
        notification.setFlag(SpriteFlag.Ghost, true);
        notification.setFlag(SpriteFlag.RelativeToCamera, true)
        notification.setPosition((achievement.getImage().width / 2) + 2, 0 - (achievement.getImage().height / 2))
        control.runInParallel(function () {
            let velocity = (speed == 0 ? speed : 1) || 1
            notification.vy = 14 * velocity
            while (!(notification.y >= (achievement.getImage().height / 2) + 2)) {
                pause(0)
            }
            console.log(achievement.shouldScroll())
            notification.vy = 0
            if (achievement.shouldScroll()) {
                pause(200)
                console.log(achievement.scrollLength())
                for (let scroll = 0; scroll < achievement.scrollLength() * (2 / velocity); scroll++) {
                    notification.setImage(achievement.scroll(achievement.getSplitImage()[0], achievement.getSplitImage()[1], scroll * (-0.5 * Math.abs(velocity))))
                    pause(0)

                }
                pause(1200 / velocity)

            } else {
                pause(1500 / (velocity / 2))
            }
            notification.vy = -14 * velocity
            while (!(notification.y <= 0 - (achievement.getImage().height / 2))) {
                pause(0)
            }
            notification.destroy()
        })
    }
    //% block="cancel all achievement notifications"
    export function cancel() {
        if (!isDestroyed(notification)) {
            notification.destroy()
        }
    }
    //% block="is achievement showing?"
    export function isShowing(): boolean {
        return !isDestroyed(notification)
    }
    function isDestroyed(sprite: Sprite): boolean {
        return !sprite || !!(sprite.flags & sprites.Flag.Destroyed);
    }
    export class Achievement {
        // font5 - width: 6 | height: 5
        // font8 - width: 6 | height: 8
        public title: string;
        public header: string;
        public icon: Image;
        protected xOffset: number;
        constructor(title: string, header: string, icon: Image) {
            this.title = title
            this.header = header
            if (this.header == "") {
                this.header = null
            }
            this.icon = icon || image.create(0, 0)
        }
        protected draw() {
            let height = padding * 2
            this.xOffset = (this.icon.width == 0 ? 0 : 3) + this.icon.width
            let width = (padding * 2) + this.xOffset
            let textWidth = 0
            if (this.header) {
                height += Math.max(this.icon.height, 13)
                textWidth += Math.max(this.title.length, this.header.length) * 6
            } else {
                height += Math.max(this.icon.height, 8)
                textWidth += this.title.length * 6
            }

            width += textWidth
            const textImage = image.create(textWidth, height)

            const bubble = this.drawBubble(width, height, 156)

            bubble.drawTransparentImage(this.icon, padding, padding)
            if (this.header) {
                textImage.print(this.header, 0, padding, 13, image.font5)
                textImage.print(this.title, 0, 5 + padding, 15, image.font8)
            } else {
                textImage.print(this.title, 0, padding, 15, image.font8)

            }
            return [bubble, textImage]
        }
        public scroll(base: Image, layer: Image, scroll: number) {
            const bg = base
            const overlay = layer
            overlay.scroll(scroll, 0)
            bg.drawTransparentImage(overlay, this.xOffset + padding, 0)
            return bg
        }
        protected drawBubble(width: number, height: number, max?: number) {
            let realWidth = width
            if (width > max && max) {
                realWidth = max
            }
            const bubble = image.create(realWidth, height)
            bubble.fillRect(1, 0, realWidth - 2, height, 1)
            bubble.fillRect(0, 1, realWidth, height - 2, 1)
            return bubble
        }
        public getImage() {
            const bubble = this.draw()[0]
            bubble.drawTransparentImage(this.draw()[1], this.xOffset + padding, 0)
            return bubble
        }
        public getSplitImage() {
            return this.draw()
        }
        public shouldScroll(): boolean {
            return (this.xOffset + (padding * 2) + this.draw()[1].width) >= 156
        }
        public scrollLength(): number {
            return Math.max(0, this.xOffset + (padding * 2) + this.draw()[1].width) - 156
        }
    }
}