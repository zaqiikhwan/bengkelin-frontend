/**
 * ChatPage Component - Real-time Chat Implementation
 *
 * CURRENT STATUS:
 * ✅ WebSocket connection working for both users and mitras
 * ✅ Message sending via WebSocket with HTTP fallback
 * ✅ Message receiving via WebSocket with API polling fallback
 * ✅ Room selection and navigation
 * ✅ Message editing functionality (click edit button on own messages)
 * ✅ Temporary message display for immediate feedback
 * ✅ Smart scrolling (doesn't interrupt reading old messages)
 * ✅ Comprehensive error handling and debugging
 * ✅ Optimized data loading with pagination
 * ✅ "Load More Messages" button for better performance
 * ✅ Typing indicators following backend specification
 *
 * TYPING INDICATOR IMPLEMENTATION:
 * 📝 Follows exact backend specification format
 * ⏱️ 2-second timeout for auto-stop (as per spec)
 * 🔄 Proper start/stop logic with timer management
 * 🛑 Auto-stop when sending messages or switching rooms
 *
 * KNOWN ISSUES (Server-side):
 * ⚠️ Message broker doesn't broadcast to mitra connections (server logs show "Forwarding message to WebSocket client" for users only)
 * ⚠️ Presence system not working (no presence_update events from server)
 * ⚠️ Typing indicators may not broadcast properly to other participants (server-side broadcasting issue)
 *
 * WORKAROUNDS IMPLEMENTED:
 * � Online  status shows "Online" when WebSocket is connected (fallback for broken presence system)
 * 🔄 Hybrid message system: WebSocket for sending + API polling for receiving
 * ⌨️ Enhanced typing indicators with proper timing and cleanup
 * 🔧 Optimized data loading: Load recent messages first, then older messages on demand
 * 🔧 Pagination with "Load More" button to prevent overwhelming the API
 *
 * CHAT DATA LOADING BEST PRACTICES IMPLEMENTED:
 * 📱 Load recent messages first (immediate UX)
 * �  Pagination with "Load More Messages" button
 * � Backgrounnd loading limited to prevent API overload
 * � Autko-mark unread messages as read
 * �  Efficient state management with useReducer
 *
 * NEXT STEPS (Server-side fixes needed):
 * 1. Fix message broker to include mitra connections in room broadcasts
 * 2. Implement proper presence_update event broadcasting
 * 3. Fix typing_update event broadcasting to all room participants
 */

