import '../css/ChatRoom.scss';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useParams, useLocation } from 'react-router-dom';
import useAutosizeTextarea from '../component/useAutosizeTextarea';
import axios from 'axios';

/* 3-dot typing animation */
const TypingDots = () => (
    <div className="typing_dots">
        <span></span><span></span><span></span>
    </div>
);

/* 코드블록 및 일반 텍스트 파싱 */
const renderRichText = (text) => {
    if (!text) return null;
    const parts = text.split(/```/);

    return parts.map((part, idx) => {
        if (idx % 2 === 1) {
            // 코드블록
            const lines = part.split("\n");
            const first = lines[0]?.trim();
            const isLang = /^[a-zA-Z0-9_\-#+]+$/.test(first);
            const lang = isLang ? first : "";
            const codeText = isLang ? lines.slice(1).join("\n") : part;

            return (
                <pre className="code_block" key={idx}>
                    {lang && <div className="code_lang">{lang}</div>}
                    <code>{codeText}</code>
                </pre>
            );
        }
        return <div className="text_block" key={idx}>{part}</div>;
    });
};


const CHAT_API_URL = 'http://localhost:3001/api/chat';

const ChatRoom = () => {
    const { id: urlChatId } = useParams();
    const scrollRef = useRef(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const location = useLocation();
    const initialFiles = location.state?.initialFiles || [];

    const {
        activeChatId,
        setActiveChatId,
        chatRooms,
        setChatRooms
    } = useOutletContext();

    useAutosizeTextarea(textareaRef, message);

    const handleInputChange = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    // Shift+Enter 줄바꿈 / Enter 전송
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // 파일 업로드
    const handleFileUpload = (e) => {
        const newFiles = Array.from(e.target.files);
        const filtered = newFiles.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} 은(는) 5MB를 초과했습니다.`);
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...filtered]);
    };

    // 파일 삭제
    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // 응답 생성
    const sendMessage = async (userMessage, chatId) => {
        setLoading(true);

        const currentHistory = chatRooms[chatId]?.history || [];
        const updatedHistoryBeforeAI = [...currentHistory, { role: 'user', content: userMessage }];

        setChatRooms((prevRooms) => ({
            ...prevRooms,
            [chatId]: {
                ...prevRooms[chatId],
                history: updatedHistoryBeforeAI.concat({
                    role: 'ai', content: '응답 생성 중...', loading: true,
                }),
            },
        }));

        try {
            const response = await axios.post(CHAT_API_URL, {
                messages: updatedHistoryBeforeAI,
            });

            const aiResponse = response.data.response;

            setChatRooms((prevRooms) => {
                const finalHistory = updatedHistoryBeforeAI.concat({
                    role: 'ai',
                    content: aiResponse,
                });

                return {
                    ...prevRooms,
                    [chatId]: {
                        ...prevRooms[chatId],
                        history: finalHistory,
                    },
                };
            });
        } catch (error) {
            console.error('API 통신 오류:', error);
            setChatRooms((prevRooms) => {
                const historyWithError = updatedHistoryBeforeAI.concat({
                    role: 'ai',
                    content: '❌ 오류 발생: 응답 불가.',
                    error: true,
                });

                return {
                    ...prevRooms,
                    [chatId]: {
                        ...prevRooms[chatId],
                        history: historyWithError,
                    },
                };
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if ((!message.trim() && files.length === 0) || loading || !urlChatId) return;

        const userMessage = message.trim();
        setMessage('');
        setFiles([]);

        sendMessage(userMessage, urlChatId);
    };

    // 복사
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error("복사 실패:", err);
        }
    };

    const currentChats = urlChatId ? chatRooms[urlChatId]?.history : [];

    // 
    const renderChats = () => {
        if (!currentChats || currentChats.length === 0) {
            return <div className="empty_state">채팅방 기록이 없습니다.</div>;
        }

        return currentChats.map((chat, index) => (
            <div
                key={index}
                className={`chat_message chat_${chat.role} ${chat.loading ? 'loading' : ''}`}>
                <strong>{chat.role === 'user' ? '나' : 'AI'}</strong>
                <div className="bubble">
                    {/* 로딩 중이면 3-dot 표시 */}
                    {chat.loading ? (
                        <TypingDots />
                    ) : (
                        <>
                            {/* 코드블록 or general text */}
                            {renderRichText(chat.content)}
                            {/* AI일 때 복사 버튼 */}
                            {chat.role === "ai" && !chat.loading && (
                                <button className="copy_btn" onClick={() => handleCopy(chat.content)}>
                                    <span className="material-symbols-outlined">content_copy</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        ));
    };

    useEffect(() => {
        if (initialFiles.length > 0) setFiles(initialFiles);
    }, []);

    return (
        <section className="section_wrap">
            <div className="ChatRoom_body_wrap">
                {/* 대화 기록 */}
                <div className="chat_history_wrap" ref={scrollRef}>
                    {renderChats()}
                </div>
                {/* 입력창 */}
                <div className={`input_select_wrap ${isDragging ? "dragging" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const newFiles = Array.from(e.dataTransfer.files);
                        newFiles.forEach(file => {
                            if (file.size > 5 * 1024 * 1024) {
                                alert("5MB 이하 파일만 업로드할 수 있습니다.");
                                return;
                            }
                        });
                        setFiles(prev => [...prev, ...newFiles]);
                    }}>
                    {/* 파일 미리보기 */}
                    {files.length > 0 && (
                        <div className="file_preview_area">
                            {files.map((file, idx) => {
                                const isImage = file.type.startsWith("image/");
                                const previewURL = isImage ? URL.createObjectURL(file) : null;
                                const type = file.type;
                                let icon = "/images/icon_file.png";
                                if (type.includes("pdf")) icon = "/images/icon_pdf.png";
                                else if (type.includes("word") || type.includes("msword") || type.includes("doc"))
                                    icon = "/images/icon_doc.png";
                                else if (type.includes("excel") || type.includes("spreadsheet") || type.includes("xls"))
                                    icon = "/images/icon_excel.png";
                                else if (type.includes("hwp"))
                                    icon = "/images/icon_hwp.png";
                                return (
                                    <div className="file_item" key={idx}>
                                        {isImage ? (
                                            <img className="thumb" src={previewURL} alt={file.name} />
                                        ) : (
                                            <img className="file_icon" src={icon} alt="file icon" />
                                        )}
                                        <span>{file.name}</span>
                                        <button onClick={() => removeFile(idx)}>×</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="input_row">
                            {/* 파일 업로드 버튼 */}
                            <label className="add_btn">
                                <span className="material-symbols-outlined">attach_file</span>
                                <input type="file" multiple
                                    style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                            {/* 입력창 */}
                            <textarea name="message" ref={textareaRef} value={message}
                                onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="메시지를 입력하세요…" />
                            {/* 전송 */}
                            <button type="submit" className="send_btn"
                                disabled={loading || (!message.trim() && files.length === 0)}>
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ChatRoom;
