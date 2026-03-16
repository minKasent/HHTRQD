"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={1.5} />
          <div>
            <h2 className="text-lg font-semibold">Đã xảy ra lỗi</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vui lòng thử tải lại trang.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Tải lại trang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
