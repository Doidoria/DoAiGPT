// src/pages/ChatRoom.jsx
import '../css/ChatRoom.scss';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useParams, useLocation } from 'react-router-dom';
import useAutosizeTextarea from '../component/useAutosizeTextarea';
import axios from 'axios';

/* 3-dot typing animation */
const TypingDots = () => (
    <div className="typing_dots">
        <span></span>
        <span></span>
        <span></span>
    </div>
);

/* URL 추출 (첫 번째 링크만) */
const extractFirstUrl = (text) => {
    if (!text) return null;
    const match = text.match(/https?:\/\/[^\s)]+/);
    return match ? match[0] : null;
};

/* 코드블록 및 일반 텍스트 파싱 (복사 버튼 포함) */
const renderRichText = (text, onCopyCode) => {
    if (!text) return null;
    const parts = text.split(/```/);

    return parts.map((part, idx) => {
        // 홀수 index: 코드블록
        if (idx % 2 === 1) {
            const lines = part.split('\n');
            const first = lines[0]?.trim();
            const isLang = /^[a-zA-Z0-9_\-#+]+$/.test(first);
            const lang = isLang ? first : '';
            const codeText = isLang ? lines.slice(1).join('\n') : part;

            return (
                <pre className="code_block" key={idx}>
                    <div className="code_header">
                        <span className="code_lang_label">{lang || 'code'}</span>
                        <button
                            type="button"
                            className="code_copy_btn"
                            onClick={() => onCopyCode(codeText)}
                        >
                            <span className="material-symbols-outlined">content_copy</span>
                            <span>복사</span>
                        </button>
                    </div>
                    <code>{codeText}</code>
                </pre>
            );
        }

        // 짝수 index: 일반 텍스트
        return (
            <div className="text_block" key={idx}>
                {part}
            </div>
        );
    });
};

const CHAT_API_URL = 'http://localhost:3001/api/chat';

const ChatRoom = () => {
    const { id: urlChatId } = useParams();
    const location = useLocation();
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showScrollDown, setShowScrollDown] = useState(false);

    const initialFiles = location.state?.initialFiles || [];

    const {
        activeChatId,
        setActiveChatId,
        chatRooms,
        setChatRooms,
    } = useOutletContext();

    useAutosizeTextarea(textareaRef, message);

    // 현재 채팅방의 대화 목록
    const currentChats = urlChatId
        ? chatRooms[urlChatId]?.history || []
        : [];

    // 처음 들어왔을 때 activeChatId 세팅
    useEffect(() => {
        if (urlChatId && setActiveChatId) {
            setActiveChatId(urlChatId);
        }
    }, [urlChatId, setActiveChatId]);

    // 메인에서 넘어온 파일들 초기 세팅
    useEffect(() => {
        if (initialFiles.length > 0) {
            setFiles(initialFiles);
        }
    }, [initialFiles]);

    // 새 메시지 오면 자동 스크롤
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChats]);

    // 스크롤 상태 감지 (맨 아래 여부)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
            setShowScrollDown(!isBottom);
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    // 스크롤 맨 아래로
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    const handleInputChange = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    const handleKeyDown = (e) => {
        // Enter만 누르면 전송, Shift+Enter는 줄바꿈
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileUpload = (e) => {
        const selected = Array.from(e.target.files || []);
        const filtered = selected.filter((file) => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} 은(는) 5MB를 초과했습니다.`);
                return false;
            }
            return true;
        });
        setFiles((prev) => [...prev, ...filtered]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // OpenAI messages 포맷으로 변환
    const buildOpenAIMessages = (history) => {
        if (!history) return [];
        return history
            .filter((m) => m.content && !m.error)
            .map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            }));
    };

    // AI 답변 스트리밍 효과
    const streamAiResponse = (chatId, fullText) => {
        let index = 0;
        const step = 3;  // 한 번에 추가되는 글자 수
        const delay = 15; // 간격(ms)

        const intervalId = setInterval(() => {
            index += step;

            setChatRooms((prevRooms) => {
                const room = prevRooms[chatId];
                if (!room || !room.history || room.history.length === 0) {
                    clearInterval(intervalId);
                    return prevRooms;
                }

                const history = [...room.history];
                const lastIndex = history.length - 1;
                const lastMsg = { ...history[lastIndex] };

                if (lastMsg.role !== 'ai' && lastMsg.role !== 'assistant') {
                    clearInterval(intervalId);
                    return prevRooms;
                }

                lastMsg.content = fullText.slice(0, index);
                lastMsg.loading = false;
                history[lastIndex] = lastMsg;

                // 완료 시 인터벌 정리
                if (index >= fullText.length) {
                    clearInterval(intervalId);
                }

                return {
                    ...prevRooms,
                    [chatId]: {
                        ...room,
                        history,
                    },
                };
            });

            // 매 스텝마다 스크롤 아래로
            scrollToBottom();
        }, delay);
    };

    // 메시지 전송 + AI 응답
    const sendMessage = async (userMessage, chatId) => {
        setLoading(true);

        const currentHistory = chatRooms[chatId]?.history || [];
        const userHistory = [...currentHistory, { role: 'user', content: userMessage }];

        // 먼저 프론트에 user + 빈 ai 메시지 세팅
        setChatRooms((prevRooms) => ({
            ...prevRooms,
            [chatId]: {
                ...(prevRooms[chatId] || { title: '새 채팅' }),
                history: [
                    ...userHistory,
                    {
                        role: 'ai',
                        content: '',
                        loading: true,
                    },
                ],
            },
        }));

        try {
            const messagesForApi = buildOpenAIMessages(userHistory);

            const response = await axios.post(CHAT_API_URL, {
                messages: messagesForApi,
            });

            const aiResponse = response.data?.response || '';

            // 스트리밍 시작
            streamAiResponse(chatId, aiResponse);
        } catch (error) {
            console.error('API 통신 오류:', error);
            // 마지막 ai 메시지를 에러로 교체
            setChatRooms((prevRooms) => {
                const room = prevRooms[chatId];
                if (!room || !room.history || room.history.length === 0) {
                    return prevRooms;
                }
                const history = [...room.history];
                const lastIndex = history.length - 1;
                history[lastIndex] = {
                    role: 'ai',
                    content: '❌ 오류 발생: 응답을 가져오지 못했습니다.',
                    error: true,
                    loading: false,
                };
                return {
                    ...prevRooms,
                    [chatId]: {
                        ...room,
                        history,
                    },
                };
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!urlChatId) return;
        if (loading) return;
        if (!message.trim() && files.length === 0) return;

        let userMessage = message.trim();

        // 파일이 있을 경우, 메시지에 파일 이름들을 같이 포함
        if (files.length > 0) {
            const fileNames = files.map((f) => f.name).join(', ');
            const fileText = `\n\n[첨부 파일: ${fileNames}]`;
            userMessage = userMessage ? userMessage + fileText : fileText;
        }

        setMessage('');
        setFiles([]);

        sendMessage(userMessage, urlChatId);
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    // 대화 요약
    const handleSummarize = async () => {
        if (!urlChatId) return;
        const room = chatRooms[urlChatId];
        const history = room?.history || [];
        if (history.length === 0) return;
        if (loading) return;

        setLoading(true);

        const summaryPrompt =
            '지금까지의 이 대화를 5줄 이내의 한국어로 핵심만 요약해줘. 코드나 파일 내용은 간단히 언급만 해줘.';

        const messagesForApi = [
            ...buildOpenAIMessages(history),
            { role: 'user', content: summaryPrompt },
        ];

        // 요약 자리 미리 추가
        setChatRooms((prevRooms) => {
            const curRoom = prevRooms[urlChatId];
            if (!curRoom) return prevRooms;
            return {
                ...prevRooms,
                [urlChatId]: {
                    ...curRoom,
                    history: [
                        ...curRoom.history,
                        {
                            role: 'ai',
                            content: '📝 요약 생성 중...',
                            loading: true,
                        },
                    ],
                },
            };
        });

        try {
            const response = await axios.post(CHAT_API_URL, {
                messages: messagesForApi,
            });
            const aiSummary = response.data?.response || '';

            setChatRooms((prevRooms) => {
                const curRoom = prevRooms[urlChatId];
                if (!curRoom || !curRoom.history || curRoom.history.length === 0) {
                    return prevRooms;
                }
                const historyArr = [...curRoom.history];
                const lastIndex = historyArr.length - 1;
                historyArr[lastIndex] = {
                    role: 'ai',
                    content: `📝 요약\n\n${aiSummary}`,
                    loading: false,
                };
                return {
                    ...prevRooms,
                    [urlChatId]: {
                        ...curRoom,
                        history: historyArr,
                    },
                };
            });
        } catch (error) {
            console.error('요약 생성 오류:', error);
            setChatRooms((prevRooms) => {
                const curRoom = prevRooms[urlChatId];
                if (!curRoom || !curRoom.history || curRoom.history.length === 0) {
                    return prevRooms;
                }
                const historyArr = [...curRoom.history];
                const lastIndex = historyArr.length - 1;
                historyArr[lastIndex] = {
                    role: 'ai',
                    content: '❌ 요약 생성 중 오류가 발생했습니다.',
                    loading: false,
                    error: true,
                };
                return {
                    ...prevRooms,
                    [urlChatId]: {
                        ...curRoom,
                        history: historyArr,
                    },
                };
            });
        } finally {
            setLoading(false);
        }
    };

    const renderChats = () => {
        if (!currentChats || currentChats.length === 0) {
            return <div className="empty_state">채팅 기록이 없습니다.</div>;
        }

        return currentChats.map((chat, index) => {
            const link = !chat.loading ? extractFirstUrl(chat.content) : null;

            return (
                <div
                    key={index}
                    className={`chat_message chat_${chat.role} ${chat.loading ? 'loading' : ''}`}>
                    <strong>{chat.role === 'user' ? '나' : 'AI'}</strong>
                    <div className="bubble">
                        {chat.loading ? (
                            <TypingDots />
                        ) : (
                            <>
                                {renderRichText(chat.content, handleCopy)}
                                {link && (
                                    <a
                                        className="chat_link_btn"
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        바로가기
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <section className="section_wrap">
            <div className="ChatRoom_body_wrap">
                <div className="chat_summary_fixed">
                    {showScrollDown && (
                        <button className="scroll_down_btn" onClick={scrollToBottom}>
                            <span className="material-symbols-outlined">arrow_downward</span>
                        </button>
                    )}
                </div>
                <div className="chat_container">
                    {/* 상단 툴바 - 대화 요약 버튼 */}
                    <div className="chat_toolbar">
                        <button
                            type="button"
                            onClick={handleSummarize}
                            disabled={loading || !currentChats || currentChats.length === 0}>
                            📝 대화 요약
                        </button>
                    </div>
                    {/* 대화 기록 */}
                    <div className="chat_history_wrap" ref={scrollRef}>
                        {renderChats()}
                    </div>
                    {/* 입력/파일 영역 */}
                    <div
                        className={`input_select_wrap ${isDragging ? 'dragging' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const dropped = Array.from(e.dataTransfer.files || []);
                            const filtered = dropped.filter((file) => {
                                if (file.size > 5 * 1024 * 1024) {
                                    alert('5MB 이하 파일만 업로드할 수 있습니다.');
                                    return false;
                                }
                                return true;
                            });
                            setFiles((prev) => [...prev, ...filtered]);
                        }}
                    >
                        {/* 파일 미리보기 */}
                        {files.length > 0 && (
                            <div className="file_preview_area">
                                {files.map((file, idx) => {
                                    const isImage = file.type.startsWith('image/');
                                    const previewURL = isImage ? URL.createObjectURL(file) : null;
                                    const type = file.type;
                                    let icon = '/images/icon_file.png';
                                    if (type.includes('pdf')) icon = '/images/icon_pdf.png';
                                    else if (
                                        type.includes('word') ||
                                        type.includes('msword') ||
                                        type.includes('doc')
                                    )
                                        icon = '/images/icon_doc.png';
                                    else if (
                                        type.includes('excel') ||
                                        type.includes('spreadsheet') ||
                                        type.includes('xls')
                                    )
                                        icon = '/images/icon_excel.png';
                                    else if (type.includes('hwp')) icon = '/images/icon_hwp.png';

                                    return (
                                        <div className="file_item" key={idx}>
                                            {isImage ? (
                                                <img
                                                    className="thumb"
                                                    src={previewURL}
                                                    alt={file.name}
                                                    onClick={() => setPreviewImage(previewURL)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            ) : (
                                                <img className="file_icon" src={icon} alt="file icon" />
                                            )}
                                            <span className="file_name">{file.name}</span>
                                            <button
                                                type="button"
                                                className="file_remove_btn"
                                                onClick={() => removeFile(idx)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {/* 입력 폼 */}
                        <form onSubmit={handleSubmit}>
                            <div className="input_row">
                                {/* 파일 추가 버튼 */}
                                <label className="add_btn">
                                    <span className="material-symbols-outlined">attach_file</span>
                                    <input
                                        type="file"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                </label>

                                {/* 텍스트 입력 */}
                                <textarea
                                    name="message"
                                    ref={textareaRef}
                                    value={message}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="메시지를 입력하세요…"
                                />

                                {/* 전송 버튼 */}
                                <button
                                    type="submit"
                                    className="send_btn"
                                    disabled={loading || (!message.trim() && files.length === 0)}
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* 이미지 미리보기 모달 */}
            {previewImage && (
                <div className="image_modal_dim" onClick={() => setPreviewImage(null)}>
                    <div className="image_modal_wrap" onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="미리보기" />
                    </div>
                </div>
            )}
        </section>
    );
};

export default ChatRoom;
