// src/components/menu/MenuNavIconsSkia.tsx
import React from 'react';
import {
  Group,
  Path,
  Skia,
  Circle,
  RoundedRect,
  BlurMask,
  Line,
} from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';

type Index = 0 | 1 | 2;

type Props = {
  layout: MenuLayout;
  activeIndex?: Index; // optionnel (pour plus tard)
};


const ringPath = (cx: number, cy: number, r: number) => {
  const p = Skia.Path.Make();
  p.addCircle(cx, cy, r);
  return p;
};

const glowStroke = (
  p: any,
  color: string,
  w: number,
  glowBlur: number,
  glowAlpha = 0.35
) => (
  <Group>
    <Path path={p} style="stroke" strokeWidth={w * 2.2} color={color.replace('1.0', `${glowAlpha}`)}>
      <BlurMask blur={glowBlur} style="solid" />
    </Path>
    <Path path={p} style="stroke" strokeWidth={w} color={color} />
  </Group>
);

const renderNeonRing = (cx: number, cy: number, r: number, rgbaMain: string) => {
  const p = ringPath(cx, cy, r);

  // “fond” interne très doux
  const innerFill = rgbaMain.replace('1.0', '0.10');
  const innerFill2 = rgbaMain.replace('1.0', '0.06');

  // strokes
  const outerStroke = rgbaMain.replace('1.0', '0.85');
  const innerStroke = rgbaMain.replace('1.0', '0.35');

  // highlight specular (arc partiel)
  const highlight = 'rgba(255,255,255,0.85)';

  return (
    <Group>
      {/* halo large */}
      <Circle cx={cx} cy={cy} r={r} color={rgbaMain.replace('1.0', '0.25')}>
        <BlurMask blur={18} style="solid" />
      </Circle>

      {/* double fond */}
      <Circle cx={cx} cy={cy} r={r} color={innerFill} />
      <Circle cx={cx} cy={cy} r={r * 0.88} color={innerFill2} />

      {/* double stroke */}
      <Path path={p} style="stroke" strokeWidth={3.5} color={outerStroke} />
      <Path path={ringPath(cx, cy, r * 0.86)} style="stroke" strokeWidth={2} color={innerStroke} />

      {/* highlight arc (donne un look “verre/metal”) */}
      <Path
        path={p}
        style="stroke"
        strokeWidth={2.2}
        color={highlight}
        start={0.08}
        end={0.26}
      >
        <BlurMask blur={2.5} style="solid" />
      </Path>

      {/* micro “spark” */}
      <Circle cx={cx + r * 0.45} cy={cy - r * 0.35} r={r * 0.06} color="rgba(255,255,255,0.75)">
        <BlurMask blur={3.5} style="solid" />
      </Circle>
    </Group>
  );
};

