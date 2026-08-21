export interface StickerPreset {
  id: string;
  category: 'emojis' | 'badges' | 'reactions';
  content: string;
  label: string;
}

export const STICKER_PRESETS: StickerPreset[] = [
  { id: 'fire', category: 'emojis', content: '🔥', label: 'Fire' },
  { id: 'rocket', category: 'emojis', content: '🚀', label: 'Rocket' },
  { id: 'party', category: 'emojis', content: '🎉', label: 'Party' },
  { id: '100', category: 'emojis', content: '💯', label: 'Hundred' },
  { id: 'skull', category: 'emojis', content: '💀', label: 'Dead / Skull' },
  { id: 'crying-laugh', category: 'emojis', content: '😂', label: 'Crying Laugh' },
  { id: 'sparkles', category: 'emojis', content: '✨', label: 'Sparkles' },
  { id: 'heart', category: 'emojis', content: '❤️', label: 'Heart' },
  { id: 'warning', category: 'emojis', content: '⚠️', label: 'Warning' },
  { id: 'check', category: 'emojis', content: '✅', label: 'Checkmark' },
  { id: 'crown', category: 'emojis', content: '👑', label: 'Crown' },
  { id: 'sunglasses', category: 'emojis', content: '😎', label: 'Cool' },
  { id: 'thinking', category: 'emojis', content: '🤔', label: 'Thinking' },
  { id: 'money', category: 'emojis', content: '💰', label: 'Money' },
  { id: 'eyes', category: 'emojis', content: '👀', label: 'Eyes' },
  { id: 'scream', category: 'emojis', content: '😱', label: 'Shocked' },
  { id: 'clown', category: 'emojis', content: '🤡', label: 'Clown' },
  { id: 'clapping', category: 'emojis', content: '👏', label: 'Clap' },
];

export const AVAILABLE_FONTS = [
  { name: 'Inter', family: 'Inter', category: 'sans-serif', isKorean: false },
  { name: 'Pretendard', family: 'Pretendard', category: 'sans-serif', isKorean: true },
  { name: 'Noto Sans KR', family: '"Noto Sans KR"', category: 'sans-serif', isKorean: true },
  { name: 'Black Han Sans', family: '"Black Han Sans"', category: 'display', isKorean: true },
  { name: 'Do Hyeon', family: '"Do Hyeon"', category: 'display', isKorean: true },
  { name: 'Jua', family: 'Jua', category: 'handwriting', isKorean: true },
  { name: 'Impact', family: 'Impact', category: 'display', isKorean: false },
  { name: 'Anton', family: 'Anton', category: 'display', isKorean: false },
  { name: 'Bangers', family: 'Bangers', category: 'display', isKorean: false },
  { name: 'Montserrat', family: 'Montserrat', category: 'sans-serif', isKorean: false },
  { name: 'Orbitron', family: 'Orbitron', category: 'display', isKorean: false },
  { name: 'Permanent Marker', family: '"Permanent Marker"', category: 'handwriting', isKorean: false },
  { name: 'Caveat', family: 'Caveat', category: 'handwriting', isKorean: false },
  { name: 'Roboto', family: 'Roboto', category: 'sans-serif', isKorean: false },
];
