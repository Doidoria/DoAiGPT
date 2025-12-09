# DoAi — ChatGPT
React + Node.js + OpenAI API 기반의 ChatGPT 웹 서비스입니다.<br>
파일 업로드, 음성 입력, 다크/라이트 테마, 채팅방 관리, 요약 기능 등을 갖춘 프로젝트입니다.

## 프로젝트 개요
| 항목           | 내용                                             |
| ------------ | ---------------------------------------------- |
| **프로젝트명**    | DoAi (ChatGPT Web UI Clone)                    |
| **개발 목적**    | 포트폴리오용 ChatGPT 스타일 웹 애플리케이션 제작                 |
| **Frontend** | React, SCSS, React Router, React Markdown      |
| **Backend**  | Node.js (Express), OpenAI SDK                  |
| **배포 환경**    | AWS EC2 + Nginx Reverse Proxy                  |
| **기능 요약**    | 챗봇 대화, 코드 하이라이트, 음성 입력, 파일 업로드, 테마 전환, 채팅 저장 등 |
| **접속 링크**    | http://www.hidoai.store                    |

## 주요 기능
<ul>
  <li>ChatGPT 스타일 실시간 대화</li>
  <li>SyntaxHighlighter 기반 코드블록 자동 감지 + 언어 하이라이트</li>
  <li>AI 답변 스트리밍 렌더링(typing 효과)</li>
  <li>React Markdown 변환(GFM 지원)</li>
</ul>

## 음성 입력 (Speech-to-Text)
| 기능             | 설명                         |
| -------------- | -------------------------- |
| Web Speech API | 음성 → 텍스트 자동 변환             |
| 마이크 UI         | 녹음 중 빨간 Pulse 애니메이션        |
| 자동 입력          | 인식된 텍스트를 자동으로 textarea에 반영 |

## 파일 업로드 & 미리보기
| 지원 파일                 | 처리 방식               |
| --------------------- | ------------------- |
| 이미지(JPG/PNG/WebP 등)   | 미리보기 제공             |
| PDF / DOC / XLS / HWP | 파일 타입 아이콘 표시        |
| ZIP/TXT 등 기타          | 다운로드 버튼 자동 생성       |
| 드래그 & 드롭              | drag 이벤트 처리 후 자동 등록 |


## 다크 / 라이트 테마
| 구현 방식         | 설명                  |
| ------------- | ------------------- |
| CSS Variables | 전역 색상 정의            |
| LocalStorage  | 테마 유지               |
| 커스텀 훅         | `useThemeMode` 로 제어 |

## 채팅방 관리
| 기능          | 설명                 |
| ----------- | ------------------ |
| 채팅 목록 저장    | LocalStorage 자동 저장 |
| 채팅 삭제       | 개별 삭제 기능 제공        |
| 채팅 제목 자동 생성 | 메시지 첫 줄 기반 자동 설정   |
| URL 기반 라우팅  | `/chat/:id`        |

## 대화 요약 기능
<ul>
  <li>현재 채팅 히스토리를 OpenAI API로 요약</li>
  <li>버튼 1번 클릭으로 5줄 핵심 요약 출력</li>
</ul>

## 프로젝트 구조
```
DoAi
├── FN
│   ├── README.md
│   ├── build
│   │   ├── asset-manifest.json
│   │   ├── favicon.ico
│   │   ├── images
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── static
│   │       ├── css
│   │       └── js
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── images
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── component
│       │   ├── useAutosizeTextarea.js
│       │   ├── useSpeechToText.js
│       │   └── useThemeMode.js
│       ├── css
│       │   ├── ChatRoom.scss
│       │   ├── Layout
│       │   ├── Layout.scss
│       │   ├── SettingModal.scss
│       │   └── main.scss
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── pages
│       │   ├── ChatRoom.jsx
│       │   ├── Goodbye.jsx
│       │   ├── Layout
│       │   ├── Layout.jsx
│       │   ├── SettingModal.jsx
│       │   └── main.jsx
│       ├── reportWebVitals.js
│       └── setupTests.js
└── Server
    ├── build
    │   ├── asset-manifest.json
    │   ├── favicon.ico
    │   ├── images
    │   ├── index.html
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   ├── robots.txt
    │   └── static
    │       ├── css
    │       └── js
    ├── nohup.out
    ├── package-lock.json
    ├── package.json
    └── server.js
```

## 기술 스택
| 구분           | 사용 기술                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| **Frontend** | React, React Router, SCSS, Axios, React Markdown, Prism Syntax Highlighter |
| **Backend**  | Node.js, Express, OpenAI API                                               |
| **Infra**    | AWS EC2, Nginx Reverse Proxy, FileZilla, PM2                               |
| **ETC**      | LocalStorage, Custom Hooks                                                 |

## 로컬 실행 방법
1) 프론트엔드 실행
```
cd server
npm install
npm start
```

2) 서버 실행
```
cd server
npm install
npm start
```
