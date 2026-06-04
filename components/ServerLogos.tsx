import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * SA:MP (San Andreas Multiplayer) logo
 */
export function SAMPLogo({ size = 20, className }: LogoProps) {
  return (
    <Image
      src="/samp-logo.png"
      alt="SA:MP"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}

/**
 * FiveM logo
 */
export function FiveMLogo({ size = 20, className }: LogoProps) {
  return (
    <Image
      src="/fivem-logo.png"
      alt="FiveM"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
