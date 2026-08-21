# 🎨 Meme & Card Studio

> **웹 기반 고성능 밈 & 카드뉴스 그래픽 제작 및 실시간 캔버스 편집 스튜디오**

🌐 **Live Demo (GitHub Pages):** `https://altdmfk.github.io/meme_card_studio/`

---

## 📌 프로젝트 소개
**Meme & Card Studio**는 React(TypeScript), Vite, Tailwind CSS, 그리고 순수 HTML5 Canvas API를 기반으로 제작된 클라이언트 사이드 그래픽 스튜디오입니다.

사용자는 이미지와 텍스트를 실시간으로 합성하고, 다국어 폰트 및 다양한 비율(1:1, 4:5, 9:16 등)을 자유자재로 설정하며, 민감한 개인정보(EXIF / GPS 메타데이터)가 자동으로 제거된 고해상도 이미지를 내보낼 수 있습니다.

---

## ⚡ 빠른 시작 & GitHub Pages 배포 (Getting Started & Deployment)

### 1. 로컬 실행
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행 (http://localhost:5173/)
npm run dev
```

### 2. 프로덕션 빌드 & GitHub Pages 배포
```bash
# 프로덕션 빌드 (dist/ 폴더 생성)
npm run build
```

#### 🚀 GitHub Pages 배포 방법 (2가지 중 택 1)
- **방법 1: GitHub Actions 자동 배포 (권장)**
  - 저장소의 `Settings` > `Pages` > `Build and deployment` > `Source`를 **GitHub Actions**로 선택하고 Vite 워크플로우를 활성화합니다.
- **방법 2: `gh-pages` 브랜치 배포**
  - 빌드된 `dist` 폴더를 `gh-pages` 브랜치에 푸시하여 배포합니다. (`vite.config.ts`에 `base: './'` 설정이 적용되어 있어 하위 경로에서도 정적 에셋이 완벽하게 로드됩니다)

---

## 🚀 주요 기능 및 특징

### 1. 🖼️ Canvas 편집 & 실시간 프리뷰
- **EXIF & GPS 메타데이터 영구 제거:** 카메라 사진 업로드 시 오프스크린 캔버스 래스터화를 통해 위치정보, 카메라 시리얼 등 개인정보를 100% 자동 정제(`PURGED ✓`).
- **다양한 소셜 미디어 종횡비 지원:** 인스타그램 피드(1:1), 세로형 피드(4:5), 릴스/쇼츠/스토리(9:16), 유튜브 썸네일(16:9), 배너(2:1) 등 원클릭 전환.
- **배경 제어:** 이미지 업로드 및 실시간 필터(밝기, 대비, 채도, 블러, 흑백), 단색, 그라데이션 지원.

### 2. 🔠 정밀 텍스트 엔진 & 다국어 완벽 지원
- **한국어 & 다국어 개행 알고리즘:** 한글 음절, 영어 단어, 복합 이모지를 완벽하게 처리하여 부자연스러운 줄바꿈 방지.
- **고정 바운딩 박스 정렬:** 좌/중앙/우측 정렬 변경 시 텍스트 영역 상자는 화면에 고정되고 글자만 깔끔하게 정렬.
- **캔버스 오버플로우 방지 및 폰트 자동 축소:** 긴 장문 입력 시 캔버스 높이에 맞춰 폰트 크기를 자동으로 최적화(Auto-Downscaling).
- **상세 타이포그래피 설정:** 폰트 패밀리, 폰트 굵기(300 Light ~ 900 Black), 외곽선(Stroke), 그림자(Drop Shadow), 배경 박스(Background Pill) 지원.

### 3. 🎨 스티커 & 데코레이션
- 클릭 한 번으로 추가하는 직관적인 이모지 및 스티커 레이어.
- 스타일리시한 프레임 테두리(Border Frame) 및 워터마크(Watermark) 핸들 기능.
- 고대비 풀 캔버스 모눈 그리드 가이드(Grid Guide) 제공.

### 4. 💾 템플릿 관리 & JSON 스키마 검증
- **LocalStorage 영속성:** 작업 중인 캔버스 템플릿 생성, 인라인 이름 변경(Rename), 캔버스 동기화(Sync), 삭제 후 새로고침(F5) 시 완벽 보존.
- **안전한 JSON Import/Export:** Zod 스키마 기반 유효성 검증으로 비정상 파일 유입 시 기존 캔버스 보호.
- **원클릭 초기화:** 사이드바 하단 `Clear All Local Data & Reset` 버튼으로 브라우저 로컬 저장소 원클릭 초기화.

---

## 📁 디렉터리 구조
```
card_studio/
├── src/
│   ├── components/
│   │   ├── canvas/          # HTML5 Canvas 렌더러, 트랜스포머, 그리드 가이드
│   │   ├── layout/          # Navbar, Sidebar
│   │   ├── modals/          # ExportModal, JsonConfigModal, ExifInspectorModal
│   │   ├── sidebar/         # CanvasTab, TextLayersTab, OverlayDecorationsTab, TemplatesTab
│   │   └── common/          # ColorPicker, SliderControl
│   ├── context/             # StudioContext (상태 관리, 로컬 영속화, Undo/Redo)
│   ├── core/
│   │   └── canvas/          # textEngine (줄바꿈/폰트축소), exifCleaner, exportEngine
│   ├── presets/             # defaultTemplates, defaultStickers
│   ├── schema/              # Zod templateSchema
│   └── types/               # TypeScript 인터페이스
├── VALIDATION.md            # 검증 안내서 및 자체 점검표
└── README.md                # 프로젝트 안내서
```
