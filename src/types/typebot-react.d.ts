declare module '@typebot.io/react' {
  import type { CSSProperties, JSX } from 'react';

  export interface TypebotStandardProps {
    typebot: string;
    apiHost?: string;
    prefilledVariables?: Record<string, string>;
    style?: CSSProperties;
    className?: string;
    onNewInputBlock?: (value: unknown) => void | Promise<void>;
    onAnswer?: (value: unknown) => void | Promise<void>;
    onScriptExecutionSuccess?: (value: unknown) => void | Promise<void>;
  }

  export const Standard: (props: TypebotStandardProps) => JSX.Element;
}
