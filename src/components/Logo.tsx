import SmartImage from "./SmartImage";

type LogoProps = {
  className?: string;
  imageClassName?: string;
};

export default function Logo({ className = "", imageClassName = "" }: LogoProps) {
  return (
    <span className={`wb-logo-glow inline-flex items-center ${className}`}>
      <SmartImage
        src="/images/logo/logo-transparent.webp"
        alt="Warrior Buds"
        width={200}
        height={200}
        preload
        className={`w-auto object-contain ${imageClassName}`}
        fallback={null}
      />
    </span>
  );
}
