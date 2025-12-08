// src/pages/Goodbye.jsx
import { Link } from 'react-router-dom';
import '../css/main.scss'; // 기존 스타일 재사용

const Goodbye = () => {
    // 인라인 스타일로 간단히 레이아웃 잡기 (기존 변수 활용)
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-main)', // 메인 배경색
        color: 'var(--text-primary)', // 메인 폰트색
        textAlign: 'center'
    };

    const buttonStyle = {
        marginTop: '30px',
        padding: '12px 24px',
        background: 'var(--submit-btn)', // 전송 버튼색 활용
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
    };

    return (
        <div style={containerStyle}>
            <span 
                className="material-symbols-outlined" 
                style={{ fontSize: '64px', marginBottom: '20px', color: 'var(--text-secondary)' }}
            >
                waving_hand
            </span>
            <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>이용해 주셔서 감사합니다</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                DoAi와의 대화가 즐거우셨기를 바랍니다.<br />
                언제든지 다시 돌아오세요!
            </p>

            <Link to="/" style={buttonStyle}>
                <span className="material-symbols-outlined">restart_alt</span>
                다시 시작하기
            </Link>
        </div>
    );
};

export default Goodbye;