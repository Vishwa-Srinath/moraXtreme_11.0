import * as React from "react"
import { useMediaQuery } from "./use-media-query"

const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

export const DesktopView: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isMobile = useIsMobile()

  if (isMobile) return null

  return children
}

export const MobileView: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return children
}
