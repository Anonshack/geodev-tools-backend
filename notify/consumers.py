import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        url_username = self.scope["url_route"]["kwargs"].get("username")
        if not url_username or user.username != url_username:
            await self.close(code=4003)
            return

        self.group_name = f"notifications_{user.username}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            "title": event.get("title"),
            "message": event.get("message"),
            "type": event.get("type", "system"),
            "created_at": event.get("created_at"),
        }))
