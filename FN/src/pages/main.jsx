import '../css/main.scss';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useAutosizeTextarea from '../component/useAutosizeTextarea';
import useSpeechToText from '../component/useSpeechToText';
import axios from 'axios';

// 제목 자동 생성 함수 (ChatRoom과 동일 규칙)
const generateChatTitle = (text) => {
    const first = text.split('\n')[0].trim();
    if (!first) return '새 채팅';
    return first.length > 30 ? first.slice(0, 30) + '…' : first;
};

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const CHAT_API_URL = `${BASE_URL}/api/chat`;

const Home = () => {
    const {
        activeChatId,
        setActiveChatId,
        chatRooms,
        setChatRooms,
    } = useOutletContext();

    const navigate = useNavigate();
    const textareaRef = useRef(null);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const { text, setText, isListening, startListening, stopListening } = useSpeechToText();

    useAutosizeTextarea(textareaRef, message);

    const handleInputChange = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    // 파일 업로드 핸들러
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

    const handleKeyDown = (e) => {
        // Enter → 전송 / Shift+Enter → 줄바꿈
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // --- 새 채팅 생성 + 전송 ---
    const sendMessage = async (userMessage, chatId) => {
        setLoading(true);

        const newHistory = [{ role: 'user', content: userMessage }];

        // ▼ title 오타(ttitle) → title로 수정함
        setChatRooms((prev) => ({
            ...prev,
            [chatId]: {
                title: generateChatTitle(userMessage),
                history: [
                    ...newHistory,
                    {
                        role: 'ai',
                        content: '응답 생성 중...',
                        loading: true,
                    },
                ],
            },
        }));

        setActiveChatId(chatId);

        try {
            const response = await axios.post(CHAT_API_URL, {
                messages: newHistory,
            });

            const aiResponse = response.data?.response || '';

            setChatRooms((prev) => {
                const finalHistory = [
                    ...newHistory,
                    {
                        role: 'ai',
                        content: aiResponse,
                        loading: false,
                    },
                ];

                return {
                    ...prev,
                    [chatId]: {
                        ...prev[chatId],
                        history: finalHistory,
                    },
                };
            });
        } catch (err) {
            console.error('API 오류:', err);

            setChatRooms((prev) => ({
                ...prev,
                [chatId]: {
                    ...prev[chatId],
                    history: [
                        ...newHistory,
                        {
                            role: 'ai',
                            content: '❌ 오류 발생: 응답을 가져올 수 없습니다.',
                            error: true,
                            loading: false,
                        },
                    ],
                },
            }));
        } finally {
            setLoading(false);
        }
    };

    // --- 폼 submit ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;
        if (!message.trim()) return;

        const chatId = Date.now().toString();
        const userMessage = message.trim();

        setMessage('');

        // ChatRoom으로 파일 전달
        navigate(`/chat/${chatId}`, {
            state: {
                initialFiles: files,
            },
        });

        setFiles([]);

        sendMessage(userMessage, chatId);
    };

    // 음성 인식된 텍스트가 생기면 message 상태 업데이트
    useEffect(() => {
        if (text) {
            // 기존 메시지에 공백을 두고 이어 붙임
            setMessage((prev) => (prev ? prev + " " + text : text));

            // 중요: 한 번 반영된 텍스트는 훅 상태에서 지워줘야 중복 입력이 안 됨
            setText('');
        }
    }, [text, setText]);

    return (
        <section className="section_wrap">
            <div className="main_body_wrap">
                <div className="logo" style={{ marginBottom: '5px' }}>
                    <h1>DoAi</h1>
                </div>

                {/* 드래그 영역 */}
                <div
                    className={`input_select_wrap ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);

                        const dropped = Array.from(e.dataTransfer.files || []);
                        const filtered = dropped.filter((file) => {
                            if (file.size > 5 * 1024 * 1024) {
                                alert('5MB 이하의 파일만 업로드할 수 있습니다.');
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
                                            <img
                                                className="file_icon"
                                                src={icon}
                                                alt="file icon"
                                            />
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

                    {/* 입력창 */}
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
                                value={message}
                                ref={textareaRef}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="적당히 물어보세요."
                            />

                            {/* 마이크 버튼 */}
                            <button
                                type="button"
                                className={`mic_btn ${isListening ? 'active' : ''}`}
                                onClick={isListening ? stopListening : startListening}
                            >
                                <span className="material-symbols-outlined">
                                    {isListening ? 'mic_off' : 'mic'}
                                </span>
                            </button>

                            {/* 전송 버튼 */}
                            <button
                                type="submit"
                                className="send_btn"
                                disabled={!message.trim() || loading}
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 이미지 미리보기 모달 */}
            {previewImage && (
                <div
                    className="image_modal_dim"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="image_modal_wrap"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={previewImage} alt="미리보기" />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Home;