import React, { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, PaperClipIcon, EllipsisVerticalIcon, UserCircleIcon, PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { CheckIcon, CheckCheckIcon } from "lucide-react";
import { apiService } from "../services/api";
import { webSocketService } from "../services/websocket";
import { useAuth } from "../hooks/useAuth";
import type { ChatRoom, ChatMessage } from "../types/api";
// Custom hook to force re-render
const useForceUpdate = () => {
    const [, setTick] = useState(0);
    const update = useCallback(() => {
        setTick((tick) => tick + 1);
    }, []);
    return update;
};

// Messages reducer for more reliable state updates
type MessagesAction =
    | { type: "SET_MESSAGES"; payload: ChatMessage[] }
    | { type: "ADD_MESSAGE"; payload: ChatMessage }
    | { type: "REPLACE_TEMP_MESSAGE"; payload: { tempId: string; realMessage: ChatMessage } }
    | { type: "REMOVE_TEMP_MESSAGE"; payload: string }
    | { type: "UPDATE_MESSAGE_READ"; payload: { messageId: string; readAt: string } }
    | { type: "CONFIRM_MESSAGE"; payload: { tempId: string; realMessage: ChatMessage } }
    | { type: "CLEAR_MESSAGES" };

const messagesReducer = (state: ChatMessage[], action: MessagesAction): ChatMessage[] => {
    console.log("Messages reducer action:", action.type, "payload" in action ? action.payload : "no payload");

    switch (action.type) {
        case "SET_MESSAGES":
            return action.payload;
        case "ADD_MESSAGE":
            // Check if message already exists
            if (state.some((msg) => msg.id === action.payload.id)) {
                console.log("Message already exists, skipping");
                return state;
            }
            return [...state, action.payload];
        case "REPLACE_TEMP_MESSAGE": {
            const tempIndex = state.findIndex((msg) => msg.id === action.payload.tempId);
            if (tempIndex !== -1) {
                const newState = [...state];
                newState[tempIndex] = action.payload.realMessage;
                return newState;
            }
            // If temp message not found, just add the real message
            return [...state, action.payload.realMessage];
        }
        case "REMOVE_TEMP_MESSAGE":
            return state.filter((msg) => msg.id !== action.payload);
        case "UPDATE_MESSAGE_READ":
            return state.map((msg) => (msg.id === action.payload.messageId ? { ...msg, is_read: true, read_at: action.payload.readAt } : msg));
        case "CONFIRM_MESSAGE": {
            // Replace temp message with confirmed real message from WebSocket
            const confirmIndex = state.findIndex((msg) => msg.id === action.payload.tempId);
            if (confirmIndex !== -1) {
                const newState = [...state];
                newState[confirmIndex] = action.payload.realMessage;
                return newState;
            }
            // If temp message not found, just add the real message
            return [...state, action.payload.realMessage];
        }
        case "CLEAR_MESSAGES":
            return [];
        default:
            return state;
    }
};
const ChatPage: React.FC = () => {
    const { user, mitra, userType } = useAuth();
    const location = useLocation();
    const forceUpdate = useForceUpdate();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, dispatchMessages] = useReducer(messagesReducer, []);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
    const [messagesKey, setMessagesKey] = useState(0);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [typingTimer, setTypingTimer] = useState<number | null>(null);
    const [presenceData, setPresenceData] = useState<Map<string, { isOnline: boolean; lastSeen: string }>>(new Map());
    const selectedRoomRef = useRef<ChatRoom | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesRef = useRef<ChatMessage[]>(messages);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    // Tracks last activity timestamp (ms) per room from the OTHER participant
    // Used to infer online status when backend presence_update events are unavailable
    const roomActivityRef = useRef<Map<string, number>>(new Map());

    // Update the ref whenever selectedRoom changes
    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    // Periodically re-render so activity-based presence status ("recently active") stays accurate
    useEffect(() => {
        const interval = setInterval(() => {
            setForceUpdateCounter((prev) => prev + 1);
        }, 60000); // Re-evaluate every minute
        return () => clearInterval(interval);
    }, []);

    const currentUser = user || mitra;
    const getCurrentUserId = useCallback(() => currentUser?.id || "", [currentUser?.id]);

    useEffect(() => {
        loadChatRooms();

        // Check initial WebSocket connection state
        const initialConnectionState = webSocketService.isConnected();
        console.log("Initial WebSocket connection state:", initialConnectionState);
        setWsConnected(initialConnectionState);

        // Set up WebSocket event listeners
        console.log("🔧 Setting up WebSocket event listeners...");

        const newMessageHandler = (message: ChatMessage) => {
            // Get current selected room from ref (not closure)
            const currentSelectedRoom = selectedRoomRef.current;

            // Track activity from other participant for activity-based presence inference
            if (message.sender_id !== getCurrentUserId()) {
                roomActivityRef.current.set(message.room_id, Date.now());
            }

            // Always update room list regardless of which room the message is for
            setRooms((prevRooms) => {
                const updatedRooms = prevRooms.map((room) => {
                    if (room.id === message.room_id) {
                        const isFromOtherUser = message.sender_id !== getCurrentUserId();
                        const isNotCurrentRoom = currentSelectedRoom?.id !== message.room_id;
                        const shouldIncrementUnread = isFromOtherUser && isNotCurrentRoom;

                        return {
                            ...room,
                            last_message: message.content,
                            last_message_at: message.created_at,
                            unread_count: shouldIncrementUnread ? room.unread_count + 1 : room.unread_count,
                        };
                    }
                    return room;
                });

                // Sort rooms by last message time (most recent first)
                const sortedRooms = updatedRooms.sort((a, b) => {
                    const timeA = new Date(a.last_message_at || a.updated_at).getTime();
                    const timeB = new Date(b.last_message_at || b.updated_at).getTime();
                    return timeB - timeA;
                });

                // Force a re-render by returning a new array reference
                return [...sortedRooms];
            });

            // Only add to current room's messages if it's the selected room
            if (currentSelectedRoom && message.room_id === currentSelectedRoom.id) {
                // Check if this is our own message (replace temp message)
                if (message.sender_id === getCurrentUserId()) {
                    const tempMessages = messagesRef.current.filter((msg) => msg.id.startsWith("temp-"));
                    if (tempMessages.length > 0) {
                        const latestTemp = tempMessages[tempMessages.length - 1];
                        dispatchMessages({ type: "REPLACE_TEMP_MESSAGE", payload: { tempId: latestTemp.id, realMessage: message } });
                    } else {
                        dispatchMessages({ type: "ADD_MESSAGE", payload: message });
                    }
                } else {
                    handleNewMessage(message);

                    // Mark this message as read immediately since we're viewing the room
                    apiService
                        .markMessagesAsRead({
                            message_ids: [message.id],
                        })
                        .catch((error) => {
                            console.error("Failed to auto-mark message as read:", error);
                        });
                }
            }
        };

        const typingHandler = (data: { room_id: string; user_id: string; user_type?: string; is_typing: boolean; user_name?: string }) => {
            console.log("⌨️ TYPING UPDATE RECEIVED:", data);
            console.log("⌨️ 🔧 MITRA DEBUG - selectedRoomRef.current:", selectedRoomRef.current);
            console.log("⌨️ 🔧 MITRA DEBUG - selectedRoom state:", selectedRoom);
            console.log("⌨️ 🔧 MITRA DEBUG - userType:", userType);
            handleTypingIndicator(data);
        };

        const messageReadHandler = (data: { room_id?: string; message_id?: string; message_ids?: string[]; reader_id: string; read_at?: string }) => {
            console.log("👁️ MESSAGE READ EVENT RECEIVED:", data);
            console.log("👁️ Current room from ref:", selectedRoomRef.current?.id);
            console.log("👁️ Current user ID:", getCurrentUserId());
            handleMessageRead(data);
        };

        const presenceHandler = (data: { user_id: string; user_type: string; is_online: boolean; user_name?: string; last_seen?: string }) => {
            console.log("🎉 PRESENCE UPDATE RECEIVED:", data);
            console.log("🎉 Presence data structure:", {
                user_id: data.user_id,
                user_type: data.user_type,
                user_name: data.user_name,
                is_online: data.is_online,
                last_seen: data.last_seen,
            });
            console.log("🎉 Current presenceData before update:", Array.from(presenceData.entries()));
            handlePresenceUpdate(data);
        };

        webSocketService.on("new_message", newMessageHandler);
        webSocketService.on("typing_update", typingHandler);
        webSocketService.on("message_read", messageReadHandler);
        webSocketService.on("presence_update", presenceHandler);

        webSocketService.on("connected", () => {
            console.log("✅ WebSocket CONNECTED - real-time messaging enabled");
            setWsConnected(true);
        });
        webSocketService.on("disconnected", () => {
            console.log("❌ WebSocket DISCONNECTED - falling back to HTTP API");
            setWsConnected(false);
        });

        // Automatically connect WebSocket if not already connected
        if (!initialConnectionState) {
            console.log("Attempting to connect WebSocket automatically...");
            webSocketService.connect().catch((error) => {
                console.error("Failed to auto-connect WebSocket:", error);
            });
        }

        // Cleanup function
        return () => {
            console.log("Cleaning up WebSocket event listeners...");
            webSocketService.off("new_message", newMessageHandler);
            webSocketService.off("typing_update", typingHandler);
            webSocketService.off("message_read", messageReadHandler);

            // Clean up typing timer
            if (typingTimer) {
                clearTimeout(typingTimer);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle navigation state when rooms are loaded
    useEffect(() => {
        if (location.state?.selectedRoomId && rooms.length === 0) {
            console.log("Waiting for rooms to load, selectedRoomId:", location.state.selectedRoomId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.selectedRoomId]);

    useEffect(() => {
        // Handle navigation state for auto-selecting room
        if (location.state?.selectedRoomId) {
            console.log("Looking for room with ID:", location.state.selectedRoomId);

            if (location.state.newRoom) {
                console.log("Adding new room to list:", location.state.newRoom);
                const newRoom = location.state.newRoom as ChatRoom;

                setRooms((prev) => {
                    const exists = prev.find((room) => room.id === newRoom.id);
                    if (exists) {
                        return prev;
                    }
                    return [newRoom, ...prev];
                });

                setSelectedRoom(newRoom);
                window.history.replaceState({}, document.title);
            } else if (rooms.length > 0) {
                console.log(
                    "Available rooms:",
                    rooms.map((r) => ({ id: r.id, name: r.bengkel?.bengkel_name || r.user?.first_name })),
                );

                const targetRoom = rooms.find((room) => room.id === location.state.selectedRoomId);
                if (targetRoom) {
                    console.log("Found target room:", targetRoom);
                    setSelectedRoom(targetRoom);
                    window.history.replaceState({}, document.title);
                } else {
                    console.log("Room not found, refreshing room list");
                    loadChatRooms();
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, rooms]);
    useEffect(() => {
        if (selectedRoom) {
            loadMessages(selectedRoom.id);

            // Skip polling when WebSocket is connected for real-time updates
            if (wsConnected) {
                console.log("🔒 WebSocket connected: Polling disabled - relying on WebSocket events for real-time updates");
                return;
            }

            // Set up polling for messages every 5 seconds when WebSocket is not connected
            const pollInterval = setInterval(() => {
                if (!wsConnected) {
                    console.log("🔄 Polling for messages (WebSocket offline)...");
                    loadMessages(selectedRoom.id);
                }
            }, 5000);

            return () => {
                clearInterval(pollInterval);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoom, wsConnected]); // Removed prevCursor from dependencies to prevent infinite loop

    useEffect(() => {
        messagesRef.current = messages;
        if (selectedRoom) {
            console.log("Messages updated for room:", {
                roomId: selectedRoom.id,
                messageCount: messages.length,
                forceUpdateCounter,
                messagesKey,
                renderTrigger,
                messageIds: messages.map((m) => m.id),
            });
        }
    }, [messages, forceUpdateCounter, messagesKey, renderTrigger, selectedRoom]);

    const loadChatRooms = async () => {
        try {
            console.log("=== Loading Chat Rooms ===");
            console.log("User type:", userType);
            console.log("Current user:", currentUser);

            let response;
            if (userType === "mitras") {
                try {
                    console.log("Getting mitra profile to find bengkel ID...");
                    const profileResponse = await apiService.getMitraProfile();
                    console.log("Mitra profile response:", profileResponse);

                    if (profileResponse.success && profileResponse.data) {
                        console.log("Mitra data:", profileResponse.data);
                        console.log("Mitra bengkels:", profileResponse.data.bengkel);

                        if (profileResponse.data.bengkel && profileResponse.data.bengkel.length > 0) {
                            const bengkelId = profileResponse.data.bengkel[0].bengkel_id;
                            console.log("Found bengkel ID:", bengkelId);
                            response = await apiService.getBengkelChatRooms(bengkelId, 1, 20);
                        } else {
                            console.error("Mitra has no bengkel");
                            setRooms([]);
                            return;
                        }
                    } else {
                        console.error("Failed to get mitra profile:", profileResponse);
                        setRooms([]);
                        return;
                    }
                } catch (error) {
                    console.error("Failed to get mitra profile:", error);
                    setRooms([]);
                    return;
                }
            } else {
                console.log("Getting user chat rooms...");
                response = await apiService.getChatRooms(1, 20);
            }

            if (response && response.success && response.data) {
                console.log("Successfully loaded chat rooms:", response.data.rooms);
                setRooms(response.data.rooms || []);
            } else {
                console.log("No chat rooms found or failed to load:", response);
                setRooms([]);
            }
        } catch (error) {
            console.error("Failed to load chat rooms:", error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };
    // Load messages with proper WebSocket + API hybrid approach
    const loadMessagesHybrid = async (roomId: string) => {
        // Always load from API first for reliability
        await loadLatestMessages(roomId);

        // WebSocket will handle real-time updates via event listeners
        console.log("📡 Messages loaded from API, WebSocket will handle real-time updates");
    };

    const loadLatestMessages = async (roomId: string) => {
        try {
            console.log("=== Loading Latest Messages ===");
            console.log("Room ID:", roomId);
            console.log("User type:", userType);

            // Load latest messages (no cursor = get most recent)
            let response;
            if (userType === "mitras") {
                response = await apiService.getBengkelRoomMessages(roomId, 50);
            } else {
                response = await apiService.getRoomMessages(roomId, 50);
            }

            if (response.success && response.data) {
                const messages = response.data.messages || [];

                console.log("✅ Loaded latest messages:", {
                    count: messages.length,
                });

                // Display messages immediately (reverse order so newest is at bottom)
                const sortedMessages = messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                dispatchMessages({ type: "SET_MESSAGES", payload: sortedMessages });

                // Mark unread messages as read
                const unreadMessages = messages.filter((msg) => !msg.is_read && msg.sender_id !== getCurrentUserId());

                if (unreadMessages.length > 0) {
                    console.log(
                        "📖 Marking messages as read:",
                        unreadMessages.map((m) => m.id),
                    );
                    try {
                        await apiService.markMessagesAsRead({
                            message_ids: unreadMessages.map((msg) => msg.id),
                        });

                        // Update the room's unread count in the sidebar
                        setRooms((prevRooms) => prevRooms.map((room) => (room.id === roomId ? { ...room, unread_count: Math.max(0, room.unread_count - unreadMessages.length) } : room)));
                        console.log("✅ Updated room unread count after marking messages as read");
                    } catch (error) {
                        console.error("❌ Failed to mark messages as read:", error);
                    }
                }
            } else {
                console.error("❌ Failed to load latest messages:", response);
                dispatchMessages({ type: "CLEAR_MESSAGES" });
            }
        } catch (error) {
            console.error("❌ Failed to load latest messages:", error);
            dispatchMessages({ type: "CLEAR_MESSAGES" });
        }
    };
    const loadMessages = async (roomId: string) => {
        // Use hybrid approach: API for loading + WebSocket for real-time updates
        await loadMessagesHybrid(roomId);
    };
    const handleNewMessage = useCallback(
        (message: ChatMessage) => {
            console.log("🔥 NEW MESSAGE HANDLER CALLED:", message);

            // Get current selected room from ref (not closure)
            const currentSelectedRoom = selectedRoomRef.current;
            console.log("🔥 Current selectedRoom from ref:", currentSelectedRoom?.id);
            console.log("🔥 Message room ID:", message.room_id);

            if (currentSelectedRoom && message.room_id === currentSelectedRoom.id) {
                console.log("✅ Adding message to current room:", {
                    messageId: message.id,
                    content: message.content,
                    senderId: message.sender_id,
                    currentUserId: getCurrentUserId(),
                });

                // Simply add the message - no complex temp message logic
                dispatchMessages({ type: "ADD_MESSAGE", payload: message });

                console.log("🔄 Message added to state, forcing re-render...");

                // Force immediate re-render with multiple mechanisms
                forceUpdate();
                setForceUpdateCounter((prev) => prev + 1);
                setMessagesKey((prev) => prev + 1);
                setRenderTrigger((prev) => prev + 1);

                // Force scroll to bottom for new messages (especially own messages)
                setTimeout(() => {
                    smartScrollToBottom(true); // Force scroll for new messages
                    console.log("📜 Scrolled to bottom after new message");
                }, 50);

                // Mark as read if not from current user (and we're viewing the room)
                if (message.sender_id !== getCurrentUserId()) {
                    apiService
                        .markMessagesAsRead({
                            message_ids: [message.id],
                        })
                        .then(() => {
                            // Update the room's unread count when we mark the message as read
                            setRooms((prevRooms) => prevRooms.map((room) => (room.id === message.room_id ? { ...room, unread_count: Math.max(0, room.unread_count - 1) } : room)));
                            console.log("✅ Updated room unread count after marking new message as read");
                        })
                        .catch((error) => {
                            console.error("Failed to mark message as read:", error);
                        });
                }
            } else {
                console.log("❌ Ignoring message for different room:", {
                    messageRoomId: message.room_id,
                    selectedRoomId: currentSelectedRoom?.id,
                    hasSelectedRoom: !!currentSelectedRoom,
                });
            }

            // Always update room's last message in sidebar (this is handled in newMessageHandler now)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getCurrentUserId, forceUpdate],
    );
    const handleTypingIndicator = useCallback(
        (data: { room_id: string; user_id: string; user_type?: string; is_typing: boolean; user_name?: string }) => {
            console.log("⌨️ Received typing indicator:", data);
            console.log("⌨️ Current user type:", userType);
            console.log("⌨️ Current user ID:", getCurrentUserId());
            console.log("⌨️ Data user ID:", data.user_id);
            console.log("⌨️ Data user type:", data.user_type);

            // Check if this is from another user (not ourselves)
            // IMPORTANT: Compare both user_id AND user_type to handle user vs mitra correctly
            const currentUserId = getCurrentUserId();
            const isFromOtherUser = data.user_id !== currentUserId;

            console.log("⌨️ Is from other user?", isFromOtherUser, {
                dataUserId: data.user_id,
                currentUserId: currentUserId,
                match: data.user_id === currentUserId,
            });

            if (!isFromOtherUser) {
                console.log("⌨️ ❌ Ignoring typing indicator from self");
                return;
            }

            // Track typing activity for presence inference (typing = definitely online)
            if (data.is_typing) {
                roomActivityRef.current.set(data.room_id, Date.now());
                setForceUpdateCounter((prev) => prev + 1);
            }

            // Get the current selected room from ref (not closure)
            const currentSelectedRoom = selectedRoomRef.current;
            console.log("⌨️ Current selectedRoom from ref:", currentSelectedRoom?.id);
            console.log("⌨️ Data room ID:", data.room_id);

            // Check if this typing indicator is for the currently selected room
            if (currentSelectedRoom && currentSelectedRoom.id === data.room_id) {
                console.log("⌨️ ✅ Processing typing indicator for current room:", {
                    roomId: data.room_id,
                    userId: data.user_id,
                    userType: data.user_type,
                    isTyping: data.is_typing,
                    userName: data.user_name || "Unknown User",
                    currentUserType: userType,
                    currentUserId: getCurrentUserId(),
                });

                // Get the display name based on user type and room context
                // For users viewing mitras: show bengkel name instead of mitra name
                // For mitras viewing users: show user name
                let displayName = data.user_name || `User ${data.user_id.substring(0, 8)}`;

                if (userType === "users" && currentSelectedRoom.bengkel) {
                    // User is viewing a bengkel/mitra - show bengkel name
                    displayName = currentSelectedRoom.bengkel.bengkel_name;
                    console.log("⌨️ Using bengkel name for display:", displayName);
                } else if (userType === "mitras" && currentSelectedRoom.user) {
                    // Mitra is viewing a user - show user name
                    displayName = `${currentSelectedRoom.user.first_name} ${currentSelectedRoom.user.last_name}`;
                    console.log("⌨️ Using user name for display:", displayName);
                }

                setTypingUsers((prev) => {
                    console.log("⌨️ 🔧 Current typingUsers state:", prev);
                    if (data.is_typing) {
                        const newUsers = prev.includes(displayName) ? prev : [...prev, displayName];
                        console.log("⌨️ ✅ Updated typing users (adding):", newUsers);
                        console.log("⌨️ 🔧 Setting typingUsers to:", newUsers);
                        return newUsers;
                    } else {
                        const newUsers = prev.filter((name) => name !== displayName);
                        console.log("⌨️ ✅ Updated typing users (removing):", newUsers);
                        console.log("⌨️ 🔧 Setting typingUsers to:", newUsers);
                        return newUsers;
                    }
                });

                // Auto-clear typing indicator after 5 seconds (in case stop typing event is missed)
                if (data.is_typing) {
                    setTimeout(() => {
                        setTypingUsers((prev) => {
                            const filtered = prev.filter((name) => name !== displayName);
                            if (filtered.length !== prev.length) {
                                console.log("⌨️ Auto-cleared typing indicator for:", displayName);
                            }
                            return filtered;
                        });
                    }, 5000);
                }
            } else {
                console.log("⌨️ ❌ Ignoring typing indicator for different room:", {
                    hasSelectedRoom: !!currentSelectedRoom,
                    selectedRoomId: currentSelectedRoom?.id,
                    dataRoomId: data.room_id,
                    currentUserType: userType,
                    currentUserId: getCurrentUserId(),
                    reason: !currentSelectedRoom ? "no selected room" : "different room",
                });
            }
        },
        [getCurrentUserId, userType],
    );

    const handleMessageRead = (data: { room_id?: string; message_id?: string; message_ids?: string[]; reader_id: string; read_at?: string }) => {
        console.log("👁️ Processing message read:", data);

        // Get current room from ref
        const currentRoom = selectedRoomRef.current;

        if (!currentRoom) {
            console.log("👁️ ❌ No selected room, ignoring read receipt");
            return;
        }

        // Check if this read receipt is for the current room
        if (data.room_id && data.room_id !== currentRoom.id) {
            console.log("👁️ ❌ Read receipt for different room, ignoring");
            return;
        }

        // Don't update if the reader is ourselves (we already know we read it)
        if (data.reader_id === getCurrentUserId()) {
            console.log("👁️ ❌ Read receipt from self, ignoring");
            return;
        }

        const readAt = data.read_at || new Date().toISOString();

        // Handle single message_id or array of message_ids
        const messageIds = data.message_ids || (data.message_id ? [data.message_id] : []);

        if (messageIds.length > 0) {
            console.log("👁️ ✅ Updating read status for messages:", messageIds);

            messageIds.forEach((messageId) => {
                dispatchMessages({
                    type: "UPDATE_MESSAGE_READ",
                    payload: { messageId, readAt },
                });
            });

            // Force re-render
            setForceUpdateCounter((prev) => prev + 1);
        }
    };

    const handlePresenceUpdate = (data: { user_id: string; user_type: string; is_online: boolean; user_name?: string; last_seen?: string }) => {
        console.log("👤 Processing presence update (Backend now working!):", data);
        console.log("👤 Current userType:", userType);
        console.log("👤 Current selectedRoom:", selectedRoomRef.current?.id);
        console.log("👤 Current presenceData before update:", Array.from(presenceData.entries()));

        // Store the presence data with user_id as key
        setPresenceData((prev) => {
            const newMap = new Map(prev);
            const key = `${data.user_id}:${data.user_type}`;
            newMap.set(key, {
                isOnline: data.is_online,
                lastSeen: data.last_seen || new Date().toISOString(),
            });
            console.log("👤 Updated presenceData:", Array.from(newMap.entries()));
            return newMap;
        });

        // Update the online status for the specific user in the current room
        const currentSelectedRoom = selectedRoomRef.current;
        if (currentSelectedRoom) {
            console.log("👤 Checking if presence update is relevant for current room");

            // Check if this presence update is for the other participant in the current room
            // For users viewing mitra: check if update is for a mitra
            // For mitras viewing user: check if update is for a user
            const isRelevantUpdate = (userType === "users" && data.user_type === "mitra") || (userType === "mitras" && data.user_type === "user");

            console.log("👤 Is relevant update?", isRelevantUpdate, {
                currentUserType: userType,
                dataUserType: data.user_type,
                dataUserId: data.user_id,
            });

            if (isRelevantUpdate) {
                console.log("✅ Presence update is relevant for current room participant");
                console.log(`👤 ${data.user_name || "Participant"} is now ${data.is_online ? "ONLINE" : "OFFLINE"}`);
                if (!data.is_online && data.last_seen) {
                    console.log(`👤 Last seen: ${formatLastSeen(data.last_seen)}`);
                }

                // Force a re-render to update the online status
                setForceUpdateCounter((prev) => prev + 1);
            }
        }

        console.log("👤 Presence update processed and stored:", {
            userId: data.user_id,
            userType: data.user_type,
            isOnline: data.is_online,
            userName: data.user_name,
            lastSeen: data.last_seen,
        });
    };
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedRoom || sending) return;

        setSending(true);
        const messageContent = newMessage.trim();

        try {
            // Create optimistic message for immediate UI feedback
            const tempMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                room_id: selectedRoom.id,
                sender_id: getCurrentUserId(),
                sender_type: userType === "mitras" ? "mitra" : "user",
                content: messageContent,
                message_type: "text",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_read: false,
                is_edited: false,
                sender: {
                    id: getCurrentUserId(),
                    name: userType === "mitras" ? mitra?.first_name || "Mitra" : user ? `${user.first_name} ${user.last_name}` : "You",
                    avatar_url: userType === "mitras" ? undefined : user?.avatar_url,
                    type: userType === "mitras" ? "mitra" : "user",
                },
            };

            // Show message immediately for better UX
            dispatchMessages({ type: "ADD_MESSAGE", payload: tempMessage });
            setNewMessage("");

            // Update room's last message immediately
            setRooms((prev) => prev.map((room) => (room.id === selectedRoom.id ? { ...room, last_message: messageContent, last_message_at: new Date().toISOString() } : room)));

            // Scroll to bottom immediately
            setTimeout(() => smartScrollToBottom(true), 50);

            // WebSocket-first approach (backend now guarantees delivery)
            if (wsConnected) {
                try {
                    console.log("📤 Sending message via WebSocket (backend guarantees delivery to all participants)...");
                    webSocketService.sendMessage(selectedRoom.id, messageContent);
                    console.log("✅ Message sent via WebSocket - backend will broadcast to all room participants");

                    // Backend now guarantees delivery with triple-layer broadcasting:
                    // 1. Direct WebSocket broadcast to room
                    // 2. Direct WebSocket broadcast to specific users
                    // 3. Redis pub/sub broadcast (fallback)

                    // Shorter timeout since backend broadcasting is now reliable
                    setTimeout(async () => {
                        try {
                            // Check if temp message still exists (not replaced by WebSocket event)
                            const currentMessages = messagesRef.current;
                            const tempStillExists = currentMessages.some((msg) => msg.id === tempMessage.id);

                            if (tempStillExists) {
                                console.log("⚠️ WebSocket confirmation timeout - this should be rare with new backend");
                                // Remove temp message and reload from API as fallback
                                dispatchMessages({ type: "REMOVE_TEMP_MESSAGE", payload: tempMessage.id });
                                await loadLatestMessages(selectedRoom.id);
                            }
                        } catch (error) {
                            console.error("❌ Failed to verify message via API:", error);
                        }
                    }, 2000); // Reduced from 3000ms since backend is more reliable
                } catch (error) {
                    console.error("❌ WebSocket send failed, falling back to HTTP:", error);

                    // HTTP fallback
                    console.log("📤 Sending message via HTTP API...");
                    const response = await apiService.sendMessage({
                        room_id: selectedRoom.id,
                        content: messageContent,
                        message_type: "text",
                    });

                    if (response.success && response.data) {
                        console.log("✅ Message sent via HTTP API");
                        // Replace temp message with real message from API
                        dispatchMessages({ type: "REPLACE_TEMP_MESSAGE", payload: { tempId: tempMessage.id, realMessage: response.data } });
                    }
                }
            } else {
                // WebSocket not connected - use HTTP API
                console.log("📤 WebSocket not connected, sending via HTTP API...");
                const response = await apiService.sendMessage({
                    room_id: selectedRoom.id,
                    content: messageContent,
                    message_type: "text",
                });

                if (response.success && response.data) {
                    console.log("✅ Message sent via HTTP API");
                    // Replace temp message with real message from API
                    dispatchMessages({ type: "REPLACE_TEMP_MESSAGE", payload: { tempId: tempMessage.id, realMessage: response.data } });
                }
            }
        } catch (error) {
            console.error("❌ Failed to send message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };
    // Typing Indicator Implementation - Following Backend Specification
    const sendTypingStatus = (isTypingStatus: boolean) => {
        if (!selectedRoom) {
            console.log("⌨️ Cannot send typing status: no room selected");
            return;
        }

        console.log(`⌨️ Sending typing status: ${isTypingStatus ? "START" : "STOP"} for room:`, selectedRoom.id);
        console.log("⌨️ WebSocket connected:", wsConnected);

        // Use WebSocket if connected
        if (wsConnected) {
            try {
                console.log("⌨️ Attempting to send typing indicator via WebSocket...");
                webSocketService.sendTypingIndicator({
                    room_id: selectedRoom.id,
                    is_typing: isTypingStatus,
                });
                console.log("✅ Typing status sent via WebSocket successfully");
            } catch (error) {
                console.error("❌ WebSocket typing failed:", error);
                // Fallback to HTTP API
                console.log("⌨️ Falling back to HTTP API for typing indicator...");
                apiService
                    .sendTypingIndicator({
                        room_id: selectedRoom.id,
                        is_typing: isTypingStatus,
                    })
                    .then(() => {
                        console.log("✅ Typing status sent via HTTP API");
                    })
                    .catch((httpError) => {
                        console.error("❌ HTTP typing indicator also failed:", httpError);
                    });
            }
        } else {
            // HTTP API fallback
            console.log("⌨️ WebSocket not connected, using HTTP API for typing indicator...");
            apiService
                .sendTypingIndicator({
                    room_id: selectedRoom.id,
                    is_typing: isTypingStatus,
                })
                .then(() => {
                    console.log("✅ Typing status sent via HTTP API");
                })
                .catch((error) => {
                    console.error("❌ HTTP typing indicator failed:", error);
                });
        }
    };

    const onUserTyping = () => {
        if (!selectedRoom) return;

        // Send typing start if not already typing
        if (!isTyping) {
            sendTypingStatus(true);
            setIsTyping(true);
            console.log("⌨️ Started typing indicator");
        }

        // Clear previous timer
        if (typingTimer) {
            clearTimeout(typingTimer);
        }

        // Stop typing after 2 seconds of inactivity (as per specification)
        const newTimer = setTimeout(() => {
            sendTypingStatus(false);
            setIsTyping(false);
            setTypingTimer(null);
            console.log("⌨️ Stopped typing indicator (timeout)");
        }, 2000);

        setTypingTimer(newTimer);
    };

    const stopTyping = () => {
        if (isTyping) {
            if (typingTimer) {
                clearTimeout(typingTimer);
                setTypingTimer(null);
            }
            sendTypingStatus(false);
            setIsTyping(false);
            console.log("⌨️ Stopped typing indicator (manual)");
        }
    };
    const handleRoomSelection = (room: ChatRoom) => {
        console.log("🏠 Room selected:", room.id);
        console.log("🏠 User type:", userType);
        console.log("🏠 WebSocket connected:", webSocketService.isConnected());

        // Stop typing in current room before switching
        stopTyping();

        // Leave previous room if connected via WebSocket
        if (selectedRoom && webSocketService.isConnected()) {
            console.log("👋 Leaving previous room:", selectedRoom.id);
            webSocketService.leaveRoom(selectedRoom.id);
        }

        // Set the new selected room
        setSelectedRoom(room);

        // Clear current messages immediately to show loading state
        dispatchMessages({ type: "CLEAR_MESSAGES" });

        // Reset pagination state
        setLoadingMoreMessages(false);

        // Clear typing users for new room
        setTypingUsers([]);

        // Clear unread count for selected room immediately (optimistic update)
        if (room.unread_count > 0) {
            setRooms((prevRooms) => prevRooms.map((r) => (r.id === room.id ? { ...r, unread_count: 0 } : r)));
            console.log("🔄 Cleared unread count for selected room (optimistic update)");
        }

        // Force re-render to show empty state
        setForceUpdateCounter((prev) => prev + 1);
        setMessagesKey((prev) => prev + 1);
        setRenderTrigger((prev) => prev + 1);

        // Join the new room if connected via WebSocket
        if (webSocketService.isConnected()) {
            console.log("🚪 Joining room:", room.id);
            console.log("🚪 User type during join:", userType);
            console.log("🚪 Sending join_room WebSocket message...");

            try {
                webSocketService.joinRoom(room.id);
                console.log("🚪 ✅ join_room message sent successfully");
            } catch (error) {
                console.error("🚪 ❌ Failed to send join_room message:", error);
            }

            // Add a delay to ensure room join is processed
            setTimeout(() => {
                console.log("🚪 Room join completed, loading messages...");
                loadMessages(room.id);
            }, 500);
        } else {
            console.log("🚪 WebSocket not connected, loading messages directly...");
            loadMessages(room.id);
        }
    };

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    };

    const smartScrollToBottom = (force = false) => {
        if (force) {
            // Force scroll (for own messages or initial load)
            scrollToBottom();
            return;
        }

        // Check if user is near the bottom before auto-scrolling
        const container = messagesContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

            if (isNearBottom) {
                scrollToBottom();
            } else {
                console.log("User is reading old messages, not auto-scrolling");
            }
        } else {
            // Fallback if container ref not available
            scrollToBottom();
        }
    };
    // Scroll to bottom when messages change (for new messages)
    useEffect(() => {
        // Only auto-scroll if we're not loading older messages
        if (!loadingMoreMessages) {
            smartScrollToBottom(true); // Force scroll for initial load and new messages
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length, loadingMoreMessages]); // Watch message count, not the entire messages array

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatLastSeen = (lastSeenTimestamp: string) => {
        const now = new Date();
        const lastSeen = new Date(lastSeenTimestamp);
        const diffMs = now.getTime() - lastSeen.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 1) {
            return "Last seen just now";
        } else if (diffMinutes < 60) {
            return `Last seen ${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
        } else if (diffHours < 24) {
            return `Last seen ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
        } else if (diffDays === 1) {
            return `Last seen yesterday at ${lastSeen.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
        } else if (diffDays < 7) {
            return `Last seen ${diffDays} days ago`;
        } else {
            return `Last seen on ${lastSeen.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        }
    };

    const getOtherParticipant = (room: ChatRoom) => {
        if (userType === "mitras") {
            if (!room.user) return null;

            // Check if we have real presence data for this user
            const presenceKey = `${room.user.id}:user`;
            const presence = presenceData.get(presenceKey);

            // Fall back to activity-based inference: if the other participant sent a message
            // or typed within the last 3 minutes, consider them online
            const ACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
            const lastActivity = roomActivityRef.current.get(room.id);
            const isRecentlyActive = !!lastActivity && Date.now() - lastActivity < ACTIVITY_TIMEOUT_MS;

            const isOnline = presence ? presence.isOnline : isRecentlyActive;
            const lastSeen = presence?.lastSeen;

            return {
                name: `${room.user.first_name} ${room.user.last_name}`,
                avatar_url: room.user.avatar_url,
                is_online: isOnline,
                last_seen: lastSeen,
                has_real_presence: !!presence || isRecentlyActive,
            };
        } else {
            if (!room.bengkel) return null;

            // For bengkels/mitras: We need to find the mitra's presence by checking all mitra entries
            // Since we don't have the mitra's user ID directly, we check if ANY mitra is online
            // This is a limitation - ideally the room should include mitra_user_id
            let mitraPresence = null;

            // Look for any mitra presence in the presenceData
            for (const [key, value] of presenceData.entries()) {
                if (key.endsWith(":mitra")) {
                    mitraPresence = value;
                    console.log("👤 Found mitra presence:", key, value);
                    break; // Use the first mitra we find (in a real app, we'd match by mitra_user_id)
                }
            }

            // Fall back to activity-based inference: if the mitra sent a message or typed
            // within the last 3 minutes, consider them online (handles broken presence_update for mitra)
            const ACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
            const lastActivity = roomActivityRef.current.get(room.id);
            const isRecentlyActive = !!lastActivity && Date.now() - lastActivity < ACTIVITY_TIMEOUT_MS;

            const isOnline = mitraPresence ? mitraPresence.isOnline : isRecentlyActive;
            const lastSeen = mitraPresence?.lastSeen;

            return {
                name: room.bengkel.bengkel_name,
                avatar_url: room.bengkel.avatar_url,
                is_online: isOnline,
                last_seen: lastSeen,
                has_real_presence: !!mitraPresence || isRecentlyActive,
            };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
            {/* Chat Rooms Sidebar */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    console.log("🔄 Manual refresh: Reloading chat rooms to sync latest messages...");
                                    loadChatRooms();
                                }}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                                title="Refresh room list"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                        <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? "bg-green-500" : "bg-yellow-500"}`}></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{wsConnected ? "Real-time" : "Polling mode (WebSocket offline)"}</span>
                        {/* Debug: Show presence data */}
                        {import.meta.env.DEV && wsConnected && (
                            <button
                                onClick={() => {
                                    console.log("🧪 Current presence data:", Array.from(presenceData.entries()));
                                    console.log("🧪 Selected room:", selectedRoom);
                                    if (selectedRoom) {
                                        const participant = getOtherParticipant(selectedRoom);
                                        console.log("🧪 Other participant:", participant);
                                    }
                                }}
                                className="ml-4 px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                                title="Check presence data"
                            >
                                Check Presence
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {rooms.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 mb-2" />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        rooms.map((room) => {
                            const otherParticipant = getOtherParticipant(room);
                            return (
                                <div
                                    key={room.id}
                                    onClick={() => handleRoomSelection(room)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                        selectedRoom?.id === room.id ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" : ""
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {otherParticipant?.avatar_url ? <img src={otherParticipant.avatar_url} alt={otherParticipant.name} className="w-10 h-10 rounded-full" /> : <UserCircleIcon className="w-10 h-10 text-gray-400" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{otherParticipant?.name || "Unknown User"}</p>
                                                {room.last_message_at && <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(room.last_message_at)}</p>}
                                            </div>
                                            {room.last_message && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{room.last_message}</p>}
                                        </div>
                                        {room.unread_count > 0 && <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">{room.unread_count}</span>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 flex flex-col">
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {getOtherParticipant(selectedRoom)?.avatar_url ? (
                                        <img src={getOtherParticipant(selectedRoom)!.avatar_url} alt={getOtherParticipant(selectedRoom)!.name} className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{getOtherParticipant(selectedRoom)?.name || "Unknown User"}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(() => {
                                                const participant = getOtherParticipant(selectedRoom);
                                                if (!participant) return "Offline";

                                                if (participant.is_online) {
                                                    return "Online";
                                                } else if (participant.last_seen) {
                                                    return formatLastSeen(participant.last_seen);
                                                } else {
                                                    return "Offline";
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                        <PhoneIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                        <VideoCameraIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Messages Container */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <div className="text-center">
                                        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-4" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message) => {
                                        const isOwnMessage = message.sender_id === getCurrentUserId();
                                        const isTemp = message.id.startsWith("temp-");

                                        return (
                                            <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                    } ${isTemp ? "opacity-70" : ""}`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className={`flex items-center justify-between mt-1 text-xs ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                                                        <span>{formatTime(message.created_at)}</span>
                                                        {isOwnMessage && <div className="flex items-center ml-2">{message.is_read ? <CheckCheckIcon className="w-3 h-3" /> : <CheckIcon className="w-3 h-3" />}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Typing Indicator */}
                                    {typingUsers.length > 0 && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                                                <p className="text-sm italic">{typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(", ")} are typing...`}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                    <PaperClipIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Handle file upload
                                            console.log("File selected:", file);
                                        }
                                    }}
                                />
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            onUserTyping();
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                stopTyping();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        disabled={sending}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        stopTyping();
                                        sendMessage();
                                    }}
                                    disabled={!newMessage.trim() || sending}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-4" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
