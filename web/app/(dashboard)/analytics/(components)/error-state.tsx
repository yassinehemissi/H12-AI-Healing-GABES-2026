import { Alert, AlertDescription, AlertTitle, AlertAction } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ERROR_TITLE } from "../analytics.constants";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{ERROR_TITLE}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button variant="destructive" size="sm" onClick={onRetry}>
            Réessayer
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
