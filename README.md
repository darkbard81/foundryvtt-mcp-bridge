# Slamon's MCP Bridge

Foundry VTT에 MCP(Message Control Protocol) 연동을 위한 WebSocket 브리지 모듈입니다. 월드/서버 설정을 통해 릴레이 서버와 인증 값을 지정하고, 기본 GM이 소켓을 열어 다른 도메인과 메시지를 주고받을 수 있게 돕습니다.

## 주요 기능
- 설정으로 WebSocket 릴레이 URL과 API Key를 등록
- 커스텀 대화창(`Server Info`)에서 현재 설정값을 읽기 전용으로 확인·클립보드 복사
- 주 GM(가장 낮은 ID의 전체 GM)만 연결을 열고, 연결 끊김 시 재연결/백오프 처리
- 모듈 API(`game.modules.get("slamon-mcp-bridge").api`)로 WebSocket 매니저와 UUID 조회 제공

## 요구 사항
- Foundry VTT v13 (module.json `compatibility` minimum/verified/maximum 13)
- 브라우저에서 접근 가능한 WebSocket 릴레이 서버

## 설치
1. `https://github.com/darkbard81/slamon-mcp-bridge`에서 모듈을 내려받아 Foundry의 `Data/modules` 경로에 배치하거나, 모듈 관리에서 zip을 설치합니다.
2. Foundry 재시작 후 **설정 → 모듈 설정**에서 `Slamon's MCP Bridge`를 활성화합니다.

## 설정 항목 (`game.settings`)
- **WebSocket Relay URL** (`wsRelayUrl`, world): 릴레이 서버 주소. 예: `ws://localhost:8080`.
- **API Key** (`apiKey`, world): 릴레이 인증 토큰. 설정 UI에서는 비밀번호 필드로 입력/저장.
- **Custom Client Name** (`customName`, world): 커스텀 클라이언트 이름을 쿼리 파라미터로 전송.
- **Log Level** (`logLevel`, world): 0=debug, 1=info, 2=warn(기본), 3=error.
- **Ping Interval (seconds)** (`pingInterval`, world): keep-alive ping 주기(초).
- **Max Reconnect Attempts** (`reconnectMaxAttempts`, world): 재연결 시도 횟수.
- **Reconnect Base Delay (ms)** (`reconnectBaseDelay`, world): 재연결 초기 지연(ms), 이후 지수 백오프.
- **Submenu**: `Settings Menu Label` 버튼을 눌러 `Server Info` 팝업을 열면 각 설정값을 읽기 전용으로 보고 클릭하여 복사할 수 있습니다.

## 동작 개요
- `init` 훅에서 모든 설정과 서브메뉴를 등록.
- `ready` 훅에서 1초 후 WebSocket 초기화 호출.
- `WebSocketManager`는 전체 GM(role 4)만 생성되며, 활성 GM 중 가장 낮은 ID를 가진 사용자가 “주 GM”으로 연결을 담당합니다. 주 GM 변경 시 자동 연결/해제.
- 라우터(`src/script/network/routers`)를 통해 수신 메시지 핸들러를 등록.
- 모듈 API:
  - `getWebSocketManager(): WebSocketManager | null`
  - `getByUuid(uuid: string): Promise<Document | null>`

## 개발/빌드
- 코드: TypeScript ESM (`src/script`), 스타일: SCSS(`src/styles`), 번역: `src/languages/en.json`.
- 의존성 설치: `npm install`
- 타입 체크: `npm run check`
- 번들: `npm run build` (tsc 후 vite build)
- 개발 감시 빌드: `npm run dev`

## 라이선스
MIT License
