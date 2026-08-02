"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

type SmartImageProps = Omit<ImageProps, "onError"> & {
  fallback: ReactNode;
};

export default function SmartImage({ fallback, alt, ...props }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return <Image alt={alt} {...props} onError={() => setFailed(true)} />;
}
