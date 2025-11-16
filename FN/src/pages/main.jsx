import '../css/main.scss';
import { useState, useRef, useCallback } from 'react';
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

    useAutosizeTextarea(textareaRef, message);

    const handleInputChange = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    const sendMessage = async (userMessage, chatId) => {
        setLoading(true);

        const updatedHistoryBeforeAI = [{ role: 'user', content: userMessage }];

        setChatRooms(prevRooms => ({...prevRooms,
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
                return {...prevRooms, [chatId]: {...prevRooms[chatId], history: finalHistory,}};
            });
        } catch (error) {
            console.error('API 통신 오류:', error);
            setChatRooms(prevRooms => {
                const historyWithError = updatedHistoryBeforeAI.concat({ role: 'ai', content: '오류 발생: 응답 불가.', error: true });
                return {...prevRooms,[chatId]: {...prevRooms[chatId],history: historyWithError,}};
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        const chatId = Date.now().toString();

        setMessage('');
        sendMessage(userMessage, chatId);
        navigate(`/chat/${chatId}`);
    };

    return (
        <section className="section_wrap">
            <div className="main_body_wrap">
                <div className="input_select_wrap">
                    <form onSubmit={handleSubmit}>
                        {/* ... (입력창 UI) ... */}
                        <div className="inst_top_wrap">
                            <label htmlFor="myTextarea" className="inst_label">
                                <textarea name="message" id="myTextarea" ref={textareaRef}
                                    value={message} onChange={handleInputChange}
                                    placeholder="궁금하신 내용을 입력해주세요"
                                    style={{ resize: 'none' }} />
                                <input type="submit" style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div className="inst_bottom_wrap">
                            <div className="left_btn_wrap">
                                <div className="inst_btn">
                                    <button shape="circle" type="button" style={{ cursor: 'pointer' }}>
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="right_btn_wrap">
                                <div className="inst_btn">
                                    <button shape="circle" type="submit" style={{ cursor: 'pointer' }}
                                        disabled={!message.trim() || loading}>
                                        <span className="material-symbols-outlined">upload_2</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default Home;