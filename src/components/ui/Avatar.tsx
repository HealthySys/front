import styles from "./Avatar.module.css";

interface AvatarProps {
  name?: string;
  size?: number;
  fontSize?: number;
}

function initial(name?: string) {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function Avatar({ name, size = 32, fontSize }: AvatarProps) {
  const computedFontSize = fontSize ?? Math.round(size * 0.42);
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: computedFontSize }}
    >
      {initial(name)}
    </span>
  );
}
