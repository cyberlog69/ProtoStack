export type OSILayer = 
  | 'Physical'
  | 'Data Link'
  | 'Network'
  | 'Transport'
  | 'Session'
  | 'Presentation'
  | 'Application';

export type ProtocolCategory =
  | 'network'
  | 'transport'
  | 'application'
  | 'iot'
  | 'security'
  | 'wireless'
  | 'cloud';

export interface ProtocolPacket {
  id: string;
  source: string;
  destination: string;
  type: string;
  summary: string;
  payload: Record<string, unknown>;
  timestamp?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface InteractiveStep {
  step: number;
  title: string;
  description: string;
  actorSource: string;
  actorTarget: string;
  packetInfo?: ProtocolPacket;
  explanation: string;
  codeSnippet?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Protocol {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  category: ProtocolCategory;
  osiLayer: OSILayer;
  port?: number | string;
  rfc?: string;
  yearIntroduced?: number;
  shortSummary: string;
  description: string;
  keyFeatures: string[];
  useCases: string[];
  pros: string[];
  cons: string[];
  actors: {
    id: string;
    label: string;
    icon: string;
    color: string;
  }[];
  interactiveSteps: InteractiveStep[];
  liveSandboxType: 'dns-resolver' | 'http-client' | 'mqtt-broker' | 'tcp-handshake' | 'websocket-chat' | 'generic-simulator';
  defaultSandboxConfig?: Record<string, unknown>;
  quiz: QuizQuestion[];
}

