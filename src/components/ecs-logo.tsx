type EcsLogoProps = {
  className?: string;
  alt?: string;
};

/** Shared institute mark cropped from the official certificate artwork. */
export function EcsLogo({ className = "", alt = "Elite Coding School" }: EcsLogoProps) {
  return <img className={`ecs-logo ${className}`.trim()} src="/brand/ecs-certificate-logo.png" alt={alt} />;
}
