import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
    sender: string;
    text: string;
    id: string;
}

export interface ChatTitle {
    chatId: string;
    title: string;
}

export interface User {
    name: string;
    id: string; 
    password: string;
    avatar: string;
    friendCode: string;
    userChats: ChatTitle[];
    friends: string[];
}

export interface EmojiModalState {
    isOpen: boolean;
    emoji: string;
    color: "red" | "green";
    text: string;
}

interface InitialState {
    isUserRegister: boolean;
    emojiModal: EmojiModalState;
    isLogInModalOpen: boolean;
    isLogOnModalOpen: boolean;
    user: User;
    chat: ChatMessage[];
    currentChatId: string | null;
}

const initialState: InitialState = {
    isUserRegister: false,
    emojiModal: {
        isOpen: false,
        emoji: "",
        color: "green",
        text: ""
    },
    isLogInModalOpen: false,
    isLogOnModalOpen: false,
    user: {
        name: "",
        id: "",
        password: "",
        avatar: "",
        friendCode: "",
        userChats: [],
        friends: []
    },
    chat: [],
    currentChatId: null
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        onSetUserStatus: (state, action: PayloadAction<boolean>) => {
            state.isUserRegister = action.payload;
        },

        showEmojiModal: (
            state,
            action: PayloadAction<{ emoji: string; color: "red" | "green"; text: string }>
        ) => {
            state.emojiModal = {
                isOpen: true,
                ...action.payload
            };
        },

        hideEmojiModal: (state) => {
            state.emojiModal.isOpen = false;
        },

        onSetLogInModal: (state) => {
            state.isLogInModalOpen = !state.isLogInModalOpen;
        },

        onSetLogOnModal: (state) => {
            state.isLogOnModalOpen = !state.isLogOnModalOpen;
        },

        onSetUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        onSetCurrentChat: (
            state,
            action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>
        ) => {
            state.currentChatId = action.payload.chatId;
            state.chat = action.payload.messages;
        },

        onAddMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.chat.push(action.payload);
        },

        onAddChatToUser: (
            state,
            action: PayloadAction<{ chatId: string; title: string; friendId: string }>
        ) => {
            if (state.user.id) {
                state.user.userChats.push({
                    chatId: action.payload.chatId,
                    title: action.payload.title
                });

                const exists = state.user.userChats.some(
                    (chat) => chat.chatId === action.payload.chatId
                );
    
                if (!exists) {
                    state.user.userChats.push({
                        chatId: action.payload.chatId,
                        title: action.payload.title
                    });
                }

                if (!state.user.friends.includes(action.payload.friendId)) {
                    state.user.friends.push(action.payload.friendId);
                }
            }
        },

        onUserDeleted: (state, action: PayloadAction<string>) => {
            if (state.user.id === action.payload) {
                state.isUserRegister = false;
                state.user = {
                    name: "",
                    id: "",
                    password: "",
                    avatar: "",
                    friendCode: "",
                    userChats: [],
                    friends: [],
                };
                state.chat = [];
                state.currentChatId = null;
            } else {
                state.user.friends = state.user.friends.filter(id => id !== action.payload);
                state.user.userChats = state.user.userChats.filter(chat => !chat.chatId.includes(action.payload));
            }
        }
    }
});

export const {
    onSetUserStatus,
    onSetLogInModal,
    onSetLogOnModal,
    onSetUser,
    showEmojiModal,
    hideEmojiModal,
    onSetCurrentChat,
    onAddMessage,
    onAddChatToUser,
    onUserDeleted
} = chatSlice.actions;

export default chatSlice.reducer;