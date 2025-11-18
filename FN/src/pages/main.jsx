import '../css/main.scss';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useAutosizeTextarea from '../component/useAutosizeTextarea';
import axios from 'axios';

const CHAT_API_URL = 'http://localhost:3001/api/chat';

const Home = () => {
    const {
        activeChatId,
        setActiveChatId,
        chatRooms,
        setChatRooms
    } = useOutletContext();

    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    useAutosizeTextarea(textareaRef, message);

    const handleInputChange = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    const sendMessage = async (userMessage, chatId) => {
        setLoading(true);

        const updatedHistoryBeforeAI = [{ role: 'user', content: userMessage }];

        setChatRooms(prevRooms => ({
            ...prevRooms,
            [chatId]: {
                title: userMessage.substring(0, 30) + '...',
                history: updatedHistoryBeforeAI.concat({ role: 'ai', content: '응답 생성 중...', loading: true }),
            }
        }));

        setActiveChatId(chatId);

        try {
            const response = await axios.post(CHAT_API_URL, {
                messages: updatedHistoryBeforeAI,
            });
            const aiResponse = response.data.response;

            setChatRooms(prevRooms => {
                const finalHistory = updatedHistoryBeforeAI.concat({ role: 'ai', content: aiResponse });
                return { ...prevRooms, [chatId]: { ...prevRooms[chatId], history: finalHistory, } };
            });
        } catch (error) {
            console.error('API 통신 오류:', error);
            setChatRooms(prevRooms => {
                const historyWithError = updatedHistoryBeforeAI.concat({ role: 'ai', content: '오류 발생: 응답 불가.', error: true });
                return { ...prevRooms, [chatId]: { ...prevRooms[chatId], history: historyWithError, } };
            });
        } finally {
            setLoading(false);
        }
    };

    // ChatRoom 전달
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        const chatId = Date.now().toString();

        setMessage('');
        sendMessage(userMessage, chatId);
        navigate(`/chat/${chatId}`, {
            state: {
                initialFiles: files   // ChatRoom으로 파일 전달
            }
        });
    };

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

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <section className="section_wrap">
            <div className="main_body_wrap">
                <div className='logo' style={{ marginBottom: '5px' }}>
                    <h1>DoAi</h1>
                </div>
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
                                <input type="file" multiple style={{ display: "none" }} onChange={handleFileUpload} />
                            </label>

                            {/* 입력창 */}
                            <textarea
                                name="message"
                                ref={textareaRef}
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="적당히 물어봐주세요."
                                style={{ resize: "none" }}
                            />

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
        </section>
    )
}

export default Home;