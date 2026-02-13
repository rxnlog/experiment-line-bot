import { messagingApi } from '@line/bot-sdk';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

export const lineClient = new messagingApi.MessagingApiClient({
    channelAccessToken,
});

export const lineConfig = {
    channelAccessToken,
    channelSecret,
};
