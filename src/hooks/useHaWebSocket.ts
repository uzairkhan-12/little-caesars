import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { waitForHaUpdate } from "@/lib/homeassistant.functions";

export function useHaWebSocket() {
  const queryClient = useQueryClient();
  const waitForUpdate = useServerFn(waitForHaUpdate);
  const versionRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function listen() {
      while (active) {
        try {
          const result = await waitForUpdate({ data: { since: versionRef.current } });
          if (!active) break;
          versionRef.current = result.version;
          queryClient.setQueryData(["ha", "dashboard"], result.dashboard);
        } catch (error) {
          if (!active) break;
          console.error("Home Assistant WebSocket stream error:", error);
          await new Promise((resolve) => setTimeout(resolve, 3_000));
        }
      }
    }

    void listen();
    return () => {
      active = false;
    };
  }, [queryClient, waitForUpdate]);
}
