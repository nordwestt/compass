export interface Tool {
    id: string;
    name: string;
    description: string;
    type: string;
    config: Record<string, any>;
    schema: Record<string, any>;
    enabled: boolean;
    isServerResource?: boolean;
  }
  
  export interface CreateToolDto {
    name: string;
    description: string;
    type: string;
    config: Record<string, any>;
    schema: Record<string, any>;
    enabled?: boolean;
  }
  
  export interface UpdateToolDto extends CreateToolDto {}