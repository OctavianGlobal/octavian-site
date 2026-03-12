interface OctavianWordmarkProps {
  size?: number;
  color?: string;
  letterSpacing?: string;
}

export default function OctavianWordmark({
  size = 28,
  color = "#D4AF37",
  letterSpacing = "0.28em",
}: OctavianWordmarkProps) {
  const large = Math.round(size * 1.27);
  return (
    <span style={{
      fontFamily: "Cinzel, Georgia, serif",
      fontSize: `${size}px`,
      letterSpacing,
      color,
    }}>
      <span style={{ fontSize: `${large}px` }}>O</span>CTAVIAN{" "}
      <span style={{ fontSize: `${large}px` }}>G</span>LOBAL
    </span>
  );
}