export const MenuNavIconsSkia: React.FC<Props> = ({ layout, activeIndex }) => {
  const navItemRect = (index: Index) => {
    const pad = layout.navRect.w * 0.08;
    const gap = layout.navRect.w * 0.06;
    const w = (layout.navRect.w - pad * 2 - gap * 2) / 3;
    const x = layout.navRect.x + pad + index * (w + gap);
    const y = layout.navRect.y + layout.navRect.h * 0.10;
    const h = layout.navRect.h * 0.80;
    return { x, y, w, h };
  };

  const renderShopIcon = (isActive: boolean) => {
    const rect = navItemRect(0);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const ringR = rect.h * 0.35;

    const alpha = isActive ? 1.0 : 0.75;
    const main = `rgba(168, 85, 247, ${alpha})`; // purple

    const s = ringR * 0.70;
    const w = s * 0.95;
    const h = s * 0.85;
    const x0 = cx - w / 2;
    const y0 = cy - h / 2 + s * 0.08;
    const r = Math.max(6, s * 0.14);

    // bag outline (rounded rect + top cut)
    const bag = Skia.Path.Make();
    bag.addRRect(Skia.RRectXY(Skia.XYWHRect(x0, y0, w, h), r, r));

    // cut top opening line
    const seamY = y0 + h * 0.28;

    // handle arc
    const handle = Skia.Path.Make();
    const hx0 = cx - w * 0.22;
    const hx1 = cx + w * 0.22;
    const hy = y0 + h * 0.08;
    handle.moveTo(hx0, seamY);
    handle.cubicTo(hx0, hy, hx1, hy, hx1, seamY);

    // tag (small rounded rect)
    const tagW = w * 0.22;
    const tagH = h * 0.22;
    const tagX = x0 + w * 0.64;
    const tagY = y0 + h * 0.36;
    const tagR = Math.max(4, tagW * 0.18);

    return (
      <Group>
        {renderNeonRing(cx, cy, ringR, main.replace(`${alpha})`, '1.0)'))}

        {/* bag glow */}
        {glowStroke(bag, main.replace(`${alpha})`, '1.0)'), 2.6, 10, isActive ? 0.42 : 0.30)}

        {/* inner seam / opening */}
        <Line
          p1={{ x: x0 + w * 0.14, y: seamY }}
          p2={{ x: x0 + w * 0.86, y: seamY }}
          strokeWidth={2}
          color={main.replace(`${alpha})`, '0.85)')}
        />

        {/* handle */}
        {glowStroke(handle, main.replace(`${alpha})`, '1.0)'), 2.6, 10, isActive ? 0.40 : 0.28)}

        {/* tag */}
        <RoundedRect
          x={tagX}
          y={tagY}
          width={tagW}
          height={tagH}
          r={tagR}
          color={main.replace(`${alpha})`, '0.18)')}
        />
        <RoundedRect
          x={tagX}
          y={tagY}
          width={tagW}
          height={tagH}
          r={tagR}
          style="stroke"
          strokeWidth={2}
          color={main.replace(`${alpha})`, '1.0)')}
        />
        <Circle
          cx={tagX + tagW * 0.25}
          cy={tagY + tagH * 0.32}
          r={tagW * 0.08}
          color="rgba(255,255,255,0.85)"
        />
      </Group>
    );
  };

  const renderLeaderboardIcon = (isActive: boolean) => {
    const rect = navItemRect(1);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const ringR = rect.h * 0.35;

    const alpha = isActive ? 1.0 : 0.75;
    const main = `rgba(251, 191, 36, ${alpha})`; // amber

    const s = ringR * 0.78;

    // trophy silhouette (more detailed + handles)
    const cup = Skia.Path.Make();
    const topY = cy - s * 0.35;
    const midY = cy - s * 0.02;
    const botY = cy + s * 0.18;

    cup.moveTo(cx - s * 0.34, topY);
    cup.cubicTo(cx - s * 0.30, midY, cx - s * 0.18, botY, cx, botY);
    cup.cubicTo(cx + s * 0.18, botY, cx + s * 0.30, midY, cx + s * 0.34, topY);
    cup.close();

    // handles
    const leftHandle = Skia.Path.Make();
    leftHandle.moveTo(cx - s * 0.34, topY + s * 0.10);
    leftHandle.cubicTo(
      cx - s * 0.55, topY + s * 0.12,
      cx - s * 0.55, midY + s * 0.06,
      cx - s * 0.34, midY + s * 0.02
    );

    const rightHandle = Skia.Path.Make();
    rightHandle.moveTo(cx + s * 0.34, topY + s * 0.10);
    rightHandle.cubicTo(
      cx + s * 0.55, topY + s * 0.12,
      cx + s * 0.55, midY + s * 0.06,
      cx + s * 0.34, midY + s * 0.02
    );

    // stem + base
    const stemH = s * 0.22;
    const baseW = s * 0.55;
    const baseY = cy + s * 0.34;

    // laurels (two arcs made of circles)
    const laurelR = s * 0.42;

    return (
      <Group>
        {renderNeonRing(cx, cy, ringR, main.replace(`${alpha})`, '1.0)'))}

        {/* laurels dots */}
        {Array.from({ length: 6 }).map((_, i) => {
          const t = (i / 5) * 0.55; // arc fraction
          const angL = Math.PI * (0.78 + t);
          const angR = Math.PI * (0.22 - t);
          const dotR = s * 0.04 * (1 - i * 0.06);

          return (
            <Group key={i}>
              <Circle
                cx={cx + Math.cos(angL) * laurelR}
                cy={cy + Math.sin(angL) * laurelR}
                r={dotR}
                color={main.replace(`${alpha})`, `${isActive ? 0.85 : 0.65})`)}
              />
              <Circle
                cx={cx + Math.cos(angR) * laurelR}
                cy={cy + Math.sin(angR) * laurelR}
                r={dotR}
                color={main.replace(`${alpha})`, `${isActive ? 0.85 : 0.65})`)}
              />
            </Group>
          );
        })}

        {/* trophy glow + stroke */}
        {glowStroke(cup, main.replace(`${alpha})`, '1.0)'), 2.8, 12, isActive ? 0.42 : 0.28)}
        {glowStroke(leftHandle, main.replace(`${alpha})`, '1.0)'), 2.6, 12, isActive ? 0.38 : 0.24)}
        {glowStroke(rightHandle, main.replace(`${alpha})`, '1.0)'), 2.6, 12, isActive ? 0.38 : 0.24)}

        {/* stem */}
        <Line
          p1={{ x: cx, y: botY }}
          p2={{ x: cx, y: botY + stemH }}
          strokeWidth={3.2}
          color={main.replace(`${alpha})`, '1.0)')}
        />
        <Line
          p1={{ x: cx, y: botY }}
          p2={{ x: cx, y: botY + stemH }}
          strokeWidth={7.5}
          color={main.replace(`${alpha})`, `${isActive ? 0.18 : 0.12})`)}
        >
          <BlurMask blur={8} style="solid" />
        </Line>

        {/* base */}
        <Line
          p1={{ x: cx - baseW / 2, y: baseY }}
          p2={{ x: cx + baseW / 2, y: baseY }}
          strokeWidth={4}
          color={main.replace(`${alpha})`, '1.0)')}
        />

        {/* star highlight */}
        <Circle cx={cx} cy={cy - s * 0.10} r={s * 0.07} color="rgba(255,255,255,0.9)">
          <BlurMask blur={2.5} style="solid" />
        </Circle>
      </Group>
    );
  };

  const renderCollectionsIcon = (isActive: boolean) => {
    const rect = navItemRect(2);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const ringR = rect.h * 0.35;

    const alpha = isActive ? 1.0 : 0.75;
    const main = `rgba(34, 197, 94, ${alpha})`; // green

    const s = ringR * 0.80;
    const cardW = s * 0.92;
    const cardH = s * 0.70;
    const rr = Math.max(8, s * 0.12);

    const backX = cx - cardW / 2 + s * 0.06;
    const backY = cy - cardH / 2 - s * 0.02;

    const frontX = cx - cardW / 2 - s * 0.05;
    const frontY = cy - cardH / 2 + s * 0.08;

    const gridCell = s * 0.12;
    const gridGap = s * 0.06;

    return (
      <Group>
        {renderNeonRing(cx, cy, ringR, main.replace(`${alpha})`, '1.0)'))}

        {/* back card */}
        <RoundedRect
          x={backX}
          y={backY}
          width={cardW}
          height={cardH}
          r={rr}
          color={main.replace(`${alpha})`, '0.10)')}
        />
        <RoundedRect
          x={backX}
          y={backY}
          width={cardW}
          height={cardH}
          r={rr}
          style="stroke"
          strokeWidth={2}
          color={main.replace(`${alpha})`, `${isActive ? 0.70 : 0.55})`)}
        />

        {/* front card (glow) */}
        <RoundedRect
          x={frontX}
          y={frontY}
          width={cardW}
          height={cardH}
          r={rr}
          color={main.replace(`${alpha})`, '0.14)')}
        />
        <RoundedRect
          x={frontX}
          y={frontY}
          width={cardW}
          height={cardH}
          r={rr}
          style="stroke"
          strokeWidth={2.4}
          color={main.replace(`${alpha})`, '1.0)')}
        >
          <BlurMask blur={1.8} style="solid" />
        </RoundedRect>

        {/* mini grid inside */}
        {Array.from({ length: 4 }).map((_, i) => {
          const gx = frontX + cardW * 0.18 + (i % 2) * (gridCell + gridGap);
          const gy = frontY + cardH * 0.28 + Math.floor(i / 2) * (gridCell + gridGap);
          return (
            <RoundedRect
              key={i}
              x={gx}
              y={gy}
              width={gridCell}
              height={gridCell}
              r={gridCell * 0.25}
              color={main.replace(`${alpha})`, `${isActive ? 0.30 : 0.22})`)}
            />
          );
        })}

        {/* badge highlight */}
        <Circle
          cx={frontX + cardW * 0.78}
          cy={frontY + cardH * 0.28}
          r={s * 0.06}
          color="rgba(255,255,255,0.85)"
        >
          <BlurMask blur={2.5} style="solid" />
        </Circle>
      </Group>
    );
  };

  const isActive = (i: Index) => (activeIndex === undefined ? true : activeIndex === i);

  return (
    <Group>
      {renderShopIcon(isActive(0))}
      {renderLeaderboardIcon(isActive(1))}
      {renderCollectionsIcon(isActive(2))}
    </Group>
  );
};
