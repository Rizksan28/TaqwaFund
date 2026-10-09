import Image from "next/image";

export function BrandLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden ${className}`}>
      <Image
        src="/taqwafund-logo.png"
        alt="Logo TaqwaFund"
        width={668}
        height={416}
        priority
        className="h-full w-full object-cover"
      />
    </span>
  );
}
