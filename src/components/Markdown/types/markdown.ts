/* eslint-disable @typescript-eslint/no-explicit-any */
import { Components } from "react-markdown";
import React, { JSX } from "react";

// Interface cơ bản cho các component props
interface BaseComponentProps {
  node?: any;
  children: React.ReactNode;
}

// Interface cho các math components
interface MathComponentProps {
  value: string;
}

export interface CustomComponents extends Components {
  // Think và Search components
  think: (props: BaseComponentProps) => JSX.Element;
  "search-result": (props: BaseComponentProps) => JSX.Element;
  "search-link": (props: BaseComponentProps) => JSX.Element;
  "search-block": (props: BaseComponentProps) => JSX.Element;

  // Math components
  math: (props: MathComponentProps) => JSX.Element;
  inlineMath: (props: MathComponentProps) => JSX.Element;

  // Magic và Code Management
  "magic-mode": (props: BaseComponentProps) => JSX.Element | null;
  "code-manager": (props: BaseComponentProps) => JSX.Element | null;

  // File operations
  "create-file": (props: { children: React.ReactNode }) => JSX.Element;
  "create-folder": (props: { children: React.ReactNode }) => JSX.Element;
  "rename-file": (props: BaseComponentProps) => JSX.Element;
  "rename-folder": (props: BaseComponentProps) => JSX.Element;
  "delete-file": (props: BaseComponentProps) => JSX.Element;
  "delete-folder": (props: BaseComponentProps) => JSX.Element;

  // Project operations
  "create-project": (props: { children: React.ReactNode }) => JSX.Element;
  "update-project": (props: BaseComponentProps) => JSX.Element;
  "delete-project": (props: BaseComponentProps) => JSX.Element;

  // Media và Code
  "open-media": (props: BaseComponentProps) => JSX.Element;
  "media-view": (props: BaseComponentProps) => JSX.Element;
  "open-code": (props: BaseComponentProps) => JSX.Element;
  "code-editor": (props: BaseComponentProps) => JSX.Element;
  "file-path": (props: BaseComponentProps) => JSX.Element;

  // New component
  "email-block": (props: BaseComponentProps) => JSX.Element;

  // TVU Schedule block
  "tvu-schedule-block": (props: BaseComponentProps) => JSX.Element;
  "tvu-schedule-result": (props: BaseComponentProps) => JSX.Element;

  // TVU Score block
  "tvu-score-block": (props: BaseComponentProps) => JSX.Element;
  "tvu-score-result": (props: BaseComponentProps) => JSX.Element;

  // Anime Search components
  "anime-search-block": (props: BaseComponentProps) => JSX.Element;
  "anime-search-result": (props: BaseComponentProps) => JSX.Element;
}
