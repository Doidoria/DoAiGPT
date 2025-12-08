import { useState, useEffect, useRef } from 'react';

const useSpeechToText = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 브라우저 지원 여부 확인
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // 설정: true면 말하는 도중에도 텍스트가 나옴, false면 말이 끝나야 나옴 (false가 오류가 적음)
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = false; 
      recognitionRef.current.lang = 'ko-KR';

      // 음성 인식 결과가 나왔을 때
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("음성 인식 결과:", transcript); // 콘솔에서 확인 가능
        setText(transcript);
      };

      // 음성 인식이 끝났을 때 (자동으로 꺼짐)
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // 에러 발생 시
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setText(''); // 기존 인식 텍스트 초기화
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("이미 시작되었거나 오류 발생:", error);
      }
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { text, setText, isListening, startListening, stopListening };
};

export default useSpeechToText;