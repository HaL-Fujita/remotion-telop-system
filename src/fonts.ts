import { staticFile } from 'remotion';

/**
 * 源柔ゴシックフォントの読み込み
 */
export const loadFonts = () => {
  const fontFamily = 'Gen Jyuu Gothic';

  // 既に読み込み済みか確認
  if (document.fonts.check(`12px "${fontFamily}"`)) {
    return;
  }

  const font = new FontFace(
    fontFamily,
    `url(${staticFile('fonts/GenJyuuGothic-Bold.ttf')})`,
    {
      weight: 'bold',
      style: 'normal',
    }
  );

  font.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
  });
};
