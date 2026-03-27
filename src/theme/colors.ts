export const Colors = {
  navy: '#0C1B33',
  blue: '#1A5FB4',
  blueLight: '#2E74CC',
  accent: '#0EA5E9',
  gold: '#D4A843',
  white: '#FFFFFF',
  offWhite: '#F7F9FC',
  gray100: '#EEF2F7',
  gray300: '#C8D3E0',
  gray500: '#6B7A95',
  gray700: '#3A4558',
  green: '#16A34A',
  greenLight: '#DCFCE7',
  red: '#DC2626',
  redLight: '#FEF2F2',
  orange: '#F59E0B',
  orangeLight: '#FEF3C7',
} as const;

export type ColorKey = keyof typeof Colors;
