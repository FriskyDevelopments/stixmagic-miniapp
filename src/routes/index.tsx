import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { TelegramShell } from "@/components/shell";
import { CutView } from "@/components/views/cut";
import { ForgeView } from "@/components/views/forge";
import { LabView } from "@/components/views/lab";
import { PacksView } from "@/components/views/packs";
import { SettingsView } from "@/components/views/settings";
import { useLab } from "@/lib/stix/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { tab, setTab, setHydrated } = useLab();

  useEffect(() => {
    const result = useLab.persist.rehydrate();
    void Promise.resolve(result).finally(() => setHydrated());
  }, [setHydrated]);

  return (
    <TelegramShell tab={tab} onTab={setTab}>
      {tab === "lab" ? <LabView key="lab" /> : null}
      {tab === "cut" ? <CutView key="cut" /> : null}
      {tab === "forge" ? <ForgeView key="forge" /> : null}
      {tab === "packs" ? <PacksView key="packs" /> : null}
      {tab === "settings" ? <SettingsView key="settings" /> : null}
    </TelegramShell>
  );
}
