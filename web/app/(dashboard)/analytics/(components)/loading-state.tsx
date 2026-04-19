import { Spinner } from "@/components/ui/spinner";
import { LOADING_MESSAGE } from "../analytics.constants";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Spinner className="size-8" />
      <p className="text-sm">{LOADING_MESSAGE}</p>
    </div>
  );
}
