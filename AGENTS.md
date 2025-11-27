# Codex 실행 가이드 (Foundry VTT)

- 이 문서는 Codex가 터미널 명령을 실행할 때 그대로 참고하는 체크리스트입니다.

## 기본 정보

- 사용 프로그래밍 언어: JavaScript ESM, TypeScript (Node.js 환경)
- 기본 응답 언어: 한국어
- 개발 목표: Foundry VTT Module개발

## 사용자 숙련도별 응답 가이드

- 초급 사용자: 용어를 풀어서 설명하고, 단계별 절차와 예시 코드 제공. 각 단계가 왜 필요한지 간단히 덧붙임.
- 중급 사용자: 핵심 개념과 구현 포인트 위주로 설명하고, 필요 시 참고할 수 있는 추가 자료나 관련 모듈 언급.
- 고급 사용자: 결론과 권장 접근법만 간결하게 제시하고, 선택 가능한 대안과 트레이드오프를 함께 제안.

## 로컬 명령 실행 요약 (중요)

- Flatpak VS Code 환경이라 기본 PATH에 node/npm이 없음.
- npm 스크립트 실행: `env PATH=/home/deck/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin npm run <script>`
- 개별 실행: `/home/deck/.nvm/versions/node/v20.19.5/bin/node ...`, `/home/deck/.nvm/versions/node/v20.19.5/bin/npm ...`
- 기존 PATH를 덮어쓰지 말고 항상 시스템 PATH를 뒤에 붙인다.

## 터미널 실행 환경 메모 (Flatpak VS Code)

- 기본 PATH에 node/npm이 없음. PATH를 덮어쓰지 말고 기존 PATH 뒤에 붙인다. 권장 예: `env PATH=/home/deck/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin <command>`.
- 예: `env PATH=/home/deck/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin npm run check`, `npm run check_codex` 등.
- 더 간단히는 node/npm 풀 경로 사용: `/home/deck/.nvm/versions/node/v20.19.5/bin/node -v`, `/home/deck/.nvm/versions/node/v20.19.5/bin/npm run check`.
- Flatpak override로 PATH를 덮어쓸 수 있으나 부담되면 위 방식으로만 실행한다.
